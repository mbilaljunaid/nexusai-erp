import { pgTable, varchar, text, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== SUPPLY CHAIN MODULE ==========
export const suppliers = pgTable("scm_suppliers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    email: varchar("email"),
    phone: varchar("phone"),
    address: text("address"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSupplierSchema = createInsertSchema(suppliers).extend({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.string().optional(),
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export const supplierSites = pgTable("scm_supplier_sites", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    supplierId: varchar("supplier_id").notNull(), // FK to scm_suppliers
    siteName: varchar("site_name").notNull(), // e.g., "HEADQUARTERS", "NYC-DISTRIBUTION"
    address: text("address"),
    isPurchasing: varchar("is_purchasing").default("true"), // "true" or "false"
    isPay: varchar("is_pay").default("true"), // "true" or "false"
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSupplierSiteSchema = createInsertSchema(supplierSites).extend({
    supplierId: z.string().min(1),
    siteName: z.string().min(1),
    address: z.string().optional(),
    isPurchasing: z.string().optional(),
    isPay: z.string().optional(),
    status: z.string().optional(),
});

export type InsertSupplierSite = z.infer<typeof insertSupplierSiteSchema>;
export type SupplierSite = typeof supplierSites.$inferSelect;

export const purchaseOrders = pgTable("purchase_orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderNumber: varchar("order_number").notNull().unique(),
    supplierId: varchar("supplier_id"),
    totalAmount: numeric("total_amount", { precision: 18, scale: 2 }),
    status: varchar("status").default("draft"),
    dueDate: timestamp("due_date"),
    complianceStatus: varchar("compliance_status").default("COMPLIANT"), // COMPLIANT, NON_COMPLIANT
    complianceReason: text("compliance_reason"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const purchaseOrderLines = pgTable("purchase_order_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    poHeaderId: varchar("po_header_id").notNull(), // FK to purchaseOrders
    lineNumber: integer("line_number").notNull(),
    itemId: varchar("item_id"), // FK to inventory optional
    description: varchar("description"),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 18, scale: 4 }).notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    projectId: varchar("project_id"), // Linked to ppm_projects
    taskId: varchar("task_id"), // Linked to ppm_tasks
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).extend({
    orderNumber: z.string().min(1),
    supplierId: z.string().optional(),
    totalAmount: z.string().optional(),
    status: z.string().optional(),
    dueDate: z.date().optional().nullable(),
});

export const insertPurchaseOrderLineSchema = createInsertSchema(purchaseOrderLines).extend({
    poHeaderId: z.string().min(1),
    lineNumber: z.number(),
    quantity: z.number(),
    unitPrice: z.number(),
    amount: z.number(),
    projectId: z.string().optional(),
    taskId: z.string().optional(),
});

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrderLine = z.infer<typeof insertPurchaseOrderLineSchema>;
export type PurchaseOrderLine = typeof purchaseOrderLines.$inferSelect;

// 0. Inventory Organizations (Warehouse)
export const inventoryOrganizations = pgTable("inv_organizations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(),
    name: varchar("name").notNull(),
    active: boolean("active").default(true),
    createdAt: timestamp("createdAt").default(sql`now()`),
});

export const inventory = pgTable("inv_items", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    itemNumber: varchar("itemNumber").notNull(),
    description: varchar("description"),
    primaryUomCode: varchar("primaryUomCode"),
    organizationId: varchar("organizationId"), // FK to inv_organizations
    quantityOnHand: numeric("quantityOnHand", { precision: 18, scale: 4 }).default("0"),
    createdAt: timestamp("createdAt").default(sql`now()`),
});

export const inventorySubinventories = pgTable("inv_subinventories", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    organizationId: varchar("organizationId"),
    code: varchar("code").notNull(),
    name: varchar("name").notNull(),
    active: boolean("active").default(true),
    createdAt: timestamp("createdAt").default(sql`now()`),
});

export const inventoryLocators = pgTable("inv_locators", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    subinventoryId: varchar("subinventoryId"),
    code: varchar("code").notNull(),
    zoneId: varchar("zone_id"), // Added for WMS
    active: boolean("active").default(true),
    createdAt: timestamp("createdAt").default(sql`now()`),
});

export const insertInventorySchema = createInsertSchema(inventory).extend({
    itemName: z.string().min(1),
    sku: z.string().optional(),
    quantity: z.number().optional(),
    reorderLevel: z.number().optional(),
    location: z.string().optional(),
});

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export const inventoryTransactions = pgTable("inv_material_transactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    // organizationId: varchar("organizationId"), 
    itemId: varchar("itemId").notNull(),
    transactionType: varchar("transactionType").notNull(),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    uom: varchar("uom"),
    subinventoryId: varchar("subinventoryId"),
    locatorId: varchar("locatorId"),
    transactionDate: timestamp("transactionDate").default(sql`now()`),
    sourceDocumentType: varchar("sourceDocumentType"),
    sourceDocumentId: varchar("sourceDocumentId"),
    reference: varchar("reference"),
    createdAt: timestamp("createdAt").default(sql`now()`),
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).extend({
    inventoryId: z.string().min(1),
    transactionType: z.string().min(1),
    quantity: z.number(),
    projectId: z.string().optional(),
    taskId: z.string().optional(),
    referenceNumber: z.string().optional(),
    cost: z.number().optional(),
});

export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;

export const inventoryLotSerial = pgTable("inventory_lot_serial", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    inventoryId: varchar("inventory_id").notNull(),
    lotNumber: varchar("lot_number"),
    serialNumber: varchar("serial_number"),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).default("0"),
    status: varchar("status").default("ACTIVE"), // ACTIVE, QUARANTINED, EXPIRED, RETIRED
    expirationDate: timestamp("expiration_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInventoryLotSerialSchema = createInsertSchema(inventoryLotSerial).extend({
    inventoryId: z.string().min(1),
    lotNumber: z.string().optional(),
    serialNumber: z.string().optional(),
    quantity: z.number().optional(),
    status: z.string().optional(),
});

export type InsertInventoryLotSerial = z.infer<typeof insertInventoryLotSerialSchema>;
export type InventoryLotSerial = typeof inventoryLotSerial.$inferSelect;

export const purchaseRequisitions = pgTable("purchase_requisitions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    requisitionNumber: varchar("requisition_number").notNull().unique(),
    requesterId: varchar("requester_id"),
    description: text("description"),
    status: varchar("status").default("draft"), // DRAFT, PENDING, APPROVED, REJECTED, CLOSED
    sourceModule: varchar("source_module").default("SCM"), // SCM, MAINTENANCE, PROJECT
    sourceId: varchar("source_id"), // e.g., work_order_id
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const purchaseRequisitionLines = pgTable("purchase_requisition_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    requisitionId: varchar("requisition_id").notNull(),
    lineNumber: integer("line_number").notNull(),
    itemId: varchar("item_id"), // NULL for non-catalog items
    itemDescription: text("item_description").notNull(),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    unitOfMeasure: varchar("unit_of_measure"),
    estimatedPrice: numeric("estimated_price", { precision: 18, scale: 4 }),
    status: varchar("status").default("PENDING"), // PENDING, PO_CREATED, CANCELLED
    needByDate: timestamp("need_by_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPurchaseRequisitionSchema = createInsertSchema(purchaseRequisitions);
export const insertPurchaseRequisitionLineSchema = createInsertSchema(purchaseRequisitionLines);

export type PurchaseRequisition = typeof purchaseRequisitions.$inferSelect;
export type PurchaseRequisitionLine = typeof purchaseRequisitionLines.$inferSelect;

// ========== SUPPLIER ONBOARDING & PORTAL IDENTITY ==========
export const supplierOnboardingRequests = pgTable("supplier_onboarding_requests", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    companyName: varchar("company_name").notNull(),
    taxId: varchar("tax_id").notNull(),
    contactEmail: varchar("contact_email").notNull(),
    phone: varchar("phone"),
    businessClassification: varchar("business_classification"),
    status: varchar("status").default("PENDING"),
    notes: text("notes"),
    submittedAt: timestamp("submitted_at").default(sql`now()`),
    reviewedAt: timestamp("reviewed_at"),
    reviewerId: varchar("reviewer_id"),
    bankAccountName: varchar("bank_account_name"),
    bankAccountNumber: varchar("bank_account_number"),
    bankRoutingNumber: varchar("bank_routing_number"),
});

export const supplierUserIdentities = pgTable("supplier_user_identities", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    supplierId: varchar("supplier_id").notNull(),
    portalToken: varchar("portal_token").unique(),
    role: varchar("role").default("ADMIN"),
    status: varchar("status").default("ACTIVE"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSupplierOnboardingSchema = createInsertSchema(supplierOnboardingRequests);
export const insertSupplierUserIdentitySchema = createInsertSchema(supplierUserIdentities);

export type SupplierOnboardingRequest = typeof supplierOnboardingRequests.$inferSelect;
export type InsertSupplierOnboardingRequest = z.infer<typeof insertSupplierOnboardingSchema>;
export type SupplierUserIdentity = typeof supplierUserIdentities.$inferSelect;
export type InsertSupplierUserIdentity = z.infer<typeof insertSupplierUserIdentitySchema>;

// ========== PROCUREMENT CONTRACTS & COMPLIANCE ==========
export const procurementContracts = pgTable("procurement_contracts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    supplierId: varchar("supplier_id").notNull(),
    contractNumber: varchar("contract_number").notNull().unique(),
    title: varchar("title").notNull(),
    status: varchar("status").default("DRAFT"), // DRAFT, ACTIVE, EXPIRED, CANCELLED
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    totalAmountLimit: numeric("total_amount_limit", { precision: 18, scale: 2 }),
    paymentTerms: varchar("payment_terms"),
    esignStatus: varchar("esign_status").default("NOT_STARTED"), // NOT_STARTED, PENDING, SIGNED, DECLINED
    esignEnvelopeId: varchar("esign_envelope_id"),
    pdfFilePath: varchar("pdf_file_path"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const supplierDocuments = pgTable("scm_supplier_documents", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    supplierId: varchar("supplier_id").notNull(),
    documentType: varchar("document_type").notNull(), // W-9, INSURANCE, CERTIFICATION, OTHER
    fileName: varchar("file_name").notNull(),
    filePath: varchar("file_path").notNull(),
    expiryDate: timestamp("expiry_date"),
    status: varchar("status").default("ACTIVE"), // ACTIVE, EXPIRED, ARCHIVED
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSupplierDocumentSchema = createInsertSchema(supplierDocuments);
export type SupplierDocument = typeof supplierDocuments.$inferSelect;
export type InsertSupplierDocument = z.infer<typeof insertSupplierDocumentSchema>;

export const contractClauses = pgTable("contract_clauses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    title: varchar("title").notNull(),
    clauseText: text("clause_text").notNull(),
    category: varchar("category").notNull(), // LEGAL, PAYMENT, TERMINATION, COMPLIANCE
    isMandatory: varchar("is_mandatory").default("false"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const contractTerms = pgTable("contract_terms", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: varchar("contract_id").notNull(),
    clauseId: varchar("clause_id").notNull(),
    amendedText: text("amended_text"), // Overrides standard library text
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertProcurementContractSchema = createInsertSchema(procurementContracts);
export const insertContractClauseSchema = createInsertSchema(contractClauses);
export const insertContractTermSchema = createInsertSchema(contractTerms);

export type ProcurementContract = typeof procurementContracts.$inferSelect;
export type ContractClause = typeof contractClauses.$inferSelect;
export type ContractTerm = typeof contractTerms.$inferSelect;

// ========== ASN (ADVANCE SHIPMENT NOTICE) ==========
export const asnHeaders = pgTable("asn_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    asnNumber: varchar("asn_number").notNull().unique(),
    supplierId: varchar("supplier_id").notNull(),
    poId: varchar("po_id").notNull(), // Link to purchaseOrders
    shipmentNumber: varchar("shipment_number"),
    shippedDate: timestamp("shipped_date"),
    expectedArrivalDate: timestamp("expected_arrival_date"),
    carrier: varchar("carrier"),
    trackingNumber: varchar("tracking_number"),
    status: varchar("status").default("SHIPPED"), // SHIPPED, DELIVERED, RECEIVED
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const asnLines = pgTable("asn_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    asnId: varchar("asn_id").notNull(),
    poLineId: varchar("po_line_id").notNull(), // Link to purchaseOrderLines
    itemId: varchar("item_id"),
    quantityShipped: numeric("quantity_shipped", { precision: 18, scale: 4 }).notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertAsnHeaderSchema = createInsertSchema(asnHeaders).extend({
    asnNumber: z.string().min(1),
    supplierId: z.string().min(1),
    poId: z.string().min(1),
    shipmentNumber: z.string().optional(),
    shippedDate: z.string().optional(), // Receive as string from JSON
    expectedArrivalDate: z.string().optional(),
    carrier: z.string().optional(),
    trackingNumber: z.string().optional(),
});

export const insertAsnLineSchema = createInsertSchema(asnLines).extend({
    asnId: z.string().min(1),
    poLineId: z.string().min(1),
    quantityShipped: z.number(),
});

export type AsnHeader = typeof asnHeaders.$inferSelect;
export type AsnLine = typeof asnLines.$inferSelect;
export type InsertAsnHeader = z.infer<typeof insertAsnHeaderSchema>;
export type InsertAsnLine = z.infer<typeof insertAsnLineSchema>;

// ========== SUPPLIER PERFORMANCE (SCORECARDS) ==========
export const supplierScorecards = pgTable("supplier_scorecards", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    supplierId: varchar("supplier_id").notNull(),
    period: varchar("period").notNull(), // e.g., "2025-Q1", "2025-01"
    overallScore: integer("overall_score").default(0),
    deliveryScore: integer("delivery_score").default(0),
    qualityScore: integer("quality_score").default(0),
    responsivenessScore: integer("responsiveness_score").default(0),
    generatedAt: timestamp("generated_at").default(sql`now()`),
});

export const supplierQualityEvents = pgTable("supplier_quality_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    supplierId: varchar("supplier_id").notNull(),
    eventId: varchar("event_id"), // Reference to external ID if needed
    type: varchar("type").notNull(), // DEFECT, DELAY, NON_COMPLIANCE
    severity: varchar("severity").default("MEDIUM"), // LOW, MEDIUM, CRITICAL
    description: text("description"),
    eventDate: timestamp("event_date").default(sql`now()`),
    resolved: boolean("resolved").default(false),
});

export const insertScorecardSchema = createInsertSchema(supplierScorecards);
export const insertQualityEventSchema = createInsertSchema(supplierQualityEvents);

export type SupplierScorecard = typeof supplierScorecards.$inferSelect;
export type SupplierQualityEvent = typeof supplierQualityEvents.$inferSelect;

// ========== NEGOTIATION & SOURCING (RFQ & BIDS) ==========
export const sourcingRfqs = pgTable("scm_sourcing_rfqs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    rfqNumber: varchar("rfq_number").notNull().unique(),
    title: varchar("title").notNull(),
    description: text("description"),
    status: varchar("status").default("DRAFT"), // DRAFT, PUBLISHED, EVALUATING, AWARDED, CLOSED
    closeDate: timestamp("close_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const sourcingRfqLines = pgTable("scm_sourcing_rfq_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    rfqId: varchar("rfq_id").notNull(),
    lineNumber: integer("line_number").notNull(),
    itemDescription: text("item_description").notNull(),
    targetQuantity: numeric("target_quantity", { precision: 18, scale: 4 }).notNull(),
    unitOfMeasure: varchar("uom"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const sourcingBids = pgTable("scm_sourcing_bids", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    rfqId: varchar("rfq_id").notNull(),
    supplierId: varchar("supplier_id").notNull(),
    bidStatus: varchar("bid_status").default("DRAFT"), // DRAFT, SUBMITTED, WITHDRAWN
    submissionDate: timestamp("submission_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const sourcingBidLines = pgTable("scm_sourcing_bid_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bidId: varchar("bid_id").notNull(),
    rfqLineId: varchar("rfq_line_id").notNull(),
    offeredPrice: numeric("offered_price", { precision: 18, scale: 4 }).notNull(),
    offeredQuantity: numeric("offered_quantity", { precision: 18, scale: 4 }).notNull(),
    supplierLeadTime: integer("supplier_lead_time"), // in days
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSourcingRfqSchema = createInsertSchema(sourcingRfqs);
export const insertSourcingRfqLineSchema = createInsertSchema(sourcingRfqLines);
export const insertSourcingBidSchema = createInsertSchema(sourcingBids);
export const insertSourcingBidLineSchema = createInsertSchema(sourcingBidLines);

export type SourcingRfq = typeof sourcingRfqs.$inferSelect;
export type SourcingRfqLine = typeof sourcingRfqLines.$inferSelect;
export type SourcingBid = typeof sourcingBids.$inferSelect;
export type SourcingBidLine = typeof sourcingBidLines.$inferSelect;
export type InsertSourcingRfq = z.infer<typeof insertSourcingRfqSchema>;
export type InsertSourcingBid = z.infer<typeof insertSourcingBidSchema>;

// ========== WAREHOUSE MANAGEMENT SYSTEM (WMS) ==========

// 1. Zones (Logical Grouping of Locators)
export const wmsZones = pgTable("wms_zones", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    warehouseId: varchar("warehouse_id").notNull(), // Inventory Organization ID
    zoneCode: varchar("zone_code").notNull(),
    zoneName: varchar("zone_name").notNull(),
    zoneType: varchar("zone_type").default("STORAGE"), // STORAGE, RECEIVING, STAGING, PICKING, PACKING
    isTemperatureControlled: boolean("is_temperature_controlled").default(false),
    priority: integer("priority").default(0), // For directed putaway/picking
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. Handling Units (LPNs / Containers)
export const wmsHandlingUnits = pgTable("wms_handling_units", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    lpnNumber: varchar("lpn_number").notNull().unique(), // License Plate Number
    warehouseId: varchar("warehouse_id").notNull(),
    parentLpnId: varchar("parent_lpn_id"), // Nested LPNs (Box on Pallet)
    type: varchar("type").default("BOX"), // PALLET, BOX, TOTE, CONTAINER
    status: varchar("status").default("ACTIVE"), // ACTIVE, SHIPPED, CONSUMED, VOID
    currentLocationId: varchar("current_location_id"), // Inventory Locator ID
    weight: numeric("weight", { precision: 18, scale: 4 }),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2.1 LPN Contents
export const wmsLpnContents = pgTable("wms_lpn_contents", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    lpnId: varchar("lpn_id").notNull(), // FK to wms_handling_units
    itemId: varchar("item_id").notNull(),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    uom: varchar("uom"),
    lotNumber: varchar("lot_number"),
    serialNumber: varchar("serial_number"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3. WMS Waves (Outbound Release Groups)
export const wmsWaves = pgTable("wms_waves", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    waveNumber: varchar("wave_number").notNull().unique(),
    warehouseId: varchar("warehouse_id").notNull(),
    status: varchar("status").default("PLANNED"), // PLANNED, RELEASED, PICKING, COMPLETED
    description: text("description"),
    releaseDate: timestamp("release_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 4. WMS Tasks (Execution Unit)
export const wmsTasks = pgTable("wms_tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    taskNumber: varchar("task_number").unique(), // Auto-generated
    warehouseId: varchar("warehouse_id").notNull(),
    taskType: varchar("task_type").notNull(), // PICK, PUTAWAY, REPLENISH, COUNT, MOVE
    status: varchar("status").default("PENDING"), // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED

    // Source (What triggered this?)
    sourceDocType: varchar("source_doc_type"), // ORDER, RECEIPT, WAVE, MANUAL
    sourceDocId: varchar("source_doc_id"),
    sourceLineId: varchar("source_line_id"),

    // Item Details
    itemId: varchar("item_id").notNull(),
    quantityPlanned: numeric("quantity_planned", { precision: 18, scale: 4 }).notNull(),
    quantityActual: numeric("quantity_actual", { precision: 18, scale: 4 }),
    uom: varchar("uom"),

    // Location (From -> To)
    fromLocatorId: varchar("from_locator_id"),
    toLocatorId: varchar("to_locator_id"),
    fromLpnId: varchar("from_lpn_id"),
    toLpnId: varchar("to_lpn_id"),

    // Execution
    assignedUserId: varchar("assigned_user_id"),
    priority: integer("priority").default(5),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWmsZoneSchema = createInsertSchema(wmsZones);
export const insertWmsHandlingUnitSchema = createInsertSchema(wmsHandlingUnits);
export const insertWmsLpnContentSchema = createInsertSchema(wmsLpnContents);
export const insertWmsWaveSchema = createInsertSchema(wmsWaves);
export const insertWmsTaskSchema = createInsertSchema(wmsTasks);

export type WmsZone = typeof wmsZones.$inferSelect;
export type WmsHandlingUnit = typeof wmsHandlingUnits.$inferSelect;
export type WmsLpnContent = typeof wmsLpnContents.$inferSelect;
export type WmsWave = typeof wmsWaves.$inferSelect;
export type WmsTask = typeof wmsTasks.$inferSelect;


// 5. Dock Management (Yard)
export const wmsDockAppointments = pgTable("wms_dock_appointments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    warehouseId: varchar("warehouse_id").notNull(),
    dockNumber: varchar("dock_number").notNull(),
    carrier: varchar("carrier").notNull(),
    appointmentTime: timestamp("appointment_time").notNull(),
    durationMinutes: integer("duration_minutes").default(60),
    status: varchar("status").default("SCHEDULED"), // SCHEDULED, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED
    referenceNumber: varchar("reference_number"), // PO or Shipment #
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWmsDockAppointmentSchema = createInsertSchema(wmsDockAppointments);
export type WmsDockAppointment = typeof wmsDockAppointments.$inferSelect;

// 6. Configurable Rules (Strategies)
export const wmsStrategies = pgTable("wms_strategies", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    warehouseId: varchar("warehouse_id").notNull(),
    type: varchar("type").notNull(), // PICKING, PUTAWAY
    name: varchar("name").notNull(), // e.g. "Standard FIFO", "Frozen LIFO"
    description: varchar("description"),
    algorithm: varchar("algorithm").notNull(), // FIFO, LIFO, FEFO, ZONE_BASED
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWmsStrategySchema = createInsertSchema(wmsStrategies);
export type WmsStrategy = typeof wmsStrategies.$inferSelect;

// 7. Handling Unit Types (Master Data)
export const wmsHandlingUnitTypes = pgTable("wms_handling_unit_types", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    warehouseId: varchar("warehouse_id").notNull(),
    code: varchar("code").notNull(), // e.g., "PALLET-STD", "BOX-S", "BOX-M"
    description: varchar("description"),
    length: numeric("length"),
    width: numeric("width"),
    height: numeric("height"),
    maxWeight: numeric("max_weight"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWmsHandlingUnitTypeSchema = createInsertSchema(wmsHandlingUnitTypes);
export type WmsHandlingUnitType = typeof wmsHandlingUnitTypes.$inferSelect;

// 8. Wave Templates (Saved Criteria)
export const wmsWaveTemplates = pgTable("wms_wave_templates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    warehouseId: varchar("warehouse_id").notNull(),
    name: varchar("name").notNull(),
    criteriaJson: text("criteria_json").notNull(), // JSON string of criteria
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertWmsWaveTemplateSchema = createInsertSchema(wmsWaveTemplates);
export type WmsWaveTemplate = typeof wmsWaveTemplates.$inferSelect;
