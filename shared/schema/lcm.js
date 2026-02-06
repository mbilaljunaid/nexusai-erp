"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertLcmAllocationSchema = exports.lcmAuditLogRelations = exports.lcmAuditLogs = exports.lcmAllocations = exports.insertLcmChargeSchema = exports.lcmCharges = exports.insertLcmShipmentLineSchema = exports.lcmShipmentLines = exports.insertLcmTradeOperationSchema = exports.lcmTradeOperations = exports.insertLcmCostComponentSchema = exports.lcmCostComponents = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_1 = require("drizzle-orm");
// 1. Cost Components (Master Data)
// e.g., "Ocean Freight", "Import Duty", "Inland Haulage"
exports.lcmCostComponents = (0, pg_core_1.pgTable)("lcm_cost_components", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    componentType: (0, pg_core_1.varchar)("component_type").notNull(), // 'FREIGHT', 'INSURANCE', 'DUTY', 'OTHERS'
    allocationBasis: (0, pg_core_1.varchar)("allocation_basis").default('VALUE'), // 'VALUE', 'QUANTITY', 'WEIGHT', 'VOLUME'
    absorptionAccountCcid: (0, pg_core_1.varchar)("absorption_account_ccid"), // Credit Account for Estimates
    varianceAccountCcid: (0, pg_core_1.varchar)("variance_account_ccid"), // Dr/Cr Variance Account
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertLcmCostComponentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.lcmCostComponents);
// 2. Trade Operations (The "Shipment" / "Voyage")
exports.lcmTradeOperations = (0, pg_core_1.pgTable)("lcm_trade_operations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    operationNumber: (0, pg_core_1.varchar)("operation_number").notNull().unique(), // e.g. "TO-2024-001"
    name: (0, pg_core_1.varchar)("name"), // e.g. "Maersk Voyage 123"
    status: (0, pg_core_1.varchar)("status").default('OPEN'), // 'OPEN', 'CLOSED', 'CANCELLED'
    description: (0, pg_core_1.text)("description"),
    supplierId: (0, pg_core_1.varchar)("supplier_id"), // Optional: if the whole shipment is from one supplier
    // Logistics into
    carrier: (0, pg_core_1.varchar)("carrier"),
    vessel: (0, pg_core_1.varchar)("vessel"),
    billOfLading: (0, pg_core_1.varchar)("bill_of_lading"),
    departureDate: (0, pg_core_1.timestamp)("departure_date"),
    arrivalDate: (0, pg_core_1.timestamp)("arrival_date"),
    approvalStatus: (0, pg_core_1.varchar)("approval_status", { length: 20 }).default('DRAFT'), // DRAFT, PENDING, APPROVED, REJECTED
    approvedBy: (0, pg_core_1.varchar)("approved_by"),
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertLcmTradeOperationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.lcmTradeOperations);
// 3. Shipment Lines (Links PO Lines to Trade Op)
exports.lcmShipmentLines = (0, pg_core_1.pgTable)("lcm_shipment_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tradeOperationId: (0, pg_core_1.varchar)("trade_operation_id").notNull(), //.references(() => lcmTradeOperations.id),
    purchaseOrderLineId: (0, pg_core_1.varchar)("po_line_id").notNull(),
    // We snapshot some data for reference, but main source is PO Line
    quantity: (0, pg_core_1.numeric)("quantity").notNull(),
    netWeight: (0, pg_core_1.numeric)("net_weight"),
    volume: (0, pg_core_1.numeric)("volume"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertLcmShipmentLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.lcmShipmentLines);
// 4. Charges (Estimated Costs attached to Trade Op)
exports.lcmCharges = (0, pg_core_1.pgTable)("lcm_charges", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tradeOperationId: (0, pg_core_1.varchar)("trade_operation_id").notNull(), //.references(() => lcmTradeOperations.id),
    costComponentId: (0, pg_core_1.varchar)("cost_component_id").notNull(), //.references(() => lcmCostComponents.id),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    currency: (0, pg_core_1.varchar)("currency").default('USD'),
    vendorId: (0, pg_core_1.varchar)("vendor_id"), // Third-party vendor (Carrier, Broker)
    referenceNumber: (0, pg_core_1.varchar)("reference_number"), // Invoice # or Quote #
    isActual: (0, pg_core_1.boolean)("is_actual").default(false), // False = Estimate, True = Actual from AP
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertLcmChargeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.lcmCharges);
// 5. Allocations (The distributed cost per line)
exports.lcmAllocations = (0, pg_core_1.pgTable)("lcm_allocations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    chargeId: (0, pg_core_1.varchar)("charge_id").notNull(), //.references(() => lcmCharges.id),
    shipmentLineId: (0, pg_core_1.varchar)("shipment_line_id").notNull(), //.references(() => lcmShipmentLines.id),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    basisValue: (0, pg_core_1.numeric)("basis_value"), // The weight/qty used for calculation
    varianceAmount: (0, pg_core_1.numeric)("variance_amount"), // The difference between Estimated and Actual allocation
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.lcmAuditLogs = (0, pg_core_1.pgTable)("lcm_audit_logs", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    entityTable: (0, pg_core_1.varchar)("entity_table").notNull(), // 'lcm_trade_operations', 'lcm_charges', 'lcm_allocations'
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    action: (0, pg_core_1.varchar)("action").notNull(), // 'CREATE', 'UPDATE', 'DELETE', 'ALLOCATE', 'CLOSE'
    changedFields: (0, pg_core_1.jsonb)("changed_fields"), // { old: ..., new: ... }
    performedBy: (0, pg_core_1.varchar)("performed_by").default('SYSTEM'), // User ID or 'SYSTEM'
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.lcmAuditLogRelations = (0, drizzle_orm_1.relations)(exports.lcmAuditLogs, ({ one }) => ({
// Generic relation might be hard due to dynamic entityTable, so we might skip direct relation link here 
// or link loosely if needed. For now, independent log.
}));
exports.insertLcmAllocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.lcmAllocations);
//# sourceMappingURL=lcm.js.map