import { pgTable, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== ROLES & PERMISSIONS ==========
export const sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", { precision: 6 }).notNull(),
});

export const roles = pgTable("roles", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id"),
    name: varchar("name").notNull(),
    description: text("description"),
    permissions: jsonb("permissions"),
    isSystem: boolean("is_system").default(false),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertRoleSchema = createInsertSchema(roles).extend({
    tenantId: z.string().optional().nullable(),
    name: z.string().min(1),
    description: z.string().optional(),
    permissions: z.record(z.any()).optional(),
    isSystem: z.boolean().optional(),
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

// ========== SECURITY & COMPLIANCE ==========
export const abacRules = pgTable("abac_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    resource: varchar("resource").notNull(),
    action: varchar("action").notNull(),
    conditions: jsonb("conditions"),
    effect: varchar("effect").default("allow"), // allow, deny
    priority: integer("priority").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertAbacRuleSchema = createInsertSchema(abacRules).extend({
    name: z.string().min(1),
    resource: z.string().min(1),
    action: z.string().min(1),
    conditions: z.record(z.any()).optional(),
    effect: z.string().optional(),
    priority: z.number().optional(),
    isActive: z.boolean().optional(),
});

export type InsertAbacRule = z.infer<typeof insertAbacRuleSchema>;
export type AbacRule = typeof abacRules.$inferSelect;

export const encryptedFields = pgTable("encrypted_fields", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(),
    entityId: varchar("entity_id").notNull(),
    fieldName: varchar("field_name").notNull(),
    encryptedValue: text("encrypted_value"),
    keyVersion: varchar("key_version"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertEncryptedFieldSchema = createInsertSchema(encryptedFields).extend({
    entityType: z.string().min(1),
    entityId: z.string().min(1),
    fieldName: z.string().min(1),
    encryptedValue: z.string().optional(),
    keyVersion: z.string().optional(),
});

export type InsertEncryptedField = z.infer<typeof insertEncryptedFieldSchema>;
export type EncryptedField = typeof encryptedFields.$inferSelect;

export const complianceConfigs = pgTable("compliance_configs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    framework: varchar("framework").notNull(), // gdpr, hipaa, sox, pci
    settings: jsonb("settings"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertComplianceConfigSchema = createInsertSchema(complianceConfigs).extend({
    tenantId: z.string().min(1),
    framework: z.string().min(1),
    settings: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
});

export type InsertComplianceConfig = z.infer<typeof insertComplianceConfigSchema>;
export type ComplianceConfig = typeof complianceConfigs.$inferSelect;

// ========== APPS (Simple/Legacy) ==========
export const apps = pgTable("apps", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    version: varchar("version"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertAppSchema = createInsertSchema(apps).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    version: z.string().optional(),
    status: z.string().optional(),
});

export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = typeof apps.$inferSelect;

export const appReviews = pgTable("app_reviews", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: varchar("app_id").notNull(),
    userId: varchar("user_id").notNull(),
    rating: integer("rating").notNull(),
    title: varchar("title"),
    content: text("content"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAppReviewSchema = createInsertSchema(appReviews).extend({
    appId: z.string().min(1),
    userId: z.string().min(1),
    rating: z.number().min(1).max(5),
    title: z.string().optional(),
    content: z.string().optional(),
});

export type InsertAppReview = z.infer<typeof insertAppReviewSchema>;
export type AppReview = typeof appReviews.$inferSelect;

export const appInstallations = pgTable("app_installations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: varchar("app_id").notNull(),
    tenantId: varchar("tenant_id").notNull(),
    installedBy: varchar("installed_by").notNull(),
    status: varchar("status").default("active"),
    installedAt: timestamp("installed_at").default(sql`now()`),
});

export const insertAppInstallationSchema = createInsertSchema(appInstallations).extend({
    appId: z.string().min(1),
    tenantId: z.string().min(1),
    installedBy: z.string().min(1),
    status: z.string().optional(),
});

export type InsertAppInstallation = z.infer<typeof insertAppInstallationSchema>;
export type AppInstallation = typeof appInstallations.$inferSelect;
