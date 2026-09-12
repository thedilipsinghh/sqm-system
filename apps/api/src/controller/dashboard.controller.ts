import { Request, Response } from "express";
import { db } from "../config/db";
import { counters, tokens } from "../db";
import { eq, sql, inArray, count } from "drizzle-orm";
import postgres from "postgres";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const tcRes = await db.select({ totalCounters: count() }).from(counters);
    const acRes = await db.select({ activeCounters: count() }).from(counters).where(eq(counters.isActive, true));

    // today's tokens
    const ttRes = await db.select({ tokensToday: count() }).from(tokens)
      .where(sql`DATE(created_at) = CURRENT_DATE`);

    const wRes = await db.select({ waiting: count() }).from(tokens).where(eq(tokens.status, "WAITING"));
    const sRes = await db.select({ serving: count() }).from(tokens).where(eq(tokens.status, "SERVING"));
    const cRes = await db.select({ completed: count() }).from(tokens).where(eq(tokens.status, "COMPLETED"));
    const skRes = await db.select({ skipped: count() }).from(tokens).where(eq(tokens.status, "SKIPPED"));

    res.status(200).json({
      success: true,
      data: {
        totalCounters: tcRes[0]?.totalCounters || 0,
        activeCounters: acRes[0]?.activeCounters || 0,
        tokensToday: ttRes[0]?.tokensToday || 0,
        waiting: wRes[0]?.waiting || 0,
        serving: sRes[0]?.serving || 0,
        completed: cRes[0]?.completed || 0,
        skipped: skRes[0]?.skipped || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
