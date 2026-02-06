"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertApPrepayApplicationSchema = exports.apPrepayApplications = exports.insertApWhtRateSchema = exports.insertApWhtGroupSchema = exports.apWhtRates = exports.apWhtGroups = exports.insertApPeriodStatusSchema = exports.apPeriodStatuses = exports.insertApAuditLogSchema = exports.apAuditLogs = exports.insertApApprovalSchema = exports.apApprovals = exports.apInvoicePayments = exports.insertApPaymentSchema = exports.insertApDistributionSetLineSchema = exports.apDistributionSetLines = exports.insertApDistributionSetSchema = exports.apDistributionSets = exports.insertApSystemParametersSchema = exports.apSystemParameters = exports.insertApHoldSchema = exports.apHolds = exports.apPayments = exports.insertApPaymentBatchSchema = exports.apPaymentBatches = exports.insertApInvoiceDistributionSchema = exports.apInvoiceDistributions = exports.insertApInvoiceLineSchema = exports.apInvoiceLines = exports.insertApInvoiceSchema = exports.apInvoices = exports.insertApSupplierSiteSchema = exports.apSupplierSites = exports.insertApSupplierSchema = exports.apSuppliers = void 0;
// Accounts Payable (AP) schema definitions for Oracle Fusion parity
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// 1. Supplier Entity (Parent)
exports.apSuppliers = (0, pg_core_1.pgTable)("ap_suppliers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    supplierNumber: (0, pg_core_1.varchar)("supplier_number", { length: 50 }), // Business Key
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    taxOrganizationType: (0, pg_core_1.varchar)("tax_organization_type", { length: 50 }), // Corporation, Partnership, etc.
    // Legacy fields (Deprecated - moved to Sites)
    taxId: (0, pg_core_1.varchar)("tax_id", { length: 100 }),
    address: (0, pg_core_1.text)("address"),
    paymentTermsId: (0, pg_core_1.varchar)("payment_terms_id", { length: 50 }),
    // Controls
    enabledFlag: (0, pg_core_1.boolean)("enabled_flag").default(true),
    supplierType: (0, pg_core_1.varchar)("supplier_type", { length: 50 }).default("STANDARD"), // STANDARD, ONE_TIME
    creditHold: (0, pg_core_1.boolean)("credit_hold").default(false),
    allowWithholdingTax: (0, pg_core_1.boolean)("allow_withholding_tax").default(false),
    withholdingTaxGroupId: (0, pg_core_1.varchar)("withholding_tax_group_id", { length: 50 }),
    // Risk & Compliance
    riskCategory: (0, pg_core_1.varchar)("risk_category", { length: 50 }).default("Low"),
    riskScore: (0, pg_core_1.integer)("risk_score"),
    // Contact
    country: (0, pg_core_1.varchar)("country", { length: 100 }),
    contactEmail: (0, pg_core_1.varchar)("contact_email", { length: 255 }),
    parentSupplierId: (0, pg_core_1.integer)("parent_supplier_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
exports.insertApSupplierSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apSuppliers);
// 1.1 Supplier Sites (Child - New V2 Schema)
exports.apSupplierSites = (0, pg_core_1.pgTable)("ap_supplier_sites", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    supplierId: (0, pg_core_1.integer)("supplier_id").notNull(), // Parent
    orgId: (0, pg_core_1.integer)("org_id").default(1), // Business Unit assignment
    siteName: (0, pg_core_1.varchar)("site_name", { length: 100 }).notNull().default("OFFICE"), // e.g. HEADQUARTERS, PAY_ONLY
    address: (0, pg_core_1.text)("address"),
    taxId: (0, pg_core_1.varchar)("tax_id", { length: 100 }), // Override parent
    paymentTermsId: (0, pg_core_1.varchar)("payment_terms_id", { length: 50 }), // Override parent
    isPaySite: (0, pg_core_1.boolean)("is_pay_site").default(true),
    isPurchasingSite: (0, pg_core_1.boolean)("is_purchasing_site").default(true),
    // Banking Parity
    iban: (0, pg_core_1.varchar)("iban", { length: 50 }),
    swiftCode: (0, pg_core_1.varchar)("swift_code", { length: 20 }),
    bankAccountName: (0, pg_core_1.varchar)("bank_account_name", { length: 100 }),
    bankAccountNumber: (0, pg_core_1.varchar)("bank_account_number", { length: 50 }),
    enabledFlag: (0, pg_core_1.boolean)("enabled_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
exports.insertApSupplierSiteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apSupplierSites);
// 2. Invoice Header
exports.apInvoices = (0, pg_core_1.pgTable)("ap_invoices", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    invoiceId: (0, pg_core_1.varchar)("invoice_id", { length: 50 }), // Logical ID if needed, or use serial ID
    supplierId: (0, pg_core_1.integer)("supplier_id").notNull(),
    supplierSiteId: (0, pg_core_1.integer)("supplier_site_id"), // FK to ap_supplier_sites (Migration will populate this)
    invoiceNumber: (0, pg_core_1.varchar)("invoice_number", { length: 100 }).notNull(),
    invoiceDate: (0, pg_core_1.timestamp)("invoice_date").notNull(),
    description: (0, pg_core_1.text)("description"),
    invoiceType: (0, pg_core_1.varchar)("invoice_type", { length: 50 }).default("STANDARD"), // STANDARD, CREDIT_MEMO
    // Amounts
    invoiceCurrencyCode: (0, pg_core_1.varchar)("invoice_currency_code", { length: 10 }).notNull().default("USD"),
    paymentCurrencyCode: (0, pg_core_1.varchar)("payment_currency_code", { length: 10 }).notNull().default("USD"),
    invoiceAmount: (0, pg_core_1.numeric)("invoice_amount", { precision: 18, scale: 2 }).notNull(), // User entered total
    // Status
    validationStatus: (0, pg_core_1.varchar)("validation_status", { length: 50 }).default("NEVER VALIDATED"), // VALIDATED, NEEDS REVALIDATION
    approvalStatus: (0, pg_core_1.varchar)("approval_status", { length: 50 }).default("REQUIRED"), // REQUIRED, APPROVED, REJECTED, NOT REQUIRED
    paymentStatus: (0, pg_core_1.varchar)("payment_status", { length: 50 }).default("UNPAID"), // UNPAID, PARTIAL, PAID
    accountingStatus: (0, pg_core_1.varchar)("accounting_status", { length: 50 }).default("UNACCOUNTED"), // UNACCOUNTED, ACCOUNTED
    invoiceStatus: (0, pg_core_1.varchar)("invoice_status", { length: 50 }).default("DRAFT"), // DRAFT, VALIDATED, APPROVED, PAID
    // UI Compatibility & Parity
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    paymentTerms: (0, pg_core_1.varchar)("payment_terms", { length: 100 }).default("Net 30"),
    taxAmount: (0, pg_core_1.numeric)("tax_amount", { precision: 18, scale: 2 }).default("0"),
    withholdingTaxAmount: (0, pg_core_1.numeric)("withholding_tax_amount", { precision: 18, scale: 2 }).default("0"),
    // Controls
    cancelledDate: (0, pg_core_1.timestamp)("cancelled_date"),
    glDate: (0, pg_core_1.timestamp)("gl_date"), // Default GL Date
    // AI Extraction Metadata
    audioUrl: (0, pg_core_1.text)("audio_url"),
    documentUrl: (0, pg_core_1.text)("document_url"),
    aiExtractionStatus: (0, pg_core_1.varchar)("ai_extraction_status", { length: 50 }), // PENDING, PROCESSED, FAILED
    extractedJson: (0, pg_core_1.jsonb)("extracted_json"),
    // Prepayment tracking
    prepayAmountRemaining: (0, pg_core_1.numeric)("prepay_amount_remaining", { precision: 18, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
exports.insertApInvoiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apInvoices);
// 3. Invoice Lines (The "what" - Items, Freight, Tax)
exports.apInvoiceLines = (0, pg_core_1.pgTable)("ap_invoice_lines", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    invoiceId: (0, pg_core_1.integer)("invoice_id").notNull(), // FK to apInvoices
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    lineType: (0, pg_core_1.varchar)("line_type", { length: 50 }).notNull().default("ITEM"), // ITEM, TAX, FREIGHT, MISC
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    // Matching 
    poHeaderId: (0, pg_core_1.varchar)("po_header_id"),
    poLineId: (0, pg_core_1.varchar)("po_line_id"),
    quantityInvoiced: (0, pg_core_1.numeric)("quantity_invoiced", { precision: 18, scale: 4 }),
    unitPrice: (0, pg_core_1.numeric)("unit_price", { precision: 18, scale: 4 }),
    // Status
    discardedFlag: (0, pg_core_1.boolean)("discarded_flag").default(false),
    cancelledFlag: (0, pg_core_1.boolean)("cancelled_flag").default(false),
    // PPM Integration
    ppmProjectId: (0, pg_core_1.varchar)("ppm_project_id"),
    ppmTaskId: (0, pg_core_1.varchar)("ppm_task_id"),
    ppmExpenditureItemId: (0, pg_core_1.varchar)("ppm_exp_item_id"), // Linked item after collection
    // Landed Cost Integration
    isLandedCost: (0, pg_core_1.boolean)("is_landed_cost").default(false),
    tradeOperationId: (0, pg_core_1.varchar)("trade_operation_id"), // FK to lcm_trade_operations
    costComponentId: (0, pg_core_1.varchar)("cost_component_id"), // FK to lcm_cost_components
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
exports.insertApInvoiceLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apInvoiceLines);
// 4. Invoice Distributions (The "accounting" - Cost Centers)
exports.apInvoiceDistributions = (0, pg_core_1.pgTable)("ap_invoice_distributions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    invoiceId: (0, pg_core_1.integer)("invoice_id").notNull(),
    invoiceLineId: (0, pg_core_1.integer)("invoice_line_id").notNull(),
    distLineNumber: (0, pg_core_1.integer)("dist_line_number").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    // Accounting
    distCodeCombinationId: (0, pg_core_1.varchar)("dist_code_combination_id").notNull(), // GL Account
    accountingDate: (0, pg_core_1.timestamp)("accounting_date"),
    description: (0, pg_core_1.text)("description"),
    // Status
    postedFlag: (0, pg_core_1.boolean)("posted_flag").default(false), // Has this been sent to SLA/GL?
    reversalFlag: (0, pg_core_1.boolean)("reversal_flag").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
exports.insertApInvoiceDistributionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apInvoiceDistributions);
// 5. Payment Batches (PPR - Payment Process Request)
exports.apPaymentBatches = (0, pg_core_1.pgTable)("ap_payment_batches", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    batchName: (0, pg_core_1.varchar)("batch_name", { length: 100 }).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).default("NEW"), // NEW, SELECTED, CONFIRMED, CANCELLED
    // Selection Criteria
    checkDate: (0, pg_core_1.timestamp)("check_date").notNull().defaultNow(),
    payGroup: (0, pg_core_1.varchar)("pay_group", { length: 50 }),
    paymentMethodCode: (0, pg_core_1.varchar)("payment_method_code", { length: 50 }).default("CHECK"),
    // Totals
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 18, scale: 2 }).default("0"),
    paymentCount: (0, pg_core_1.integer)("payment_count").default(0),
    // Disbursement Bank
    bankAccountId: (0, pg_core_1.varchar)("bank_account_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
exports.insertApPaymentBatchSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apPaymentBatches);
// 6. Payments (Refactored to link to Invoices)
exports.apPayments = (0, pg_core_1.pgTable)("ap_payments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    paymentNumber: (0, pg_core_1.serial)("payment_number"), // Internal sequential
    checkNumber: (0, pg_core_1.varchar)("check_number"), // External ref
    batchId: (0, pg_core_1.integer)("batch_id"), // Link to PPR batch
    paymentDate: (0, pg_core_1.timestamp)("payment_date").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    currencyCode: (0, pg_core_1.varchar)("currency_code", { length: 10 }).notNull(),
    paymentMethodCode: (0, pg_core_1.varchar)("payment_method_code", { length: 50 }).notNull(), // CHECK, WIRE, CLEARING
    supplierId: (0, pg_core_1.integer)("supplier_id").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).default("NEGOTIABLE"), // NEGOTIABLE, CLEARED, VOIDED
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
exports.apHolds = (0, pg_core_1.pgTable)("ap_holds", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    invoice_id: (0, pg_core_1.integer)("invoice_id").notNull(),
    line_location_id: (0, pg_core_1.integer)("line_location_id"), // Optional: if hold is on a specific line
    hold_lookup_code: (0, pg_core_1.varchar)("hold_lookup_code", { length: 50 }).notNull(), // e.g. PRICE VARIANCE, QTY RECD
    hold_type: (0, pg_core_1.varchar)("hold_type", { length: 50 }).notNull().default("GENERAL"), // e.g. PRICE_VARIANCE, QTY_VARIANCE
    hold_reason: (0, pg_core_1.varchar)("hold_reason", { length: 255 }),
    release_lookup_code: (0, pg_core_1.varchar)("release_lookup_code", { length: 50 }), // NULL if active
    hold_date: (0, pg_core_1.timestamp)("hold_date").defaultNow(),
    held_by: (0, pg_core_1.integer)("held_by").default(1), // System User ID
});
exports.insertApHoldSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apHolds);
// 6. System Parameters (Global Options)
exports.apSystemParameters = (0, pg_core_1.pgTable)("ap_system_parameters", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    orgId: (0, pg_core_1.integer)("org_id").default(1), // Single Org for now
    // Tolerances
    priceTolerancePercent: (0, pg_core_1.numeric)("price_tolerance_percent").default("0.05"), // 5%
    qtyTolerancePercent: (0, pg_core_1.numeric)("qty_tolerance_percent").default("0.05"), // 5%
    taxTolerancePercent: (0, pg_core_1.numeric)("tax_tolerance_percent").default("0.10"), // 10%
    amountTolerance: (0, pg_core_1.numeric)("amount_tolerance").default("10.00"), // Fixed $10 threshold
    // Defaults & Options
    defaultPaymentTermsId: (0, pg_core_1.varchar)("default_payment_terms_id", { length: 50 }).default("Net 30"),
    defaultCurrencyCode: (0, pg_core_1.varchar)("default_currency_code", { length: 10 }).default("USD"),
    defaultPayGroup: (0, pg_core_1.varchar)("default_pay_group", { length: 50 }).default("STANDARD"),
    defaultPaymentMethod: (0, pg_core_1.varchar)("default_payment_method", { length: 50 }).default("CHECK"),
    allowManualInvoiceNumber: (0, pg_core_1.boolean)("allow_manual_invoice_number").default(true),
    invoiceCurrencyOverride: (0, pg_core_1.boolean)("invoice_currency_override").default(true),
    paymentCurrencyOverride: (0, pg_core_1.boolean)("payment_currency_override").default(true),
    allowPaymentTermsOverride: (0, pg_core_1.boolean)("allow_payment_terms_override").default(true),
    // Accounting Options
    accountOnValidation: (0, pg_core_1.boolean)("account_on_validation").default(true),
    accountOnPayment: (0, pg_core_1.boolean)("account_on_payment").default(true),
    allowDraftAccounting: (0, pg_core_1.boolean)("allow_draft_accounting").default(true),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
exports.insertApSystemParametersSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apSystemParameters);
// 7. Distribution Sets (Templates)
exports.apDistributionSets = (0, pg_core_1.pgTable)("ap_distribution_sets", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
exports.insertApDistributionSetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apDistributionSets);
exports.apDistributionSetLines = (0, pg_core_1.pgTable)("ap_distribution_set_lines", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    distributionSetId: (0, pg_core_1.integer)("distribution_set_id").notNull(),
    distributionPercent: (0, pg_core_1.numeric)("distribution_percent").notNull(), // e.g. 50.00
    distCodeCombinationId: (0, pg_core_1.integer)("dist_code_combination_id").notNull(), // GL Account
    description: (0, pg_core_1.varchar)("description", { length: 255 }),
});
exports.insertApDistributionSetLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apDistributionSetLines);
// (Removed duplicate apInvoiceDistributions)
exports.insertApPaymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apPayments);
// Payment History / Invoice Linkage
// In Fusion this is ap_invoice_payments_all
exports.apInvoicePayments = (0, pg_core_1.pgTable)("ap_invoice_payments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    paymentId: (0, pg_core_1.integer)("payment_id").notNull(),
    invoiceId: (0, pg_core_1.integer)("invoice_id").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(), // Amount of THIS invoice paid by THIS payment
    accountingDate: (0, pg_core_1.timestamp)("accounting_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// Approvals (Simplified for now)
exports.apApprovals = (0, pg_core_1.pgTable)("ap_approvals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    invoiceId: (0, pg_core_1.integer)("invoice_id").notNull(),
    approverId: (0, pg_core_1.integer)("approver_id"),
    status: (0, pg_core_1.varchar)("status", { length: 50 }).default("Pending"),
    decision: (0, pg_core_1.varchar)("decision", { length: 50 }).default("Pending"),
    actionDate: (0, pg_core_1.timestamp)("action_date"),
    comments: (0, pg_core_1.text)("comments"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
exports.insertApApprovalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apApprovals);
// 8. AP Audit Logs (Immutable history)
exports.apAuditLogs = (0, pg_core_1.pgTable)("ap_audit_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    action: (0, pg_core_1.varchar)("action", { length: 100 }).notNull(), // e.g. INVOICE_VALIDATED, PAYMENT_CREATED
    entity: (0, pg_core_1.varchar)("entity", { length: 50 }).notNull(), // e.g. INVOICE, SUPPLIER
    entityId: (0, pg_core_1.varchar)("entity_id", { length: 50 }).notNull(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    beforeState: (0, pg_core_1.jsonb)("before_state"),
    afterState: (0, pg_core_1.jsonb)("after_state"),
    details: (0, pg_core_1.text)("details"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow()
});
exports.insertApAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apAuditLogs);
// 9. AP Period Statuses (Control)
exports.apPeriodStatuses = (0, pg_core_1.pgTable)("ap_period_statuses", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    periodId: (0, pg_core_1.varchar)("period_id").notNull(), // refers to glPeriods.id
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("OPEN"), // OPEN, CLOSED, PERMANENTLY_CLOSED
    closedDate: (0, pg_core_1.timestamp)("closed_date"),
    closedBy: (0, pg_core_1.varchar)("closed_by"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
exports.insertApPeriodStatusSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apPeriodStatuses);
// 10. Prepayment Applications (Linking Prepayments to Standard Invoices)
// 11. Withholding Tax Groups & Rates
exports.apWhtGroups = (0, pg_core_1.pgTable)("ap_wht_groups", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    groupName: (0, pg_core_1.varchar)("group_name", { length: 100 }).unique().notNull(),
    description: (0, pg_core_1.text)("description"),
    enabledFlag: (0, pg_core_1.boolean)("enabled_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
exports.apWhtRates = (0, pg_core_1.pgTable)("ap_wht_rates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    groupId: (0, pg_core_1.integer)("group_id").notNull(),
    taxAuthorityId: (0, pg_core_1.integer)("tax_authority_id"), // refers to a supplier marked as tax authority
    taxRateName: (0, pg_core_1.varchar)("tax_rate_name", { length: 100 }).notNull(),
    ratePercent: (0, pg_core_1.numeric)("rate_percent", { precision: 5, scale: 2 }).notNull(), // e.g. 7.50
    priority: (0, pg_core_1.integer)("priority").default(1),
    enabledFlag: (0, pg_core_1.boolean)("enabled_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
exports.insertApWhtGroupSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apWhtGroups);
exports.insertApWhtRateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apWhtRates);
exports.apPrepayApplications = (0, pg_core_1.pgTable)("ap_prepay_applications", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    standardInvoiceId: (0, pg_core_1.integer)("standard_invoice_id").notNull(),
    prepaymentInvoiceId: (0, pg_core_1.integer)("prepayment_invoice_id").notNull(),
    amountApplied: (0, pg_core_1.numeric)("amount_applied", { precision: 18, scale: 2 }).notNull(),
    accountingDate: (0, pg_core_1.timestamp)("accounting_date").notNull().defaultNow(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("APPLIED"), // APPLIED, UNAPPLIED
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
exports.insertApPrepayApplicationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apPrepayApplications);
//# sourceMappingURL=ap.js.map