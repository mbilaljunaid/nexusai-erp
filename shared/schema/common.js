"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDashboardWidgetSchema = exports.dashboardWidgets = exports.insertUserNotificationSchema = exports.userNotifications = exports.insertAuditLogSchema = exports.auditLogs = exports.insertIndustryAppRecommendationSchema = exports.industryAppRecommendations = exports.insertIndustryDeploymentSchema = exports.industryDeployments = exports.insertIndustrySchema = exports.industries = exports.insertTenantSchema = exports.tenants = exports.insertUserFeedbackSchema = exports.userFeedback = exports.insertContactSubmissionSchema = exports.contactSubmissions = exports.insertDemoSchema = exports.demos = exports.insertFormDataSchema = exports.formData = exports.insertProjectSchema = exports.projects = exports.insertUserSchema = exports.users = exports.sessions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== SESSION STORAGE (Replit Auth) ==========
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// ========== USERS & PROJECTS ==========
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    email: (0, pg_core_1.varchar)("email").unique(),
    password: (0, pg_core_1.varchar)("password"),
    name: (0, pg_core_1.varchar)("name"),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    role: (0, pg_core_1.varchar)("role").default("user"),
    tenantId: (0, pg_core_1.varchar)("tenant_id"), // Link to tenants table
    permissions: (0, pg_core_1.jsonb)("permissions"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).extend({
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    firstName: zod_1.z.string().optional().nullable(),
    lastName: zod_1.z.string().optional().nullable(),
    profileImageUrl: zod_1.z.string().optional().nullable(),
    role: zod_1.z.string().optional(),
    tenantId: zod_1.z.string().optional(),
    permissions: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.projects = (0, pg_core_1.pgTable)("projects", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    ownerId: (0, pg_core_1.varchar)("owner_id").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertProjectSchema = (0, drizzle_zod_1.createInsertSchema)(exports.projects).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().nullable(),
    ownerId: zod_1.z.string().min(1),
});
// ========== FORM DATA PERSISTENCE ==========
exports.formData = (0, pg_core_1.pgTable)("form_data", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    formId: (0, pg_core_1.varchar)("form_id").notNull(),
    data: (0, pg_core_1.jsonb)("data").notNull(),
    status: (0, pg_core_1.varchar)("status").default("draft"), // draft, submitted, approved, rejected
    submittedBy: (0, pg_core_1.varchar)("submitted_by"),
    submittedAt: (0, pg_core_1.timestamp)("submitted_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertFormDataSchema = (0, drizzle_zod_1.createInsertSchema)(exports.formData).extend({
    formId: zod_1.z.string().min(1),
    data: zod_1.z.record(zod_1.z.any()),
    status: zod_1.z.string().optional(),
    submittedBy: zod_1.z.string().optional().nullable(),
    submittedAt: zod_1.z.date().optional().nullable(),
});
// ========== DEMO MANAGEMENT ==========
exports.demos = (0, pg_core_1.pgTable)("demos", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    email: (0, pg_core_1.varchar)("email").notNull(),
    company: (0, pg_core_1.varchar)("company").notNull(),
    industry: (0, pg_core_1.varchar)("industry").notNull(),
    status: (0, pg_core_1.varchar)("status").default("active"), // active, completed, expired
    demoToken: (0, pg_core_1.varchar)("demo_token").unique(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
});
exports.insertDemoSchema = (0, drizzle_zod_1.createInsertSchema)(exports.demos).extend({
    email: zod_1.z.string().email(),
    company: zod_1.z.string().min(1),
    industry: zod_1.z.string().min(1),
    status: zod_1.z.string().optional(),
    expiresAt: zod_1.z.date().optional().nullable(),
});
// ========== CONTACT SUBMISSIONS ==========
exports.contactSubmissions = (0, pg_core_1.pgTable)("contact_submissions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    email: (0, pg_core_1.varchar)("email").notNull(),
    company: (0, pg_core_1.varchar)("company"),
    subject: (0, pg_core_1.varchar)("subject").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    status: (0, pg_core_1.varchar)("status").default("new"), // new, read, replied, closed
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertContactSubmissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contactSubmissions).extend({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    company: zod_1.z.string().optional(),
    subject: zod_1.z.string().min(1, "Subject is required"),
    message: zod_1.z.string().min(10, "Message must be at least 10 characters"),
    status: zod_1.z.string().optional(),
});
// ========== USER FEEDBACK ==========
exports.userFeedback = (0, pg_core_1.pgTable)("user_feedback", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id"),
    type: (0, pg_core_1.varchar)("type").notNull(), // suggestion, bug, feature, other
    category: (0, pg_core_1.varchar)("category"), // ui, performance, functionality, other
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    priority: (0, pg_core_1.varchar)("priority").default("medium"), // low, medium, high, critical
    status: (0, pg_core_1.varchar)("status").default("new"), // new, reviewed, in_progress, resolved, closed
    attachmentUrl: (0, pg_core_1.varchar)("attachment_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertUserFeedbackSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userFeedback).extend({
    userId: zod_1.z.string().optional(),
    type: zod_1.z.enum(["suggestion", "bug", "feature", "other"]),
    category: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    priority: zod_1.z.enum(["low", "medium", "high", "critical"]).optional(),
    status: zod_1.z.string().optional(),
    attachmentUrl: zod_1.z.string().optional(),
});
// ========== TENANTS & INDUSTRY DEPLOYMENTS ==========
exports.tenants = (0, pg_core_1.pgTable)("tenants", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    slug: (0, pg_core_1.varchar)("slug").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    logoUrl: (0, pg_core_1.varchar)("logo_url"),
    status: (0, pg_core_1.varchar)("status").default("active"), // active, inactive, suspended
    settings: (0, pg_core_1.jsonb)("settings"), // tenant-specific settings
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTenantSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tenants).extend({
    name: zod_1.z.string().min(1, "Tenant name is required"),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "inactive", "suspended"]).optional(),
    settings: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.industries = (0, pg_core_1.pgTable)("industries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    slug: (0, pg_core_1.varchar)("slug").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    icon: (0, pg_core_1.varchar)("icon"),
    defaultModules: (0, pg_core_1.text)("default_modules").array(), // modules enabled by default
    configSchema: (0, pg_core_1.jsonb)("config_schema"), // JSON schema for industry-specific config
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertIndustrySchema = (0, drizzle_zod_1.createInsertSchema)(exports.industries).extend({
    name: zod_1.z.string().min(1, "Industry name is required"),
    slug: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    defaultModules: zod_1.z.array(zod_1.z.string()).optional(),
    configSchema: zod_1.z.record(zod_1.z.any()).optional(),
    isActive: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().optional(),
});
exports.industryDeployments = (0, pg_core_1.pgTable)("industry_deployments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    industryId: (0, pg_core_1.varchar)("industry_id").notNull(),
    enabledModules: (0, pg_core_1.text)("enabled_modules").array(), // can override default modules
    customConfig: (0, pg_core_1.jsonb)("custom_config"), // industry-specific customizations
    status: (0, pg_core_1.varchar)("status").default("active"), // active, inactive, pending
    deployedBy: (0, pg_core_1.varchar)("deployed_by"),
    deployedAt: (0, pg_core_1.timestamp)("deployed_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertIndustryDeploymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.industryDeployments).extend({
    tenantId: zod_1.z.string().min(1),
    industryId: zod_1.z.string().min(1),
    enabledModules: zod_1.z.array(zod_1.z.string()).optional(),
    customConfig: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.enum(["active", "inactive", "pending"]).optional(),
    deployedBy: zod_1.z.string().optional(),
});
exports.industryAppRecommendations = (0, pg_core_1.pgTable)("industry_app_recommendations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    industryId: (0, pg_core_1.varchar)("industry_id").notNull(),
    appId: (0, pg_core_1.varchar)("app_id").notNull(),
    ranking: (0, pg_core_1.integer)("ranking").default(0),
    reason: (0, pg_core_1.text)("reason"), // Why this app is recommended
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertIndustryAppRecommendationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.industryAppRecommendations).extend({
    industryId: zod_1.z.string().min(1),
    appId: zod_1.z.string().min(1),
    ranking: zod_1.z.number().optional(),
    reason: zod_1.z.string().optional(),
});
// ========== AUDIT LOGS ==========
exports.auditLogs = (0, pg_core_1.pgTable)("audit_logs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id"),
    action: (0, pg_core_1.varchar)("action").notNull(),
    entityType: (0, pg_core_1.varchar)("entity_type"),
    entityId: (0, pg_core_1.varchar)("entity_id"),
    oldValue: (0, pg_core_1.jsonb)("old_value"),
    newValue: (0, pg_core_1.jsonb)("new_value"),
    ipAddress: (0, pg_core_1.varchar)("ip_address"),
    userAgent: (0, pg_core_1.varchar)("user_agent"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.auditLogs).extend({
    userId: zod_1.z.string().optional(),
    action: zod_1.z.string().min(1),
    entityType: zod_1.z.string().optional(),
    entityId: zod_1.z.string().optional(),
    oldValue: zod_1.z.record(zod_1.z.any()).optional(),
    newValue: zod_1.z.record(zod_1.z.any()).optional(),
    ipAddress: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
});
// ========== USER NOTIFICATIONS ==========
exports.userNotifications = (0, pg_core_1.pgTable)("user_notifications", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // "app_update" | "new_feature" | "recommendation" | "badge_earned" | "system"
    title: (0, pg_core_1.varchar)("title").notNull(),
    message: (0, pg_core_1.text)("message"),
    icon: (0, pg_core_1.varchar)("icon"),
    actionUrl: (0, pg_core_1.varchar)("action_url"),
    referenceType: (0, pg_core_1.varchar)("reference_type"), // "app" | "badge" | "review"
    referenceId: (0, pg_core_1.varchar)("reference_id"),
    isRead: (0, pg_core_1.boolean)("is_read").default(false),
    isArchived: (0, pg_core_1.boolean)("is_archived").default(false),
    priority: (0, pg_core_1.varchar)("priority").default("normal"), // "low" | "normal" | "high"
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    readAt: (0, pg_core_1.timestamp)("read_at"),
});
exports.insertUserNotificationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userNotifications).extend({
    userId: zod_1.z.string().min(1),
    type: zod_1.z.enum(["app_update", "new_feature", "recommendation", "badge_earned", "system"]),
    title: zod_1.z.string().min(1),
    message: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    actionUrl: zod_1.z.string().optional(),
    referenceType: zod_1.z.string().optional(),
    referenceId: zod_1.z.string().optional(),
    isRead: zod_1.z.boolean().optional(),
    isArchived: zod_1.z.boolean().optional(),
    priority: zod_1.z.enum(["low", "normal", "high"]).optional(),
});
// ========== DASHBOARD WIDGETS ==========
exports.dashboardWidgets = (0, pg_core_1.pgTable)("dashboard_widgets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    widgetType: (0, pg_core_1.varchar)("widget_type").notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    config: (0, pg_core_1.jsonb)("config"),
    position: (0, pg_core_1.integer)("position").default(0),
    size: (0, pg_core_1.varchar)("size").default("medium"),
    isVisible: (0, pg_core_1.boolean)("is_visible").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertDashboardWidgetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dashboardWidgets).extend({
    userId: zod_1.z.string().min(1),
    widgetType: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    position: zod_1.z.number().optional(),
    size: zod_1.z.string().optional(),
    isVisible: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=common.js.map