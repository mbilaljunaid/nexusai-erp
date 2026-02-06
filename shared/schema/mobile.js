"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertOfflineSyncSchema = exports.offlineSyncs = exports.insertMobileDeviceSchema = exports.mobileDevices = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== MOBILE & OFFLINE SYNC ==========
exports.mobileDevices = (0, pg_core_1.pgTable)("mobile_devices", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    deviceId: (0, pg_core_1.varchar)("device_id").notNull(),
    deviceName: (0, pg_core_1.varchar)("device_name"),
    platform: (0, pg_core_1.varchar)("platform"), // ios, android, web
    pushToken: (0, pg_core_1.varchar)("push_token"),
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMobileDeviceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mobileDevices).extend({
    userId: zod_1.z.string().min(1),
    deviceId: zod_1.z.string().min(1),
    deviceName: zod_1.z.string().optional(),
    platform: zod_1.z.string().optional(),
    pushToken: zod_1.z.string().optional(),
    lastSyncAt: zod_1.z.date().optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
});
exports.offlineSyncs = (0, pg_core_1.pgTable)("offline_syncs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    deviceId: (0, pg_core_1.varchar)("device_id").notNull(),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(),
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    action: (0, pg_core_1.varchar)("action").notNull(), // create, update, delete
    data: (0, pg_core_1.jsonb)("data"),
    syncStatus: (0, pg_core_1.varchar)("sync_status").default("pending"), // pending, synced, failed
    syncedAt: (0, pg_core_1.timestamp)("synced_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertOfflineSyncSchema = (0, drizzle_zod_1.createInsertSchema)(exports.offlineSyncs).extend({
    deviceId: zod_1.z.string().min(1),
    entityType: zod_1.z.string().min(1),
    entityId: zod_1.z.string().min(1),
    action: zod_1.z.string().min(1),
    data: zod_1.z.record(zod_1.z.any()).optional(),
    syncStatus: zod_1.z.string().optional(),
    syncedAt: zod_1.z.date().optional().nullable(),
});
//# sourceMappingURL=mobile.js.map