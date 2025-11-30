import { pgTable, varchar, text, timestamp, numeric, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== USERS & PROJECTS ==========
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  name: varchar("name"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

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

// ========== ERP MODULE ==========
export const generalLedger = pgTable("general_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountCode: varchar("account_code").notNull(),
  description: text("description"),
  accountType: varchar("account_type"), // asset, liability, equity, revenue, expense
  balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull(),
  customerId: varchar("customer_id"),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("draft"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true }).extend({
  invoiceNumber: z.string().min(1),
  customerId: z.string().optional().nullable(),
  amount: z.string().min(1),
  dueDate: z.date().optional().nullable(),
  status: z.string().optional(),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// ========== CRM MODULE ==========
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  company: varchar("company"),
  score: numeric("score", { precision: 5, scale: 2 }).default("0"),
  status: varchar("status").default("new"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  email: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  score: z.string().optional(),
  status: z.string().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// ========== MANUFACTURING MODULE ==========
export const billOfMaterials = pgTable("bill_of_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  components: jsonb("components"),
  revision: integer("revision").default(1),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const workOrders = pgTable("work_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomId: varchar("bom_id").notNull(),
  quantity: integer("quantity").notNull(),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ id: true, createdAt: true }).extend({
  bomId: z.string().min(1),
  quantity: z.number().min(1),
  status: z.string().optional(),
});

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

// ========== HR MODULE ==========
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  department: varchar("department"),
  salary: numeric("salary", { precision: 12, scale: 2 }),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  email: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// ========== PHASE 1: MOBILE + AI COPILOT ==========

// Mobile Device Sync
export const mobileDevices = pgTable("mobile_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull(),
  userId: varchar("user_id").notNull(),
  platform: varchar("platform").notNull(), // ios, android
  osVersion: varchar("os_version"),
  appVersion: varchar("app_version"),
  lastSync: timestamp("last_sync"),
  offlineEnabled: boolean("offline_enabled").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMobileDeviceSchema = createInsertSchema(mobileDevices).omit({ id: true, createdAt: true }).extend({
  deviceId: z.string().min(1),
  userId: z.string().min(1),
  platform: z.enum(["ios", "android"]),
  osVersion: z.string().optional().nullable(),
  appVersion: z.string().optional().nullable(),
  lastSync: z.date().optional().nullable(),
  offlineEnabled: z.boolean().optional(),
});

export type InsertMobileDevice = z.infer<typeof insertMobileDeviceSchema>;
export type MobileDevice = typeof mobileDevices.$inferSelect;

// Offline Sync Queue
export const offlineSyncQueue = pgTable("offline_sync_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull(),
  action: varchar("action").notNull(), // create, update, delete
  entityType: varchar("entity_type").notNull(),
  entityId: varchar("entity_id"),
  payload: jsonb("payload"),
  synced: boolean("synced").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertOfflineSyncSchema = createInsertSchema(offlineSyncQueue).omit({ id: true, createdAt: true }).extend({
  deviceId: z.string().min(1),
  action: z.enum(["create", "update", "delete"]),
  entityType: z.string().min(1),
  entityId: z.string().optional().nullable(),
  payload: z.object({}).passthrough().optional(),
  synced: z.boolean().optional(),
});

export type InsertOfflineSync = z.infer<typeof insertOfflineSyncSchema>;
export type OfflineSync = typeof offlineSyncQueue.$inferSelect;

// AI Copilot Conversations
export const copilotConversations = pgTable("copilot_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: varchar("title"),
  module: varchar("module"), // crm, erp, hr, manufacturing
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCopilotConversationSchema = createInsertSchema(copilotConversations).omit({ id: true, createdAt: true }).extend({
  userId: z.string().min(1),
  title: z.string().optional().nullable(),
  module: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertCopilotConversation = z.infer<typeof insertCopilotConversationSchema>;
export type CopilotConversation = typeof copilotConversations.$inferSelect;

// AI Copilot Messages
export const copilotMessages = pgTable("copilot_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: varchar("role").notNull(), // user, assistant
  content: text("content").notNull(),
  insights: jsonb("insights"), // AI insights, predictions, recommendations
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCopilotMessageSchema = createInsertSchema(copilotMessages).omit({ id: true, createdAt: true }).extend({
  conversationId: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  insights: z.object({}).passthrough().optional(),
});

export type InsertCopilotMessage = z.infer<typeof insertCopilotMessageSchema>;
export type CopilotMessage = typeof copilotMessages.$inferSelect;

// ========== PHASE 2: ADVANCED PLANNING & ANALYTICS ==========

// Revenue Forecasting
export const revenueForecasts = pgTable("revenue_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  period: varchar("period").notNull(),
  forecastedRevenue: numeric("forecasted_revenue", { precision: 18, scale: 2 }),
  actualRevenue: numeric("actual_revenue", { precision: 18, scale: 2 }),
  confidence: numeric("confidence", { precision: 5, scale: 2 }).default("0.80"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenueForecastSchema = createInsertSchema(revenueForecasts).omit({ id: true, createdAt: true }).extend({
  period: z.string().min(1),
  forecastedRevenue: z.string().optional().nullable(),
  actualRevenue: z.string().optional().nullable(),
  confidence: z.string().optional(),
});

export type InsertRevenueForecast = z.infer<typeof insertRevenueForecastSchema>;
export type RevenueForecast = typeof revenueForecasts.$inferSelect;

// Budget Allocation
export const budgetAllocations = pgTable("budget_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  department: varchar("department").notNull(),
  fiscalYear: varchar("fiscal_year").notNull(),
  budget: numeric("budget", { precision: 18, scale: 2 }).notNull(),
  allocated: numeric("allocated", { precision: 18, scale: 2 }).default("0"),
  spent: numeric("spent", { precision: 18, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBudgetAllocationSchema = createInsertSchema(budgetAllocations).omit({ id: true, createdAt: true }).extend({
  department: z.string().min(1),
  fiscalYear: z.string().min(1),
  budget: z.string().min(1),
  allocated: z.string().optional(),
  spent: z.string().optional(),
});

export type InsertBudgetAllocation = z.infer<typeof insertBudgetAllocationSchema>;
export type BudgetAllocation = typeof budgetAllocations.$inferSelect;

// Time Series Data (for OLAP/Analytics)
export const timeSeriesData = pgTable("time_series_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metric: varchar("metric").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  value: numeric("value", { precision: 18, scale: 2 }),
  dimensions: jsonb("dimensions"), // region, product, customer, etc
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTimeSeriesDataSchema = createInsertSchema(timeSeriesData).omit({ id: true, createdAt: true }).extend({
  metric: z.string().min(1),
  timestamp: z.date(),
  value: z.string().optional().nullable(),
  dimensions: z.object({}).passthrough().optional(),
});

export type InsertTimeSeriesData = z.infer<typeof insertTimeSeriesDataSchema>;
export type TimeSeriesData = typeof timeSeriesData.$inferSelect;

// Forecast Models
export const forecastModels = pgTable("forecast_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  modelType: varchar("model_type").notNull(), // arima, prophet, regression
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
  hyperparameters: jsonb("hyperparameters"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertForecastModelSchema = createInsertSchema(forecastModels).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  modelType: z.string().min(1),
  accuracy: z.string().optional().nullable(),
  hyperparameters: z.object({}).passthrough().optional(),
});

export type InsertForecastModel = z.infer<typeof insertForecastModelSchema>;
export type ForecastModel = typeof forecastModels.$inferSelect;

// What-If Scenarios
export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  baselineMetrics: jsonb("baseline_metrics"),
  scenarioMetrics: jsonb("scenario_metrics"),
  impact: jsonb("impact"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  baselineMetrics: z.object({}).passthrough().optional(),
  scenarioMetrics: z.object({}).passthrough().optional(),
  impact: z.object({}).passthrough().optional(),
});

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

// Scenario Variables
export const scenarioVariables = pgTable("scenario_variables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  variableName: varchar("variable_name").notNull(),
  baselineValue: numeric("baseline_value", { precision: 18, scale: 2 }),
  adjustedValue: numeric("adjusted_value", { precision: 18, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertScenarioVariableSchema = createInsertSchema(scenarioVariables).omit({ id: true, createdAt: true }).extend({
  scenarioId: z.string().min(1),
  variableName: z.string().min(1),
  baselineValue: z.string().optional().nullable(),
  adjustedValue: z.string().optional().nullable(),
});

export type InsertScenarioVariable = z.infer<typeof insertScenarioVariableSchema>;
export type ScenarioVariable = typeof scenarioVariables.$inferSelect;

// Dashboard Widgets
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardId: varchar("dashboard_id"),
  widgetType: varchar("widget_type").notNull(), // kpi, chart, table, gauge
  title: varchar("title"),
  config: jsonb("config"),
  position: integer("position"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({ id: true, createdAt: true }).extend({
  dashboardId: z.string().optional().nullable(),
  widgetType: z.string().min(1),
  title: z.string().optional().nullable(),
  config: z.object({}).passthrough().optional(),
  position: z.number().optional().nullable(),
});

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;

// Reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  reportType: varchar("report_type").notNull(), // financial, sales, hr, operations
  format: varchar("format").default("pdf"), // pdf, excel, html, powerpoint
  schedule: varchar("schedule"), // cron expression for scheduled reports
  recipients: jsonb("recipients"),
  lastGenerated: timestamp("last_generated"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  reportType: z.string().min(1),
  format: z.string().optional(),
  schedule: z.string().optional().nullable(),
  recipients: z.object({}).passthrough().optional(),
  lastGenerated: z.date().optional().nullable(),
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type"),
  entityId: varchar("entity_id"),
  changes: jsonb("changes"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true }).extend({
  userId: z.string().optional().nullable(),
  action: z.string().min(1),
  entityType: z.string().optional().nullable(),
  entityId: z.string().optional().nullable(),
  changes: z.object({}).passthrough().optional(),
  ipAddress: z.string().optional().nullable(),
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ========== PHASE 3: ECOSYSTEM & CONNECTORS ==========

// Apps (Marketplace)
export const apps = pgTable("apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"),
  version: varchar("version").default("1.0.0"),
  developer: varchar("developer"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  downloads: integer("downloads").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAppSchema = createInsertSchema(apps).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  version: z.string().optional(),
  developer: z.string().optional().nullable(),
  rating: z.string().optional(),
  downloads: z.number().optional(),
});

export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = typeof apps.$inferSelect;

// App Reviews
export const appReviews = pgTable("app_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  userId: varchar("user_id"),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAppReviewSchema = createInsertSchema(appReviews).omit({ id: true, createdAt: true }).extend({
  appId: z.string().min(1),
  userId: z.string().optional().nullable(),
  rating: z.number().optional().nullable(),
  comment: z.string().optional().nullable(),
});

export type InsertAppReview = z.infer<typeof insertAppReviewSchema>;
export type AppReview = typeof appReviews.$inferSelect;

// App Installations
export const appInstallations = pgTable("app_installations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: varchar("status").default("active"),
  config: jsonb("config"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAppInstallationSchema = createInsertSchema(appInstallations).omit({ id: true, createdAt: true }).extend({
  appId: z.string().min(1),
  userId: z.string().min(1),
  status: z.string().optional(),
  config: z.object({}).passthrough().optional(),
});

export type InsertAppInstallation = z.infer<typeof insertAppInstallationSchema>;
export type AppInstallation = typeof appInstallations.$inferSelect;

// Connectors (Pre-built integrations: Stripe, Slack, Shopify, etc)
export const connectors = pgTable("connectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // stripe, slack, shopify, hubspot, jira, github, aws, azure, salesforce, tableau, zendesk, asana, zoom, box, dropbox, twilio, mailchimp, google, notion, airtable
  displayName: varchar("display_name"),
  category: varchar("category"), // payment, communication, ecommerce, crm, projects, cloud, analytics, support, storage, sms, email, productivity
  oauthEnabled: boolean("oauth_enabled").default(false),
  baseUrl: varchar("base_url"),
  documentationUrl: varchar("documentation_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConnectorSchema = createInsertSchema(connectors).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  displayName: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  oauthEnabled: z.boolean().optional(),
  baseUrl: z.string().optional().nullable(),
  documentationUrl: z.string().optional().nullable(),
});

export type InsertConnector = z.infer<typeof insertConnectorSchema>;
export type Connector = typeof connectors.$inferSelect;

// Connector Instances (User-configured connector)
export const connectorInstances = pgTable("connector_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectorId: varchar("connector_id").notNull(),
  userId: varchar("user_id").notNull(),
  name: varchar("name"),
  credentials: jsonb("credentials"), // encrypted
  status: varchar("status").default("connected"),
  lastSyncTime: timestamp("last_sync_time"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConnectorInstanceSchema = createInsertSchema(connectorInstances).omit({ id: true, createdAt: true }).extend({
  connectorId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().optional().nullable(),
  credentials: z.object({}).passthrough().optional(),
  status: z.string().optional(),
  lastSyncTime: z.date().optional().nullable(),
});

export type InsertConnectorInstance = z.infer<typeof insertConnectorInstanceSchema>;
export type ConnectorInstance = typeof connectorInstances.$inferSelect;

// Webhook Events
export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectorInstanceId: varchar("connector_instance_id").notNull(),
  eventType: varchar("event_type").notNull(),
  payload: jsonb("payload"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({ id: true, createdAt: true }).extend({
  connectorInstanceId: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.object({}).passthrough().optional(),
  processed: z.boolean().optional(),
});

export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;

// ========== PHASE 4: ENTERPRISE SECURITY & COMPLIANCE ==========

// ABAC Rules (Attribute-Based Access Control)
export const abacRules = pgTable("abac_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  resource: varchar("resource").notNull(), // invoice, employee, lead, order, etc
  action: varchar("action").notNull(), // create, read, update, delete
  attributes: jsonb("attributes"), // department, costCenter, region, role, etc
  effect: varchar("effect").notNull(), // allow, deny
  priority: integer("priority").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAbacRuleSchema = createInsertSchema(abacRules).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  resource: z.string().min(1),
  action: z.string().min(1),
  attributes: z.object({}).passthrough().optional(),
  effect: z.enum(["allow", "deny"]),
  priority: z.number().optional(),
});

export type InsertAbacRule = z.infer<typeof insertAbacRuleSchema>;
export type AbacRule = typeof abacRules.$inferSelect;

// Encrypted Fields (Field-Level Encryption)
export const encryptedFields = pgTable("encrypted_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(),
  fieldName: varchar("field_name").notNull(),
  encryptionKeyId: varchar("encryption_key_id"),
  piiType: varchar("pii_type"), // ssn, creditcard, email, phone, etc
  searchable: boolean("searchable").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEncryptedFieldSchema = createInsertSchema(encryptedFields).omit({ id: true, createdAt: true }).extend({
  entityType: z.string().min(1),
  fieldName: z.string().min(1),
  encryptionKeyId: z.string().optional().nullable(),
  piiType: z.string().optional().nullable(),
  searchable: z.boolean().optional(),
});

export type InsertEncryptedField = z.infer<typeof insertEncryptedFieldSchema>;
export type EncryptedField = typeof encryptedFields.$inferSelect;

// Compliance Configurations
export const complianceConfigs = pgTable("compliance_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  framework: varchar("framework").notNull(), // soc2, hipaa, gdpr, pciDss
  status: varchar("status").default("planning"), // planning, implementing, auditing, certified
  requirements: jsonb("requirements"),
  controls: jsonb("controls"),
  certificationDate: timestamp("certification_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertComplianceConfigSchema = createInsertSchema(complianceConfigs).omit({ id: true, createdAt: true }).extend({
  framework: z.enum(["soc2", "hipaa", "gdpr", "pciDss"]),
  status: z.string().optional(),
  requirements: z.object({}).passthrough().optional(),
  controls: z.object({}).passthrough().optional(),
  certificationDate: z.date().optional().nullable(),
});

export type InsertComplianceConfig = z.infer<typeof insertComplianceConfigSchema>;
export type ComplianceConfig = typeof complianceConfigs.$inferSelect;

// Agile Sprints
export const sprints = pgTable("sprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: varchar("name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: varchar("status").default("planning"),
  velocity: integer("velocity"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSprintSchema = createInsertSchema(sprints).omit({ id: true, createdAt: true }).extend({
  projectId: z.string().min(1),
  name: z.string().min(1),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  status: z.string().optional(),
  velocity: z.number().optional().nullable(),
});

export type InsertSprint = z.infer<typeof insertSprintSchema>;
export type Sprint = typeof sprints.$inferSelect;

// Issues (Jira-like)
export const issues = pgTable("issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  sprintId: varchar("sprint_id"),
  title: varchar("title").notNull(),
  description: text("description"),
  issueType: varchar("issue_type"), // bug, feature, task, epic
  status: varchar("status").default("todo"),
  priority: varchar("priority").default("medium"),
  assignee: varchar("assignee"),
  storyPoints: integer("story_points"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertIssueSchema = createInsertSchema(issues).omit({ id: true, createdAt: true }).extend({
  projectId: z.string().min(1),
  sprintId: z.string().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  issueType: z.string().optional().nullable(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignee: z.string().optional().nullable(),
  storyPoints: z.number().optional().nullable(),
});

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

// ========== PHASE 5: DATA WAREHOUSE & ADVANCED BI ==========

// Data Warehouse: Data Lakes
export const dataLakes = pgTable("data_lakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  provider: varchar("provider").notNull(), // bigquery, snowflake, redshift
  connectionString: varchar("connection_string").notNull(),
  status: varchar("status").default("connected"),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertDataLakeSchema = createInsertSchema(dataLakes).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  provider: z.enum(["bigquery", "snowflake", "redshift"]),
  connectionString: z.string().min(1),
  status: z.string().optional(),
  lastSync: z.date().optional().nullable(),
});

export type InsertDataLake = z.infer<typeof insertDataLakeSchema>;
export type DataLake = typeof dataLakes.$inferSelect;

// ETL: Pipeline Jobs
export const etlPipelines = pgTable("etl_pipelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  source: varchar("source").notNull(),
  destination: varchar("destination").notNull(),
  schedule: varchar("schedule"),
  status: varchar("status").default("active"),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEtlPipelineSchema = createInsertSchema(etlPipelines).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  source: z.string().min(1),
  destination: z.string().min(1),
  schedule: z.string().optional().nullable(),
  status: z.string().optional(),
  lastRun: z.date().optional().nullable(),
  nextRun: z.date().optional().nullable(),
});

export type InsertEtlPipeline = z.infer<typeof insertEtlPipelineSchema>;
export type EtlPipeline = typeof etlPipelines.$inferSelect;

// BI: Advanced Dashboards
export const biDashboards = pgTable("bi_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  datasource: varchar("datasource").notNull(),
  visualizations: jsonb("visualizations"),
  filters: jsonb("filters"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBiDashboardSchema = createInsertSchema(biDashboards).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  datasource: z.string().min(1),
  description: z.string().optional().nullable(),
  visualizations: z.object({}).passthrough().optional(),
  filters: z.object({}).passthrough().optional(),
});

export type InsertBiDashboard = z.infer<typeof insertBiDashboardSchema>;
export type BiDashboard = typeof biDashboards.$inferSelect;

// Field Service: Jobs
export const fieldServiceJobs = pgTable("field_service_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  location: varchar("location").notNull(),
  assignee: varchar("assignee"),
  status: varchar("status").default("unassigned"),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertFieldServiceJobSchema = createInsertSchema(fieldServiceJobs).omit({ id: true, createdAt: true }).extend({
  title: z.string().min(1),
  location: z.string().min(1),
  assignee: z.string().optional().nullable(),
  status: z.string().optional(),
  scheduledDate: z.date().optional().nullable(),
  completedDate: z.date().optional().nullable(),
});

export type InsertFieldServiceJob = z.infer<typeof insertFieldServiceJobSchema>;
export type FieldServiceJob = typeof fieldServiceJobs.$inferSelect;

// Payroll: Global Configuration
export const payrollConfigs = pgTable("payroll_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  country: varchar("country").notNull(),
  taxBrackets: jsonb("tax_brackets"),
  deductions: jsonb("deductions"),
  minimumWage: numeric("minimum_wage", { precision: 12, scale: 2 }),
  payFrequency: varchar("pay_frequency"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPayrollConfigSchema = createInsertSchema(payrollConfigs).omit({ id: true, createdAt: true }).extend({
  country: z.string().min(1),
  taxBrackets: z.object({}).passthrough().optional(),
  deductions: z.object({}).passthrough().optional(),
  minimumWage: z.string().optional().nullable(),
  payFrequency: z.string().optional().nullable(),
});

export type InsertPayrollConfig = z.infer<typeof insertPayrollConfigSchema>;
export type PayrollConfig = typeof payrollConfigs.$inferSelect;

// ========== PHASE 3: PROCUREMENT MODULE ==========

// RFQs (Request for Quotation)
export const rfqs = pgTable("rfqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rfqNumber: varchar("rfq_number").notNull().unique(),
  vendorId: varchar("vendor_id"),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("draft"), // draft, sent, quoted, closed
  dueDate: timestamp("due_date"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertRfqSchema = createInsertSchema(rfqs).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  rfqNumber: z.string().min(1),
  vendorId: z.string().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(["draft", "sent", "quoted", "closed"]).optional(),
  dueDate: z.date().optional().nullable(),
  createdBy: z.string().optional().nullable(),
});

export type InsertRfq = z.infer<typeof insertRfqSchema>;
export type Rfq = typeof rfqs.$inferSelect;

// RFQ Line Items
export const rfqItems = pgTable("rfq_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rfqId: varchar("rfq_id").notNull(),
  productId: varchar("product_id"),
  productName: varchar("product_name").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  unit: varchar("unit"),
  estimatedCost: numeric("estimated_cost", { precision: 18, scale: 2 }),
  specifications: text("specifications"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRfqItemSchema = createInsertSchema(rfqItems).omit({ id: true, createdAt: true }).extend({
  rfqId: z.string().min(1),
  productId: z.string().optional().nullable(),
  productName: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().optional().nullable(),
  estimatedCost: z.string().optional().nullable(),
  specifications: z.string().optional().nullable(),
});

export type InsertRfqItem = z.infer<typeof insertRfqItemSchema>;
export type RfqItem = typeof rfqItems.$inferSelect;

// Purchase Orders (POs)
export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: varchar("po_number").notNull().unique(),
  vendorId: varchar("vendor_id").notNull(),
  rfqId: varchar("rfq_id"),
  status: varchar("status").default("draft"), // draft, approved, sent, acknowledged, partial_received, received, closed
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }),
  paymentTerms: varchar("payment_terms"),
  deliveryDate: timestamp("delivery_date"),
  shippingAddress: text("shipping_address"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true, updatedAt: true, approvedAt: true }).extend({
  poNumber: z.string().min(1),
  vendorId: z.string().min(1),
  rfqId: z.string().optional().nullable(),
  status: z.enum(["draft", "approved", "sent", "acknowledged", "partial_received", "received", "closed"]).optional(),
  totalAmount: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  deliveryDate: z.date().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  approvedBy: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
});

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// PO Line Items
export const poItems = pgTable("po_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poId: varchar("po_id").notNull(),
  lineNumber: integer("line_number"),
  productId: varchar("product_id"),
  productName: varchar("product_name").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 4 }).notNull(),
  unit: varchar("unit"),
  unitPrice: numeric("unit_price", { precision: 18, scale: 2 }).notNull(),
  lineAmount: numeric("line_amount", { precision: 18, scale: 2 }),
  receivedQuantity: numeric("received_quantity", { precision: 12, scale: 4 }).default("0"),
  invoicedQuantity: numeric("invoiced_quantity", { precision: 12, scale: 4 }).default("0"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPoItemSchema = createInsertSchema(poItems).omit({ id: true, createdAt: true }).extend({
  poId: z.string().min(1),
  lineNumber: z.number().optional(),
  productId: z.string().optional().nullable(),
  productName: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().optional().nullable(),
  unitPrice: z.string().min(1),
  lineAmount: z.string().optional().nullable(),
  receivedQuantity: z.string().optional(),
  invoicedQuantity: z.string().optional(),
});

export type InsertPoItem = z.infer<typeof insertPoItemSchema>;
export type PoItem = typeof poItems.$inferSelect;

// Goods Receipt Notes (GRN)
export const goodsReceipts = pgTable("goods_receipts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grnNumber: varchar("grn_number").notNull().unique(),
  poId: varchar("po_id").notNull(),
  vendorId: varchar("vendor_id").notNull(),
  status: varchar("status").default("received"), // received, inspected, accepted, rejected, partial
  totalQuantity: numeric("total_quantity", { precision: 12, scale: 4 }),
  receivedDate: timestamp("received_date").default(sql`now()`),
  inspectedBy: varchar("inspected_by"),
  inspectedAt: timestamp("inspected_at"),
  qualityStatus: varchar("quality_status"), // accepted, rejected, hold
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGoodsReceiptSchema = createInsertSchema(goodsReceipts).omit({ id: true, createdAt: true, receivedDate: true, inspectedAt: true }).extend({
  grnNumber: z.string().min(1),
  poId: z.string().min(1),
  vendorId: z.string().min(1),
  status: z.enum(["received", "inspected", "accepted", "rejected", "partial"]).optional(),
  totalQuantity: z.string().optional().nullable(),
  inspectedBy: z.string().optional().nullable(),
  qualityStatus: z.enum(["accepted", "rejected", "hold"]).optional(),
  notes: z.string().optional().nullable(),
});

export type InsertGoodsReceipt = z.infer<typeof insertGoodsReceiptSchema>;
export type GoodsReceipt = typeof goodsReceipts.$inferSelect;

// GRN Line Items
export const grnItems = pgTable("grn_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grnId: varchar("grn_id").notNull(),
  poItemId: varchar("po_item_id").notNull(),
  productId: varchar("product_id"),
  productName: varchar("product_name").notNull(),
  receivedQuantity: numeric("received_quantity", { precision: 12, scale: 4 }).notNull(),
  unit: varchar("unit"),
  lotNumber: varchar("lot_number"),
  serialNumbers: text("serial_numbers"),
  qualityStatus: varchar("quality_status"), // accepted, rejected, hold
  remarks: text("remarks"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGrnItemSchema = createInsertSchema(grnItems).omit({ id: true, createdAt: true }).extend({
  grnId: z.string().min(1),
  poItemId: z.string().min(1),
  productId: z.string().optional().nullable(),
  productName: z.string().min(1),
  receivedQuantity: z.string().min(1),
  unit: z.string().optional().nullable(),
  lotNumber: z.string().optional().nullable(),
  serialNumbers: z.string().optional().nullable(),
  qualityStatus: z.enum(["accepted", "rejected", "hold"]).optional(),
  remarks: z.string().optional().nullable(),
});

export type InsertGrnItem = z.infer<typeof insertGrnItemSchema>;
export type GrnItem = typeof grnItems.$inferSelect;

// Supplier Invoices (AP)
export const supplierInvoices = pgTable("supplier_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull(),
  vendorId: varchar("vendor_id").notNull(),
  poId: varchar("po_id"),
  invoiceDate: timestamp("invoice_date"),
  dueDate: timestamp("due_date"),
  totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).notNull(),
  status: varchar("status").default("received"), // received, validated, matched_po_grn, partial_match, exception, approved, paid
  matchingStatus: varchar("matching_status"), // not_matched, 2_way, 3_way, exception
  matchExceptions: jsonb("match_exceptions"), // variance details
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  paidDate: timestamp("paid_date"),
  currency: varchar("currency"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertSupplierInvoiceSchema = createInsertSchema(supplierInvoices).omit({ id: true, createdAt: true, updatedAt: true, approvedAt: true, paidDate: true }).extend({
  invoiceNumber: z.string().min(1),
  vendorId: z.string().min(1),
  poId: z.string().optional().nullable(),
  invoiceDate: z.date().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  totalAmount: z.string().min(1),
  status: z.enum(["received", "validated", "matched_po_grn", "partial_match", "exception", "approved", "paid"]).optional(),
  matchingStatus: z.enum(["not_matched", "2_way", "3_way", "exception"]).optional(),
  matchExceptions: z.object({}).passthrough().optional(),
  approvedBy: z.string().optional().nullable(),
  currency: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export type InsertSupplierInvoice = z.infer<typeof insertSupplierInvoiceSchema>;
export type SupplierInvoice = typeof supplierInvoices.$inferSelect;

// Supplier Invoice Lines
export const supplierInvoiceItems = pgTable("supplier_invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull(),
  poItemId: varchar("po_item_id"),
  grnItemId: varchar("grn_item_id"),
  lineNumber: integer("line_number"),
  productName: varchar("product_name").notNull(),
  invoicedQuantity: numeric("invoiced_quantity", { precision: 12, scale: 4 }),
  unitPrice: numeric("unit_price", { precision: 18, scale: 2 }),
  lineAmount: numeric("line_amount", { precision: 18, scale: 2 }),
  poQuantity: numeric("po_quantity", { precision: 12, scale: 4 }),
  grnQuantity: numeric("grn_quantity", { precision: 12, scale: 4 }),
  variance: numeric("variance", { precision: 12, scale: 4 }),
  varianceReason: varchar("variance_reason"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSupplierInvoiceItemSchema = createInsertSchema(supplierInvoiceItems).omit({ id: true, createdAt: true }).extend({
  invoiceId: z.string().min(1),
  poItemId: z.string().optional().nullable(),
  grnItemId: z.string().optional().nullable(),
  lineNumber: z.number().optional(),
  productName: z.string().min(1),
  invoicedQuantity: z.string().optional().nullable(),
  unitPrice: z.string().optional().nullable(),
  lineAmount: z.string().optional().nullable(),
  poQuantity: z.string().optional().nullable(),
  grnQuantity: z.string().optional().nullable(),
  variance: z.string().optional().nullable(),
  varianceReason: z.string().optional().nullable(),
});

export type InsertSupplierInvoiceItem = z.infer<typeof insertSupplierInvoiceItemSchema>;
export type SupplierInvoiceItem = typeof supplierInvoiceItems.$inferSelect;

// Vendors (Supplier Master)
export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorCode: varchar("vendor_code").notNull().unique(),
  vendorName: varchar("vendor_name").notNull(),
  vendorType: varchar("vendor_type"), // supplier, service_provider, manufacturer
  email: varchar("email"),
  phone: varchar("phone"),
  website: varchar("website"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  country: varchar("country"),
  postalCode: varchar("postal_code"),
  taxId: varchar("tax_id"),
  status: varchar("status").default("active"), // active, inactive, blocked, under_review
  approvalStatus: varchar("approval_status"), // pending, approved, rejected
  riskLevel: varchar("risk_level"), // low, medium, high
  paymentTerms: varchar("payment_terms"),
  currency: varchar("currency"),
  creditLimit: numeric("credit_limit", { precision: 18, scale: 2 }),
  onTimeDeliveryRate: numeric("on_time_delivery_rate", { precision: 5, scale: 2 }),
  qualityScore: numeric("quality_score", { precision: 5, scale: 2 }),
  overallRating: numeric("overall_rating", { precision: 3, scale: 2 }),
  lastReviewDate: timestamp("last_review_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true, updatedAt: true, lastReviewDate: true }).extend({
  vendorCode: z.string().min(1),
  vendorName: z.string().min(1),
  vendorType: z.enum(["supplier", "service_provider", "manufacturer"]).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "blocked", "under_review"]).optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  riskLevel: z.enum(["low", "medium", "high"]).optional(),
  paymentTerms: z.string().optional().nullable(),
  currency: z.string().optional(),
  creditLimit: z.string().optional().nullable(),
  onTimeDeliveryRate: z.string().optional(),
  qualityScore: z.string().optional(),
  overallRating: z.string().optional(),
});

export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

// 3-Way Match Records
export const threeWayMatches = pgTable("three_way_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poId: varchar("po_id").notNull(),
  grnId: varchar("grn_id").notNull(),
  invoiceId: varchar("invoice_id").notNull(),
  matchStatus: varchar("match_status"), // matched, variance_qty, variance_price, variance_both, exception
  quantityVariance: numeric("quantity_variance", { precision: 12, scale: 4 }),
  priceVariance: numeric("price_variance", { precision: 18, scale: 2 }),
  priceVariancePercent: numeric("price_variance_percent", { precision: 5, scale: 2 }),
  toleranceExceeded: boolean("tolerance_exceeded").default(false),
  exceptionReason: text("exception_reason"),
  approvalRequired: boolean("approval_required").default(false),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  matchedAt: timestamp("matched_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertThreeWayMatchSchema = createInsertSchema(threeWayMatches).omit({ id: true, createdAt: true, matchedAt: true, approvedAt: true }).extend({
  poId: z.string().min(1),
  grnId: z.string().min(1),
  invoiceId: z.string().min(1),
  matchStatus: z.enum(["matched", "variance_qty", "variance_price", "variance_both", "exception"]).optional(),
  quantityVariance: z.string().optional(),
  priceVariance: z.string().optional(),
  priceVariancePercent: z.string().optional(),
  toleranceExceeded: z.boolean().optional(),
  exceptionReason: z.string().optional().nullable(),
  approvalRequired: z.boolean().optional(),
  approvedBy: z.string().optional().nullable(),
});

export type InsertThreeWayMatch = z.infer<typeof insertThreeWayMatchSchema>;
export type ThreeWayMatch = typeof threeWayMatches.$inferSelect;

// ========== PHASE 4: FINANCE & ACCOUNTING MODULE ==========

// Chart of Accounts
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountCode: varchar("account_code").notNull().unique(),
  accountName: varchar("account_name").notNull(),
  accountType: varchar("account_type").notNull(), // Asset, Liability, Equity, Revenue, Expense
  normalBalance: varchar("normal_balance"), // Debit, Credit
  isActive: boolean("is_active").default(true),
  parentAccountId: varchar("parent_account_id"),
  taxCode: varchar("tax_code"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCoaSchema = createInsertSchema(chartOfAccounts).omit({ id: true, createdAt: true }).extend({
  accountCode: z.string().min(1),
  accountName: z.string().min(1),
  accountType: z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
  normalBalance: z.enum(["Debit", "Credit"]).optional(),
  isActive: z.boolean().optional(),
  parentAccountId: z.string().optional().nullable(),
  taxCode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type InsertCoa = z.infer<typeof insertCoaSchema>;
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;

// General Ledger Entries
export const generalLedgerEntries = pgTable("general_ledger_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  journalEntryId: varchar("journal_entry_id").notNull(),
  accountId: varchar("account_id").notNull(),
  debitAmount: numeric("debit_amount", { precision: 18, scale: 2 }).default("0"),
  creditAmount: numeric("credit_amount", { precision: 18, scale: 2 }).default("0"),
  description: text("description"),
  referenceDocType: varchar("reference_doc_type"), // PO, Invoice, etc
  referenceDocId: varchar("reference_doc_id"),
  transactionDate: timestamp("transaction_date"),
  postedDate: timestamp("posted_date"),
  isPosted: boolean("is_posted").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGleSchema = createInsertSchema(generalLedgerEntries).omit({ id: true, createdAt: true, postedDate: true }).extend({
  journalEntryId: z.string().min(1),
  accountId: z.string().min(1),
  debitAmount: z.string().optional(),
  creditAmount: z.string().optional(),
  description: z.string().optional(),
  referenceDocType: z.string().optional(),
  referenceDocId: z.string().optional(),
  transactionDate: z.date().optional(),
  isPosted: z.boolean().optional(),
});

export type InsertGle = z.infer<typeof insertGleSchema>;
export type GeneralLedgerEntry = typeof generalLedgerEntries.$inferSelect;

// AP Invoices (Accounts Payable)
export const apInvoices = pgTable("ap_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  vendorId: varchar("vendor_id").notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date"),
  invoiceAmount: numeric("invoice_amount", { precision: 18, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 18, scale: 2 }).default("0"),
  status: varchar("status").default("draft"), // draft, submitted, approved, paid, rejected
  approvalStatus: varchar("approval_status"), // pending, approved, rejected
  description: text("description"),
  glPosted: boolean("gl_posted").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertApInvoiceSchema = createInsertSchema(apInvoices).omit({ id: true, createdAt: true, glPosted: true }).extend({
  invoiceNumber: z.string().min(1),
  vendorId: z.string().min(1),
  invoiceDate: z.date(),
  dueDate: z.date().optional(),
  invoiceAmount: z.string().min(1),
  paidAmount: z.string().optional(),
  status: z.enum(["draft", "submitted", "approved", "paid", "rejected"]).optional(),
  approvalStatus: z.string().optional(),
  description: z.string().optional(),
});

export type InsertApInvoice = z.infer<typeof insertApInvoiceSchema>;
export type ApInvoice = typeof apInvoices.$inferSelect;

// AR Invoices (Accounts Receivable)
export const arInvoices = pgTable("ar_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  customerId: varchar("customer_id").notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  dueDate: timestamp("due_date"),
  invoiceAmount: numeric("invoice_amount", { precision: 18, scale: 2 }).notNull(),
  receivedAmount: numeric("received_amount", { precision: 18, scale: 2 }).default("0"),
  status: varchar("status").default("draft"), // draft, issued, overdue, paid, cancelled
  description: text("description"),
  glPosted: boolean("gl_posted").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArInvoiceSchema = createInsertSchema(arInvoices).omit({ id: true, createdAt: true, glPosted: true }).extend({
  invoiceNumber: z.string().min(1),
  customerId: z.string().min(1),
  invoiceDate: z.date(),
  dueDate: z.date().optional(),
  invoiceAmount: z.string().min(1),
  receivedAmount: z.string().optional(),
  status: z.enum(["draft", "issued", "overdue", "paid", "cancelled"]).optional(),
  description: z.string().optional(),
});

export type InsertArInvoice = z.infer<typeof insertArInvoiceSchema>;
export type ArInvoice = typeof arInvoices.$inferSelect;

// Bank Accounts
export const bankAccounts = pgTable("bank_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountNumber: varchar("account_number").notNull().unique(),
  bankName: varchar("bank_name").notNull(),
  currency: varchar("currency").default("USD"),
  accountBalance: numeric("account_balance", { precision: 18, scale: 2 }).default("0"),
  glAccountId: varchar("gl_account_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({ id: true, createdAt: true }).extend({
  accountNumber: z.string().min(1),
  bankName: z.string().min(1),
  currency: z.string().optional(),
  accountBalance: z.string().optional(),
  glAccountId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;

// Bank Reconciliations
export const bankReconciliations = pgTable("bank_reconciliations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bankAccountId: varchar("bank_account_id").notNull(),
  statementDate: timestamp("statement_date").notNull(),
  statementBalance: numeric("statement_balance", { precision: 18, scale: 2 }).notNull(),
  bookBalance: numeric("book_balance", { precision: 18, scale: 2 }).notNull(),
  difference: numeric("difference", { precision: 18, scale: 2 }).default("0"),
  status: varchar("status").default("pending"), // pending, reconciled, error
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBankRecSchema = createInsertSchema(bankReconciliations).omit({ id: true, createdAt: true, difference: true }).extend({
  bankAccountId: z.string().min(1),
  statementDate: z.date(),
  statementBalance: z.string().min(1),
  bookBalance: z.string().min(1),
  status: z.enum(["pending", "reconciled", "error"]).optional(),
  notes: z.string().optional(),
});

export type InsertBankRec = z.infer<typeof insertBankRecSchema>;
export type BankReconciliation = typeof bankReconciliations.$inferSelect;

// Financial Statements (P&L, Balance Sheet)
export const financialStatements = pgTable("financial_statements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  statementType: varchar("statement_type").notNull(), // P&L, BalanceSheet, CashFlow
  periodStartDate: timestamp("period_start_date").notNull(),
  periodEndDate: timestamp("period_end_date").notNull(),
  company: varchar("company"),
  revenue: numeric("revenue", { precision: 18, scale: 2 }).default("0"),
  expenses: numeric("expenses", { precision: 18, scale: 2 }).default("0"),
  netIncome: numeric("net_income", { precision: 18, scale: 2 }).default("0"),
  totalAssets: numeric("total_assets", { precision: 18, scale: 2 }).default("0"),
  totalLiabilities: numeric("total_liabilities", { precision: 18, scale: 2 }).default("0"),
  totalEquity: numeric("total_equity", { precision: 18, scale: 2 }).default("0"),
  generatedAt: timestamp("generated_at").default(sql`now()`),
});

export const insertFinStmtSchema = createInsertSchema(financialStatements).omit({ id: true, generatedAt: true }).extend({
  statementType: z.enum(["P&L", "BalanceSheet", "CashFlow"]),
  periodStartDate: z.date(),
  periodEndDate: z.date(),
  company: z.string().optional(),
  revenue: z.string().optional(),
  expenses: z.string().optional(),
  netIncome: z.string().optional(),
  totalAssets: z.string().optional(),
  totalLiabilities: z.string().optional(),
  totalEquity: z.string().optional(),
});

export type InsertFinStmt = z.infer<typeof insertFinStmtSchema>;
export type FinancialStatement = typeof financialStatements.$inferSelect;

// ========== PHASE 1: AUTH & MULTI-TENANT ==========
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  name: varchar("name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  roleId: varchar("role_id"),
  assignedAt: timestamp("assigned_at").default(sql`now()`),
});

// ========== PHASE 1: SUBSCRIPTIONS & BILLING ==========
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD"),
  billingCycle: varchar("billing_cycle"),
  features: jsonb("features"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  planId: varchar("plan_id"),
  status: varchar("status").default("active"),
  startDate: timestamp("start_date").default(sql`now()`),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: varchar("method").notNull(),
  status: varchar("status").default("pending"),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const credits = pgTable("credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  usedAmount: numeric("used_amount", { precision: 12, scale: 2 }).default("0"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 1: API GATEWAY ==========
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  userId: varchar("user_id"),
  name: varchar("name").notNull(),
  key: varchar("key").unique().notNull(),
  secret: varchar("secret"),
  permissions: jsonb("permissions"),
  rateLimit: integer("rate_limit"),
  status: varchar("status").default("active"),
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true });

// ========== PHASE 1: ZSCHEMAS & TYPES ==========
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// ========== PHASE 2: CRM MODULE ==========
export const crmAccounts = pgTable("crm_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  industry: varchar("industry"),
  revenue: numeric("revenue", { precision: 15, scale: 2 }),
  employees: integer("employees"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const crmOpportunities = pgTable("crm_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  accountId: varchar("account_id"),
  amount: numeric("amount", { precision: 15, scale: 2 }),
  stage: varchar("stage").default("prospecting"),
  probability: integer("probability"),
  closeDate: timestamp("close_date"),
  status: varchar("status").default("open"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const crmContacts = pgTable("crm_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name"),
  email: varchar("email"),
  phone: varchar("phone"),
  accountId: varchar("account_id"),
  jobTitle: varchar("job_title"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 2: FINANCE MODULE ==========
export const financeExpenses = pgTable("finance_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  category: varchar("category"),
  vendor: varchar("vendor"),
  expenseDate: timestamp("expense_date"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const financeRevenue = pgTable("finance_revenue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  source: varchar("source"),
  revenueDate: timestamp("revenue_date"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const financeForecasts = pgTable("finance_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  period: varchar("period").notNull(),
  revenue: numeric("revenue", { precision: 15, scale: 2 }),
  expenses: numeric("expenses", { precision: 15, scale: 2 }),
  confidence: integer("confidence"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 2: HR MODULE ==========
export const hrJobPostings = pgTable("hr_job_postings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  department: varchar("department"),
  description: text("description"),
  requirements: text("requirements"),
  salary: numeric("salary", { precision: 12, scale: 2 }),
  status: varchar("status").default("open"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const hrCandidates = pgTable("hr_candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  position: varchar("position"),
  status: varchar("status").default("applied"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const hrTrainingPrograms = pgTable("hr_training_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  duration: integer("duration"),
  provider: varchar("provider"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: varchar("status").default("scheduled"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 2: ERP MODULE ==========
export const erpPurchaseOrders = pgTable("erp_purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: varchar("po_number").notNull().unique(),
  vendorId: varchar("vendor_id"),
  amount: numeric("amount", { precision: 15, scale: 2 }),
  orderDate: timestamp("order_date"),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("draft"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const erpInventory = pgTable("erp_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: varchar("sku").notNull().unique(),
  productName: varchar("product_name"),
  quantity: integer("quantity").default(0),
  reorderLevel: integer("reorder_level"),
  lastRestockDate: timestamp("last_restock_date"),
  warehouseLocation: varchar("warehouse_location"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const erpSalesOrders = pgTable("erp_sales_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  soNumber: varchar("so_number").notNull().unique(),
  customerId: varchar("customer_id"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }),
  orderDate: timestamp("order_date"),
  shipDate: timestamp("ship_date"),
  status: varchar("status").default("open"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 2: SERVICE MODULE ==========
export const serviceContracts = pgTable("service_contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: varchar("contract_number").notNull().unique(),
  customerId: varchar("customer_id"),
  serviceType: varchar("service_type"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  amount: numeric("amount", { precision: 15, scale: 2 }),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const serviceIncidents = pgTable("service_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentNumber: varchar("incident_number").notNull().unique(),
  customerId: varchar("customer_id"),
  title: varchar("title"),
  description: text("description"),
  severity: varchar("severity").default("medium"),
  status: varchar("status").default("open"),
  assignedTo: varchar("assigned_to"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const serviceSLA = pgTable("service_sla", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  responseTime: integer("response_time"),
  resolutionTime: integer("resolution_time"),
  uptime: numeric("uptime", { precision: 5, scale: 2 }),
  penalty: numeric("penalty", { precision: 10, scale: 2 }),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 3: PROJECTS & AGILE ==========
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sprintId: varchar("sprint_id"),
  title: varchar("title").notNull(),
  description: text("description"),
  assignee: varchar("assignee"),
  priority: varchar("priority").default("medium"),
  status: varchar("status").default("todo"),
  estimatedHours: integer("estimated_hours"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 3: MARKETING AUTOMATION ==========
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type"),
  channel: varchar("channel"),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: varchar("status").default("draft"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const marketingSegments = pgTable("marketing_segments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  criteria: jsonb("criteria"),
  audienceSize: integer("audience_size"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const marketingLeads = pgTable("marketing_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  score: integer("score"),
  source: varchar("source"),
  status: varchar("status").default("new"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 3: MANUFACTURING ==========
export const manufacturingBOM = pgTable("manufacturing_bom", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id"),
  name: varchar("name").notNull(),
  version: varchar("version"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 3: ANALYTICS ==========
export const analyticsDashboards = pgTable("analytics_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  owner: varchar("owner"),
  type: varchar("type"),
  metrics: jsonb("metrics"),
  refreshRate: integer("refresh_rate"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const analyticsReports = pgTable("analytics_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  dashboardId: varchar("dashboard_id"),
  data: jsonb("data"),
  generatedAt: timestamp("generated_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 3: ADMIN CONSOLE ==========
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: varchar("action"),
  resource: varchar("resource"),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: text("value"),
  category: varchar("category"),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 3: COMPLIANCE & RISK ==========
export const complianceControls = pgTable("compliance_controls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  framework: varchar("framework"),
  status: varchar("status").default("active"),
  owner: varchar("owner"),
  lastAssessed: timestamp("last_assessed"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  riskId: varchar("risk_id"),
  name: varchar("name").notNull(),
  likelihood: varchar("likelihood"),
  impact: varchar("impact"),
  mitigation: text("mitigation"),
  status: varchar("status").default("open"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 4: IoT & Field Service ==========
export const iotDevices = pgTable("iot_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceName: varchar("device_name").notNull(),
  deviceType: varchar("device_type"),
  serialNumber: varchar("serial_number").unique(),
  location: varchar("location"),
  status: varchar("status").default("active"),
  lastHeartbeat: timestamp("last_heartbeat"),
  metrics: jsonb("metrics"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const iotSensors = pgTable("iot_sensors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull(),
  sensorType: varchar("sensor_type"),
  readingValue: numeric("reading_value", { precision: 10, scale: 2 }),
  unit: varchar("unit"),
  timestamp: timestamp("timestamp").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 4: MOBILE APPS ==========
export const mobileApps = pgTable("mobile_apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appName: varchar("app_name").notNull(),
  platform: varchar("platform"),
  version: varchar("version"),
  releaseDate: timestamp("release_date"),
  status: varchar("status").default("active"),
  downloadCount: integer("download_count").default(0),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const mobileUsageMetrics = pgTable("mobile_usage_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  dailyActiveUsers: integer("daily_active_users"),
  sessionDuration: integer("session_duration"),
  crashReports: integer("crash_reports"),
  timestamp: timestamp("timestamp").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 4: ADVANCED ANALYTICS ==========
export const advancedDashboards = pgTable("advanced_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  owner: varchar("owner"),
  dashboardType: varchar("dashboard_type"),
  widgets: jsonb("widgets"),
  customMetrics: jsonb("custom_metrics"),
  refreshInterval: integer("refresh_interval"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const predictiveModels = pgTable("predictive_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelName: varchar("model_name").notNull(),
  modelType: varchar("model_type"),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
  lastTrainDate: timestamp("last_train_date"),
  predictions: jsonb("predictions"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const forecastData = pgTable("forecast_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelId: varchar("model_id").notNull(),
  forecastPeriod: varchar("forecast_period"),
  metric: varchar("metric"),
  predictedValue: numeric("predicted_value", { precision: 15, scale: 2 }),
  confidenceInterval: numeric("confidence_interval", { precision: 5, scale: 2 }),
  actualValue: numeric("actual_value", { precision: 15, scale: 2 }),
  timestamp: timestamp("timestamp").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 5: SUPPLY CHAIN MANAGEMENT ==========
export const supplyChainPartners = pgTable("supply_chain_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerName: varchar("partner_name").notNull(),
  partnerType: varchar("partner_type"),
  location: varchar("location"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  reliabilityScore: numeric("reliability_score", { precision: 5, scale: 2 }),
  contracts: jsonb("contracts"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shipmentNumber: varchar("shipment_number").notNull(),
  supplierId: varchar("supplier_id"),
  origin: varchar("origin"),
  destination: varchar("destination"),
  departureDate: timestamp("departure_date"),
  arrivalDate: timestamp("arrival_date"),
  status: varchar("status").default("in-transit"),
  trackingNumber: varchar("tracking_number"),
  cost: numeric("cost", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 5: INVENTORY MANAGEMENT ==========
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemCode: varchar("item_code").notNull().unique(),
  itemName: varchar("item_name").notNull(),
  category: varchar("category"),
  quantity: integer("quantity").default(0),
  reorderLevel: integer("reorder_level"),
  unitCost: numeric("unit_cost", { precision: 15, scale: 2 }),
  warehouse: varchar("warehouse"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const warehouseLocations = pgTable("warehouse_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseName: varchar("warehouse_name").notNull(),
  location: varchar("location"),
  capacity: integer("capacity"),
  occupancy: numeric("occupancy", { precision: 5, scale: 2 }),
  manager: varchar("manager"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 5: QUALITY MANAGEMENT ==========
export const qualityChecks = pgTable("quality_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  checkNumber: varchar("check_number").notNull(),
  itemId: varchar("item_id"),
  checkType: varchar("check_type"),
  inspector: varchar("inspector"),
  result: varchar("result"),
  defects: jsonb("defects"),
  checkDate: timestamp("check_date"),
  status: varchar("status").default("completed"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const nonConformances = pgTable("non_conformances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ncNumber: varchar("nc_number").notNull(),
  description: text("description"),
  severity: varchar("severity"),
  rootCause: text("root_cause"),
  correctionAction: text("correction_action"),
  assignedTo: varchar("assigned_to"),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("open"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 5: INTEGRATION HUB ==========
export const integrationConnections = pgTable("integration_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  systemName: varchar("system_name").notNull(),
  apiEndpoint: varchar("api_endpoint"),
  authType: varchar("auth_type"),
  status: varchar("status").default("connected"),
  lastSyncDate: timestamp("last_sync_date"),
  errorLogs: jsonb("error_logs"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const dataIntegrationJobs = pgTable("data_integration_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobName: varchar("job_name").notNull(),
  sourceSystem: varchar("source_system"),
  targetSystem: varchar("target_system"),
  frequency: varchar("frequency"),
  lastRunDate: timestamp("last_run_date"),
  nextRunDate: timestamp("next_run_date"),
  recordsProcessed: integer("records_processed").default(0),
  status: varchar("status").default("scheduled"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 6: DOCUMENT MANAGEMENT ==========
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentName: varchar("document_name").notNull(),
  documentType: varchar("document_type"),
  owner: varchar("owner"),
  filePath: varchar("file_path"),
  fileSize: integer("file_size"),
  status: varchar("status").default("active"),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const documentApprovals = pgTable("document_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  approver: varchar("approver"),
  approvalStatus: varchar("approval_status"),
  comments: text("comments"),
  approvalDate: timestamp("approval_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 6: EXPENSE MANAGEMENT ==========
export const expenseReports = pgTable("expense_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportNumber: varchar("report_number").notNull(),
  employeeId: varchar("employee_id"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }),
  currency: varchar("currency").default("USD"),
  status: varchar("status").default("draft"),
  submitDate: timestamp("submit_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const expenseItems = pgTable("expense_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull(),
  category: varchar("category"),
  description: text("description"),
  amount: numeric("amount", { precision: 15, scale: 2 }),
  receiptDate: timestamp("receipt_date"),
  attachmentPath: varchar("attachment_path"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 6: TRAVEL MANAGEMENT ==========
export const travelRequests = pgTable("travel_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestNumber: varchar("request_number").notNull(),
  employeeId: varchar("employee_id"),
  destination: varchar("destination"),
  purpose: text("purpose"),
  departureDate: timestamp("departure_date"),
  returnDate: timestamp("return_date"),
  status: varchar("status").default("pending"),
  approvedBy: varchar("approved_by"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const travelExpenses = pgTable("travel_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  travelRequestId: varchar("travel_request_id").notNull(),
  category: varchar("category"),
  vendor: varchar("vendor"),
  amount: numeric("amount", { precision: 15, scale: 2 }),
  bookingReference: varchar("booking_reference"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 6: TIME & ATTENDANCE ==========
export const timeEntries = pgTable("time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  entryDate: timestamp("entry_date"),
  clockIn: timestamp("clock_in"),
  clockOut: timestamp("clock_out"),
  hoursWorked: numeric("hours_worked", { precision: 5, scale: 2 }),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  recordDate: timestamp("record_date"),
  status: varchar("status"),
  reason: text("reason"),
  approvedBy: varchar("approved_by"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 6: LEARNING MANAGEMENT ==========
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseName: varchar("course_name").notNull(),
  description: text("description"),
  instructor: varchar("instructor"),
  duration: integer("duration"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  capacity: integer("capacity"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const courseEnrollments = pgTable("course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  employeeId: varchar("employee_id").notNull(),
  enrollmentDate: timestamp("enrollment_date"),
  completionDate: timestamp("completion_date"),
  progressPercentage: numeric("progress_percentage", { precision: 5, scale: 2 }),
  status: varchar("status").default("enrolled"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 6: KNOWLEDGE MANAGEMENT ==========
export const knowledgeBase = pgTable("knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content"),
  category: varchar("category"),
  author: varchar("author"),
  tags: jsonb("tags"),
  views: integer("views").default(0),
  helpful: integer("helpful").default(0),
  status: varchar("status").default("published"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const knowledgeComments = pgTable("knowledge_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull(),
  author: varchar("author"),
  comment: text("comment"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PRODUCTION FEATURES ==========
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: varchar("subject").notNull(),
  content: text("content"),
  recipientCount: integer("recipient_count").default(0),
  status: varchar("status").default("draft"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: varchar("location"),
  attendees: jsonb("attendees"),
  createdAt: timestamp("created_at").default(sql`now()`),
});


export const userNotifications = pgTable("user_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: varchar("title").notNull(),
  message: text("message"),
  type: varchar("type").default("info"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const guidedTours = pgTable("guided_tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  tourId: varchar("tour_id").notNull(),
  status: varchar("status").default("not_started"),
  currentStep: integer("current_step").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const churnPredictions = pgTable("churn_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(),
  riskScore: numeric("risk_score", { precision: 5, scale: 2 }),
  factors: jsonb("factors"),
  recommendedActions: jsonb("recommended_actions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deviceName: varchar("device_name"),
  ipAddress: varchar("ip_address"),
  location: varchar("location"),
  loginTime: timestamp("login_time").default(sql`now()`),
  lastActivityTime: timestamp("last_activity_time"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const loginAudit = pgTable("login_audit", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  email: varchar("email"),
  ipAddress: varchar("ip_address"),
  device: varchar("device"),
  location: varchar("location"),
  status: varchar("status").default("success"),
  mfaUsed: boolean("mfa_used").default(false),
  loginTime: timestamp("login_time").default(sql`now()`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const securitySettings = pgTable("security_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaMethods: jsonb("mfa_methods"),
  sessionTimeout: integer("session_timeout").default(30),
  passwordExpiry: integer("password_expiry").default(90),
  ipWhitelist: jsonb("ip_whitelist"),
  maxConcurrentSessions: integer("max_concurrent_sessions").default(3),
  loginAttemptLimit: integer("login_attempt_limit").default(5),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const roleHierarchies = pgTable("role_hierarchies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentRoleId: varchar("parent_role_id"),
  childRoleId: varchar("child_role_id"),
  inheritPermissions: boolean("inherit_permissions").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const segregationOfDuties = pgTable("segregation_of_duties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull(),
  conflictingRole1: varchar("conflicting_role_1").notNull(),
  conflictingRole2: varchar("conflicting_role_2").notNull(),
  description: text("description"),
  mitigationControl: text("mitigation_control"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const roleAssignments = pgTable("role_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  roleId: varchar("role_id").notNull(),
  startDate: timestamp("start_date").default(sql`now()`),
  endDate: timestamp("end_date"),
  status: varchar("status").default("active"),
  assignedBy: varchar("assigned_by"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const permissionOverrides = pgTable("permission_overrides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").notNull(),
  module: varchar("module").notNull(),
  action: varchar("action").notNull(),
  allowed: boolean("allowed").default(true),
  fieldLevelSecurity: jsonb("field_level_security"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== MODULE 3: AUTHENTICATION, MFA & SECURITY ==========
export const authenticationSettings = pgTable("authentication_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  authMethod: varchar("auth_method").notNull(),
  ssoProvider: varchar("sso_provider"),
  oauthClientId: varchar("oauth_client_id"),
  redirectUrls: jsonb("redirect_urls"),
  tokenExpiry: integer("token_expiry").default(3600),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const mfaPolicies = pgTable("mfa_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  mfaType: varchar("mfa_type").notNull(),
  enforced: boolean("enforced").default(false),
  scope: varchar("scope").default("all_users"),
  backupCodesEnabled: boolean("backup_codes_enabled").default(true),
  maxAttempts: integer("max_attempts").default(5),
  expiryMinutes: integer("expiry_minutes").default(10),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const passwordPolicies = pgTable("password_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  minLength: integer("min_length").default(8),
  maxLength: integer("max_length").default(128),
  requireUppercase: boolean("require_uppercase").default(true),
  requireLowercase: boolean("require_lowercase").default(true),
  requireNumbers: boolean("require_numbers").default(true),
  requireSpecialChars: boolean("require_special_chars").default(true),
  expiryDays: integer("expiry_days").default(90),
  reuseRestriction: integer("reuse_restriction").default(5),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const deviceEnrollment = pgTable("device_enrollment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deviceId: varchar("device_id").notNull(),
  deviceType: varchar("device_type"),
  deviceOs: varchar("device_os"),
  deviceBrowser: varchar("device_browser"),
  status: varchar("status").default("pending"),
  ipAddress: varchar("ip_address"),
  enrolledAt: timestamp("enrolled_at").default(sql`now()`),
  lastUsed: timestamp("last_used"),
});

export const securityEventLog = pgTable("security_event_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id"),
  userId: varchar("user_id"),
  eventType: varchar("event_type").notNull(),
  module: varchar("module"),
  device: varchar("device"),
  ipAddress: varchar("ip_address"),
  status: varchar("status"),
  actionTaken: text("action_taken"),
  timestamp: timestamp("timestamp").default(sql`now()`),
});
