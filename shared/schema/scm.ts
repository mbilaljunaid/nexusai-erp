import { pgTable, varchar, text, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { apInvoices, apInvoiceLines, apPayments } from "./ap";

import { hzParties } from "./parties";

// ========== SUPPLY CHAIN MODULE ==========
export const suppliers = pgTable("scm_suppliers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    email: varchar("email"),
    phone: varchar("phone"),
    address: text("address"),
    supplierNumber: varchar("supplier_number").unique(), // Legacy Key
    status: varchar("status").default("active"),

    // TCA Linkage
    partyId: varchar("party_id").references(() => hzParties.id),

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
    tenantId: varchar("tenant_id"), // Multi-tenant isolation
    entBusinessUnitId: varchar("ent_business_unit_id"), // Operating Unit/BU Scope
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
    entBusinessUnitId: varchar("ent_business_unit_id"), // Operating Unit/BU Scope
    poHeaderId: varchar("po_header_id").notNull(), // FK to purchaseOrders
    lineNumber: integer("line_number").notNull(),
    itemId: varchar("item_id"), // FK to inventory optional
    description: varchar("description"),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 18, scale: 4 }).notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    projectId: varchar("project_id"), // Linked to ppm_projects
    taskId: varchar("task_id"), // Linked to ppm_tasks
    quantityReceived: numeric("quantity_received", { precision: 18, scale: 4 }).default("0"),
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
    tenantId: varchar("tenant_id"), // Multi-tenant isolation
    code: varchar("code").notNull().unique(),
    name: varchar("name").notNull(),
    active: boolean("active").default(true),
    createdAt: timestamp("createdAt").default(sql`now()`),
});

export const inventory = pgTable("inv_items", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entInventoryOrgId: varchar("ent_inventory_org_id"), // Inventory Org Scope
    itemNumber: varchar("itemNumber").notNull(),
    description: varchar("description"),
    primaryUomCode: varchar("primaryUomCode"),
    organizationId: varchar("organizationId"), // FK to inv_organizations
    quantityOnHand: numeric("quantityOnHand", { precision: 18, scale: 4 }).default("0"),
    minQuantity: numeric("min_quantity", { precision: 18, scale: 4 }).default("0"),
    maxQuantity: numeric("max_quantity", { precision: 18, scale: 4 }).default("0"),
    createdAt: timestamp("createdAt").default(sql`now()`),
});

export const inventorySubinventories = pgTable("inv_subinventories", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entInventoryOrgId: varchar("ent_inventory_org_id"), // Inventory Org Scope
    organizationId: varchar("organizationId"),
    code: varchar("code").notNull(),
    name: varchar("name").notNull(),
    active: boolean("active").default(true),
    createdAt: timestamp("createdAt").default(sql`now()`),
});

export const inventoryLocators = pgTable("inv_locators", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entInventoryOrgId: varchar("ent_inventory_org_id"), // Inventory Org Scope
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
    entInventoryOrgId: varchar("ent_inventory_org_id"), // Inventory Org Scope
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
    // DISABLING MISSING COLUMNS TO UNBLOCK DEPLOY
    // projectId: varchar("project_id"), // Linked to ppm_projects
    // taskId: varchar("task_id"), // Linked to ppm_tasks
    // cost: numeric("cost", { precision: 18, scale: 4 }),
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

export const inventoryOnHandQuantities = pgTable("inv_on_hand_quantities", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entInventoryOrgId: varchar("ent_inventory_org_id"), // Inventory Org Scope
    organizationId: varchar("organizationId").notNull(),
    itemId: varchar("itemId").notNull(),
    subinventoryId: varchar("subinventoryId").notNull(),
    locatorId: varchar("locatorId"),
    lotNumber: varchar("lot_number"),
    serialNumber: varchar("serial_number"),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).default("0").notNull(),
    lastUpdated: timestamp("last_updated").default(sql`now()`),
});

