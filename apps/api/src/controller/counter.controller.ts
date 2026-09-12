import { Request, Response } from "express";
import { db } from "../config/db";
import { counters, tokens } from "../db";
import { eq, count, and } from "drizzle-orm";
import postgres from "postgres";

export const getCounters = async (req: Request, res: Response): Promise<void> => {
  try {
    const allCounters = await db.select().from(counters).orderBy(counters.name);

    // Calculate dynamic stats for each counter
    const results = [];
    for (const c of allCounters) {
      // get waiting count
      const waitingResult = await db
        .select({ count: count() })
        .from(tokens)
        .where(and(eq(tokens.counterId, c.id), eq(tokens.status, "WAITING")));

      // get currently serving
      const [serving] = await db
        .select()
        .from(tokens)
        .where(and(eq(tokens.counterId, c.id), eq(tokens.status, "SERVING")))
        .limit(1);

      // get next to call
      const [next] = await db
        .select()
        .from(tokens)
        .where(and(eq(tokens.counterId, c.id), eq(tokens.status, "WAITING")))
        .orderBy(tokens.sequenceNumber)
        .limit(1);

      results.push({
        ...c,
        waitingCount: waitingResult[0]?.count || 0,
        currentToken: serving?.tokenNumber || "—",
        currentTokenId: serving?.id || null,
        nextToCall: next?.tokenNumber || "—",
        estimatedWait: c.isActive && !c.isPaused ? `${(waitingResult[0]?.count || 0) * 5} mins` : "Closed",
      });
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createCounter = async (req: Request, res: Response): Promise<void> => {
  try {
    const [newCounter] = await db.insert(counters).values(req.body).returning();
    res.status(201).json({ success: true, data: newCounter });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(409).json({ success: false, message: "Counter prefix already exists" });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateCounter = async (req: Request, res: Response): Promise<void> => {
  try {
    const [updated] = await db
      .update(counters)
      .set(req.body)
      .where(eq(counters.id, req.params.id as string))
      .returning();
    if (!updated) {
      res.status(404).json({ success: false, message: "Counter not found" });
      return;
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteCounter = async (req: Request, res: Response): Promise<void> => {
  try {
    const [deleted] = await db
      .delete(counters)
      .where(eq(counters.id, req.params.id as string))
      .returning();
    if (!deleted) {
      res.status(404).json({ success: false, message: "Counter not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Counter deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Cannot delete counter with associated tokens" });
  }
};

// State toggles
const toggleState = async (id: string, field: "isActive" | "isPaused", value: boolean, res: Response) => {
  try {
    const [updated] = await db
      .update(counters)
      .set({ [field]: value })
      .where(eq(counters.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ success: false, message: "Counter not found" });
      return;
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const activateCounter = (req: Request, res: Response) => toggleState(req.params.id as string, "isActive", true, res);
export const deactivateCounter = (req: Request, res: Response) => toggleState(req.params.id as string, "isActive", false, res);
export const pauseCounter = (req: Request, res: Response) => toggleState(req.params.id as string, "isPaused", true, res);
export const resumeCounter = (req: Request, res: Response) => toggleState(req.params.id as string, "isPaused", false, res);
