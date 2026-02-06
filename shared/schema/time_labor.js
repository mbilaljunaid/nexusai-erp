"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hrmPayslipEntries = exports.hrmPayslips = exports.hrmSalaries = exports.hrmRegionalPolicies = exports.hrmPublicHolidays = exports.hrmAccrualPolicies = exports.hrmLeaveBalances = exports.hrmTimeViolations = exports.hrmLaborPolicies = exports.insertWfmPayrollBatchSchema = exports.hrmPayrollBatches = exports.insertWfmShiftAssignmentSchema = exports.insertWfmShiftSchema = exports.insertWfmTimeEntrySchema = exports.insertWfmTimeSheetSchema = exports.insertWfmTimePeriodSchema = exports.hrmShiftAssignments = exports.hrmShifts = exports.hrmTimeEntries = exports.hrmTimeSheets = exports.hrmTimePeriods = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_worker_1 = require("./hr_worker");
// ========== WORKFORCE MANAGEMENT (TIME & LABOR) ==========
// 1. TIME ENTRY PERIODS
// Defines the windows for time entry (e.g., "Week 1 2026", "Week 2 2026")
exports.hrmTimePeriods = (0, pg_core_1.pgTable)("hrm_time_periods", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // "Jan 1 - Jan 7"
    startDate: (0, pg_core_1.date)("start_date").notNull(),
    endDate: (0, pg_core_1.date)("end_date").notNull(),
    status: (0, pg_core_1.varchar)("status").default("OPEN"), // OPEN, CLOSED, FROZEN
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. TIMESHEETS
// The header record for a worker's time in a specific period
exports.hrmTimeSheets = (0, pg_core_1.pgTable)("hrm_time_sheets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id),
    periodId: (0, pg_core_1.varchar)("period_id").notNull().references(() => exports.hrmTimePeriods.id),
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, SUBMITTED, APPROVED, REJECTED
    totalHours: (0, pg_core_1.numeric)("total_hours", { precision: 5, scale: 2 }).default("0.0"),
    totalOvertime: (0, pg_core_1.numeric)("total_overtime", { precision: 5, scale: 2 }).default("0.0"),
    approverId: (0, pg_core_1.varchar)("approver_id").references(() => hr_worker_1.hrPersons.id),
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    submissionDate: (0, pg_core_1.timestamp)("submission_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. TIME ENTRIES
// Granular daily entries.
exports.hrmTimeEntries = (0, pg_core_1.pgTable)("hrm_time_entries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    timesheetId: (0, pg_core_1.varchar)("timesheet_id").notNull().references(() => exports.hrmTimeSheets.id),
    date: (0, pg_core_1.date)("date").notNull(), // The day of work
    startTime: (0, pg_core_1.timestamp)("start_time"), // ISO Timestamp or separate time cols. Timestamp easiest for calculations.
    endTime: (0, pg_core_1.timestamp)("end_time"),
    durationMinutes: (0, pg_core_1.integer)("duration_minutes").notNull(), // Stored for ease of agg
    timeType: (0, pg_core_1.varchar)("time_type").default("REGULAR"), // REGULAR, OVERTIME, SICK, VACATION
    projectId: (0, pg_core_1.varchar)("project_id"), // Optional integration with Projects
    taskId: (0, pg_core_1.varchar)("task_id"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. SHIFTS (Definitions)
exports.hrmShifts = (0, pg_core_1.pgTable)("hrm_shifts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    code: (0, pg_core_1.varchar)("code").notNull(), // D1, N1
    name: (0, pg_core_1.varchar)("name").notNull(), // "Day Shift 9-5"
    startTime: (0, pg_core_1.varchar)("start_time").notNull(), // "09:00"
    endTime: (0, pg_core_1.varchar)("end_time").notNull(), // "17:00"
    color: (0, pg_core_1.varchar)("color").default("#3b82f6"), // Visual representation
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 5. SHIFT ASSIGNMENTS (Schedule)
exports.hrmShiftAssignments = (0, pg_core_1.pgTable)("hrm_shift_assignments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id),
    shiftId: (0, pg_core_1.varchar)("shift_id").notNull().references(() => exports.hrmShifts.id),
    date: (0, pg_core_1.date)("date").notNull(),
    isPublished: (0, pg_core_1.boolean)("is_published").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertWfmTimePeriodSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmTimePeriods);
exports.insertWfmTimeSheetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmTimeSheets);
exports.insertWfmTimeEntrySchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmTimeEntries);
exports.insertWfmShiftSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmShifts);
exports.insertWfmShiftAssignmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmShiftAssignments);
// 6. PAYROLL INTEGRATION BATCHES
exports.hrmPayrollBatches = (0, pg_core_1.pgTable)("hrm_payroll_batches", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    periodId: (0, pg_core_1.varchar)("period_id").notNull().references(() => exports.hrmTimePeriods.id),
    runDate: (0, pg_core_1.timestamp)("run_date").default((0, drizzle_orm_1.sql) `now()`),
    runBy: (0, pg_core_1.varchar)("run_by"), // User ID
    totalRecords: (0, pg_core_1.integer)("total_records").default(0),
    status: (0, pg_core_1.varchar)("status").default("COMPLETED"),
    payload: (0, pg_core_1.jsonb)("payload"), // Store the JSON sent to Payroll for audit
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertWfmPayrollBatchSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPayrollBatches);
// 7. LABOR POLICIES & VIOLATIONS
exports.hrmLaborPolicies = (0, pg_core_1.pgTable)("hrm_labor_policies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g. "Standard Policy"
    otMultiplier: (0, pg_core_1.varchar)("ot_multiplier").default("1.5"), // e.g 1.5x
    gracePeriodMinutes: (0, pg_core_1.integer)("grace_period_minutes").default(15), // 15 mins late allowed
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrmTimeViolations = (0, pg_core_1.pgTable)("hrm_time_violations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    entryId: (0, pg_core_1.varchar)("entry_id").references(() => exports.hrmTimeEntries.id),
    type: (0, pg_core_1.varchar)("type").notNull(), // LATE_IN, EARLY_OUT
    severity: (0, pg_core_1.varchar)("severity").default("Medium"),
    message: (0, pg_core_1.varchar)("message"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 8. LEAVE BALANCES (Accruals)
exports.hrmLeaveBalances = (0, pg_core_1.pgTable)("hrm_leave_balances", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id),
    leaveType: (0, pg_core_1.varchar)("leave_type").notNull(), // VACATION, SICK
    balanceHours: (0, pg_core_1.numeric)("balance_hours", { precision: 6, scale: 2 }).default("0.0"), // Allow negatives? Usually no, but system might allow overdraft.
    lastAccrualDate: (0, pg_core_1.date)("last_accrual_date"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 9. ACCRUAL POLICIES (Rules)
exports.hrmAccrualPolicies = (0, pg_core_1.pgTable)("hrm_accrual_policies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g. "Standard Vacation Policy"
    leaveType: (0, pg_core_1.varchar)("leave_type").notNull(), // VACATION, SICK
    accrualRate: (0, pg_core_1.numeric)("accrual_rate", { precision: 6, scale: 2 }).notNull(), // e.g. 10.00 hours
    frequency: (0, pg_core_1.varchar)("frequency").default("MONTHLY"),
    vestingMonths: (0, pg_core_1.integer)("vesting_months").default(0), // e.g. 3 months before accrual starts
    maxCap: (0, pg_core_1.numeric)("max_cap", { precision: 6, scale: 2 }), // e.g. 120.00 hours max
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 10. PUBLIC HOLIDAYS (Localization)
exports.hrmPublicHolidays = (0, pg_core_1.pgTable)("hrm_public_holidays", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    date: (0, pg_core_1.date)("date").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g. "New Year's Day"
    countryCode: (0, pg_core_1.varchar)("country_code").notNull().default("US"), // ISO code: US, UK, AE
    isMandatory: (0, pg_core_1.boolean)("is_mandatory").default(true), // Is it a mandatory day off?
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 11. REGIONAL POLICIES (Localization)
exports.hrmRegionalPolicies = (0, pg_core_1.pgTable)("hrm_regional_policies", {
    countryCode: (0, pg_core_1.varchar)("country_code").primaryKey(), // Using Country Code as PK for V1 simplification
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    standardWeeklyHours: (0, pg_core_1.numeric)("standard_weekly_hours", { precision: 4, scale: 2 }).notNull().default("40.00"),
    standardDailyHours: (0, pg_core_1.numeric)("standard_daily_hours", { precision: 4, scale: 2 }).default("8.00"),
    overtimeMultiplier: (0, pg_core_1.numeric)("overtime_multiplier", { precision: 3, scale: 2 }).default("1.50"), // 1.5x
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 12. PAYROLL ENGINE (Phase 38)
exports.hrmSalaries = (0, pg_core_1.pgTable)("hrm_salaries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull(), // Link to hrPersons (loose ref for now or strict)
    amount: (0, pg_core_1.numeric)("amount", { precision: 10, scale: 2 }).notNull().default("0.00"), // e.g. 20.00 or 5000.00
    frequency: (0, pg_core_1.varchar)("frequency").default("HOURLY"), // HOURLY, MONTHLY, ANNUALLY
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    effectiveDate: (0, pg_core_1.date)("effective_date").default((0, drizzle_orm_1.sql) `CURRENT_DATE`),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrmPayslips = (0, pg_core_1.pgTable)("hrm_payslips", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    batchId: (0, pg_core_1.varchar)("batch_id").references(() => exports.hrmPayrollBatches.id), // Link to Run
    personId: (0, pg_core_1.varchar)("person_id").notNull(),
    periodStartDate: (0, pg_core_1.date)("period_start_date").notNull(),
    periodEndDate: (0, pg_core_1.date)("period_end_date").notNull(),
    grossPay: (0, pg_core_1.numeric)("gross_pay", { precision: 10, scale: 2 }).default("0.00"),
    netPay: (0, pg_core_1.numeric)("net_pay", { precision: 10, scale: 2 }).default("0.00"),
    totalDeductions: (0, pg_core_1.numeric)("total_deductions", { precision: 10, scale: 2 }).default("0.00"),
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, ISSUED, PAID
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrmPayslipEntries = (0, pg_core_1.pgTable)("hrm_payslip_entries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    payslipId: (0, pg_core_1.varchar)("payslip_id").notNull().references(() => exports.hrmPayslips.id),
    type: (0, pg_core_1.varchar)("type").notNull(), // EARNING, DEDUCTION, TAX
    subType: (0, pg_core_1.varchar)("sub_type"), // REGULAR, OVERTIME, FEDERAL_TAX, 401K
    description: (0, pg_core_1.varchar)("description"), // e.g. "Regular Hours (40h @ $20)"
    amount: (0, pg_core_1.numeric)("amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
    rate: (0, pg_core_1.numeric)("rate", { precision: 10, scale: 2 }), // Helper for display
    units: (0, pg_core_1.numeric)("units", { precision: 10, scale: 2 }), // Helper for display (Hours)
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
//# sourceMappingURL=time_labor.js.map