
import { pgTable, varchar, timestamp, boolean, integer, numeric, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrPersons } from "./hr_worker";
import { hrmPayElements } from "./rewards_payroll";

// ========== WORKFORCE REWARDS: BENEFITS ==========

// 1. PROGRAMS (The "Container")
// e.g. "US Benefits 2026", "Executive Package"
export const hrmBenPrograms = pgTable("hrm_ben_programs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    name: varchar("name").notNull(),
    description: varchar("description"),

    status: varchar("status").default("ACTIVE"),

    // Enrollment Window
    openEnrollmentStart: date("open_enrollment_start"),
    openEnrollmentEnd: date("open_enrollment_end"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. PLANS (The "Product")
// e.g. "Aetna Gold PPO", "VSP Vision"
export const hrmBenPlans = pgTable("hrm_ben_plans", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    programId: varchar("program_id").references(() => hrmBenPrograms.id),

    name: varchar("name").notNull(),
    planType: varchar("plan_type").notNull(), // MEDICAL, DENTAL, VISION, LIFE

    provider: varchar("provider"), // e.g. Aetna, BlueCross

    // Link to Payroll Element for Deduction
    deductionElementId: varchar("deduction_element_id").references(() => hrmPayElements.id),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3. OPTIONS (The "Coverage Level")
// e.g. "Employee Only", "Employee + Family"
export const hrmBenOptions = pgTable("hrm_ben_options", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // "Employee Only"

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 4. PLAN IN PROGRAM (The "Join" with Rates)
// Configures "Aetna Gold" available as "Employee Only" for "$150/month"
export const hrmBenPlanOptions = pgTable("hrm_ben_plan_options", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    planId: varchar("plan_id").notNull().references(() => hrmBenPlans.id),
    optionId: varchar("option_id").notNull().references(() => hrmBenOptions.id),

    employeeCost: numeric("employee_cost", { precision: 10, scale: 2 }).default("0.00"),
    employerCost: numeric("employer_cost", { precision: 10, scale: 2 }).default("0.00"),

    currency: varchar("currency").default("USD"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 5. ENROLLMENTS (The "Election")
export const hrmBenEnrollments = pgTable("hrm_ben_enrollments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull().references(() => hrPersons.id),

    planOptionId: varchar("plan_option_id").notNull().references(() => hrmBenPlanOptions.id),

    coverageStartDate: date("coverage_start_date").notNull(),
    coverageEndDate: date("coverage_end_date"), // Null = Active

    status: varchar("status").default("ACTIVE"), // ACTIVE, SUSPENDED, TERMINATED

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBenProgramSchema = createInsertSchema(hrmBenPrograms);
export const insertBenPlanSchema = createInsertSchema(hrmBenPlans);
export const insertBenOptionSchema = createInsertSchema(hrmBenOptions);
export const insertBenEnrollmentSchema = createInsertSchema(hrmBenEnrollments);
