import { pgTable, varchar, text, timestamp, numeric, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== MARKETPLACE MODULE ==========
// App Developers/Publishers
export const marketplaceDevelopers = pgTable("marketplace_developers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    name: varchar("name").notNull(),
    description: text("description"),
    website: varchar("website"),
    supportEmail: varchar("support_email"),
    status: varchar("status").default("pending"), // pending, approved, suspended
    verified: boolean("verified").default(false),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceDeveloperSchema = createInsertSchema(marketplaceDevelopers).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    userId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    website: z.string().optional(),
    supportEmail: z.string().email().optional(),
    status: z.enum(["pending", "approved", "suspended"]).optional(),
    verified: z.boolean().optional(),
});

export type InsertMarketplaceDeveloper = z.infer<typeof insertMarketplaceDeveloperSchema>;
export type MarketplaceDeveloper = typeof marketplaceDevelopers.$inferSelect;

// App Categories
export const marketplaceCategories = pgTable("marketplace_categories", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull().unique(),
    description: text("description"),
    icon: varchar("icon"),
    parentId: varchar("parent_id"), // for nested categories
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceCategorySchema = createInsertSchema(marketplaceCategories).omit({ id: true, createdAt: true }).extend({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
    parentId: z.string().optional().nullable(),
});

export type InsertMarketplaceCategory = z.infer<typeof insertMarketplaceCategorySchema>;
export type MarketplaceCategory = typeof marketplaceCategories.$inferSelect;

// Apps (Listings)
export const marketplaceApps = pgTable("marketplace_apps", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    developerId: varchar("developer_id").notNull(),
    categoryId: varchar("category_id").notNull(),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull().unique(),
    shortDescription: varchar("short_description").notNull(),
    fullDescription: text("full_description").notNull(),
    logoUrl: varchar("logo_url"),
    screenshots: text("screenshots").array(),
    priceType: varchar("price_type").default("free"), // free, one_time, subscription
    price: numeric("price", { precision: 18, scale: 2 }).default("0"),
    currency: varchar("currency").default("USD"),
    tags: text("tags").array(),
    features: jsonb("features"),
    compatibility: jsonb("compatibility"), // Min version requirements etc.
    permissions: text("permissions").array(), // Required system permissions
    status: varchar("status").default("draft"), // draft, submitted, approved, rejected, suspended
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
    publishedAt: timestamp("published_at"),
    installCount: integer("install_count").default(0),
    averageRating: numeric("average_rating", { precision: 3, scale: 2 }).default("0"),
    reviewCount: integer("review_count").default(0),
});

export const insertMarketplaceAppSchema = createInsertSchema(marketplaceApps).omit({ id: true, createdAt: true, updatedAt: true, publishedAt: true, installCount: true, averageRating: true, reviewCount: true }).extend({
    developerId: z.string().min(1),
    categoryId: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    shortDescription: z.string().min(1),
    fullDescription: z.string().min(1),
    logoUrl: z.string().optional(),
    screenshots: z.array(z.string()).optional(),
    priceType: z.enum(["free", "one_time", "subscription"]).optional(),
    price: z.string().optional(),
    currency: z.string().optional(),
    tags: z.array(z.string()).optional(),
    features: z.record(z.any()).optional(),
    compatibility: z.record(z.any()).optional(),
    permissions: z.array(z.string()).optional(),
    status: z.enum(["draft", "submitted", "approved", "rejected", "suspended"]).optional(),
});

export type InsertMarketplaceApp = z.infer<typeof insertMarketplaceAppSchema>;
export type MarketplaceApp = typeof marketplaceApps.$inferSelect;

