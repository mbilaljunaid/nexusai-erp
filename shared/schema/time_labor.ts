
import { pgTable, varchar, timestamp, boolean, integer, numeric, date, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrPersons } from "./hr_worker";
import { hrOrganizations, hrLocations } from "./hr_structures";

// ========== WORKFORCE MANAGEMENT (TIME & LABOR) ==========

// 1. TIME ENTRY PERIODS
// Defines the windows for time entry (e.g., "Week 1 2026", "Week 2 2026")
export const hrmTimePeriods = pgTable("hrm_time_periods", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // "Jan 1 - Jan 7"
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),

    status: varchar("status").default("OPEN"), // OPEN, CLOSED, FROZEN

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. TIMESHEETS
// The header record for a worker's time in a specific period
export const hrmTimeSheets = pgTable("hrm_time_sheets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull().references(() => hrPersons.id),
    periodId: varchar("period_id").notNull().references(() => hrmTimePeriods.id),

    status: varchar("status").default("DRAFT"), // DRAFT, SUBMITTED, APPROVED, REJECTED

    totalHours: numeric("total_hours", { precision: 5, scale: 2 }).default("0.0"),
    totalOvertime: numeric("total_overtime", { precision: 5, scale: 2 }).default("0.0"),

    approverId: varchar("approver_id").references(() => hrPersons.id),
    approvedAt: timestamp("approved_at"),

    submissionDate: timestamp("submission_date"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. TIME ENTRIES
// Granular daily entries.
export const hrmTimeEntries = pgTable("hrm_time_entries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    timesheetId: varchar("timesheet_id").notNull().references(() => hrmTimeSheets.id),

    date: date("date").notNull(), // The day of work
    startTime: timestamp("start_time"), // ISO Timestamp or separate time cols. Timestamp easiest for calculations.
    endTime: timestamp("end_time"),

    durationMinutes: integer("duration_minutes").notNull(), // Stored for ease of agg

    timeType: varchar("time_type").default("REGULAR"), // REGULAR, OVERTIME, SICK, VACATION

    projectId: varchar("project_id"), // Optional integration with Projects
    taskId: varchar("task_id"),

    notes: text("notes"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 4. SHIFTS (Definitions)
export const hrmShifts = pgTable("hrm_shifts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    code: varchar("code").notNull(), // D1, N1
    name: varchar("name").notNull(), // "Day Shift 9-5"

    startTime: varchar("start_time").notNull(), // "09:00"
    endTime: varchar("end_time").notNull(), // "17:00"

    color: varchar("color").default("#3b82f6"), // Visual representation

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 5. SHIFT ASSIGNMENTS (Schedule)
export const hrmShiftAssignments = pgTable("hrm_shift_assignments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull().references(() => hrPersons.id),
    shiftId: varchar("shift_id").notNull().references(() => hrmShifts.id),

    date: date("date").notNull(),

    isPublished: boolean("is_published").default(false),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// SCHEMAS
export const insertWfmTimePeriodSchema = createInsertSchema(hrmTimePeriods);
export const insertWfmTimeSheetSchema = createInsertSchema(hrmTimeSheets);
export const insertWfmTimeEntrySchema = createInsertSchema(hrmTimeEntries);
export const insertWfmShiftSchema = createInsertSchema(hrmShifts);
export const insertWfmShiftAssignmentSchema = createInsertSchema(hrmShiftAssignments);

export type WfmTimePeriod = typeof hrmTimePeriods.$inferSelect;
export type WfmTimeSheet = typeof hrmTimeSheets.$inferSelect;
export type WfmTimeEntry = typeof hrmTimeEntries.$inferSelect;
export type WfmShift = typeof hrmShifts.$inferSelect;
export type WfmShiftAssignment = typeof hrmShiftAssignments.$inferSelect;

// 6. PAYROLL INTEGRATION BATCHES
export const hrmPayrollBatches = pgTable("hrm_payroll_batches", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    periodId: varchar("period_id").notNull().references(() => hrmTimePeriods.id),

    runDate: timestamp("run_date").default(sql`now()`),
    runBy: varchar("run_by"), // User ID

    totalRecords: integer("total_records").default(0),
    status: varchar("status").default("COMPLETED"),

    payload: jsonb("payload"), // Store the JSON sent to Payroll for audit

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWfmPayrollBatchSchema = createInsertSchema(hrmPayrollBatches);
export type WfmPayrollBatch = typeof hrmPayrollBatches.$inferSelect;

// 7. LABOR POLICIES & VIOLATIONS
export const hrmLaborPolicies = pgTable("hrm_labor_policies", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // e.g. "Standard Policy"
    otMultiplier: varchar("ot_multiplier").default("1.5"), // e.g 1.5x
    gracePeriodMinutes: integer("grace_period_minutes").default(15), // 15 mins late allowed

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const hrmTimeViolations = pgTable("hrm_time_violations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    entryId: varchar("entry_id").references(() => hrmTimeEntries.id),

    type: varchar("type").notNull(), // LATE_IN, EARLY_OUT
    severity: varchar("severity").default("Medium"),
    message: varchar("message"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export type WfmLaborPolicy = typeof hrmLaborPolicies.$inferSelect;
export type WfmTimeViolation = typeof hrmTimeViolations.$inferSelect;

// 8. LEAVE BALANCES (Accruals)
export const hrmLeaveBalances = pgTable("hrm_leave_balances", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull().references(() => hrPersons.id),
    leaveType: varchar("leave_type").notNull(), // VACATION, SICK

    balanceHours: numeric("balance_hours", { precision: 6, scale: 2 }).default("0.0"), // Allow negatives? Usually no, but system might allow overdraft.

    lastAccrualDate: date("last_accrual_date"),

    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 9. ACCRUAL POLICIES (Rules)
export const hrmAccrualPolicies = pgTable("hrm_accrual_policies", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // e.g. "Standard Vacation Policy"
    leaveType: varchar("leave_type").notNull(), // VACATION, SICK

    accrualRate: numeric("accrual_rate", { precision: 6, scale: 2 }).notNull(), // e.g. 10.00 hours
    frequency: varchar("frequency").default("MONTHLY"),

    vestingMonths: integer("vesting_months").default(0), // e.g. 3 months before accrual starts
    maxCap: numeric("max_cap", { precision: 6, scale: 2 }), // e.g. 120.00 hours max

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 10. PUBLIC HOLIDAYS (Localization)
export const hrmPublicHolidays = pgTable("hrm_public_holidays", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    date: date("date").notNull(),
    name: varchar("name").notNull(), // e.g. "New Year's Day"
    countryCode: varchar("country_code").notNull().default("US"), // ISO code: US, UK, AE

    isMandatory: boolean("is_mandatory").default(true), // Is it a mandatory day off?

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 11. REGIONAL POLICIES (Localization)
export const hrmRegionalPolicies = pgTable("hrm_regional_policies", {
    countryCode: varchar("country_code").primaryKey(), // Using Country Code as PK for V1 simplification
    tenantId: varchar("tenant_id").notNull(),

    standardWeeklyHours: numeric("standard_weekly_hours", { precision: 4, scale: 2 }).notNull().default("40.00"),
    standardDailyHours: numeric("standard_daily_hours", { precision: 4, scale: 2 }).default("8.00"),
    overtimeMultiplier: numeric("overtime_multiplier", { precision: 3, scale: 2 }).default("1.50"), // 1.5x

    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 12. PAYROLL ENGINE (Phase 38)
export const hrmSalaries = pgTable("hrm_salaries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    personId: varchar("person_id").notNull(), // Link to hrPersons (loose ref for now or strict)

    amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0.00"), // e.g. 20.00 or 5000.00
    frequency: varchar("frequency").default("HOURLY"), // HOURLY, MONTHLY, ANNUALLY
    currency: varchar("currency").default("USD"),

    effectiveDate: date("effective_date").default(sql`CURRENT_DATE`),
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const hrmPayslips = pgTable("hrm_payslips", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    batchId: varchar("batch_id").references(() => hrmPayrollBatches.id), // Link to Run
    personId: varchar("person_id").notNull(),

    periodStartDate: date("period_start_date").notNull(),
    periodEndDate: date("period_end_date").notNull(),

    grossPay: numeric("gross_pay", { precision: 10, scale: 2 }).default("0.00"),
    netPay: numeric("net_pay", { precision: 10, scale: 2 }).default("0.00"),
    totalDeductions: numeric("total_deductions", { precision: 10, scale: 2 }).default("0.00"),

    status: varchar("status").default("DRAFT"), // DRAFT, ISSUED, PAID

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const hrmPayslipEntries = pgTable("hrm_payslip_entries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    payslipId: varchar("payslip_id").notNull().references(() => hrmPayslips.id),

    type: varchar("type").notNull(), // EARNING, DEDUCTION, TAX
    subType: varchar("sub_type"), // REGULAR, OVERTIME, FEDERAL_TAX, 401K
    description: varchar("description"), // e.g. "Regular Hours (40h @ $20)"

    amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
    rate: numeric("rate", { precision: 10, scale: 2 }), // Helper for display
    units: numeric("units", { precision: 10, scale: 2 }), // Helper for display (Hours)

    createdAt: timestamp("created_at").default(sql`now()`),
});
