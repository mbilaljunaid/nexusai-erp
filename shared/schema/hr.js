"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertLeaveRequestSchema = exports.leaveRequests = exports.insertTimeEntrySchema = exports.timeEntries = exports.insertPayrollConfigSchema = exports.payrollConfigs = exports.insertPayrollSchema = exports.payroll = exports.insertEmployeeSchema = exports.employees = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== HR MODULE ==========
exports.employees = (0, pg_core_1.pgTable)("employees", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    firstName: (0, pg_core_1.varchar)("first_name").notNull(),
    lastName: (0, pg_core_1.varchar)("last_name").notNull(),
    email: (0, pg_core_1.varchar)("email").unique(),
    department: (0, pg_core_1.varchar)("department"),
    hireDate: (0, pg_core_1.timestamp)("hire_date"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEmployeeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.employees).extend({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    department: zod_1.z.string().optional(),
    hireDate: zod_1.z.date().optional().nullable(),
    status: zod_1.z.string().optional(),
});
exports.payroll = (0, pg_core_1.pgTable)("payroll", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    employeeId: (0, pg_core_1.varchar)("employee_id").notNull(),
    salary: (0, pg_core_1.numeric)("salary", { precision: 18, scale: 2 }),
    bonus: (0, pg_core_1.numeric)("bonus", { precision: 18, scale: 2 }).default("0"),
    deductions: (0, pg_core_1.numeric)("deductions", { precision: 18, scale: 2 }).default("0"),
    netPay: (0, pg_core_1.numeric)("net_pay", { precision: 18, scale: 2 }),
    payPeriod: (0, pg_core_1.varchar)("pay_period"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPayrollSchema = (0, drizzle_zod_1.createInsertSchema)(exports.payroll).extend({
    employeeId: zod_1.z.string().min(1),
    salary: zod_1.z.string().optional(),
    bonus: zod_1.z.string().optional(),
    deductions: zod_1.z.string().optional(),
    netPay: zod_1.z.string().optional(),
    payPeriod: zod_1.z.string().optional(),
});
// ========== PAYROLL CONFIGURATION ==========
exports.payrollConfigs = (0, pg_core_1.pgTable)("payroll_configs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    payPeriod: (0, pg_core_1.varchar)("pay_period").default("monthly"), // weekly, biweekly, monthly
    payDay: (0, pg_core_1.integer)("pay_day"),
    taxSettings: (0, pg_core_1.jsonb)("tax_settings"),
    benefitSettings: (0, pg_core_1.jsonb)("benefit_settings"),
    overtimeRules: (0, pg_core_1.jsonb)("overtime_rules"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPayrollConfigSchema = (0, drizzle_zod_1.createInsertSchema)(exports.payrollConfigs).extend({
    tenantId: zod_1.z.string().min(1),
    payPeriod: zod_1.z.string().optional(),
    payDay: zod_1.z.number().optional(),
    taxSettings: zod_1.z.record(zod_1.z.any()).optional(),
    benefitSettings: zod_1.z.record(zod_1.z.any()).optional(),
    overtimeRules: zod_1.z.record(zod_1.z.any()).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.timeEntries = (0, pg_core_1.pgTable)("time_entries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    employeeId: (0, pg_core_1.varchar)("employee_id").notNull(),
    projectId: (0, pg_core_1.varchar)("project_id").notNull(), // Linked to ppm_projects
    taskId: (0, pg_core_1.varchar)("task_id").notNull(), // Linked to ppm_tasks
    date: (0, pg_core_1.timestamp)("date").notNull(),
    hours: (0, pg_core_1.numeric)("hours", { precision: 5, scale: 2 }).notNull(),
    description: (0, pg_core_1.varchar)("description"),
    billableFlag: (0, pg_core_1.boolean)("billable_flag").default(false),
    costRate: (0, pg_core_1.numeric)("cost_rate", { precision: 18, scale: 2 }), // Hourly cost
    status: (0, pg_core_1.varchar)("status").default("SUBMITTED"), // SUBMITTED, APPROVED, PROCESSED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTimeEntrySchema = (0, drizzle_zod_1.createInsertSchema)(exports.timeEntries).extend({
    employeeId: zod_1.z.string().min(1),
    projectId: zod_1.z.string().min(1),
    taskId: zod_1.z.string().min(1),
    date: zod_1.z.date(),
    hours: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/), // string for numeric
    description: zod_1.z.string().optional(),
    billableFlag: zod_1.z.boolean().optional(),
    costRate: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
exports.leaveRequests = (0, pg_core_1.pgTable)("leave_requests", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    employeeId: (0, pg_core_1.varchar)("employee_id").notNull(),
    leaveType: (0, pg_core_1.varchar)("leave_type").notNull(), // Annual, Sick, Unpaid
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    reason: (0, pg_core_1.varchar)("reason"),
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // PENDING, APPROVED, REJECTED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertLeaveRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leaveRequests).extend({
    employeeId: zod_1.z.string().min(1),
    leaveType: zod_1.z.string().min(1),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    reason: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
//# sourceMappingURL=hr.js.map