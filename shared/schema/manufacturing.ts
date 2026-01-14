import { pgTable, varchar, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== MANUFACTURING MODULE ==========
export const bom = pgTable("bom", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bomNumber: varchar("bom_number").notNull().unique(),
    productId: varchar("product_id"), // FK to inventory
    quantity: integer("quantity"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const bomItems = pgTable("bom_items", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bomId: varchar("bom_id").notNull(),
    productId: varchar("product_id").notNull(), // FK to inventory
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    uom: varchar("uom").default("EA"),
    scrapFactor: numeric("scrap_factor", { precision: 5, scale: 2 }).default("0"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const workCenters = pgTable("work_centers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(), // Added explicit code column if missing in recent view
    name: varchar("name").notNull(),
    description: text("description"),
    capacity: integer("capacity"),
    status: varchar("status").default("active"),
    calendarId: varchar("calendar_id"), // L8 Integration: Link to Production Calendar
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const resources = pgTable("manufacturing_resources", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    resourceCode: varchar("resource_code").notNull().unique(),
    name: varchar("name").notNull(),
    type: varchar("type").notNull(), // LABOR, MACHINE, TOOL
    status: varchar("status").default("active"),
    capacityPerHour: numeric("capacity_per_hour", { precision: 18, scale: 2 }),
    costPerHour: numeric("cost_per_hour", { precision: 18, scale: 2 }),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const routings = pgTable("routings", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    routingNumber: varchar("routing_number").notNull().unique(),
    productId: varchar("product_id").notNull(), // FK to inventory
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const routingOperations = pgTable("routing_operations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    routingId: varchar("routing_id").notNull(),
    operationSeq: integer("operation_seq").notNull(),
    workCenterId: varchar("work_center_id").notNull(),
    standardOperationId: varchar("standard_operation_id"), // L9 Integration: Link to Standard Op
    description: varchar("description"),
    setupTime: numeric("setup_time", { precision: 10, scale: 2 }).default("0"),
    runTime: numeric("run_time", { precision: 10, scale: 2 }).default("0"),
    resourceId: varchar("resource_id"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const productionOrders = pgTable("production_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderNumber: varchar("order_number").notNull().unique(),
    productId: varchar("product_id"),
    quantity: integer("quantity"),
    status: varchar("status").default("planned"), // planned, released, in_progress, completed, closed
    scheduledDate: timestamp("scheduled_date"),
    routingId: varchar("routing_id"),
    bomId: varchar("bom_id"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const productionTransactions = pgTable("production_transactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    productionOrderId: varchar("production_order_id").notNull(),
    transactionType: varchar("transaction_type").notNull(), // ISSUE, MOVE, COMPLETE, SCRAP
    operationSeq: integer("operation_seq"),
    productId: varchar("product_id"),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    transactionDate: timestamp("transaction_date").default(sql`now()`),
    createdBy: varchar("created_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const qualityInspections = pgTable("quality_inspections", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    targetType: varchar("target_type").notNull(), // WORK_ORDER, LOT, RECEIPT
    targetId: varchar("target_id").notNull(),
    inspectionDate: timestamp("inspection_date").default(sql`now()`),
    inspector: varchar("inspector"),
    status: varchar("status").default("pending"), // pending, passed, failed
    findings: text("findings"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== CONFIGURATION (L8) ==========

export const productionCalendars = pgTable("production_calendars", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    calendarCode: varchar("calendar_code").notNull().unique(),
    description: text("description"),
    isDefault: boolean("is_default").default(false),
    status: varchar("status").default("active"),
    weekendDays: varchar("weekend_days").default("SAT,SUN"), // Comma separated, e.g. "SAT,SUN"
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const calendarExceptions = pgTable("calendar_exceptions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    calendarId: varchar("calendar_id").notNull(), // FK to production_calendars
    exceptionDate: timestamp("exception_date").notNull(),
    exceptionType: varchar("exception_type").notNull(), // HOLIDAY, OVERTIME
    description: varchar("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const shifts = pgTable("shifts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    calendarId: varchar("calendar_id").notNull(), // FK to production_calendars
    shiftCode: varchar("shift_code").notNull(), // e.g. "SHIFT-1"
    startTime: varchar("start_time").notNull(), // e.g. "08:00"
    endTime: varchar("end_time").notNull(), // e.g. "16:00"
    breakDuration: integer("break_duration").default(0), // minutes
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== STANDARDIZATION (L9) ==========

export const standardOperations = pgTable("standard_operations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(),
    name: varchar("name").notNull(),
    description: text("description"),
    defaultWorkCenterId: varchar("default_work_center_id"),
    defaultSetupTime: numeric("default_setup_time", { precision: 10, scale: 2 }).default("0"),
    defaultRunTime: numeric("default_run_time", { precision: 10, scale: 2 }).default("0"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PLANNING & MRP ==========
export const demandForecasts = pgTable("mfg_demand_forecasts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    productId: varchar("product_id").notNull(),
    quantity: integer("quantity").notNull(),
    forecastDate: timestamp("forecast_date").notNull(),
    period: varchar("period").default("WEEKLY"), // DAILY, WEEKLY, MONTHLY
    confidence: numeric("confidence", { precision: 5, scale: 4 }).default("1.0"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const mrpPlans = pgTable("mfg_mrp_plans", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    planName: varchar("plan_name").notNull(),
    description: text("description"),
    planDate: timestamp("plan_date").default(sql`now()`),
    horizonStartDate: timestamp("horizon_start_date"),
    horizonEndDate: timestamp("horizon_end_date"),
    status: varchar("status").default("draft"),
    createdBy: varchar("created_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const mrpRecommendations = pgTable("mfg_mrp_recommendations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    planId: varchar("plan_id").notNull(),
    productId: varchar("product_id").notNull(),
    recommendationType: varchar("recommendation_type").notNull(), // PLANNED_WO, PLANNED_PO, EXPEDITE, CANCEL
    suggestedQuantity: numeric("suggested_quantity", { precision: 18, scale: 4 }).notNull(),
    suggestedDate: timestamp("suggested_date"),
    sourceOrderType: varchar("source_order_type"), // SALES_ORDER, FORECAST, SAFETY_STOCK
    sourceOrderId: varchar("source_order_id"),
    status: varchar("status").default("pending"), // pending, firmed, released, ignored
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== ZOD SCHEMAS & TYPES ==========

export const insertDemandForecastSchema = createInsertSchema(demandForecasts);
export const insertMrpPlanSchema = createInsertSchema(mrpPlans);
export const insertMrpRecommendationSchema = createInsertSchema(mrpRecommendations);

export const insertBomSchema = createInsertSchema(bom);
export const insertBomItemSchema = createInsertSchema(bomItems);
export const insertWorkCenterSchema = createInsertSchema(workCenters);
export const insertResourceSchema = createInsertSchema(resources);
export const insertRoutingSchema = createInsertSchema(routings);
export const insertRoutingOperationSchema = createInsertSchema(routingOperations);
export const insertProductionOrderSchema = createInsertSchema(productionOrders).extend({
    scheduledDate: z.date().optional().nullable(),
});
export const insertProductionTransactionSchema = createInsertSchema(productionTransactions);
export const insertQualityInspectionSchema = createInsertSchema(qualityInspections);

export const insertProductionCalendarSchema = createInsertSchema(productionCalendars);
export const insertShiftSchema = createInsertSchema(shifts);
export const insertStandardOperationSchema = createInsertSchema(standardOperations);

export type Bom = typeof bom.$inferSelect;
export type InsertBom = z.infer<typeof insertBomSchema>;
export type BomItem = typeof bomItems.$inferSelect;
export type InsertBomItem = z.infer<typeof insertBomItemSchema>;
export type WorkCenter = typeof workCenters.$inferSelect;
export type InsertWorkCenter = z.infer<typeof insertWorkCenterSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Routing = typeof routings.$inferSelect;
export type InsertRouting = z.infer<typeof insertRoutingSchema>;
export type RoutingOperation = typeof routingOperations.$inferSelect;
export type InsertRoutingOperation = z.infer<typeof insertRoutingOperationSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;
export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionTransaction = typeof productionTransactions.$inferSelect;
export type InsertProductionTransaction = z.infer<typeof insertProductionTransactionSchema>;
export type QualityInspection = typeof qualityInspections.$inferSelect;
export type InsertQualityInspection = z.infer<typeof insertQualityInspectionSchema>;

export type ProductionCalendar = typeof productionCalendars.$inferSelect;
export type InsertProductionCalendar = z.infer<typeof insertProductionCalendarSchema>;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type StandardOperation = typeof standardOperations.$inferSelect;
export type InsertStandardOperation = z.infer<typeof insertStandardOperationSchema>;
