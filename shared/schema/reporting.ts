import { pgTable, varchar, text, timestamp, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== REPORTING MODULE ==========
export const reports = pgTable("reports", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    module: varchar("module"),
    type: varchar("type"), // chart, table, summary
    category: varchar("category"),
    config: jsonb("config"),
    isFavorite: boolean("is_favorite").default(false),
    isPublic: boolean("is_public").default(false),
    createdBy: varchar("created_by"),
    lastRunAt: timestamp("last_run_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// CRM Report Configuration Schemas
export const CrmReportEntity = z.enum([
    "leads",
    "opportunities",
    "accounts",
    "contacts",
    "activities"
]);
export type CrmReportEntity = z.infer<typeof CrmReportEntity>;

export const CrmReportAggregation = z.enum(["count", "sum", "avg", "min", "max"]);
export type CrmReportAggregation = z.infer<typeof CrmReportAggregation>;

export const crmReportConfigSchema = z.object({
    entity: CrmReportEntity,
    metrics: z.array(z.object({
        field: z.string(),
        aggregation: CrmReportAggregation,
        label: z.string().optional()
    })),
    dimensions: z.array(z.object({
        field: z.string(),
        label: z.string().optional()
    })).optional(),
    filters: z.array(z.object({
        field: z.string(),
        operator: z.enum(["equals", "contains", "gt", "lt", "between", "in"]),
        value: z.any()
    })).optional(),
    sortBy: z.array(z.object({
        field: z.string(),
        direction: z.enum(["asc", "desc"])
    })).optional(),
    limit: z.number().optional()
});

export type CrmReportConfig = z.infer<typeof crmReportConfigSchema>;

export const insertReportSchema = createInsertSchema(reports).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    module: z.string().optional(),
    type: z.string().optional(),
    category: z.string().optional(),
    config: z.record(z.any()).optional(),
    isFavorite: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    createdBy: z.string().optional(),
    lastRunAt: z.date().optional().nullable(),
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export const smartViews = pgTable("smart_views", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    formId: varchar("form_id").notNull(),
    name: varchar("name").notNull(),
    description: text("description"),
    filters: jsonb("filters").default(sql`'[]'::jsonb`), // Array of {field, operator, value}
    sortBy: jsonb("sort_by").default(sql`'[]'::jsonb`), // Array of {field, direction}
    visibleColumns: text("visible_columns").array(),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertSmartViewSchema = createInsertSchema(smartViews).extend({
    formId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    filters: z.array(z.record(z.any())).optional(),
    sortBy: z.array(z.record(z.any())).optional(),
    visibleColumns: z.array(z.string()).optional(),
});

export type InsertSmartView = z.infer<typeof insertSmartViewSchema>;
export type SmartView = typeof smartViews.$inferSelect;

export const timeSeriesData = pgTable("time_series_data", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    seriesName: varchar("series_name").notNull(),
    dataPoint: timestamp("data_point").notNull(),
    value: numeric("value", { precision: 18, scale: 4 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTimeSeriesDataSchema = createInsertSchema(timeSeriesData).extend({
    seriesName: z.string().min(1),
    dataPoint: z.date(),
    value: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

export type InsertTimeSeriesData = z.infer<typeof insertTimeSeriesDataSchema>;
export type TimeSeriesData = typeof timeSeriesData.$inferSelect;

export const biDashboards = pgTable("bi_dashboards", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    layout: jsonb("layout"),
    widgets: jsonb("widgets"),
    filters: jsonb("filters"),
    isPublic: boolean("is_public").default(false),
    createdBy: varchar("created_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertBiDashboardSchema = createInsertSchema(biDashboards).extend({
    name: z.string().min(1),
    description: z.string().optional(),
    layout: z.record(z.any()).optional(),
    widgets: z.record(z.any()).optional(),
    filters: z.record(z.any()).optional(),
    isPublic: z.boolean().optional(),
    createdBy: z.string().optional(),
});

export type InsertBiDashboard = z.infer<typeof insertBiDashboardSchema>;
export type BiDashboard = typeof biDashboards.$inferSelect;


// ========== GL REPORTING EXTENSIONS (FSG+) ==========

// Report Schedules: Reusable recurring jobs
export const glReportSchedules = pgTable("gl_report_schedules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reportId: varchar("report_id").notNull(), // Link to glReportDefinitions or reports
    name: varchar("name").notNull(),
    recurrence: varchar("recurrence").notNull(), // CRON or "DAILY", "WEEKLY", "MONTHLY"
    parameters: jsonb("parameters"), // { period: "CURRENT", ledgerId: "..." }
    recipientEmails: text("recipient_emails"), // Comma-separated or JSON array
    nextRunAt: timestamp("next_run_at"),
    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlReportScheduleSchema = createInsertSchema(glReportSchedules);
export type InsertGlReportSchedule = z.infer<typeof insertGlReportScheduleSchema>;
export type GlReportSchedule = typeof glReportSchedules.$inferSelect;

// Report Instances: Historical records of generated reports
export const glReportInstances = pgTable("gl_report_instances", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reportId: varchar("report_id").notNull(),
    scheduleId: varchar("schedule_id"), // Optional: Link to the schedule that triggered it
    runDate: timestamp("run_date").default(sql`now()`),
    status: varchar("status").default("COMPLETED"), // COMPLETED, FAILED, RUNNING
    outputPath: text("output_path"), // S3 or Local path to PDF/Excel
    filtersApplied: jsonb("filters_applied"),
    errorLog: text("error_log"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlReportInstanceSchema = createInsertSchema(glReportInstances);
export type InsertGlReportInstance = z.infer<typeof insertGlReportInstanceSchema>;
export type GlReportInstance = typeof glReportInstances.$inferSelect;
