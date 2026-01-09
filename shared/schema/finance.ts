import { pgTable, varchar, text, timestamp, numeric, boolean, integer, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== FINANCE MODULE ==========

// 1. Chart of Accounts (COA)
// 1. Chart of Accounts (COA)
// 1. Chart of Accounts (COA)
export const glAccounts = pgTable("gl_accounts_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    accountCode: varchar("account_code").notNull().unique(), // e.g. 1000
    accountName: varchar("account_name").notNull(),
    accountType: varchar("account_type").notNull(), // Asset, Liability, Equity, Revenue, Expense
    parentAccountId: varchar("parent_account_id"), // For hierarchy
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlAccountSchema = createInsertSchema(glAccounts).extend({
    accountCode: z.string().min(1),
    accountName: z.string().min(1),
    accountType: z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
    parentAccountId: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});
export type InsertGlAccount = z.infer<typeof insertGlAccountSchema>;
export type GlAccount = typeof glAccounts.$inferSelect;

// // KEEP LEGACY TABLE
// export const glAccountsLegacy = pgTable("gl_accounts", {
//     id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//     accountCode: varchar("account_code"),
// });

// 2. Fiscal Periods
export const glPeriods = pgTable("gl_periods", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    periodName: varchar("period_name").notNull(), // e.g., "Jan-2026"
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    fiscalYear: integer("fiscal_year").notNull(),
    status: varchar("status").default("Open"), // Open, Closed, Future-Entry
});

export const insertGlPeriodSchema = createInsertSchema(glPeriods).extend({
    periodName: z.string().min(1),
    startDate: z.date(),
    endDate: z.date(),
    fiscalYear: z.number().int(),
    status: z.enum(["Open", "Closed", "Future-Entry"]).optional(),
});
export type InsertGlPeriod = z.infer<typeof insertGlPeriodSchema>;
export type GlPeriod = typeof glPeriods.$inferSelect;

// 3. Journal Headers
// 3. Journal Headers
export const glJournals = pgTable("gl_journals_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    journalNumber: varchar("journal_number").notNull().unique(),
    batchId: varchar("batch_id"), // Link to Batch
    periodId: varchar("period_id"), // Linked to glPeriods
    description: text("description"),
    source: varchar("source").default("Manual"), // Manual, AP, AR, etc.
    status: varchar("status").default("Draft"), // Draft, Posted
    approvalStatus: varchar("approval_status").default("Not Required"), // Not Required, Required, Pending, Approved, Rejected
    reversalJournalId: varchar("reversal_journal_id"), // Link to the reversal entry
    postedDate: timestamp("posted_date"),
    createdBy: varchar("created_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlJournalSchema = createInsertSchema(glJournals).extend({
    journalNumber: z.string().min(1),
    batchId: z.string().optional().nullable(),
    periodId: z.string().optional(),
    description: z.string().optional(),
    source: z.string().optional(),
    status: z.enum(["Draft", "Posted"]).optional(),
    approvalStatus: z.enum(["Not Required", "Required", "Pending", "Approved", "Rejected"]).optional(),
    reversalJournalId: z.string().optional().nullable(),
    postedDate: z.date().optional().nullable(),
    createdBy: z.string().optional(),
});
export type InsertGlJournal = z.infer<typeof insertGlJournalSchema>;
export type GlJournal = typeof glJournals.$inferSelect;

// // KEEP LEGACY TABLE
// export const glJournalsLegacy = pgTable("gl_journals", {
//     id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//     journalNumber: varchar("journal_number"),
// });

// 4. Journal Lines
// 4. Journal Lines
export const glJournalLines = pgTable("gl_journal_lines_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    journalId: varchar("journal_id").notNull(),
    accountId: varchar("account_id").notNull(),
    description: text("description"),

    // Entered Amounts (Transaction Currency)
    currencyCode: varchar("currency_code").notNull().default("USD"),
    enteredDebit: numeric("entered_debit", { precision: 18, scale: 2 }),
    enteredCredit: numeric("entered_credit", { precision: 18, scale: 2 }),

    // Accounted Amounts (Ledger Currency)
    accountedDebit: numeric("accounted_debit", { precision: 18, scale: 2 }),
    accountedCredit: numeric("accounted_credit", { precision: 18, scale: 2 }),

    // For specific rate override
    exchangeRate: numeric("exchange_rate", { precision: 20, scale: 10 }).default("1"),

    // Legacy / Convenience columns mapped to Accounted for backward compat
    debit: numeric("debit", { precision: 18, scale: 2 }).default("0"),
    credit: numeric("credit", { precision: 18, scale: 2 }).default("0"),
});

