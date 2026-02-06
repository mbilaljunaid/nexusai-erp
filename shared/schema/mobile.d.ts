import { z } from "zod";
export declare const mobileDevices: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "mobile_devices";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "mobile_devices";
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
            tableName: "mobile_devices";
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
        deviceId: import("drizzle-orm/pg-core").PgColumn<{
            name: "device_id";
            tableName: "mobile_devices";
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
        deviceName: import("drizzle-orm/pg-core").PgColumn<{
            name: "device_name";
            tableName: "mobile_devices";
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
        platform: import("drizzle-orm/pg-core").PgColumn<{
            name: "platform";
            tableName: "mobile_devices";
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
        pushToken: import("drizzle-orm/pg-core").PgColumn<{
            name: "push_token";
            tableName: "mobile_devices";
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
        lastSyncAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_sync_at";
            tableName: "mobile_devices";
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
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "mobile_devices";
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
            tableName: "mobile_devices";
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
            tableName: "mobile_devices";
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
export declare const insertMobileDeviceSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    userId: z.ZodString;
    deviceId: z.ZodString;
    deviceName: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodString>;
    pushToken: z.ZodOptional<z.ZodString>;
    lastSyncAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    deviceId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    isActive?: boolean | undefined;
    deviceName?: string | undefined;
    platform?: string | undefined;
    pushToken?: string | undefined;
    lastSyncAt?: Date | null | undefined;
}, {
    userId: string;
    deviceId: string;
    id?: string | undefined;
    createdAt?: Date | null | undefined;
    updatedAt?: Date | null | undefined;
    isActive?: boolean | undefined;
    deviceName?: string | undefined;
    platform?: string | undefined;
    pushToken?: string | undefined;
    lastSyncAt?: Date | null | undefined;
}>;
export type InsertMobileDevice = z.infer<typeof insertMobileDeviceSchema>;
export type MobileDevice = typeof mobileDevices.$inferSelect;
export declare const offlineSyncs: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "offline_syncs";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "offline_syncs";
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
        deviceId: import("drizzle-orm/pg-core").PgColumn<{
            name: "device_id";
            tableName: "offline_syncs";
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
            tableName: "offline_syncs";
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
        entityId: import("drizzle-orm/pg-core").PgColumn<{
            name: "entity_id";
            tableName: "offline_syncs";
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
        action: import("drizzle-orm/pg-core").PgColumn<{
            name: "action";
            tableName: "offline_syncs";
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
            tableName: "offline_syncs";
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
        syncStatus: import("drizzle-orm/pg-core").PgColumn<{
            name: "sync_status";
            tableName: "offline_syncs";
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
        syncedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "synced_at";
            tableName: "offline_syncs";
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
            tableName: "offline_syncs";
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
export declare const insertOfflineSyncSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
} & {
    deviceId: z.ZodString;
    entityType: z.ZodString;
    entityId: z.ZodString;
    action: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    syncStatus: z.ZodOptional<z.ZodString>;
    syncedAt: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    action: string;
    entityType: string;
    entityId: string;
    deviceId: string;
    id?: string | undefined;
    data?: Record<string, any> | undefined;
    createdAt?: Date | null | undefined;
    syncStatus?: string | undefined;
    syncedAt?: Date | null | undefined;
}, {
    action: string;
    entityType: string;
    entityId: string;
    deviceId: string;
    id?: string | undefined;
    data?: Record<string, any> | undefined;
    createdAt?: Date | null | undefined;
    syncStatus?: string | undefined;
    syncedAt?: Date | null | undefined;
}>;
export type InsertOfflineSync = z.infer<typeof insertOfflineSyncSchema>;
export type OfflineSync = typeof offlineSyncs.$inferSelect;
//# sourceMappingURL=mobile.d.ts.map