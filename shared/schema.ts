import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// MANUFACTURING TABLES (Already complete)
export const boms = pgTable("boms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  productId: varchar("product_id").notNull(),
  description: text("description"),
  status: varchar("status").default("active"),
  uom: varchar("uom").notNull(),
  yield: numeric("yield", { precision: 10, scale: 2 }).default("100"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  revision: integer("revision").default(1),
  effectiveDate: timestamp("effective_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBomSchema = createInsertSchema(boms)
  .omit({ id: true, createdAt: true })
  .extend({
    name: z.string().min(1),
    productId: z.string().min(1),
    quantity: z.string().pipe(z.coerce.number().min(0.01)),
    yield: z.string().optional(),
    uom: z.string().min(1),
    revision: z.number().optional(),
    status: z.string().optional(),
    description: z.string().optional().nullable(),
    effectiveDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
  });

export type InsertBom = z.infer<typeof insertBomSchema>;
export type Bom = typeof boms.$inferSelect;

export const bomLines = pgTable("bom_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bomId: varchar("bom_id").notNull(),
  lineNumber: integer("line_number").notNull(),
  componentId: varchar("component_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  uom: varchar("uom").notNull(),
  scrapPercentage: numeric("scrap_percentage", { precision: 5, scale: 2 }).default("0"),
  notes: text("notes"),
});

export const insertBomLineSchema = createInsertSchema(bomLines).omit({ id: true }).extend({
  componentId: z.string().min(1),
  quantity: z.string().pipe(z.coerce.number().min(0.01)),
  scrapPercentage: z.string().optional(),
  uom: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export type InsertBomLine = z.infer<typeof insertBomLineSchema>;
export type BomLine = typeof bomLines.$inferSelect;

export const workOrders = pgTable("work_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  woNumber: varchar("wo_number").notNull().unique(),
  bomId: varchar("bom_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("pending"),
  priorityLevel: varchar("priority_level").default("normal"),
  plannedStartDate: timestamp("planned_start_date"),
  plannedEndDate: timestamp("planned_end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  assignedTo: varchar("assigned_to"),
  location: varchar("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ id: true, woNumber: true, createdAt: true }).extend({
  bomId: z.string().min(1),
  quantity: z.string().pipe(z.coerce.number().min(0.01)),
  status: z.string().optional(),
  priorityLevel: z.string().optional(),
  plannedStartDate: z.date().optional().nullable(),
  plannedEndDate: z.date().optional().nullable(),
  actualStartDate: z.date().optional().nullable(),
  actualEndDate: z.date().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type WorkOrder = typeof workOrders.$inferSelect;

export const productionOrders = pgTable("production_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  poNumber: varchar("po_number").notNull().unique(),
  productId: varchar("product_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("draft"),
  releaseDate: timestamp("release_date"),
  dueDate: timestamp("due_date").notNull(),
  completionDate: timestamp("completion_date"),
  bomId: varchar("bom_id"),
  warehouse: varchar("warehouse"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProductionOrderSchema = createInsertSchema(productionOrders).omit({ id: true, poNumber: true, createdAt: true }).extend({
  productId: z.string().min(1),
  quantity: z.string().pipe(z.coerce.number().min(0.01)),
  dueDate: z.date(),
  status: z.string().optional(),
  releaseDate: z.date().optional().nullable(),
  completionDate: z.date().optional().nullable(),
  bomId: z.string().optional().nullable(),
  warehouse: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InsertProductionOrder = z.infer<typeof insertProductionOrderSchema>;
export type ProductionOrder = typeof productionOrders.$inferSelect;

export const qualityChecks = pgTable("quality_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workOrderId: varchar("work_order_id").notNull(),
  checkType: varchar("check_type").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  quantityPassed: numeric("quantity_passed", { precision: 10, scale: 2 }).notNull(),
  quantityFailed: numeric("quantity_failed", { precision: 10, scale: 2 }).default("0"),
  defects: text("defects"),
  notes: text("notes"),
  checkedBy: varchar("checked_by"),
  checkDate: timestamp("check_date").default(sql`now()`),
});

export const insertQualityCheckSchema = createInsertSchema(qualityChecks).omit({ id: true, checkDate: true }).extend({
  workOrderId: z.string().min(1),
  quantity: z.string().pipe(z.coerce.number().min(0.01)),
  quantityPassed: z.string().pipe(z.coerce.number().min(0)),
  quantityFailed: z.string().optional(),
  checkType: z.string().min(1),
  defects: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  checkedBy: z.string().optional().nullable(),
});

export type InsertQualityCheck = z.infer<typeof insertQualityCheckSchema>;
export type QualityCheck = typeof qualityChecks.$inferSelect;

export const routings = pgTable("routings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  productId: varchar("product_id").notNull(),
  description: text("description"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRoutingSchema = createInsertSchema(routings).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  productId: z.string().min(1),
  status: z.string().optional(),
  description: z.string().optional().nullable(),
});

export type InsertRouting = z.infer<typeof insertRoutingSchema>;
export type Routing = typeof routings.$inferSelect;

export const routingOperations = pgTable("routing_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routingId: varchar("routing_id").notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  workCenterId: varchar("work_center_id").notNull(),
  operationName: text("operation_name").notNull(),
  cycleTime: numeric("cycle_time", { precision: 10, scale: 2 }).notNull(),
  setupTime: numeric("setup_time", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
});

export const insertRoutingOperationSchema = createInsertSchema(routingOperations).omit({ id: true }).extend({
  routingId: z.string().min(1),
  workCenterId: z.string().min(1),
  operationName: z.string().min(1),
  cycleTime: z.string().pipe(z.coerce.number().min(0)),
  setupTime: z.string().optional(),
  sequenceNumber: z.number().min(1),
  notes: z.string().optional().nullable(),
});

export type InsertRoutingOperation = z.infer<typeof insertRoutingOperationSchema>;
export type RoutingOperation = typeof routingOperations.$inferSelect;

export const workCenters = pgTable("work_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  code: varchar("code").notNull().unique(),
  location: varchar("location"),
  capacity: numeric("capacity", { precision: 10, scale: 2 }).notNull(),
  costPerHour: numeric("cost_per_hour", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status").default("active"),
  description: text("description"),
});

export const insertWorkCenterSchema = createInsertSchema(workCenters).omit({ id: true }).extend({
  name: z.string().min(1),
  code: z.string().min(1),
  capacity: z.string().pipe(z.coerce.number().min(0.01)),
  costPerHour: z.string().pipe(z.coerce.number().min(0)),
  location: z.string().optional().nullable(),
  status: z.string().optional(),
  description: z.string().optional().nullable(),
});

export type InsertWorkCenter = z.infer<typeof insertWorkCenterSchema>;
export type WorkCenter = typeof workCenters.$inferSelect;

export const mrpForecasts = pgTable("mrp_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  forecastDate: timestamp("forecast_date").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMrpForecastSchema = createInsertSchema(mrpForecasts).omit({ id: true, createdAt: true }).extend({
  productId: z.string().min(1),
  forecastDate: z.date(),
  quantity: z.string().pipe(z.coerce.number().min(0.01)),
  status: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export type InsertMrpForecast = z.infer<typeof insertMrpForecastSchema>;
export type MrpForecast = typeof mrpForecasts.$inferSelect;

export const replenishmentRules = pgTable("replenishment_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().unique(),
  minStock: numeric("min_stock", { precision: 10, scale: 2 }).notNull(),
  maxStock: numeric("max_stock", { precision: 10, scale: 2 }).notNull(),
  reorderQuantity: numeric("reorder_quantity", { precision: 10, scale: 2 }).notNull(),
  leadTimeDays: integer("lead_time_days").default(0),
  replenishmentMethod: varchar("replenishment_method").default("purchase"),
  status: varchar("status").default("active"),
});

export const insertReplenishmentRuleSchema = createInsertSchema(replenishmentRules).omit({ id: true }).extend({
  productId: z.string().min(1),
  minStock: z.string().pipe(z.coerce.number().min(0)),
  maxStock: z.string().pipe(z.coerce.number().min(0)),
  reorderQuantity: z.string().pipe(z.coerce.number().min(0.01)),
  leadTimeDays: z.number().optional(),
  replenishmentMethod: z.string().optional(),
  status: z.string().optional(),
});

export type InsertReplenishmentRule = z.infer<typeof insertReplenishmentRuleSchema>;
export type ReplenishmentRule = typeof replenishmentRules.$inferSelect;

export const warehouses = pgTable("warehouses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: varchar("code").notNull().unique(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country"),
  status: varchar("status").default("active"),
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({ id: true }).extend({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Warehouse = typeof warehouses.$inferSelect;

export const stockLocations = pgTable("stock_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseId: varchar("warehouse_id").notNull(),
  locationCode: varchar("location_code").notNull(),
  aisle: varchar("aisle"),
  shelf: varchar("shelf"),
  bin: varchar("bin"),
  capacity: numeric("capacity", { precision: 10, scale: 2 }),
  status: varchar("status").default("active"),
});

export const insertStockLocationSchema = createInsertSchema(stockLocations).omit({ id: true }).extend({
  warehouseId: z.string().min(1),
  locationCode: z.string().min(1),
  aisle: z.string().optional().nullable(),
  shelf: z.string().optional().nullable(),
  bin: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertStockLocation = z.infer<typeof insertStockLocationSchema>;
export type StockLocation = typeof stockLocations.$inferSelect;

export const stockMoves = pgTable("stock_moves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moveNumber: varchar("move_number").notNull().unique(),
  productId: varchar("product_id").notNull(),
  fromLocationId: varchar("from_location_id"),
  toLocationId: varchar("to_location_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  moveType: varchar("move_type").notNull(),
  status: varchar("status").default("pending"),
  moveDate: timestamp("move_date").default(sql`now()`),
  notes: text("notes"),
});

export const insertStockMoveSchema = createInsertSchema(stockMoves).omit({ id: true, moveNumber: true, moveDate: true }).extend({
  productId: z.string().min(1),
  toLocationId: z.string().min(1),
  quantity: z.string().pipe(z.coerce.number().min(0.01)),
  moveType: z.string().min(1),
  status: z.string().optional(),
  fromLocationId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InsertStockMove = z.infer<typeof insertStockMoveSchema>;
export type StockMove = typeof stockMoves.$inferSelect;

export const maintenance = pgTable("maintenance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  maintenanceNumber: varchar("maintenance_number").notNull().unique(),
  workCenterId: varchar("work_center_id").notNull(),
  maintenanceType: varchar("maintenance_type").notNull(),
  description: text("description").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  status: varchar("status").default("pending"),
  duration: integer("duration"),
  technician: varchar("technician"),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMaintenanceSchema = createInsertSchema(maintenance).omit({ id: true, maintenanceNumber: true, createdAt: true }).extend({
  workCenterId: z.string().min(1),
  description: z.string().min(1),
  maintenanceType: z.string().min(1),
  scheduledDate: z.date().optional().nullable(),
  completedDate: z.date().optional().nullable(),
  status: z.string().optional(),
  duration: z.number().optional().nullable(),
  technician: z.string().optional().nullable(),
  cost: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type Maintenance = typeof maintenance.$inferSelect;

export const productionCosts = pgTable("production_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productionOrderId: varchar("production_order_id").notNull(),
  costType: varchar("cost_type").notNull(),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }),
  unitCost: numeric("unit_cost", { precision: 12, scale: 4 }),
  costCenter: varchar("cost_center"),
  recordedDate: timestamp("recorded_date").default(sql`now()`),
});

export const insertProductionCostSchema = createInsertSchema(productionCosts).omit({ id: true, recordedDate: true }).extend({
  productionOrderId: z.string().min(1),
  costType: z.string().min(1),
  amount: z.string().pipe(z.coerce.number().min(0)),
  description: z.string().optional().nullable(),
  quantity: z.string().optional().nullable(),
  unitCost: z.string().optional().nullable(),
  costCenter: z.string().optional().nullable(),
});

export type InsertProductionCost = z.infer<typeof insertProductionCostSchema>;
export type ProductionCost = typeof productionCosts.$inferSelect;

// ========== ERP MODULE ==========
export const taxRules = pgTable("tax_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  jurisdiction: varchar("jurisdiction").notNull(),
  taxType: varchar("tax_type").notNull(), // sales, vat, gst, income
  rate: numeric("rate", { precision: 8, scale: 4 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  endDate: timestamp("end_date"),
  applicableTransactions: varchar("applicable_transactions"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTaxRuleSchema = createInsertSchema(taxRules).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  jurisdiction: z.string().min(1),
  taxType: z.string().min(1),
  rate: z.string().pipe(z.coerce.number().min(0)),
  effectiveDate: z.date(),
  endDate: z.date().optional().nullable(),
  applicableTransactions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type InsertTaxRule = z.infer<typeof insertTaxRuleSchema>;
export type TaxRule = typeof taxRules.$inferSelect;

export const consolidationRules = pgTable("consolidation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentEntityId: varchar("parent_entity_id").notNull(),
  childEntityId: varchar("child_entity_id").notNull(),
  consolidationMethod: varchar("consolidation_method").notNull(), // full, proportional, equity
  ownershipPercentage: numeric("ownership_percentage", { precision: 5, scale: 2 }).notNull(),
  eliminationAdjustments: text("elimination_adjustments"),
  status: varchar("status").default("active"),
});

export const insertConsolidationRuleSchema = createInsertSchema(consolidationRules).omit({ id: true }).extend({
  parentEntityId: z.string().min(1),
  childEntityId: z.string().min(1),
  consolidationMethod: z.string().min(1),
  ownershipPercentage: z.string().pipe(z.coerce.number().min(0).max(100)),
  eliminationAdjustments: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertConsolidationRule = z.infer<typeof insertConsolidationRuleSchema>;
export type ConsolidationRule = typeof consolidationRules.$inferSelect;

export const fxTranslations = pgTable("fx_translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityId: varchar("entity_id").notNull(),
  fromCurrency: varchar("from_currency").notNull(),
  toCurrency: varchar("to_currency").notNull(),
  transactionDate: timestamp("transaction_date").notNull(),
  transactionAmount: numeric("transaction_amount", { precision: 14, scale: 2 }).notNull(),
  exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 }).notNull(),
  translatedAmount: numeric("translated_amount", { precision: 14, scale: 2 }).notNull(),
  realizedGainLoss: numeric("realized_gain_loss", { precision: 14, scale: 2 }),
  unrealizedGainLoss: numeric("unrealized_gain_loss", { precision: 14, scale: 2 }),
  recordedDate: timestamp("recorded_date").default(sql`now()`),
});

export const insertFxTranslationSchema = createInsertSchema(fxTranslations).omit({ id: true, recordedDate: true }).extend({
  entityId: z.string().min(1),
  fromCurrency: z.string().min(1),
  toCurrency: z.string().min(1),
  transactionDate: z.date(),
  transactionAmount: z.string().pipe(z.coerce.number()),
  exchangeRate: z.string().pipe(z.coerce.number().min(0)),
  translatedAmount: z.string().pipe(z.coerce.number()),
  realizedGainLoss: z.string().optional().nullable(),
  unrealizedGainLoss: z.string().optional().nullable(),
});

export type InsertFxTranslation = z.infer<typeof insertFxTranslationSchema>;
export type FxTranslation = typeof fxTranslations.$inferSelect;

// ========== CRM MODULE ==========
export const leadScores = pgTable("lead_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  score: numeric("score", { precision: 5, scale: 2 }).notNull(),
  scoreComponents: jsonb("score_components").notNull(),
  probability: numeric("probability", { precision: 5, scale: 2 }).notNull(),
  nextAction: varchar("next_action"),
  updatedDate: timestamp("updated_date").default(sql`now()`),
});

export const insertLeadScoreSchema = createInsertSchema(leadScores).omit({ id: true, updatedDate: true }).extend({
  leadId: z.string().min(1),
  score: z.string().pipe(z.coerce.number().min(0).max(100)),
  scoreComponents: z.object({}).passthrough(),
  probability: z.string().pipe(z.coerce.number().min(0).max(100)),
  nextAction: z.string().optional().nullable(),
});

export type InsertLeadScore = z.infer<typeof insertLeadScoreSchema>;
export type LeadScore = typeof leadScores.$inferSelect;

export const cpqPricingRules = pgTable("cpq_pricing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  productId: varchar("product_id"),
  quantity: numeric("quantity", { precision: 10, scale: 2 }),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }),
  applicableFrom: timestamp("applicable_from"),
  applicableTo: timestamp("applicable_to"),
  conditions: jsonb("conditions"),
  status: varchar("status").default("active"),
});

export const insertCpqPricingRuleSchema = createInsertSchema(cpqPricingRules).omit({ id: true }).extend({
  name: z.string().min(1),
  productId: z.string().optional().nullable(),
  quantity: z.string().optional().nullable(),
  discountPercent: z.string().optional().nullable(),
  discountAmount: z.string().optional().nullable(),
  applicableFrom: z.date().optional().nullable(),
  applicableTo: z.date().optional().nullable(),
  conditions: z.object({}).passthrough().optional().nullable(),
  status: z.string().optional(),
});

export type InsertCpqPricingRule = z.infer<typeof insertCpqPricingRuleSchema>;
export type CpqPricingRule = typeof cpqPricingRules.$inferSelect;

export const territories = pgTable("territories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to").notNull(),
  quota: numeric("quota", { precision: 14, scale: 2 }).notNull(),
  quotaPeriod: varchar("quota_period").notNull(), // annual, quarterly, monthly
  status: varchar("status").default("active"),
});

export const insertTerritorySchema = createInsertSchema(territories).omit({ id: true }).extend({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  assignedTo: z.string().min(1),
  quota: z.string().pipe(z.coerce.number().min(0)),
  quotaPeriod: z.string().min(1),
  status: z.string().optional(),
});

export type InsertTerritory = z.infer<typeof insertTerritorySchema>;
export type Territory = typeof territories.$inferSelect;

// ========== HR MODULE ==========
export const benefitsPlans = pgTable("benefits_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  benefitType: varchar("benefit_type").notNull(), // health, dental, vision, retirement, pto
  providerName: varchar("provider_name"),
  costPerEmployee: numeric("cost_per_employee", { precision: 12, scale: 2 }),
  employeeContribution: numeric("employee_contribution", { precision: 12, scale: 2 }),
  status: varchar("status").default("active"),
});

export const insertBenefitsPlanSchema = createInsertSchema(benefitsPlans).omit({ id: true }).extend({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  benefitType: z.string().min(1),
  providerName: z.string().optional().nullable(),
  costPerEmployee: z.string().optional().nullable(),
  employeeContribution: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertBenefitsPlan = z.infer<typeof insertBenefitsPlanSchema>;
export type BenefitsPlan = typeof benefitsPlans.$inferSelect;

export const payrollConfigs = pgTable("payroll_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  country: varchar("country").notNull(),
  taxFilingStatus: varchar("tax_filing_status"),
  federalTaxRate: numeric("federal_tax_rate", { precision: 5, scale: 2 }),
  stateTaxRate: numeric("state_tax_rate", { precision: 5, scale: 2 }),
  socialSecurityRate: numeric("social_security_rate", { precision: 5, scale: 2 }),
  medicareRate: numeric("medicare_rate", { precision: 5, scale: 2 }),
  minimumWage: numeric("minimum_wage", { precision: 10, scale: 2 }),
  payFrequency: varchar("pay_frequency").notNull(), // weekly, biweekly, monthly
  status: varchar("status").default("active"),
});

export const insertPayrollConfigSchema = createInsertSchema(payrollConfigs).omit({ id: true }).extend({
  country: z.string().min(1),
  taxFilingStatus: z.string().optional().nullable(),
  federalTaxRate: z.string().optional().nullable(),
  stateTaxRate: z.string().optional().nullable(),
  socialSecurityRate: z.string().optional().nullable(),
  medicareRate: z.string().optional().nullable(),
  minimumWage: z.string().optional().nullable(),
  payFrequency: z.string().min(1),
  status: z.string().optional(),
});

export type InsertPayrollConfig = z.infer<typeof insertPayrollConfigSchema>;
export type PayrollConfig = typeof payrollConfigs.$inferSelect;

export const successionPlans = pgTable("succession_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  positionId: varchar("position_id").notNull(),
  criticalityLevel: varchar("criticality_level").notNull(), // critical, high, medium, low
  successor1Id: varchar("successor1_id"),
  successor2Id: varchar("successor2_id"),
  successor3Id: varchar("successor3_id"),
  readinessPercent: numeric("readiness_percent", { precision: 5, scale: 2 }),
  developmentPlan: text("development_plan"),
  status: varchar("status").default("active"),
});

export const insertSuccessionPlanSchema = createInsertSchema(successionPlans).omit({ id: true }).extend({
  positionId: z.string().min(1),
  criticalityLevel: z.string().min(1),
  successor1Id: z.string().optional().nullable(),
  successor2Id: z.string().optional().nullable(),
  successor3Id: z.string().optional().nullable(),
  readinessPercent: z.string().optional().nullable(),
  developmentPlan: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertSuccessionPlan = z.infer<typeof insertSuccessionPlanSchema>;
export type SuccessionPlan = typeof successionPlans.$inferSelect;

export const learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  employeeId: varchar("employee_id").notNull(),
  courseIds: varchar("course_ids").array(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  progressPercent: numeric("progress_percent", { precision: 5, scale: 2 }).default("0"),
  status: varchar("status").default("active"),
});

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({ id: true }).extend({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  employeeId: z.string().min(1),
  courseIds: z.array(z.string()).optional().nullable(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  progressPercent: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type LearningPath = typeof learningPaths.$inferSelect;

export const compensationPlans = pgTable("compensation_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull(),
  baseSalary: numeric("base_salary", { precision: 12, scale: 2 }).notNull(),
  bonus: numeric("bonus", { precision: 12, scale: 2 }),
  bonusPercentage: numeric("bonus_percentage", { precision: 5, scale: 2 }),
  stockOptions: numeric("stock_options", { precision: 12, scale: 2 }),
  performanceBonus: numeric("performance_bonus", { precision: 12, scale: 2 }),
  effectiveDate: timestamp("effective_date"),
  reviewDate: timestamp("review_date"),
  status: varchar("status").default("active"),
});

export const insertCompensationPlanSchema = createInsertSchema(compensationPlans).omit({ id: true }).extend({
  employeeId: z.string().min(1),
  baseSalary: z.string().pipe(z.coerce.number().min(0)),
  bonus: z.string().optional().nullable(),
  bonusPercentage: z.string().optional().nullable(),
  stockOptions: z.string().optional().nullable(),
  performanceBonus: z.string().optional().nullable(),
  effectiveDate: z.date().optional().nullable(),
  reviewDate: z.date().optional().nullable(),
  status: z.string().optional(),
});

export type InsertCompensationPlan = z.infer<typeof insertCompensationPlanSchema>;
export type CompensationPlan = typeof compensationPlans.$inferSelect;
