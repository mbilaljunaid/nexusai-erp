"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCompPlanSchema = exports.insertWorkerSalarySchema = exports.insertSalaryBasisSchema = exports.hrmCompensationPlans = exports.hrmWorkerSalaries = exports.hrmSalaryBases = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_worker_1 = require("./hr_worker");
// ========== WORKFORCE REWARDS: COMPENSATION ==========
// 1. SALARY BASIS
// Defines how "Base Pay" is quoted (Hourly, Annually) and the frequency.
// e.g. "US Annual Salaried", "UK Hourly"
exports.hrmSalaryBases = (0, pg_core_1.pgTable)("hrm_salary_bases", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // "Annual Salary USD"
    code: (0, pg_core_1.varchar)("code").notNull().unique(),
    frequency: (0, pg_core_1.varchar)("frequency").default("ANNUALLY"), // ANNUALLY, MONTHLY, HOURLY
    annualizationFactor: (0, pg_core_1.numeric)("annualization_factor", { precision: 10, scale: 4 }).default("1.0"), // e.g. 2080 for Hourly
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. WORKER SALARY (The "Compensation Info" on the Assignment)
// Linked to Assignment (Job). This is the "Base Pay".
exports.hrmWorkerSalaries = (0, pg_core_1.pgTable)("hrm_worker_salaries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    assignmentId: (0, pg_core_1.varchar)("assignment_id").notNull().references(() => hr_worker_1.hrAssignments.id),
    salaryBasisId: (0, pg_core_1.varchar)("salary_basis_id").notNull().references(() => exports.hrmSalaryBases.id),
    amount: (0, pg_core_1.numeric)("amount", { precision: 15, scale: 2 }).notNull(), // The quoted amount (e.g. 120000)
    annualAmount: (0, pg_core_1.numeric)("annual_amount", { precision: 15, scale: 2 }), // Calculated
    currency: (0, pg_core_1.varchar)("currency").notNull(),
    // Effective Dating (Simplified for V1)
    dateFrom: (0, pg_core_1.date)("date_from").notNull(),
    dateTo: (0, pg_core_1.date)("date_to"), // Null = ongoing
    changeReason: (0, pg_core_1.varchar)("change_reason"), // PROMOTION, MERIT, ADJUSTMENT
    nextReviewDate: (0, pg_core_1.date)("next_review_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. COMPENSATION PLANS (Variable Pay)
// Bonus Plans, Stock Option Plans, Short Term Incentives
exports.hrmCompensationPlans = (0, pg_core_1.pgTable)("hrm_compensation_plans", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    planType: (0, pg_core_1.varchar)("plan_type").default("BONUS"), // BONUS, STOCK, COMMISSION
    frequency: (0, pg_core_1.varchar)("frequency").default("ANNUAL"),
    targetPercentage: (0, pg_core_1.numeric)("target_percentage", { precision: 5, scale: 2 }), // e.g. 10.00%
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertSalaryBasisSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmSalaryBases);
exports.insertWorkerSalarySchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmWorkerSalaries);
exports.insertCompPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmCompensationPlans);
//# sourceMappingURL=rewards_compensation.js.map