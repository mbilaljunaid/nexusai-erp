"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMarketplaceAppDependencySchema = exports.marketplaceAppDependencies = exports.insertMarketplaceLicenseSchema = exports.marketplaceLicenses = exports.insertMarketplaceAuditLogSchema = exports.marketplaceAuditLogs = exports.insertMarketplaceCommissionSettingSchema = exports.marketplaceCommissionSettings = exports.insertMarketplacePayoutSchema = exports.marketplacePayouts = exports.insertMarketplaceReviewSchema = exports.marketplaceReviews = exports.insertMarketplaceSubscriptionSchema = exports.marketplaceSubscriptions = exports.insertMarketplaceTransactionSchema = exports.marketplaceTransactions = exports.insertMarketplaceInstallationSchema = exports.marketplaceInstallations = exports.insertMarketplaceAppVersionSchema = exports.marketplaceAppVersions = exports.insertMarketplaceAppSchema = exports.marketplaceApps = exports.insertMarketplaceCategorySchema = exports.marketplaceCategories = exports.insertMarketplaceDeveloperSchema = exports.marketplaceDevelopers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== MARKETPLACE MODULE ==========
// App Developers/Publishers
exports.marketplaceDevelopers = (0, pg_core_1.pgTable)("marketplace_developers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    website: (0, pg_core_1.varchar)("website"),
    supportEmail: (0, pg_core_1.varchar)("support_email"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, approved, suspended
    verified: (0, pg_core_1.boolean)("verified").default(false),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue", { precision: 18, scale: 2 }).default("0"),
    totalPayouts: (0, pg_core_1.numeric)("total_payouts", { precision: 18, scale: 2 }).default("0"),
    totalApps: (0, pg_core_1.integer)("total_apps").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceDeveloperSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceDevelopers).extend({
    userId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    website: zod_1.z.string().optional(),
    supportEmail: zod_1.z.string().email().optional(),
    status: zod_1.z.enum(["pending", "approved", "suspended"]).optional(),
    verified: zod_1.z.boolean().optional(),
});
// App Categories
exports.marketplaceCategories = (0, pg_core_1.pgTable)("marketplace_categories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    slug: (0, pg_core_1.varchar)("slug").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.varchar)("icon"),
    parentId: (0, pg_core_1.varchar)("parent_id"), // for nested categories
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceCategories).extend({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    parentId: zod_1.z.string().optional().nullable(),
});
// Apps (Listings)
exports.marketplaceApps = (0, pg_core_1.pgTable)("marketplace_apps", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    developerId: (0, pg_core_1.varchar)("developer_id").notNull(),
    categoryId: (0, pg_core_1.varchar)("category_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    slug: (0, pg_core_1.varchar)("slug").notNull().unique(),
    shortDescription: (0, pg_core_1.varchar)("short_description").notNull(),
    fullDescription: (0, pg_core_1.text)("full_description").notNull(),
    logoUrl: (0, pg_core_1.varchar)("logo_url"),
    screenshots: (0, pg_core_1.text)("screenshots").array(),
    priceType: (0, pg_core_1.varchar)("price_type").default("free"), // free, one_time, subscription
    price: (0, pg_core_1.numeric)("price", { precision: 18, scale: 2 }).default("0"),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    tags: (0, pg_core_1.text)("tags").array(),
    features: (0, pg_core_1.jsonb)("features"),
    compatibility: (0, pg_core_1.jsonb)("compatibility"), // Min version requirements etc.
    permissions: (0, pg_core_1.text)("permissions").array(), // Required system permissions
    status: (0, pg_core_1.varchar)("status").default("draft"), // draft, submitted, approved, rejected, suspended
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
    publishedAt: (0, pg_core_1.timestamp)("published_at"),
    installCount: (0, pg_core_1.integer)("install_count").default(0),
    averageRating: (0, pg_core_1.numeric)("average_rating", { precision: 3, scale: 2 }).default("0"),
    reviewCount: (0, pg_core_1.integer)("review_count").default(0),
    supportedIndustries: (0, pg_core_1.text)("supported_industries").array(),
    subscriptionPriceMonthly: (0, pg_core_1.numeric)("subscription_price_monthly", { precision: 18, scale: 2 }),
    subscriptionPriceYearly: (0, pg_core_1.numeric)("subscription_price_yearly", { precision: 18, scale: 2 }),
    totalRevenue: (0, pg_core_1.numeric)("total_revenue", { precision: 18, scale: 2 }).default("0"),
    // Additional Metadata
    deploymentType: (0, pg_core_1.varchar)("deployment_type").default("cloud"), // cloud, on_premise, hybrid
    demoUrl: (0, pg_core_1.varchar)("demo_url"),
    documentationUrl: (0, pg_core_1.varchar)("documentation_url"),
    githubUrl: (0, pg_core_1.varchar)("github_url"),
    supportUrl: (0, pg_core_1.varchar)("support_url"),
    supportEmail: (0, pg_core_1.varchar)("support_email"),
    licenseType: (0, pg_core_1.varchar)("license_type").default("proprietary"), // open_source, proprietary, mit, etc.
    featuredOrder: (0, pg_core_1.integer)("featured_order"), // If set, shows in featured section
});
exports.insertMarketplaceAppSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceApps).extend({
    developerId: zod_1.z.string().min(1),
    categoryId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    shortDescription: zod_1.z.string().min(1),
    fullDescription: zod_1.z.string().min(1),
    logoUrl: zod_1.z.string().optional(),
    screenshots: zod_1.z.array(zod_1.z.string()).optional(),
    priceType: zod_1.z.enum(["free", "one_time", "subscription"]).optional(),
    price: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    features: zod_1.z.record(zod_1.z.any()).optional(),
    compatibility: zod_1.z.record(zod_1.z.any()).optional(),
    permissions: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(["draft", "submitted", "approved", "rejected", "suspended"]).optional(),
});
// App Versions
exports.marketplaceAppVersions = (0, pg_core_1.pgTable)("marketplace_app_versions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    version: (0, pg_core_1.varchar)("version").notNull(),
    changelog: (0, pg_core_1.text)("changelog"),
    releaseNotes: (0, pg_core_1.text)("release_notes"),
    minErpVersion: (0, pg_core_1.varchar)("min_erp_version"),
    maxErpVersion: (0, pg_core_1.varchar)("max_erp_version"),
    downloadUrl: (0, pg_core_1.varchar)("download_url"),
    fileSize: (0, pg_core_1.integer)("file_size"),
    checksum: (0, pg_core_1.varchar)("checksum"),
    isLatest: (0, pg_core_1.boolean)("is_latest").default(false),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, approved, rejected, archived
    publishedAt: (0, pg_core_1.timestamp)("published_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceAppVersionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceAppVersions).extend({
    appId: zod_1.z.string().min(1),
    version: zod_1.z.string().min(1),
    changelog: zod_1.z.string().optional(),
    releaseNotes: zod_1.z.string().optional(),
    minErpVersion: zod_1.z.string().optional(),
    maxErpVersion: zod_1.z.string().optional(),
    downloadUrl: zod_1.z.string().optional(),
    fileSize: zod_1.z.number().optional(),
    checksum: zod_1.z.string().optional(),
    isLatest: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(["pending", "approved", "rejected", "archived"]).optional(),
});
// App Installations (per tenant)
exports.marketplaceInstallations = (0, pg_core_1.pgTable)("marketplace_installations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    appVersionId: (0, pg_core_1.varchar)("app_version_id"),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    installedBy: (0, pg_core_1.varchar)("installed_by").notNull(),
    status: (0, pg_core_1.varchar)("status").default("active"), // active, suspended, uninstalled
    installedAt: (0, pg_core_1.timestamp)("installed_at").default((0, drizzle_orm_1.sql) `now()`),
    uninstalledAt: (0, pg_core_1.timestamp)("uninstalled_at"),
    settings: (0, pg_core_1.jsonb)("settings"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceInstallationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceInstallations).extend({
    appId: zod_1.z.string().min(1),
    appVersionId: zod_1.z.string().optional(),
    tenantId: zod_1.z.string().min(1),
    installedBy: zod_1.z.string().min(1),
    status: zod_1.z.enum(["active", "suspended", "uninstalled"]).optional(),
    settings: zod_1.z.record(zod_1.z.any()).optional(),
});
// App Transactions (purchases)
exports.marketplaceTransactions = (0, pg_core_1.pgTable)("marketplace_transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    developerId: (0, pg_core_1.varchar)("developer_id").notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // purchase, subscription, renewal, refund
    grossAmount: (0, pg_core_1.numeric)("gross_amount", { precision: 18, scale: 2 }).notNull(),
    platformCommissionRate: (0, pg_core_1.numeric)("platform_commission_rate", { precision: 5, scale: 2 }).default("0"),
    platformCommission: (0, pg_core_1.numeric)("platform_commission", { precision: 18, scale: 2 }).default("0"),
    developerRevenue: (0, pg_core_1.numeric)("developer_revenue", { precision: 18, scale: 2 }).notNull(),
    tax: (0, pg_core_1.numeric)("tax", { precision: 18, scale: 2 }).default("0"),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    paymentMethod: (0, pg_core_1.varchar)("payment_method"),
    paymentReference: (0, pg_core_1.varchar)("payment_reference"),
    status: (0, pg_core_1.varchar)("status").default("completed"), // pending, completed, failed, refunded
    invoiceUrl: (0, pg_core_1.varchar)("invoice_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceTransactions).extend({
    appId: zod_1.z.string().min(1),
    developerId: zod_1.z.string().min(1),
    tenantId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1),
    type: zod_1.z.enum(["purchase", "subscription", "renewal", "refund"]),
    grossAmount: zod_1.z.string().min(1),
    platformCommissionRate: zod_1.z.string().optional(),
    platformCommission: zod_1.z.string().optional(),
    developerRevenue: zod_1.z.string().min(1),
    tax: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.string().optional(),
    paymentReference: zod_1.z.string().optional(),
    status: zod_1.z.enum(["pending", "completed", "failed", "refunded"]).optional(),
    invoiceUrl: zod_1.z.string().optional(),
});
// App Subscriptions
exports.marketplaceSubscriptions = (0, pg_core_1.pgTable)("marketplace_subscriptions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    plan: (0, pg_core_1.varchar)("plan").notNull(), // monthly, yearly
    status: (0, pg_core_1.varchar)("status").default("active"), // active, cancelled, expired, paused
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    currentPeriodStart: (0, pg_core_1.timestamp)("current_period_start").notNull(),
    currentPeriodEnd: (0, pg_core_1.timestamp)("current_period_end").notNull(),
    cancelledAt: (0, pg_core_1.timestamp)("cancelled_at"),
    cancelReason: (0, pg_core_1.text)("cancel_reason"),
    autoRenew: (0, pg_core_1.boolean)("auto_renew").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceSubscriptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceSubscriptions).extend({
    appId: zod_1.z.string().min(1),
    tenantId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1),
    plan: zod_1.z.enum(["monthly", "yearly"]),
    status: zod_1.z.enum(["active", "cancelled", "expired", "paused"]).optional(),
    amount: zod_1.z.string().min(1),
    currency: zod_1.z.string().optional(),
    currentPeriodStart: zod_1.z.date(),
    currentPeriodEnd: zod_1.z.date(),
    cancelledAt: zod_1.z.date().optional().nullable(),
    cancelReason: zod_1.z.string().optional(),
    autoRenew: zod_1.z.boolean().optional(),
});
// App Reviews
exports.marketplaceReviews = (0, pg_core_1.pgTable)("marketplace_reviews", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    appVersionId: (0, pg_core_1.varchar)("app_version_id"),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    rating: (0, pg_core_1.integer)("rating").notNull(),
    title: (0, pg_core_1.varchar)("title"),
    content: (0, pg_core_1.text)("content"),
    developerResponse: (0, pg_core_1.text)("developer_response"),
    developerResponseAt: (0, pg_core_1.timestamp)("developer_response_at"),
    status: (0, pg_core_1.varchar)("status").default("published"), // pending, published, hidden, flagged
    helpfulCount: (0, pg_core_1.integer)("helpful_count").default(0),
    reportedCount: (0, pg_core_1.integer)("reported_count").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceReviewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceReviews).extend({
    appId: zod_1.z.string().min(1),
    appVersionId: zod_1.z.string().optional(),
    userId: zod_1.z.string().min(1),
    tenantId: zod_1.z.string().min(1),
    rating: zod_1.z.number().min(1).max(5),
    title: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    developerResponse: zod_1.z.string().optional(),
    status: zod_1.z.enum(["pending", "published", "hidden", "flagged"]).optional(),
});
// Developer Payouts
exports.marketplacePayouts = (0, pg_core_1.pgTable)("marketplace_payouts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    developerId: (0, pg_core_1.varchar)("developer_id").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    periodStart: (0, pg_core_1.timestamp)("period_start").notNull(),
    periodEnd: (0, pg_core_1.timestamp)("period_end").notNull(),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, processing, paid, failed
    paymentMethod: (0, pg_core_1.varchar)("payment_method"),
    paymentReference: (0, pg_core_1.varchar)("payment_reference"),
    paidAt: (0, pg_core_1.timestamp)("paid_at"),
    statementUrl: (0, pg_core_1.varchar)("statement_url"),
    transactionCount: (0, pg_core_1.integer)("transaction_count").default(0),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplacePayoutSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplacePayouts).extend({
    developerId: zod_1.z.string().min(1),
    amount: zod_1.z.string().min(1),
    currency: zod_1.z.string().optional(),
    periodStart: zod_1.z.date(),
    periodEnd: zod_1.z.date(),
    status: zod_1.z.enum(["pending", "processing", "paid", "failed"]).optional(),
    paymentMethod: zod_1.z.string().optional(),
    paymentReference: zod_1.z.string().optional(),
    paidAt: zod_1.z.date().optional().nullable(),
    statementUrl: zod_1.z.string().optional(),
    transactionCount: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
});
// Platform Commission Settings
exports.marketplaceCommissionSettings = (0, pg_core_1.pgTable)("marketplace_commission_settings", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type").default("global"), // global, category, developer
    targetId: (0, pg_core_1.varchar)("target_id"), // category_id or developer_id for specific rates
    commissionRate: (0, pg_core_1.numeric)("commission_rate", { precision: 5, scale: 2 }).default("0"), // percentage
    minCommission: (0, pg_core_1.numeric)("min_commission", { precision: 18, scale: 2 }),
    maxCommission: (0, pg_core_1.numeric)("max_commission", { precision: 18, scale: 2 }),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    effectiveFrom: (0, pg_core_1.timestamp)("effective_from").default((0, drizzle_orm_1.sql) `now()`),
    effectiveTo: (0, pg_core_1.timestamp)("effective_to"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceCommissionSettingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceCommissionSettings).extend({
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(["global", "category", "developer"]).optional(),
    targetId: zod_1.z.string().optional(),
    commissionRate: zod_1.z.string().optional(),
    minCommission: zod_1.z.string().optional().nullable(),
    maxCommission: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
    effectiveFrom: zod_1.z.date().optional(),
    effectiveTo: zod_1.z.date().optional().nullable(),
});
// Marketplace Audit Logs - Tracks all marketplace actions for compliance
exports.marketplaceAuditLogs = (0, pg_core_1.pgTable)("marketplace_audit_logs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(), // app, app_version, developer, payout, commission, license, review
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    action: (0, pg_core_1.varchar)("action").notNull(), // submitted, approved, rejected, archived, price_changed, commission_changed, payout_initiated, payout_completed, license_issued, license_expired
    actorId: (0, pg_core_1.varchar)("actor_id").notNull(), // User who performed the action
    actorRole: (0, pg_core_1.varchar)("actor_role"), // admin, developer, tenant_admin
    previousState: (0, pg_core_1.jsonb)("previous_state"), // State before action
    newState: (0, pg_core_1.jsonb)("new_state"), // State after action
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional context (rejection reason, etc.)
    ipAddress: (0, pg_core_1.varchar)("ip_address"),
    userAgent: (0, pg_core_1.varchar)("user_agent"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceAuditLogs).extend({
    entityType: zod_1.z.enum(["app", "app_version", "developer", "payout", "commission", "license", "review", "installation", "transaction"]),
    entityId: zod_1.z.string().min(1),
    action: zod_1.z.string().min(1),
    actorId: zod_1.z.string().min(1),
    actorRole: zod_1.z.string().optional(),
    previousState: zod_1.z.record(zod_1.z.any()).optional(),
    newState: zod_1.z.record(zod_1.z.any()).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
});
// Marketplace Licenses - Tracks app licenses per tenant with expiry and grace period
exports.marketplaceLicenses = (0, pg_core_1.pgTable)("marketplace_licenses", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    appVersionId: (0, pg_core_1.varchar)("app_version_id"),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(), // Who purchased the license
    transactionId: (0, pg_core_1.varchar)("transaction_id"), // Related purchase transaction
    licenseKey: (0, pg_core_1.varchar)("license_key").unique(),
    licenseType: (0, pg_core_1.varchar)("license_type").notNull(), // perpetual, subscription, trial
    status: (0, pg_core_1.varchar)("status").default("active"), // active, expired, suspended, revoked
    seats: (0, pg_core_1.integer)("seats").default(0), // 0 = unlimited
    usedSeats: (0, pg_core_1.integer)("used_seats").default(0),
    validFrom: (0, pg_core_1.timestamp)("valid_from").default((0, drizzle_orm_1.sql) `now()`),
    validUntil: (0, pg_core_1.timestamp)("valid_until"), // null for perpetual
    gracePeriodDays: (0, pg_core_1.integer)("grace_period_days").default(7),
    gracePeriodEnd: (0, pg_core_1.timestamp)("grace_period_end"),
    lastValidatedAt: (0, pg_core_1.timestamp)("last_validated_at"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceLicenseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceLicenses).extend({
    appId: zod_1.z.string().min(1),
    appVersionId: zod_1.z.string().optional(),
    tenantId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1),
    transactionId: zod_1.z.string().optional(),
    licenseKey: zod_1.z.string().optional(),
    licenseType: zod_1.z.enum(["perpetual", "subscription", "trial"]),
    status: zod_1.z.enum(["active", "expired", "suspended", "revoked"]).optional(),
    seats: zod_1.z.number().optional(),
    usedSeats: zod_1.z.number().optional(),
    validFrom: zod_1.z.date().optional(),
    validUntil: zod_1.z.date().optional().nullable(),
    gracePeriodDays: zod_1.z.number().optional(),
    gracePeriodEnd: zod_1.z.date().optional().nullable(),
    lastValidatedAt: zod_1.z.date().optional().nullable(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// App Dependencies - Tracks which apps depend on other apps
exports.marketplaceAppDependencies = (0, pg_core_1.pgTable)("marketplace_app_dependencies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    dependsOnAppId: (0, pg_core_1.varchar)("depends_on_app_id").notNull(),
    minVersion: (0, pg_core_1.varchar)("min_version"),
    maxVersion: (0, pg_core_1.varchar)("max_version"),
    isRequired: (0, pg_core_1.boolean)("is_required").default(true), // required vs optional
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertMarketplaceAppDependencySchema = (0, drizzle_zod_1.createInsertSchema)(exports.marketplaceAppDependencies).extend({
    appId: zod_1.z.string().min(1),
    dependsOnAppId: zod_1.z.string().min(1),
    minVersion: zod_1.z.string().optional(),
    maxVersion: zod_1.z.string().optional(),
    isRequired: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=marketplace.js.map