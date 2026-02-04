import { pgTable, varchar, text, timestamp, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== HR ANALYTICS FOUNDATION ==========

// 1. KPI Definitions: The "Rules" for metrics
// Defines what "Turnover" means, how it's calculated (in SQL description), and frequency
export const hrKpiDefinitions = pgTable("hr_kpi_definitions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(), // e.g., "Total Headcount", "Voluntary Turnover"
    code: varchar("code").notNull().unique(), // e.g., "HR_HEADCOUNT", "HR_TURNOVER_VOL"
    description: text("description"),
    category: varchar("category").notNull(), // "WORKFORCE", "RECRUITING", "PERFORMANCE"
    periodicity: varchar("periodicity").default("DAILY"), // DAILY, WEEKLY, MONTHLY
    direction: varchar("direction").default("UP"), // UP = Good (Retention), DOWN = Good (Attriton)
    format: varchar("format").default("NUMBER"), // NUMBER, PERCENT, CURRENCY
    targetValue: numeric("target_value"), // Optional goal
    sqlLogic: text("sql_logic"), // Descriptive SQL or actual execution query
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertHrKpiDefinitionSchema = createInsertSchema(hrKpiDefinitions);
export type InsertHrKpiDefinition = z.infer<typeof insertHrKpiDefinitionSchema>;
export type HrKpiDefinition = typeof hrKpiDefinitions.$inferSelect;

// 2. Analytics Snapshots: The "Data Warehouse"
// Stores the value of a KPI at a specific point in time, sliced by dimensions
export const hrAnalyticsSnapshots = pgTable("hr_analytics_snapshots", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    kpiId: varchar("kpi_id").notNull(), // FK to hrKpiDefinitions
    snapshotDate: timestamp("snapshot_date").notNull(),
    value: numeric("value", { precision: 18, scale: 4 }).notNull(),

    // Dimensions stored as JSONB for flexibility (Department, Location, Job Family)
    // Example: { "department": "Sales", "location": "US-East" }
    dimensions: jsonb("dimensions").default(sql`'{}'::jsonb`),

    tenantId: varchar("tenant_id").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertHrAnalyticsSnapshotSchema = createInsertSchema(hrAnalyticsSnapshots);
export type InsertHrAnalyticsSnapshot = z.infer<typeof insertHrAnalyticsSnapshotSchema>;
export type HrAnalyticsSnapshot = typeof hrAnalyticsSnapshots.$inferSelect;

// 3. Predictive Models (Metadata)
// Stores metadata about ML models (not the model itself)
export const hrPredictiveModels = pgTable("hr_predictive_models", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(), // e.g., "Attrition Risk V1"
    type: varchar("type").notNull(), // "REGRESSION", "CLASSIFICATION"
    targetKpiId: varchar("target_kpi_id"), // KPIs this model predicts
    accuracy: numeric("accuracy"), // Last trained accuracy (0-100)
    lastTrainedAt: timestamp("last_trained_at"),
    config: jsonb("config"), // Hyperparameters, features used
    status: varchar("status").default("ACTIVE"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertHrPredictiveModelSchema = createInsertSchema(hrPredictiveModels);
export type InsertHrPredictiveModel = z.infer<typeof insertHrPredictiveModelSchema>;
export type HrPredictiveModel = typeof hrPredictiveModels.$inferSelect;

// 4. Report Schedules
export const hrReportSchedules = pgTable("hr_report_schedules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reportType: varchar("report_type").notNull(), // TERMINATION_LOG, NEW_HIRES
    cronExpression: varchar("cron_expression").notNull(), // e.g., "0 9 * * 1"
    recipients: jsonb("recipients").default(sql`'[]'::jsonb`), // ["email@example.com"]
    isActive: boolean("is_active").default(true),

    tenantId: varchar("tenant_id").notNull(),
    lastRunAt: timestamp("last_run_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertHrReportScheduleSchema = createInsertSchema(hrReportSchedules);
export type InsertHrReportSchedule = z.infer<typeof insertHrReportScheduleSchema>;
export type HrReportSchedule = typeof hrReportSchedules.$inferSelect;
