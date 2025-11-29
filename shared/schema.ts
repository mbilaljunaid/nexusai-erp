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

// ========== PHASE 1: AI COPILOT & MOBILE ==========

// AI Copilot Conversations
export const copilotConversations = pgTable("copilot_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  context: varchar("context").notNull(), // crm, erp, hr, manufacturing, etc
  summary: text("summary"),
  messageCount: integer("message_count").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertCopilotConversationSchema = createInsertSchema(copilotConversations).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  userId: z.string().min(1),
  title: z.string().min(1),
  context: z.string().min(1),
  summary: z.string().optional().nullable(),
  messageCount: z.number().optional(),
});

export type InsertCopilotConversation = z.infer<typeof insertCopilotConversationSchema>;
export type CopilotConversation = typeof copilotConversations.$inferSelect;

// AI Copilot Messages
export const copilotMessages = pgTable("copilot_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: varchar("role").notNull(), // user, assistant
  content: text("content").notNull(),
  tokens: integer("tokens"),
  insights: text("insights"), // JSON array of AI insights
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCopilotMessageSchema = createInsertSchema(copilotMessages).omit({ id: true, createdAt: true }).extend({
  conversationId: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  tokens: z.number().optional(),
  insights: z.string().optional().nullable(),
});

export type InsertCopilotMessage = z.infer<typeof insertCopilotMessageSchema>;
export type CopilotMessage = typeof copilotMessages.$inferSelect;

// Mobile Devices for app tracking
export const mobileDevices = pgTable("mobile_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deviceId: varchar("device_id").notNull().unique(),
  deviceType: varchar("device_type").notNull(), // ios, android
  osVersion: varchar("os_version"),
  appVersion: varchar("app_version"),
  lastSyncDate: timestamp("last_sync_date"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMobileDeviceSchema = createInsertSchema(mobileDevices).omit({ id: true, createdAt: true }).extend({
  userId: z.string().min(1),
  deviceId: z.string().min(1),
  deviceType: z.enum(["ios", "android"]),
  osVersion: z.string().optional().nullable(),
  appVersion: z.string().optional().nullable(),
  lastSyncDate: z.date().optional().nullable(),
  status: z.string().optional(),
});

export type InsertMobileDevice = z.infer<typeof insertMobileDeviceSchema>;
export type MobileDevice = typeof mobileDevices.$inferSelect;

// Offline sync queue for mobile
export const offlineSyncQueue = pgTable("offline_sync_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull(),
  operation: varchar("operation").notNull(), // create, update, delete
  entity: varchar("entity").notNull(), // users, leads, orders, etc
  entityId: varchar("entity_id").notNull(),
  payload: jsonb("payload").notNull(),
  status: varchar("status").default("pending"), // pending, synced, failed
  syncedAt: timestamp("synced_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertOfflineSyncSchema = createInsertSchema(offlineSyncQueue).omit({ id: true, createdAt: true }).extend({
  deviceId: z.string().min(1),
  operation: z.enum(["create", "update", "delete"]),
  entity: z.string().min(1),
  entityId: z.string().min(1),
  payload: z.object({}).passthrough(),
  status: z.string().optional(),
  syncedAt: z.date().optional().nullable(),
});

export type InsertOfflineSync = z.infer<typeof insertOfflineSyncSchema>;
export type OfflineSync = typeof offlineSyncQueue.$inferSelect;

// ========== PHASE 2: ADVANCED PLANNING & ANALYTICS ==========

// Planning: Revenue Forecasts
export const revenueForecasts = pgTable("revenue_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  forecastPeriod: varchar("forecast_period").notNull(), // Q1 2025, etc
  product: varchar("product"),
  region: varchar("region"),
  baselineRevenue: numeric("baseline_revenue", { precision: 15, scale: 2 }).notNull(),
  forecastRevenue: numeric("forecast_revenue", { precision: 15, scale: 2 }).notNull(),
  confidence: integer("confidence").default(80), // 0-100
  assumptions: text("assumptions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenueForecastSchema = createInsertSchema(revenueForecasts).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  forecastPeriod: z.string().min(1),
  baselineRevenue: z.string().pipe(z.coerce.number().min(0)),
  forecastRevenue: z.string().pipe(z.coerce.number().min(0)),
  confidence: z.number().optional(),
  product: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  assumptions: z.string().optional().nullable(),
});

export type InsertRevenueForecast = z.infer<typeof insertRevenueForecastSchema>;
export type RevenueForecast = typeof revenueForecasts.$inferSelect;

// Planning: Budget Allocations
export const budgetAllocations = pgTable("budget_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  department: varchar("department").notNull(),
  year: integer("year").notNull(),
  budgetAmount: numeric("budget_amount", { precision: 15, scale: 2 }).notNull(),
  allocated: numeric("allocated", { precision: 15, scale: 2 }).default("0"),
  spent: numeric("spent", { precision: 15, scale: 2 }).default("0"),
  variance: numeric("variance", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBudgetAllocationSchema = createInsertSchema(budgetAllocations).omit({ id: true, createdAt: true }).extend({
  department: z.string().min(1),
  year: z.number(),
  budgetAmount: z.string().pipe(z.coerce.number().min(0)),
  allocated: z.string().optional(),
  spent: z.string().optional(),
  variance: z.string().optional(),
});

export type InsertBudgetAllocation = z.infer<typeof insertBudgetAllocationSchema>;
export type BudgetAllocation = typeof budgetAllocations.$inferSelect;

// Forecasting: Time Series Data
export const timeSeriesData = pgTable("time_series_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  metric: varchar("metric").notNull(), // revenue, cost, headcount, etc
  period: varchar("period").notNull(), // YYYY-MM-DD
  value: numeric("value", { precision: 15, scale: 2 }).notNull(),
  category: varchar("category"), // product, region, department
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTimeSeriesDataSchema = createInsertSchema(timeSeriesData).omit({ id: true, createdAt: true }).extend({
  metric: z.string().min(1),
  period: z.string().min(1),
  value: z.string().pipe(z.coerce.number()),
  category: z.string().optional().nullable(),
});

export type InsertTimeSeriesData = z.infer<typeof insertTimeSeriesDataSchema>;
export type TimeSeriesData = typeof timeSeriesData.$inferSelect;

// Forecasting: Models
export const forecastModels = pgTable("forecast_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  modelType: varchar("model_type").notNull(), // arima, exponential_smoothing, linear_regression
  metric: varchar("metric").notNull(),
  accuracy: numeric("accuracy", { precision: 5, scale: 2 }),
  mape: numeric("mape", { precision: 5, scale: 2 }), // Mean Absolute Percentage Error
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertForecastModelSchema = createInsertSchema(forecastModels).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  modelType: z.enum(["arima", "exponential_smoothing", "linear_regression"]),
  metric: z.string().min(1),
  accuracy: z.string().optional(),
  mape: z.string().optional(),
  status: z.string().optional(),
});

export type InsertForecastModel = z.infer<typeof insertForecastModelSchema>;
export type ForecastModel = typeof forecastModels.$inferSelect;

// What-If Analysis: Scenarios
export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  baselineId: varchar("baseline_id"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertScenarioSchema = createInsertSchema(scenarios).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  baselineId: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

// What-If Analysis: Scenario Variables
export const scenarioVariables = pgTable("scenario_variables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull(),
  variableName: varchar("variable_name").notNull(),
  baselineValue: numeric("baseline_value", { precision: 15, scale: 2 }).notNull(),
  modifiedValue: numeric("modified_value", { precision: 15, scale: 2 }).notNull(),
  impactType: varchar("impact_type"), // revenue, cost, headcount
});

export const insertScenarioVariableSchema = createInsertSchema(scenarioVariables).omit({ id: true }).extend({
  scenarioId: z.string().min(1),
  variableName: z.string().min(1),
  baselineValue: z.string().pipe(z.coerce.number()),
  modifiedValue: z.string().pipe(z.coerce.number()),
  impactType: z.string().optional().nullable(),
});

export type InsertScenarioVariable = z.infer<typeof insertScenarioVariableSchema>;
export type ScenarioVariable = typeof scenarioVariables.$inferSelect;

// Analytics: Dashboard Widgets
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardId: varchar("dashboard_id").notNull(),
  name: varchar("name").notNull(),
  widgetType: varchar("widget_type").notNull(), // kpi, chart, table, gauge
  dataSource: varchar("data_source"),
  position: integer("position"),
  config: jsonb("config"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({ id: true, createdAt: true }).extend({
  dashboardId: z.string().min(1),
  name: z.string().min(1),
  widgetType: z.enum(["kpi", "chart", "table", "gauge"]),
  dataSource: z.string().optional().nullable(),
  position: z.number().optional(),
  config: z.object({}).passthrough().optional(),
});

export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;

// Analytics: Reports
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  reportType: varchar("report_type").notNull(), // financial, operational, sales
  description: text("description"),
  widgets: text("widgets").array(),
  schedule: varchar("schedule"), // once, daily, weekly, monthly
  recipients: text("recipients").array(),
  lastGeneratedAt: timestamp("last_generated_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  reportType: z.enum(["financial", "operational", "sales"]),
  description: z.string().optional().nullable(),
  widgets: z.array(z.string()).optional(),
  schedule: z.string().optional().nullable(),
  recipients: z.array(z.string()).optional(),
  lastGeneratedAt: z.date().optional().nullable(),
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Data Governance: Audit Log
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(), // create, read, update, delete
  entity: varchar("entity").notNull(),
  entityId: varchar("entity_id").notNull(),
  changes: jsonb("changes"),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, timestamp: true }).extend({
  userId: z.string().min(1),
  action: z.enum(["create", "read", "update", "delete"]),
  entity: z.string().min(1),
  entityId: z.string().min(1),
  changes: z.object({}).passthrough().optional(),
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ========== PHASE 3: ECOSYSTEM & CONNECTORS ==========

// App Marketplace: Apps
export const apps = pgTable("apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // integration, workflow, analytics, reporting
  version: varchar("version").default("1.0.0"),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  installCount: integer("install_count").default(0),
  developer: varchar("developer").notNull(),
  apiKey: varchar("api_key"),
  webhookUrl: text("webhook_url"),
  status: varchar("status").default("published"), // draft, pending, published, suspended
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAppSchema = createInsertSchema(apps).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  category: z.enum(["integration", "workflow", "analytics", "reporting"]),
  developer: z.string().min(1),
  description: z.string().optional().nullable(),
  version: z.string().optional(),
  rating: z.string().optional(),
  installCount: z.number().optional(),
  apiKey: z.string().optional().nullable(),
  webhookUrl: z.string().optional().nullable(),
  status: z.string().optional(),
});

export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = typeof apps.$inferSelect;

// App Marketplace: App Reviews
export const appReviews = pgTable("app_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAppReviewSchema = createInsertSchema(appReviews).omit({ id: true, createdAt: true }).extend({
  appId: z.string().min(1),
  userId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
});

export type InsertAppReview = z.infer<typeof insertAppReviewSchema>;
export type AppReview = typeof appReviews.$inferSelect;

// App Marketplace: App Installations
export const appInstallations = pgTable("app_installations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  installDate: timestamp("install_date").default(sql`now()`),
  status: varchar("status").default("active"), // active, disabled, uninstalled
  config: jsonb("config"),
});

export const insertAppInstallationSchema = createInsertSchema(appInstallations).omit({ id: true, installDate: true }).extend({
  appId: z.string().min(1),
  tenantId: z.string().min(1),
  status: z.string().optional(),
  config: z.object({}).passthrough().optional(),
});

export type InsertAppInstallation = z.infer<typeof insertAppInstallationSchema>;
export type AppInstallation = typeof appInstallations.$inferSelect;

// Pre-built Connectors: Integrations
export const connectors = pgTable("connectors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  connectorType: varchar("connector_type").notNull(), // stripe, slack, shopify, salesforce, etc
  description: text("description"),
  credentialsSchema: jsonb("credentials_schema"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConnectorSchema = createInsertSchema(connectors).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  connectorType: z.string().min(1),
  description: z.string().optional().nullable(),
  credentialsSchema: z.object({}).passthrough().optional(),
  status: z.string().optional(),
});

export type InsertConnector = z.infer<typeof insertConnectorSchema>;
export type Connector = typeof connectors.$inferSelect;

// Pre-built Connectors: Connector Instances
export const connectorInstances = pgTable("connector_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectorId: varchar("connector_id").notNull(),
  tenantId: varchar("tenant_id").notNull(),
  name: varchar("name").notNull(),
  credentials: jsonb("credentials"),
  status: varchar("status").default("connected"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertConnectorInstanceSchema = createInsertSchema(connectorInstances).omit({ id: true, createdAt: true }).extend({
  connectorId: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  credentials: z.object({}).passthrough(),
  status: z.string().optional(),
  lastSyncAt: z.date().optional().nullable(),
});

export type InsertConnectorInstance = z.infer<typeof insertConnectorInstanceSchema>;
export type ConnectorInstance = typeof connectorInstances.$inferSelect;

// Webhooks: Webhook Events
export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull(),
  eventType: varchar("event_type").notNull(), // order.created, lead.updated, etc
  payload: jsonb("payload").notNull(),
  status: varchar("status").default("pending"), // pending, delivered, failed
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({ id: true, createdAt: true }).extend({
  appId: z.string().min(1),
  eventType: z.string().min(1),
  payload: z.object({}).passthrough(),
  status: z.string().optional(),
  retryCount: z.number().optional(),
});

export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;
export type WebhookEvent = typeof webhookEvents.$inferSelect;

// ========== PHASE 4: ENTERPRISE SECURITY & COMPLIANCE ==========

// Security: ABAC Rules (Attribute-Based Access Control)
export const abacRules = pgTable("abac_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  resource: varchar("resource").notNull(), // users, orders, leads, etc
  action: varchar("action").notNull(), // read, write, delete
  condition: jsonb("condition"), // attribute conditions
  effect: varchar("effect").notNull(), // allow, deny
  priority: integer("priority").default(100),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAbacRuleSchema = createInsertSchema(abacRules).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  resource: z.string().min(1),
  action: z.string().min(1),
  effect: z.enum(["allow", "deny"]),
  priority: z.number().optional(),
  condition: z.object({}).passthrough().optional(),
});

export type InsertAbacRule = z.infer<typeof insertAbacRuleSchema>;
export type AbacRule = typeof abacRules.$inferSelect;

// Security: Encrypted Fields
export const encryptedFields = pgTable("encrypted_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // users, orders, etc
  fieldName: varchar("field_name").notNull(),
  encryptionAlgorithm: varchar("encryption_algorithm").default("AES-256"),
  keyRotationPolicy: varchar("key_rotation_policy"),
  isEncrypted: boolean("is_encrypted").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEncryptedFieldSchema = createInsertSchema(encryptedFields).omit({ id: true, createdAt: true }).extend({
  entityType: z.string().min(1),
  fieldName: z.string().min(1),
  encryptionAlgorithm: z.string().optional(),
  keyRotationPolicy: z.string().optional(),
  isEncrypted: z.boolean().optional(),
});

export type InsertEncryptedField = z.infer<typeof insertEncryptedFieldSchema>;
export type EncryptedField = typeof encryptedFields.$inferSelect;

// Compliance: SOC 2 / HIPAA Configuration
export const complianceConfigs = pgTable("compliance_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  framework: varchar("framework").notNull(), // soc2, hipaa, gdpr, pci-dss
  status: varchar("status").default("in-progress"), // in-progress, compliant, non-compliant
  requirements: jsonb("requirements"),
  lastAuditDate: timestamp("last_audit_date"),
  nextAuditDate: timestamp("next_audit_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertComplianceConfigSchema = createInsertSchema(complianceConfigs).omit({ id: true, createdAt: true }).extend({
  tenantId: z.string().min(1),
  framework: z.enum(["soc2", "hipaa", "gdpr", "pci-dss"]),
  status: z.string().optional(),
  requirements: z.object({}).passthrough().optional(),
  lastAuditDate: z.date().optional().nullable(),
  nextAuditDate: z.date().optional().nullable(),
});

export type InsertComplianceConfig = z.infer<typeof insertComplianceConfigSchema>;
export type ComplianceConfig = typeof complianceConfigs.$inferSelect;

// Advanced Agile: Sprints
export const sprints = pgTable("sprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  projectId: varchar("project_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status").default("planning"), // planning, active, completed
  goal: text("goal"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSprintSchema = createInsertSchema(sprints).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  projectId: z.string().min(1),
  startDate: z.date(),
  endDate: z.date(),
  status: z.string().optional(),
  goal: z.string().optional().nullable(),
});

export type InsertSprint = z.infer<typeof insertSprintSchema>;
export type Sprint = typeof sprints.$inferSelect;

// Advanced Agile: Issues / Tasks
export const issues = pgTable("issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sprintId: varchar("sprint_id"),
  projectId: varchar("project_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // story, task, bug, epic
  status: varchar("status").default("open"), // open, in-progress, done
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  assignee: varchar("assignee"),
  storyPoints: integer("story_points"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertIssueSchema = createInsertSchema(issues).omit({ id: true, createdAt: true }).extend({
  projectId: z.string().min(1),
  sprintId: z.string().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  type: z.enum(["story", "task", "bug", "epic"]),
  status: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assignee: z.string().optional().nullable(),
  storyPoints: z.number().optional().nullable(),
});

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

// ========== PHASE 5: DATA WAREHOUSE & ADVANCED BI ==========

// Data Warehouse: Data Lakes
export const dataLakes = pgTable("data_lakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  provider: varchar("provider").notNull(), // bigquery, snowflake, redshift
  connectionString: varchar("connection_string").notNull(),
  status: varchar("status").default("connected"),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertDataLakeSchema = createInsertSchema(dataLakes).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  provider: z.enum(["bigquery", "snowflake", "redshift"]),
  connectionString: z.string().min(1),
  status: z.string().optional(),
  lastSync: z.date().optional().nullable(),
});

export type InsertDataLake = z.infer<typeof insertDataLakeSchema>;
export type DataLake = typeof dataLakes.$inferSelect;

// ETL: Pipeline Jobs
export const etlPipelines = pgTable("etl_pipelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  source: varchar("source").notNull(),
  destination: varchar("destination").notNull(),
  schedule: varchar("schedule"), // cron expression
  status: varchar("status").default("active"),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertEtlPipelineSchema = createInsertSchema(etlPipelines).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  source: z.string().min(1),
  destination: z.string().min(1),
  schedule: z.string().optional().nullable(),
  status: z.string().optional(),
  lastRun: z.date().optional().nullable(),
  nextRun: z.date().optional().nullable(),
});

export type InsertEtlPipeline = z.infer<typeof insertEtlPipelineSchema>;
export type EtlPipeline = typeof etlPipelines.$inferSelect;

// BI: Advanced Dashboards
export const biDashboards = pgTable("bi_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  datasource: varchar("datasource").notNull(),
  visualizations: jsonb("visualizations"),
  filters: jsonb("filters"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBiDashboardSchema = createInsertSchema(biDashboards).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1),
  datasource: z.string().min(1),
  description: z.string().optional().nullable(),
  visualizations: z.object({}).passthrough().optional(),
  filters: z.object({}).passthrough().optional(),
});

export type InsertBiDashboard = z.infer<typeof insertBiDashboardSchema>;
export type BiDashboard = typeof biDashboards.$inferSelect;

// Field Service: Jobs
export const fieldServiceJobs = pgTable("field_service_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  location: varchar("location").notNull(),
  assignee: varchar("assignee"),
  status: varchar("status").default("unassigned"), // unassigned, assigned, completed
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertFieldServiceJobSchema = createInsertSchema(fieldServiceJobs).omit({ id: true, createdAt: true }).extend({
  title: z.string().min(1),
  location: z.string().min(1),
  assignee: z.string().optional().nullable(),
  status: z.string().optional(),
  scheduledDate: z.date().optional().nullable(),
  completedDate: z.date().optional().nullable(),
});

export type InsertFieldServiceJob = z.infer<typeof insertFieldServiceJobSchema>;
export type FieldServiceJob = typeof fieldServiceJobs.$inferSelect;

// Payroll: Global Configuration
export const payrollConfigs = pgTable("payroll_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  country: varchar("country").notNull(),
  taxBrackets: jsonb("tax_brackets"),
  deductions: jsonb("deductions"),
  minimumWage: numeric("minimum_wage", { precision: 12, scale: 2 }),
  payFrequency: varchar("pay_frequency"), // weekly, biweekly, monthly
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPayrollConfigSchema = createInsertSchema(payrollConfigs).omit({ id: true, createdAt: true }).extend({
  country: z.string().min(1),
  taxBrackets: z.object({}).passthrough().optional(),
  deductions: z.object({}).passthrough().optional(),
  minimumWage: z.string().optional().nullable(),
  payFrequency: z.string().optional().nullable(),
});

export type InsertPayrollConfig = z.infer<typeof insertPayrollConfigSchema>;
export type PayrollConfig = typeof payrollConfigs.$inferSelect;
