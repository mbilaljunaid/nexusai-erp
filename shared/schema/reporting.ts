import { pgTable, varchar, text, timestamp, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== REPORTING MODULE ==========
export const reports = pgTable("reports", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    module: varchar("module"),
    type: varchar("type"), // chart, table, summary
    category: varchar("category"),
    config: jsonb("config"),
    isFavorite: boolean("is_favorite").default(false),
    lastRunAt: timestamp("last_run_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true }).extend({
    name: z.string().min(1),
    module: z.string().optional(),
    type: z.string().optional(),
    category: z.string().optional(),
    config: z.record(z.any()).optional(),
    isFavorite: z.boolean().optional(),
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

export const insertSmartViewSchema = createInsertSchema(smartViews).omit({ id: true, createdAt: true, updatedAt: true }).extend({
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

export const insertTimeSeriesDataSchema = createInsertSchema(timeSeriesData).omit({ id: true, createdAt: true }).extend({
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

export const insertBiDashboardSchema = createInsertSchema(biDashboards).omit({ id: true, createdAt: true, updatedAt: true }).extend({
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
