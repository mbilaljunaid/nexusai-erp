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
