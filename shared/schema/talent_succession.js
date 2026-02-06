"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSuccessionCandidateSchema = exports.insertSuccessionPlanSchema = exports.insertTalentPoolSchema = exports.hrmSuccessionCandidates = exports.hrmSuccessionPlans = exports.hrmTalentPools = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_structures_1 = require("./hr_structures");
const hr_worker_1 = require("./hr_worker");
// ========== SUCCESSION MODULE ==========
// 1. TALENT POOLS
exports.hrmTalentPools = (0, pg_core_1.pgTable)("hrm_talent_pools", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    ownerId: (0, pg_core_1.varchar)("owner_id").references(() => hr_worker_1.hrPersons.id), // HR BP or Manager
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"), // ACTIVE, INACTIVE
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. SUCCESSION PLANS
exports.hrmSuccessionPlans = (0, pg_core_1.pgTable)("hrm_succession_plans", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    // Can target a Job, Position, or specific Incumbent
    targetJobId: (0, pg_core_1.varchar)("target_job_id").references(() => hr_structures_1.hrJobs.id),
    targetPositionId: (0, pg_core_1.varchar)("target_position_id").references(() => hr_structures_1.hrPositions.id),
    incumbentPersonId: (0, pg_core_1.varchar)("incumbent_person_id").references(() => hr_worker_1.hrPersons.id),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g. "CFO Succession 2024"
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, ACTIVE, REVIEWED
    reviewDate: (0, pg_core_1.date)("review_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. SUCCESSION CANDIDATES (Successors)
exports.hrmSuccessionCandidates = (0, pg_core_1.pgTable)("hrm_succession_candidates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    planId: (0, pg_core_1.varchar)("plan_id").notNull().references(() => exports.hrmSuccessionPlans.id),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id), // The successor
    readiness: (0, pg_core_1.varchar)("readiness").default("READY_NOW"), // READY_NOW, READY_1_2_YEARS, READY_3_5_YEARS
    ranking: (0, pg_core_1.integer)("ranking"), // 1, 2, 3
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertTalentPoolSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmTalentPools);
exports.insertSuccessionPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmSuccessionPlans);
exports.insertSuccessionCandidateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmSuccessionCandidates);
//# sourceMappingURL=talent_succession.js.map