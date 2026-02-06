"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFeedbackSchema = exports.insertPerfTemplateSchema = exports.insertPerfDocumentSchema = exports.insertGoalSchema = exports.hrmPerfFeedback = exports.hrmPerfTemplates = exports.hrmPerfDocuments = exports.hrmPerfGoals = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_worker_1 = require("./hr_worker");
// ========== PERFORMANCE MODULE ==========
// 1. GOALS (Objectives)
exports.hrmPerfGoals = (0, pg_core_1.pgTable)("hrm_perf_goals", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id), // The API uses this
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category"), // CAREER, PROJECT, PERSONAL
    status: (0, pg_core_1.varchar)("status").default("NOT_STARTED"), // NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED
    weight: (0, pg_core_1.integer)("weight").default(0), // Percentage
    startDate: (0, pg_core_1.date)("start_date"),
    targetDate: (0, pg_core_1.date)("target_date"),
    completionDate: (0, pg_core_1.date)("completion_date"),
    progress: (0, pg_core_1.integer)("progress").default(0), // 0-100%
    isPrivate: (0, pg_core_1.boolean)("is_private").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. PERFORMANCE DOCUMENTS (Appraisals/Reviews)
exports.hrmPerfDocuments = (0, pg_core_1.pgTable)("hrm_perf_documents", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id),
    managerId: (0, pg_core_1.varchar)("manager_id").references(() => hr_worker_1.hrPersons.id),
    templateType: (0, pg_core_1.varchar)("template_type").default("ANNUAL"), // ANNUAL, PROBATION, PIP
    periodName: (0, pg_core_1.varchar)("period_name"), // "2024 Annual Cycle"
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, EMPLOYEE_INPUT, MANAGER_EVAL, APPROVAL, COMPLETED
    overallRating: (0, pg_core_1.integer)("overall_rating"), // 1-5 scale often
    overallComments: (0, pg_core_1.text)("overall_comments"),
    employeeSubmittedDate: (0, pg_core_1.timestamp)("employee_submitted_date"),
    managerSubmittedDate: (0, pg_core_1.timestamp)("manager_submitted_date"),
    completedDate: (0, pg_core_1.timestamp)("completed_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. PERFORMANCE TEMPLATES (Configuration Level 8)
exports.hrmPerfTemplates = (0, pg_core_1.pgTable)("hrm_perf_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(), // "Annual Review 2024", "PIP Template"
    description: (0, pg_core_1.text)("description"),
    sections: (0, pg_core_1.jsonb)("sections"), // definition of sections: ["Goals", "Competencies", "Feedback"]
    ratingScale: (0, pg_core_1.jsonb)("rating_scale"), // e.g. { 1: "Poor", 5: "Running on Water" }
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. FEEDBACK (360 / Generic)
exports.hrmPerfFeedback = (0, pg_core_1.pgTable)("hrm_perf_feedback", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    targetPersonId: (0, pg_core_1.varchar)("target_person_id").notNull().references(() => hr_worker_1.hrPersons.id),
    authorPersonId: (0, pg_core_1.varchar)("author_person_id").references(() => hr_worker_1.hrPersons.id), // Can be anonymous/null
    feedbackType: (0, pg_core_1.varchar)("feedback_type").default("GENERAL"), // GENERAL, PROJECT, PEER_REVIEW
    message: (0, pg_core_1.text)("message").notNull(),
    isVisibleToEmployee: (0, pg_core_1.boolean)("is_visible_to_employee").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertGoalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPerfGoals);
exports.insertPerfDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPerfDocuments);
exports.insertPerfTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPerfTemplates);
exports.insertFeedbackSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmPerfFeedback);
//# sourceMappingURL=talent_performance.js.map