import { z } from "zod";
export declare const hzDupBatch: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hz_dup_batch";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hz_dup_batch";
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
        batchName: import("drizzle-orm/pg-core").PgColumn<{
            name: "batch_name";
            tableName: "hz_dup_batch";
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
            tableName: "hz_dup_batch";
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
        matchRuleCode: import("drizzle-orm/pg-core").PgColumn<{
            name: "match_rule_code";
            tableName: "hz_dup_batch";
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
        totalRecordsProcessed: import("drizzle-orm/pg-core").PgColumn<{
            name: "total_records_processed";
            tableName: "hz_dup_batch";
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
        candidatesFound: import("drizzle-orm/pg-core").PgColumn<{
            name: "candidates_found";
            tableName: "hz_dup_batch";
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
            tableName: "hz_dup_batch";
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
            tableName: "hz_dup_batch";
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
export declare const hzDupSets: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hz_dup_sets";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hz_dup_sets";
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
        batchId: import("drizzle-orm/pg-core").PgColumn<{
            name: "batch_id";
            tableName: "hz_dup_sets";
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
            tableName: "hz_dup_sets";
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
        assignedTo: import("drizzle-orm/pg-core").PgColumn<{
            name: "assigned_to";
            tableName: "hz_dup_sets";
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
            tableName: "hz_dup_sets";
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
            tableName: "hz_dup_sets";
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
export declare const hzDupSetParties: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hz_dup_set_parties";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hz_dup_set_parties";
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
        setId: import("drizzle-orm/pg-core").PgColumn<{
            name: "set_id";
            tableName: "hz_dup_set_parties";
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
        partyId: import("drizzle-orm/pg-core").PgColumn<{
            name: "party_id";
            tableName: "hz_dup_set_parties";
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
            tableName: "hz_dup_set_parties";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
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
        mergeStatus: import("drizzle-orm/pg-core").PgColumn<{
            name: "merge_status";
            tableName: "hz_dup_set_parties";
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
            tableName: "hz_dup_set_parties";
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
export declare const hzMatchRules: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hz_match_rules";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hz_match_rules";
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
        ruleName: import("drizzle-orm/pg-core").PgColumn<{
            name: "rule_name";
            tableName: "hz_match_rules";
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
            tableName: "hz_match_rules";
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
        matchType: import("drizzle-orm/pg-core").PgColumn<{
            name: "match_type";
            tableName: "hz_match_rules";
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
        matchScoreThreshold: import("drizzle-orm/pg-core").PgColumn<{
            name: "match_score_threshold";
            tableName: "hz_match_rules";
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
        configJson: import("drizzle-orm/pg-core").PgColumn<{
            name: "config_json";
            tableName: "hz_match_rules";
            dataType: "json";
            columnType: "PgJson";
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
        activeFlag: import("drizzle-orm/pg-core").PgColumn<{
            name: "active_flag";
            tableName: "hz_match_rules";
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
            tableName: "hz_match_rules";
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
            tableName: "hz_match_rules";
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
export declare const hzSurvivorshipRules: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "hz_survivorship_rules";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "hz_survivorship_rules";
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
        ruleName: import("drizzle-orm/pg-core").PgColumn<{
            name: "rule_name";
            tableName: "hz_survivorship_rules";
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
            tableName: "hz_survivorship_rules";
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
        sourceSystem: import("drizzle-orm/pg-core").PgColumn<{
            name: "source_system";
            tableName: "hz_survivorship_rules";
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
        confidenceScore: import("drizzle-orm/pg-core").PgColumn<{
            name: "confidence_score";
            tableName: "hz_survivorship_rules";
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
        logicType: import("drizzle-orm/pg-core").PgColumn<{
            name: "logic_type";
            tableName: "hz_survivorship_rules";
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
        activeFlag: import("drizzle-orm/pg-core").PgColumn<{
            name: "active_flag";
            tableName: "hz_survivorship_rules";
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
            tableName: "hz_survivorship_rules";
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
            tableName: "hz_survivorship_rules";
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
export declare const hzDupBatchRelations: import("drizzle-orm").Relations<"hz_dup_batch", {
    sets: import("drizzle-orm").Many<"hz_dup_sets">;
}>;
export declare const hzDupSetsRelations: import("drizzle-orm").Relations<"hz_dup_sets", {
    batch: import("drizzle-orm").One<"hz_dup_batch", false>;
    parties: import("drizzle-orm").Many<"hz_dup_set_parties">;
}>;
export declare const hzDupSetPartiesRelations: import("drizzle-orm").Relations<"hz_dup_set_parties", {
    set: import("drizzle-orm").One<"hz_dup_sets", true>;
    party: import("drizzle-orm").One<"hz_parties", true>;
}>;
export declare const insertHzDupBatchSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    matchRuleCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    totalRecordsProcessed: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    candidatesFound: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    batchName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    batchName: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | null | undefined;
    matchRuleCode?: string | null | undefined;
    totalRecordsProcessed?: number | null | undefined;
    candidatesFound?: number | null | undefined;
}, {
    batchName: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | null | undefined;
    matchRuleCode?: string | null | undefined;
    totalRecordsProcessed?: number | null | undefined;
    candidatesFound?: number | null | undefined;
}>;
export declare const insertHzDupSetSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    assignedTo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    batchId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | null | undefined;
    batchId?: string | undefined;
    assignedTo?: string | null | undefined;
}, {
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    status?: string | null | undefined;
    batchId?: string | undefined;
    assignedTo?: string | null | undefined;
}>;
export declare const insertHzDupSetPartySchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    setId: z.ZodString;
    partyId: z.ZodString;
    mergeStatus: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    score: z.ZodUnion<[z.ZodNumber, z.ZodEffects<z.ZodString, number, string>]>;
}, "strip", z.ZodTypeAny, {
    partyId: string;
    score: number;
    setId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    mergeStatus?: string | null | undefined;
}, {
    partyId: string;
    score: string | number;
    setId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    mergeStatus?: string | null | undefined;
}>;
export declare const insertHzMatchRuleSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    matchType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    configJson: z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-zod/utils").Json, z.ZodTypeDef, import("drizzle-zod/utils").Json>>>;
    activeFlag: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    ruleName: z.ZodString;
    matchScoreThreshold: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    ruleName: string;
    matchScoreThreshold: number;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    description?: string | null | undefined;
    activeFlag?: boolean | null | undefined;
    matchType?: string | null | undefined;
    configJson?: import("drizzle-zod/utils").Json | undefined;
}, {
    ruleName: string;
    matchScoreThreshold: number;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    description?: string | null | undefined;
    activeFlag?: boolean | null | undefined;
    matchType?: string | null | undefined;
    configJson?: import("drizzle-zod/utils").Json | undefined;
}>;
export declare const insertHzSurvivorshipRuleSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sourceSystem: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    confidenceScore: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    logicType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    activeFlag: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    ruleName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ruleName: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    description?: string | null | undefined;
    confidenceScore?: number | null | undefined;
    activeFlag?: boolean | null | undefined;
    sourceSystem?: string | null | undefined;
    logicType?: string | null | undefined;
}, {
    ruleName: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    description?: string | null | undefined;
    confidenceScore?: number | null | undefined;
    activeFlag?: boolean | null | undefined;
    sourceSystem?: string | null | undefined;
    logicType?: string | null | undefined;
}>;
export type HzDupBatch = typeof hzDupBatch.$inferSelect;
export type InsertHzDupBatch = typeof hzDupBatch.$inferInsert;
export type HzDupSet = typeof hzDupSets.$inferSelect;
export type InsertHzDupSet = typeof hzDupSets.$inferInsert;
export type HzDupSetParty = typeof hzDupSetParties.$inferSelect;
export type InsertHzDupSetParty = typeof hzDupSetParties.$inferInsert;
export type HzMatchRule = typeof hzMatchRules.$inferSelect;
export type InsertHzMatchRule = typeof hzMatchRules.$inferInsert;
export type HzSurvivorshipRule = typeof hzSurvivorshipRules.$inferSelect;
export type InsertHzSurvivorshipRule = typeof hzSurvivorshipRules.$inferInsert;
//# sourceMappingURL=data-quality.d.ts.map