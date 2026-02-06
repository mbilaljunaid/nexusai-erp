"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertEducationAttendanceSchema = exports.educationAttendance = exports.insertEducationEventSchema = exports.educationEvents = exports.insertEducationBillingSchema = exports.educationBilling = exports.insertEducationGradeSchema = exports.educationGrades = exports.insertEducationAssignmentSchema = exports.educationAssignments = exports.insertEducationEnrollmentSchema = exports.educationEnrollments = exports.insertEducationCourseSchema = exports.educationCourses = exports.insertEducationStudentSchema = exports.educationStudents = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== EDUCATION MODULE ==========
exports.educationStudents = (0, pg_core_1.pgTable)("education_students", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    studentId: (0, pg_core_1.varchar)("student_id").notNull().unique(),
    firstName: (0, pg_core_1.varchar)("first_name").notNull(),
    lastName: (0, pg_core_1.varchar)("last_name").notNull(),
    email: (0, pg_core_1.varchar)("email"),
    enrollmentDate: (0, pg_core_1.timestamp)("enrollment_date"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEducationStudentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.educationStudents).extend({
    tenantId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    enrollmentDate: zod_1.z.date().optional().nullable(),
    status: zod_1.z.string().optional(),
});
exports.educationCourses = (0, pg_core_1.pgTable)("education_courses", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    courseId: (0, pg_core_1.varchar)("course_id").notNull().unique(),
    courseName: (0, pg_core_1.varchar)("course_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    instructor: (0, pg_core_1.varchar)("instructor"),
    credits: (0, pg_core_1.integer)("credits"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEducationCourseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.educationCourses).extend({
    tenantId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().min(1),
    courseName: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    instructor: zod_1.z.string().optional(),
    credits: zod_1.z.number().optional(),
});
exports.educationEnrollments = (0, pg_core_1.pgTable)("education_enrollments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    studentId: (0, pg_core_1.varchar)("student_id").notNull(),
    courseId: (0, pg_core_1.varchar)("course_id").notNull(),
    enrollmentDate: (0, pg_core_1.timestamp)("enrollment_date"),
    status: (0, pg_core_1.varchar)("status").default("ENROLLED"),
    grade: (0, pg_core_1.varchar)("grade"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEducationEnrollmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.educationEnrollments).extend({
    tenantId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().min(1),
    enrollmentDate: zod_1.z.date().optional().nullable(),
    status: zod_1.z.string().optional(),
    grade: zod_1.z.string().optional(),
});
exports.educationAssignments = (0, pg_core_1.pgTable)("education_assignments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    assignmentId: (0, pg_core_1.varchar)("assignment_id").notNull().unique(),
    courseId: (0, pg_core_1.varchar)("course_id").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEducationAssignmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.educationAssignments).extend({
    tenantId: zod_1.z.string().min(1),
    assignmentId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.date().optional().nullable(),
});
exports.educationGrades = (0, pg_core_1.pgTable)("education_grades", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    studentId: (0, pg_core_1.varchar)("student_id").notNull(),
    courseId: (0, pg_core_1.varchar)("course_id").notNull(),
    score: (0, pg_core_1.integer)("score"),
    grade: (0, pg_core_1.varchar)("grade"),
    gradeDate: (0, pg_core_1.timestamp)("grade_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEducationGradeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.educationGrades).extend({
    tenantId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().min(1),
    score: zod_1.z.number().optional(),
    grade: zod_1.z.string().optional(),
    gradeDate: zod_1.z.date().optional().nullable(),
});
exports.educationBilling = (0, pg_core_1.pgTable)("education_billing", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    invoiceId: (0, pg_core_1.varchar)("invoice_id").notNull().unique(),
    studentId: (0, pg_core_1.varchar)("student_id").notNull(),
    amount: (0, pg_core_1.numeric)("amount"),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    status: (0, pg_core_1.varchar)("status").default("PENDING"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEducationBillingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.educationBilling).extend({
    tenantId: zod_1.z.string().min(1),
    invoiceId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    amount: zod_1.z.string().optional(),
    dueDate: zod_1.z.date().optional().nullable(),
    status: zod_1.z.string().optional(),
});
exports.educationEvents = (0, pg_core_1.pgTable)("education_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    eventId: (0, pg_core_1.varchar)("event_id").notNull().unique(),
    eventName: (0, pg_core_1.varchar)("event_name").notNull(),
    eventDate: (0, pg_core_1.timestamp)("event_date"),
    capacity: (0, pg_core_1.integer)("capacity"),
    status: (0, pg_core_1.varchar)("status").default("SCHEDULED"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEducationEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.educationEvents).extend({
    tenantId: zod_1.z.string().min(1),
    eventId: zod_1.z.string().min(1),
    eventName: zod_1.z.string().min(1),
    eventDate: zod_1.z.date().optional().nullable(),
    capacity: zod_1.z.number().optional(),
    status: zod_1.z.string().optional(),
});
exports.educationAttendance = (0, pg_core_1.pgTable)("education_attendance", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    studentId: (0, pg_core_1.varchar)("student_id").notNull(),
    courseId: (0, pg_core_1.varchar)("course_id"),
    attendanceDate: (0, pg_core_1.timestamp)("attendance_date"),
    status: (0, pg_core_1.varchar)("status").default("PRESENT"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEducationAttendanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.educationAttendance).extend({
    tenantId: zod_1.z.string().min(1),
    studentId: zod_1.z.string().min(1),
    courseId: zod_1.z.string().optional(),
    attendanceDate: zod_1.z.date().optional().nullable(),
    status: zod_1.z.string().optional(),
});
//# sourceMappingURL=education.js.map