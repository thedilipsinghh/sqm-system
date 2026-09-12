import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { users, counters, roleEnum } from "../db";
import { env } from "../config/env";
import path from "path";

import { eq } from "drizzle-orm";

// Manually setup env since the seed runs directly from tsx
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const seed = async () => {
  console.log("🌱 Starting database seeding...");
  const sql = postgres(env.DATABASE_URL as string, { max: 1 });
  const db = drizzle(sql);

  try {
    // 1. Create Admin User
    const adminEmail = process.env.ADMIN_USER || "admin@example.com";
    const adminPass = process.env.ADMIN_PASS || "admin123";
    const passwordHash = await bcrypt.hash(adminPass, 10);

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail));

    if (existingAdmin.length === 0) {
      await db.insert(users).values({
        name: "System Administrator",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
      });
      console.log(`✅ Admin user seeded: ${adminEmail}`);
    } else {
      console.log(`⚠️ Admin user already exists: ${adminEmail}`);
    }

    // 2. Create Initial Counters
    const initialCounters = [
      { name: "General Consultation", prefix: "A", description: "Clinical interview triage and general practitioner evaluations." },
      { name: "Billing & Cashier", prefix: "B", description: "Invoicing, insurance co-pay clearing, and receipt ledgering." },
      { name: "Pharmacy Dispense", prefix: "P", description: "Outpatient Med Bay." },
    ];

    for (const c of initialCounters) {
      const existingCounter = await db
        .select()
        .from(counters)
        .where(eq(counters.prefix, c.prefix));

      if (existingCounter.length === 0) {
        await db.insert(counters).values({
          name: c.name,
          prefix: c.prefix,
          description: c.description,
          isActive: true,
          isPaused: false,
        });
        console.log(`✅ Counter seeded: ${c.name} (${c.prefix})`);
      } else {
        console.log(`⚠️ Counter already exists: ${c.name} (${c.prefix})`);
      }
    }

    console.log("🌱 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await sql.end();
  }
};

seed();