export const insertGlJournalLineSchema = createInsertSchema(glJournalLines).extend({
    journalId: z.string().min(1),
    accountId: z.string().min(1),
    debit: z.string().optional(),
    credit: z.string().optional(),
    description: z.string().optional(),
    currencyCode: z.string().optional(),
    enteredDebit: z.string().optional(),
    enteredCredit: z.string().optional(),
    accountedDebit: z.string().optional(),
    accountedCredit: z.string().optional(),
    exchangeRate: z.string().optional(),
});
export type InsertGlJournalLine = z.infer<typeof insertGlJournalLineSchema>;
export type GlJournalLine = typeof glJournalLines.$inferSelect;

// // KEEP LEGACY TABLE
// export const glJournalLinesLegacy = pgTable("gl_journal_lines", {
//     id: serial("id").primaryKey(),
//     journalId: varchar("journal_id"),
//     accountId: varchar("account_id"),
// });

// 4.1 Journal Batches
export const glJournalBatches = pgTable("gl_journal_batches", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    batchName: varchar("batch_name").notNull(),
    description: text("description"),
    periodId: varchar("period_id"),
    status: varchar("status").default("Unposted"), // Unposted, Posted
    totalDebit: numeric("total_debit", { precision: 18, scale: 2 }).default("0"),
    totalCredit: numeric("total_credit", { precision: 18, scale: 2 }).default("0"),
    createdAt: timestamp("created_at").default(sql`now()`),
});
export const insertGlJournalBatchSchema = createInsertSchema(glJournalBatches);
export type InsertGlJournalBatch = z.infer<typeof insertGlJournalBatchSchema>;
export type GlJournalBatch = typeof glJournalBatches.$inferSelect;


