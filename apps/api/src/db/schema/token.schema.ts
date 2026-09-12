import { pgTable, integer, text, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { counters } from "./counter.schema";
import { users } from "./user.schema";

export const tokenStatusEnum = pgEnum("token_status", [
  "WAITING",
  "SERVING",
  "COMPLETED",
  "SKIPPED",
  "CANCELLED",
]);

export const tokens = pgTable("tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  counterId: uuid("counter_id").references(() => counters.id).notNull(),
  customerId: uuid("customer_id").references(() => users.id).notNull(),
  tokenNumber: text("token_number").notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  status: tokenStatusEnum("status").default("WAITING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  calledAt: timestamp("called_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
