import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const counters = pgTable("counters", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  prefix: text("prefix").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  isPaused: boolean("is_paused").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
