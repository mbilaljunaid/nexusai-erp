
// Accounts Payable (AP) schema definitions for Oracle Fusion parity
import { pgTable, serial, text, varchar, numeric, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// 1. Supplier Entity (Parent)
export const apSuppliers = pgTable("ap_suppliers", {
    id: serial("id").primaryKey(),
    supplierNumber: varchar("supplier_number", { length: 50 }), // Business Key
    name: varchar("name", { length: 255 }).notNull(),
    taxOrganizationType: varchar("tax_organization_type", { length: 50 }), // Corporation, Partnership, etc.

    // Legacy fields (Deprecated - moved to Sites)
    taxId: varchar("tax_id", { length: 100 }),
    address: text("address"),
    paymentTermsId: varchar("payment_terms_id", { length: 50 }),

    // Controls
    enabledFlag: boolean("enabled_flag").default(true),
    supplierType: varchar("supplier_type", { length: 50 }).default("STANDARD"), // STANDARD, ONE_TIME
    creditHold: boolean("credit_hold").default(false),
    allowWithholdingTax: boolean("allow_withholding_tax").default(false),
    withholdingTaxGroupId: varchar("withholding_tax_group_id", { length: 50 }),

    // Risk & Compliance
    riskCategory: varchar("risk_category", { length: 50 }).default("Low"),
    riskScore: integer("risk_score"),

    // Contact
    country: varchar("country", { length: 100 }),
    contactEmail: varchar("contact_email", { length: 255 }),
    parentSupplierId: integer("parent_supplier_id"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertApSupplierSchema = createInsertSchema(apSuppliers);
export type ApSupplier = typeof apSuppliers.$inferSelect;
export type InsertApSupplier = typeof apSuppliers.$inferInsert;

// 1.1 Supplier Sites (Child - New V2 Schema)
export const apSupplierSites = pgTable("ap_supplier_sites", {
    id: serial("id").primaryKey(),
    supplierId: integer("supplier_id").notNull(), // Parent
    orgId: integer("org_id").default(1), // Business Unit assignment
    siteName: varchar("site_name", { length: 100 }).notNull().default("OFFICE"), // e.g. HEADQUARTERS, PAY_ONLY

    address: text("address"),
    taxId: varchar("tax_id", { length: 100 }), // Override parent
    paymentTermsId: varchar("payment_terms_id", { length: 50 }), // Override parent

    isPaySite: boolean("is_pay_site").default(true),
    isPurchasingSite: boolean("is_purchasing_site").default(true),

    // Banking Parity
    iban: varchar("iban", { length: 50 }),
    swiftCode: varchar("swift_code", { length: 20 }),
    bankAccountName: varchar("bank_account_name", { length: 100 }),
    bankAccountNumber: varchar("bank_account_number", { length: 50 }),

    enabledFlag: boolean("enabled_flag").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertApSupplierSiteSchema = createInsertSchema(apSupplierSites);
export type ApSupplierSite = typeof apSupplierSites.$inferSelect;
export type InsertApSupplierSite = typeof apSupplierSites.$inferInsert;


// 2. Invoice Header
export const apInvoices = pgTable("ap_invoices", {
    id: serial("id").primaryKey(),
    invoiceId: varchar("invoice_id", { length: 50 }), // Logical ID if needed, or use serial ID

    supplierId: integer("supplier_id").notNull(),
    supplierSiteId: integer("supplier_site_id"), // FK to ap_supplier_sites (Migration will populate this)

    invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
    invoiceDate: timestamp("invoice_date").notNull(),
    description: text("description"),

    invoiceType: varchar("invoice_type", { length: 50 }).default("STANDARD"), // STANDARD, CREDIT_MEMO

    // Amounts
    invoiceCurrencyCode: varchar("invoice_currency_code", { length: 10 }).notNull().default("USD"),
    paymentCurrencyCode: varchar("payment_currency_code", { length: 10 }).notNull().default("USD"),
    invoiceAmount: numeric("invoice_amount", { precision: 18, scale: 2 }).notNull(), // User entered total

    // Status
    validationStatus: varchar("validation_status", { length: 50 }).default("NEVER VALIDATED"), // VALIDATED, NEEDS REVALIDATION
    approvalStatus: varchar("approval_status", { length: 50 }).default("REQUIRED"), // REQUIRED, APPROVED, REJECTED, NOT REQUIRED
    paymentStatus: varchar("payment_status", { length: 50 }).default("UNPAID"), // UNPAID, PARTIAL, PAID
    accountingStatus: varchar("accounting_status", { length: 50 }).default("UNACCOUNTED"), // UNACCOUNTED, ACCOUNTED
    invoiceStatus: varchar("invoice_status", { length: 50 }).default("DRAFT"), // DRAFT, VALIDATED, APPROVED, PAID

    // UI Compatibility & Parity
    dueDate: timestamp("due_date"),
    paymentTerms: varchar("payment_terms", { length: 100 }).default("Net 30"),
    taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }).default("0"),
    withholdingTaxAmount: numeric("withholding_tax_amount", { precision: 18, scale: 2 }).default("0"),

    // Controls
    cancelledDate: timestamp("cancelled_date"),
    glDate: timestamp("gl_date"), // Default GL Date

    // AI Extraction Metadata
    audioUrl: text("audio_url"),
    documentUrl: text("document_url"),
    aiExtractionStatus: varchar("ai_extraction_status", { length: 50 }), // PENDING, PROCESSED, FAILED
    extractedJson: jsonb("extracted_json"),

    // Prepayment tracking
    prepayAmountRemaining: numeric("prepay_amount_remaining", { precision: 18, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertApInvoiceSchema = createInsertSchema(apInvoices);
export type ApInvoice = typeof apInvoices.$inferSelect;
export type InsertApInvoice = typeof apInvoices.$inferInsert;


// 3. Invoice Lines (The "what" - Items, Freight, Tax)
export const apInvoiceLines = pgTable("ap_invoice_lines", {
    id: serial("id").primaryKey(),
    invoiceId: integer("invoice_id").notNull(), // FK to apInvoices
    lineNumber: integer("line_number").notNull(),

    lineType: varchar("line_type", { length: 50 }).notNull().default("ITEM"), // ITEM, TAX, FREIGHT, MISC
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),

    description: text("description"),

    // Matching 
    poHeaderId: varchar("po_header_id"),
    poLineId: varchar("po_line_id"),
    quantityInvoiced: numeric("quantity_invoiced", { precision: 18, scale: 4 }),
    unitPrice: numeric("unit_price", { precision: 18, scale: 4 }),

    // Status
    discardedFlag: boolean("discarded_flag").default(false),
    cancelledFlag: boolean("cancelled_flag").default(false),

    // PPM Integration
    ppmProjectId: varchar("ppm_project_id"),
    ppmTaskId: varchar("ppm_task_id"),
    ppmExpenditureItemId: varchar("ppm_exp_item_id"), // Linked item after collection

    // Landed Cost Integration
    isLandedCost: boolean("is_landed_cost").default(false),
    tradeOperationId: varchar("trade_operation_id"), // FK to lcm_trade_operations
    costComponentId: varchar("cost_component_id"), // FK to lcm_cost_components

    createdAt: timestamp("created_at").defaultNow()
});

export const insertApInvoiceLineSchema = createInsertSchema(apInvoiceLines);
export type ApInvoiceLine = typeof apInvoiceLines.$inferSelect;
export type InsertApInvoiceLine = typeof apInvoiceLines.$inferInsert;


// 4. Invoice Distributions (The "accounting" - Cost Centers)
export const apInvoiceDistributions = pgTable("ap_invoice_distributions", {
    id: serial("id").primaryKey(),
    invoiceId: integer("invoice_id").notNull(),
    invoiceLineId: integer("invoice_line_id").notNull(),
    distLineNumber: integer("dist_line_number").notNull(),

    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),

    // Accounting
    distCodeCombinationId: varchar("dist_code_combination_id").notNull(), // GL Account
    accountingDate: timestamp("accounting_date"),

    description: text("description"),

    // Status
    postedFlag: boolean("posted_flag").default(false), // Has this been sent to SLA/GL?
    reversalFlag: boolean("reversal_flag").default(false),

    createdAt: timestamp("created_at").defaultNow()
});

export const insertApInvoiceDistributionSchema = createInsertSchema(apInvoiceDistributions);
export type ApInvoiceDistribution = typeof apInvoiceDistributions.$inferSelect;
export type InsertApInvoiceDistribution = typeof apInvoiceDistributions.$inferInsert;

// 5. Payment Batches (PPR - Payment Process Request)
export const apPaymentBatches = pgTable("ap_payment_batches", {
    id: serial("id").primaryKey(),
    batchName: varchar("batch_name", { length: 100 }).notNull(),
    status: varchar("status", { length: 50 }).default("NEW"), // NEW, SELECTED, CONFIRMED, CANCELLED

    // Selection Criteria
    checkDate: timestamp("check_date").notNull().defaultNow(),
    payGroup: varchar("pay_group", { length: 50 }),
    paymentMethodCode: varchar("payment_method_code", { length: 50 }).default("CHECK"),

    // Totals
    totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).default("0"),
    paymentCount: integer("payment_count").default(0),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertApPaymentBatchSchema = createInsertSchema(apPaymentBatches);
export type ApPaymentBatch = typeof apPaymentBatches.$inferSelect;
export type InsertApPaymentBatch = typeof apPaymentBatches.$inferInsert;

// 6. Payments (Refactored to link to Invoices)
export const apPayments = pgTable("ap_payments", {
    id: serial("id").primaryKey(),
    paymentNumber: serial("payment_number"), // Internal sequential
    checkNumber: varchar("check_number"), // External ref

    batchId: integer("batch_id"), // Link to PPR batch

    paymentDate: timestamp("payment_date").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currencyCode: varchar("currency_code", { length: 10 }).notNull(),

    paymentMethodCode: varchar("payment_method_code", { length: 50 }).notNull(), // CHECK, WIRE, CLEARING
    supplierId: integer("supplier_id").notNull(),

    status: varchar("status", { length: 50 }).default("NEGOTIABLE"), // NEGOTIABLE, CLEARED, VOIDED
    createdAt: timestamp("created_at").defaultNow()
});

export const apHolds = pgTable("ap_holds", {
    id: serial("id").primaryKey(),
    invoice_id: integer("invoice_id").notNull(),
    line_location_id: integer("line_location_id"), // Optional: if hold is on a specific line
    hold_lookup_code: varchar("hold_lookup_code", { length: 50 }).notNull(), // e.g. PRICE VARIANCE, QTY RECD
    hold_type: varchar("hold_type", { length: 50 }).notNull().default("GENERAL"), // e.g. PRICE_VARIANCE, QTY_VARIANCE
    hold_reason: varchar("hold_reason", { length: 255 }),
    release_lookup_code: varchar("release_lookup_code", { length: 50 }), // NULL if active
    hold_date: timestamp("hold_date").defaultNow(),
    held_by: integer("held_by").default(1), // System User ID
});

export const insertApHoldSchema = createInsertSchema(apHolds);
export type ApHold = typeof apHolds.$inferSelect;
export type InsertApHold = typeof apHolds.$inferInsert;

// 6. System Parameters (Global Options)
export const apSystemParameters = pgTable("ap_system_parameters", {
    id: serial("id").primaryKey(),
    orgId: integer("org_id").default(1), // Single Org for now

    // Tolerances
    priceTolerancePercent: numeric("price_tolerance_percent").default("0.05"), // 5%
    qtyTolerancePercent: numeric("qty_tolerance_percent").default("0.05"), // 5%
    taxTolerancePercent: numeric("tax_tolerance_percent").default("0.10"), // 10%
    amountTolerance: numeric("amount_tolerance").default("10.00"), // Fixed $10 threshold

    // Defaults & Options
    defaultPaymentTermsId: varchar("default_payment_terms_id", { length: 50 }).default("Net 30"),
    defaultCurrencyCode: varchar("default_currency_code", { length: 10 }).default("USD"),
    defaultPayGroup: varchar("default_pay_group", { length: 50 }).default("STANDARD"),
    defaultPaymentMethod: varchar("default_payment_method", { length: 50 }).default("CHECK"),

    allowManualInvoiceNumber: boolean("allow_manual_invoice_number").default(true),
    invoiceCurrencyOverride: boolean("invoice_currency_override").default(true),
    paymentCurrencyOverride: boolean("payment_currency_override").default(true),
    allowPaymentTermsOverride: boolean("allow_payment_terms_override").default(true),

    // Accounting Options
    accountOnValidation: boolean("account_on_validation").default(true),
    accountOnPayment: boolean("account_on_payment").default(true),
    allowDraftAccounting: boolean("allow_draft_accounting").default(true),

    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertApSystemParametersSchema = createInsertSchema(apSystemParameters);
export type ApSystemParameters = typeof apSystemParameters.$inferSelect;
export type InsertApSystemParameters = typeof apSystemParameters.$inferInsert;


// 7. Distribution Sets (Templates)
export const apDistributionSets = pgTable("ap_distribution_sets", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertApDistributionSetSchema = createInsertSchema(apDistributionSets);
export type ApDistributionSet = typeof apDistributionSets.$inferSelect;
export type InsertApDistributionSet = typeof apDistributionSets.$inferInsert;

export const apDistributionSetLines = pgTable("ap_distribution_set_lines", {
    id: serial("id").primaryKey(),
    distributionSetId: integer("distribution_set_id").notNull(),
    distributionPercent: numeric("distribution_percent").notNull(), // e.g. 50.00
    distCodeCombinationId: integer("dist_code_combination_id").notNull(), // GL Account
    description: varchar("description", { length: 255 }),
});

export const insertApDistributionSetLineSchema = createInsertSchema(apDistributionSetLines);
export type ApDistributionSetLine = typeof apDistributionSetLines.$inferSelect;
export type InsertApDistributionSetLine = typeof apDistributionSetLines.$inferInsert;

// (Removed duplicate apInvoiceDistributions)

export const insertApPaymentSchema = createInsertSchema(apPayments);
export type ApPayment = typeof apPayments.$inferSelect;
export type InsertApPayment = typeof apPayments.$inferInsert;

// Payment History / Invoice Linkage
// In Fusion this is ap_invoice_payments_all
export const apInvoicePayments = pgTable("ap_invoice_payments", {
    id: serial("id").primaryKey(),
    paymentId: integer("payment_id").notNull(),
    invoiceId: integer("invoice_id").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(), // Amount of THIS invoice paid by THIS payment
    accountingDate: timestamp("accounting_date"),
    createdAt: timestamp("created_at").defaultNow()
});

// Approvals (Simplified for now)
export const apApprovals = pgTable("ap_approvals", {
    id: serial("id").primaryKey(),
    invoiceId: integer("invoice_id").notNull(),
    approverId: integer("approver_id"),
    status: varchar("status", { length: 50 }).default("Pending"),
    decision: varchar("decision", { length: 50 }).default("Pending"),
    actionDate: timestamp("action_date"),
    comments: text("comments"),
    createdAt: timestamp("created_at").defaultNow()
});

export const insertApApprovalSchema = createInsertSchema(apApprovals);
export type ApApproval = typeof apApprovals.$inferSelect;
export type InsertApApproval = typeof apApprovals.$inferInsert;

// 8. AP Audit Logs (Immutable history)
export const apAuditLogs = pgTable("ap_audit_logs", {
    id: serial("id").primaryKey(),
    action: varchar("action", { length: 100 }).notNull(), // e.g. INVOICE_VALIDATED, PAYMENT_CREATED
    entity: varchar("entity", { length: 50 }).notNull(), // e.g. INVOICE, SUPPLIER
    entityId: varchar("entity_id", { length: 50 }).notNull(),
    userId: varchar("user_id").notNull(),
    beforeState: jsonb("before_state"),
    afterState: jsonb("after_state"),
    details: text("details"),
    timestamp: timestamp("timestamp").defaultNow()
});

export const insertApAuditLogSchema = createInsertSchema(apAuditLogs);
export type ApAuditLog = typeof apAuditLogs.$inferSelect;

// 9. AP Period Statuses (Control)
export const apPeriodStatuses = pgTable("ap_period_statuses", {
    id: serial("id").primaryKey(),
    periodId: varchar("period_id").notNull(), // refers to glPeriods.id
    status: varchar("status", { length: 20 }).default("OPEN"), // OPEN, CLOSED, PERMANENTLY_CLOSED
    closedDate: timestamp("closed_date"),
    closedBy: varchar("closed_by"),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertApPeriodStatusSchema = createInsertSchema(apPeriodStatuses);
export type ApPeriodStatus = typeof apPeriodStatuses.$inferSelect;

// 10. Prepayment Applications (Linking Prepayments to Standard Invoices)
// 11. Withholding Tax Groups & Rates
export const apWhtGroups = pgTable("ap_wht_groups", {
    id: serial("id").primaryKey(),
    groupName: varchar("group_name", { length: 100 }).unique().notNull(),
    description: text("description"),
    enabledFlag: boolean("enabled_flag").default(true),
    createdAt: timestamp("created_at").defaultNow()
});

export const apWhtRates = pgTable("ap_wht_rates", {
    id: serial("id").primaryKey(),
    groupId: integer("group_id").notNull(),
    taxAuthorityId: integer("tax_authority_id"), // refers to a supplier marked as tax authority
    taxRateName: varchar("tax_rate_name", { length: 100 }).notNull(),
    ratePercent: numeric("rate_percent", { precision: 5, scale: 2 }).notNull(), // e.g. 7.50
    priority: integer("priority").default(1),
    enabledFlag: boolean("enabled_flag").default(true),
    createdAt: timestamp("created_at").defaultNow()
});

export const insertApWhtGroupSchema = createInsertSchema(apWhtGroups);
export const insertApWhtRateSchema = createInsertSchema(apWhtRates);
export type ApWhtGroup = typeof apWhtGroups.$inferSelect;
export type ApWhtRate = typeof apWhtRates.$inferSelect;

export const apPrepayApplications = pgTable("ap_prepay_applications", {
    id: serial("id").primaryKey(),
    standardInvoiceId: integer("standard_invoice_id").notNull(),
    prepaymentInvoiceId: integer("prepayment_invoice_id").notNull(),
    amountApplied: numeric("amount_applied", { precision: 18, scale: 2 }).notNull(),
    accountingDate: timestamp("accounting_date").notNull().defaultNow(),
    userId: varchar("user_id").notNull(),
    status: varchar("status", { length: 20 }).default("APPLIED"), // APPLIED, UNAPPLIED
    createdAt: timestamp("created_at").defaultNow()
});

export const insertApPrepayApplicationSchema = createInsertSchema(apPrepayApplications);
export type ApPrepayApplication = typeof apPrepayApplications.$inferSelect;
