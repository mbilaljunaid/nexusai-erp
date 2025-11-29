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

// Manufacturing: Bill of Materials
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
    name: z.string().min(1, "Name required"),
    productId: z.string().min(1, "Product required"),
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    yield: z.string().optional(),
    uom: z.string().min(1, "UOM required"),
    revision: z.number().optional(),
    status: z.string().optional(),
    description: z.string().optional().nullable(),
    effectiveDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
  });

export type InsertBom = z.infer<typeof insertBomSchema>;
export type Bom = typeof boms.$inferSelect;

// BOM Line Items
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

export const insertBomLineSchema = createInsertSchema(bomLines)
  .omit({ id: true })
  .extend({
    componentId: z.string().min(1, "Component required"),
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    scrapPercentage: z.string().optional(),
    uom: z.string().min(1, "UOM required"),
    notes: z.string().optional().nullable(),
  });

export type InsertBomLine = z.infer<typeof insertBomLineSchema>;
export type BomLine = typeof bomLines.$inferSelect;

// Manufacturing: Work Orders
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

export const insertWorkOrderSchema = createInsertSchema(workOrders)
  .omit({ id: true, woNumber: true, createdAt: true })
  .extend({
    bomId: z.string().min(1, "BOM required"),
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
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

// Manufacturing: Production Orders
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

export const insertProductionOrderSchema = createInsertSchema(productionOrders)
  .omit({ id: true, poNumber: true, createdAt: true })
  .extend({
    productId: z.string().min(1, "Product required"),
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
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

// Manufacturing: Quality Control
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

export const insertQualityCheckSchema = createInsertSchema(qualityChecks)
  .omit({ id: true, checkDate: true })
  .extend({
    workOrderId: z.string().min(1, "Work Order required"),
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    quantityPassed: z.string().pipe(z.coerce.number().min(0, "Cannot be negative")),
    quantityFailed: z.string().optional(),
    checkType: z.string().min(1, "Check type required"),
    defects: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    checkedBy: z.string().optional().nullable(),
  });

export type InsertQualityCheck = z.infer<typeof insertQualityCheckSchema>;
export type QualityCheck = typeof qualityChecks.$inferSelect;

// Manufacturing: Routing (Production paths with operations)
export const routings = pgTable("routings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  productId: varchar("product_id").notNull(),
  description: text("description"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRoutingSchema = createInsertSchema(routings)
  .omit({ id: true, createdAt: true })
  .extend({
    name: z.string().min(1, "Name required"),
    productId: z.string().min(1, "Product required"),
    status: z.string().optional(),
    description: z.string().optional().nullable(),
  });

export type InsertRouting = z.infer<typeof insertRoutingSchema>;
export type Routing = typeof routings.$inferSelect;

// Manufacturing: Routing Operations
export const routingOperations = pgTable("routing_operations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  routingId: varchar("routing_id").notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  workCenterId: varchar("work_center_id").notNull(),
  operationName: text("operation_name").notNull(),
  cycleTime: numeric("cycle_time", { precision: 10, scale: 2 }).notNull(), // minutes
  setupTime: numeric("setup_time", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
});

export const insertRoutingOperationSchema = createInsertSchema(routingOperations)
  .omit({ id: true })
  .extend({
    routingId: z.string().min(1, "Routing required"),
    workCenterId: z.string().min(1, "Work center required"),
    operationName: z.string().min(1, "Operation name required"),
    cycleTime: z.string().pipe(z.coerce.number().min(0, "Cycle time required")),
    setupTime: z.string().optional(),
    sequenceNumber: z.number().min(1),
    notes: z.string().optional().nullable(),
  });

export type InsertRoutingOperation = z.infer<typeof insertRoutingOperationSchema>;
export type RoutingOperation = typeof routingOperations.$inferSelect;

// Manufacturing: Work Centers
export const workCenters = pgTable("work_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  code: varchar("code").notNull().unique(),
  location: varchar("location"),
  capacity: numeric("capacity", { precision: 10, scale: 2 }).notNull(), // units per hour
  costPerHour: numeric("cost_per_hour", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status").default("active"),
  description: text("description"),
});

export const insertWorkCenterSchema = createInsertSchema(workCenters)
  .omit({ id: true })
  .extend({
    name: z.string().min(1, "Name required"),
    code: z.string().min(1, "Code required"),
    capacity: z.string().pipe(z.coerce.number().min(0.01, "Capacity must be > 0")),
    costPerHour: z.string().pipe(z.coerce.number().min(0, "Cost must be >= 0")),
    location: z.string().optional().nullable(),
    status: z.string().optional(),
    description: z.string().optional().nullable(),
  });

export type InsertWorkCenter = z.infer<typeof insertWorkCenterSchema>;
export type WorkCenter = typeof workCenters.$inferSelect;

// Manufacturing: MRP (Material Requirements Planning)
export const mrpForecasts = pgTable("mrp_forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  forecastDate: timestamp("forecast_date").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").default("draft"), // draft, confirmed, completed
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMrpForecastSchema = createInsertSchema(mrpForecasts)
  .omit({ id: true, createdAt: true })
  .extend({
    productId: z.string().min(1, "Product required"),
    forecastDate: z.date(),
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    status: z.string().optional(),
    notes: z.string().optional().nullable(),
  });

export type InsertMrpForecast = z.infer<typeof insertMrpForecastSchema>;
export type MrpForecast = typeof mrpForecasts.$inferSelect;

// Manufacturing: Stock Replenishment Rules
export const replenishmentRules = pgTable("replenishment_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().unique(),
  minStock: numeric("min_stock", { precision: 10, scale: 2 }).notNull(),
  maxStock: numeric("max_stock", { precision: 10, scale: 2 }).notNull(),
  reorderQuantity: numeric("reorder_quantity", { precision: 10, scale: 2 }).notNull(),
  leadTimeDays: integer("lead_time_days").default(0),
  replenishmentMethod: varchar("replenishment_method").default("purchase"), // purchase, manufacture
  status: varchar("status").default("active"),
});

export const insertReplenishmentRuleSchema = createInsertSchema(replenishmentRules)
  .omit({ id: true })
  .extend({
    productId: z.string().min(1, "Product required"),
    minStock: z.string().pipe(z.coerce.number().min(0, "Min stock required")),
    maxStock: z.string().pipe(z.coerce.number().min(0, "Max stock required")),
    reorderQuantity: z.string().pipe(z.coerce.number().min(0.01, "Reorder quantity must be > 0")),
    leadTimeDays: z.number().optional(),
    replenishmentMethod: z.string().optional(),
    status: z.string().optional(),
  });

export type InsertReplenishmentRule = z.infer<typeof insertReplenishmentRuleSchema>;
export type ReplenishmentRule = typeof replenishmentRules.$inferSelect;

// Manufacturing: Warehouse & Locations
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

export const insertWarehouseSchema = createInsertSchema(warehouses)
  .omit({ id: true })
  .extend({
    name: z.string().min(1, "Name required"),
    code: z.string().min(1, "Code required"),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    status: z.string().optional(),
  });

export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Warehouse = typeof warehouses.$inferSelect;

// Manufacturing: Stock Locations
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

export const insertStockLocationSchema = createInsertSchema(stockLocations)
  .omit({ id: true })
  .extend({
    warehouseId: z.string().min(1, "Warehouse required"),
    locationCode: z.string().min(1, "Location code required"),
    aisle: z.string().optional().nullable(),
    shelf: z.string().optional().nullable(),
    bin: z.string().optional().nullable(),
    capacity: z.string().optional().nullable(),
    status: z.string().optional(),
  });

export type InsertStockLocation = z.infer<typeof insertStockLocationSchema>;
export type StockLocation = typeof stockLocations.$inferSelect;

// Manufacturing: Stock Moves (inventory movements)
export const stockMoves = pgTable("stock_moves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moveNumber: varchar("move_number").notNull().unique(),
  productId: varchar("product_id").notNull(),
  fromLocationId: varchar("from_location_id"),
  toLocationId: varchar("to_location_id").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  moveType: varchar("move_type").notNull(), // purchase, sale, internal, production
  status: varchar("status").default("pending"), // pending, confirmed, done
  moveDate: timestamp("move_date").default(sql`now()`),
  notes: text("notes"),
});

export const insertStockMoveSchema = createInsertSchema(stockMoves)
  .omit({ id: true, moveNumber: true, moveDate: true })
  .extend({
    productId: z.string().min(1, "Product required"),
    toLocationId: z.string().min(1, "To location required"),
    quantity: z.string().pipe(z.coerce.number().min(0.01, "Quantity must be > 0")),
    moveType: z.string().min(1, "Move type required"),
    status: z.string().optional(),
    fromLocationId: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  });

export type InsertStockMove = z.infer<typeof insertStockMoveSchema>;
export type StockMove = typeof stockMoves.$inferSelect;

// Manufacturing: Maintenance
export const maintenance = pgTable("maintenance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  maintenanceNumber: varchar("maintenance_number").notNull().unique(),
  workCenterId: varchar("work_center_id").notNull(),
  maintenanceType: varchar("maintenance_type").notNull(), // preventive, corrective, predictive
  description: text("description").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  status: varchar("status").default("pending"), // pending, in-progress, completed, cancelled
  duration: integer("duration"), // minutes
  technician: varchar("technician"),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertMaintenanceSchema = createInsertSchema(maintenance)
  .omit({ id: true, maintenanceNumber: true, createdAt: true })
  .extend({
    workCenterId: z.string().min(1, "Work center required"),
    description: z.string().min(1, "Description required"),
    maintenanceType: z.string().min(1, "Type required"),
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

// Manufacturing: Cost Tracking
export const productionCosts = pgTable("production_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productionOrderId: varchar("production_order_id").notNull(),
  costType: varchar("cost_type").notNull(), // material, labor, overhead, other
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }),
  unitCost: numeric("unit_cost", { precision: 12, scale: 4 }),
  costCenter: varchar("cost_center"),
  recordedDate: timestamp("recorded_date").default(sql`now()`),
});

export const insertProductionCostSchema = createInsertSchema(productionCosts)
  .omit({ id: true, recordedDate: true })
  .extend({
    productionOrderId: z.string().min(1, "Production order required"),
    costType: z.string().min(1, "Cost type required"),
    amount: z.string().pipe(z.coerce.number().min(0, "Amount required")),
    description: z.string().optional().nullable(),
    quantity: z.string().optional().nullable(),
    unitCost: z.string().optional().nullable(),
    costCenter: z.string().optional().nullable(),
  });

export type InsertProductionCost = z.infer<typeof insertProductionCostSchema>;
export type ProductionCost = typeof productionCosts.$inferSelect;
