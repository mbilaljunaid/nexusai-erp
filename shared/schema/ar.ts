// server/shared/schema/ar.ts
import { pgTable, varchar, text, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// AR Customers (Registry/Party Level)
export const arCustomers = pgTable("ar_customers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
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
    siteName: z.string().min(1),
    address: z.string().min(1),
    isBillTo: z.boolean().optional(),
    isShipTo: z.boolean().optional(),
    primaryFlag: z.boolean().optional(),
});

export type InsertArCustomerSite = z.infer<typeof insertArCustomerSiteSchema>;
export type ArCustomerSite = typeof arCustomerSites.$inferSelect;

// AR Invoices (Sales Invoices)
export const arInvoices = pgTable("ar_invoices", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(), // Party
    accountId: varchar("account_id"), // Linked Account (Oracle Parity)
    siteId: varchar("site_id"), // Bill-to Site (Oracle Parity)
    invoiceNumber: varchar("invoice_number").notNull().unique(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }).default("0"),
    totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    dueDate: timestamp("due_date"),
    status: varchar("status").default("Draft"), // Draft, Sent, PartiallyPaid, Paid, Overdue, Cancelled
    description: text("description"),
    glAccountId: varchar("gl_account_id"),
    revenueScheduleId: varchar("revenue_schedule_id"),
    revenueRuleId: varchar("revenue_rule_id"), // Link to defining rule
    recognitionStatus: varchar("recognition_status").default("Pending"), // Pending, InProgress, Completed
    transactionClass: varchar("transaction_class").default("INV"), // INV, CM (Credit Memo), DM (Debit Memo), CB (Chargeback)
    sourceTransactionId: varchar("source_transaction_id"), // Original invoice for CM/CB
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArInvoiceSchema = createInsertSchema(arInvoices).extend({
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
    transactionClass: z.string().optional(),
    sourceTransactionId: z.string().optional().nullable(),
});

export type InsertArInvoice = z.infer<typeof insertArInvoiceSchema>;
export type ArInvoice = typeof arInvoices.$inferSelect;

// AR Receipts (Incoming Payments)
export const arReceipts = pgTable("ar_receipts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(),
    accountId: varchar("account_id"),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    receiptDate: timestamp("receipt_date"),
    paymentMethod: varchar("payment_method"), // Bank, Wire, CreditCard, Check
    transactionId: varchar("transaction_id"),
    status: varchar("status").default("Completed"), // Applied, Unapplied, Reversed
    invoiceId: varchar("invoice_id"), // Optional if unapplied receipt
    unappliedAmount: numeric("unapplied_amount", { precision: 18, scale: 2 }).default("0"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArReceiptSchema = createInsertSchema(arReceipts).extend({
    customerId: z.string().min(1),
    accountId: z.string().optional().nullable(),
    amount: z.string().min(1),
    receiptDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional().nullable(),
    status: z.string().optional(),
    invoiceId: z.string().optional().nullable(),
    unappliedAmount: z.string().optional(),
});

export type InsertArReceipt = z.infer<typeof insertArReceiptSchema>;
export type ArReceipt = typeof arReceipts.$inferSelect;

// AR Receipt Applications (1:N linking)
export const arReceiptApplications = pgTable("ar_receipt_applications", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    receiptId: varchar("receipt_id").notNull(),
    invoiceId: varchar("invoice_id").notNull(),
    amountApplied: numeric("amount_applied", { precision: 18, scale: 2 }).notNull(),
    applicationDate: timestamp("application_date").default(sql`now()`),
    status: varchar("status").default("Applied"), // Applied, Reversed
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArReceiptApplicationSchema = createInsertSchema(arReceiptApplications).extend({
    receiptId: z.string().min(1),
    invoiceId: z.string().min(1),
    amountApplied: z.string().min(1),
    status: z.string().optional(),
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
