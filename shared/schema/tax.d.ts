import { z } from "zod";
export declare const taxJurisdictions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "tax_jurisdictions";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "tax_jurisdictions";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "tax_jurisdictions";
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
            length: 255;
        }>;
        type: import("drizzle-orm/pg-core").PgColumn<{
            name: "type";
            tableName: "tax_jurisdictions";
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
            length: 50;
        }>;
        parentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "parent_id";
            tableName: "tax_jurisdictions";
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
    };
    dialect: "pg";
}>;
export declare const insertTaxJurisdictionSchema: import("drizzle-zod").BuildSchema<"insert", {
    id: import("drizzle-orm/pg-core").PgColumn<{
        name: "id";
        tableName: "tax_jurisdictions";
        dataType: "number";
        columnType: "PgSerial";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
    }, {}, {}>;
    name: import("drizzle-orm/pg-core").PgColumn<{
        name: "name";
        tableName: "tax_jurisdictions";
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
        length: 255;
    }>;
    type: import("drizzle-orm/pg-core").PgColumn<{
        name: "type";
        tableName: "tax_jurisdictions";
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
        length: 50;
    }>;
    parentId: import("drizzle-orm/pg-core").PgColumn<{
        name: "parent_id";
        tableName: "tax_jurisdictions";
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
}, undefined>;
export declare const taxCodes: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "tax_codes";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "tax_codes";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "tax_codes";
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
            length: 255;
        }>;
        rate: import("drizzle-orm/pg-core").PgColumn<{
            name: "rate";
            tableName: "tax_codes";
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
        jurisdictionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "jurisdiction_id";
            tableName: "tax_codes";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
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
        active: import("drizzle-orm/pg-core").PgColumn<{
            name: "active";
            tableName: "tax_codes";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
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
export declare const insertTaxCodeSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
    jurisdictionId: z.ZodNumber;
    active: z.ZodOptional<z.ZodBoolean>;
} & {
    rate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    rate: string;
    jurisdictionId: number;
    id?: number | undefined;
    active?: boolean | undefined;
}, {
    name: string;
    rate: string;
    jurisdictionId: number;
    id?: number | undefined;
    active?: boolean | undefined;
}>;
export declare const taxExemptions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "tax_exemptions";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "tax_exemptions";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        customerId: import("drizzle-orm/pg-core").PgColumn<{
            name: "customer_id";
            tableName: "tax_exemptions";
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
        siteId: import("drizzle-orm/pg-core").PgColumn<{
            name: "site_id";
            tableName: "tax_exemptions";
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
        taxCodeId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tax_code_id";
            tableName: "tax_exemptions";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
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
        exemptionType: import("drizzle-orm/pg-core").PgColumn<{
            name: "exemption_type";
            tableName: "tax_exemptions";
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
            length: 20;
        }>;
        exemptionValue: import("drizzle-orm/pg-core").PgColumn<{
            name: "exemption_value";
            tableName: "tax_exemptions";
            dataType: "string";
            columnType: "PgNumeric";
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
    };
    dialect: "pg";
}>;
export declare const insertTaxExemptionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    customerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    siteId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    taxCodeId: z.ZodNumber;
    exemptionType: z.ZodString;
} & {
    exemptionValue: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    taxCodeId: number;
    exemptionType: string;
    id?: number | undefined;
    customerId?: string | null | undefined;
    siteId?: string | null | undefined;
    exemptionValue?: string | undefined;
}, {
    taxCodeId: number;
    exemptionType: string;
    id?: number | undefined;
    customerId?: string | null | undefined;
    siteId?: string | null | undefined;
    exemptionValue?: string | undefined;
}>;
export type TaxJurisdiction = typeof taxJurisdictions.$inferSelect;
export type InsertTaxJurisdiction = typeof taxJurisdictions.$inferInsert;
export type TaxCode = typeof taxCodes.$inferSelect;
export type InsertTaxCode = typeof taxCodes.$inferInsert;
export type TaxExemption = typeof taxExemptions.$inferSelect;
export type InsertTaxExemption = typeof taxExemptions.$inferInsert;
//# sourceMappingURL=tax.d.ts.map