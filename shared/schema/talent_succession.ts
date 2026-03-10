import { pgTable, varchar, timestamp, boolean, integer, date, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrJobs, hrPositions } from "./hr_structures";
import { hrPersons } from "./hr_worker";

// ========== SUCCESSION MODULE ==========

// 1. TALENT POOLS
export const hrmTalentPools = pgTable("hrm_talent_pools", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(),
    description: text("description"),

    ownerId: varchar("owner_id").references(() => hrPersons.id), // HR BP or Manager

    status: varchar("status").default("ACTIVE"), // ACTIVE, INACTIVE

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 2. SUCCESSION PLANS
export const hrmSuccessionPlans = pgTable("hrm_succession_plans", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    // Can target a Job, Position, or specific Incumbent
    targetJobId: varchar("target_job_id").references(() => hrJobs.id),
    targetPositionId: varchar("target_position_id").references(() => hrPositions.id),
    incumbentPersonId: varchar("incumbent_person_id").references(() => hrPersons.id),

    name: varchar("name").notNull(), // e.g. "CFO Succession 2024"
    status: varchar("status").default("DRAFT"), // DRAFT, ACTIVE, REVIEWED

    reviewDate: date("review_date"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. SUCCESSION CANDIDATES (Successors)
export const hrmSuccessionCandidates = pgTable("hrm_succession_candidates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    planId: varchar("plan_id").notNull().references(() => hrmSuccessionPlans.id),
    personId: varchar("person_id").notNull().references(() => hrPersons.id), // The successor

    readiness: varchar("readiness").default("READY_NOW"), // READY_NOW, READY_1_2_YEARS, READY_3_5_YEARS
    ranking: integer("ranking"), // 1, 2, 3
    nineBoxPosition: varchar("nine_box_position"), // HIGH_PERF_HIGH_POT, etc.

    notes: text("notes"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 4. READINESS ASSESSMENTS
export const hrmReadinessAssessments = pgTable("hrm_readiness_assessments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    candidateId: varchar("candidate_id").notNull().references(() => hrmSuccessionCandidates.id),
    assessorId: varchar("assessor_id").references(() => hrPersons.id),

    technicalCompetence: integer("technical_competence").notNull(),
    leadershipCapability: integer("leadership_capability").notNull(),
    culturalFit: integer("cultural_fit").notNull(),

    overallScore: integer("overall_score"),
    developmentNeeds: text("development_needs"),
    readinessTimeline: varchar("readiness_timeline"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedBy: varchar("updated_by"),
});

// Position History (for tracking 9-box movement)
export const hrmPositionHistory = pgTable("hrm_position_history", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    candidateId: varchar("candidate_id").notNull().references(() => hrmSuccessionCandidates.id),

    previousPosition: varchar("previous_position"),
    newPosition: varchar("new_position").notNull(),
    changedBy: varchar("changed_by"),
    changeReason: text("change_reason"),

    createdAt: timestamp("created_at").default(sql`now()`),
});


// SCHEMAS
export const insertTalentPoolSchema = createInsertSchema(hrmTalentPools);
export const insertSuccessionPlanSchema = createInsertSchema(hrmSuccessionPlans);
export const insertSuccessionCandidateSchema = createInsertSchema(hrmSuccessionCandidates);
export const insertReadinessAssessmentSchema = createInsertSchema(hrmReadinessAssessments);
export const insertPositionHistorySchema = createInsertSchema(hrmPositionHistory);

export type TalentPool = typeof hrmTalentPools.$inferSelect;
export type SuccessionPlan = typeof hrmSuccessionPlans.$inferSelect;
export type SuccessionCandidate = typeof hrmSuccessionCandidates.$inferSelect;
export type ReadinessAssessment = typeof hrmReadinessAssessments.$inferSelect;
export type PositionHistory = typeof hrmPositionHistory.$inferSelect;
