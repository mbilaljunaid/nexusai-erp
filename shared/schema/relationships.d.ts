import { z } from "zod";
export declare const hzRelationships: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hz_relationships";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hz_relationships";
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
        subjectId: import("drizzle-orm/pg-core").PgColumn<{
            name: "subject_id";
            tableName: "hz_relationships";
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
        objectId: import("drizzle-orm/pg-core").PgColumn<{
            name: "object_id";
            tableName: "hz_relationships";
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
        relationshipCode: import("drizzle-orm/pg-core").PgColumn<{
            name: "relationship_code";
            tableName: "hz_relationships";
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
        relationshipType: import("drizzle-orm/pg-core").PgColumn<{
            name: "relationship_type";
            tableName: "hz_relationships";
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
        startDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "start_date";
            tableName: "hz_relationships";
            dataType: "string";
            columnType: "PgDateString";
            data: string;
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
        endDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "end_date";
            tableName: "hz_relationships";
            dataType: "string";
            columnType: "PgDateString";
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
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "hz_relationships";
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
            length: 1;
        }>;
        comments: import("drizzle-orm/pg-core").PgColumn<{
            name: "comments";
            tableName: "hz_relationships";
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
            tableName: "hz_relationships";
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
            tableName: "hz_relationships";
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
export declare const hzOrgContacts: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hz_org_contacts";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hz_org_contacts";
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
        partyRelationshipId: import("drizzle-orm/pg-core").PgColumn<{
            name: "party_relationship_id";
            tableName: "hz_org_contacts";
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
        partySiteId: import("drizzle-orm/pg-core").PgColumn<{
            name: "party_site_id";
            tableName: "hz_org_contacts";
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
        departmentCode: import("drizzle-orm/pg-core").PgColumn<{
            name: "department_code";
            tableName: "hz_org_contacts";
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
        department: import("drizzle-orm/pg-core").PgColumn<{
            name: "department";
            tableName: "hz_org_contacts";
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
        jobTitle: import("drizzle-orm/pg-core").PgColumn<{
            name: "job_title";
            tableName: "hz_org_contacts";
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
        jobTitleCode: import("drizzle-orm/pg-core").PgColumn<{
            name: "job_title_code";
            tableName: "hz_org_contacts";
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
        decisionMakerFlag: import("drizzle-orm/pg-core").PgColumn<{
            name: "decision_maker_flag";
            tableName: "hz_org_contacts";
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
            tableName: "hz_org_contacts";
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
export declare const insertHzRelationshipSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    relationshipType: z.ZodString;
    startDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    endDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    comments: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    subjectId: z.ZodString;
    objectId: z.ZodString;
    relationshipCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    relationshipType: string;
    subjectId: string;
    objectId: string;
    relationshipCode: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | null | undefined;
    comments?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}, {
    relationshipType: string;
    subjectId: string;
    objectId: string;
    relationshipCode: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | null | undefined;
    comments?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}>;
export declare const insertHzOrgContactSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    partySiteId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    departmentCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    department: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    jobTitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    jobTitleCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    decisionMakerFlag: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    partyRelationshipId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    partyRelationshipId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    department?: string | null | undefined;
    jobTitle?: string | null | undefined;
    partySiteId?: string | null | undefined;
    departmentCode?: string | null | undefined;
    jobTitleCode?: string | null | undefined;
    decisionMakerFlag?: boolean | null | undefined;
}, {
    partyRelationshipId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    department?: string | null | undefined;
    jobTitle?: string | null | undefined;
    partySiteId?: string | null | undefined;
    departmentCode?: string | null | undefined;
    jobTitleCode?: string | null | undefined;
    decisionMakerFlag?: boolean | null | undefined;
}>;
export type HzRelationship = typeof hzRelationships.$inferSelect;
export type InsertHzRelationship = typeof hzRelationships.$inferInsert;
export type HzOrgContact = typeof hzOrgContacts.$inferSelect;
export type InsertHzOrgContact = typeof hzOrgContacts.$inferInsert;
//# sourceMappingURL=relationships.d.ts.map