"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertRunResultSchema = exports.insertPayrollRunSchema = exports.insertPayElementSchema = exports.insertPayGroupSchema = exports.hrmPayrollRunResults = exports.hrmPayrollRuns = exports.hrmPayElements = exports.hrmPayGroups = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_worker_1 = require("./hr_worker");
// ========== WORKFORCE REWARDS: PAYROLL ==========
// 1. PAYROLL DEFINITIONS (Pay Groups)
// e.g. "US Monthly", "UK Weekly"
exports.hrmPayGroups = (0, pg_core_1.pgTable)("hrm_pay_groups", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    frequency: (0, pg_core_1.varchar)("frequency").notNull(), // MONTHLY, WEEKLY, BIWEEKLY
    legislativeDataGroupId: (0, pg_core_1.varchar)("legislative_data_group_id"), // For Multi-Country
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. PAY ELEMENTS
// The building blocks: Basis Salary, Overtime, Housing Allowance, Tax Deduction
exports.hrmPayElements = (0, pg_core_1.pgTable)("hrm_pay_elements", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g. "Overtime 1.5x"
    classification: (0, pg_core_1.varchar)("classification").notNull(), // EARNINGS, DEDUCTION, INFORMATION, TAX
    inputType: (0, pg_core_1.varchar)("input_type").default("CALCULATED"), // CALCULATED, FLAT_AMOUNT, RATE_HOURS
    recurring: (0, pg_core_1.boolean)("recurring").default(true),
    taxable: (0, pg_core_1.boolean)("taxable").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. PAYROLL RUNS (The Header)
// A specific execution cycle. e.g. "Jan 2026 Monthly Run"
exports.hrmPayrollRuns = (0, pg_core_1.pgTable)("hrm_payroll_runs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    payGroupId: (0, pg_core_1.varchar)("pay_group_id").notNull().references(() => exports.hrmPayGroups.id),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(), // "2026-01"
    periodStartDate: (0, pg_core_1.date)("period_start_date").notNull(),
    periodEndDate: (0, pg_core_1.date)("period_end_date").notNull(),
    paymentDate: (0, pg_core_1.date)("payment_date").notNull(),
    status: (0, pg_core_1.varchar)("status").default("OPEN"), // OPEN, CALCULATING, COMPLETED, PAID, ROLLED_BACK
    totalGross: (0, pg_core_1.numeric)("total_gross"),
    totalNet: (0, pg_core_1.numeric)("total_net"),
    runDate: (0, pg_core_1.timestamp)("run_date").default((0, drizzle_orm_1.sql) `now()`),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. RUN RESULTS (The Lines)
// The actual calculated line items for a worker in a run.
exports.hrmPayrollRunResults = (0, pg_core_1.pgTable)("hrm_payroll_run_results", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    payrollRunId: (0, pg_core_1.varchar)("payroll_run_id").notNull().references(() => exports.hrmPayrollRuns.id),
    assignmentId: (0, pg_core_1.varchar)("assignment_id").notNull().references(() => hr_worker_1.hrAssignments.id),
    elementId: (0, pg_core_1.varchar)("element_id").notNull().references(() => exports.hrmPayElements.id),
    elementName: (0, pg_core_1.varchar)("element_name"), // Snapshotted for audit
    amount: (0, pg_core_1.numeric)("amount", { precision: 15, scale: 2 }).notNull(), // Can be negative for deductions
    ytdAmount: (0, pg_core_1.numeric)("ytd_amount", { precision: 15, scale: 2 }), // Year-to-Date
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertPayGroupSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPayGroups);
exports.insertPayElementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPayElements);
exports.insertPayrollRunSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPayrollRuns);
exports.insertRunResultSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPayrollRunResults);
//# sourceMappingURL=rewards_payroll.js.map