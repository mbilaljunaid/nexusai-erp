"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertHrReportScheduleSchema = exports.hrReportSchedules = exports.hrMarketBenchmarks = exports.insertHrPredictiveModelSchema = exports.hrPredictiveModels = exports.insertHrAnalyticsSnapshotSchema = exports.hrAnalyticsSnapshots = exports.insertHrKpiDefinitionSchema = exports.hrKpiDefinitions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== HR ANALYTICS FOUNDATION ==========
// 1. KPI Definitions: The "Rules" for metrics
// Defines what "Turnover" means, how it's calculated (in SQL description), and frequency
exports.hrKpiDefinitions = (0, pg_core_1.pgTable)("hr_kpi_definitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g., "Total Headcount", "Voluntary Turnover"
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // e.g., "HR_HEADCOUNT", "HR_TURNOVER_VOL"
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category").notNull(), // "WORKFORCE", "RECRUITING", "PERFORMANCE"
    periodicity: (0, pg_core_1.varchar)("periodicity").default("DAILY"), // DAILY, WEEKLY, MONTHLY
    direction: (0, pg_core_1.varchar)("direction").default("UP"), // UP = Good (Retention), DOWN = Good (Attriton)
    format: (0, pg_core_1.varchar)("format").default("NUMBER"), // NUMBER, PERCENT, CURRENCY
    targetValue: (0, pg_core_1.numeric)("target_value"), // Optional goal
    sqlLogic: (0, pg_core_1.text)("sql_logic"), // Descriptive SQL or actual execution query
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertHrKpiDefinitionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrKpiDefinitions);
// 2. Analytics Snapshots: The "Data Warehouse"
// Stores the value of a KPI at a specific point in time, sliced by dimensions
exports.hrAnalyticsSnapshots = (0, pg_core_1.pgTable)("hr_analytics_snapshots", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    kpiId: (0, pg_core_1.varchar)("kpi_id").notNull(), // FK to hrKpiDefinitions
    snapshotDate: (0, pg_core_1.timestamp)("snapshot_date").notNull(),
    value: (0, pg_core_1.numeric)("value", { precision: 18, scale: 4 }).notNull(),
    // Dimensions stored as JSONB for flexibility (Department, Location, Job Family)
    // Example: { "department": "Sales", "location": "US-East" }
    dimensions: (0, pg_core_1.jsonb)("dimensions").default((0, drizzle_orm_1.sql) `'{}'::jsonb`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertHrAnalyticsSnapshotSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrAnalyticsSnapshots);
// 3. Predictive Models (Metadata)
// Stores metadata about ML models (not the model itself)
exports.hrPredictiveModels = (0, pg_core_1.pgTable)("hr_predictive_models", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g., "Attrition Risk V1"
    type: (0, pg_core_1.varchar)("type").notNull(), // "REGRESSION", "CLASSIFICATION"
    targetKpiId: (0, pg_core_1.varchar)("target_kpi_id"), // KPIs this model predicts
    accuracy: (0, pg_core_1.numeric)("accuracy"), // Last trained accuracy (0-100)
    lastTrainedAt: (0, pg_core_1.timestamp)("last_trained_at"),
    config: (0, pg_core_1.jsonb)("config"), // Hyperparameters, features used
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertHrPredictiveModelSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrPredictiveModels);
// 4. Market Benchmarks
exports.hrMarketBenchmarks = (0, pg_core_1.pgTable)("hr_market_benchmarks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    jobFamily: (0, pg_core_1.varchar)("job_family").notNull(), // ENGINEERING, SALES, HR
    industry: (0, pg_core_1.varchar)("industry").default("TECH"),
    p50Salary: (0, pg_core_1.numeric)("p50_salary"),
    p90Salary: (0, pg_core_1.numeric)("p90_salary"),
    avgTurnoverRate: (0, pg_core_1.numeric)("avg_turnover_rate"), // Percentage (e.g. 15.0)
    year: (0, pg_core_1.integer)("year").notNull(),
    source: (0, pg_core_1.varchar)("source").default("Internal Survey"),
});
// 5. Report Schedules
exports.hrReportSchedules = (0, pg_core_1.pgTable)("hr_report_schedules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    reportType: (0, pg_core_1.varchar)("report_type").notNull(), // TERMINATION_LOG, NEW_HIRES
    cronExpression: (0, pg_core_1.varchar)("cron_expression").notNull(), // e.g., "0 9 * * 1"
    recipients: (0, pg_core_1.jsonb)("recipients").default((0, drizzle_orm_1.sql) `'[]'::jsonb`), // ["email@example.com"]
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    lastRunAt: (0, pg_core_1.timestamp)("last_run_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertHrReportScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrReportSchedules);
//# sourceMappingURL=hr_analytics.js.map