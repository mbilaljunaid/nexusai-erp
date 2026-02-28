import { pgTable, varchar, numeric, timestamp, text, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";
export * from "./schema/index";

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
