
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
    siteName: varchar("site_name", { length: 100 }).notNull().default("OFFICE"), // e.g. HEADQUARTERS, PAY_ONLY

    address: text("address"),
    taxId: varchar("tax_id", { length: 100 }), // Override parent
    paymentTermsId: varchar("payment_terms_id", { length: 50 }), // Override parent

    isPaySite: boolean("is_pay_site").default(true),
    isPurchasingSite: boolean("is_purchasing_site").default(true),

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

    // Controls
    cancelledDate: timestamp("cancelled_date"),
    glDate: timestamp("gl_date"), // Default GL Date

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

// 5. Payments (Refactored to link to Invoices)
export const apPayments = pgTable("ap_payments", {
    id: serial("id").primaryKey(),
    paymentNumber: serial("payment_number"), // Internal sequential
    checkNumber: varchar("check_number"), // External ref

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

    // Defaults
    defaultPaymentTermsId: varchar("default_payment_terms_id", { length: 50 }).default("Net 30"),
    defaultCurrencyCode: varchar("default_currency_code", { length: 10 }).default("USD"),

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
