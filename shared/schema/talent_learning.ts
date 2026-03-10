import { pgTable, varchar, timestamp, boolean, integer, date, text, jsonb, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrPersons } from "./hr_worker";

// ========== LEARNING MODULE ==========

// 1. COURSES (The Catalog Item)
export const hrmLearningCourses = pgTable("hrm_learning_courses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    title: varchar("title").notNull(),
    description: text("description"),

    // Categorization
    category: varchar("category"), // e.g. "Compliance", "Technical", "Leadership"
    provider: varchar("provider"), // e.g. "Internal", "Udemy", "LinkedIn"
    communityId: varchar("community_id").references(() => hrmLearningCommunities.id),

    durationMinutes: integer("duration_minutes"),

    // Compliance & Validity
    validityMonths: integer("validity_months"), // e.g. 12 for annual compliance
    renewalRule: varchar("renewal_rule"), // e.g. "FIXED_DATE", "ROLLING_FROM_COMPLETION"

    status: varchar("status").default("ACTIVE"), // ACTIVE, ARCHIVED

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 1.1 CONTENT ITEMS (SCORM, Video, PDF modules)
export const hrmLearningContentItems = pgTable("hrm_learning_content_items", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    title: varchar("title").notNull(),
    type: varchar("type").notNull(), // SCORM_12, VIDEO, PDF, LINK

    url: text("url"), // Path to file or external link
    launchData: text("launch_data"), // specialized launch params

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. OFFERINGS (Specific Instances/Classes of a Course)
export const hrmLearningOfferings = pgTable("hrm_learning_offerings", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    courseId: varchar("course_id").notNull().references(() => hrmLearningCourses.id),

    title: varchar("title").notNull(), // e.g. "Q1 2026 Session"

    type: varchar("type").default("SELF_PACED"), // SELF_PACED, INSTRUCTOR_LED, BLENDED

    startDate: date("start_date"),
    endDate: date("end_date"),

    instructorId: varchar("instructor_id").references(() => hrPersons.id),
    location: varchar("location"), // e.g. "Room 304" or URL

    capacity: integer("capacity"),
    enrolledCount: integer("enrolled_count").default(0),

    // Financials
    price: numeric("price").default("0"),
    currency: varchar("currency").default("USD"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. ENROLLMENTS (Learner Records)
export const hrmLearningEnrollments = pgTable("hrm_learning_enrollments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    entLegalEntityId: varchar("ent_legal_entity_id"),

    offeringId: varchar("offering_id").notNull().references(() => hrmLearningOfferings.id),
    personId: varchar("person_id").notNull().references(() => hrPersons.id),

    status: varchar("status").default("ENROLLED"), // ENROLLED, IN_PROGRESS, COMPLETED, DROPPED, WAITLISTED

    progressPercent: integer("progress_percent").default(0),
    score: integer("score"),

    completionDate: date("completion_date"),
    certificateUrl: text("certificate_url"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 4. CERTIFICATIONS (Compliance Programs)
export const hrmLearningCertifications = pgTable("hrm_learning_certifications", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    title: varchar("title").notNull(),
    description: text("description"),

    validityPeriodDays: integer("validity_period_days"),
    renewalWindowDays: integer("renewal_window_days"), // Can renew X days before expiry

    ownerId: varchar("owner_id").references(() => hrPersons.id), // Compliance Owner

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 5. AUDIT LOGS
export const hrmLearningAuditLogs = pgTable("hrm_learning_audit_logs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    entityType: varchar("entity_type").notNull(), // ENROLLMENT, COURSE
    entityId: varchar("entity_id").notNull(),

    action: varchar("action").notNull(), // UPDATE, CREATE, AUTO_RENEWAL

    previousValue: text("previous_value"),
    newValue: text("new_value"),

    actorId: varchar("actor_id"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 6. CURRICULA (Learning Paths)
export const hrmLearningCurricula = pgTable("hrm_learning_curricula", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    title: varchar("title").notNull(),
    description: text("description"),
    provider: varchar("provider").default("Internal"),
    category: varchar("category"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const hrmLearningCurriculumMembers = pgTable("hrm_learning_curriculum_members", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    curriculumId: varchar("curriculum_id").notNull().references(() => hrmLearningCurricula.id),
    courseId: varchar("course_id").notNull().references(() => hrmLearningCourses.id),

    sequenceOrder: integer("sequence_order").default(0),
    isRequired: boolean("is_required").default(true),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 7. ASSESSMENTS
export const hrmLearningAssessments = pgTable("hrm_learning_assessments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    title: varchar("title").notNull(),
    description: text("description"),

    passingScore: integer("passing_score").default(80),
    maxAttempts: integer("max_attempts").default(3),
    timeLimitMinutes: integer("time_limit_minutes"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const hrmLearningAssessmentQuestions = pgTable("hrm_learning_assessment_questions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    assessmentId: varchar("assessment_id").notNull().references(() => hrmLearningAssessments.id),

    text: text("text").notNull(),
    type: varchar("type").default("MULTIPLE_CHOICE"),
    options: jsonb("options"), // [{id: "1", text: "A"}]
    correctAnswer: varchar("correct_answer"),
    points: integer("points").default(10),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const hrmLearningAssessmentAttempts = pgTable("hrm_learning_assessment_attempts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    enrollmentId: varchar("enrollment_id").notNull().references(() => hrmLearningEnrollments.id),
    assessmentId: varchar("assessment_id").notNull().references(() => hrmLearningAssessments.id),

    score: integer("score"),
    passed: boolean("passed"),
    answers: jsonb("answers"),

    startedAt: timestamp("started_at").default(sql`now()`),
    completedAt: timestamp("completed_at"),
});

// 8. COMMUNITIES (Catalog Hierarchy)
export const hrmLearningCommunities = pgTable("hrm_learning_communities", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    title: varchar("title").notNull(),
    description: text("description"),
    parentId: varchar("parent_id").references((): any => hrmLearningCommunities.id),
    path: text("path"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// SCHEMAS
export const insertLearningCourseSchema = createInsertSchema(hrmLearningCourses);
export const insertLearningOfferingSchema = createInsertSchema(hrmLearningOfferings);
export const insertLearningEnrollmentSchema = createInsertSchema(hrmLearningEnrollments);
export const insertLearningContentItemSchema = createInsertSchema(hrmLearningContentItems);
export const insertLearningCertificationSchema = createInsertSchema(hrmLearningCertifications);
export const insertLearningAuditLogSchema = createInsertSchema(hrmLearningAuditLogs);
export const insertLearningCurriculumSchema = createInsertSchema(hrmLearningCurricula);
export const insertLearningAssessmentSchema = createInsertSchema(hrmLearningAssessments);
export const insertLearningCommunitySchema = createInsertSchema(hrmLearningCommunities);

export type LearningCourse = typeof hrmLearningCourses.$inferSelect;
export type LearningOffering = typeof hrmLearningOfferings.$inferSelect;
export type LearningEnrollment = typeof hrmLearningEnrollments.$inferSelect;
export type LearningContentItem = typeof hrmLearningContentItems.$inferSelect;
export type LearningCertification = typeof hrmLearningCertifications.$inferSelect;
export type LearningAuditLog = typeof hrmLearningAuditLogs.$inferSelect;
export type LearningCurriculum = typeof hrmLearningCurricula.$inferSelect;
export type LearningAssessment = typeof hrmLearningAssessments.$inferSelect;
export type LearningCommunity = typeof hrmLearningCommunities.$inferSelect;
