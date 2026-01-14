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

export const qualityResults = pgTable("mfg_quality_results", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    inspectionId: varchar("inspection_id").notNull(),
    parameterName: varchar("parameter_name").notNull(), // e.g. "Purity", "Weight"
    minValue: numeric("min_value", { precision: 18, scale: 4 }),
    maxValue: numeric("max_value", { precision: 18, scale: 4 }),
    actualValue: numeric("actual_value", { precision: 18, scale: 4 }).notNull(),
    uom: varchar("uom"),
    result: varchar("result").notNull(), // PASS, FAIL
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

// ========== COSTING & WIP (L20) ==========

export const costElements = pgTable("mfg_cost_elements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(), // e.g., "MAT-STEEL", "LAB-ASSEMBLY"
    name: varchar("name").notNull(),
    type: varchar("type").notNull(), // MATERIAL, LABOR, OVERHEAD, OUTSIDE_PROCESSING
    fixedOrVariable: varchar("fixed_or_variable").default("VARIABLE"),
    glAccountId: varchar("gl_account_id"), // Link to General Ledger
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const overheadRules = pgTable("mfg_overhead_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    costElementId: varchar("cost_element_id").notNull(), // FK to costElements
    basis: varchar("basis").notNull(), // LABOR_HOURS, MACHINE_HOURS, MATERIAL_VALUE, FLAT_RATE
    rateOrPercentage: numeric("rate_or_percentage", { precision: 10, scale: 4 }).notNull(),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const standardCosts = pgTable("mfg_standard_costs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    targetType: varchar("target_type").notNull(), // ITEM, RESOURCE
    targetId: varchar("target_id").notNull(), // Inventory Item ID or Resource ID
    costElementId: varchar("cost_element_id").notNull(),
    unitCost: numeric("unit_cost", { precision: 18, scale: 4 }).notNull(),
    effectiveDate: timestamp("effective_date").default(sql`now()`),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const wipBalances = pgTable("mfg_wip_balances", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    productionOrderId: varchar("production_order_id").notNull(),
    costElementId: varchar("cost_element_id").notNull(),
    balance: numeric("balance", { precision: 18, scale: 4 }).default("0"),
    lastUpdated: timestamp("last_updated").default(sql`now()`),
});

export const varianceJournals = pgTable("mfg_variance_journals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    productionOrderId: varchar("production_order_id").notNull(),
    varianceType: varchar("variance_type").notNull(), // MATERIAL_USAGE, LABOR_EFFICIENCY, OVERHEAD_VOLUME
    amount: numeric("amount", { precision: 18, scale: 4 }).notNull(),
    description: text("description"),
    glPosted: boolean("gl_posted").default(false),
    transactionDate: timestamp("transaction_date").default(sql`now()`),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PROCESS MANUFACTURING (L1/L21) ==========

export const formulas = pgTable("mfg_formulas", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    formulaNumber: varchar("formula_number").notNull().unique(),
    productId: varchar("product_id").notNull(), // Target Product
    name: varchar("name").notNull(),
    version: varchar("version").default("1.0"),
    status: varchar("status").default("active"),
    totalBatchSize: numeric("total_batch_size", { precision: 18, scale: 4 }).notNull(),
    uom: varchar("uom").notNull(),
    instructions: text("instructions"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const formulaIngredients = pgTable("mfg_formula_ingredients", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    formulaId: varchar("formula_id").notNull(),
    productId: varchar("product_id").notNull(), // Ingredient
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    percentage: numeric("percentage", { precision: 5, scale: 2 }),
    lossFactor: numeric("loss_factor", { precision: 5, scale: 2 }).default("0"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const recipes = pgTable("mfg_recipes", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    recipeNumber: varchar("recipe_number").notNull().unique(),
    formulaId: varchar("formula_id").notNull(),
    routingId: varchar("routing_id"), // Process Routing
    name: varchar("name").notNull(),
    description: text("description"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const manufacturingBatches = pgTable("mfg_batches", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    batchNumber: varchar("batch_number").notNull().unique(),
    recipeId: varchar("recipe_id").notNull(),
    targetQuantity: numeric("target_quantity", { precision: 18, scale: 4 }).notNull(),
    actualQuantity: numeric("actual_quantity", { precision: 18, scale: 4 }).default("0"),
    status: varchar("status").default("planned"), // planned, released, wip, completed, closed
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const batchTransactions = pgTable("mfg_batch_transactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    batchId: varchar("batch_id").notNull(),
    transactionType: varchar("transaction_type").notNull(), // FEED, YIELD, LOSS, BYPRODUCT
    productId: varchar("product_id").notNull(),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    lotNumber: varchar("lot_number"),
    parentLotId: varchar("parent_lot_id"), // For Genealogy (Tree traversing)
    transactionDate: timestamp("transaction_date").default(sql`now()`),
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

export const insertCostElementSchema = createInsertSchema(costElements);
export const insertOverheadRuleSchema = createInsertSchema(overheadRules);
export const insertStandardCostSchema = createInsertSchema(standardCosts);
export const insertWipBalanceSchema = createInsertSchema(wipBalances);
export const insertVarianceJournalSchema = createInsertSchema(varianceJournals);

export const insertFormulaSchema = createInsertSchema(formulas);
export const insertFormulaIngredientSchema = createInsertSchema(formulaIngredients);
export const insertRecipeSchema = createInsertSchema(recipes);
export const insertManufacturingBatchSchema = createInsertSchema(manufacturingBatches);
export const insertBatchTransactionSchema = createInsertSchema(batchTransactions);
export const insertQualityResultSchema = createInsertSchema(qualityResults);

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

export type CostElement = typeof costElements.$inferSelect;
export type InsertCostElement = z.infer<typeof insertCostElementSchema>;
export type OverheadRule = typeof overheadRules.$inferSelect;
export type InsertOverheadRule = z.infer<typeof insertOverheadRuleSchema>;
export type StandardCost = typeof standardCosts.$inferSelect;
export type InsertStandardCost = z.infer<typeof insertStandardCostSchema>;
export type WipBalance = typeof wipBalances.$inferSelect;
export type InsertWipBalance = z.infer<typeof insertWipBalanceSchema>;
export type VarianceJournal = typeof varianceJournals.$inferSelect;
export type InsertVarianceJournal = z.infer<typeof insertVarianceJournalSchema>;

export type Formula = typeof formulas.$inferSelect;
export type InsertFormula = z.infer<typeof insertFormulaSchema>;
export type FormulaIngredient = typeof formulaIngredients.$inferSelect;
export type InsertFormulaIngredient = z.infer<typeof insertFormulaIngredientSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type ManufacturingBatch = typeof manufacturingBatches.$inferSelect;
export type InsertManufacturingBatch = z.infer<typeof insertManufacturingBatchSchema>;
export type BatchTransaction = typeof batchTransactions.$inferSelect;
export type InsertBatchTransaction = z.infer<typeof insertBatchTransactionSchema>;
export type QualityResult = typeof qualityResults.$inferSelect;
export type InsertQualityResult = z.infer<typeof insertQualityResultSchema>;
