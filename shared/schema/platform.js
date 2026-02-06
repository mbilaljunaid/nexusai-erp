"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAppInstallationSchema = exports.appInstallations = exports.insertAppReviewSchema = exports.appReviews = exports.insertAppSchema = exports.apps = exports.insertComplianceConfigSchema = exports.complianceConfigs = exports.insertEncryptedFieldSchema = exports.encryptedFields = exports.insertAbacRuleSchema = exports.abacRules = exports.insertRoleSchema = exports.roles = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== ROLES & PERMISSIONS ==========
/*
// Duplicate sessions export - using the one in common.ts
export const sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", { precision: 6 }).notNull(),
});
*/
exports.roles = (0, pg_core_1.pgTable)("roles", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id"),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    permissions: (0, pg_core_1.jsonb)("permissions"),
    isSystem: (0, pg_core_1.boolean)("is_system").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRoleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.roles).extend({
    tenantId: zod_1.z.string().optional().nullable(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    permissions: zod_1.z.record(zod_1.z.any()).optional(),
    isSystem: zod_1.z.boolean().optional(),
});
// ========== SECURITY & COMPLIANCE ==========
exports.abacRules = (0, pg_core_1.pgTable)("abac_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    resource: (0, pg_core_1.varchar)("resource").notNull(),
    action: (0, pg_core_1.varchar)("action").notNull(),
    conditions: (0, pg_core_1.jsonb)("conditions"),
    effect: (0, pg_core_1.varchar)("effect").default("allow"), // allow, deny
    priority: (0, pg_core_1.integer)("priority").default(0),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertAbacRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.abacRules).extend({
    name: zod_1.z.string().min(1),
    resource: zod_1.z.string().min(1),
    action: zod_1.z.string().min(1),
    conditions: zod_1.z.record(zod_1.z.any()).optional(),
    effect: zod_1.z.string().optional(),
    priority: zod_1.z.number().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.encryptedFields = (0, pg_core_1.pgTable)("encrypted_fields", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(),
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    fieldName: (0, pg_core_1.varchar)("field_name").notNull(),
    encryptedValue: (0, pg_core_1.text)("encrypted_value"),
    keyVersion: (0, pg_core_1.varchar)("key_version"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertEncryptedFieldSchema = (0, drizzle_zod_1.createInsertSchema)(exports.encryptedFields).extend({
    entityType: zod_1.z.string().min(1),
    entityId: zod_1.z.string().min(1),
    fieldName: zod_1.z.string().min(1),
    encryptedValue: zod_1.z.string().optional(),
    keyVersion: zod_1.z.string().optional(),
});
exports.complianceConfigs = (0, pg_core_1.pgTable)("compliance_configs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    framework: (0, pg_core_1.varchar)("framework").notNull(), // gdpr, hipaa, sox, pci
    settings: (0, pg_core_1.jsonb)("settings"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertComplianceConfigSchema = (0, drizzle_zod_1.createInsertSchema)(exports.complianceConfigs).extend({
    tenantId: zod_1.z.string().min(1),
    framework: zod_1.z.string().min(1),
    settings: zod_1.z.record(zod_1.z.any()).optional(),
    isActive: zod_1.z.boolean().optional(),
});
// ========== APPS (Simple/Legacy) ==========
exports.apps = (0, pg_core_1.pgTable)("apps", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    version: (0, pg_core_1.varchar)("version"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertAppSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apps).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
exports.appReviews = (0, pg_core_1.pgTable)("app_reviews", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    rating: (0, pg_core_1.integer)("rating").notNull(),
    title: (0, pg_core_1.varchar)("title"),
    content: (0, pg_core_1.text)("content"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertAppReviewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.appReviews).extend({
    appId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1),
    rating: zod_1.z.number().min(1).max(5),
    title: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
});
exports.appInstallations = (0, pg_core_1.pgTable)("app_installations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    installedBy: (0, pg_core_1.varchar)("installed_by").notNull(),
    status: (0, pg_core_1.varchar)("status").default("active"),
    installedAt: (0, pg_core_1.timestamp)("installed_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertAppInstallationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.appInstallations).extend({
    appId: zod_1.z.string().min(1),
    tenantId: zod_1.z.string().min(1),
    installedBy: zod_1.z.string().min(1),
    status: zod_1.z.string().optional(),
});
//# sourceMappingURL=platform.js.map