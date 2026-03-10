import { pgTable, varchar, text, timestamp, numeric, jsonb, boolean, integer, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== ADMIN: AFFILIATES ==========
export const affiliates = pgTable("affiliates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    email: varchar("email").notNull().unique(),
    company: varchar("company"),
    tier: varchar("tier").default("bronze"), // bronze, silver, gold, platinum
    status: varchar("status").default("pending"), // pending, active, inactive, suspended
    commissionRate: numeric("commission_rate").default("10"), // percentage
    totalReferrals: integer("total_referrals").default(0),
    totalEarnings: numeric("total_earnings").default("0"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertAffiliateSchema = createInsertSchema(affiliates).extend({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    company: z.string().optional(),
    tier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
    status: z.enum(["pending", "active", "inactive", "suspended"]).optional(),
    commissionRate: z.string().optional(),
    totalReferrals: z.number().optional(),
    totalEarnings: z.string().optional(),
});

export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;

export const affiliateReferrals = pgTable("affiliate_referrals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    affiliateId: varchar("affiliate_id").notNull(),
    tenantId: varchar("tenant_id").notNull(),
    status: varchar("status").default("pending"), // pending, converted, rejected
    commissionAmount: numeric("commission_amount"),
    createdAt: timestamp("created_at").default(sql`now()`),
    convertedAt: timestamp("converted_at"),
});

export const insertAffiliateReferralSchema = createInsertSchema(affiliateReferrals).extend({
    affiliateId: z.string().min(1),
    tenantId: z.string().min(1),
    status: z.enum(["pending", "converted", "rejected"]).optional(),
    commissionAmount: z.string().optional(),
});

export type InsertAffiliateReferral = z.infer<typeof insertAffiliateReferralSchema>;
export type AffiliateReferral = typeof affiliateReferrals.$inferSelect;

// ========== ADMIN: SYSTEM CONFIG ==========
export const systemConfig = pgTable("system_config", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    key: varchar("key").notNull().unique(),
    value: jsonb("value").notNull(),
    category: varchar("category"), // general, email, security, integrations, etc.
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).extend({
    key: z.string().min(1, "Key is required"),
    value: z.any(),
    category: z.string().optional(),
    description: z.string().optional(),
});

export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;
export type SystemConfig = typeof systemConfig.$inferSelect;

export const featureFlags = pgTable("feature_flags", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    description: text("description"),
    enabled: boolean("enabled").default(false),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).extend({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    enabled: z.boolean().optional(),
});

export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;
export type FeatureFlag = typeof featureFlags.$inferSelect;

// ========== ADMIN: AUDIT LOGS ==========
export const adminLogs = pgTable("admin_logs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    actorId: varchar("actor_id"),
    actorEmail: varchar("actor_email"),
    actorType: varchar("actor_type").default("user"), // user, system, ai
    action: varchar("action").notNull(),
    resourceType: varchar("resource_type"),
    resourceId: varchar("resource_id"),
    intent: text("intent"),
    details: text("details"),
    beforeState: jsonb("before_state"),
    afterState: jsonb("after_state"),
    justification: text("justification"),
    tenantId: varchar("tenant_id"),
    ipAddress: varchar("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => ({
    actorEmailIdx: index("admin_logs_actor_email_idx").on(table.actorEmail),
    actionIdx: index("admin_logs_action_idx").on(table.action),
    resourceTypeIdx: index("admin_logs_resource_type_idx").on(table.resourceType),
    createdAtIdx: index("admin_logs_created_at_idx").on(table.createdAt),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insertAdminLogSchema: z.ZodObject<any> = createInsertSchema(adminLogs).extend({
    action: z.string().min(1, "Action is required"),
    actorEmail: z.string().email().optional(),
    actorId: z.string().optional(),
    actorType: z.enum(["user", "system", "ai"]).optional(),
    resourceType: z.string().optional(),
    resourceId: z.string().optional(),
    details: z.string().optional(),
    justification: z.string().optional(),
    tenantId: z.string().optional(),
});

export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;

// ========== ADMIN: CONFIGURATION TEMPLATES ==========
export const configurationTemplates = pgTable("configuration_templates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    industryId: varchar("industry_id"),
    moduleId: varchar("module_id"),
    templateData: jsonb("template_data").notNull().default({}),
    templateCategory: varchar("template_category"),
    isDefault: boolean("is_default").default(false),
    sortOrder: integer("sort_order").default(0),
    dependencies: jsonb("dependencies").default([]),
    validationRules: jsonb("validation_rules").default({}),
    version: varchar("version").default("1.0"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertConfigurationTemplateSchema = createInsertSchema(configurationTemplates);
export type InsertConfigurationTemplate = z.infer<typeof insertConfigurationTemplateSchema>;
export type ConfigurationTemplateRow = typeof configurationTemplates.$inferSelect;

export const templateApplications = pgTable("template_applications", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    templateId: varchar("template_id").references(() => configurationTemplates.id).notNull(),
    appliedBy: varchar("applied_by"),
    appliedAt: timestamp("applied_at").default(sql`now()`),
    status: varchar("status").default("applied"), // applied, rolled_back, failed
    appliedData: jsonb("applied_data").notNull().default({}),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertTemplateApplicationSchema = createInsertSchema(templateApplications);
export type InsertTemplateApplication = z.infer<typeof insertTemplateApplicationSchema>;
export type TemplateApplicationRow = typeof templateApplications.$inferSelect;