// App Versions
export const marketplaceAppVersions = pgTable("marketplace_app_versions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: varchar("app_id").notNull(),
    version: varchar("version").notNull(),
    changelog: text("changelog"),
    releaseNotes: text("release_notes"),
    minErpVersion: varchar("min_erp_version"),
    maxErpVersion: varchar("max_erp_version"),
    downloadUrl: varchar("download_url"),
    fileSize: integer("file_size"),
    checksum: varchar("checksum"),
    isLatest: boolean("is_latest").default(false),
    status: varchar("status").default("pending"), // pending, approved, rejected, archived
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceAppVersionSchema = createInsertSchema(marketplaceAppVersions).omit({ id: true, createdAt: true, publishedAt: true }).extend({
    appId: z.string().min(1),
    version: z.string().min(1),
    changelog: z.string().optional(),
    releaseNotes: z.string().optional(),
    minErpVersion: z.string().optional(),
    maxErpVersion: z.string().optional(),
    downloadUrl: z.string().optional(),
    fileSize: z.number().optional(),
    checksum: z.string().optional(),
    isLatest: z.boolean().optional(),
    status: z.enum(["pending", "approved", "rejected", "archived"]).optional(),
});

export type InsertMarketplaceAppVersion = z.infer<typeof insertMarketplaceAppVersionSchema>;
export type MarketplaceAppVersion = typeof marketplaceAppVersions.$inferSelect;

// App Installations (per tenant)
export const marketplaceInstallations = pgTable("marketplace_installations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: varchar("app_id").notNull(),
    appVersionId: varchar("app_version_id"),
    tenantId: varchar("tenant_id").notNull(),
    installedBy: varchar("installed_by").notNull(),
    status: varchar("status").default("active"), // active, suspended, uninstalled
    installedAt: timestamp("installed_at").default(sql`now()`),
    uninstalledAt: timestamp("uninstalled_at"),
    settings: jsonb("settings"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceInstallationSchema = createInsertSchema(marketplaceInstallations).omit({ id: true, createdAt: true, updatedAt: true, installedAt: true }).extend({
    appId: z.string().min(1),
    appVersionId: z.string().optional(),
    tenantId: z.string().min(1),
    installedBy: z.string().min(1),
    status: z.enum(["active", "suspended", "uninstalled"]).optional(),
    settings: z.record(z.any()).optional(),
});

export type InsertMarketplaceInstallation = z.infer<typeof insertMarketplaceInstallationSchema>;
export type MarketplaceInstallation = typeof marketplaceInstallations.$inferSelect;

// App Transactions (purchases)
export const marketplaceTransactions = pgTable("marketplace_transactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: varchar("app_id").notNull(),
    developerId: varchar("developer_id").notNull(),
    tenantId: varchar("tenant_id").notNull(),
    userId: varchar("user_id").notNull(),
    type: varchar("type").notNull(), // purchase, subscription, renewal, refund
    grossAmount: numeric("gross_amount", { precision: 18, scale: 2 }).notNull(),
    platformCommissionRate: numeric("platform_commission_rate", { precision: 5, scale: 2 }).default("0"),
    platformCommission: numeric("platform_commission", { precision: 18, scale: 2 }).default("0"),
    developerRevenue: numeric("developer_revenue", { precision: 18, scale: 2 }).notNull(),
    tax: numeric("tax", { precision: 18, scale: 2 }).default("0"),
    currency: varchar("currency").default("USD"),
    paymentMethod: varchar("payment_method"),
    paymentReference: varchar("payment_reference"),
    status: varchar("status").default("completed"), // pending, completed, failed, refunded
    invoiceUrl: varchar("invoice_url"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceTransactionSchema = createInsertSchema(marketplaceTransactions).omit({ id: true, createdAt: true }).extend({
    appId: z.string().min(1),
    developerId: z.string().min(1),
    tenantId: z.string().min(1),
    userId: z.string().min(1),
    type: z.enum(["purchase", "subscription", "renewal", "refund"]),
    grossAmount: z.string().min(1),
    platformCommissionRate: z.string().optional(),
    platformCommission: z.string().optional(),
    developerRevenue: z.string().min(1),
    tax: z.string().optional(),
    currency: z.string().optional(),
    paymentMethod: z.string().optional(),
    paymentReference: z.string().optional(),
    status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),
    invoiceUrl: z.string().optional(),
});

export type InsertMarketplaceTransaction = z.infer<typeof insertMarketplaceTransactionSchema>;
export type MarketplaceTransaction = typeof marketplaceTransactions.$inferSelect;

// App Subscriptions
export const marketplaceSubscriptions = pgTable("marketplace_subscriptions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: varchar("app_id").notNull(),
    tenantId: varchar("tenant_id").notNull(),
    userId: varchar("user_id").notNull(),
    plan: varchar("plan").notNull(), // monthly, yearly
    status: varchar("status").default("active"), // active, cancelled, expired, paused
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelledAt: timestamp("cancelled_at"),
    cancelReason: text("cancel_reason"),
    autoRenew: boolean("auto_renew").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceSubscriptionSchema = createInsertSchema(marketplaceSubscriptions).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    appId: z.string().min(1),
    tenantId: z.string().min(1),
    userId: z.string().min(1),
    plan: z.enum(["monthly", "yearly"]),
    status: z.enum(["active", "cancelled", "expired", "paused"]).optional(),
    amount: z.string().min(1),
    currency: z.string().optional(),
    currentPeriodStart: z.date(),
    currentPeriodEnd: z.date(),
    cancelledAt: z.date().optional().nullable(),
    cancelReason: z.string().optional(),
    autoRenew: z.boolean().optional(),
});

export type InsertMarketplaceSubscription = z.infer<typeof insertMarketplaceSubscriptionSchema>;
export type MarketplaceSubscription = typeof marketplaceSubscriptions.$inferSelect;

// App Reviews
export const marketplaceReviews = pgTable("marketplace_reviews", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: varchar("app_id").notNull(),
    appVersionId: varchar("app_version_id"),
    userId: varchar("user_id").notNull(),
    tenantId: varchar("tenant_id").notNull(),
    rating: integer("rating").notNull(),
    title: varchar("title"),
    content: text("content"),
    developerResponse: text("developer_response"),
    developerResponseAt: timestamp("developer_response_at"),
    status: varchar("status").default("published"), // pending, published, hidden, flagged
    helpfulCount: integer("helpful_count").default(0),
    reportedCount: integer("reported_count").default(0),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceReviewSchema = createInsertSchema(marketplaceReviews).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    appId: z.string().min(1),
    appVersionId: z.string().optional(),
    userId: z.string().min(1),
    tenantId: z.string().min(1),
    rating: z.number().min(1).max(5),
    title: z.string().optional(),
    content: z.string().optional(),
    developerResponse: z.string().optional(),
    status: z.enum(["pending", "published", "hidden", "flagged"]).optional(),
});

export type InsertMarketplaceReview = z.infer<typeof insertMarketplaceReviewSchema>;
export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;

// Developer Payouts
export const marketplacePayouts = pgTable("marketplace_payouts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    developerId: varchar("developer_id").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    status: varchar("status").default("pending"), // pending, processing, paid, failed
    paymentMethod: varchar("payment_method"),
    paymentReference: varchar("payment_reference"),
    paidAt: timestamp("paid_at"),
    statementUrl: varchar("statement_url"),
    transactionCount: integer("transaction_count").default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplacePayoutSchema = createInsertSchema(marketplacePayouts).omit({ id: true, createdAt: true }).extend({
    developerId: z.string().min(1),
    amount: z.string().min(1),
    currency: z.string().optional(),
    periodStart: z.date(),
    periodEnd: z.date(),
    status: z.enum(["pending", "processing", "paid", "failed"]).optional(),
    paymentMethod: z.string().optional(),
    paymentReference: z.string().optional(),
    paidAt: z.date().optional().nullable(),
    statementUrl: z.string().optional(),
    transactionCount: z.number().optional(),
    notes: z.string().optional(),
});

export type InsertMarketplacePayout = z.infer<typeof insertMarketplacePayoutSchema>;
export type MarketplacePayout = typeof marketplacePayouts.$inferSelect;

// Platform Commission Settings
export const marketplaceCommissionSettings = pgTable("marketplace_commission_settings", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    type: varchar("type").default("global"), // global, category, developer
    targetId: varchar("target_id"), // category_id or developer_id for specific rates
    commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).default("0"), // percentage
    minCommission: numeric("min_commission", { precision: 18, scale: 2 }),
    maxCommission: numeric("max_commission", { precision: 18, scale: 2 }),
    isActive: boolean("is_active").default(true),
    effectiveFrom: timestamp("effective_from").default(sql`now()`),
    effectiveTo: timestamp("effective_to"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceCommissionSettingSchema = createInsertSchema(marketplaceCommissionSettings).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    name: z.string().min(1),
    type: z.enum(["global", "category", "developer"]).optional(),
    targetId: z.string().optional(),
    commissionRate: z.string().optional(),
    minCommission: z.string().optional().nullable(),
    maxCommission: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    effectiveFrom: z.date().optional(),
    effectiveTo: z.date().optional().nullable(),
});

export type InsertMarketplaceCommissionSetting = z.infer<typeof insertMarketplaceCommissionSettingSchema>;
export type MarketplaceCommissionSetting = typeof marketplaceCommissionSettings.$inferSelect;

// Marketplace Audit Logs - Tracks all marketplace actions for compliance
export const marketplaceAuditLogs = pgTable("marketplace_audit_logs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(), // app, app_version, developer, payout, commission, license, review
    entityId: varchar("entity_id").notNull(),
    action: varchar("action").notNull(), // submitted, approved, rejected, archived, price_changed, commission_changed, payout_initiated, payout_completed, license_issued, license_expired
    actorId: varchar("actor_id").notNull(), // User who performed the action
    actorRole: varchar("actor_role"), // admin, developer, tenant_admin
    previousState: jsonb("previous_state"), // State before action
    newState: jsonb("new_state"), // State after action
    metadata: jsonb("metadata"), // Additional context (rejection reason, etc.)
    ipAddress: varchar("ip_address"),
    userAgent: varchar("user_agent"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceAuditLogSchema = createInsertSchema(marketplaceAuditLogs).omit({ id: true, createdAt: true }).extend({
    entityType: z.enum(["app", "app_version", "developer", "payout", "commission", "license", "review", "installation", "transaction"]),
    entityId: z.string().min(1),
    action: z.string().min(1),
    actorId: z.string().min(1),
    actorRole: z.string().optional(),
    previousState: z.record(z.any()).optional(),
    newState: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
});

export type InsertMarketplaceAuditLog = z.infer<typeof insertMarketplaceAuditLogSchema>;
export type MarketplaceAuditLog = typeof marketplaceAuditLogs.$inferSelect;

// Marketplace Licenses - Tracks app licenses per tenant with expiry and grace period
export const marketplaceLicenses = pgTable("marketplace_licenses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: varchar("app_id").notNull(),
    appVersionId: varchar("app_version_id"),
    tenantId: varchar("tenant_id").notNull(),
    userId: varchar("user_id").notNull(), // Who purchased the license
    transactionId: varchar("transaction_id"), // Related purchase transaction
    licenseKey: varchar("license_key").unique(),
    licenseType: varchar("license_type").notNull(), // perpetual, subscription, trial
    status: varchar("status").default("active"), // active, expired, suspended, revoked
    seats: integer("seats").default(0), // 0 = unlimited
    usedSeats: integer("used_seats").default(0),
    validFrom: timestamp("valid_from").default(sql`now()`),
    validUntil: timestamp("valid_until"), // null for perpetual
    gracePeriodDays: integer("grace_period_days").default(7),
    gracePeriodEnd: timestamp("grace_period_end"),
    lastValidatedAt: timestamp("last_validated_at"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertMarketplaceLicenseSchema = createInsertSchema(marketplaceLicenses).omit({ id: true, createdAt: true, updatedAt: true }).extend({
    appId: z.string().min(1),
    appVersionId: z.string().optional(),
    tenantId: z.string().min(1),
    userId: z.string().min(1),
    transactionId: z.string().optional(),
    licenseKey: z.string().optional(),
    licenseType: z.enum(["perpetual", "subscription", "trial"]),
    status: z.enum(["active", "expired", "suspended", "revoked"]).optional(),
    seats: z.number().optional(),
    usedSeats: z.number().optional(),
    validFrom: z.date().optional(),
    validUntil: z.date().optional().nullable(),
    gracePeriodDays: z.number().optional(),
    gracePeriodEnd: z.date().optional().nullable(),
    lastValidatedAt: z.date().optional().nullable(),
    metadata: z.record(z.any()).optional(),
});

export type InsertMarketplaceLicense = z.infer<typeof insertMarketplaceLicenseSchema>;
export type MarketplaceLicense = typeof marketplaceLicenses.$inferSelect;

// App Dependencies - Tracks which apps depend on other apps
export const marketplaceAppDependencies = pgTable("marketplace_app_dependencies", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    appId: varchar("app_id").notNull(),
    dependsOnAppId: varchar("depends_on_app_id").notNull(),
    minVersion: varchar("min_version"),
    maxVersion: varchar("max_version"),
    isRequired: boolean("is_required").default(true), // required vs optional
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMarketplaceAppDependencySchema = createInsertSchema(marketplaceAppDependencies).omit({ id: true, createdAt: true }).extend({
    appId: z.string().min(1),
    dependsOnAppId: z.string().min(1),
    minVersion: z.string().optional(),
    maxVersion: z.string().optional(),
    isRequired: z.boolean().optional(),
});

export type InsertMarketplaceAppDependency = z.infer<typeof insertMarketplaceAppDependencySchema>;
export type MarketplaceAppDependency = typeof marketplaceAppDependencies.$inferSelect;
