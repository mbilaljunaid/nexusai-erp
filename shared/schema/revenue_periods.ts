
import { pgTable, varchar, timestamp, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const revenuePeriods = pgTable("revenue_periods", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    periodName: varchar("period_name").notNull(), // e.g. "Jan-2026"
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    status: varchar("status").default("Open"), // Open, Closed, Permanently Closed

    closedAt: timestamp("closed_at"),
    closedBy: varchar("closed_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenuePeriodSchema = createInsertSchema(revenuePeriods);
