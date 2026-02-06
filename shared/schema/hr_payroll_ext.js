"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertVoluntaryDeductionSchema = exports.hrmVoluntaryDeductions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_worker_1 = require("./hr_worker");
const rewards_payroll_1 = require("./rewards_payroll");
exports.hrmVoluntaryDeductions = (0, pg_core_1.pgTable)("hrm_voluntary_deductions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    assignmentId: (0, pg_core_1.varchar)("assignment_id").notNull().references(() => hr_worker_1.hrAssignments.id),
    elementId: (0, pg_core_1.varchar)("element_id").notNull().references(() => rewards_payroll_1.hrmPayElements.id),
    amount: (0, pg_core_1.numeric)("amount", { precision: 15, scale: 2 }).notNull(),
    frequency: (0, pg_core_1.varchar)("frequency").default("RECURRING"), // RECURRING, ONE_TIME
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertVoluntaryDeductionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmVoluntaryDeductions);
//# sourceMappingURL=hr_payroll_ext.js.map