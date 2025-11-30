// ========== PHASE 5: SUPPLY CHAIN MANAGEMENT ==========
export const supplyChainPartners = pgTable("supply_chain_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partnerName: varchar("partner_name").notNull(),
  partnerType: varchar("partner_type"),
  location: varchar("location"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  reliabilityScore: numeric("reliability_score", { precision: 5, scale: 2 }),
  contracts: jsonb("contracts"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shipmentNumber: varchar("shipment_number").notNull(),
  supplierId: varchar("supplier_id"),
  origin: varchar("origin"),
  destination: varchar("destination"),
  departureDate: timestamp("departure_date"),
  arrivalDate: timestamp("arrival_date"),
  status: varchar("status").default("in-transit"),
  trackingNumber: varchar("tracking_number"),
  cost: numeric("cost", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 5: INVENTORY MANAGEMENT ==========
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemCode: varchar("item_code").notNull().unique(),
  itemName: varchar("item_name").notNull(),
  category: varchar("category"),
  quantity: integer("quantity").default(0),
  reorderLevel: integer("reorder_level"),
  unitCost: numeric("unit_cost", { precision: 15, scale: 2 }),
  warehouse: varchar("warehouse"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const warehouseLocations = pgTable("warehouse_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseName: varchar("warehouse_name").notNull(),
  location: varchar("location"),
  capacity: integer("capacity"),
  occupancy: numeric("occupancy", { precision: 5, scale: 2 }),
  manager: varchar("manager"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 5: QUALITY MANAGEMENT ==========
export const qualityChecks = pgTable("quality_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  checkNumber: varchar("check_number").notNull(),
  itemId: varchar("item_id"),
  checkType: varchar("check_type"),
  inspector: varchar("inspector"),
  result: varchar("result"),
  defects: jsonb("defects"),
  checkDate: timestamp("check_date"),
  status: varchar("status").default("completed"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const nonConformances = pgTable("non_conformances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ncNumber: varchar("nc_number").notNull(),
  description: text("description"),
  severity: varchar("severity"),
  rootCause: text("root_cause"),
  correctionAction: text("correction_action"),
  assignedTo: varchar("assigned_to"),
  dueDate: timestamp("due_date"),
  status: varchar("status").default("open"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// ========== PHASE 5: INTEGRATION HUB ==========
export const integrationConnections = pgTable("integration_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  systemName: varchar("system_name").notNull(),
  apiEndpoint: varchar("api_endpoint"),
  authType: varchar("auth_type"),
  status: varchar("status").default("connected"),
  lastSyncDate: timestamp("last_sync_date"),
  errorLogs: jsonb("error_logs"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const dataIntegrationJobs = pgTable("data_integration_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobName: varchar("job_name").notNull(),
  sourceSystem: varchar("source_system"),
  targetSystem: varchar("target_system"),
  frequency: varchar("frequency"),
  lastRunDate: timestamp("last_run_date"),
  nextRunDate: timestamp("next_run_date"),
  recordsProcessed: integer("records_processed").default(0),
  status: varchar("status").default("scheduled"),
  createdAt: timestamp("created_at").default(sql`now()`),
});
