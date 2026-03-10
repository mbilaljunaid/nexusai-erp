import { pgTable, varchar, timestamp, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrAssignments } from "./hr_worker";
import { hrmPayElements } from "./rewards_payroll";

export const hrmVoluntaryDeductions = pgTable("hrm_voluntary_deductions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    assignmentId: varchar("assignment_id").notNull().references(() => hrAssignments.id),
    elementId: varchar("element_id").notNull().references(() => hrmPayElements.id),

    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    frequency: varchar("frequency").default("RECURRING"), // RECURRING, ONE_TIME

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),

    status: varchar("status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertVoluntaryDeductionSchema = createInsertSchema(hrmVoluntaryDeductions);
export type VoluntaryDeduction = typeof hrmVoluntaryDeductions.$inferSelect;
export type NewVoluntaryDeduction = typeof hrmVoluntaryDeductions.$inferInsert;
