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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true }).extend({
  email: z.string().email().optional(),
  password: z.string().optional(),
  name: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
  email: z.string().email().optional().nullable(),
  company: z.string().optional().nullable(),
  score: z.string().optional(),
  status: z.string().optional(),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// ========== PROJECT MANAGEMENT MODULE ==========
export const workOrders = pgTable("work_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").default("open"),
  assignedTo: varchar("assigned_to"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ id: true, createdAt: true }).extend({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  dueDate: z.date().optional().nullable(),
});

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

// ========== HR MODULE ==========
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  department: varchar("department"),
  role: varchar("role"),
  salary: numeric("salary", { precision: 18, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  department: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// ========== MOBILE & SYNC ==========
export const mobileDevices = pgTable("mobile_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deviceId: varchar("device_id").notNull(),
  platform: varchar("platform"),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMobileDeviceSchema = createInsertSchema(mobileDevices).omit({ id: true, createdAt: true }).extend({
  userId: z.string().min(1),
  deviceId: z.string().min(1),
  platform: z.string().optional().nullable(),
});

export type InsertMobileDevice = z.infer<typeof insertMobileDeviceSchema>;
export type MobileDevice = typeof mobileDevices.$inferSelect;

export const offlineSync = pgTable("offline_sync", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull(),
  data: jsonb("data"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertOfflineSyncSchema = createInsertSchema(offlineSync).omit({ id: true, createdAt: true }).extend({
  deviceId: z.string().min(1),
  data: z.any().optional(),
  status: z.string().optional(),
});

export type InsertOfflineSync = z.infer<typeof insertOfflineSyncSchema>;
export type OfflineSync = typeof offlineSync.$inferSelect;

// ========== AI COPILOT ==========
export const copilotConversations = pgTable("copilot_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: varchar("title"),
  context: varchar("context"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCopilotConversationSchema = createInsertSchema(copilotConversations).omit({ id: true, createdAt: true }).extend({
  userId: z.string().min(1),
  title: z.string().optional().nullable(),
  context: z.string().optional().nullable(),
});

export type InsertCopilotConversation = z.infer<typeof insertCopilotConversationSchema>;
export type CopilotConversation = typeof copilotConversations.$inferSelect;

export const copilotMessages = pgTable("copilot_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: varchar("role"), // user, assistant
  content: text("content"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCopilotMessageSchema = createInsertSchema(copilotMessages).omit({ id: true, createdAt: true }).extend({
  conversationId: z.string().min(1),
  role: z.string().optional(),
  content: z.string().optional(),
});

export type InsertCopilotMessage = z.infer<typeof insertCopilotMessageSchema>;
export type CopilotMessage = typeof copilotMessages.$inferSelect;

// ========== FORECASTING & ANALYTICS ==========
export const revenueForecasts = pgTable("revenue_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: varchar("month").notNull(),
  forecastedAmount: numeric("forecasted_amount", { precision: 18, scale: 2 }),
  actualAmount: numeric("actual_amount", { precision: 18, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenueForecastSchema = createInsertSchema(revenueForecasts).omit({ id: true, createdAt: true }).extend({
  month: z.string().min(1),
  forecastedAmount: z.string().optional(),
  actualAmount: z.string().optional(),
});

export type InsertRevenueForecast = z.infer<typeof insertRevenueForecastSchema>;
export type RevenueForecast = typeof revenueForecasts.$inferSelect;

export const budgetAllocations = pgTable("budget_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  department: varchar("department").notNull(),
  year: integer("year"),
  amount: numeric("amount", { precision: 18, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBudgetAllocationSchema = createInsertSchema(budgetAllocations).omit({ id: true, createdAt: true }).extend({
  department: z.string().min(1),
  year: z.number().optional(),
  amount: z.string().optional(),
});

export type InsertBudgetAllocation = z.infer<typeof insertBudgetAllocationSchema>;
export type BudgetAllocation = typeof budgetAllocations.$inferSelect;

export const timeSeriesData = pgTable("time_series_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metricName: varchar("metric_name").notNull(),
  value: numeric("value", { precision: 18, scale: 2 }),
  timestamp: timestamp("timestamp"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTimeSeriesDataSchema = createInsertSchema(timeSeriesData).omit({ id: true, createdAt: true }).extend({
  metricName: z.string().min(1),
  value: z.string().optional(),
  timestamp: z.date().optional(),
});

export type InsertTimeSeriesData = z.infer<typeof insertTimeSeriesDataSchema>;
export type TimeSeriesData = typeof timeSeriesData.$inferSelect;

export const forecastModels = pgTable("forecast_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelName: varchar("model_name").notNull(),
  modelType: varchar("model_type"),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertForecastModelSchema = createInsertSchema(forecastModels).omit({ id: true, createdAt: true }).extend({
  modelName: z.string().min(1),
  modelType: z.string().optional(),
  accuracy: z.string().optional(),
});

export type InsertForecastModel = z.infer<typeof insertForecastModelSchema>;
export type ForecastModel = typeof forecastModels.$inferSelect;

export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioName: varchar("scenario_name").notNull(),
  description: text("description"),
  assumptions: jsonb("assumptions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({ id: true, createdAt: true }).extend({
  scenarioName: z.string().min(1),
  description: z.string().optional(),
  assumptions: z.any().optional(),
});

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

export const scenarioVariables = pgTable("scenario_variables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  variableName: varchar("variable_name").notNull(),
  value: numeric("value", { precision: 18, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertScenarioVariableSchema = createInsertSchema(scenarioVariables).omit({ id: true, createdAt: true }).extend({
  scenarioId: z.string().min(1),
  variableName: z.string().min(1),
  value: z.string().optional(),
});

export type InsertScenarioVariable = z.infer<typeof insertScenarioVariableSchema>;
export type ScenarioVariable = typeof scenarioVariables.$inferSelect;

// ========== BI & REPORTING ==========
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardId: varchar("dashboard_id"),
  widgetType: varchar("widget_type"),
  config: jsonb("config"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({ id: true, createdAt: true }).extend({
  dashboardId: z.string().optional(),
  widgetType: z.string().optional(),
  config: z.any().optional(),
});

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportName: varchar("report_name").notNull(),
  reportType: varchar("report_type"),
  content: text("content"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true }).extend({
  reportName: z.string().min(1),
  reportType: z.string().optional(),
  content: z.string().optional(),
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  action: varchar("action"),
  resourceType: varchar("resource_type"),
  resourceId: varchar("resource_id"),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true }).extend({
  userId: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  changes: z.any().optional(),
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ========== MARKETPLACE & APPS ==========
export const apps = pgTable("apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appName: varchar("app_name").notNull(),
  appType: varchar("app_type"),
  description: text("description"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAppSchema = createInsertSchema(apps).omit({ id: true, createdAt: true }).extend({
  appName: z.string().min(1),
  appType: z.string().optional(),
  description: z.string().optional(),
});

export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = typeof apps.$inferSelect;

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
  userId: z.string().optional(),
  rating: z.number().optional(),
  comment: z.string().optional(),
});

export type InsertAppReview = z.infer<typeof insertAppReviewSchema>;
export type AppReview = typeof appReviews.$inferSelect;

export const appInstallations = pgTable("app_installations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAppInstallationSchema = createInsertSchema(appInstallations).omit({ id: true, createdAt: true }).extend({
  appId: z.string().min(1),
  tenantId: z.string().min(1),
  status: z.string().optional(),
});

export type InsertAppInstallation = z.infer<typeof insertAppInstallationSchema>;
export type AppInstallation = typeof appInstallations.$inferSelect;

// ========== INTEGRATIONS & WEBHOOKS ==========
export const connectors = pgTable("connectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectorName: varchar("connector_name").notNull(),
  connectorType: varchar("connector_type"),
  apiUrl: varchar("api_url"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConnectorSchema = createInsertSchema(connectors).omit({ id: true, createdAt: true }).extend({
  connectorName: z.string().min(1),
  connectorType: z.string().optional(),
  apiUrl: z.string().optional(),
});

export type InsertConnector = z.infer<typeof insertConnectorSchema>;
export type Connector = typeof connectors.$inferSelect;

export const connectorInstances = pgTable("connector_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectorId: varchar("connector_id").notNull(),
  userId: varchar("user_id"),
  config: jsonb("config"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConnectorInstanceSchema = createInsertSchema(connectorInstances).omit({ id: true, createdAt: true }).extend({
  connectorId: z.string().min(1),
  userId: z.string().optional(),
  config: z.any().optional(),
});

export type InsertConnectorInstance = z.infer<typeof insertConnectorInstanceSchema>;
export type ConnectorInstance = typeof connectorInstances.$inferSelect;

export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type").notNull(),
  payload: jsonb("payload"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({ id: true, createdAt: true }).extend({
  eventType: z.string().min(1),
  payload: z.any().optional(),
  status: z.string().optional(),
});

export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;

// ========== SECURITY & COMPLIANCE ==========
export const abacRules = pgTable("abac_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleName: varchar("rule_name").notNull(),
  attributes: jsonb("attributes"),
  actions: jsonb("actions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAbacRuleSchema = createInsertSchema(abacRules).omit({ id: true, createdAt: true }).extend({
  ruleName: z.string().min(1),
  attributes: z.any().optional(),
  actions: z.any().optional(),
});

export type InsertAbacRule = z.infer<typeof insertAbacRuleSchema>;
export type AbacRule = typeof abacRules.$inferSelect;

export const encryptedFields = pgTable("encrypted_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableName: varchar("table_name").notNull(),
  fieldName: varchar("field_name").notNull(),
  encryptionType: varchar("encryption_type"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEncryptedFieldSchema = createInsertSchema(encryptedFields).omit({ id: true, createdAt: true }).extend({
  tableName: z.string().min(1),
  fieldName: z.string().min(1),
  encryptionType: z.string().optional(),
});

export type InsertEncryptedField = z.infer<typeof insertEncryptedFieldSchema>;
export type EncryptedField = typeof encryptedFields.$inferSelect;

export const complianceConfigs = pgTable("compliance_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configName: varchar("config_name").notNull(),
  framework: varchar("framework"),
  requirements: jsonb("requirements"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertComplianceConfigSchema = createInsertSchema(complianceConfigs).omit({ id: true, createdAt: true }).extend({
  configName: z.string().min(1),
  framework: z.string().optional(),
  requirements: z.any().optional(),
});

export type InsertComplianceConfig = z.infer<typeof insertComplianceConfigSchema>;
export type ComplianceConfig = typeof complianceConfigs.$inferSelect;

// ========== PROJECT & AGILE MANAGEMENT ==========
export const sprints = pgTable("sprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  sprintName: varchar("sprint_name").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSprintSchema = createInsertSchema(sprints).omit({ id: true, createdAt: true }).extend({
  projectId: z.string().min(1),
  sprintName: z.string().min(1),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type InsertSprint = z.infer<typeof insertSprintSchema>;
export type Sprint = typeof sprints.$inferSelect;

export const issues = pgTable("issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sprintId: varchar("sprint_id").notNull(),
  issueName: varchar("issue_name").notNull(),
  issueType: varchar("issue_type"),
  status: varchar("status").default("open"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertIssueSchema = createInsertSchema(issues).omit({ id: true, createdAt: true }).extend({
  sprintId: z.string().min(1),
  issueName: z.string().min(1),
  issueType: z.string().optional(),
  status: z.string().optional(),
});

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

// ========== DATA MANAGEMENT ==========
export const dataLakes = pgTable("data_lakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lakeName: varchar("lake_name").notNull(),
  storageType: varchar("storage_type"),
  capacity: varchar("capacity"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertDataLakeSchema = createInsertSchema(dataLakes).omit({ id: true, createdAt: true }).extend({
  lakeName: z.string().min(1),
  storageType: z.string().optional(),
  capacity: z.string().optional(),
});

export type InsertDataLake = z.infer<typeof insertDataLakeSchema>;
export type DataLake = typeof dataLakes.$inferSelect;

export const etlPipelines = pgTable("etl_pipelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pipelineName: varchar("pipeline_name").notNull(),
  source: varchar("source"),
  destination: varchar("destination"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEtlPipelineSchema = createInsertSchema(etlPipelines).omit({ id: true, createdAt: true }).extend({
  pipelineName: z.string().min(1),
  source: z.string().optional(),
  destination: z.string().optional(),
  status: z.string().optional(),
});

export type InsertEtlPipeline = z.infer<typeof insertEtlPipelineSchema>;
export type EtlPipeline = typeof etlPipelines.$inferSelect;

export const biDashboards = pgTable("bi_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardName: varchar("dashboard_name").notNull(),
  dataSource: varchar("data_source"),
  visualizations: jsonb("visualizations"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBiDashboardSchema = createInsertSchema(biDashboards).omit({ id: true, createdAt: true }).extend({
  dashboardName: z.string().min(1),
  dataSource: z.string().optional(),
  visualizations: z.any().optional(),
});

export type InsertBiDashboard = z.infer<typeof insertBiDashboardSchema>;
export type BiDashboard = typeof biDashboards.$inferSelect;

// ========== FIELD SERVICE ==========
export const fieldServiceJobs = pgTable("field_service_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobName: varchar("job_name").notNull(),
  location: varchar("location"),
  assignedTech: varchar("assigned_tech"),
  status: varchar("status").default("scheduled"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertFieldServiceJobSchema = createInsertSchema(fieldServiceJobs).omit({ id: true, createdAt: true }).extend({
  jobName: z.string().min(1),
  location: z.string().optional(),
  assignedTech: z.string().optional(),
  status: z.string().optional(),
});

export type InsertFieldServiceJob = z.infer<typeof insertFieldServiceJobSchema>;
export type FieldServiceJob = typeof fieldServiceJobs.$inferSelect;

// ========== PAYROLL ==========
export const payrollConfigs = pgTable("payroll_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  configName: varchar("config_name").notNull(),
  payrollCycle: varchar("payroll_cycle"),
  taxRules: jsonb("tax_rules"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPayrollConfigSchema = createInsertSchema(payrollConfigs).omit({ id: true, createdAt: true }).extend({
  configName: z.string().min(1),
  payrollCycle: z.string().optional(),
  taxRules: z.any().optional(),
});

export type InsertPayrollConfig = z.infer<typeof insertPayrollConfigSchema>;
export type PayrollConfig = typeof payrollConfigs.$inferSelect;

// ========== BILLING & SUBSCRIPTIONS ==========
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique(),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  slug: z.string().min(1),
  status: z.string().optional(),
});

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  roleName: varchar("role_name").notNull(),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true }).extend({
  tenantId: z.string().min(1),
  roleName: z.string().min(1),
  permissions: z.any().optional(),
});

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  price: varchar("price"),
  billingCycle: varchar("billing_cycle"),
  features: jsonb("features"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  price: z.string().optional(),
  billingCycle: z.string().optional(),
  features: z.any().optional(),
  status: z.string().optional(),
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  planId: varchar("plan_id").notNull(),
  status: varchar("status").default("active"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true }).extend({
  tenantId: z.string().min(1),
  planId: z.string().min(1),
  status: z.string().optional(),
  currentPeriodEnd: z.date().optional(),
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  method: varchar("method"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true }).extend({
  invoiceId: z.string().min(1),
  amount: z.string().min(1),
  method: z.string().optional(),
  status: z.string().optional(),
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ========== EDUCATION PACK ==========
export const educationPrograms = pgTable("education_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  programId: varchar("program_id").notNull().unique(),
  programName: varchar("program_name").notNull(),
  description: text("description"),
  duration: varchar("duration"),
  status: varchar("status").default("ACTIVE"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationStudents = pgTable("education_students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull().unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  enrollmentStatus: varchar("enrollment_status").default("ACTIVE"),
  programId: varchar("program_id"),
  admissionDate: timestamp("admission_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationFaculty = pgTable("education_faculty", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  facultyId: varchar("faculty_id").notNull().unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  department: varchar("department"),
  qualification: varchar("qualification"),
  status: varchar("status").default("ACTIVE"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationCourses = pgTable("education_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  courseId: varchar("course_id").notNull().unique(),
  courseName: varchar("course_name").notNull(),
  description: text("description"),
  facultyId: varchar("faculty_id"),
  credits: integer("credits"),
  status: varchar("status").default("ACTIVE"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationEnrollments = pgTable("education_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id").notNull(),
  enrollmentDate: timestamp("enrollment_date"),
  status: varchar("status").default("ENROLLED"),
  grade: varchar("grade"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationAssignments = pgTable("education_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  assignmentId: varchar("assignment_id").notNull().unique(),
  courseId: varchar("course_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationGrades = pgTable("education_grades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id").notNull(),
  score: integer("score"),
  grade: varchar("grade"),
  gradeDate: timestamp("grade_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationBilling = pgTable("education_billing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  invoiceId: varchar("invoice_id").notNull().unique(),
  studentId: varchar("student_id").notNull(),
  amount: numeric("amount"),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("PENDING"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationEvents = pgTable("education_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  eventId: varchar("event_id").notNull().unique(),
  eventName: varchar("event_name").notNull(),
  eventDate: timestamp("event_date"),
  capacity: integer("capacity"),
  status: varchar("status").default("SCHEDULED"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const educationAttendance = pgTable("education_attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id"),
  attendanceDate: timestamp("attendance_date"),
  status: varchar("status").default("PRESENT"),
  createdAt: timestamp("created_at").default(sql`now()`),
});
