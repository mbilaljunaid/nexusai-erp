import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export enum StudentStatus {
    APPLICANT = 'APPLICANT',
    ACTIVE = 'ACTIVE',
    PROBATION = 'PROBATION',
    GRADUATED = 'GRADUATED',
    WITHDRAWN = 'WITHDRAWN',
}

export const StudentSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    dateOfBirth: z.string().datetime(),
    status: z.nativeEnum(StudentStatus),
    major: z.string().optional(),
    gpa: z.number().min(0).max(4.0).optional(),
});

export type Student = z.infer<typeof StudentSchema>;

export const CourseSchema = z.object({
    id: z.string().uuid(),
    code: z.string(), // "CS101"
    name: z.string(),
    credits: z.number().min(0),
    departmentId: z.string().uuid(),
    prerequisites: z.array(z.string().uuid()).optional(), // List of CourseIDs
});

export type Course = z.infer<typeof CourseSchema>;

export const SectionSchema = z.object({
    id: z.string().uuid(),
    courseId: z.string().uuid(),
    termId: z.string().uuid(), // "Fall 2025"
    facultyId: z.string().uuid(),
    schedule: z.string(), // "Mon/Wed 10:00-11:30"
    capacity: z.number().int().positive(),
    enrolledCount: z.number().int().default(0),
    roomId: z.string().uuid(),
});

export type Section = z.infer<typeof SectionSchema>;

// --- AI ACTION SCHEMAS ---

// Action: PREDICT_DROPOUT_RISK
export const PredictDropoutRiskSchema = z.object({
    action: z.literal('PREDICT_DROPOUT_RISK'),
    entity: z.literal('Student'),
    params: z.object({
        studentId: z.string(),
        riskFactors: z.array(z.string()), // ["Low Attendance", "Failed Midterm"]
    }),
    preconditions: z.array(z.string()).default(['student_active']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
});

export type PredictDropoutRiskAction = z.infer<typeof PredictDropoutRiskSchema>;

// Action: OPTIMIZE_COURSE_SCHEDULE
export const OptimizeCourseScheduleSchema = z.object({
    action: z.literal('OPTIMIZE_COURSE_SCHEDULE'),
    entity: z.literal('TermSchedule'),
    params: z.object({
        termId: z.string(),
        optimizationGoal: z.enum(['MAX_SEATS', 'MIN_CONFLICTS', 'FACULTY_PREF']),
    }),
    preconditions: z.array(z.string()).default(['courses_planned', 'rooms_available']),
    requiresApproval: z.literal(true), // Registrar must approve
    auditLog: z.literal(true),
    reversible: z.literal(true),
});

export type OptimizeCourseScheduleAction = z.infer<typeof OptimizeCourseScheduleSchema>;
