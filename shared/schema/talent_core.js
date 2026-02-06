"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPersonSkillSchema = exports.hrmPersonSkills = exports.insertCompetencySchema = exports.insertSkillSchema = exports.hrmJobProfiles = exports.hrmCompetencies = exports.hrmSkills = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_structures_1 = require("./hr_structures");
// ========== TALENT CORE ==========
// 1. SKILLS LIBRARY
exports.hrmSkills = (0, pg_core_1.pgTable)("hrm_skills", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category"), // Technical, Soft, Language
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. COMPETENCY MODELS
exports.hrmCompetencies = (0, pg_core_1.pgTable)("hrm_competencies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    behavioralIndicators: (0, pg_core_1.jsonb)("behavioral_indicators"), // Array of strings e.g. ["Communicates clearly", "Listens actively"]
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. JOB PROFILES (Linking Jobs to Skills/Competencies)
exports.hrmJobProfiles = (0, pg_core_1.pgTable)("hrm_job_profiles", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    jobId: (0, pg_core_1.varchar)("job_id").notNull().references(() => hr_structures_1.hrJobs.id),
    // In a relational model we might use a many-to-many junction table, 
    // but for simplicity/JSON we can store requirements here or use a junction.
    // Let's use a JSONB structure for V1 simplicity if acceptable, or separate tables.
    // Given "Oracle Style", we should probably link them proper. 
    // But for "Tier-1 Parity" V1, let's keep it simple.
    profileSummary: (0, pg_core_1.text)("profile_summary"),
    responsibilities: (0, pg_core_1.text)("responsibilities"),
    qualifications: (0, pg_core_1.text)("qualifications"),
    // Structure: [{ skillId: string, level: string, required: boolean }]
    requiredSkills: (0, pg_core_1.jsonb)("required_skills"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertSkillSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmSkills);
exports.insertCompetencySchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmCompetencies);
// 4. PERSON SKILLS / COMPETENCIES (The Profile)
exports.hrmPersonSkills = (0, pg_core_1.pgTable)("hrm_person_skills", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull(), // references hrPersons (avoid cicrular dep import if needed, or link loosely)
    // Can link to a formal Competency OR be a free-text skill
    competencyId: (0, pg_core_1.varchar)("competency_id").references(() => exports.hrmCompetencies.id),
    skillName: (0, pg_core_1.varchar)("skill_name"), // Fallback if not linked to competency
    proficiency: (0, pg_core_1.varchar)("proficiency"), // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    verified: (0, pg_core_1.boolean)("verified").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPersonSkillSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPersonSkills);
//# sourceMappingURL=talent_core.js.map