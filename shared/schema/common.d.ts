import { z } from "zod";
export declare const sessions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "sessions";
    schema: undefined;
    columns: {
        sid: import("drizzle-orm/pg-core").PgColumn<{
            name: "sid";
            tableName: "sessions";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
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
        sess: import("drizzle-orm/pg-core").PgColumn<{
            name: "sess";
            tableName: "sessions";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        expire: import("drizzle-orm/pg-core").PgColumn<{
            name: "expire";
            tableName: "sessions";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
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
export declare const users: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "users";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "users";
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
        email: import("drizzle-orm/pg-core").PgColumn<{
            name: "email";
            tableName: "users";
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
        password: import("drizzle-orm/pg-core").PgColumn<{
            name: "password";
            tableName: "users";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "users";
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
        firstName: import("drizzle-orm/pg-core").PgColumn<{
            name: "first_name";
            tableName: "users";
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
        lastName: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_name";
            tableName: "users";
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
        profileImageUrl: import("drizzle-orm/pg-core").PgColumn<{
            name: "profile_image_url";
            tableName: "users";
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
        role: import("drizzle-orm/pg-core").PgColumn<{
            name: "role";
            tableName: "users";
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
        tenantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tenant_id";
            tableName: "users";
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
        permissions: import("drizzle-orm/pg-core").PgColumn<{
            name: "permissions";
            tableName: "users";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
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
            tableName: "users";
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
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "users";
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
export declare const insertUserSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    email: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    firstName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    profileImageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    role: z.ZodOptional<z.ZodString>;
    tenantId: z.ZodOptional<z.ZodString>;
    permissions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    profileImageUrl?: string | null | undefined;
    role?: string | undefined;
    tenantId?: string | undefined;
    permissions?: Record<string, any> | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}, {
    id?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;
    password?: string | undefined;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    profileImageUrl?: string | null | undefined;
    role?: string | undefined;
    tenantId?: string | undefined;
    permissions?: Record<string, any> | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
}>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpsertUser = {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
    tenantId?: string | null;
};
export declare const projects: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "projects";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "projects";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "projects";
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
            tableName: "projects";
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
        ownerId: import("drizzle-orm/pg-core").PgColumn<{
            name: "owner_id";
            tableName: "projects";
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "projects";
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
export declare const insertProjectSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ownerId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    ownerId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | null | undefined;
}, {
    name: string;
    ownerId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | null | undefined;
}>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export declare const formData: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "form_data";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "form_data";
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
        formId: import("drizzle-orm/pg-core").PgColumn<{
            name: "form_id";
            tableName: "form_data";
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
        data: import("drizzle-orm/pg-core").PgColumn<{
            name: "data";
            tableName: "form_data";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: true;
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
            tableName: "form_data";
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
        submittedBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "submitted_by";
            tableName: "form_data";
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
        submittedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "submitted_at";
            tableName: "form_data";
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
            tableName: "form_data";
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
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "form_data";
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
export declare const insertFormDataSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    formId: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    status: z.ZodOptional<z.ZodString>;
    submittedBy: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    submittedAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    data: Record<string, any>;
    formId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | undefined;
    submittedBy?: string | null | undefined;
    submittedAt?: Date | null | undefined;
}, {
    data: Record<string, any>;
    formId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | undefined;
    submittedBy?: string | null | undefined;
    submittedAt?: Date | null | undefined;
}>;
export type InsertFormData = z.infer<typeof insertFormDataSchema>;
export type FormDataRecord = typeof formData.$inferSelect;
export declare const demos: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "demos";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "demos";
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
        email: import("drizzle-orm/pg-core").PgColumn<{
            name: "email";
            tableName: "demos";
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
        company: import("drizzle-orm/pg-core").PgColumn<{
            name: "company";
            tableName: "demos";
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
        industry: import("drizzle-orm/pg-core").PgColumn<{
            name: "industry";
            tableName: "demos";
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
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "demos";
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
        demoToken: import("drizzle-orm/pg-core").PgColumn<{
            name: "demo_token";
            tableName: "demos";
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
            tableName: "demos";
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
        expiresAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "expires_at";
            tableName: "demos";
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
    };
    dialect: "pg";
}>;
export declare const insertDemoSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    demoToken: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    email: z.ZodString;
    company: z.ZodString;
    industry: z.ZodString;
    status: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    company: string;
    industry: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    demoToken?: string | null | undefined;
    expiresAt?: Date | null | undefined;
}, {
    email: string;
    company: string;
    industry: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    demoToken?: string | null | undefined;
    expiresAt?: Date | null | undefined;
}>;
export type InsertDemo = z.infer<typeof insertDemoSchema>;
export type Demo = typeof demos.$inferSelect;
export declare const contactSubmissions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "contact_submissions";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "contact_submissions";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "contact_submissions";
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
            tableName: "contact_submissions";
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
        company: import("drizzle-orm/pg-core").PgColumn<{
            name: "company";
            tableName: "contact_submissions";
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
        subject: import("drizzle-orm/pg-core").PgColumn<{
            name: "subject";
            tableName: "contact_submissions";
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
        message: import("drizzle-orm/pg-core").PgColumn<{
            name: "message";
            tableName: "contact_submissions";
            dataType: "string";
            columnType: "PgText";
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
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "contact_submissions";
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
            tableName: "contact_submissions";
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
export declare const insertContactSubmissionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    name: z.ZodString;
    email: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    subject: z.ZodString;
    message: z.ZodString;
    status: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    message: string;
    subject: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    company?: string | undefined;
}, {
    name: string;
    email: string;
    message: string;
    subject: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    status?: string | undefined;
    company?: string | undefined;
}>;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export declare const userFeedback: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "user_feedback";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "user_feedback";
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
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "user_feedback";
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
        type: import("drizzle-orm/pg-core").PgColumn<{
            name: "type";
            tableName: "user_feedback";
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
        category: import("drizzle-orm/pg-core").PgColumn<{
            name: "category";
            tableName: "user_feedback";
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
        title: import("drizzle-orm/pg-core").PgColumn<{
            name: "title";
            tableName: "user_feedback";
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
            tableName: "user_feedback";
            dataType: "string";
            columnType: "PgText";
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
        }, {}, {}>;
        priority: import("drizzle-orm/pg-core").PgColumn<{
            name: "priority";
            tableName: "user_feedback";
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
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "user_feedback";
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
        attachmentUrl: import("drizzle-orm/pg-core").PgColumn<{
            name: "attachment_url";
            tableName: "user_feedback";
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
            tableName: "user_feedback";
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
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "user_feedback";
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
export declare const insertUserFeedbackSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    userId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["suggestion", "bug", "feature", "other"]>;
    category: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodString;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    status: z.ZodOptional<z.ZodString>;
    attachmentUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "suggestion" | "bug" | "feature" | "other";
    description: string;
    title: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | undefined;
    userId?: string | undefined;
    category?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    attachmentUrl?: string | undefined;
}, {
    type: "suggestion" | "bug" | "feature" | "other";
    description: string;
    title: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | undefined;
    userId?: string | undefined;
    category?: string | undefined;
    priority?: "low" | "medium" | "high" | "critical" | undefined;
    attachmentUrl?: string | undefined;
}>;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;
export declare const tenants: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "tenants";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "tenants";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "tenants";
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
        slug: import("drizzle-orm/pg-core").PgColumn<{
            name: "slug";
            tableName: "tenants";
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
            tableName: "tenants";
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
        logoUrl: import("drizzle-orm/pg-core").PgColumn<{
            name: "logo_url";
            tableName: "tenants";
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
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "tenants";
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
        settings: import("drizzle-orm/pg-core").PgColumn<{
            name: "settings";
            tableName: "tenants";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
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
            tableName: "tenants";
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
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "tenants";
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
export declare const insertTenantSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: "active" | "inactive" | "suspended" | undefined;
    description?: string | undefined;
    logoUrl?: string | undefined;
    settings?: Record<string, any> | undefined;
}, {
    name: string;
    slug: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: "active" | "inactive" | "suspended" | undefined;
    description?: string | undefined;
    logoUrl?: string | undefined;
    settings?: Record<string, any> | undefined;
}>;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;
export declare const industries: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "industries";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "industries";
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
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "industries";
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
        slug: import("drizzle-orm/pg-core").PgColumn<{
            name: "slug";
            tableName: "industries";
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
            tableName: "industries";
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
        icon: import("drizzle-orm/pg-core").PgColumn<{
            name: "icon";
            tableName: "industries";
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
        defaultModules: import("drizzle-orm/pg-core").PgColumn<{
            name: "default_modules";
            tableName: "industries";
            dataType: "array";
            columnType: "PgArray";
            data: string[];
            driverParam: string | string[];
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: import("drizzle-orm").Column<{
                name: "default_modules";
                tableName: "industries";
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
            identity: undefined;
            generated: undefined;
        }, {}, {
            baseBuilder: import("drizzle-orm/pg-core").PgColumnBuilder<{
                name: "default_modules";
                dataType: "string";
                columnType: "PgText";
                data: string;
                enumValues: [string, ...string[]];
                driverParam: string;
            }, {}, {}, import("drizzle-orm").ColumnBuilderExtraConfig>;
            size: undefined;
        }>;
        configSchema: import("drizzle-orm/pg-core").PgColumn<{
            name: "config_schema";
            tableName: "industries";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
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
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "industries";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
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
        sortOrder: import("drizzle-orm/pg-core").PgColumn<{
            name: "sort_order";
            tableName: "industries";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "industries";
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
export declare const insertIndustrySchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    defaultModules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    configSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    defaultModules?: string[] | undefined;
    configSchema?: Record<string, any> | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
}, {
    name: string;
    slug: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    description?: string | undefined;
    icon?: string | undefined;
    defaultModules?: string[] | undefined;
    configSchema?: Record<string, any> | undefined;
    isActive?: boolean | undefined;
    sortOrder?: number | undefined;
}>;
export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Industry = typeof industries.$inferSelect;
export declare const industryDeployments: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "industry_deployments";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "industry_deployments";
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
            tableName: "industry_deployments";
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
        industryId: import("drizzle-orm/pg-core").PgColumn<{
            name: "industry_id";
            tableName: "industry_deployments";
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
        enabledModules: import("drizzle-orm/pg-core").PgColumn<{
            name: "enabled_modules";
            tableName: "industry_deployments";
            dataType: "array";
            columnType: "PgArray";
            data: string[];
            driverParam: string | string[];
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: import("drizzle-orm").Column<{
                name: "enabled_modules";
                tableName: "industry_deployments";
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
            identity: undefined;
            generated: undefined;
        }, {}, {
            baseBuilder: import("drizzle-orm/pg-core").PgColumnBuilder<{
                name: "enabled_modules";
                dataType: "string";
                columnType: "PgText";
                data: string;
                enumValues: [string, ...string[]];
                driverParam: string;
            }, {}, {}, import("drizzle-orm").ColumnBuilderExtraConfig>;
            size: undefined;
        }>;
        customConfig: import("drizzle-orm/pg-core").PgColumn<{
            name: "custom_config";
            tableName: "industry_deployments";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
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
            tableName: "industry_deployments";
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
        deployedBy: import("drizzle-orm/pg-core").PgColumn<{
            name: "deployed_by";
            tableName: "industry_deployments";
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
        deployedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "deployed_at";
            tableName: "industry_deployments";
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
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "industry_deployments";
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
export declare const insertIndustryDeploymentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    deployedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    tenantId: z.ZodString;
    industryId: z.ZodString;
    enabledModules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    customConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "pending"]>>;
    deployedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tenantId: string;
    industryId: string;
    id?: string | undefined;
    updatedAt?: Date | null | undefined;
    status?: "active" | "inactive" | "pending" | undefined;
    enabledModules?: string[] | undefined;
    customConfig?: Record<string, any> | undefined;
    deployedBy?: string | undefined;
    deployedAt?: Date | null | undefined;
}, {
    tenantId: string;
    industryId: string;
    id?: string | undefined;
    updatedAt?: Date | null | undefined;
    status?: "active" | "inactive" | "pending" | undefined;
    enabledModules?: string[] | undefined;
    customConfig?: Record<string, any> | undefined;
    deployedBy?: string | undefined;
    deployedAt?: Date | null | undefined;
}>;
export type InsertIndustryDeployment = z.infer<typeof insertIndustryDeploymentSchema>;
export type IndustryDeployment = typeof industryDeployments.$inferSelect;
export declare const industryAppRecommendations: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "industry_app_recommendations";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "industry_app_recommendations";
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
        industryId: import("drizzle-orm/pg-core").PgColumn<{
            name: "industry_id";
            tableName: "industry_app_recommendations";
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
        appId: import("drizzle-orm/pg-core").PgColumn<{
            name: "app_id";
            tableName: "industry_app_recommendations";
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
        ranking: import("drizzle-orm/pg-core").PgColumn<{
            name: "ranking";
            tableName: "industry_app_recommendations";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
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
        reason: import("drizzle-orm/pg-core").PgColumn<{
            name: "reason";
            tableName: "industry_app_recommendations";
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "industry_app_recommendations";
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
export declare const insertIndustryAppRecommendationSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    industryId: z.ZodString;
    appId: z.ZodString;
    ranking: z.ZodOptional<z.ZodNumber>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    industryId: string;
    appId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    ranking?: number | undefined;
    reason?: string | undefined;
}, {
    industryId: string;
    appId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    ranking?: number | undefined;
    reason?: string | undefined;
}>;
export type InsertIndustryAppRecommendation = z.infer<typeof insertIndustryAppRecommendationSchema>;
export type IndustryAppRecommendation = typeof industryAppRecommendations.$inferSelect;
export declare const auditLogs: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "audit_logs";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "audit_logs";
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
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "audit_logs";
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
        action: import("drizzle-orm/pg-core").PgColumn<{
            name: "action";
            tableName: "audit_logs";
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
        entityType: import("drizzle-orm/pg-core").PgColumn<{
            name: "entity_type";
            tableName: "audit_logs";
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
        entityId: import("drizzle-orm/pg-core").PgColumn<{
            name: "entity_id";
            tableName: "audit_logs";
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
        oldValue: import("drizzle-orm/pg-core").PgColumn<{
            name: "old_value";
            tableName: "audit_logs";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
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
        newValue: import("drizzle-orm/pg-core").PgColumn<{
            name: "new_value";
            tableName: "audit_logs";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
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
        ipAddress: import("drizzle-orm/pg-core").PgColumn<{
            name: "ip_address";
            tableName: "audit_logs";
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
        userAgent: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_agent";
            tableName: "audit_logs";
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
            tableName: "audit_logs";
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
export declare const insertAuditLogSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    userId: z.ZodOptional<z.ZodString>;
    action: z.ZodString;
    entityType: z.ZodOptional<z.ZodString>;
    entityId: z.ZodOptional<z.ZodString>;
    oldValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    newValue: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    action: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    userId?: string | undefined;
    entityType?: string | undefined;
    entityId?: string | undefined;
    oldValue?: Record<string, any> | undefined;
    newValue?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}, {
    action: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    userId?: string | undefined;
    entityType?: string | undefined;
    entityId?: string | undefined;
    oldValue?: Record<string, any> | undefined;
    newValue?: Record<string, any> | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
}>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export declare const userNotifications: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "user_notifications";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "user_notifications";
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
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "user_notifications";
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
        type: import("drizzle-orm/pg-core").PgColumn<{
            name: "type";
            tableName: "user_notifications";
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
            tableName: "user_notifications";
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
        message: import("drizzle-orm/pg-core").PgColumn<{
            name: "message";
            tableName: "user_notifications";
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
        icon: import("drizzle-orm/pg-core").PgColumn<{
            name: "icon";
            tableName: "user_notifications";
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
        actionUrl: import("drizzle-orm/pg-core").PgColumn<{
            name: "action_url";
            tableName: "user_notifications";
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
        referenceType: import("drizzle-orm/pg-core").PgColumn<{
            name: "reference_type";
            tableName: "user_notifications";
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
        referenceId: import("drizzle-orm/pg-core").PgColumn<{
            name: "reference_id";
            tableName: "user_notifications";
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
        isRead: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_read";
            tableName: "user_notifications";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
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
        isArchived: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_archived";
            tableName: "user_notifications";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
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
        priority: import("drizzle-orm/pg-core").PgColumn<{
            name: "priority";
            tableName: "user_notifications";
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
            tableName: "user_notifications";
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
        readAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "read_at";
            tableName: "user_notifications";
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
    };
    dialect: "pg";
}>;
export declare const insertUserNotificationSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    readAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    userId: z.ZodString;
    type: z.ZodEnum<["app_update", "new_feature", "recommendation", "badge_earned", "system"]>;
    title: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    referenceType: z.ZodOptional<z.ZodString>;
    referenceId: z.ZodOptional<z.ZodString>;
    isRead: z.ZodOptional<z.ZodBoolean>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
    priority: z.ZodOptional<z.ZodEnum<["low", "normal", "high"]>>;
}, "strip", z.ZodTypeAny, {
    type: "app_update" | "new_feature" | "recommendation" | "badge_earned" | "system";
    userId: string;
    title: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    message?: string | undefined;
    priority?: "low" | "high" | "normal" | undefined;
    icon?: string | undefined;
    actionUrl?: string | undefined;
    referenceType?: string | undefined;
    referenceId?: string | undefined;
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
    readAt?: Date | null | undefined;
}, {
    type: "app_update" | "new_feature" | "recommendation" | "badge_earned" | "system";
    userId: string;
    title: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    message?: string | undefined;
    priority?: "low" | "high" | "normal" | undefined;
    icon?: string | undefined;
    actionUrl?: string | undefined;
    referenceType?: string | undefined;
    referenceId?: string | undefined;
    isRead?: boolean | undefined;
    isArchived?: boolean | undefined;
    readAt?: Date | null | undefined;
}>;
export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;
export declare const dashboardWidgets: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "dashboard_widgets";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "dashboard_widgets";
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
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "dashboard_widgets";
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
        widgetType: import("drizzle-orm/pg-core").PgColumn<{
            name: "widget_type";
            tableName: "dashboard_widgets";
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
            tableName: "dashboard_widgets";
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
        config: import("drizzle-orm/pg-core").PgColumn<{
            name: "config";
            tableName: "dashboard_widgets";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
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
        position: import("drizzle-orm/pg-core").PgColumn<{
            name: "position";
            tableName: "dashboard_widgets";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
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
        size: import("drizzle-orm/pg-core").PgColumn<{
            name: "size";
            tableName: "dashboard_widgets";
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
        isVisible: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_visible";
            tableName: "dashboard_widgets";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "dashboard_widgets";
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
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "dashboard_widgets";
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
export declare const insertDashboardWidgetSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    userId: z.ZodString;
    widgetType: z.ZodString;
    title: z.ZodString;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    position: z.ZodOptional<z.ZodNumber>;
    size: z.ZodOptional<z.ZodString>;
    isVisible: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    title: string;
    widgetType: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    size?: string | undefined;
    config?: Record<string, any> | undefined;
    position?: number | undefined;
    isVisible?: boolean | undefined;
}, {
    userId: string;
    title: string;
    widgetType: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    size?: string | undefined;
    config?: Record<string, any> | undefined;
    position?: number | undefined;
    isVisible?: boolean | undefined;
}>;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
//# sourceMappingURL=common.d.ts.map