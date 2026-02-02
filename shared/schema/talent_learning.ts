import { pgTable, varchar, timestamp, boolean, integer, date, text, jsonb } from "drizzle-orm/pg-core";
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

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 3. ENROLLMENTS (Learner Records)
export const hrmLearningEnrollments = pgTable("hrm_learning_enrollments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

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

// SCHEMAS
export const insertLearningCourseSchema = createInsertSchema(hrmLearningCourses);
export const insertLearningOfferingSchema = createInsertSchema(hrmLearningOfferings);
export const insertLearningEnrollmentSchema = createInsertSchema(hrmLearningEnrollments);
export const insertLearningContentItemSchema = createInsertSchema(hrmLearningContentItems);
export const insertLearningCertificationSchema = createInsertSchema(hrmLearningCertifications);
export const insertLearningAuditLogSchema = createInsertSchema(hrmLearningAuditLogs);

export type LearningCourse = typeof hrmLearningCourses.$inferSelect;
export type LearningOffering = typeof hrmLearningOfferings.$inferSelect;
export type LearningEnrollment = typeof hrmLearningEnrollments.$inferSelect;
export type LearningContentItem = typeof hrmLearningContentItems.$inferSelect;
export type LearningCertification = typeof hrmLearningCertifications.$inferSelect;
export type LearningAuditLog = typeof hrmLearningAuditLogs.$inferSelect;
