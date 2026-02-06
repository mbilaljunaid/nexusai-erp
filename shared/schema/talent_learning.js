"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertLearningCommunitySchema = exports.insertLearningAssessmentSchema = exports.insertLearningCurriculumSchema = exports.insertLearningAuditLogSchema = exports.insertLearningCertificationSchema = exports.insertLearningContentItemSchema = exports.insertLearningEnrollmentSchema = exports.insertLearningOfferingSchema = exports.insertLearningCourseSchema = exports.hrmLearningCommunities = exports.hrmLearningAssessmentAttempts = exports.hrmLearningAssessmentQuestions = exports.hrmLearningAssessments = exports.hrmLearningCurriculumMembers = exports.hrmLearningCurricula = exports.hrmLearningAuditLogs = exports.hrmLearningCertifications = exports.hrmLearningEnrollments = exports.hrmLearningOfferings = exports.hrmLearningContentItems = exports.hrmLearningCourses = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_worker_1 = require("./hr_worker");
// ========== LEARNING MODULE ==========
// 1. COURSES (The Catalog Item)
exports.hrmLearningCourses = (0, pg_core_1.pgTable)("hrm_learning_courses", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    // Categorization
    category: (0, pg_core_1.varchar)("category"), // e.g. "Compliance", "Technical", "Leadership"
    provider: (0, pg_core_1.varchar)("provider"), // e.g. "Internal", "Udemy", "LinkedIn"
    communityId: (0, pg_core_1.varchar)("community_id").references(() => exports.hrmLearningCommunities.id),
    durationMinutes: (0, pg_core_1.integer)("duration_minutes"),
    // Compliance & Validity
    validityMonths: (0, pg_core_1.integer)("validity_months"), // e.g. 12 for annual compliance
    renewalRule: (0, pg_core_1.varchar)("renewal_rule"), // e.g. "FIXED_DATE", "ROLLING_FROM_COMPLETION"
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"), // ACTIVE, ARCHIVED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 1.1 CONTENT ITEMS (SCORM, Video, PDF modules)
exports.hrmLearningContentItems = (0, pg_core_1.pgTable)("hrm_learning_content_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // SCORM_12, VIDEO, PDF, LINK
    url: (0, pg_core_1.text)("url"), // Path to file or external link
    launchData: (0, pg_core_1.text)("launch_data"), // specialized launch params
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. OFFERINGS (Specific Instances/Classes of a Course)
exports.hrmLearningOfferings = (0, pg_core_1.pgTable)("hrm_learning_offerings", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    courseId: (0, pg_core_1.varchar)("course_id").notNull().references(() => exports.hrmLearningCourses.id),
    title: (0, pg_core_1.varchar)("title").notNull(), // e.g. "Q1 2026 Session"
    type: (0, pg_core_1.varchar)("type").default("SELF_PACED"), // SELF_PACED, INSTRUCTOR_LED, BLENDED
    startDate: (0, pg_core_1.date)("start_date"),
    endDate: (0, pg_core_1.date)("end_date"),
    instructorId: (0, pg_core_1.varchar)("instructor_id").references(() => hr_worker_1.hrPersons.id),
    location: (0, pg_core_1.varchar)("location"), // e.g. "Room 304" or URL
    capacity: (0, pg_core_1.integer)("capacity"),
    enrolledCount: (0, pg_core_1.integer)("enrolled_count").default(0),
    // Financials
    price: (0, pg_core_1.numeric)("price").default("0"),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. ENROLLMENTS (Learner Records)
exports.hrmLearningEnrollments = (0, pg_core_1.pgTable)("hrm_learning_enrollments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    offeringId: (0, pg_core_1.varchar)("offering_id").notNull().references(() => exports.hrmLearningOfferings.id),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id),
    status: (0, pg_core_1.varchar)("status").default("ENROLLED"), // ENROLLED, IN_PROGRESS, COMPLETED, DROPPED, WAITLISTED
    progressPercent: (0, pg_core_1.integer)("progress_percent").default(0),
    score: (0, pg_core_1.integer)("score"),
    completionDate: (0, pg_core_1.date)("completion_date"),
    certificateUrl: (0, pg_core_1.text)("certificate_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. CERTIFICATIONS (Compliance Programs)
exports.hrmLearningCertifications = (0, pg_core_1.pgTable)("hrm_learning_certifications", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    validityPeriodDays: (0, pg_core_1.integer)("validity_period_days"),
    renewalWindowDays: (0, pg_core_1.integer)("renewal_window_days"), // Can renew X days before expiry
    ownerId: (0, pg_core_1.varchar)("owner_id").references(() => hr_worker_1.hrPersons.id), // Compliance Owner
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 5. AUDIT LOGS
exports.hrmLearningAuditLogs = (0, pg_core_1.pgTable)("hrm_learning_audit_logs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(), // ENROLLMENT, COURSE
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    action: (0, pg_core_1.varchar)("action").notNull(), // UPDATE, CREATE, AUTO_RENEWAL
    previousValue: (0, pg_core_1.text)("previous_value"),
    newValue: (0, pg_core_1.text)("new_value"),
    actorId: (0, pg_core_1.varchar)("actor_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 6. CURRICULA (Learning Paths)
exports.hrmLearningCurricula = (0, pg_core_1.pgTable)("hrm_learning_curricula", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    provider: (0, pg_core_1.varchar)("provider").default("Internal"),
    category: (0, pg_core_1.varchar)("category"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrmLearningCurriculumMembers = (0, pg_core_1.pgTable)("hrm_learning_curriculum_members", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    curriculumId: (0, pg_core_1.varchar)("curriculum_id").notNull().references(() => exports.hrmLearningCurricula.id),
    courseId: (0, pg_core_1.varchar)("course_id").notNull().references(() => exports.hrmLearningCourses.id),
    sequenceOrder: (0, pg_core_1.integer)("sequence_order").default(0),
    isRequired: (0, pg_core_1.boolean)("is_required").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 7. ASSESSMENTS
exports.hrmLearningAssessments = (0, pg_core_1.pgTable)("hrm_learning_assessments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    passingScore: (0, pg_core_1.integer)("passing_score").default(80),
    maxAttempts: (0, pg_core_1.integer)("max_attempts").default(3),
    timeLimitMinutes: (0, pg_core_1.integer)("time_limit_minutes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrmLearningAssessmentQuestions = (0, pg_core_1.pgTable)("hrm_learning_assessment_questions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    assessmentId: (0, pg_core_1.varchar)("assessment_id").notNull().references(() => exports.hrmLearningAssessments.id),
    text: (0, pg_core_1.text)("text").notNull(),
    type: (0, pg_core_1.varchar)("type").default("MULTIPLE_CHOICE"),
    options: (0, pg_core_1.jsonb)("options"), // [{id: "1", text: "A"}]
    correctAnswer: (0, pg_core_1.varchar)("correct_answer"),
    points: (0, pg_core_1.integer)("points").default(10),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrmLearningAssessmentAttempts = (0, pg_core_1.pgTable)("hrm_learning_assessment_attempts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    enrollmentId: (0, pg_core_1.varchar)("enrollment_id").notNull().references(() => exports.hrmLearningEnrollments.id),
    assessmentId: (0, pg_core_1.varchar)("assessment_id").notNull().references(() => exports.hrmLearningAssessments.id),
    score: (0, pg_core_1.integer)("score"),
    passed: (0, pg_core_1.boolean)("passed"),
    answers: (0, pg_core_1.jsonb)("answers"),
    startedAt: (0, pg_core_1.timestamp)("started_at").default((0, drizzle_orm_1.sql) `now()`),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
});
// 8. COMMUNITIES (Catalog Hierarchy)
exports.hrmLearningCommunities = (0, pg_core_1.pgTable)("hrm_learning_communities", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    parentId: (0, pg_core_1.varchar)("parent_id").references(() => exports.hrmLearningCommunities.id),
    path: (0, pg_core_1.text)("path"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// SCHEMAS
exports.insertLearningCourseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmLearningCourses);
exports.insertLearningOfferingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmLearningOfferings);
exports.insertLearningEnrollmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmLearningEnrollments);
exports.insertLearningContentItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmLearningContentItems);
exports.insertLearningCertificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmLearningCertifications);
exports.insertLearningAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmLearningAuditLogs);
exports.insertLearningCurriculumSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmLearningCurricula);
exports.insertLearningAssessmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmLearningAssessments);
exports.insertLearningCommunitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrmLearningCommunities);
//# sourceMappingURL=talent_learning.js.map