// 4.2 Journal Approvals
export const glJournalApprovals = pgTable("gl_journal_approvals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    journalId: varchar("journal_id").notNull(),
    approverId: varchar("approver_id"),
    status: varchar("status").default("Pending"), // Pending, Approved, Rejected
    comments: text("comments"),
    actionDate: timestamp("action_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});
export const insertGlJournalApprovalSchema = createInsertSchema(glJournalApprovals);
export type InsertGlJournalApproval = z.infer<typeof insertGlJournalApprovalSchema>;
export type GlJournalApproval = typeof glJournalApprovals.$inferSelect;

// ========== LEGACY / OTHER FINANCE TABLES ==========

export const invoices = pgTable("invoices", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceNumber: varchar("invoice_number").notNull(),
    customerId: varchar("customer_id"),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    dueDate: timestamp("due_date"),
    status: varchar("status").default("draft"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertInvoiceSchema = createInsertSchema(invoices).extend({
    invoiceNumber: z.string().min(1),
    customerId: z.string().optional().nullable(),
    amount: z.string().min(1),
    dueDate: z.date().optional().nullable(),
    status: z.string().optional(),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export const expenses = pgTable("expenses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    category: varchar("category"),
    status: varchar("status").default("pending"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertExpenseSchema = createInsertSchema(expenses).extend({
    description: z.string().min(1),
    amount: z.string().min(1),
    category: z.string().optional(),
    status: z.string().optional(),
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// ========== ADVANCED GL ARCHITECTURE (Phase 2) ==========

// 5. Ledgers (The "Books") - NEW (Using gl_ledgers_new)
// 5. Ledgers (The "Books") - NEW (Using gl_ledgers_v2)
export const glLedgers = pgTable("gl_ledgers_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    currencyCode: varchar("currency_code").notNull().default("USD"),
    calendarId: varchar("calendar_id"),
    coaId: varchar("coa_id"),
    description: text("description"),
    ledgerCategory: varchar("ledger_category").default("PRIMARY"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlLedgerSchema = createInsertSchema(glLedgers);
export type InsertGlLedger = z.infer<typeof insertGlLedgerSchema>;
export type GlLedger = typeof glLedgers.$inferSelect;

// // KEEP LEGACY TABLE TO PREVENT DROP ERROR
// export const glLedgersLegacy = pgTable("gl_ledgers", {
//     id: serial("id").primaryKey(),
//     name: varchar("name").notNull().unique(),
//     currencyCode: varchar("currency_code").notNull().default("USD"),
//     calendarId: varchar("calendar_id"),
//     // coaId might be missing or different, assume basic for now to satisfy Drizzle existence
//     description: text("description"),
//     createdAt: timestamp("created_at").default(sql`now()`),
// });

// 6. COA Segments (Flexfields definition)
export const glSegments = pgTable("gl_segments_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    segmentName: varchar("segment_name").notNull(), // e.g., "Company", "Cost Center", "Account"
    segmentNumber: integer("segment_number").notNull(), // 1, 2, 3...
    isRequired: boolean("is_required").default(true),
    validationSource: varchar("validation_source"), // Table name validator or Value Set ID
    segmentQualifier: varchar("segment_qualifier"), // Balancing, Cost Center, Natural Account, Intercompany
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlSegmentSchema = createInsertSchema(glSegments);
export type InsertGlSegment = z.infer<typeof insertGlSegmentSchema>;
export type GlSegment = typeof glSegments.$inferSelect;

// 11. Custom Validation Rules (CVR)
export const glCrossValidationRules = pgTable("gl_cross_validation_rules_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    ruleName: varchar("rule_name").notNull(),
    description: text("description"),
    enabled: boolean("enabled").default(true),
    errorMessage: text("error_message"),
    // Simplified Rule Definition for Phase 1: 
    // "Include" filter (applies to) AND "Exclude" filter (forbidden)
    // In prod this would be complex boolean logic.
    includeFilter: text("include_filter"), // e.g., "Segment1=100" (Company 100)
    excludeFilter: text("exclude_filter"), // e.g., "Segment3=5000" (R&D Expense)
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlCrossValidationRuleSchema = createInsertSchema(glCrossValidationRules);
export type InsertGlCrossValidationRule = z.infer<typeof insertGlCrossValidationRuleSchema>;
export type GlCrossValidationRule = typeof glCrossValidationRules.$inferSelect;

// 12. GL Balances Cube (Aggregated)
export const glBalances = pgTable("gl_balances_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    codeCombinationId: varchar("code_combination_id").notNull(), // Link to glCodeCombinations
    currencyCode: varchar("currency_code").notNull(),
    periodName: varchar("period_name").notNull(), // e.g. "Jan-2026"
    periodYear: integer("period_year"),
    periodNum: integer("period_num"),

    // Period Activity
    periodNetDr: numeric("period_net_dr", { precision: 18, scale: 2 }).default("0"),
    periodNetCr: numeric("period_net_cr", { precision: 18, scale: 2 }).default("0"),

    // Balances
    beginBalance: numeric("begin_balance", { precision: 18, scale: 2 }).default("0"),
    endBalance: numeric("end_balance", { precision: 18, scale: 2 }).default("0"),

    // Translated Balances (for consolidated reporting)
    translatedFlag: boolean("translated_flag").default(false),

    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertGlBalanceSchema = createInsertSchema(glBalances);
export type InsertGlBalance = z.infer<typeof insertGlBalanceSchema>;
export type GlBalance = typeof glBalances.$inferSelect;

// 13. Intercompany Rules
export const glIntercompanyRules = pgTable("gl_intercompany_rules_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    fromCompany: varchar("from_company").notNull(), // Initiating Legal Entity
    toCompany: varchar("to_company").notNull(), // Receiving Legal Entity
    receivableAccountId: varchar("receivable_account_id").notNull(), // Due From
    payableAccountId: varchar("payable_account_id").notNull(), // Due To
    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlIntercompanyRuleSchema = createInsertSchema(glIntercompanyRules);
export type InsertGlIntercompanyRule = z.infer<typeof insertGlIntercompanyRuleSchema>;
export type GlIntercompanyRule = typeof glIntercompanyRules.$inferSelect;

// 7. Segment Values (The actual checklist for each segment)
export const glSegmentValues = pgTable("gl_segment_values_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    segmentId: varchar("segment_id").notNull(),
    value: varchar("value").notNull(), // e.g., "101", "Sales"
    description: varchar("description"),
    parentValue: varchar("parent_value"), // For hierarchies
    enabled: boolean("enabled").default(true),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlSegmentValueSchema = createInsertSchema(glSegmentValues);
export type InsertGlSegmentValue = z.infer<typeof insertGlSegmentValueSchema>;
export type GlSegmentValue = typeof glSegmentValues.$inferSelect;

// 8. Code Combinations (CCID - The intersection)
export const glCodeCombinations = pgTable("gl_code_combinations_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    code: varchar("code").notNull().unique(), // e.g. "100-200-5000"
    ledgerId: varchar("ledger_id").notNull(),
    segment1: varchar("segment1"), // Company
    segment2: varchar("segment2"), // Cost Center
    segment3: varchar("segment3"), // Natural Account
    segment4: varchar("segment4"), // Product
    segment5: varchar("segment5"), // Intercompany / Future
    accountType: varchar("account_type"), // Inherited from Segment 3 (Natural Account)
    enabledFlag: boolean("enabled_flag").default(true),
    startDateActive: timestamp("start_date_active"),
    endDateActive: timestamp("end_date_active"),
    summaryFlag: boolean("summary_flag").default(false), // Is this a parent node?
});

export const insertGlCodeCombinationSchema = createInsertSchema(glCodeCombinations);
export type InsertGlCodeCombination = z.infer<typeof insertGlCodeCombinationSchema>;
export type GlCodeCombination = typeof glCodeCombinations.$inferSelect;


// 9. Currencies
export const glCurrencies = pgTable("gl_currencies", {
    code: varchar("code").primaryKey(), // USD, EUR
    name: varchar("name").notNull(),
    symbol: varchar("symbol"),
    precision: integer("precision").default(2),
    isActive: boolean("is_active").default(true),
});

export const insertGlCurrencySchema = createInsertSchema(glCurrencies);
export type InsertGlCurrency = z.infer<typeof insertGlCurrencySchema>;
export type GlCurrency = typeof glCurrencies.$inferSelect;

// 10. Daily Rates (Multi-Currency)
export const glDailyRates = pgTable("gl_daily_rates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    fromCurrency: varchar("from_currency").notNull(), // USD
    toCurrency: varchar("to_currency").notNull(), // GBP
    conversionDate: timestamp("conversion_date").notNull(),
    conversionType: varchar("conversion_type").default("Spot"), // Spot, Corporate, User
    rate: numeric("rate", { precision: 20, scale: 10 }).notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlDailyRateSchema = createInsertSchema(glDailyRates);
export type InsertGlDailyRate = z.infer<typeof insertGlDailyRateSchema>;
export type GlDailyRate = typeof glDailyRates.$inferSelect;

// Updated Journal Lines (Multi-Currency Support)
// Note: We are REDEFINING glJournalLines here to add columns.
// In a real migration we would alter table provided by Drizzle kit, 
// likely extending the existing object.
// Given strict "replace file" constraints, I will leave existing export above and append logic documentation
// or better, I will MODIFY the existing glJournalLines definition directly in next tool call.


// Financial Statement Generator (FSG) Schema

export const glReportDefinitions = pgTable("gl_report_definitions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(), // e.g., "Balance Sheet - Standard"
    description: text("description"),
    chartOfAccountsId: varchar("chart_of_accounts_id"), // Optional filter
    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const glReportRows = pgTable("gl_report_rows", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reportId: varchar("report_id").notNull(), // FK to glReportDefinitions
    rowNumber: integer("row_number").notNull(), // 10, 20, 30...
    description: varchar("description").notNull(), // Row Label
    rowType: varchar("row_type").notNull().default("DETAIL"), // DETAIL or CALCULATION

    // Account Filter (Simplified Range)
    // In full implementation, this supports multiple ranges/sets
    accountFilterMin: varchar("account_filter_min"), // e.g. "10000"
    accountFilterMax: varchar("account_filter_max"), // e.g. "19999"

    // Formatting
    indentLevel: integer("indent_level").default(0),
    inverseSign: boolean("inverse_sign").default(false), // Flip credit to positive for reporting

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const glReportColumns = pgTable("gl_report_columns", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reportId: varchar("report_id").notNull(), // FK to glReportDefinitions
    columnNumber: integer("column_number").notNull(), // 1, 2, 3...
    columnHeader: varchar("column_header").notNull(), // "Current Month"

    // Data Definition
    amountType: varchar("amount_type").default("PTD"), // PTD (Period to Date), YTD (Year to Date), QTD
    currencyType: varchar("currency_type").default("E"), // E (Entered), T (Total/Functional)
    ledgerId: varchar("ledger_id"), // Optional override

    createdAt: timestamp("created_at").default(sql`now()`),
});

// Zod Schemas
export const insertGlReportDefinitionSchema = createInsertSchema(glReportDefinitions);
export type InsertGlReportDefinition = z.infer<typeof insertGlReportDefinitionSchema>;
export type GlReportDefinition = typeof glReportDefinitions.$inferSelect;

export const insertGlReportRowSchema = createInsertSchema(glReportRows);
export type InsertGlReportRow = z.infer<typeof insertGlReportRowSchema>;
export type GlReportRow = typeof glReportRows.$inferSelect;

export const insertGlReportColumnSchema = createInsertSchema(glReportColumns);
export type InsertGlReportColumn = z.infer<typeof insertGlReportColumnSchema>;
export type GlReportColumn = typeof glReportColumns.$inferSelect;
