"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertArSystemOptionsSchema = exports.arSystemOptions = exports.insertArPeriodStatusSchema = exports.arPeriodStatuses = exports.insertArAdjustmentSchema = exports.arAdjustments = exports.insertArCollectorTaskSchema = exports.arCollectorTasks = exports.insertArDunningRunSchema = exports.arDunningRuns = exports.insertArDunningTemplateSchema = exports.arDunningTemplates = exports.insertArRevenueScheduleSchema = exports.arRevenueSchedules = exports.insertArRevenueRuleSchema = exports.arRevenueRules = exports.insertArReceiptApplicationSchema = exports.arReceiptApplications = exports.insertArReceiptSchema = exports.arReceipts = exports.insertArInvoiceLineSchema = exports.arInvoiceLines = exports.insertArInvoiceSchema = exports.arInvoices = exports.insertArCustomerSiteSchema = exports.arCustomerSites = exports.insertArCustomerAccountSchema = exports.arCustomerAccounts = exports.insertArCustomerSchema = exports.arCustomers = void 0;
// server/shared/schema/ar.ts
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// AR Customers (Registry/Party Level)
exports.arCustomers = (0, pg_core_1.pgTable)("ar_customers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    taxId: (0, pg_core_1.varchar)("tax_id"),
    customerType: (0, pg_core_1.varchar)("customer_type").default("Commercial"), // Commercial, Individual
    address: (0, pg_core_1.text)("address"), // Registry address
    contactEmail: (0, pg_core_1.varchar)("contact_email"),
    parentCustomerId: (0, pg_core_1.varchar)("parent_customer_id"),
    status: (0, pg_core_1.varchar)("status").default("Active"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArCustomerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arCustomers).extend({
    name: zod_1.z.string().min(1),
    taxId: zod_1.z.string().optional().nullable(),
    customerType: zod_1.z.string().optional(),
    address: zod_1.z.string().optional().nullable(),
    contactEmail: zod_1.z.string().email().optional().nullable(),
    parentCustomerId: zod_1.z.string().optional().nullable(),
    status: zod_1.z.string().optional(),
});
// AR Customer Accounts
exports.arCustomerAccounts = (0, pg_core_1.pgTable)("ar_customer_accounts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    accountName: (0, pg_core_1.varchar)("account_name").notNull(),
    accountNumber: (0, pg_core_1.varchar)("account_number").notNull().unique(),
    status: (0, pg_core_1.varchar)("status").default("Active"),
    creditLimit: (0, pg_core_1.numeric)("credit_limit", { precision: 18, scale: 2 }).default("0"),
    balance: (0, pg_core_1.numeric)("balance", { precision: 18, scale: 2 }).default("0"),
    creditHold: (0, pg_core_1.boolean)("credit_hold").default(false),
    riskCategory: (0, pg_core_1.varchar)("risk_category").default("Low"), // Low, Medium, High
    creditScore: (0, pg_core_1.integer)("credit_score").default(100),
    lastScoreUpdate: (0, pg_core_1.timestamp)("last_score_update"),
    ledgerId: (0, pg_core_1.varchar)("ledger_id"), // Operating Unit/Ledger context
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArCustomerAccountSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arCustomerAccounts).extend({
    customerId: zod_1.z.string().min(1),
    accountName: zod_1.z.string().min(1),
    accountNumber: zod_1.z.string().min(1),
    creditLimit: zod_1.z.string().optional(),
    balance: zod_1.z.string().optional(),
    creditHold: zod_1.z.boolean().optional(),
    riskCategory: zod_1.z.string().optional(),
    creditScore: zod_1.z.number().optional(),
    lastScoreUpdate: zod_1.z.date().optional().nullable(),
    ledgerId: zod_1.z.string().optional(),
});
// AR Customer Sites
exports.arCustomerSites = (0, pg_core_1.pgTable)("ar_customer_sites", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    accountId: (0, pg_core_1.varchar)("account_id").notNull(),
    siteName: (0, pg_core_1.varchar)("site_name").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    isBillTo: (0, pg_core_1.boolean)("is_bill_to").default(true),
    isShipTo: (0, pg_core_1.boolean)("is_ship_to").default(false),
    status: (0, pg_core_1.varchar)("status").default("Active"),
    primaryFlag: (0, pg_core_1.boolean)("primary_flag").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArCustomerSiteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arCustomerSites).extend({
    accountId: zod_1.z.string().min(1),
    siteName: zod_1.z.string().min(1),
    address: zod_1.z.string().min(1),
    isBillTo: zod_1.z.boolean().optional(),
    isShipTo: zod_1.z.boolean().optional(),
    primaryFlag: zod_1.z.boolean().optional(),
});
// AR Invoices (Sales Invoices)
exports.arInvoices = (0, pg_core_1.pgTable)("ar_invoices", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(), // Party
    accountId: (0, pg_core_1.varchar)("account_id"), // Linked Account (Oracle Parity)
    siteId: (0, pg_core_1.varchar)("site_id"), // Bill-to Site (Oracle Parity)
    invoiceNumber: (0, pg_core_1.varchar)("invoice_number").notNull().unique(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    taxAmount: (0, pg_core_1.numeric)("tax_amount", { precision: 18, scale: 2 }).default("0"),
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 18, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    paymentTerms: (0, pg_core_1.varchar)("payment_terms").default("Net 30"),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    status: (0, pg_core_1.varchar)("status").default("Draft"), // Draft, Sent, PartiallyPaid, Paid, Overdue, Cancelled
    description: (0, pg_core_1.text)("description"),
    glAccountId: (0, pg_core_1.varchar)("gl_account_id"),
    revenueScheduleId: (0, pg_core_1.varchar)("revenue_schedule_id"),
    revenueRuleId: (0, pg_core_1.varchar)("revenue_rule_id"), // Link to defining rule
    recognitionStatus: (0, pg_core_1.varchar)("recognition_status").default("Pending"), // Pending, InProgress, Completed
    glStatus: (0, pg_core_1.varchar)("gl_status").default("Pending"), // Pending, Created, Posted
    glDate: (0, pg_core_1.timestamp)("gl_date"), // Accounting Date
    glPostedDate: (0, pg_core_1.timestamp)("gl_posted_date"),
    transactionClass: (0, pg_core_1.varchar)("transaction_class").default("INV"), // INV, CM (Credit Memo), DM (Debit Memo), CB (Chargeback)
    sourceTransactionId: (0, pg_core_1.varchar)("source_transaction_id"), // Original invoice for CM/CB
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArInvoiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arInvoices).extend({
    customerId: zod_1.z.string().min(1),
    accountId: zod_1.z.string().optional().nullable(),
    siteId: zod_1.z.string().optional().nullable(),
    invoiceNumber: zod_1.z.string().min(1),
    amount: zod_1.z.string().min(1),
    taxAmount: zod_1.z.string().optional(),
    totalAmount: zod_1.z.string().min(1),
    currency: zod_1.z.string().optional(),
    dueDate: zod_1.z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.z.date()).optional().nullable(),
    status: zod_1.z.string().optional(),
    description: zod_1.z.string().optional().nullable(),
    glAccountId: zod_1.z.string().optional().nullable(),
    revenueScheduleId: zod_1.z.string().optional().nullable(),
    revenueRuleId: zod_1.z.string().optional().nullable(),
    recognitionStatus: zod_1.z.string().optional(),
    glStatus: zod_1.z.string().optional(),
    glDate: zod_1.z.date().optional(),
    glPostedDate: zod_1.z.date().optional(),
    transactionClass: zod_1.z.string().optional(),
    sourceTransactionId: zod_1.z.string().optional().nullable(),
});
// AR Invoice Lines
exports.arInvoiceLines = (0, pg_core_1.pgTable)("ar_invoice_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    invoiceId: (0, pg_core_1.varchar)("invoice_id").notNull(),
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity").default("1"),
    unitPrice: (0, pg_core_1.numeric)("unit_price", { precision: 18, scale: 2 }).default("0"),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    taxAmount: (0, pg_core_1.numeric)("tax_amount", { precision: 18, scale: 2 }).default("0"),
    taxCode: (0, pg_core_1.varchar)("tax_code"),
    glAccount: (0, pg_core_1.varchar)("gl_account"), // Revenue Account
    billingEventId: (0, pg_core_1.varchar)("billing_event_id"), // Link back to source event
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArInvoiceLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arInvoiceLines).extend({
    invoiceId: zod_1.z.string().min(1),
    lineNumber: zod_1.z.number().int(),
    description: zod_1.z.string().min(1),
    quantity: zod_1.z.string().optional(),
    unitPrice: zod_1.z.string().optional(),
    amount: zod_1.z.string().min(1),
    taxAmount: zod_1.z.string().optional(),
});
// AR Receipts (Incoming Payments)
exports.arReceipts = (0, pg_core_1.pgTable)("ar_receipts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    accountId: (0, pg_core_1.varchar)("account_id"),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    receiptDate: (0, pg_core_1.timestamp)("receipt_date"),
    paymentMethod: (0, pg_core_1.varchar)("payment_method"), // Bank, Wire, CreditCard, Check
    transactionId: (0, pg_core_1.varchar)("transaction_id"),
    status: (0, pg_core_1.varchar)("status").default("Completed"), // Applied, Unapplied, Reversed
    invoiceId: (0, pg_core_1.varchar)("invoice_id"), // Optional if unapplied receipt
    unappliedAmount: (0, pg_core_1.numeric)("unapplied_amount", { precision: 18, scale: 2 }).default("0"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArReceiptSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arReceipts).extend({
    customerId: zod_1.z.string().min(1),
    accountId: zod_1.z.string().optional().nullable(),
    amount: zod_1.z.string().min(1),
    receiptDate: zod_1.z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.z.date()).optional().nullable(),
    paymentMethod: zod_1.z.string().optional(),
    transactionId: zod_1.z.string().optional().nullable(),
    status: zod_1.z.string().optional(),
    invoiceId: zod_1.z.string().optional().nullable(),
    unappliedAmount: zod_1.z.string().optional(),
});
// AR Receipt Applications (1:N linking)
exports.arReceiptApplications = (0, pg_core_1.pgTable)("ar_receipt_applications", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    receiptId: (0, pg_core_1.varchar)("receipt_id").notNull(),
    invoiceId: (0, pg_core_1.varchar)("invoice_id").notNull(),
    amountApplied: (0, pg_core_1.numeric)("amount_applied", { precision: 18, scale: 2 }).notNull(),
    applicationDate: (0, pg_core_1.timestamp)("application_date").default((0, drizzle_orm_1.sql) `now()`),
    status: (0, pg_core_1.varchar)("status").default("Applied"), // Applied, Reversed
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArReceiptApplicationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arReceiptApplications).extend({
    receiptId: zod_1.z.string().min(1),
    invoiceId: zod_1.z.string().min(1),
    amountApplied: zod_1.z.string().min(1),
    status: zod_1.z.string().optional(),
});
// AR Revenue Rules (e.g., 12 Month Ratable)
exports.arRevenueRules = (0, pg_core_1.pgTable)("ar_revenue_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(), // "12 Month Subscription"
    description: (0, pg_core_1.text)("description"),
    durationPeriods: (0, pg_core_1.integer)("duration_periods").default(1),
    recognitionMethod: (0, pg_core_1.varchar)("recognition_method").default("Straight Line"), // Straight Line, Immediate
    enabledFlag: (0, pg_core_1.boolean)("enabled_flag").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArRevenueRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arRevenueRules).extend({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional().nullable(),
    durationPeriods: zod_1.z.number().int().min(1).optional(),
    recognitionMethod: zod_1.z.string().optional(),
    enabledFlag: zod_1.z.boolean().optional(),
});
// AR Revenue Schedules (Detailed recognition plan)
exports.arRevenueSchedules = (0, pg_core_1.pgTable)("ar_revenue_schedules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    invoiceId: (0, pg_core_1.varchar)("invoice_id").notNull(),
    scheduleDate: (0, pg_core_1.timestamp)("schedule_date").notNull(), // When it should be recognized
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    accountClass: (0, pg_core_1.varchar)("account_class").default("Revenue"),
    status: (0, pg_core_1.varchar)("status").default("Pending"), // Pending, Recognized
    periodName: (0, pg_core_1.varchar)("period_name"), // "Jan-26"
    ruleId: (0, pg_core_1.varchar)("rule_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArRevenueScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arRevenueSchedules).extend({
    invoiceId: zod_1.z.string().min(1),
    scheduleDate: zod_1.z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.z.date()),
    amount: zod_1.z.string().min(1),
    accountClass: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    periodName: zod_1.z.string().optional().nullable(),
    ruleId: zod_1.z.string().optional().nullable(),
});
// AR Dunning Templates
exports.arDunningTemplates = (0, pg_core_1.pgTable)("ar_dunning_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    subject: (0, pg_core_1.varchar)("subject").notNull(),
    content: (0, pg_core_1.text)("content"),
    daysOverdueMin: (0, pg_core_1.integer)("days_overdue_min").default(0),
    daysOverdueMax: (0, pg_core_1.integer)("days_overdue_max").default(1000),
    severity: (0, pg_core_1.varchar)("severity").default("Medium"), // Low, Medium, High
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArDunningTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arDunningTemplates).extend({
    name: zod_1.z.string().min(1),
    subject: zod_1.z.string().min(1),
    content: zod_1.z.string().optional().nullable(),
    daysOverdueMin: zod_1.z.number().int().optional(),
    daysOverdueMax: zod_1.z.number().int().optional(),
    severity: zod_1.z.string().optional(),
});
// AR Dunning Runs (Batch History)
exports.arDunningRuns = (0, pg_core_1.pgTable)("ar_dunning_runs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    runDate: (0, pg_core_1.timestamp)("run_date").default((0, drizzle_orm_1.sql) `now()`),
    status: (0, pg_core_1.varchar)("status").default("Completed"), // InProgress, Completed, Failed
    totalInvoicesProcessed: (0, pg_core_1.integer)("total_invoices_processed").default(0),
    totalLettersGenerated: (0, pg_core_1.integer)("total_letters_generated").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArDunningRunSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arDunningRuns).extend({
    runDate: zod_1.z.date().optional(),
    status: zod_1.z.string().optional(),
    totalInvoicesProcessed: zod_1.z.number().optional(),
    totalLettersGenerated: zod_1.z.number().optional(),
});
// AR Collector Tasks
exports.arCollectorTasks = (0, pg_core_1.pgTable)("ar_collector_tasks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    taskType: (0, pg_core_1.varchar)("task_type").notNull(), // Call, Email, Review
    priority: (0, pg_core_1.varchar)("priority").default("Medium"), // Low, Medium, High
    status: (0, pg_core_1.varchar)("status").default("Open"), // Open, InProgress, Completed
    assignedToUser: (0, pg_core_1.varchar)("assigned_to_user"),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    invoiceId: (0, pg_core_1.varchar)("invoice_id"),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArCollectorTaskSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arCollectorTasks).extend({
    taskType: zod_1.z.string().min(1),
    priority: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    assignedToUser: zod_1.z.string().optional().nullable(),
    customerId: zod_1.z.string().min(1),
    invoiceId: zod_1.z.string().optional().nullable(),
    dueDate: zod_1.z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.z.date()).optional().nullable(),
});
// Adjustments
exports.arAdjustments = (0, pg_core_1.pgTable)("ar_adjustments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    invoiceId: (0, pg_core_1.varchar)("invoice_id").notNull(),
    adjustmentType: (0, pg_core_1.varchar)("adjustment_type").notNull(), // 'WriteOff', 'Adjustment'
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    reason: (0, pg_core_1.text)("reason").notNull(),
    status: (0, pg_core_1.varchar)("status").default('Pending'), // 'Pending', 'Approved', 'Rejected'
    glAccountId: (0, pg_core_1.varchar)("gl_account_id"), // Expense Account
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    createdBy: (0, pg_core_1.varchar)("created_by"),
});
exports.insertArAdjustmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arAdjustments);
// AR Period Statuses (Control)
exports.arPeriodStatuses = (0, pg_core_1.pgTable)("ar_period_statuses", {
    periodName: (0, pg_core_1.varchar)("period_name").primaryKey(), // e.g., "Jan-26"
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    glPeriodId: (0, pg_core_1.varchar)("gl_period_id").notNull(),
    status: (0, pg_core_1.varchar)("status").default("Never Opened"), // Never Opened, Future, Open, Closed, Permanently Closed
    auditId: (0, pg_core_1.varchar)("audit_id"), // User who last changed status
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArPeriodStatusSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arPeriodStatuses).extend({
    periodName: zod_1.z.string().min(1),
    ledgerId: zod_1.z.string().min(1),
    glPeriodId: zod_1.z.string().min(1),
    status: zod_1.z.string().optional(),
    auditId: zod_1.z.string().optional().nullable(),
});
// AR System Options (Global Configuration)
exports.arSystemOptions = (0, pg_core_1.pgTable)("ar_system_options", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull().unique(), // One set of options per ledger
    orgId: (0, pg_core_1.varchar)("org_id"), // Operating Unit
    allowOverapplication: (0, pg_core_1.boolean)("allow_overapplication").default(false),
    accountingMethod: (0, pg_core_1.varchar)("accounting_method").default("Accrual"), // Accrual, Cash
    taxMethod: (0, pg_core_1.varchar)("tax_method").default("Standard"), // Standard, Vertex, Avalara
    autoInvoiceBatchSource: (0, pg_core_1.varchar)("auto_invoice_batch_source"),
    defaultCreditLimit: (0, pg_core_1.numeric)("default_credit_limit", { precision: 18, scale: 2 }).default("0"),
    realizedGainsAccount: (0, pg_core_1.varchar)("realized_gains_account"),
    realizedLossesAccount: (0, pg_core_1.varchar)("realized_losses_account"),
    unallocatedRevenueAccount: (0, pg_core_1.varchar)("unallocated_revenue_account"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertArSystemOptionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.arSystemOptions).extend({
    ledgerId: zod_1.z.string().min(1),
    orgId: zod_1.z.string().optional().nullable(),
    allowOverapplication: zod_1.z.boolean().optional(),
    accountingMethod: zod_1.z.string().optional(),
    taxMethod: zod_1.z.string().optional(),
    autoInvoiceBatchSource: zod_1.z.string().optional().nullable(),
    defaultCreditLimit: zod_1.z.string().optional(),
    realizedGainsAccount: zod_1.z.string().optional().nullable(),
    realizedLossesAccount: zod_1.z.string().optional().nullable(),
    unallocatedRevenueAccount: zod_1.z.string().optional().nullable(),
});
//# sourceMappingURL=ar.js.map