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
