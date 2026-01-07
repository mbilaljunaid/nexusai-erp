import { pgTable, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== MOBILE & OFFLINE SYNC ==========
export const mobileDevices = pgTable("mobile_devices", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    deviceId: varchar("device_id").notNull(),
    deviceName: varchar("device_name"),
    platform: varchar("platform"), // ios, android, web
    pushToken: varchar("push_token"),
    lastSyncAt: timestamp("last_sync_at"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMobileDeviceSchema = createInsertSchema(mobileDevices).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    userId: z.string().min(1),
    deviceId: z.string().min(1),
    deviceName: z.string().optional(),
    platform: z.string().optional(),
    pushToken: z.string().optional(),
    lastSyncAt: z.date().optional().nullable(),
    isActive: z.boolean().optional(),
});

export type InsertMobileDevice = z.infer<typeof insertMobileDeviceSchema>;
export type MobileDevice = typeof mobileDevices.$inferSelect;

export const offlineSyncs = pgTable("offline_syncs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    deviceId: varchar("device_id").notNull(),
    entityType: varchar("entity_type").notNull(),
    entityId: varchar("entity_id").notNull(),
    action: varchar("action").notNull(), // create, update, delete
    data: jsonb("data"),
    syncStatus: varchar("sync_status").default("pending"), // pending, synced, failed
    syncedAt: timestamp("synced_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertOfflineSyncSchema = createInsertSchema(offlineSyncs).omit({ id: true, createdAt: true }).extend({
    deviceId: z.string().min(1),
    entityType: z.string().min(1),
    entityId: z.string().min(1),
    action: z.string().min(1),
    data: z.record(z.any()).optional(),
    syncStatus: z.string().optional(),
    syncedAt: z.date().optional().nullable(),
});

export type InsertOfflineSync = z.infer<typeof insertOfflineSyncSchema>;
export type OfflineSync = typeof offlineSyncs.$inferSelect;
