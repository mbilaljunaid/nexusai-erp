import { pgTable, varchar, text, timestamp, numeric, jsonb, boolean, integer, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== SESSION STORAGE (Replit Auth) ==========
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// ========== USERS & PROJECTS ==========
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  name: varchar("name"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  email: z.string().email().optional(),
  password: z.string().optional(),
  name: z.string().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  role: z.string().optional(),
  permissions: z.record(z.any()).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Type for upsert operations (Replit Auth)
export type UpsertUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  ownerId: z.string().min(1),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ========== FORM DATA PERSISTENCE ==========
export const formData = pgTable("form_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull(),
  data: jsonb("data").notNull(),
  status: varchar("status").default("draft"), // draft, submitted, approved, rejected
  submittedBy: varchar("submitted_by"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertFormDataSchema = createInsertSchema(formData).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  formId: z.string().min(1),
  data: z.record(z.any()),
  status: z.string().optional(),
  submittedBy: z.string().optional().nullable(),
  submittedAt: z.date().optional().nullable(),
});

export type InsertFormData = z.infer<typeof insertFormDataSchema>;
export type FormDataRecord = typeof formData.$inferSelect;

// ========== DEMO MANAGEMENT ==========
export const demos = pgTable("demos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  company: varchar("company").notNull(),
  industry: varchar("industry").notNull(),
  status: varchar("status").default("active"), // active, completed, expired
  demoToken: varchar("demo_token").unique(),
  createdAt: timestamp("created_at").default(sql`now()`),
  expiresAt: timestamp("expires_at"),
});

export const insertDemoSchema = createInsertSchema(demos).omit({ id: true, createdAt: true, demoToken: true }).extend({
  email: z.string().email(),
  company: z.string().min(1),
  industry: z.string().min(1),
  status: z.string().optional(),
  expiresAt: z.date().optional().nullable(),
});

export type InsertDemo = z.infer<typeof insertDemoSchema>;
export type Demo = typeof demos.$inferSelect;

// ========== CONTACT SUBMISSIONS ==========
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  company: varchar("company"),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("new"), // new, read, replied, closed
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  status: z.string().optional(),
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// ========== USER FEEDBACK ==========
export const userFeedback = pgTable("user_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  type: varchar("type").notNull(), // suggestion, bug, feature, other
  category: varchar("category"), // ui, performance, functionality, other
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  status: varchar("status").default("new"), // new, reviewed, in_progress, resolved, closed
  attachmentUrl: varchar("attachment_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  userId: z.string().optional(),
  type: z.enum(["suggestion", "bug", "feature", "other"]),
  category: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;

// ========== TENANTS & INDUSTRY DEPLOYMENTS ==========
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  status: varchar("status").default("active"), // active, inactive, suspended
  settings: jsonb("settings"), // tenant-specific settings
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  name: z.string().min(1, "Tenant name is required"),
  slug: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  settings: z.record(z.any()).optional(),
});

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

export const industries = pgTable("industries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  icon: varchar("icon"),
  defaultModules: text("default_modules").array(), // modules enabled by default
  configSchema: jsonb("config_schema"), // JSON schema for industry-specific config
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertIndustrySchema = createInsertSchema(industries).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1, "Industry name is required"),
  slug: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  defaultModules: z.array(z.string()).optional(),
  configSchema: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Industry = typeof industries.$inferSelect;

export const industryDeployments = pgTable("industry_deployments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  industryId: varchar("industry_id").notNull(),
  enabledModules: text("enabled_modules").array(), // can override default modules
  customConfig: jsonb("custom_config"), // industry-specific customizations
  status: varchar("status").default("active"), // active, inactive, pending
  deployedBy: varchar("deployed_by"),
  deployedAt: timestamp("deployed_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertIndustryDeploymentSchema = createInsertSchema(industryDeployments).omit({ id: true, deployedAt: true, updatedAt: true }).extend({
  tenantId: z.string().min(1),
  industryId: z.string().min(1),
  enabledModules: z.array(z.string()).optional(),
  customConfig: z.record(z.any()).optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  deployedBy: z.string().optional(),
});

export type InsertIndustryDeployment = z.infer<typeof insertIndustryDeploymentSchema>;
export type IndustryDeployment = typeof industryDeployments.$inferSelect;

export const industryAppRecommendations = pgTable("industry_app_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  industryId: varchar("industry_id").notNull(),
  appId: varchar("app_id").notNull(),
  ranking: integer("ranking").default(0),
  reason: text("reason"), // Why this app is recommended
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertIndustryAppRecommendationSchema = createInsertSchema(industryAppRecommendations).omit({ id: true, createdAt: true }).extend({
  industryId: z.string().min(1),
  appId: z.string().min(1),
  ranking: z.number().optional(),
  reason: z.string().optional(),
});

export type InsertIndustryAppRecommendation = z.infer<typeof insertIndustryAppRecommendationSchema>;
export type IndustryAppRecommendation = typeof industryAppRecommendations.$inferSelect;

// ========== AUDIT LOGS ==========
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type"),
  entityId: varchar("entity_id"),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true }).extend({
  userId: z.string().optional(),
  action: z.string().min(1),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  oldValue: z.record(z.any()).optional(),
  newValue: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ========== USER NOTIFICATIONS ==========
export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // "app_update" | "new_feature" | "recommendation" | "badge_earned" | "system"
  title: varchar("title").notNull(),
  message: text("message"),
  icon: varchar("icon"),
  actionUrl: varchar("action_url"),
  referenceType: varchar("reference_type"), // "app" | "badge" | "review"
  referenceId: varchar("reference_id"),
  isRead: boolean("is_read").default(false),
  isArchived: boolean("is_archived").default(false),
  priority: varchar("priority").default("normal"), // "low" | "normal" | "high"
  createdAt: timestamp("created_at").default(sql`now()`),
  readAt: timestamp("read_at"),
});

export const insertUserNotificationSchema = createInsertSchema(userNotifications).omit({ id: true, createdAt: true, readAt: true }).extend({
  userId: z.string().min(1),
  type: z.enum(["app_update", "new_feature", "recommendation", "badge_earned", "system"]),
  title: z.string().min(1),
  message: z.string().optional(),
  icon: z.string().optional(),
  actionUrl: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
});

export type InsertUserNotification = z.infer<typeof insertUserNotificationSchema>;
export type UserNotification = typeof userNotifications.$inferSelect;

// ========== DASHBOARD WIDGETS ==========
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  widgetType: varchar("widget_type").notNull(),
  title: varchar("title").notNull(),
  config: jsonb("config"),
  position: integer("position").default(0),
  size: varchar("size").default("medium"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  userId: z.string().min(1),
  widgetType: z.string().min(1),
  title: z.string().min(1),
  config: z.record(z.any()).optional(),
  position: z.number().optional(),
  size: z.string().optional(),
  isVisible: z.boolean().optional(),
});

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
