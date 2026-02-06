"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSourcingBidSchema = exports.insertSourcingRfqLineSchema = exports.insertSourcingRfqSchema = exports.sourcingBidLines = exports.sourcingBids = exports.sourcingRfqLines = exports.sourcingRfqs = exports.insertQualityEventSchema = exports.insertScorecardSchema = exports.supplierQualityEvents = exports.supplierScorecards = exports.insertAsnLineSchema = exports.insertAsnHeaderSchema = exports.asnLines = exports.asnHeaders = exports.insertContractTermSchema = exports.insertContractClauseSchema = exports.insertProcurementContractSchema = exports.contractTerms = exports.contractClauses = exports.insertSupplierDocumentSchema = exports.supplierDocuments = exports.procurementContracts = exports.insertSupplierUserIdentitySchema = exports.insertSupplierOnboardingSchema = exports.supplierUserIdentities = exports.supplierOnboardingRequests = exports.insertPurchaseRequisitionLineSchema = exports.insertPurchaseRequisitionSchema = exports.purchaseRequisitionLines = exports.purchaseRequisitions = exports.insertInventoryLotSerialSchema = exports.inventoryLotSerial = exports.insertInventoryOnHandSchema = exports.inventoryOnHandQuantities = exports.insertInventoryTransactionSchema = exports.inventoryTransactions = exports.insertInventorySchema = exports.inventoryLocators = exports.inventorySubinventories = exports.inventory = exports.inventoryOrganizations = exports.insertPurchaseOrderLineSchema = exports.insertPurchaseOrderSchema = exports.purchaseOrderLines = exports.purchaseOrders = exports.insertSupplierSiteSchema = exports.supplierSites = exports.insertSupplierSchema = exports.suppliers = void 0;
exports.rcvShipmentLinesRelations = exports.rcvShipmentHeadersRelations = exports.purchaseRequisitionLinesRelations = exports.supplierQuotesRelations = exports.rfqLinesRelations = exports.rfqHeadersRelations = exports.purchaseRequisitionsRelations = exports.purchaseOrderDistributionsRelations = exports.purchaseOrderLinesRelations = exports.purchaseOrdersRelations = exports.suppliersRelations = exports.insertApPaymentSchema = exports.insertApInvoiceLineSchema = exports.insertApInvoiceSchema = exports.apPayments = exports.apInvoiceLines = exports.apInvoices = exports.insertRcvShipmentLineSchema = exports.insertRcvShipmentHeaderSchema = exports.rcvShipmentLines = exports.rcvShipmentHeaders = exports.insertApprovalRuleSchema = exports.approvalRules = exports.insertSupplierQuoteSchema = exports.insertRfqLineSchema = exports.insertRfqHeaderSchema = exports.supplierQuotes = exports.rfqLines = exports.rfqHeaders = exports.insertPurchaseOrderDistributionSchema = exports.purchaseOrderDistributions = exports.insertWmsWaveTemplateSchema = exports.wmsWaveTemplates = exports.insertWmsHandlingUnitTypeSchema = exports.wmsHandlingUnitTypes = exports.insertWmsStrategySchema = exports.wmsStrategies = exports.insertWmsDockAppointmentSchema = exports.wmsDockAppointments = exports.insertWmsTaskSchema = exports.insertWmsWaveSchema = exports.insertWmsLpnContentSchema = exports.insertWmsHandlingUnitSchema = exports.insertWmsZoneSchema = exports.wmsTasks = exports.wmsWaves = exports.wmsLpnContents = exports.wmsHandlingUnits = exports.wmsZones = exports.insertSourcingBidLineSchema = void 0;
exports.insertReservationSchema = exports.inventoryReservations = exports.apPaymentsRelations = exports.apInvoiceLinesRelations = exports.apInvoicesRelations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const parties_1 = require("./parties");
// ========== SUPPLY CHAIN MODULE ==========
exports.suppliers = (0, pg_core_1.pgTable)("scm_suppliers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    email: (0, pg_core_1.varchar)("email"),
    phone: (0, pg_core_1.varchar)("phone"),
    address: (0, pg_core_1.text)("address"),
    status: (0, pg_core_1.varchar)("status").default("active"),
    // TCA Linkage
    partyId: (0, pg_core_1.varchar)("party_id").references(() => parties_1.hzParties.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertSupplierSchema = (0, drizzle_zod_1.createInsertSchema)(exports.suppliers).extend({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
exports.supplierSites = (0, pg_core_1.pgTable)("scm_supplier_sites", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(), // FK to scm_suppliers
    siteName: (0, pg_core_1.varchar)("site_name").notNull(), // e.g., "HEADQUARTERS", "NYC-DISTRIBUTION"
    address: (0, pg_core_1.text)("address"),
    isPurchasing: (0, pg_core_1.varchar)("is_purchasing").default("true"), // "true" or "false"
    isPay: (0, pg_core_1.varchar)("is_pay").default("true"), // "true" or "false"
    status: (0, pg_core_1.varchar)("status").default("active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertSupplierSiteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.supplierSites).extend({
    supplierId: zod_1.z.string().min(1),
    siteName: zod_1.z.string().min(1),
    address: zod_1.z.string().optional(),
    isPurchasing: zod_1.z.string().optional(),
    isPay: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
exports.purchaseOrders = (0, pg_core_1.pgTable)("purchase_orders", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    orderNumber: (0, pg_core_1.varchar)("order_number").notNull().unique(),
    supplierId: (0, pg_core_1.varchar)("supplier_id"),
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 18, scale: 2 }),
    status: (0, pg_core_1.varchar)("status").default("draft"),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    complianceStatus: (0, pg_core_1.varchar)("compliance_status").default("COMPLIANT"), // COMPLIANT, NON_COMPLIANT
    complianceReason: (0, pg_core_1.text)("compliance_reason"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.purchaseOrderLines = (0, pg_core_1.pgTable)("purchase_order_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    poHeaderId: (0, pg_core_1.varchar)("po_header_id").notNull(), // FK to purchaseOrders
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    itemId: (0, pg_core_1.varchar)("item_id"), // FK to inventory optional
    description: (0, pg_core_1.varchar)("description"),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    unitPrice: (0, pg_core_1.numeric)("unit_price", { precision: 18, scale: 4 }).notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    projectId: (0, pg_core_1.varchar)("project_id"), // Linked to ppm_projects
    taskId: (0, pg_core_1.varchar)("task_id"), // Linked to ppm_tasks
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPurchaseOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.purchaseOrders).extend({
    orderNumber: zod_1.z.string().min(1),
    supplierId: zod_1.z.string().optional(),
    totalAmount: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    dueDate: zod_1.z.date().optional().nullable(),
});
exports.insertPurchaseOrderLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.purchaseOrderLines).extend({
    poHeaderId: zod_1.z.string().min(1),
    lineNumber: zod_1.z.number(),
    quantity: zod_1.z.number(),
    unitPrice: zod_1.z.number(),
    amount: zod_1.z.number(),
    projectId: zod_1.z.string().optional(),
    taskId: zod_1.z.string().optional(),
});
// 0. Inventory Organizations (Warehouse)
exports.inventoryOrganizations = (0, pg_core_1.pgTable)("inv_organizations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("createdAt").default((0, drizzle_orm_1.sql) `now()`),
});
exports.inventory = (0, pg_core_1.pgTable)("inv_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    itemNumber: (0, pg_core_1.varchar)("itemNumber").notNull(),
    description: (0, pg_core_1.varchar)("description"),
    primaryUomCode: (0, pg_core_1.varchar)("primaryUomCode"),
    organizationId: (0, pg_core_1.varchar)("organizationId"), // FK to inv_organizations
    quantityOnHand: (0, pg_core_1.numeric)("quantityOnHand", { precision: 18, scale: 4 }).default("0"),
    minQuantity: (0, pg_core_1.numeric)("min_quantity", { precision: 18, scale: 4 }).default("0"),
    maxQuantity: (0, pg_core_1.numeric)("max_quantity", { precision: 18, scale: 4 }).default("0"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").default((0, drizzle_orm_1.sql) `now()`),
});
exports.inventorySubinventories = (0, pg_core_1.pgTable)("inv_subinventories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    organizationId: (0, pg_core_1.varchar)("organizationId"),
    code: (0, pg_core_1.varchar)("code").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("createdAt").default((0, drizzle_orm_1.sql) `now()`),
});
exports.inventoryLocators = (0, pg_core_1.pgTable)("inv_locators", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    subinventoryId: (0, pg_core_1.varchar)("subinventoryId"),
    code: (0, pg_core_1.varchar)("code").notNull(),
    zoneId: (0, pg_core_1.varchar)("zone_id"), // Added for WMS
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("createdAt").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertInventorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventory).extend({
    itemName: zod_1.z.string().min(1),
    sku: zod_1.z.string().optional(),
    quantity: zod_1.z.number().optional(),
    reorderLevel: zod_1.z.number().optional(),
    location: zod_1.z.string().optional(),
});
exports.inventoryTransactions = (0, pg_core_1.pgTable)("inv_material_transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    // organizationId: varchar("organizationId"), 
    itemId: (0, pg_core_1.varchar)("itemId").notNull(),
    transactionType: (0, pg_core_1.varchar)("transactionType").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    uom: (0, pg_core_1.varchar)("uom"),
    subinventoryId: (0, pg_core_1.varchar)("subinventoryId"),
    locatorId: (0, pg_core_1.varchar)("locatorId"),
    transactionDate: (0, pg_core_1.timestamp)("transactionDate").default((0, drizzle_orm_1.sql) `now()`),
    sourceDocumentType: (0, pg_core_1.varchar)("sourceDocumentType"),
    sourceDocumentId: (0, pg_core_1.varchar)("sourceDocumentId"),
    reference: (0, pg_core_1.varchar)("reference"),
    // DISABLING MISSING COLUMNS TO UNBLOCK DEPLOY
    // projectId: varchar("project_id"), // Linked to ppm_projects
    // taskId: varchar("task_id"), // Linked to ppm_tasks
    // cost: numeric("cost", { precision: 18, scale: 4 }),
    createdAt: (0, pg_core_1.timestamp)("createdAt").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertInventoryTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventoryTransactions).extend({
    inventoryId: zod_1.z.string().min(1),
    transactionType: zod_1.z.string().min(1),
    quantity: zod_1.z.number(),
    projectId: zod_1.z.string().optional(),
    taskId: zod_1.z.string().optional(),
    referenceNumber: zod_1.z.string().optional(),
    cost: zod_1.z.number().optional(),
});
exports.inventoryOnHandQuantities = (0, pg_core_1.pgTable)("inv_on_hand_quantities", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    organizationId: (0, pg_core_1.varchar)("organizationId").notNull(),
    itemId: (0, pg_core_1.varchar)("itemId").notNull(),
    subinventoryId: (0, pg_core_1.varchar)("subinventoryId").notNull(),
    locatorId: (0, pg_core_1.varchar)("locatorId"),
    lotNumber: (0, pg_core_1.varchar)("lot_number"),
    serialNumber: (0, pg_core_1.varchar)("serial_number"),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).default("0").notNull(),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertInventoryOnHandSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventoryOnHandQuantities);
exports.inventoryLotSerial = (0, pg_core_1.pgTable)("inventory_lot_serial", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    inventoryId: (0, pg_core_1.varchar)("inventory_id").notNull(),
    lotNumber: (0, pg_core_1.varchar)("lot_number"),
    serialNumber: (0, pg_core_1.varchar)("serial_number"),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).default("0"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"), // ACTIVE, QUARANTINED, EXPIRED, RETIRED
    expirationDate: (0, pg_core_1.timestamp)("expiration_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertInventoryLotSerialSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventoryLotSerial).extend({
    inventoryId: zod_1.z.string().min(1),
    lotNumber: zod_1.z.string().optional(),
    serialNumber: zod_1.z.string().optional(),
    quantity: zod_1.z.number().optional(),
    status: zod_1.z.string().optional(),
});
exports.purchaseRequisitions = (0, pg_core_1.pgTable)("purchase_requisitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    requisitionNumber: (0, pg_core_1.varchar)("requisition_number").notNull().unique(),
    requesterId: (0, pg_core_1.varchar)("requester_id"),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("draft"), // DRAFT, PENDING, APPROVED, REJECTED, CLOSED
    sourceModule: (0, pg_core_1.varchar)("source_module").default("SCM"), // SCM, MAINTENANCE, PROJECT
    sourceId: (0, pg_core_1.varchar)("source_id"), // e.g., work_order_id
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.purchaseRequisitionLines = (0, pg_core_1.pgTable)("purchase_requisition_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    requisitionId: (0, pg_core_1.varchar)("requisition_id").notNull(),
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    itemId: (0, pg_core_1.varchar)("item_id"), // NULL for non-catalog items
    itemDescription: (0, pg_core_1.text)("item_description").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    unitOfMeasure: (0, pg_core_1.varchar)("unit_of_measure"),
    estimatedPrice: (0, pg_core_1.numeric)("estimated_price", { precision: 18, scale: 4 }),
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // PENDING, PO_CREATED, CANCELLED
    needByDate: (0, pg_core_1.timestamp)("need_by_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPurchaseRequisitionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.purchaseRequisitions);
exports.insertPurchaseRequisitionLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.purchaseRequisitionLines);
// ========== SUPPLIER ONBOARDING & PORTAL IDENTITY ==========
exports.supplierOnboardingRequests = (0, pg_core_1.pgTable)("supplier_onboarding_requests", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    companyName: (0, pg_core_1.varchar)("company_name").notNull(),
    taxId: (0, pg_core_1.varchar)("tax_id").notNull(),
    contactEmail: (0, pg_core_1.varchar)("contact_email").notNull(),
    phone: (0, pg_core_1.varchar)("phone"),
    businessClassification: (0, pg_core_1.varchar)("business_classification"),
    status: (0, pg_core_1.varchar)("status").default("PENDING"),
    notes: (0, pg_core_1.text)("notes"),
    submittedAt: (0, pg_core_1.timestamp)("submitted_at").default((0, drizzle_orm_1.sql) `now()`),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at"),
    reviewerId: (0, pg_core_1.varchar)("reviewer_id"),
    bankAccountName: (0, pg_core_1.varchar)("bank_account_name"),
    bankAccountNumber: (0, pg_core_1.varchar)("bank_account_number"),
    bankRoutingNumber: (0, pg_core_1.varchar)("bank_routing_number"),
});
exports.supplierUserIdentities = (0, pg_core_1.pgTable)("supplier_user_identities", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(),
    portalToken: (0, pg_core_1.varchar)("portal_token").unique(),
    role: (0, pg_core_1.varchar)("role").default("ADMIN"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertSupplierOnboardingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.supplierOnboardingRequests);
exports.insertSupplierUserIdentitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.supplierUserIdentities);
// ========== PROCUREMENT CONTRACTS & COMPLIANCE ==========
exports.procurementContracts = (0, pg_core_1.pgTable)("procurement_contracts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(),
    contractNumber: (0, pg_core_1.varchar)("contract_number").notNull().unique(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, ACTIVE, EXPIRED, CANCELLED
    startDate: (0, pg_core_1.timestamp)("start_date"),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    totalAmountLimit: (0, pg_core_1.numeric)("total_amount_limit", { precision: 18, scale: 2 }),
    paymentTerms: (0, pg_core_1.varchar)("payment_terms"),
    esignStatus: (0, pg_core_1.varchar)("esign_status").default("NOT_STARTED"), // NOT_STARTED, PENDING, SIGNED, DECLINED
    esignEnvelopeId: (0, pg_core_1.varchar)("esign_envelope_id"),
    pdfFilePath: (0, pg_core_1.varchar)("pdf_file_path"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.supplierDocuments = (0, pg_core_1.pgTable)("scm_supplier_documents", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(),
    documentType: (0, pg_core_1.varchar)("document_type").notNull(), // W-9, INSURANCE, CERTIFICATION, OTHER
    fileName: (0, pg_core_1.varchar)("file_name").notNull(),
    filePath: (0, pg_core_1.varchar)("file_path").notNull(),
    expiryDate: (0, pg_core_1.timestamp)("expiry_date"),
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"), // ACTIVE, EXPIRED, ARCHIVED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertSupplierDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.supplierDocuments);
exports.contractClauses = (0, pg_core_1.pgTable)("contract_clauses", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    title: (0, pg_core_1.varchar)("title").notNull(),
    clauseText: (0, pg_core_1.text)("clause_text").notNull(),
    category: (0, pg_core_1.varchar)("category").notNull(), // LEGAL, PAYMENT, TERMINATION, COMPLIANCE
    isMandatory: (0, pg_core_1.varchar)("is_mandatory").default("false"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.contractTerms = (0, pg_core_1.pgTable)("contract_terms", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(),
    clauseId: (0, pg_core_1.varchar)("clause_id").notNull(),
    amendedText: (0, pg_core_1.text)("amended_text"), // Overrides standard library text
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertProcurementContractSchema = (0, drizzle_zod_1.createInsertSchema)(exports.procurementContracts);
exports.insertContractClauseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contractClauses);
exports.insertContractTermSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contractTerms);
// ========== ASN (ADVANCE SHIPMENT NOTICE) ==========
exports.asnHeaders = (0, pg_core_1.pgTable)("asn_headers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    asnNumber: (0, pg_core_1.varchar)("asn_number").notNull().unique(),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(),
    poId: (0, pg_core_1.varchar)("po_id").notNull(), // Link to purchaseOrders
    shipmentNumber: (0, pg_core_1.varchar)("shipment_number"),
    shippedDate: (0, pg_core_1.timestamp)("shipped_date"),
    expectedArrivalDate: (0, pg_core_1.timestamp)("expected_arrival_date"),
    carrier: (0, pg_core_1.varchar)("carrier"),
    trackingNumber: (0, pg_core_1.varchar)("tracking_number"),
    status: (0, pg_core_1.varchar)("status").default("SHIPPED"), // SHIPPED, DELIVERED, RECEIVED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.asnLines = (0, pg_core_1.pgTable)("asn_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    asnId: (0, pg_core_1.varchar)("asn_id").notNull(),
    poLineId: (0, pg_core_1.varchar)("po_line_id").notNull(), // Link to purchaseOrderLines
    itemId: (0, pg_core_1.varchar)("item_id"),
    quantityShipped: (0, pg_core_1.numeric)("quantity_shipped", { precision: 18, scale: 4 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertAsnHeaderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.asnHeaders).extend({
    asnNumber: zod_1.z.string().min(1),
    supplierId: zod_1.z.string().min(1),
    poId: zod_1.z.string().min(1),
    shipmentNumber: zod_1.z.string().optional(),
    shippedDate: zod_1.z.string().optional(), // Receive as string from JSON
    expectedArrivalDate: zod_1.z.string().optional(),
    carrier: zod_1.z.string().optional(),
    trackingNumber: zod_1.z.string().optional(),
});
exports.insertAsnLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.asnLines).extend({
    asnId: zod_1.z.string().min(1),
    poLineId: zod_1.z.string().min(1),
    quantityShipped: zod_1.z.number(),
});
// ========== SUPPLIER PERFORMANCE (SCORECARDS) ==========
exports.supplierScorecards = (0, pg_core_1.pgTable)("supplier_scorecards", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(),
    period: (0, pg_core_1.varchar)("period").notNull(), // e.g., "2025-Q1", "2025-01"
    overallScore: (0, pg_core_1.integer)("overall_score").default(0),
    deliveryScore: (0, pg_core_1.integer)("delivery_score").default(0),
    qualityScore: (0, pg_core_1.integer)("quality_score").default(0),
    responsivenessScore: (0, pg_core_1.integer)("responsiveness_score").default(0),
    generatedAt: (0, pg_core_1.timestamp)("generated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.supplierQualityEvents = (0, pg_core_1.pgTable)("supplier_quality_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(),
    eventId: (0, pg_core_1.varchar)("event_id"), // Reference to external ID if needed
    type: (0, pg_core_1.varchar)("type").notNull(), // DEFECT, DELAY, NON_COMPLIANCE
    severity: (0, pg_core_1.varchar)("severity").default("MEDIUM"), // LOW, MEDIUM, CRITICAL
    description: (0, pg_core_1.text)("description"),
    eventDate: (0, pg_core_1.timestamp)("event_date").default((0, drizzle_orm_1.sql) `now()`),
    resolved: (0, pg_core_1.boolean)("resolved").default(false),
});
exports.insertScorecardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.supplierScorecards);
exports.insertQualityEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.supplierQualityEvents);
// ========== NEGOTIATION & SOURCING (RFQ & BIDS) ==========
exports.sourcingRfqs = (0, pg_core_1.pgTable)("scm_sourcing_rfqs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    rfqNumber: (0, pg_core_1.varchar)("rfq_number").notNull().unique(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, PUBLISHED, EVALUATING, AWARDED, CLOSED
    closeDate: (0, pg_core_1.timestamp)("close_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.sourcingRfqLines = (0, pg_core_1.pgTable)("scm_sourcing_rfq_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    rfqId: (0, pg_core_1.varchar)("rfq_id").notNull(),
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    itemDescription: (0, pg_core_1.text)("item_description").notNull(),
    targetQuantity: (0, pg_core_1.numeric)("target_quantity", { precision: 18, scale: 4 }).notNull(),
    unitOfMeasure: (0, pg_core_1.varchar)("uom"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.sourcingBids = (0, pg_core_1.pgTable)("scm_sourcing_bids", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    rfqId: (0, pg_core_1.varchar)("rfq_id").notNull(),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(),
    bidStatus: (0, pg_core_1.varchar)("bid_status").default("DRAFT"), // DRAFT, SUBMITTED, WITHDRAWN
    submissionDate: (0, pg_core_1.timestamp)("submission_date"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.sourcingBidLines = (0, pg_core_1.pgTable)("scm_sourcing_bid_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bidId: (0, pg_core_1.varchar)("bid_id").notNull(),
    rfqLineId: (0, pg_core_1.varchar)("rfq_line_id").notNull(),
    offeredPrice: (0, pg_core_1.numeric)("offered_price", { precision: 18, scale: 4 }).notNull(),
    offeredQuantity: (0, pg_core_1.numeric)("offered_quantity", { precision: 18, scale: 4 }).notNull(),
    supplierLeadTime: (0, pg_core_1.integer)("supplier_lead_time"), // in days
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertSourcingRfqSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sourcingRfqs);
exports.insertSourcingRfqLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sourcingRfqLines);
exports.insertSourcingBidSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sourcingBids);
exports.insertSourcingBidLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sourcingBidLines);
// ========== WAREHOUSE MANAGEMENT SYSTEM (WMS) ==========
// 1. Zones (Logical Grouping of Locators)
exports.wmsZones = (0, pg_core_1.pgTable)("wms_zones", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    warehouseId: (0, pg_core_1.varchar)("warehouse_id").notNull(), // Inventory Organization ID
    zoneCode: (0, pg_core_1.varchar)("zone_code").notNull(),
    zoneName: (0, pg_core_1.varchar)("zone_name").notNull(),
    zoneType: (0, pg_core_1.varchar)("zone_type").default("STORAGE"), // STORAGE, RECEIVING, STAGING, PICKING, PACKING
    isTemperatureControlled: (0, pg_core_1.boolean)("is_temperature_controlled").default(false),
    priority: (0, pg_core_1.integer)("priority").default(0), // For directed putaway/picking
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. Handling Units (LPNs / Containers)
exports.wmsHandlingUnits = (0, pg_core_1.pgTable)("wms_handling_units", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    lpnNumber: (0, pg_core_1.varchar)("lpn_number").notNull().unique(), // License Plate Number
    warehouseId: (0, pg_core_1.varchar)("warehouse_id").notNull(),
    parentLpnId: (0, pg_core_1.varchar)("parent_lpn_id"), // Nested LPNs (Box on Pallet)
    type: (0, pg_core_1.varchar)("type").default("BOX"), // PALLET, BOX, TOTE, CONTAINER
    status: (0, pg_core_1.varchar)("status").default("ACTIVE"), // ACTIVE, SHIPPED, CONSUMED, VOID
    currentLocationId: (0, pg_core_1.varchar)("current_location_id"), // Inventory Locator ID
    weight: (0, pg_core_1.numeric)("weight", { precision: 18, scale: 4 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2.1 LPN Contents
exports.wmsLpnContents = (0, pg_core_1.pgTable)("wms_lpn_contents", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    lpnId: (0, pg_core_1.varchar)("lpn_id").notNull(), // FK to wms_handling_units
    itemId: (0, pg_core_1.varchar)("item_id").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    uom: (0, pg_core_1.varchar)("uom"),
    lotNumber: (0, pg_core_1.varchar)("lot_number"),
    serialNumber: (0, pg_core_1.varchar)("serial_number"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. WMS Waves (Outbound Release Groups)
exports.wmsWaves = (0, pg_core_1.pgTable)("wms_waves", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    waveNumber: (0, pg_core_1.varchar)("wave_number").notNull().unique(),
    warehouseId: (0, pg_core_1.varchar)("warehouse_id").notNull(),
    status: (0, pg_core_1.varchar)("status").default("PLANNED"), // PLANNED, RELEASED, PICKING, COMPLETED
    description: (0, pg_core_1.text)("description"),
    releaseDate: (0, pg_core_1.timestamp)("release_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. WMS Tasks (Execution Unit)
exports.wmsTasks = (0, pg_core_1.pgTable)("wms_tasks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    taskNumber: (0, pg_core_1.varchar)("task_number").unique(), // Auto-generated
    warehouseId: (0, pg_core_1.varchar)("warehouse_id").notNull(),
    taskType: (0, pg_core_1.varchar)("task_type").notNull(), // PICK, PUTAWAY, REPLENISH, COUNT, MOVE
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    // Source (What triggered this?)
    sourceDocType: (0, pg_core_1.varchar)("source_doc_type"), // ORDER, RECEIPT, WAVE, MANUAL
    sourceDocId: (0, pg_core_1.varchar)("source_doc_id"),
    sourceLineId: (0, pg_core_1.varchar)("source_line_id"),
    // Item Details
    itemId: (0, pg_core_1.varchar)("item_id").notNull(),
    quantityPlanned: (0, pg_core_1.numeric)("quantity_planned", { precision: 18, scale: 4 }).notNull(),
    quantityActual: (0, pg_core_1.numeric)("quantity_actual", { precision: 18, scale: 4 }),
    uom: (0, pg_core_1.varchar)("uom"),
    // Location (From -> To)
    fromLocatorId: (0, pg_core_1.varchar)("from_locator_id"),
    toLocatorId: (0, pg_core_1.varchar)("to_locator_id"),
    fromLpnId: (0, pg_core_1.varchar)("from_lpn_id"),
    toLpnId: (0, pg_core_1.varchar)("to_lpn_id"),
    // Execution
    assignedUserId: (0, pg_core_1.varchar)("assigned_user_id"),
    priority: (0, pg_core_1.integer)("priority").default(5),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertWmsZoneSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wmsZones);
exports.insertWmsHandlingUnitSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wmsHandlingUnits);
exports.insertWmsLpnContentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wmsLpnContents);
exports.insertWmsWaveSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wmsWaves);
exports.insertWmsTaskSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wmsTasks);
// 5. Dock Management (Yard)
exports.wmsDockAppointments = (0, pg_core_1.pgTable)("wms_dock_appointments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    warehouseId: (0, pg_core_1.varchar)("warehouse_id").notNull(),
    dockNumber: (0, pg_core_1.varchar)("dock_number").notNull(),
    carrier: (0, pg_core_1.varchar)("carrier").notNull(),
    appointmentTime: (0, pg_core_1.timestamp)("appointment_time").notNull(),
    durationMinutes: (0, pg_core_1.integer)("duration_minutes").default(60),
    status: (0, pg_core_1.varchar)("status").default("SCHEDULED"), // SCHEDULED, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED
    referenceNumber: (0, pg_core_1.varchar)("reference_number"), // PO or Shipment #
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertWmsDockAppointmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wmsDockAppointments);
// 6. Configurable Rules (Strategies)
exports.wmsStrategies = (0, pg_core_1.pgTable)("wms_strategies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    warehouseId: (0, pg_core_1.varchar)("warehouse_id").notNull(),
    type: (0, pg_core_1.varchar)("type").notNull(), // PICKING, PUTAWAY
    name: (0, pg_core_1.varchar)("name").notNull(), // e.g. "Standard FIFO", "Frozen LIFO"
    description: (0, pg_core_1.varchar)("description"),
    algorithm: (0, pg_core_1.varchar)("algorithm").notNull(), // FIFO, LIFO, FEFO, ZONE_BASED
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertWmsStrategySchema = (0, drizzle_zod_1.createInsertSchema)(exports.wmsStrategies);
// 7. Handling Unit Types (Master Data)
exports.wmsHandlingUnitTypes = (0, pg_core_1.pgTable)("wms_handling_unit_types", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    warehouseId: (0, pg_core_1.varchar)("warehouse_id").notNull(),
    code: (0, pg_core_1.varchar)("code").notNull(), // e.g., "PALLET-STD", "BOX-S", "BOX-M"
    description: (0, pg_core_1.varchar)("description"),
    length: (0, pg_core_1.numeric)("length"),
    width: (0, pg_core_1.numeric)("width"),
    height: (0, pg_core_1.numeric)("height"),
    maxWeight: (0, pg_core_1.numeric)("max_weight"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertWmsHandlingUnitTypeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wmsHandlingUnitTypes);
// 8. Wave Templates (Saved Criteria)
exports.wmsWaveTemplates = (0, pg_core_1.pgTable)("wms_wave_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    warehouseId: (0, pg_core_1.varchar)("warehouse_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    criteriaJson: (0, pg_core_1.text)("criteria_json").notNull(), // JSON string of criteria
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertWmsWaveTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.wmsWaveTemplates);
// ========== PO DISTRIBUTIONS ==========
exports.purchaseOrderDistributions = (0, pg_core_1.pgTable)("purchase_order_distributions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    poLineId: (0, pg_core_1.varchar)("po_line_id").notNull(), // FK to purchaseOrderLines
    distributionNumber: (0, pg_core_1.integer)("distribution_number").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    chargeAccountParams: (0, pg_core_1.text)("charge_account_params"), // JSON string
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPurchaseOrderDistributionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.purchaseOrderDistributions);
// ========== RFQ / SOURCING ==========
exports.rfqHeaders = (0, pg_core_1.pgTable)("scm_rfq_headers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    rfqNumber: (0, pg_core_1.varchar)("rfq_number").notNull().unique(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    status: (0, pg_core_1.varchar)("status").default("Draft"), // Draft, Active, Awarded, Closed
    deadline: (0, pg_core_1.timestamp)("deadline"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.rfqLines = (0, pg_core_1.pgTable)("scm_rfq_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    headerId: (0, pg_core_1.varchar)("header_id").notNull(),
    description: (0, pg_core_1.text)("description"),
    targetQuantity: (0, pg_core_1.numeric)("target_quantity", { precision: 18, scale: 2 }),
    itemId: (0, pg_core_1.varchar)("item_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.supplierQuotes = (0, pg_core_1.pgTable)("scm_supplier_quotes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    rfqId: (0, pg_core_1.varchar)("rfq_id").notNull(),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(),
    quoteAmount: (0, pg_core_1.numeric)("quote_amount", { precision: 18, scale: 2 }),
    status: (0, pg_core_1.varchar)("status").default("Submitted"), // Submitted, Awarded, Rejected
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRfqHeaderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rfqHeaders);
exports.insertRfqLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rfqLines);
exports.insertSupplierQuoteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.supplierQuotes);
// ========== APPROVAL RULES ==========
exports.approvalRules = (0, pg_core_1.pgTable)("scm_approval_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ruleName: (0, pg_core_1.varchar)("rule_name").notNull(),
    documentType: (0, pg_core_1.varchar)("document_type").notNull(), // Requisition, PO
    minAmount: (0, pg_core_1.numeric)("min_amount", { precision: 18, scale: 2 }).default("0"),
    maxAmount: (0, pg_core_1.numeric)("max_amount", { precision: 18, scale: 2 }),
    approverId: (0, pg_core_1.varchar)("approver_id"),
    priority: (0, pg_core_1.integer)("priority").default(10),
    categoryFilter: (0, pg_core_1.varchar)("category_filter").default("ALL"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertApprovalRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.approvalRules);
// ========== RECEIVING (RCV) ==========
exports.rcvShipmentHeaders = (0, pg_core_1.pgTable)("rcv_shipment_headers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    receiptNumber: (0, pg_core_1.varchar)("receipt_number").notNull().unique(),
    shipmentNumber: (0, pg_core_1.varchar)("shipment_number"),
    vendorId: (0, pg_core_1.varchar)("vendor_id"), // Supplier ID
    shippedDate: (0, pg_core_1.timestamp)("shipped_date"),
    expectedReceiptDate: (0, pg_core_1.timestamp)("expected_receipt_date"),
    receiptDate: (0, pg_core_1.timestamp)("receipt_date").default((0, drizzle_orm_1.sql) `now()`),
    comments: (0, pg_core_1.text)("comments"),
    grossWeight: (0, pg_core_1.numeric)("gross_weight"),
    netWeight: (0, pg_core_1.numeric)("net_weight"),
    packagingCode: (0, pg_core_1.varchar)("packaging_code"),
    waybillAirbillNumber: (0, pg_core_1.varchar)("waybill_airbill_number"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.rcvShipmentLines = (0, pg_core_1.pgTable)("rcv_shipment_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    shipmentHeaderId: (0, pg_core_1.varchar)("shipment_header_id").notNull(),
    lineNum: (0, pg_core_1.integer)("line_num"),
    categoryId: (0, pg_core_1.varchar)("category_id"),
    quantityShipped: (0, pg_core_1.numeric)("quantity_shipped", { precision: 18, scale: 4 }),
    quantityReceived: (0, pg_core_1.numeric)("quantity_received", { precision: 18, scale: 4 }),
    unitOfMeasure: (0, pg_core_1.varchar)("uom"),
    itemDescription: (0, pg_core_1.varchar)("item_description"),
    itemId: (0, pg_core_1.varchar)("item_id"),
    poHeaderId: (0, pg_core_1.varchar)("po_header_id"),
    poLineId: (0, pg_core_1.varchar)("po_line_id"),
    poDistributionId: (0, pg_core_1.varchar)("po_distribution_id"),
    routingHeaderId: (0, pg_core_1.varchar)("routing_header_id"),
    packingSlip: (0, pg_core_1.varchar)("packing_slip"),
    fromOrganizationId: (0, pg_core_1.varchar)("from_organization_id"),
    toOrganizationId: (0, pg_core_1.varchar)("to_organization_id"), // Inventory Org
    deliverToPersonId: (0, pg_core_1.varchar)("deliver_to_person_id"),
    deliverToLocationId: (0, pg_core_1.varchar)("deliver_to_location_id"),
    destinationTypeCode: (0, pg_core_1.varchar)("destination_type_code").default("RECEIVING"), // RECEIVING, INVENTORY, EXPENSE
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRcvShipmentHeaderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rcvShipmentHeaders);
exports.insertRcvShipmentLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rcvShipmentLines);
// ========== ACCOUNTS PAYABLE (AP) ==========
exports.apInvoices = (0, pg_core_1.pgTable)("ap_invoices", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    invoiceNumber: (0, pg_core_1.varchar)("invoice_number").notNull(),
    supplierId: (0, pg_core_1.varchar)("supplier_id").notNull(),
    siteId: (0, pg_core_1.varchar)("site_id"), // Supplier Site
    purchaseOrderId: (0, pg_core_1.varchar)("purchase_order_id"), // Optional Match
    invoiceDate: (0, pg_core_1.timestamp)("invoice_date").notNull(),
    dueDate: (0, pg_core_1.timestamp)("due_date"), // Calculated from Terms
    paymentTerms: (0, pg_core_1.varchar)("payment_terms"), // "Net 30", etc.
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    currencyCode: (0, pg_core_1.varchar)("currency_code").default("USD"),
    status: (0, pg_core_1.varchar)("status").default("Draft"), // Draft, Validated, Approved, Cancelled, Paid
    accountingStatus: (0, pg_core_1.varchar)("accounting_status").default("Unaccounted"), // Unaccounted, Accounted
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.apInvoiceLines = (0, pg_core_1.pgTable)("ap_invoice_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    invoiceId: (0, pg_core_1.varchar)("invoice_id").notNull(),
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    lineType: (0, pg_core_1.varchar)("line_type").default("ITEM"), // ITEM, TAX, FREIGHT
    description: (0, pg_core_1.text)("description"),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    poLineId: (0, pg_core_1.varchar)("po_line_id"), // Match to PO Line
    rcvTransactionId: (0, pg_core_1.varchar)("rcv_transaction_id"), // Match to Receipt
    distCodeCombinationId: (0, pg_core_1.varchar)("dist_code_combination_id"), // GL Account
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.apPayments = (0, pg_core_1.pgTable)("ap_payments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    paymentNumber: (0, pg_core_1.varchar)("payment_number").notNull().unique(),
    invoiceId: (0, pg_core_1.varchar)("invoice_id").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    currencyCode: (0, pg_core_1.varchar)("currency_code").default("USD"),
    paymentDate: (0, pg_core_1.timestamp)("payment_date").default((0, drizzle_orm_1.sql) `now()`),
    paymentMethod: (0, pg_core_1.varchar)("payment_method").default("CHECK"), // CHECK, EFT, WIRE
    status: (0, pg_core_1.varchar)("status").default("ISSUED"), // ISSUED, CLEARED, VOID
    bankAccountId: (0, pg_core_1.varchar)("bank_account_id"), // Internal Bank Account
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertApInvoiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apInvoices);
exports.insertApInvoiceLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apInvoiceLines);
exports.insertApPaymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apPayments);
// ========== RELATIONS ==========
exports.suppliersRelations = (0, drizzle_orm_1.relations)(exports.suppliers, ({ one, many }) => ({
    sites: many(exports.supplierSites),
    purchaseOrders: many(exports.purchaseOrders),
}));
exports.purchaseOrdersRelations = (0, drizzle_orm_1.relations)(exports.purchaseOrders, ({ one, many }) => ({
    supplier: one(exports.suppliers, {
        fields: [exports.purchaseOrders.supplierId],
        references: [exports.suppliers.id],
    }),
    lines: many(exports.purchaseOrderLines),
}));
exports.purchaseOrderLinesRelations = (0, drizzle_orm_1.relations)(exports.purchaseOrderLines, ({ one, many }) => ({
    header: one(exports.purchaseOrders, {
        fields: [exports.purchaseOrderLines.poHeaderId],
        references: [exports.purchaseOrders.id],
    }),
    distributions: many(exports.purchaseOrderDistributions),
}));
exports.purchaseOrderDistributionsRelations = (0, drizzle_orm_1.relations)(exports.purchaseOrderDistributions, ({ one }) => ({
    line: one(exports.purchaseOrderLines, {
        fields: [exports.purchaseOrderDistributions.poLineId],
        references: [exports.purchaseOrderLines.id],
    }),
}));
exports.purchaseRequisitionsRelations = (0, drizzle_orm_1.relations)(exports.purchaseRequisitions, ({ many }) => ({
    lines: many(exports.purchaseRequisitionLines),
}));
exports.rfqHeadersRelations = (0, drizzle_orm_1.relations)(exports.rfqHeaders, ({ one, many }) => ({
    lines: many(exports.rfqLines),
    quotes: many(exports.supplierQuotes),
}));
exports.rfqLinesRelations = (0, drizzle_orm_1.relations)(exports.rfqLines, ({ one }) => ({
    header: one(exports.rfqHeaders, {
        fields: [exports.rfqLines.headerId],
        references: [exports.rfqHeaders.id],
    }),
}));
exports.supplierQuotesRelations = (0, drizzle_orm_1.relations)(exports.supplierQuotes, ({ one }) => ({
    rfq: one(exports.rfqHeaders, {
        fields: [exports.supplierQuotes.rfqId],
        references: [exports.rfqHeaders.id],
    }),
    supplier: one(exports.suppliers, {
        fields: [exports.supplierQuotes.supplierId],
        references: [exports.suppliers.id],
    }),
}));
exports.purchaseRequisitionLinesRelations = (0, drizzle_orm_1.relations)(exports.purchaseRequisitionLines, ({ one }) => ({
    header: one(exports.purchaseRequisitions, {
        fields: [exports.purchaseRequisitionLines.requisitionId],
        references: [exports.purchaseRequisitions.id],
    }),
}));
exports.rcvShipmentHeadersRelations = (0, drizzle_orm_1.relations)(exports.rcvShipmentHeaders, ({ one, many }) => ({
    lines: many(exports.rcvShipmentLines),
}));
exports.rcvShipmentLinesRelations = (0, drizzle_orm_1.relations)(exports.rcvShipmentLines, ({ one }) => ({
    header: one(exports.rcvShipmentHeaders, {
        fields: [exports.rcvShipmentLines.shipmentHeaderId],
        references: [exports.rcvShipmentHeaders.id],
    }),
}));
exports.apInvoicesRelations = (0, drizzle_orm_1.relations)(exports.apInvoices, ({ one, many }) => ({
    lines: many(exports.apInvoiceLines),
    payments: many(exports.apPayments),
    supplier: one(exports.suppliers, {
        fields: [exports.apInvoices.supplierId],
        references: [exports.suppliers.id],
    }),
}));
exports.apInvoiceLinesRelations = (0, drizzle_orm_1.relations)(exports.apInvoiceLines, ({ one }) => ({
    invoice: one(exports.apInvoices, {
        fields: [exports.apInvoiceLines.invoiceId],
        references: [exports.apInvoices.id],
    }),
}));
exports.apPaymentsRelations = (0, drizzle_orm_1.relations)(exports.apPayments, ({ one }) => ({
    invoice: one(exports.apInvoices, {
        fields: [exports.apPayments.invoiceId],
        references: [exports.apInvoices.id],
    }),
}));
// ========== RESERVATIONS ==========
exports.inventoryReservations = (0, pg_core_1.pgTable)("inv_reservations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    organizationId: (0, pg_core_1.varchar)("organizationId").notNull(),
    itemId: (0, pg_core_1.varchar)("itemId").notNull(),
    // Demand Source
    demandSourceType: (0, pg_core_1.varchar)("demandSourceType").notNull(), // 'Sales Order', 'Work Order', 'Transfer Order'
    demandSourceHeaderId: (0, pg_core_1.varchar)("demandSourceHeaderId").notNull(),
    demandSourceLineId: (0, pg_core_1.varchar)("demandSourceLineId"),
    // Supply Source (Inventory)
    subinventoryId: (0, pg_core_1.varchar)("subinventoryId"),
    locatorId: (0, pg_core_1.varchar)("locatorId"),
    lotId: (0, pg_core_1.varchar)("lotId"), // Maps to lotNumber usually in new schema, but sticking to ID if needed or string
    serialId: (0, pg_core_1.varchar)("serialId"), // Maps to serialNumber
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 4 }).notNull(),
    uom: (0, pg_core_1.varchar)("uom").notNull(),
    reservationType: (0, pg_core_1.varchar)("reservationType").default("Hard"), // Hard, Soft
    createdAt: (0, pg_core_1.timestamp)("createdAt").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertReservationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inventoryReservations);
//# sourceMappingURL=scm.js.map