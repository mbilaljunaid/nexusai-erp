import { pgTable, varchar, timestamp, boolean, integer, date, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { hrPersons } from "./hr_worker";

// ========== PERFORMANCE MODULE ==========

// 1. GOALS (Objectives)
export const hrmPerfGoals = pgTable("hrm_perf_goals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull().references(() => hrPersons.id), // The API uses this

    title: varchar("title").notNull(),
    description: text("description"),

    category: varchar("category"), // CAREER, PROJECT, PERSONAL
    status: varchar("status").default("NOT_STARTED"), // NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED

    weight: integer("weight").default(0), // Percentage

    startDate: date("start_date"),
    targetDate: date("target_date"),
    completionDate: date("completion_date"),

    progress: integer("progress").default(0), // 0-100%

    isPrivate: boolean("is_private").default(false),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 2. PERFORMANCE DOCUMENTS (Appraisals/Reviews)
export const hrmPerfDocuments = pgTable("hrm_perf_documents", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull().references(() => hrPersons.id),
    managerId: varchar("manager_id").references(() => hrPersons.id),

    templateType: varchar("template_type").default("ANNUAL"), // ANNUAL, PROBATION, PIP
    periodName: varchar("period_name"), // "2024 Annual Cycle"

    status: varchar("status").default("DRAFT"), // DRAFT, EMPLOYEE_INPUT, MANAGER_EVAL, APPROVAL, COMPLETED

    overallRating: integer("overall_rating"), // 1-5 scale often
    overallComments: text("overall_comments"),

    employeeSubmittedDate: timestamp("employee_submitted_date"),
    managerSubmittedDate: timestamp("manager_submitted_date"),
    completedDate: timestamp("completed_date"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. PERFORMANCE TEMPLATES (Configuration Level 8)
export const hrmPerfTemplates = pgTable("hrm_perf_templates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    name: varchar("name").notNull(), // "Annual Review 2024", "PIP Template"
    description: text("description"),

    sections: jsonb("sections"), // definition of sections: ["Goals", "Competencies", "Feedback"]
    ratingScale: jsonb("rating_scale"), // e.g. { 1: "Poor", 5: "Running on Water" }

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 4. FEEDBACK (360 / Generic)
export const hrmPerfFeedback = pgTable("hrm_perf_feedback", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    targetPersonId: varchar("target_person_id").notNull().references(() => hrPersons.id),
    authorPersonId: varchar("author_person_id").references(() => hrPersons.id), // Can be anonymous/null

    feedbackType: varchar("feedback_type").default("GENERAL"), // GENERAL, PROJECT, PEER_REVIEW
    message: text("message").notNull(),

    isVisibleToEmployee: boolean("is_visible_to_employee").default(true),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// SCHEMAS
export const insertGoalSchema = createInsertSchema(hrmPerfGoals);
export const insertPerfDocumentSchema = createInsertSchema(hrmPerfDocuments);
export const insertPerfTemplateSchema = createInsertSchema(hrmPerfTemplates);
export const insertFeedbackSchema = createInsertSchema(hrmPerfFeedback);

export type PerfGoal = typeof hrmPerfGoals.$inferSelect;
export type PerfDocument = typeof hrmPerfDocuments.$inferSelect;
export type PerfTemplate = typeof hrmPerfTemplates.$inferSelect;
export type PerfFeedback = typeof hrmPerfFeedback.$inferSelect;
