import { z } from "zod";
export declare const educationStudents: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "education_students";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "education_students";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "education_students";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        studentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "student_id";
            tableName: "education_students";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        firstName: import("drizzle-orm/pg-core").PgColumn<{
            name: "first_name";
            tableName: "education_students";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        lastName: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_name";
            tableName: "education_students";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        email: import("drizzle-orm/pg-core").PgColumn<{
            name: "email";
            tableName: "education_students";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        enrollmentDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "enrollment_date";
            tableName: "education_students";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "education_students";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "education_students";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertEducationStudentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    tenantId: z.ZodString;
    studentId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    enrollmentDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    tenantId: string;
    studentId: string;
    id?: string | undefined;
    email?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    enrollmentDate?: Date | null | undefined;
}, {
    firstName: string;
    lastName: string;
    tenantId: string;
    studentId: string;
    id?: string | undefined;
    email?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    enrollmentDate?: Date | null | undefined;
}>;
export type InsertEducationStudent = z.infer<typeof insertEducationStudentSchema>;
export type EducationStudent = typeof educationStudents.$inferSelect;
export declare const educationCourses: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "education_courses";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "education_courses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "education_courses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        courseId: import("drizzle-orm/pg-core").PgColumn<{
            name: "course_id";
            tableName: "education_courses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        courseName: import("drizzle-orm/pg-core").PgColumn<{
            name: "course_name";
            tableName: "education_courses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "education_courses";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        instructor: import("drizzle-orm/pg-core").PgColumn<{
            name: "instructor";
            tableName: "education_courses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        credits: import("drizzle-orm/pg-core").PgColumn<{
            name: "credits";
            tableName: "education_courses";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "education_courses";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertEducationCourseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    tenantId: z.ZodString;
    courseId: z.ZodString;
    courseName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    instructor: z.ZodOptional<z.ZodString>;
    credits: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    courseId: string;
    courseName: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    instructor?: string | undefined;
    credits?: number | undefined;
}, {
    tenantId: string;
    courseId: string;
    courseName: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    instructor?: string | undefined;
    credits?: number | undefined;
}>;
export type InsertEducationCourse = z.infer<typeof insertEducationCourseSchema>;
export type EducationCourse = typeof educationCourses.$inferSelect;
export declare const educationEnrollments: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "education_enrollments";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "education_enrollments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "education_enrollments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        studentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "student_id";
            tableName: "education_enrollments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        courseId: import("drizzle-orm/pg-core").PgColumn<{
            name: "course_id";
            tableName: "education_enrollments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        enrollmentDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "enrollment_date";
            tableName: "education_enrollments";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "education_enrollments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        grade: import("drizzle-orm/pg-core").PgColumn<{
            name: "grade";
            tableName: "education_enrollments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "education_enrollments";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertEducationEnrollmentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    tenantId: z.ZodString;
    studentId: z.ZodString;
    courseId: z.ZodString;
    enrollmentDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    status: z.ZodOptional<z.ZodString>;
    grade: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    studentId: string;
    courseId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    enrollmentDate?: Date | null | undefined;
    grade?: string | undefined;
}, {
    tenantId: string;
    studentId: string;
    courseId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    enrollmentDate?: Date | null | undefined;
    grade?: string | undefined;
}>;
export type InsertEducationEnrollment = z.infer<typeof insertEducationEnrollmentSchema>;
export type EducationEnrollment = typeof educationEnrollments.$inferSelect;
export declare const educationAssignments: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "education_assignments";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "education_assignments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "education_assignments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        assignmentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "assignment_id";
            tableName: "education_assignments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        courseId: import("drizzle-orm/pg-core").PgColumn<{
            name: "course_id";
            tableName: "education_assignments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        title: import("drizzle-orm/pg-core").PgColumn<{
            name: "title";
            tableName: "education_assignments";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "education_assignments";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        dueDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "due_date";
            tableName: "education_assignments";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "education_assignments";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertEducationAssignmentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    tenantId: z.ZodString;
    assignmentId: z.ZodString;
    courseId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    title: string;
    courseId: string;
    assignmentId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    dueDate?: Date | null | undefined;
}, {
    tenantId: string;
    title: string;
    courseId: string;
    assignmentId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    dueDate?: Date | null | undefined;
}>;
export type InsertEducationAssignment = z.infer<typeof insertEducationAssignmentSchema>;
export type EducationAssignment = typeof educationAssignments.$inferSelect;
export declare const educationGrades: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "education_grades";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "education_grades";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "education_grades";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        studentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "student_id";
            tableName: "education_grades";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        courseId: import("drizzle-orm/pg-core").PgColumn<{
            name: "course_id";
            tableName: "education_grades";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        score: import("drizzle-orm/pg-core").PgColumn<{
            name: "score";
            tableName: "education_grades";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        grade: import("drizzle-orm/pg-core").PgColumn<{
            name: "grade";
            tableName: "education_grades";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        gradeDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "grade_date";
            tableName: "education_grades";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "education_grades";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertEducationGradeSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    tenantId: z.ZodString;
    studentId: z.ZodString;
    courseId: z.ZodString;
    score: z.ZodOptional<z.ZodNumber>;
    grade: z.ZodOptional<z.ZodString>;
    gradeDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    studentId: string;
    courseId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    score?: number | undefined;
    grade?: string | undefined;
    gradeDate?: Date | null | undefined;
}, {
    tenantId: string;
    studentId: string;
    courseId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    score?: number | undefined;
    grade?: string | undefined;
    gradeDate?: Date | null | undefined;
}>;
export type InsertEducationGrade = z.infer<typeof insertEducationGradeSchema>;
export type EducationGrade = typeof educationGrades.$inferSelect;
export declare const educationBilling: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "education_billing";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "education_billing";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "education_billing";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        invoiceId: import("drizzle-orm/pg-core").PgColumn<{
            name: "invoice_id";
            tableName: "education_billing";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        studentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "student_id";
            tableName: "education_billing";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        amount: import("drizzle-orm/pg-core").PgColumn<{
            name: "amount";
            tableName: "education_billing";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        dueDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "due_date";
            tableName: "education_billing";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "education_billing";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "education_billing";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertEducationBillingSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    tenantId: z.ZodString;
    invoiceId: z.ZodString;
    studentId: z.ZodString;
    amount: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    invoiceId: string;
    studentId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    dueDate?: Date | null | undefined;
    amount?: string | undefined;
}, {
    tenantId: string;
    invoiceId: string;
    studentId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    dueDate?: Date | null | undefined;
    amount?: string | undefined;
}>;
export type InsertEducationBilling = z.infer<typeof insertEducationBillingSchema>;
export type EducationBilling = typeof educationBilling.$inferSelect;
export declare const educationEvents: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "education_events";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "education_events";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "education_events";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        eventId: import("drizzle-orm/pg-core").PgColumn<{
            name: "event_id";
            tableName: "education_events";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        eventName: import("drizzle-orm/pg-core").PgColumn<{
            name: "event_name";
            tableName: "education_events";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        eventDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "event_date";
            tableName: "education_events";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        capacity: import("drizzle-orm/pg-core").PgColumn<{
            name: "capacity";
            tableName: "education_events";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "education_events";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "education_events";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertEducationEventSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    tenantId: z.ZodString;
    eventId: z.ZodString;
    eventName: z.ZodString;
    eventDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    capacity: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    eventId: string;
    eventName: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    capacity?: number | undefined;
    eventDate?: Date | null | undefined;
}, {
    tenantId: string;
    eventId: string;
    eventName: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    capacity?: number | undefined;
    eventDate?: Date | null | undefined;
}>;
export type InsertEducationEvent = z.infer<typeof insertEducationEventSchema>;
export type EducationEvent = typeof educationEvents.$inferSelect;
export declare const educationAttendance: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "education_attendance";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "education_attendance";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "education_attendance";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        studentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "student_id";
            tableName: "education_attendance";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        courseId: import("drizzle-orm/pg-core").PgColumn<{
            name: "course_id";
            tableName: "education_attendance";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        attendanceDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "attendance_date";
            tableName: "education_attendance";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "education_attendance";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "education_attendance";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertEducationAttendanceSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    tenantId: z.ZodString;
    studentId: z.ZodString;
    courseId: z.ZodOptional<z.ZodString>;
    attendanceDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    studentId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    courseId?: string | undefined;
    attendanceDate?: Date | null | undefined;
}, {
    tenantId: string;
    studentId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    courseId?: string | undefined;
    attendanceDate?: Date | null | undefined;
}>;
export type InsertEducationAttendance = z.infer<typeof insertEducationAttendanceSchema>;
export type EducationAttendance = typeof educationAttendance.$inferSelect;
//# sourceMappingURL=education.d.ts.map