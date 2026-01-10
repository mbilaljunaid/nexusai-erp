// Revenue Schedule schema for Accounts Receivable
import { pgTable, serial, integer, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { z } from "zod";

export const arRevenueSchedules = pgTable("ar_revenue_schedules", {
    id: serial("id").primaryKey(),
    invoiceId: integer("invoice_id").notNull(),
    scheduleDate: timestamp("schedule_date").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).default("Pending")
});

export const insertArRevenueScheduleSchema = z.object({
    invoiceId: z.coerce.number().int(),
    scheduleDate: z.coerce.date(),
    amount: z.coerce.string(),
    status: z.enum(["Pending", "Recognized"]).optional()
});

export type ArRevenueSchedule = typeof arRevenueSchedules.$inferSelect;
export type InsertArRevenueSchedule = typeof arRevenueSchedules.$inferInsert;
