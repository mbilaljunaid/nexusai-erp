
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

// 1. Cost Components (Master Data)
// e.g., "Ocean Freight", "Import Duty", "Inland Haulage"
export const lcmCostComponents = pgTable("lcm_cost_components", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    componentType: varchar("component_type").notNull(), // 'FREIGHT', 'INSURANCE', 'DUTY', 'OTHERS'
    allocationBasis: varchar("allocation_basis").default('VALUE'), // 'VALUE', 'QUANTITY', 'WEIGHT', 'VOLUME'
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertLcmCostComponentSchema = createInsertSchema(lcmCostComponents);
export type LcmCostComponent = typeof lcmCostComponents.$inferSelect;

// 2. Trade Operations (The "Shipment" / "Voyage")
export const lcmTradeOperations = pgTable("lcm_trade_operations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    operationNumber: varchar("operation_number").notNull().unique(), // e.g. "TO-2024-001"
    name: varchar("name"), // e.g. "Maersk Voyage 123"
    status: varchar("status").default('OPEN'), // 'OPEN', 'CLOSED', 'CANCELLED'
    description: text("description"),
    supplierId: varchar("supplier_id"), // Optional: if the whole shipment is from one supplier
    // Logistics into
    carrier: varchar("carrier"),
    vessel: varchar("vessel"),
    billOfLading: varchar("bill_of_lading"),
    departureDate: timestamp("departure_date"),
    arrivalDate: timestamp("arrival_date"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertLcmTradeOperationSchema = createInsertSchema(lcmTradeOperations);
export type LcmTradeOperation = typeof lcmTradeOperations.$inferSelect;

// 3. Shipment Lines (Links PO Lines to Trade Op)
export const lcmShipmentLines = pgTable("lcm_shipment_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tradeOperationId: varchar("trade_operation_id").notNull(), //.references(() => lcmTradeOperations.id),
    purchaseOrderLineId: varchar("po_line_id").notNull(),
    // We snapshot some data for reference, but main source is PO Line
    quantity: numeric("quantity").notNull(),
    netWeight: numeric("net_weight"),
    volume: numeric("volume"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertLcmShipmentLineSchema = createInsertSchema(lcmShipmentLines);
export type LcmShipmentLine = typeof lcmShipmentLines.$inferSelect;

// 4. Charges (Estimated Costs attached to Trade Op)
export const lcmCharges = pgTable("lcm_charges", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tradeOperationId: varchar("trade_operation_id").notNull(), //.references(() => lcmTradeOperations.id),
    costComponentId: varchar("cost_component_id").notNull(), //.references(() => lcmCostComponents.id),
    amount: numeric("amount").notNull(),
    currency: varchar("currency").default('USD'),
    vendorId: varchar("vendor_id"), // Third-party vendor (Carrier, Broker)
    referenceNumber: varchar("reference_number"), // Invoice # or Quote #
    isActual: boolean("is_actual").default(false), // False = Estimate, True = Actual from AP
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertLcmChargeSchema = createInsertSchema(lcmCharges);
export type LcmCharge = typeof lcmCharges.$inferSelect;

// 5. Allocations (The distributed cost per line)
export const lcmAllocations = pgTable("lcm_allocations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    chargeId: varchar("charge_id").notNull(), //.references(() => lcmCharges.id),
    shipmentLineId: varchar("shipment_line_id").notNull(), //.references(() => lcmShipmentLines.id),
    amount: numeric("amount").notNull(),
    basisValue: numeric("basis_value"), // The weight/qty used for calculation
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertLcmAllocationSchema = createInsertSchema(lcmAllocations);
export type LcmAllocation = typeof lcmAllocations.$inferSelect;
