import { Request, Response } from "express";
import { db } from "../config/db";
import { tokens, counters } from "../db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export const generateToken = async (req: Request, res: Response): Promise<void> => {
  const { counterId } = req.body;
  const customerId = (req as any).user.id;

  try {
    // 1. Check if customer already has an active token (WAITING or SERVING) globally
    const existingActive = await db
      .select()
      .from(tokens)
      .where(and(eq(tokens.customerId, customerId), inArray(tokens.status, ["WAITING", "SERVING"])));
      
    if (existingActive.length > 0) {
      res.status(409).json({ success: false, message: "You already have an active token" });
      return;
    }

    // Use transaction for concurrency-safe generation
    const newToken = await db.transaction(async (tx) => {
      // 2. Lock the counter row to prevent race conditions on sequence generation
      const [counter] = await tx
        .select()
        .from(counters)
        .where(eq(counters.id, counterId))
        .for("update");

      if (!counter) throw new Error("Counter not found");
      if (!counter.isActive) throw new Error("Counter is inactive");
      if (counter.isPaused) throw new Error("Queue is currently paused");

      // 3. Get max sequence number for this counter
      const [latest] = await tx
        .select({ maxSeq: sql<number>`MAX(sequence_number)` })
        .from(tokens)
        .where(eq(tokens.counterId, counterId));

      const nextSeq = (latest?.maxSeq || 0) + 1;
      const formattedNum = `${counter.prefix}-${String(nextSeq).padStart(3, "0")}`;

      // 4. Create Token
      const [inserted] = await tx.insert(tokens).values({
        counterId,
        customerId,
        tokenNumber: formattedNum,
        sequenceNumber: nextSeq,
        status: "WAITING",
      }).returning();

      return inserted;
    });

    res.status(201).json({ success: true, data: newToken });
  } catch (error: any) {
    if (["Counter not found", "Counter is inactive", "Queue is currently paused"].includes(error.message)) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCurrentCustomerToken = async (req: Request, res: Response): Promise<void> => {
  const customerId = (req as any).user.id;
  try {
    const [active] = await db
      .select({
        token: tokens,
        counter: counters,
      })
      .from(tokens)
      .leftJoin(counters, eq(tokens.counterId, counters.id))
      .where(and(eq(tokens.customerId, customerId), inArray(tokens.status, ["WAITING", "SERVING"])))
      .orderBy(desc(tokens.createdAt))
      .limit(1);

    if (!active) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    // calculate people ahead
    let peopleAhead = 0;
    if (active.token.status === "WAITING") {
      const pRes = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(tokens)
        .where(and(
          eq(tokens.counterId, active.counter!.id),
          eq(tokens.status, "WAITING"),
          sql`${tokens.sequenceNumber} < ${active.token.sequenceNumber}`
        ));
      peopleAhead = pRes[0]?.count || 0;
    }

    res.status(200).json({
      success: true,
      data: {
        ...active.token,
        counter: active.counter,
        peopleAhead,
        estimatedWait: peopleAhead * 5 + " mins",
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCustomerHistory = async (req: Request, res: Response): Promise<void> => {
  const customerId = (req as any).user.id;
  try {
    const history = await db
      .select({
        token: tokens,
        counter: { name: counters.name },
      })
      .from(tokens)
      .leftJoin(counters, eq(tokens.counterId, counters.id))
      .where(eq(tokens.customerId, customerId))
      .orderBy(desc(tokens.createdAt))
      .limit(50);
      
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==========================================
// Admin Queue APIs
// ==========================================

export const getQueue = async (req: Request, res: Response): Promise<void> => {
  const counterId = req.params.id as string;
  try {
    const [serving] = await db.select().from(tokens)
      .where(and(eq(tokens.counterId, counterId), eq(tokens.status, "SERVING")))
      .limit(1);

    const waitingQueue = await db.select().from(tokens)
      .where(and(eq(tokens.counterId, counterId), eq(tokens.status, "WAITING")))
      .orderBy(tokens.sequenceNumber);

    res.status(200).json({
      success: true,
      data: {
        currentlyServing: serving || null,
        waitingQueue,
        waitingCount: waitingQueue.length,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const callNextToken = async (req: Request, res: Response): Promise<void> => {
  const counterId = req.params.id as string;
  try {
    const nextToken = await db.transaction(async (tx) => {
      // 1. Check if paused
      const [counter] = await tx.select().from(counters).where(eq(counters.id, counterId)).for("update");
      if (!counter || counter.isPaused) throw new Error("Queue is paused");

      // 2. Check currently serving
      const [serving] = await tx.select().from(tokens)
        .where(and(eq(tokens.counterId, counterId), eq(tokens.status, "SERVING")))
        .for("update");

      if (serving) throw new Error("Please complete the currently serving token first");

      // 3. Find next waiting, lock it skipping others
      // drizzle doesn't natively support SKIP LOCKED in all versions easily via standard builder,
      // but standard FOR UPDATE prevents concurrent next calls.
      const [next] = await tx.select().from(tokens)
        .where(and(eq(tokens.counterId, counterId), eq(tokens.status, "WAITING")))
        .orderBy(tokens.sequenceNumber)
        .limit(1)
        .for("update");

      if (!next) throw new Error("No waiting tokens available");

      // 4. Update
      const [updated] = await tx.update(tokens)
        .set({ status: "SERVING", calledAt: new Date() })
        .where(eq(tokens.id, next.id))
        .returning();

      return updated;
    });

    res.status(200).json({ success: true, data: nextToken });
  } catch (error: any) {
    if (["Queue is paused", "Please complete the currently serving token first", "No waiting tokens available"].includes(error.message)) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateTokenStatus = async (tokenId: string, status: "COMPLETED" | "SKIPPED" | "CANCELLED", res: Response) => {
  try {
    const [token] = await db.select().from(tokens).where(eq(tokens.id, tokenId as string));
    if (!token) {
      res.status(404).json({ success: false, message: "Token not found" });
      return;
    }

    // rules
    if (status === "CANCELLED" && !["WAITING", "SERVING"].includes(token.status)) {
      res.status(400).json({ success: false, message: "Cannot cancel a processed token" });
      return;
    }
    if ((status === "COMPLETED" || status === "SKIPPED") && token.status !== "SERVING") {
      res.status(400).json({ success: false, message: "Only serving tokens can be completed or skipped" });
      return;
    }

    const payload: any = { status };
    if (status === "COMPLETED") payload.completedAt = new Date();

    const [updated] = await db.update(tokens).set(payload).where(eq(tokens.id, tokenId as string)).returning();
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const completeToken = (req: Request, res: Response) => updateTokenStatus(req.params.id as string, "COMPLETED", res);
export const skipToken = (req: Request, res: Response) => updateTokenStatus(req.params.id as string, "SKIPPED", res);
export const cancelToken = (req: Request, res: Response) => updateTokenStatus(req.params.id as string, "CANCELLED", res);
