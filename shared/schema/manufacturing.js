"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFormulaIngredientSchema = exports.insertFormulaSchema = exports.insertVarianceJournalSchema = exports.insertWipBalanceSchema = exports.insertStandardCostSchema = exports.insertOverheadRuleSchema = exports.insertCostElementSchema = exports.insertStandardOperationSchema = exports.insertShiftSchema = exports.insertProductionCalendarSchema = exports.insertQualityInspectionSchema = exports.insertProductionTransactionSchema = exports.insertProductionOrderSchema = exports.insertRoutingOperationSchema = exports.insertRoutingSchema = exports.insertResourceSchema = exports.insertWorkCenterSchema = exports.insertBomItemSchema = exports.insertBomSchema = exports.insertMrpRecommendationSchema = exports.insertMrpPlanSchema = exports.insertDemandForecastSchema = exports.batchTransactions = exports.manufacturingBatches = exports.recipes = exports.formulaIngredients = exports.formulas = exports.varianceJournals = exports.wipBalances = exports.standardCosts = exports.overheadRules = exports.costElements = exports.mrpRecommendations = exports.mrpPlans = exports.demandForecasts = exports.standardOperations = exports.shifts = exports.calendarExceptionsLegacy = exports.calendarExceptions = exports.productionCalendars = exports.qualityResults = exports.qualityInspections = exports.productionTransactions = exports.productionOrders = exports.routingOperations = exports.routings = exports.resources = exports.workCenters = exports.bomItems = exports.bom = void 0;
exports.insertQualityResultSchema = exports.insertBatchTransactionSchema = exports.insertManufacturingBatchSchema = exports.insertRecipeSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== MANUFACTURING MODULE ==========
exports.bom = (0, pg_core_1.pgTable)("bom", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bomNumber: (0, pg_core_1.varchar)("bom_number").notNull().unique(),
    productId: (0, pg_core_1.varchar)("product_id"), // FK to inventory
    quantity: (0, pg_core_1.integer)("quantity"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.bomItems = (0, pg_core_1.pgTable)("bom_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bomId: (0, pg_core_1.varchar)("bom_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(), // FK to inventory
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    uom: (0, pg_core_1.varchar)("uom").default("EA"),
    scrapFactor: (0, pg_core_1.numeric)("scrap_factor", { precision: 5, scale: 2 }).default("0"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.workCenters = (0, pg_core_1.pgTable)("work_centers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // Added explicit code column if missing in recent view
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    capacity: (0, pg_core_1.integer)("capacity"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    calendarId: (0, pg_core_1.varchar)("calendar_id"), // L8 Integration: Link to Production Calendar
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.resources = (0, pg_core_1.pgTable)("manufacturing_resources", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    resourceCode: (0, pg_core_1.varchar)("resource_code").notNull().unique(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // LABOR, MACHINE, TOOL
    status: (0, pg_core_1.varchar)("status").default("active"),
    capacityPerHour: (0, pg_core_1.numeric)("capacity_per_hour", { precision: 18, scale: 2 }),
    costPerHour: (0, pg_core_1.numeric)("cost_per_hour", { precision: 18, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.routings = (0, pg_core_1.pgTable)("routings", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    routingNumber: (0, pg_core_1.varchar)("routing_number").notNull().unique(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(), // FK to inventory
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.routingOperations = (0, pg_core_1.pgTable)("routing_operations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    routingId: (0, pg_core_1.varchar)("routing_id").notNull(),
    operationSeq: (0, pg_core_1.integer)("operation_seq").notNull(),
    workCenterId: (0, pg_core_1.varchar)("work_center_id").notNull(),
    standardOperationId: (0, pg_core_1.varchar)("standard_operation_id"), // L9 Integration: Link to Standard Op
    description: (0, pg_core_1.varchar)("description"),
    setupTime: (0, pg_core_1.numeric)("setup_time", { precision: 10, scale: 2 }).default("0"),
    runTime: (0, pg_core_1.numeric)("run_time", { precision: 10, scale: 2 }).default("0"),
    resourceId: (0, pg_core_1.varchar)("resource_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.productionOrders = (0, pg_core_1.pgTable)("production_orders", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    orderNumber: (0, pg_core_1.varchar)("order_number").notNull().unique(),
    productId: (0, pg_core_1.varchar)("product_id"),
    quantity: (0, pg_core_1.integer)("quantity"),
    projectId: (0, pg_core_1.varchar)("project_id"), // PJM Integration
    taskId: (0, pg_core_1.varchar)("task_id"), // PJM Integration
    status: (0, pg_core_1.varchar)("status").default("planned"), // planned, released, in_progress, completed, closed
    scheduledDate: (0, pg_core_1.timestamp)("scheduled_date"),
    routingId: (0, pg_core_1.varchar)("routing_id"),
    bomId: (0, pg_core_1.varchar)("bom_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.productionTransactions = (0, pg_core_1.pgTable)("production_transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    productionOrderId: (0, pg_core_1.varchar)("production_order_id").notNull(),
    transactionType: (0, pg_core_1.varchar)("transaction_type").notNull(), // ISSUE, MOVE, COMPLETE, SCRAP
    operationSeq: (0, pg_core_1.integer)("operation_seq"),
    productId: (0, pg_core_1.varchar)("product_id"),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    actualCost: (0, pg_core_1.numeric)("actual_cost", { precision: 18, scale: 4 }), // For Project Costing
    resourceId: (0, pg_core_1.varchar)("resource_id"), // For Labor Charging
    transactionDate: (0, pg_core_1.timestamp)("transaction_date").default((0, drizzle_orm_1.sql) `now()`),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.qualityInspections = (0, pg_core_1.pgTable)("quality_inspections", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    targetType: (0, pg_core_1.varchar)("target_type").notNull(), // WORK_ORDER, LOT, RECEIPT
    targetId: (0, pg_core_1.varchar)("target_id").notNull(),
    inspectionDate: (0, pg_core_1.timestamp)("inspection_date").default((0, drizzle_orm_1.sql) `now()`),
    inspector: (0, pg_core_1.varchar)("inspector"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, passed, failed
    findings: (0, pg_core_1.text)("findings"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.qualityResults = (0, pg_core_1.pgTable)("mfg_quality_results", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    inspectionId: (0, pg_core_1.varchar)("inspection_id").notNull(),
    parameterName: (0, pg_core_1.varchar)("parameter_name").notNull(), // e.g. "Purity", "Weight"
    minValue: (0, pg_core_1.numeric)("min_value", { precision: 18, scale: 4 }),
    maxValue: (0, pg_core_1.numeric)("max_value", { precision: 18, scale: 4 }),
    actualValue: (0, pg_core_1.numeric)("actual_value", { precision: 18, scale: 4 }).notNull(),
    uom: (0, pg_core_1.varchar)("uom"),
    result: (0, pg_core_1.varchar)("result").notNull(), // PASS, FAIL
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ========== CONFIGURATION (L8) ==========
exports.productionCalendars = (0, pg_core_1.pgTable)("production_calendars", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    calendarCode: (0, pg_core_1.varchar)("calendar_code").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    isDefault: (0, pg_core_1.boolean)("is_default").default(false),
    status: (0, pg_core_1.varchar)("status").default("active"),
    weekendDays: (0, pg_core_1.varchar)("weekend_days").default("SAT,SUN"), // Comma separated, e.g. "SAT,SUN"
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.calendarExceptions = (0, pg_core_1.pgTable)("mfg_calendar_exceptions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    calendarId: (0, pg_core_1.varchar)("calendar_id").notNull(), // FK to production_calendars
    exceptionDate: (0, pg_core_1.timestamp)("exception_date").notNull(),
    exceptionType: (0, pg_core_1.varchar)("exception_type").notNull(), // HOLIDAY, OVERTIME
    description: (0, pg_core_1.varchar)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// LEGACY SUPPORT
exports.calendarExceptionsLegacy = (0, pg_core_1.pgTable)("calendar_exceptions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    calendarId: (0, pg_core_1.varchar)("calendar_id"),
});
exports.shifts = (0, pg_core_1.pgTable)("shifts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    calendarId: (0, pg_core_1.varchar)("calendar_id").notNull(), // FK to production_calendars
    shiftCode: (0, pg_core_1.varchar)("shift_code").notNull(), // e.g. "SHIFT-1"
    startTime: (0, pg_core_1.varchar)("start_time").notNull(), // e.g. "08:00"
    endTime: (0, pg_core_1.varchar)("end_time").notNull(), // e.g. "16:00"
    breakDuration: (0, pg_core_1.integer)("break_duration").default(0), // minutes
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ========== STANDARDIZATION (L9) ==========
exports.standardOperations = (0, pg_core_1.pgTable)("standard_operations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    defaultWorkCenterId: (0, pg_core_1.varchar)("default_work_center_id"),
    defaultSetupTime: (0, pg_core_1.numeric)("default_setup_time", { precision: 10, scale: 2 }).default("0"),
    defaultRunTime: (0, pg_core_1.numeric)("default_run_time", { precision: 10, scale: 2 }).default("0"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ========== PLANNING & MRP ==========
exports.demandForecasts = (0, pg_core_1.pgTable)("mfg_demand_forecasts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull(),
    forecastDate: (0, pg_core_1.timestamp)("forecast_date").notNull(),
    period: (0, pg_core_1.varchar)("period").default("WEEKLY"), // DAILY, WEEKLY, MONTHLY
    confidence: (0, pg_core_1.numeric)("confidence", { precision: 5, scale: 4 }).default("1.0"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.mrpPlans = (0, pg_core_1.pgTable)("mfg_mrp_plans", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    planName: (0, pg_core_1.varchar)("plan_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    planDate: (0, pg_core_1.timestamp)("plan_date").default((0, drizzle_orm_1.sql) `now()`),
    projectId: (0, pg_core_1.varchar)("project_id"), // PJM Integration
    taskId: (0, pg_core_1.varchar)("task_id"), // PJM Integration
    horizonStartDate: (0, pg_core_1.timestamp)("horizon_start_date"),
    horizonEndDate: (0, pg_core_1.timestamp)("horizon_end_date"),
    status: (0, pg_core_1.varchar)("status").default("draft"),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.mrpRecommendations = (0, pg_core_1.pgTable)("mfg_mrp_recommendations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    planId: (0, pg_core_1.varchar)("plan_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    recommendationType: (0, pg_core_1.varchar)("recommendation_type").notNull(), // PLANNED_WO, PLANNED_PO, EXPEDITE, CANCEL
    suggestedQuantity: (0, pg_core_1.numeric)("suggested_quantity", { precision: 18, scale: 4 }).notNull(),
    suggestedDate: (0, pg_core_1.timestamp)("suggested_date"),
    sourceOrderType: (0, pg_core_1.varchar)("source_order_type"), // SALES_ORDER, FORECAST, SAFETY_STOCK
    sourceOrderId: (0, pg_core_1.varchar)("source_order_id"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, firmed, released, ignored
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ========== COSTING & WIP (L20) ==========
exports.costElements = (0, pg_core_1.pgTable)("mfg_cost_elements", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // e.g., "MAT-STEEL", "LAB-ASSEMBLY"
    name: (0, pg_core_1.varchar)("name").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // MATERIAL, LABOR, OVERHEAD, OUTSIDE_PROCESSING
    fixedOrVariable: (0, pg_core_1.varchar)("fixed_or_variable").default("VARIABLE"),
    glAccountId: (0, pg_core_1.varchar)("gl_account_id"), // Link to General Ledger
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.overheadRules = (0, pg_core_1.pgTable)("mfg_overhead_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    costElementId: (0, pg_core_1.varchar)("cost_element_id").notNull(), // FK to costElements
    basis: (0, pg_core_1.varchar)("basis").notNull(), // LABOR_HOURS, MACHINE_HOURS, MATERIAL_VALUE, FLAT_RATE
    rateOrPercentage: (0, pg_core_1.numeric)("rate_or_percentage", { precision: 10, scale: 4 }).notNull(),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.standardCosts = (0, pg_core_1.pgTable)("mfg_standard_costs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    targetType: (0, pg_core_1.varchar)("target_type").notNull(), // ITEM, RESOURCE
    targetId: (0, pg_core_1.varchar)("target_id").notNull(), // Inventory Item ID or Resource ID
    costElementId: (0, pg_core_1.varchar)("cost_element_id").notNull(),
    unitCost: (0, pg_core_1.numeric)("unit_cost", { precision: 18, scale: 4 }).notNull(),
    effectiveDate: (0, pg_core_1.timestamp)("effective_date").default((0, drizzle_orm_1.sql) `now()`),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.wipBalances = (0, pg_core_1.pgTable)("mfg_wip_balances", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    productionOrderId: (0, pg_core_1.varchar)("production_order_id").notNull(),
    costElementId: (0, pg_core_1.varchar)("cost_element_id").notNull(),
    balance: (0, pg_core_1.numeric)("balance", { precision: 18, scale: 4 }).default("0"),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").default((0, drizzle_orm_1.sql) `now()`),
});
exports.varianceJournals = (0, pg_core_1.pgTable)("mfg_variance_journals", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    productionOrderId: (0, pg_core_1.varchar)("production_order_id").notNull(),
    varianceType: (0, pg_core_1.varchar)("variance_type").notNull(), // MATERIAL_USAGE, LABOR_EFFICIENCY, OVERHEAD_VOLUME
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 4 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    glPosted: (0, pg_core_1.boolean)("gl_posted").default(false),
    transactionDate: (0, pg_core_1.timestamp)("transaction_date").default((0, drizzle_orm_1.sql) `now()`),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ========== PROCESS MANUFACTURING (L1/L21) ==========
exports.formulas = (0, pg_core_1.pgTable)("mfg_formulas", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    formulaNumber: (0, pg_core_1.varchar)("formula_number").notNull().unique(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(), // Target Product
    name: (0, pg_core_1.varchar)("name").notNull(),
    version: (0, pg_core_1.varchar)("version").default("1.0"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    totalBatchSize: (0, pg_core_1.numeric)("total_batch_size", { precision: 18, scale: 4 }).notNull(),
    uom: (0, pg_core_1.varchar)("uom").notNull(),
    instructions: (0, pg_core_1.text)("instructions"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.formulaIngredients = (0, pg_core_1.pgTable)("mfg_formula_ingredients", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    formulaId: (0, pg_core_1.varchar)("formula_id").notNull(),
    productId: (0, pg_core_1.varchar)("product_id").notNull(), // Ingredient
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    percentage: (0, pg_core_1.numeric)("percentage", { precision: 5, scale: 2 }),
    lossFactor: (0, pg_core_1.numeric)("loss_factor", { precision: 5, scale: 2 }).default("0"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.recipes = (0, pg_core_1.pgTable)("mfg_recipes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    recipeNumber: (0, pg_core_1.varchar)("recipe_number").notNull().unique(),
    formulaId: (0, pg_core_1.varchar)("formula_id").notNull(),
    routingId: (0, pg_core_1.varchar)("routing_id"), // Process Routing
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.manufacturingBatches = (0, pg_core_1.pgTable)("mfg_batches", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    batchNumber: (0, pg_core_1.varchar)("batch_number").notNull().unique(),
    recipeId: (0, pg_core_1.varchar)("recipe_id").notNull(),
    targetQuantity: (0, pg_core_1.numeric)("target_quantity", { precision: 18, scale: 4 }).notNull(),
    actualQuantity: (0, pg_core_1.numeric)("actual_quantity", { precision: 18, scale: 4 }).default("0"),
    status: (0, pg_core_1.varchar)("status").default("planned"), // planned, released, wip, completed, closed
    startDate: (0, pg_core_1.timestamp)("start_date"),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.batchTransactions = (0, pg_core_1.pgTable)("mfg_batch_transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    batchId: (0, pg_core_1.varchar)("batch_id").notNull(),
    transactionType: (0, pg_core_1.varchar)("transaction_type").notNull(), // FEED, YIELD, LOSS, BYPRODUCT
    productId: (0, pg_core_1.varchar)("product_id").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    lotNumber: (0, pg_core_1.varchar)("lot_number"),
    parentLotId: (0, pg_core_1.varchar)("parent_lot_id"), // For Genealogy (Tree traversing)
    transactionDate: (0, pg_core_1.timestamp)("transaction_date").default((0, drizzle_orm_1.sql) `now()`),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ========== ZOD SCHEMAS & TYPES ==========
exports.insertDemandForecastSchema = (0, drizzle_zod_1.createInsertSchema)(exports.demandForecasts);
exports.insertMrpPlanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mrpPlans);
exports.insertMrpRecommendationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mrpRecommendations);
exports.insertBomSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bom);
exports.insertBomItemSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bomItems);
exports.insertWorkCenterSchema = (0, drizzle_zod_1.createInsertSchema)(exports.workCenters);
exports.insertResourceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.resources);
exports.insertRoutingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.routings);
exports.insertRoutingOperationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.routingOperations);
exports.insertProductionOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.productionOrders).extend({
    scheduledDate: zod_1.z.date().optional().nullable(),
    projectId: zod_1.z.string().optional().nullable(),
    taskId: zod_1.z.string().optional().nullable(),
});
exports.insertProductionTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.productionTransactions);
exports.insertQualityInspectionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.qualityInspections);
exports.insertProductionCalendarSchema = (0, drizzle_zod_1.createInsertSchema)(exports.productionCalendars);
exports.insertShiftSchema = (0, drizzle_zod_1.createInsertSchema)(exports.shifts);
exports.insertStandardOperationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.standardOperations);
exports.insertCostElementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.costElements);
exports.insertOverheadRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.overheadRules);
exports.insertStandardCostSchema = (0, drizzle_zod_1.createInsertSchema)(exports.standardCosts);
exports.insertWipBalanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wipBalances);
exports.insertVarianceJournalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.varianceJournals);
exports.insertFormulaSchema = (0, drizzle_zod_1.createInsertSchema)(exports.formulas);
exports.insertFormulaIngredientSchema = (0, drizzle_zod_1.createInsertSchema)(exports.formulaIngredients);
exports.insertRecipeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.recipes);
exports.insertManufacturingBatchSchema = (0, drizzle_zod_1.createInsertSchema)(exports.manufacturingBatches);
exports.insertBatchTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.batchTransactions);
exports.insertQualityResultSchema = (0, drizzle_zod_1.createInsertSchema)(exports.qualityResults);
//# sourceMappingURL=manufacturing.js.map