export const insertInventoryOnHandSchema = createInsertSchema(inventoryOnHandQuantities);
export type InventoryOnHandQuantity = typeof inventoryOnHandQuantities.$inferSelect;


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
    entBusinessUnitId: varchar("ent_business_unit_id"), // Operating Unit/BU Scope
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
    entBusinessUnitId: varchar("ent_business_unit_id"), // Operating Unit/BU Scope
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
    entBusinessUnitId: varchar("ent_business_unit_id"), // Operating Unit/BU Scope
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
    entInventoryOrgId: varchar("ent_inventory_org_id"), // Inventory Org Scope
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
    entInventoryOrgId: varchar("ent_inventory_org_id"), // Inventory Org Scope
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
    entInventoryOrgId: varchar("ent_inventory_org_id"), // Inventory Org Scope
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
    entInventoryOrgId: varchar("ent_inventory_org_id"), // Inventory Org Scope
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

// ========== PO DISTRIBUTIONS ==========
export const purchaseOrderDistributions = pgTable("purchase_order_distributions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    poLineId: varchar("po_line_id").notNull(), // FK to purchaseOrderLines
    distributionNumber: integer("distribution_number").notNull(),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    chargeAccountParams: text("charge_account_params"), // JSON string
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPurchaseOrderDistributionSchema = createInsertSchema(purchaseOrderDistributions);
export type PurchaseOrderDistribution = typeof purchaseOrderDistributions.$inferSelect;
export type InsertPurchaseOrderDistribution = z.infer<typeof insertPurchaseOrderDistributionSchema>;

// ========== RFQ / SOURCING ==========
export const rfqHeaders = pgTable("scm_rfq_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    rfqNumber: varchar("rfq_number").notNull().unique(),
    title: varchar("title").notNull(),
    status: varchar("status").default("Draft"), // Draft, Active, Awarded, Closed
    deadline: timestamp("deadline"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const rfqLines = pgTable("scm_rfq_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    headerId: varchar("header_id").notNull(),
    description: text("description"),
    targetQuantity: numeric("target_quantity", { precision: 18, scale: 2 }),
    itemId: varchar("item_id"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const supplierQuotes = pgTable("scm_supplier_quotes", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    rfqId: varchar("rfq_id").notNull(),
    supplierId: varchar("supplier_id").notNull(),
    quoteAmount: numeric("quote_amount", { precision: 18, scale: 2 }),
    status: varchar("status").default("Submitted"), // Submitted, Awarded, Rejected
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRfqHeaderSchema = createInsertSchema(rfqHeaders);
export const insertRfqLineSchema = createInsertSchema(rfqLines);
export const insertSupplierQuoteSchema = createInsertSchema(supplierQuotes);

export type RfqHeader = typeof rfqHeaders.$inferSelect;
export type RfqLine = typeof rfqLines.$inferSelect;
export type SupplierQuote = typeof supplierQuotes.$inferSelect;

// ========== APPROVAL RULES ==========
export const approvalRules = pgTable("scm_approval_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ruleName: varchar("rule_name").notNull(),
    documentType: varchar("document_type").notNull(), // Requisition, PO
    minAmount: numeric("min_amount", { precision: 18, scale: 2 }).default("0"),
    maxAmount: numeric("max_amount", { precision: 18, scale: 2 }),
    approverId: varchar("approver_id"),
    priority: integer("priority").default(10),
    categoryFilter: varchar("category_filter").default("ALL"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertApprovalRuleSchema = createInsertSchema(approvalRules);
export type ApprovalRule = typeof approvalRules.$inferSelect;

// ========== RECEIVING (RCV) ==========
export const rcvShipmentHeaders = pgTable("rcv_shipment_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    receiptNumber: varchar("receipt_number").notNull().unique(),
    shipmentNumber: varchar("shipment_number"),
    vendorId: varchar("vendor_id"), // Supplier ID
    shippedDate: timestamp("shipped_date"),
    expectedReceiptDate: timestamp("expected_receipt_date"),
    receiptDate: timestamp("receipt_date").default(sql`now()`),
    comments: text("comments"),
    grossWeight: numeric("gross_weight"),
    netWeight: numeric("net_weight"),
    packagingCode: varchar("packaging_code"),
    waybillAirbillNumber: varchar("waybill_airbill_number"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const rcvShipmentLines = pgTable("rcv_shipment_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    shipmentHeaderId: varchar("shipment_header_id").notNull(),
    lineNum: integer("line_num"),
    categoryId: varchar("category_id"),
    quantityShipped: numeric("quantity_shipped", { precision: 18, scale: 4 }),
    quantityReceived: numeric("quantity_received", { precision: 18, scale: 4 }),
    unitOfMeasure: varchar("uom"),
    itemDescription: varchar("item_description"),
    itemId: varchar("item_id"),
    poHeaderId: varchar("po_header_id"),
    poId: varchar("po_id"), // Added for ERS
    poLineId: varchar("po_line_id"),
    poDistributionId: varchar("po_distribution_id"),
    routingHeaderId: varchar("routing_header_id"),
    packingSlip: varchar("packing_slip"),
    receiptNumber: varchar("receipt_number"), // Added for ERS
    netPrice: numeric("net_price", { precision: 18, scale: 4 }), // Added for ERS
    transactionDate: timestamp("transaction_date").default(sql`now()`), // Added for ERS
    accounted: boolean("accounted").default(false), // Added for period close
    ersFlag: boolean("ers_flag").default(false), // Added for ERS
    ersStatus: varchar("ers_status"), // Added for ERS (eg READY_FOR_ERS, INVOICED)
    ersRunAt: timestamp("ers_run_at"), // Added for ERS
    fromOrganizationId: varchar("from_organization_id"),
    toOrganizationId: varchar("to_organization_id"), // Inventory Org
    deliverToPersonId: varchar("deliver_to_person_id"),
    deliverToLocationId: varchar("deliver_to_location_id"),
    destinationTypeCode: varchar("destination_type_code").default("RECEIVING"), // RECEIVING, INVENTORY, EXPENSE
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRcvShipmentHeaderSchema = createInsertSchema(rcvShipmentHeaders);
export const insertRcvShipmentLineSchema = createInsertSchema(rcvShipmentLines);

export type RcvShipmentHeader = typeof rcvShipmentHeaders.$inferSelect;
export type RcvShipmentLine = typeof rcvShipmentLines.$inferSelect;


// ========== ACCOUNTS PAYABLE (AP) Linkages ==========
// Note: AP Tables are defined authoritative in ./ap.ts
// We only import types if needed, but do not redefine tables here.


// ========== RELATIONS ==========

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
    sites: many(supplierSites),
    purchaseOrders: many(purchaseOrders),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
    supplier: one(suppliers, {
        fields: [purchaseOrders.supplierId],
        references: [suppliers.id],
    }),
    lines: many(purchaseOrderLines),
}));

export const purchaseOrderLinesRelations = relations(purchaseOrderLines, ({ one, many }) => ({
    header: one(purchaseOrders, {
        fields: [purchaseOrderLines.poHeaderId],
        references: [purchaseOrders.id],
    }),
    distributions: many(purchaseOrderDistributions),
}));

export const purchaseOrderDistributionsRelations = relations(purchaseOrderDistributions, ({ one }) => ({
    line: one(purchaseOrderLines, {
        fields: [purchaseOrderDistributions.poLineId],
        references: [purchaseOrderLines.id],
    }),
}));

export const purchaseRequisitionsRelations = relations(purchaseRequisitions, ({ many }) => ({
    lines: many(purchaseRequisitionLines),
}));

export const rfqHeadersRelations = relations(rfqHeaders, ({ one, many }) => ({
    lines: many(rfqLines),
    quotes: many(supplierQuotes),
}));

export const rfqLinesRelations = relations(rfqLines, ({ one }) => ({
    header: one(rfqHeaders, {
        fields: [rfqLines.headerId],
        references: [rfqHeaders.id],
    }),
}));

export const supplierQuotesRelations = relations(supplierQuotes, ({ one }) => ({
    rfq: one(rfqHeaders, {
        fields: [supplierQuotes.rfqId],
        references: [rfqHeaders.id],
    }),
    supplier: one(suppliers, {
        fields: [supplierQuotes.supplierId],
        references: [suppliers.id],
    }),
}));

export const purchaseRequisitionLinesRelations = relations(purchaseRequisitionLines, ({ one }) => ({
    header: one(purchaseRequisitions, {
        fields: [purchaseRequisitionLines.requisitionId],
        references: [purchaseRequisitions.id],
    }),
}));

export const rcvShipmentHeadersRelations = relations(rcvShipmentHeaders, ({ one, many }) => ({
    lines: many(rcvShipmentLines),
}));

export const rcvShipmentLinesRelations = relations(rcvShipmentLines, ({ one }) => ({
    header: one(rcvShipmentHeaders, {
        fields: [rcvShipmentLines.shipmentHeaderId],
        references: [rcvShipmentHeaders.id],
    }),
}));

// AP relations removed to prevent conflicts and runtime errors (schema refactor)
// ========== RESERVATIONS ==========
export const inventoryReservations = pgTable("inv_reservations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    organizationId: varchar("organizationId").notNull(),
    itemId: varchar("itemId").notNull(),

    // Demand Source
    demandSourceType: varchar("demandSourceType").notNull(), // 'Sales Order', 'Work Order', 'Transfer Order'
    demandSourceHeaderId: varchar("demandSourceHeaderId").notNull(),
    demandSourceLineId: varchar("demandSourceLineId"),

    // Supply Source (Inventory)
    subinventoryId: varchar("subinventoryId"),
    locatorId: varchar("locatorId"),
    lotId: varchar("lotId"), // Maps to lotNumber usually in new schema, but sticking to ID if needed or string
    serialId: varchar("serialId"), // Maps to serialNumber

    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    uom: varchar("uom").notNull(),
    reservationType: varchar("reservationType").default("Hard"), // Hard, Soft

    createdAt: timestamp("createdAt").default(sql`now()`),
    updatedAt: timestamp("updatedAt").default(sql`now()`),
});

export const insertReservationSchema = createInsertSchema(inventoryReservations);
export type InventoryReservation = typeof inventoryReservations.$inferSelect;
export type InsertInventoryReservation = z.infer<typeof insertReservationSchema>;

// ========== CYCLE COUNTING ==========
export const cycleCountHeaders = pgTable("inv_cycle_count_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    organizationId: varchar("organization_id").notNull(),
    cycleCountName: varchar("cycle_count_name").notNull(),
    subinventoryId: varchar("subinventory_id"),
    status: varchar("status").default("Draft"), // Draft, InProgress, Completed, Cancelled
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const cycleCountEntries = pgTable("inv_cycle_count_entries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    headerId: varchar("header_id").notNull(), // FK to Headers
    itemId: varchar("item_id").notNull(),
    subinventoryId: varchar("subinventory_id").notNull(),
    locatorId: varchar("locator_id"),
    systemQuantity: numeric("system_quantity", { precision: 18, scale: 4 }).notNull(),
    countedQuantity: numeric("counted_quantity", { precision: 18, scale: 4 }),
    status: varchar("status").default("Pending"), // Pending, Counted, Adjusted
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCycleCountHeaderSchema = createInsertSchema(cycleCountHeaders);
export const insertCycleCountEntrySchema = createInsertSchema(cycleCountEntries);

export type CycleCountHeader = typeof cycleCountHeaders.$inferSelect;
export type CycleCountEntry = typeof cycleCountEntries.$inferSelect;

export const cycleCountHeadersRelations = relations(cycleCountHeaders, ({ many }) => ({
    entries: many(cycleCountEntries),
}));

export const cycleCountEntriesRelations = relations(cycleCountEntries, ({ one }) => ({
    header: one(cycleCountHeaders, {
        fields: [cycleCountEntries.headerId],
        references: [cycleCountHeaders.id],
    }),
}));

// ========== CONSIGNMENT STOCK (Oracle INV Consigned Inventory) ==========
export const scmConsignmentLines = pgTable("scm_consignment_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entInventoryOrgId: varchar("ent_inventory_org_id"),
    supplierId: varchar("supplier_id").notNull(),
    itemId: varchar("item_id").notNull(),
    subinventoryId: varchar("subinventory_id"),
    locatorId: varchar("locator_id"),
    lotNumber: varchar("lot_number"),
    quantityConsumed: numeric("quantity_consumed", { precision: 18, scale: 4 }).notNull(),
    uom: varchar("uom"),
    consumptionDate: timestamp("consumption_date").notNull(),
    unitCost: numeric("unit_cost", { precision: 18, scale: 4 }),
    billingAmount: numeric("billing_amount", { precision: 18, scale: 2 }),
    currencyCode: varchar("currency_code").default("USD"),
    billingStatus: varchar("billing_status").default("PENDING"), // PENDING, BILLED, CANCELLED
    apInvoiceId: varchar("ap_invoice_id"), // filled after AP invoice created
    billedAt: timestamp("billed_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertScmConsignmentLineSchema = createInsertSchema(scmConsignmentLines);
export type ScmConsignmentLine = typeof scmConsignmentLines.$inferSelect;
export type InsertScmConsignmentLine = z.infer<typeof insertScmConsignmentLineSchema>;

// ========== RMA — RETURN MERCHANDISE AUTHORIZATION (Oracle WMS / OM) ==========
export const scmRmaHeaders = pgTable("scm_rma_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entBusinessUnitId: varchar("ent_business_unit_id"),
    rmaNumber: varchar("rma_number").notNull().unique(),
    originalOrderId: varchar("original_order_id"), // Link to sales order or PO
    customerId: varchar("customer_id"),
    supplierId: varchar("supplier_id"),
    requestedBy: varchar("requested_by"),
    authorizationDate: timestamp("authorization_date"),
    returnReason: varchar("return_reason"), // DEFECTIVE, WRONG_ITEM, OVERSHIPPED, DAMAGED
    status: varchar("status").default("AUTHORIZED"), // AUTHORIZED, RECEIVED, INSPECTED, CLOSED, CANCELLED
    totalCreditValue: numeric("total_credit_value", { precision: 18, scale: 2 }),
    currencyCode: varchar("currency_code").default("USD"),
    creditMemoId: varchar("credit_memo_id"), // AR credit memo created on disposition
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const scmRmaLines = pgTable("scm_rma_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    rmaId: varchar("rma_id").notNull(),
    lineNumber: integer("line_number").notNull(),
    itemId: varchar("item_id").notNull(),
    itemDescription: text("item_description"),
    qtyAuthorized: numeric("qty_authorized", { precision: 18, scale: 4 }).notNull(),
    qtyReceived: numeric("qty_received", { precision: 18, scale: 4 }).default("0"),
    qtyInspected: numeric("qty_inspected", { precision: 18, scale: 4 }).default("0"),
    uom: varchar("uom"),
    unitCost: numeric("unit_cost", { precision: 18, scale: 4 }),
    disposition: varchar("disposition"), // RESTOCK, SCRAP, SUPPLIER_RETURN, REPAIR
    qcStatus: varchar("qc_status").default("PENDING"), // PENDING, PASS, FAIL
    qcNotes: text("qc_notes"),
    creditValue: numeric("credit_value", { precision: 18, scale: 2 }),
    receivedAt: timestamp("received_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertScmRmaHeaderSchema = createInsertSchema(scmRmaHeaders);
export const insertScmRmaLineSchema = createInsertSchema(scmRmaLines);
export type ScmRmaHeader = typeof scmRmaHeaders.$inferSelect;
export type ScmRmaLine = typeof scmRmaLines.$inferSelect;
export type InsertScmRmaHeader = z.infer<typeof insertScmRmaHeaderSchema>;
export type InsertScmRmaLine = z.infer<typeof insertScmRmaLineSchema>;

export const scmRmaRelations = relations(scmRmaHeaders, ({ many }) => ({
    lines: many(scmRmaLines),
}));

// ========== ASN ACKNOWLEDGEMENTS (Oracle Supplier Portal PO Acknowledgement) ==========
export const scmAsnAcknowledgements = pgTable("scm_asn_acknowledgements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    poId: varchar("po_id").notNull(),
    supplierId: varchar("supplier_id").notNull(),
    asnId: varchar("asn_id"), // FK to asn_headers if submitted
    ackStatus: varchar("ack_status").default("PENDING"), // PENDING, CONFIRMED, RESCHEDULED, REJECTED
    originalDeliveryDate: timestamp("original_delivery_date"),
    confirmedDeliveryDate: timestamp("confirmed_delivery_date"),
    rescheduleReason: text("reschedule_reason"),
    acknowledgedBy: varchar("acknowledged_by"),
    acknowledgedAt: timestamp("acknowledged_at"),
    dockPreAdvised: boolean("dock_pre_advised").default(false), // true if WMS dock scheduled
    notes: text("notes"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertScmAsnAcknowledgementSchema = createInsertSchema(scmAsnAcknowledgements);
export type ScmAsnAcknowledgement = typeof scmAsnAcknowledgements.$inferSelect;
export type InsertScmAsnAcknowledgement = z.infer<typeof insertScmAsnAcknowledgementSchema>;

