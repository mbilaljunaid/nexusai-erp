import { pgTable, varchar, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== EDUCATION MODULE ==========
export const educationStudents = pgTable("education_students", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    studentId: varchar("student_id").notNull().unique(),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    email: varchar("email"),
    enrollmentDate: timestamp("enrollment_date"),
    status: varchar("status").default("ACTIVE"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEducationStudentSchema = createInsertSchema(educationStudents).omit({ id: true, createdAt: true }).extend({
    tenantId: z.string().min(1),
    studentId: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional(),
    enrollmentDate: z.date().optional().nullable(),
    status: z.string().optional(),
});

export type InsertEducationStudent = z.infer<typeof insertEducationStudentSchema>;
export type EducationStudent = typeof educationStudents.$inferSelect;

export const educationCourses = pgTable("education_courses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    courseId: varchar("course_id").notNull().unique(),
    courseName: varchar("course_name").notNull(),
    description: text("description"),
    instructor: varchar("instructor"),
    credits: integer("credits"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEducationCourseSchema = createInsertSchema(educationCourses).omit({ id: true, createdAt: true }).extend({
    tenantId: z.string().min(1),
    courseId: z.string().min(1),
    courseName: z.string().min(1),
    description: z.string().optional(),
    instructor: z.string().optional(),
    credits: z.number().optional(),
});

export type InsertEducationCourse = z.infer<typeof insertEducationCourseSchema>;
export type EducationCourse = typeof educationCourses.$inferSelect;

export const educationEnrollments = pgTable("education_enrollments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    studentId: varchar("student_id").notNull(),
    courseId: varchar("course_id").notNull(),
    enrollmentDate: timestamp("enrollment_date"),
    status: varchar("status").default("ENROLLED"),
    grade: varchar("grade"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEducationEnrollmentSchema = createInsertSchema(educationEnrollments).omit({ id: true, createdAt: true }).extend({
    tenantId: z.string().min(1),
    studentId: z.string().min(1),
    courseId: z.string().min(1),
    enrollmentDate: z.date().optional().nullable(),
    status: z.string().optional(),
    grade: z.string().optional(),
});

export type InsertEducationEnrollment = z.infer<typeof insertEducationEnrollmentSchema>;
export type EducationEnrollment = typeof educationEnrollments.$inferSelect;

export const educationAssignments = pgTable("education_assignments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    assignmentId: varchar("assignment_id").notNull().unique(),
    courseId: varchar("course_id").notNull(),
    title: varchar("title").notNull(),
    description: text("description"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEducationAssignmentSchema = createInsertSchema(educationAssignments).omit({ id: true, createdAt: true }).extend({
    tenantId: z.string().min(1),
    assignmentId: z.string().min(1),
    courseId: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.date().optional().nullable(),
});

export type InsertEducationAssignment = z.infer<typeof insertEducationAssignmentSchema>;
export type EducationAssignment = typeof educationAssignments.$inferSelect;

export const educationGrades = pgTable("education_grades", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    studentId: varchar("student_id").notNull(),
    courseId: varchar("course_id").notNull(),
    score: integer("score"),
    grade: varchar("grade"),
    gradeDate: timestamp("grade_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEducationGradeSchema = createInsertSchema(educationGrades).omit({ id: true, createdAt: true }).extend({
    tenantId: z.string().min(1),
    studentId: z.string().min(1),
    courseId: z.string().min(1),
    score: z.number().optional(),
    grade: z.string().optional(),
    gradeDate: z.date().optional().nullable(),
});

export type InsertEducationGrade = z.infer<typeof insertEducationGradeSchema>;
export type EducationGrade = typeof educationGrades.$inferSelect;

export const educationBilling = pgTable("education_billing", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    invoiceId: varchar("invoice_id").notNull().unique(),
    studentId: varchar("student_id").notNull(),
    amount: numeric("amount"),
    dueDate: timestamp("due_date"),
    status: varchar("status").default("PENDING"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEducationBillingSchema = createInsertSchema(educationBilling).omit({ id: true, createdAt: true }).extend({
    tenantId: z.string().min(1),
    invoiceId: z.string().min(1),
    studentId: z.string().min(1),
    amount: z.string().optional(),
    dueDate: z.date().optional().nullable(),
    status: z.string().optional(),
});

export type InsertEducationBilling = z.infer<typeof insertEducationBillingSchema>;
export type EducationBilling = typeof educationBilling.$inferSelect;

export const educationEvents = pgTable("education_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    eventId: varchar("event_id").notNull().unique(),
    eventName: varchar("event_name").notNull(),
    eventDate: timestamp("event_date"),
    capacity: integer("capacity"),
    status: varchar("status").default("SCHEDULED"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEducationEventSchema = createInsertSchema(educationEvents).omit({ id: true, createdAt: true }).extend({
    tenantId: z.string().min(1),
    eventId: z.string().min(1),
    eventName: z.string().min(1),
    eventDate: z.date().optional().nullable(),
    capacity: z.number().optional(),
    status: z.string().optional(),
});

export type InsertEducationEvent = z.infer<typeof insertEducationEventSchema>;
export type EducationEvent = typeof educationEvents.$inferSelect;

export const educationAttendance = pgTable("education_attendance", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    studentId: varchar("student_id").notNull(),
    courseId: varchar("course_id"),
    attendanceDate: timestamp("attendance_date"),
    status: varchar("status").default("PRESENT"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEducationAttendanceSchema = createInsertSchema(educationAttendance).omit({ id: true, createdAt: true }).extend({
    tenantId: z.string().min(1),
    studentId: z.string().min(1),
    courseId: z.string().optional(),
    attendanceDate: z.date().optional().nullable(),
    status: z.string().optional(),
});

export type InsertEducationAttendance = z.infer<typeof insertEducationAttendanceSchema>;
export type EducationAttendance = typeof educationAttendance.$inferSelect;
