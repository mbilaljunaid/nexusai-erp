"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertBenEnrollmentSchema = exports.insertBenOptionSchema = exports.insertBenPlanSchema = exports.insertBenProgramSchema = exports.hrmBenEnrollments = exports.hrmBenPlanOptions = exports.hrmBenOptions = exports.hrmBenPlans = exports.hrmBenPrograms = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_worker_1 = require("./hr_worker");
const rewards_payroll_1 = require("./rewards_payroll");
// ========== WORKFORCE REWARDS: BENEFITS ==========
// 1. PROGRAMS (The "Container")
// e.g. "US Benefits 2026", "Executive Package"
exports.hrmBenPrograms = (0, pg_core_1.pgTable)("hrm_ben_programs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.varchar)("description"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    legislationCode: (0, pg_core_1.varchar)("legislation_code").default("US"), // Global Support (US, UK, AE, etc)
    // Enrollment Window
    openEnrollmentStart: (0, pg_core_1.date)("open_enrollment_start"),
    openEnrollmentEnd: (0, pg_core_1.date)("open_enrollment_end"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. PLANS (The "Product")
// e.g. "Aetna Gold PPO", "VSP Vision"
exports.hrmBenPlans = (0, pg_core_1.pgTable)("hrm_ben_plans", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    programId: (0, pg_core_1.varchar)("program_id").references(() => exports.hrmBenPrograms.id),
    name: (0, pg_core_1.varchar)("name").notNull(),
    planType: (0, pg_core_1.varchar)("plan_type").notNull(), // MEDICAL, DENTAL, VISION, LIFE
    provider: (0, pg_core_1.varchar)("provider"), // e.g. Aetna, BlueCross
    // Link to Payroll Element for Deduction
    deductionElementId: (0, pg_core_1.varchar)("deduction_element_id").references(() => rewards_payroll_1.hrmPayElements.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. OPTIONS (The "Coverage Level")
// e.g. "Employee Only", "Employee + Family"
exports.hrmBenOptions = (0, pg_core_1.pgTable)("hrm_ben_options", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // "Employee Only"
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. PLAN IN PROGRAM (The "Join" with Rates)
// Configures "Aetna Gold" available as "Employee Only" for "$150/month"
exports.hrmBenPlanOptions = (0, pg_core_1.pgTable)("hrm_ben_plan_options", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    planId: (0, pg_core_1.varchar)("plan_id").notNull().references(() => exports.hrmBenPlans.id),
    optionId: (0, pg_core_1.varchar)("option_id").notNull().references(() => exports.hrmBenOptions.id),
    employeeCost: (0, pg_core_1.numeric)("employee_cost", { precision: 10, scale: 2 }).default("0.00"),
    employerCost: (0, pg_core_1.numeric)("employer_cost", { precision: 10, scale: 2 }).default("0.00"),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 5. ENROLLMENTS (The "Election")
exports.hrmBenEnrollments = (0, pg_core_1.pgTable)("hrm_ben_enrollments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id),
    planOptionId: (0, pg_core_1.varchar)("plan_option_id").notNull().references(() => exports.hrmBenPlanOptions.id),
    coverageStartDate: (0, pg_core_1.date)("coverage_start_date").notNull(),
    coverageEndDate: (0, pg_core_1.date)("coverage_end_date"), // Null = Active
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"), // ACTIVE, SUSPENDED, TERMINATED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertBenProgramSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmBenPrograms);
exports.insertBenPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmBenPlans);
exports.insertBenOptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmBenOptions);
exports.insertBenEnrollmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmBenEnrollments);
//# sourceMappingURL=rewards_benefits.js.map