"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertGlReportInstanceSchema = exports.glReportInstances = exports.insertGlReportScheduleSchema = exports.glReportSchedules = exports.insertBiDashboardSchema = exports.biDashboards = exports.insertTimeSeriesDataSchema = exports.timeSeriesData = exports.insertSmartViewSchema = exports.smartViews = exports.insertReportSchema = exports.crmReportConfigSchema = exports.CrmReportAggregation = exports.CrmReportEntity = exports.reports = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== REPORTING MODULE ==========
exports.reports = (0, pg_core_1.pgTable)("reports", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    module: (0, pg_core_1.varchar)("module"),
    type: (0, pg_core_1.varchar)("type"), // chart, table, summary
    category: (0, pg_core_1.varchar)("category"),
    config: (0, pg_core_1.jsonb)("config"),
    isFavorite: (0, pg_core_1.boolean)("is_favorite").default(false),
    isPublic: (0, pg_core_1.boolean)("is_public").default(false),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    lastRunAt: (0, pg_core_1.timestamp)("last_run_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// CRM Report Configuration Schemas
exports.CrmReportEntity = zod_1.z.enum([
    "leads",
    "opportunities",
    "accounts",
    "contacts",
    "activities"
]);
exports.CrmReportAggregation = zod_1.z.enum(["count", "sum", "avg", "min", "max"]);
exports.crmReportConfigSchema = zod_1.z.object({
    entity: exports.CrmReportEntity,
    metrics: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        aggregation: exports.CrmReportAggregation,
        label: zod_1.z.string().optional()
    })),
    dimensions: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        label: zod_1.z.string().optional()
    })).optional(),
    filters: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        operator: zod_1.z.enum(["equals", "contains", "gt", "lt", "between", "in"]),
        value: zod_1.z.any()
    })).optional(),
    sortBy: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        direction: zod_1.z.enum(["asc", "desc"])
    })).optional(),
    limit: zod_1.z.number().optional()
});
exports.insertReportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reports).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    module: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    isFavorite: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    createdBy: zod_1.z.string().optional(),
    lastRunAt: zod_1.z.date().optional().nullable(),
});
exports.smartViews = (0, pg_core_1.pgTable)("smart_views", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    formId: (0, pg_core_1.varchar)("form_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    filters: (0, pg_core_1.jsonb)("filters").default((0, drizzle_orm_1.sql) `'[]'::jsonb`), // Array of {field, operator, value}
    sortBy: (0, pg_core_1.jsonb)("sort_by").default((0, drizzle_orm_1.sql) `'[]'::jsonb`), // Array of {field, direction}
    visibleColumns: (0, pg_core_1.text)("visible_columns").array(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertSmartViewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.smartViews).extend({
    formId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    filters: zod_1.z.array(zod_1.z.record(zod_1.z.any())).optional(),
    sortBy: zod_1.z.array(zod_1.z.record(zod_1.z.any())).optional(),
    visibleColumns: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.timeSeriesData = (0, pg_core_1.pgTable)("time_series_data", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    seriesName: (0, pg_core_1.varchar)("series_name").notNull(),
    dataPoint: (0, pg_core_1.timestamp)("data_point").notNull(),
    value: (0, pg_core_1.numeric)("value", { precision: 18, scale: 4 }),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTimeSeriesDataSchema = (0, drizzle_zod_1.createInsertSchema)(exports.timeSeriesData).extend({
    seriesName: zod_1.z.string().min(1),
    dataPoint: zod_1.z.date(),
    value: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.biDashboards = (0, pg_core_1.pgTable)("bi_dashboards", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    layout: (0, pg_core_1.jsonb)("layout"),
    widgets: (0, pg_core_1.jsonb)("widgets"),
    filters: (0, pg_core_1.jsonb)("filters"),
    isPublic: (0, pg_core_1.boolean)("is_public").default(false),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertBiDashboardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.biDashboards).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    layout: zod_1.z.record(zod_1.z.any()).optional(),
    widgets: zod_1.z.record(zod_1.z.any()).optional(),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    isPublic: zod_1.z.boolean().optional(),
    createdBy: zod_1.z.string().optional(),
});
// ========== GL REPORTING EXTENSIONS (FSG+) ==========
// Report Schedules: Reusable recurring jobs
exports.glReportSchedules = (0, pg_core_1.pgTable)("gl_report_schedules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    reportId: (0, pg_core_1.varchar)("report_id").notNull(), // Link to glReportDefinitions or reports
    name: (0, pg_core_1.varchar)("name").notNull(),
    recurrence: (0, pg_core_1.varchar)("recurrence").notNull(), // CRON or "DAILY", "WEEKLY", "MONTHLY"
    parameters: (0, pg_core_1.jsonb)("parameters"), // { period: "CURRENT", ledgerId: "..." }
    recipientEmails: (0, pg_core_1.text)("recipient_emails"), // Comma-separated or JSON array
    nextRunAt: (0, pg_core_1.timestamp)("next_run_at"),
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlReportScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glReportSchedules);
// Report Instances: Historical records of generated reports
exports.glReportInstances = (0, pg_core_1.pgTable)("gl_report_instances", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    reportId: (0, pg_core_1.varchar)("report_id").notNull(),
    scheduleId: (0, pg_core_1.varchar)("schedule_id"), // Optional: Link to the schedule that triggered it
    runDate: (0, pg_core_1.timestamp)("run_date").default((0, drizzle_orm_1.sql) `now()`),
    status: (0, pg_core_1.varchar)("status").default("COMPLETED"), // COMPLETED, FAILED, RUNNING
    outputPath: (0, pg_core_1.text)("output_path"), // S3 or Local path to PDF/Excel
    filtersApplied: (0, pg_core_1.jsonb)("filters_applied"),
    errorLog: (0, pg_core_1.text)("error_log"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlReportInstanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glReportInstances);
//# sourceMappingURL=reporting.js.map