import { pgTable, varchar, timestamp, boolean, integer, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrJobs } from "./hr_structures";

// ========== TALENT CORE ==========

// 1. SKILLS LIBRARY
export const hrmSkills = pgTable("hrm_skills", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull().unique(),
    description: text("description"),

    category: varchar("category"), // Technical, Soft, Language
    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. COMPETENCY MODELS
export const hrmCompetencies = pgTable("hrm_competencies", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(),
    description: text("description"),

    behavioralIndicators: jsonb("behavioral_indicators"), // Array of strings e.g. ["Communicates clearly", "Listens actively"]

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3. JOB PROFILES (Linking Jobs to Skills/Competencies)
export const hrmJobProfiles = pgTable("hrm_job_profiles", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    jobId: varchar("job_id").notNull().references(() => hrJobs.id),

    // In a relational model we might use a many-to-many junction table, 
    // but for simplicity/JSON we can store requirements here or use a junction.
    // Let's use a JSONB structure for V1 simplicity if acceptable, or separate tables.
    // Given "Oracle Style", we should probably link them proper. 
    // But for "Tier-1 Parity" V1, let's keep it simple.

    profileSummary: text("profile_summary"),
    responsibilities: text("responsibilities"),
    qualifications: text("qualifications"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// SCHEMAS
export const insertSkillSchema = createInsertSchema(hrmSkills);
export const insertCompetencySchema = createInsertSchema(hrmCompetencies);

export type Skill = typeof hrmSkills.$inferSelect;
export type Competency = typeof hrmCompetencies.$inferSelect;

// 4. PERSON SKILLS / COMPETENCIES (The Profile)
export const hrmPersonSkills = pgTable("hrm_person_skills", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull(), // references hrPersons (avoid cicrular dep import if needed, or link loosely)

    // Can link to a formal Competency OR be a free-text skill
    competencyId: varchar("competency_id").references(() => hrmCompetencies.id),
    skillName: varchar("skill_name"), // Fallback if not linked to competency

    proficiency: varchar("proficiency"), // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

    verified: boolean("verified").default(false),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertPersonSkillSchema = createInsertSchema(hrmPersonSkills);
export type PersonSkill = typeof hrmPersonSkills.$inferSelect;

