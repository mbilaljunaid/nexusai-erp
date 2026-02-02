import { pgTable, varchar, timestamp, boolean, integer, numeric, date, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrAssignments } from "./hr_worker";

// ========== WORKFORCE REWARDS: PAYROLL ==========

// 1. PAYROLL DEFINITIONS (Pay Groups)
// e.g. "US Monthly", "UK Weekly"
export const hrmPayGroups = pgTable("hrm_pay_groups", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(),
    frequency: varchar("frequency").notNull(), // MONTHLY, WEEKLY, BIWEEKLY

    legislativeDataGroupId: varchar("legislative_data_group_id"), // For Multi-Country

    status: varchar("status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. PAY ELEMENTS
// The building blocks: Basis Salary, Overtime, Housing Allowance, Tax Deduction
export const hrmPayElements = pgTable("hrm_pay_elements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // e.g. "Overtime 1.5x"
    classification: varchar("classification").notNull(), // EARNINGS, DEDUCTION, INFORMATION, TAX

    inputType: varchar("input_type").default("CALCULATED"), // CALCULATED, FLAT_AMOUNT, RATE_HOURS

    recurring: boolean("recurring").default(true),

    taxable: boolean("taxable").default(true),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3. PAYROLL RUNS (The Header)
// A specific execution cycle. e.g. "Jan 2026 Monthly Run"
export const hrmPayrollRuns = pgTable("hrm_payroll_runs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    payGroupId: varchar("pay_group_id").notNull().references(() => hrmPayGroups.id),

    periodName: varchar("period_name").notNull(), // "2026-01"
    periodStartDate: date("period_start_date").notNull(),
    periodEndDate: date("period_end_date").notNull(),
    paymentDate: date("payment_date").notNull(),

    status: varchar("status").default("OPEN"), // OPEN, CALCULATING, COMPLETED, PAID, ROLLED_BACK

    totalGross: numeric("total_gross"),
    totalNet: numeric("total_net"),

    runDate: timestamp("run_date").default(sql`now()`),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 4. RUN RESULTS (The Lines)
// The actual calculated line items for a worker in a run.
export const hrmPayrollRunResults = pgTable("hrm_payroll_run_results", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    payrollRunId: varchar("payroll_run_id").notNull().references(() => hrmPayrollRuns.id),
    assignmentId: varchar("assignment_id").notNull().references(() => hrAssignments.id),

    elementId: varchar("element_id").notNull().references(() => hrmPayElements.id),
    elementName: varchar("element_name"), // Snapshotted for audit

    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(), // Can be negative for deductions

    ytdAmount: numeric("ytd_amount", { precision: 15, scale: 2 }), // Year-to-Date

    createdAt: timestamp("created_at").default(sql`now()`),
});

// SCHEMAS
export const insertPayGroupSchema = createInsertSchema(hrmPayGroups);
export const insertPayElementSchema = createInsertSchema(hrmPayElements);
export const insertPayrollRunSchema = createInsertSchema(hrmPayrollRuns);
export const insertRunResultSchema = createInsertSchema(hrmPayrollRunResults);

export type PayGroup = typeof hrmPayGroups.$inferSelect;
export type PayElement = typeof hrmPayElements.$inferSelect;
export type PayrollRun = typeof hrmPayrollRuns.$inferSelect;
export type RunResult = typeof hrmPayrollRunResults.$inferSelect;
