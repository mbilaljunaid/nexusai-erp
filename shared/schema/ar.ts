// server/shared/schema/ar.ts
import { pgTable, varchar, text, timestamp, numeric, boolean, integer, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// AR Customers (Registry/Party Level)
export const arCustomers = pgTable("ar_customers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    businessUnitId: varchar("business_unit_id"),
    taxId: varchar("tax_id"),
    customerType: varchar("customer_type").default("Commercial"), // Commercial, Individual
    address: text("address"), // Registry address
    contactEmail: varchar("contact_email"),
    parentCustomerId: varchar("parent_customer_id"),
    status: varchar("status").default("Active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArCustomerSchema = createInsertSchema(arCustomers).extend({
    name: z.string().min(1),
    businessUnitId: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    customerType: z.string().optional(),
    address: z.string().optional().nullable(),
    contactEmail: z.string().email().optional().nullable(),
    parentCustomerId: z.string().optional().nullable(),
    status: z.string().optional(),
});

export type InsertArCustomer = z.infer<typeof insertArCustomerSchema>;
export type ArCustomer = typeof arCustomers.$inferSelect;

// AR Customer Accounts
export const arCustomerAccounts = pgTable("ar_customer_accounts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(),
    accountName: varchar("account_name").notNull(),
    accountNumber: varchar("account_number").notNull().unique(),
    status: varchar("status").default("Active"),
    creditLimit: numeric("credit_limit", { precision: 18, scale: 2 }).default("0"),
    balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
    creditHold: boolean("credit_hold").default(false),
    riskCategory: varchar("risk_category").default("Low"), // Low, Medium, High
    creditScore: integer("credit_score").default(100),
    lastScoreUpdate: timestamp("last_score_update"),
    ledgerId: varchar("ledger_id"), // Operating Unit/Ledger context
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArCustomerAccountSchema = createInsertSchema(arCustomerAccounts).extend({
    customerId: z.string().min(1),
    accountName: z.string().min(1),
    accountNumber: z.string().min(1),
    creditLimit: z.string().optional(),
    balance: z.string().optional(),
    creditHold: z.boolean().optional(),
    riskCategory: z.string().optional(),
    creditScore: z.number().optional(),
    lastScoreUpdate: z.date().optional().nullable(),
    ledgerId: z.string().optional(),
});

export type InsertArCustomerAccount = z.infer<typeof insertArCustomerAccountSchema>;
export type ArCustomerAccount = typeof arCustomerAccounts.$inferSelect;

// AR Customer Sites
export const arCustomerSites = pgTable("ar_customer_sites", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    accountId: varchar("account_id").notNull(),
    orgId: varchar("org_id").default("1"), // Business Unit assignment (Oracle Parity)
    siteName: varchar("site_name").notNull(),
    address: text("address").notNull(),
    isBillTo: boolean("is_bill_to").default(true),
    isShipTo: boolean("is_ship_to").default(false),
    status: varchar("status").default("Active"),
    primaryFlag: boolean("primary_flag").default(false),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArCustomerSiteSchema = createInsertSchema(arCustomerSites).extend({
    accountId: z.string().min(1),
    orgId: z.string().optional(),
    siteName: z.string().min(1),
    address: z.string().min(1),
    isBillTo: z.boolean().optional(),
    isShipTo: z.boolean().optional(),
    primaryFlag: z.boolean().optional(),
});

export type InsertArCustomerSite = z.infer<typeof insertArCustomerSiteSchema>;
export type ArCustomerSite = typeof arCustomerSites.$inferSelect;

// AR Customer Contacts (TCA Party Contacts)
export const arCustomerContacts = pgTable("ar_customer_contacts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(),
    siteId: varchar("site_id"), // Optional: can be global or site-specific
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    jobTitle: varchar("job_title"),
    email: varchar("email").notNull(),
    phone: varchar("phone"),
    role: varchar("role").default("BILLING"), // BILLING, SHIPPING, DUNNING, PRIMARY
    isPrimary: boolean("is_primary").default(false),
    status: varchar("status").default("Active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArCustomerContactSchema = createInsertSchema(arCustomerContacts).extend({
    customerId: z.string().min(1),
    siteId: z.string().optional().nullable(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    jobTitle: z.string().optional().nullable(),
    email: z.string().email(),
    phone: z.string().optional().nullable(),
    role: z.string().optional(),
    isPrimary: z.boolean().optional(),
    status: z.string().optional(),
});

export type InsertArCustomerContact = z.infer<typeof insertArCustomerContactSchema>;
export type ArCustomerContact = typeof arCustomerContacts.$inferSelect;

// AR Invoices (Sales Invoices)
export const arInvoices = pgTable("ar_invoices", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    businessUnitId: varchar("business_unit_id"),
    customerId: varchar("customer_id").notNull(), // Party
    accountId: varchar("account_id"), // Linked Account (Oracle Parity)
    siteId: varchar("site_id"), // Bill-to Site (Oracle Parity)
    invoiceNumber: varchar("invoice_number").notNull().unique(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }).default("0"),
    totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    paymentTerms: varchar("payment_terms").default("Net 30"),
    dueDate: timestamp("due_date"),
    status: varchar("status").default("Draft"), // Draft, Sent, PartiallyPaid, Paid, Overdue, Cancelled
    description: text("description"),
    glAccountId: varchar("gl_account_id"),
    revenueScheduleId: varchar("revenue_schedule_id"),
    revenueRuleId: varchar("revenue_rule_id"), // Link to defining rule
    recognitionStatus: varchar("recognition_status").default("Pending"), // Pending, InProgress, Completed
    glStatus: varchar("gl_status").default("Pending"), // Pending, Created, Posted
    glDate: timestamp("gl_date"), // Accounting Date
    glPostedDate: timestamp("gl_posted_date"),
    transactionClass: varchar("transaction_class").default("INV"), // INV, CM (Credit Memo), DM (Debit Memo), CB (Chargeback), DEP (Deposit), GUAR (Guarantee)
    sourceTransactionId: varchar("source_transaction_id"), // Original invoice for CM/CB
    exchangeRateType: varchar("exchange_rate_type").default("Corporate"),
    exchangeRateDate: timestamp("exchange_rate_date"),
    exchangeRate: numeric("exchange_rate", { precision: 15, scale: 5 }).default("1"),
    transactionTypeId: varchar("transaction_type_id"), // Link to ar_transaction_types
    batchSourceId: varchar("batch_source_id"), // Link to ar_batch_sources
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArInvoiceSchema = createInsertSchema(arInvoices).extend({
    businessUnitId: z.string().optional().nullable(),
    customerId: z.string().min(1),
    accountId: z.string().optional().nullable(),
    siteId: z.string().optional().nullable(),
    invoiceNumber: z.string().min(1),
    amount: z.string().min(1),
    taxAmount: z.string().optional(),
    totalAmount: z.string().min(1),
    currency: z.string().optional(),
    dueDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    status: z.string().optional(),
    description: z.string().optional().nullable(),
    glAccountId: z.string().optional().nullable(),
    revenueScheduleId: z.string().optional().nullable(),
    revenueRuleId: z.string().optional().nullable(),
    recognitionStatus: z.string().optional(),
    glStatus: z.string().optional(),
    glDate: z.date().optional(),
    glPostedDate: z.date().optional(),
    transactionClass: z.string().optional(),
    sourceTransactionId: z.string().optional().nullable(),
    exchangeRateType: z.string().optional(),
    exchangeRateDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    exchangeRate: z.string().optional(),
    transactionTypeId: z.string().optional().nullable(),
    batchSourceId: z.string().optional().nullable(),
});


export type InsertArInvoice = z.infer<typeof insertArInvoiceSchema>;
export type ArInvoice = typeof arInvoices.$inferSelect;

export const arInvoiceLines = pgTable("ar_invoice_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceId: varchar("invoice_id").notNull(),
    lineNumber: integer("line_number").notNull(),
    lineType: varchar("line_type").default("LINE"), // LINE, TAX, FREIGHT, CHARGE
    description: text("description").notNull(),
    memoLineId: varchar("memo_line_id"), // Standard Memo Line for recurring/standard items
    inventoryItemId: varchar("inventory_item_id"), // Optional Item linking
    quantity: numeric("quantity").default("1"),
    unitPrice: numeric("unit_price", { precision: 18, scale: 2 }).default("0"),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }).default("0"),
    taxClassificationCode: varchar("tax_classification_code"), // e.g. "Standard", "Exempt"
    taxCode: varchar("tax_code"), // Legacy/display code
    glAccount: varchar("gl_account"), // Revenue Account String
    ccid: varchar("ccid"), // Code Combination ID for SLA
    billingEventId: varchar("billing_event_id"), // Link back to source event
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArInvoiceLineSchema = createInsertSchema(arInvoiceLines).extend({
    invoiceId: z.string().min(1),
    lineNumber: z.number().int(),
    lineType: z.string().optional(),
    description: z.string().min(1),
    memoLineId: z.string().optional().nullable(),
    inventoryItemId: z.string().optional().nullable(),
    quantity: z.string().optional(),
    unitPrice: z.string().optional(),
    amount: z.string().min(1),
    taxAmount: z.string().optional(),
    taxClassificationCode: z.string().optional().nullable(),
    taxCode: z.string().optional().nullable(),
    glAccount: z.string().optional().nullable(),
    ccid: z.string().optional().nullable(),
});

export type InsertArInvoiceLine = z.infer<typeof insertArInvoiceLineSchema>;
export type ArInvoiceLine = typeof arInvoiceLines.$inferSelect;

// AR Receipts (Incoming Payments)
export const arReceipts = pgTable("ar_receipts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id"), // Optional for unidentified
    accountId: varchar("account_id"),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    receiptDate: timestamp("receipt_date"),
    paymentMethod: varchar("payment_method"), // Bank, Wire, CreditCard, Check
    transactionId: varchar("transaction_id"),
    status: varchar("status").default("Unapplied"), // Applied, Unapplied, Unidentified, OnAccount, Reversed
    type: varchar("type").default("Standard"), // Standard, Misc
    invoiceId: varchar("invoice_id"), // Kept for backwards compatibility/simple flows
    unappliedAmount: numeric("unapplied_amount", { precision: 18, scale: 2 }).default("0"),
    exchangeRateType: varchar("exchange_rate_type").default("Corporate"),
    exchangeRateDate: timestamp("exchange_rate_date"),
    exchangeRate: numeric("exchange_rate", { precision: 15, scale: 5 }).default("1"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArReceiptSchema = createInsertSchema(arReceipts).extend({
    customerId: z.string().optional().nullable(),
    accountId: z.string().optional().nullable(),
    amount: z.string().min(1),
    currency: z.string().optional(),
    receiptDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional().nullable(),
    status: z.string().optional(),
    type: z.string().optional(),
    invoiceId: z.string().optional().nullable(),
    unappliedAmount: z.string().optional(),
    exchangeRateType: z.string().optional(),
    exchangeRateDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    exchangeRate: z.string().optional(),
});

export type InsertArReceipt = z.infer<typeof insertArReceiptSchema>;
export type ArReceipt = typeof arReceipts.$inferSelect;

// AR Receipt Applications (1:N linking)
export const arReceiptApplications = pgTable("ar_receipt_applications", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    receiptId: varchar("receipt_id").notNull(),
    invoiceId: varchar("invoice_id").notNull(),
    amountApplied: numeric("amount_applied", { precision: 18, scale: 2 }).notNull(), // Amount in invoice currency
    allocatedReceiptAmount: numeric("allocated_receipt_amount", { precision: 18, scale: 2 }), // Amount consumed from receipt in receipt currency
    applicationDate: timestamp("application_date").default(sql`now()`),
    glDate: timestamp("gl_date"),
    status: varchar("status").default("Applied"), // Applied, Reversed
    fxGainLoss: numeric("fx_gain_loss", { precision: 18, scale: 2 }).default("0"), // Realized Gain/Loss
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArReceiptApplicationSchema = createInsertSchema(arReceiptApplications).extend({
    receiptId: z.string().min(1),
    invoiceId: z.string().min(1),
    amountApplied: z.string().min(1),
    allocatedReceiptAmount: z.string().optional().nullable(),
    applicationDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    glDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    status: z.string().optional(),
    fxGainLoss: z.string().optional(),
});
export type InsertArReceiptApplication = z.infer<typeof insertArReceiptApplicationSchema>;
export type ArReceiptApplication = typeof arReceiptApplications.$inferSelect;

// AR Revenue Rules (e.g., 12 Month Ratable)
export const arRevenueRules = pgTable("ar_revenue_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(), // "12 Month Subscription"
    description: text("description"),
    durationPeriods: integer("duration_periods").default(1),
    recognitionMethod: varchar("recognition_method").default("Straight Line"), // Straight Line, Immediate
    enabledFlag: boolean("enabled_flag").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArRevenueRuleSchema = createInsertSchema(arRevenueRules).extend({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    durationPeriods: z.number().int().min(1).optional(),
    recognitionMethod: z.string().optional(),
    enabledFlag: z.boolean().optional(),
});

export type InsertArRevenueRule = z.infer<typeof insertArRevenueRuleSchema>;
export type ArRevenueRule = typeof arRevenueRules.$inferSelect;

// AR Revenue Schedules (Detailed recognition plan)
export const arRevenueSchedules = pgTable("ar_revenue_schedules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceId: varchar("invoice_id").notNull(),
    scheduleDate: timestamp("schedule_date").notNull(), // When it should be recognized
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    accountClass: varchar("account_class").default("Revenue"),
    status: varchar("status").default("Pending"), // Pending, Recognized
    periodName: varchar("period_name"), // "Jan-26"
    ruleId: varchar("rule_id"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArRevenueScheduleSchema = createInsertSchema(arRevenueSchedules).extend({
    invoiceId: z.string().min(1),
    scheduleDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    amount: z.string().min(1),
    accountClass: z.string().optional(),
    status: z.string().optional(),
    periodName: z.string().optional().nullable(),
    ruleId: z.string().optional().nullable(),
});

export type InsertArRevenueSchedule = z.infer<typeof insertArRevenueScheduleSchema>;
export type ArRevenueSchedule = typeof arRevenueSchedules.$inferSelect;


// AR Dunning Templates
export const arDunningTemplates = pgTable("ar_dunning_templates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    subject: varchar("subject").notNull(),
    content: text("content"),
    daysOverdueMin: integer("days_overdue_min").default(0),
    daysOverdueMax: integer("days_overdue_max").default(1000),
    severity: varchar("severity").default("Medium"), // Low, Medium, High
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArDunningTemplateSchema = createInsertSchema(arDunningTemplates).extend({
    name: z.string().min(1),
    subject: z.string().min(1),
    content: z.string().optional().nullable(),
    daysOverdueMin: z.number().int().optional(),
    daysOverdueMax: z.number().int().optional(),
    severity: z.string().optional(),
});

export type InsertArDunningTemplate = z.infer<typeof insertArDunningTemplateSchema>;
export type ArDunningTemplate = typeof arDunningTemplates.$inferSelect;

// AR Dunning Runs (Batch History)
export const arDunningRuns = pgTable("ar_dunning_runs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    runDate: timestamp("run_date").default(sql`now()`),
    status: varchar("status").default("Completed"), // InProgress, Completed, Failed
    totalInvoicesProcessed: integer("total_invoices_processed").default(0),
    totalLettersGenerated: integer("total_letters_generated").default(0),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArDunningRunSchema = createInsertSchema(arDunningRuns).extend({
    runDate: z.date().optional(),
    status: z.string().optional(),
    totalInvoicesProcessed: z.number().optional(),
    totalLettersGenerated: z.number().optional(),
});

export type InsertArDunningRun = z.infer<typeof insertArDunningRunSchema>;
export type ArDunningRun = typeof arDunningRuns.$inferSelect;

// AR Collector Tasks
export const arCollectorTasks = pgTable("ar_collector_tasks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    taskType: varchar("task_type").notNull(), // Call, Email, Review
    priority: varchar("priority").default("Medium"), // Low, Medium, High
    status: varchar("status").default("Open"), // Open, InProgress, Completed
    assignedToUser: varchar("assigned_to_user"),
    customerId: varchar("customer_id").notNull(),
    invoiceId: varchar("invoice_id"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArCollectorTaskSchema = createInsertSchema(arCollectorTasks).extend({
    taskType: z.string().min(1),
    priority: z.string().optional(),
    status: z.string().optional(),
    assignedToUser: z.string().optional().nullable(),
    customerId: z.string().min(1),
    invoiceId: z.string().optional().nullable(),
    dueDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
});

export type InsertArCollectorTask = z.infer<typeof insertArCollectorTaskSchema>;
export type ArCollectorTask = typeof arCollectorTasks.$inferSelect;

// Adjustments
export const arAdjustments = pgTable("ar_adjustments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceId: varchar("invoice_id").notNull(),
    adjustmentType: varchar("adjustment_type").notNull(), // 'WriteOff', 'Adjustment'
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    reason: text("reason").notNull(),
    status: varchar("status").default('Pending'), // 'Pending', 'Approved', 'Rejected'
    glAccountId: varchar("gl_account_id"), // Expense Account
    createdAt: timestamp("created_at").default(sql`now()`),
    createdBy: varchar("created_by"),
});

export const insertArAdjustmentSchema = createInsertSchema(arAdjustments);
export type ArAdjustment = typeof arAdjustments.$inferSelect;
export type InsertArAdjustment = typeof arAdjustments.$inferInsert;

// ==========================================
// PHASE 2 & ADVANCED AR BILLING SCHEMA
// ==========================================

// AR AutoInvoice Staging Area
export const arAutoInvoiceStaging = pgTable("ar_autoinvoice_staging", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    batchSourceId: varchar("batch_source_id").notNull(),
    transactionTypeId: varchar("transaction_type_id").notNull(),
    customerId: varchar("customer_id").notNull(),
    currency: varchar("currency").default("USD"),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    lineType: varchar("line_type").default("LINE"),
    description: text("description").notNull(),
    status: varchar("status").default("NEW"), // NEW, ERROR, PROCESSED
    importDate: timestamp("import_date").default(sql`now()`),
    processDate: timestamp("process_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArAutoInvoiceStagingSchema = createInsertSchema(arAutoInvoiceStaging).extend({
    amount: z.string().min(1),
});
export type ArAutoInvoiceStaging = typeof arAutoInvoiceStaging.$inferSelect;
export type InsertArAutoInvoiceStaging = z.infer<typeof insertArAutoInvoiceStagingSchema>;

// AR AutoInvoice Errors
export const arAutoInvoiceErrors = pgTable("ar_autoinvoice_errors", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    stagingId: varchar("staging_id").notNull(),
    errorMessage: text("error_message").notNull(),
    invalidValue: varchar("invalid_value"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArAutoInvoiceErrorSchema = createInsertSchema(arAutoInvoiceErrors);
export type ArAutoInvoiceError = typeof arAutoInvoiceErrors.$inferSelect;
export type InsertArAutoInvoiceError = typeof arAutoInvoiceErrors.$inferInsert;

// AR Sales Credits (Revenue Splits)
export const arSalesCredits = pgTable("ar_sales_credits", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceLineId: varchar("invoice_line_id").notNull(),
    salespersonId: varchar("salesperson_id").notNull(),
    salesCreditType: varchar("sales_credit_type").default("Quota"), // Quota, Non-Quota
    percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(), // e.g. 50.00
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    glAccountId: varchar("gl_account_id"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArSalesCreditSchema = createInsertSchema(arSalesCredits).extend({
    percentage: z.string().min(1),
    amount: z.string().min(1),
});
export type ArSalesCredit = typeof arSalesCredits.$inferSelect;
export type InsertArSalesCredit = z.infer<typeof insertArSalesCreditSchema>;


// AR Period Statuses (Control)
export const arPeriodStatuses = pgTable("ar_period_statuses", {
    periodName: varchar("period_name").primaryKey(), // e.g., "Jan-26"
    ledgerId: varchar("ledger_id").notNull(),
    glPeriodId: varchar("gl_period_id").notNull(),
    status: varchar("status").default("Never Opened"), // Never Opened, Future, Open, Closed, Permanently Closed
    auditId: varchar("audit_id"), // User who last changed status
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertArPeriodStatusSchema = createInsertSchema(arPeriodStatuses).extend({
    periodName: z.string().min(1),
    ledgerId: z.string().min(1),
    glPeriodId: z.string().min(1),
    status: z.string().optional(),
    auditId: z.string().optional().nullable(),
});

export type ArPeriodStatus = typeof arPeriodStatuses.$inferSelect;
export type InsertArPeriodStatus = z.infer<typeof insertArPeriodStatusSchema>;

// AR System Options (Global Configuration)
export const arSystemOptions = pgTable("ar_system_options", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull().unique(), // One set of options per ledger
    orgId: varchar("org_id"), // Operating Unit
    allowOverapplication: boolean("allow_overapplication").default(false),
    accountingMethod: varchar("accounting_method").default("Accrual"), // Accrual, Cash
    taxMethod: varchar("tax_method").default("Standard"), // Standard, Vertex, Avalara
    autoInvoiceBatchSource: varchar("auto_invoice_batch_source"),
    defaultCreditLimit: numeric("default_credit_limit", { precision: 18, scale: 2 }).default("0"),
    realizedGainsAccount: varchar("realized_gains_account"),
    realizedLossesAccount: varchar("realized_losses_account"),
    unallocatedRevenueAccount: varchar("unallocated_revenue_account"),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertArSystemOptionsSchema = createInsertSchema(arSystemOptions).extend({
    ledgerId: z.string().min(1),
    orgId: z.string().optional().nullable(),
    allowOverapplication: z.boolean().optional(),
    accountingMethod: z.string().optional(),
    taxMethod: z.string().optional(),
    autoInvoiceBatchSource: z.string().optional().nullable(),
    defaultCreditLimit: z.string().optional(),
    realizedGainsAccount: z.string().optional().nullable(),
    realizedLossesAccount: z.string().optional().nullable(),
    unallocatedRevenueAccount: z.string().optional().nullable(),
});

export type ArSystemOptions = typeof arSystemOptions.$inferSelect;
export type InsertArSystemOptions = z.infer<typeof insertArSystemOptionsSchema>;

// AR Disputes
export const arDisputes = pgTable("ar_disputes", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceId: varchar("invoice_id").notNull(),
    customerId: varchar("customer_id").notNull(),
    disputeReason: varchar("dispute_reason", { length: 255 }).notNull(),
    disputedAmount: numeric("disputed_amount", { precision: 15, scale: 2 }),
    description: text("description"),
    status: varchar("status").default("Open"), // Open, Under Review, Resolved, Rejected
    adminResponse: text("admin_response"),
    resolvedBy: varchar("resolved_by"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertArDisputeSchema = createInsertSchema(arDisputes).extend({
    invoiceId: z.string().min(1),
    customerId: z.string().min(1),
    disputeReason: z.string().min(1),
    disputedAmount: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    status: z.string().optional(),
    adminResponse: z.string().optional().nullable(),
    resolvedBy: z.string().optional().nullable(),
    resolvedAt: z.date().optional().nullable(),
});

export type ArDispute = typeof arDisputes.$inferSelect;
export type InsertArDispute = z.infer<typeof insertArDisputeSchema>;

// AR Dispute Attachments
export const arDisputeAttachments = pgTable("ar_dispute_attachments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    disputeId: varchar("dispute_id").notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    filePath: varchar("file_path", { length: 500 }).notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    uploadedAt: timestamp("uploaded_at").default(sql`now()`),
});

export const insertArDisputeAttachmentSchema = createInsertSchema(arDisputeAttachments).extend({
    disputeId: z.string().min(1),
    fileName: z.string().min(1),
    filePath: z.string().min(1),
    fileSize: z.number().int(),
    mimeType: z.string().min(1),
});

export type ArDisputeAttachment = typeof arDisputeAttachments.$inferSelect;
export type InsertArDisputeAttachment = z.infer<typeof insertArDisputeAttachmentSchema>;

// Customer Notifications
export const customerNotifications = pgTable("customer_notifications", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(),
    type: varchar("type").notNull(), // new_invoice, payment_received, dispute_update, statement_ready, overdue_reminder
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    read: boolean("read").default(false),
    referenceId: varchar("reference_id"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCustomerNotificationSchema = createInsertSchema(customerNotifications).extend({
    customerId: z.string().min(1),
    type: z.string().min(1),
    title: z.string().min(1),
    message: z.string().min(1),
    read: z.boolean().optional(),
    referenceId: z.string().optional().nullable(),
});

export type CustomerNotification = typeof customerNotifications.$inferSelect;
export type InsertCustomerNotification = z.infer<typeof insertCustomerNotificationSchema>;

// Lockbox Batches (APAR-OG-02)
export const lockboxBatches = pgTable("lockbox_batches", {
    id: text("id").primaryKey(), // e.g. "LB-169837192"
    tenantId: text("tenant_id").notNull(),
    bankAccountId: text("bank_account_id"),
    batchDate: date("batch_date").notNull(),
    totalAmount: numeric("total_amount", { precision: 20, scale: 2 }).notNull(),
    itemCount: integer("item_count").notNull(),
    status: text("status").default("Pending"), // Pending, Matched, Partial, Exception
    importedBy: text("imported_by").notNull(),
    rawFile: text("raw_file"),
    createdAt: timestamp("created_at").defaultNow()
});

// Lockbox Items (APAR-OG-02)
export const lockboxItems = pgTable("lockbox_items", {
    id: text("id").primaryKey(),
    batchId: text("batch_id").references(() => lockboxBatches.id).notNull(),
    checkNumber: text("check_number"),
    remittanceRef: text("remittance_ref"),
    payerName: text("payer_name"),
    payerAccount: text("payer_account"),
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    itemDate: date("item_date").notNull(),
    matchedInvoiceId: text("matched_invoice_id"),
    matchMethod: text("match_method"), // Exact, Fuzzy_Ref, Amount, Manual
    matchStatus: text("match_status").default("Unmatched"), // Unmatched, Matched, Partial
    unappliedAmount: numeric("unapplied_amount", { precision: 20, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow()
});
// AR Transaction Types (Oracle Parity)
export const arTransactionTypes = pgTable("ar_transaction_types", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // e.g. "Standard Invoice", "Credit Memo - Tax Only"
    description: text("description"),
    class: varchar("class").notNull(), // INV, CM, DM, CB, DEP, GUAR
    creationSign: varchar("creation_sign").default("Any"), // Positive, Negative, Any
    generateOpenReceivable: boolean("generate_open_receivable").default(true),
    postToGl: boolean("post_to_gl").default(true),
    defaultReceivableAccount: varchar("default_receivable_account"),
    defaultRevenueAccount: varchar("default_revenue_account"),
    defaultTaxAccount: varchar("default_tax_account"),
    defaultFreightAccount: varchar("default_freight_account"),
    defaultClearingAccount: varchar("default_clearing_account"),
    defaultUnbilledAccount: varchar("default_unbilled_account"),
    defaultUnearnedAccount: varchar("default_unearned_account"),
    status: varchar("status").default("Active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArTransactionTypeSchema = createInsertSchema(arTransactionTypes).extend({
    name: z.string().min(1),
    class: z.string().min(1),
    creationSign: z.string().optional(),
    generateOpenReceivable: z.boolean().optional(),
    postToGl: z.boolean().optional(),
    defaultReceivableAccount: z.string().optional().nullable(),
    defaultRevenueAccount: z.string().optional().nullable(),
    defaultTaxAccount: z.string().optional().nullable(),
    defaultFreightAccount: z.string().optional().nullable(),
    defaultClearingAccount: z.string().optional().nullable(),
    defaultUnbilledAccount: z.string().optional().nullable(),
    defaultUnearnedAccount: z.string().optional().nullable(),
    status: z.string().optional(),
});

export type ArTransactionType = typeof arTransactionTypes.$inferSelect;
export type InsertArTransactionType = z.infer<typeof insertArTransactionTypeSchema>;

// AR Batch Sources (Oracle Parity)
export const arBatchSources = pgTable("ar_batch_sources", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // e.g. "Manual Invoice", "Order Management Import"
    description: text("description"),
    type: varchar("type").notNull().default("Manual"), // Manual, Imported
    activeDate: timestamp("active_date").default(sql`now()`),
    inactiveDate: timestamp("inactive_date"),
    autoNumbering: boolean("auto_numbering").default(true),
    lastNumber: integer("last_number").default(0),
    standardTransactionType: varchar("standard_transaction_type"), // Default trans type for this source
    copyDocumentNumber: boolean("copy_document_number").default(false),
    allowDuplicateDocument: boolean("allow_duplicate_document").default(false),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArBatchSourceSchema = createInsertSchema(arBatchSources).extend({
    name: z.string().min(1),
    type: z.string().optional(),
    activeDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    inactiveDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    autoNumbering: z.boolean().optional(),
    lastNumber: z.number().int().optional(),
    standardTransactionType: z.string().optional().nullable(),
    copyDocumentNumber: z.boolean().optional(),
    allowDuplicateDocument: z.boolean().optional(),
});

export type ArBatchSource = typeof arBatchSources.$inferSelect;
export type InsertArBatchSource = z.infer<typeof insertArBatchSourceSchema>;

// AR Receipt Methods (Oracle Parity)
export const arReceiptMethods = pgTable("ar_receipt_methods", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // e.g. "Bank Transfer - USD", "Lockbox"
    receiptClass: varchar("receipt_class").notNull(), // Manual, Automatic
    creationMethod: varchar("creation_method").default("Manual"), // Manual, Automatic, Routing
    remittanceMethod: varchar("remittance_method").default("Standard"), // Standard, Factoring, None
    clearanceMethod: varchar("clearance_method").default("Directly"), // By Automatic Clearing, By Matching, Directly
    remittanceBankAccount: varchar("remittance_bank_account"),
    cashAccount: varchar("cash_account"),
    unappliedAccount: varchar("unapplied_account"),
    unidentifiedAccount: varchar("unidentified_account"),
    onAccountAccount: varchar("on_account_account"),
    earnedDiscountAccount: varchar("earned_discount_account"),
    unearnedDiscountAccount: varchar("unearned_discount_account"),
    status: varchar("status").default("Active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArReceiptMethodSchema = createInsertSchema(arReceiptMethods).extend({
    name: z.string().min(1),
    receiptClass: z.string().min(1),
    creationMethod: z.string().optional(),
    remittanceMethod: z.string().optional(),
    clearanceMethod: z.string().optional(),
    remittanceBankAccount: z.string().optional().nullable(),
    cashAccount: z.string().optional().nullable(),
    unappliedAccount: z.string().optional().nullable(),
    unidentifiedAccount: z.string().optional().nullable(),
    onAccountAccount: z.string().optional().nullable(),
    earnedDiscountAccount: z.string().optional().nullable(),
    unearnedDiscountAccount: z.string().optional().nullable(),
    status: z.string().optional(),
});

export type ArReceiptMethod = typeof arReceiptMethods.$inferSelect;
export type InsertArReceiptMethod = z.infer<typeof insertArReceiptMethodSchema>;

// AR AutoAccounting Rules (Oracle Parity)
export const arAutoAccountingRules = pgTable("ar_auto_accounting_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    accountType: varchar("account_type").notNull(), // Receivable, Revenue, Tax, Freight, Clearing, Unbilled, Unearned
    segmentName: varchar("segment_name").notNull(), // e.g. "Company", "Department", "Account"
    sourceType: varchar("source_type").notNull(), // Constant, Transaction Type, Salesperson, Standard Line, Taxes
    constantValue: varchar("constant_value"), // Value if sourceType is Constant
    description: text("description"),
    status: varchar("status").default("Active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArAutoAccountingRuleSchema = createInsertSchema(arAutoAccountingRules).extend({
    accountType: z.string().min(1),
    segmentName: z.string().min(1),
    sourceType: z.string().min(1),
    constantValue: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    status: z.string().optional(),
});

export type ArAutoAccountingRule = typeof arAutoAccountingRules.$inferSelect;
export type InsertArAutoAccountingRule = z.infer<typeof insertArAutoAccountingRuleSchema>;

// Customer Profiles (TCA Depth)
export const arCustomerProfiles = pgTable("ar_customer_profiles", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(), // 'CUSTOMER', 'ACCOUNT', 'SITE'
    entityId: varchar("entity_id").notNull(), // ID of the Customer, Account, or Site
    profileClassName: varchar("profile_class_name").notNull(), // e.g., 'Corporate Standard'
    creditLimit: numeric("credit_limit", { precision: 18, scale: 2 }),
    orderLimit: numeric("order_limit", { precision: 18, scale: 2 }),
    currency: varchar("currency").default('USD'),
    paymentTerms: varchar("payment_terms"),
    statementCycle: varchar("statement_cycle"), // e.g., 'Monthly', 'Weekly'
    dunningLetters: boolean("dunning_letters").default(true),
    sendStatements: boolean("send_statements").default(true),
    lateChargeAssessment: boolean("late_charge_assessment").default(false),
    creditHold: boolean("credit_hold").default(false),
    status: varchar("status").default('Active'),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArCustomerProfileSchema = createInsertSchema(arCustomerProfiles).extend({
    entityType: z.string().min(1),
    entityId: z.string().min(1),
    profileClassName: z.string().min(1),
    creditLimit: z.string().optional().nullable(),
    orderLimit: z.string().optional().nullable(),
    currency: z.string().optional(),
    paymentTerms: z.string().optional().nullable(),
    statementCycle: z.string().optional().nullable(),
    dunningLetters: z.boolean().optional(),
    sendStatements: z.boolean().optional(),
    lateChargeAssessment: z.boolean().optional(),
    creditHold: z.boolean().optional(),
    status: z.string().optional(),
});

export type ArCustomerProfile = typeof arCustomerProfiles.$inferSelect;
export type InsertArCustomerProfile = z.infer<typeof insertArCustomerProfileSchema>;

// Customer Bank Accounts (TCA Depth)
export const arCustomerBankAccounts = pgTable("ar_customer_bank_accounts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(),
    accountId: varchar("account_id"), // Optional: link to specific account or site
    siteId: varchar("site_id"),
    bankName: varchar("bank_name").notNull(),
    branchName: varchar("branch_name"),
    accountNumber: varchar("account_number").notNull(),
    routingNumber: varchar("routing_number"),
    currency: varchar("currency").default('USD'),
    primaryFlag: boolean("primary_flag").default(false),
    activeDate: timestamp("active_date").default(sql`now()`),
    inactiveDate: timestamp("inactive_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArCustomerBankAccountSchema = createInsertSchema(arCustomerBankAccounts).extend({
    customerId: z.string().min(1),
    accountId: z.string().optional().nullable(),
    siteId: z.string().optional().nullable(),
    bankName: z.string().min(1),
    branchName: z.string().optional().nullable(),
    accountNumber: z.string().min(1),
    routingNumber: z.string().optional().nullable(),
    currency: z.string().optional(),
    primaryFlag: z.boolean().optional(),
    activeDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    inactiveDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
});

export type ArCustomerBankAccount = typeof arCustomerBankAccounts.$inferSelect;
export type InsertArCustomerBankAccount = z.infer<typeof insertArCustomerBankAccountSchema>;

// Document Sequences (Gapless/Automatic Config)
export const arDocumentSequences = pgTable("ar_document_sequences", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // e.g., "US_INV_2026"
    description: text("description"),
    module: varchar("module").default("AR"), // AR, AP, GL
    type: varchar("type").notNull().default("GAPLESS"), // GAPLESS, AUTOMATIC, MANUAL
    initialValue: integer("initial_value").notNull().default(1),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArDocumentSequenceSchema = createInsertSchema(arDocumentSequences).extend({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    module: z.string().optional(),
    type: z.enum(["GAPLESS", "AUTOMATIC", "MANUAL"]),
    initialValue: z.number().int().min(1),
    startDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    endDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
});

export type InsertArDocumentSequence = z.infer<typeof insertArDocumentSequenceSchema>;
export type ArDocumentSequence = typeof arDocumentSequences.$inferSelect;

// Document Sequence Assignments (Assign sequence to Ledger/Entity + Document Category)
export const arDocumentSequenceAssignments = pgTable("ar_document_sequence_assignments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    sequenceId: varchar("sequence_id").notNull(), // FK to ar_document_sequences
    contextType: varchar("context_type").notNull().default("LEDGER"), // LEDGER, LEGAL_ENTITY
    contextValue: varchar("context_value").notNull(), // Ledger ID or Legal Entity ID
    documentCategory: varchar("document_category").notNull(), // Link to ArTransactionType ID
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArDocumentSequenceAssignmentSchema = createInsertSchema(arDocumentSequenceAssignments).extend({
    sequenceId: z.string().min(1),
    contextType: z.enum(["LEDGER", "LEGAL_ENTITY"]),
    contextValue: z.string().min(1),
    documentCategory: z.string().min(1),
    startDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    endDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
});

export type InsertArDocumentSequenceAssignment = z.infer<typeof insertArDocumentSequenceAssignmentSchema>;
export type ArDocumentSequenceAssignment = typeof arDocumentSequenceAssignments.$inferSelect;
