import { pgTable, varchar, timestamp, boolean, integer, numeric, date, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrAssignments } from "./hr_worker";

// ========== WORKFORCE REWARDS: COMPENSATION ==========

// 1. SALARY BASIS
// Defines how "Base Pay" is quoted (Hourly, Annually) and the frequency.
// e.g. "US Annual Salaried", "UK Hourly"
export const hrmSalaryBases = pgTable("hrm_salary_bases", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // "Annual Salary USD"
    code: varchar("code").notNull().unique(),

    frequency: varchar("frequency").default("ANNUALLY"), // ANNUALLY, MONTHLY, HOURLY
    annualizationFactor: numeric("annualization_factor", { precision: 10, scale: 4 }).default("1.0"), // e.g. 2080 for Hourly

    currency: varchar("currency").default("USD"),

    status: varchar("status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 2. WORKER SALARY (The "Compensation Info" on the Assignment)
// Linked to Assignment (Job). This is the "Base Pay".
export const hrmWorkerSalaries = pgTable("hrm_worker_salaries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    assignmentId: varchar("assignment_id").notNull().references(() => hrAssignments.id),

    salaryBasisId: varchar("salary_basis_id").notNull().references(() => hrmSalaryBases.id),

    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(), // The quoted amount (e.g. 120000)
    annualAmount: numeric("annual_amount", { precision: 15, scale: 2 }), // Calculated

    currency: varchar("currency").notNull(),

    // Effective Dating (Simplified for V1)
    dateFrom: date("date_from").notNull(),
    dateTo: date("date_to"), // Null = ongoing

    changeReason: varchar("change_reason"), // PROMOTION, MERIT, ADJUSTMENT
    nextReviewDate: date("next_review_date"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. COMPENSATION PLANS (Variable Pay)
// Bonus Plans, Stock Option Plans, Short Term Incentives
export const hrmCompensationPlans = pgTable("hrm_compensation_plans", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(),
    planType: varchar("plan_type").default("BONUS"), // BONUS, STOCK, COMMISSION

    frequency: varchar("frequency").default("ANNUAL"),

    targetPercentage: numeric("target_percentage", { precision: 5, scale: 2 }), // e.g. 10.00%

    status: varchar("status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 4. COMPENSATION ELIGIBILITY PROFILES
// Rules engine that determines which employees qualify for which compensation plan.
// Conditions are stored as JSON array: [{ field, operator, value }]
export const hrmEligibilityProfiles = pgTable("hrm_eligibility_profiles", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // "Full-Time Annual Bonus"
    description: varchar("description"),

    // JSON rule array: [{ field: "workerType", operator: "=", value: "EMPLOYEE" }]
    conditions: jsonb("conditions"),

    status: varchar("status").default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 5. ELIGIBILITY PLAN LINKS
// Maps an eligibility profile to one or more compensation plans.
export const hrmEligibilityPlanLinks = pgTable("hrm_eligibility_plan_links", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    profileId: varchar("profile_id").notNull().references(() => hrmEligibilityProfiles.id),
    planId: varchar("plan_id").notNull().references(() => hrmCompensationPlans.id),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// SCHEMAS
export const insertSalaryBasisSchema = createInsertSchema(hrmSalaryBases);
export const insertWorkerSalarySchema = createInsertSchema(hrmWorkerSalaries);
export const insertCompPlanSchema = createInsertSchema(hrmCompensationPlans);
export const insertEligibilityProfileSchema = createInsertSchema(hrmEligibilityProfiles);
export const insertEligibilityPlanLinkSchema = createInsertSchema(hrmEligibilityPlanLinks);

export type SalaryBasis = typeof hrmSalaryBases.$inferSelect;
export type WorkerSalary = typeof hrmWorkerSalaries.$inferSelect;
export type CompPlan = typeof hrmCompensationPlans.$inferSelect;
export type EligibilityProfile = typeof hrmEligibilityProfiles.$inferSelect;
export type EligibilityPlanLink = typeof hrmEligibilityPlanLinks.$inferSelect;
