import { pgTable, varchar, text, timestamp, numeric, boolean, integer, serial, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== FINANCE MODULE ==========

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
export const glJournals = pgTable("gl_journals_v2", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    journalNumber: varchar("journal_number").notNull().unique(),
    ledgerId: varchar("ledger_id").notNull().default("PRIMARY"), // Linked to glLedgers
    batchId: varchar("batch_id"), // Link to Batch
    periodId: varchar("period_id"), // Linked to glPeriods
    description: text("description"),
    currencyCode: varchar("currency_code").notNull().default("USD"),
    source: varchar("source").default("Manual"), // Manual, AP, AR, etc.
    status: varchar("status").default("Draft"), // Draft, Processing, Posted
    approvalStatus: varchar("approval_status").default("Not Required"), // Not Required, Required, Pending, Approved, Rejected
    reversalJournalId: varchar("reversal_journal_id"), // Link to the reversal entry
    autoReverse: boolean("auto_reverse").default(false), // Auto-reverse in next period
    postedDate: timestamp("posted_date"),
    createdBy: varchar("created_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlJournalSchema = createInsertSchema(glJournals).extend({
    journalNumber: z.string().min(1),
    ledgerId: z.string().optional(), // Optional for now to support legacy calls defaulting to PRIMARY
    batchId: z.string().optional().nullable(),
    periodId: z.string().optional(),
    description: z.string().optional(),
    currencyCode: z.string().optional().default("USD"),
    source: z.string().optional(),
    status: z.enum(["Draft", "Processing", "Posted"]).optional(),
    approvalStatus: z.enum(["Not Required", "Required", "Pending", "Approved", "Rejected"]).optional(),
    reversalJournalId: z.string().optional().nullable(),
    postedDate: z.date().optional().nullable(),
    createdBy: z.string().optional(),
});
export type InsertGlJournal = z.infer<typeof insertGlJournalSchema>;
export type GlJournal = typeof glJournals.$inferSelect;

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

// 5.1 Ledger Sets (Consolidation Groups)
export const glLedgerSets = pgTable("gl_ledger_sets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const glLedgerSetAssignments = pgTable("gl_ledger_set_assignments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerSetId: varchar("ledger_set_id").notNull(), // FK to glLedgerSets
    ledgerId: varchar("ledger_id").notNull(), // FK to glLedgers
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlLedgerSetSchema = createInsertSchema(glLedgerSets);
export type InsertGlLedgerSet = z.infer<typeof insertGlLedgerSetSchema>;
export type GlLedgerSet = typeof glLedgerSets.$inferSelect;

export const insertGlLedgerSetAssignmentSchema = createInsertSchema(glLedgerSetAssignments);
export type InsertGlLedgerSetAssignment = z.infer<typeof insertGlLedgerSetAssignmentSchema>;
export type GlLedgerSetAssignment = typeof glLedgerSetAssignments.$inferSelect;

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

// 14. Revaluation Runs
export const glRevaluations = pgTable("gl_revaluations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    periodName: varchar("period_name").notNull(), // e.g., "Jan-2026"
    currencyCode: varchar("currency_code").notNull(), // Target currency to revalue
    rateType: varchar("rate_type").notNull().default("Spot"),
    unrealizedGainLossAccountId: varchar("unrealized_gain_loss_account_id").notNull(),
    status: varchar("status").default("Draft"), // Draft, Posted
    journalBatchId: varchar("journal_batch_id"), // Link to generated journal
    createdAt: timestamp("created_at").default(sql`now()`),
});
// 15. Revaluation Entries (FX Gains/Losses)
export const glRevaluationEntries = pgTable("gl_revaluation_entries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    periodName: varchar("period_name").notNull(),
    currency: varchar("currency").notNull(),
    amount: numeric("amount", { precision: 20, scale: 10 }).notNull(),
    fxRate: numeric("fx_rate", { precision: 20, scale: 10 }).notNull(),
    gainLoss: numeric("gain_loss", { precision: 20, scale: 10 }).notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlRevaluationEntrySchema = createInsertSchema(glRevaluationEntries);
export type InsertGlRevaluationEntry = z.infer<typeof insertGlRevaluationEntrySchema>;
export type GlRevaluationEntry = typeof glRevaluationEntries.$inferSelect;

// New table for exchange rates (functional currency conversion)
export const glExchangeRates = pgTable("gl_exchange_rates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    currency: varchar("currency").notNull(), // e.g., EUR, GBP
    periodName: varchar("period_name").notNull(), // e.g., "Jan-2026"
    rateToFunctional: numeric("rate_to_functional", { precision: 20, scale: 10 }).notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlExchangeRateSchema = createInsertSchema(glExchangeRates);
export type InsertGlExchangeRate = z.infer<typeof insertGlExchangeRateSchema>;
export type GlExchangeRate = typeof glExchangeRates.$inferSelect;
export const insertGlRevaluationSchema = createInsertSchema(glRevaluations);
export type InsertGlRevaluation = z.infer<typeof insertGlRevaluationSchema>;
export type GlRevaluation = typeof glRevaluations.$inferSelect;

// Financial Statement Generator (FSG) Schema
// 18. Financial Reporting Engine (FSG) - CONSOLIDATED & UPDATED
export const glReportDefinitions = pgTable("gl_fsg_defs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(), // e.g., "Consolidated Balance Sheet"
    description: text("description"),
    ledgerId: varchar("ledger_id"), // Optional: Specific to a ledger, or null for generic
    chartOfAccountsId: varchar("chart_of_accounts_id"), // Optional filter (kept from old schema)
    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlReportDefinitionSchema = createInsertSchema(glReportDefinitions);
export type InsertGlReportDefinition = z.infer<typeof insertGlReportDefinitionSchema>;
export type GlReportDefinition = typeof glReportDefinitions.$inferSelect;

export const glReportRows = pgTable("gl_fsg_rows", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reportId: varchar("report_id").notNull(), // FK to glReportDefinitions
    rowNumber: integer("row_number").notNull(), // 10, 20, 30...
    description: varchar("description").notNull(), // Row Label
    rowType: varchar("row_type").notNull().default("DETAIL"), // DETAIL or CALCULATION或TITLE

    // Account Filter (Simplified Range)
    accountFilterMin: varchar("account_filter_min"), // e.g. "1000"
    accountFilterMax: varchar("account_filter_max"), // e.g. "1999"
    segmentFilter: varchar("segment_filter"), // e.g. "Segment1=01" (Optional additional refinement)

    // Logics
    calculationFormula: varchar("calculation_formula"), // e.g. "10+20" or "R10+R20" (Simplified)

    // Formatting
    indentLevel: integer("indent_level").default(0),
    inverseSign: boolean("inverse_sign").default(false), // Flip credit to positive for reporting

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlReportRowSchema = createInsertSchema(glReportRows);
export type InsertGlReportRow = z.infer<typeof insertGlReportRowSchema>;
export type GlReportRow = typeof glReportRows.$inferSelect;

export const glReportColumns = pgTable("gl_fsg_cols", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reportId: varchar("report_id").notNull(), // FK to glReportDefinitions
    columnNumber: integer("column_number").notNull(), // 1, 2, 3...

    // Header
    columnHeader: varchar("column_header").notNull(),

    // Data Logic
    amountType: varchar("amount_type").default("PTD"), // PTD (Period to Date), YTD (Year to Date), QTD
    currencyType: varchar("currency_type").default("Functional"), // Functional, Entered, Reporting

    // Time Logic relative to Run Period
    // 0 = Current, -1 = Previous Period
    periodOffset: integer("period_offset").default(0),

    ledgerId: varchar("ledger_id"), // Optional override

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlReportColumnSchema = createInsertSchema(glReportColumns);
export type InsertGlReportColumn = z.infer<typeof insertGlReportColumnSchema>;
export type GlReportColumn = typeof glReportColumns.$inferSelect;

// 15. Mass Allocations (Phase 3)
export const glAllocations = pgTable("gl_allocations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    ledgerId: varchar("ledger_id").notNull(),

    // Formula: A * B / C
    // Pool (A): Source Cost Pool (e.g., Rent Expense)
    poolAccountFilter: varchar("pool_account_filter").notNull(),

    // Basis (B): Driver (e.g., Headcount or SqFt or Revenue)
    basisAccountFilter: varchar("basis_account_filter").notNull(),

    // Target (C? No, Target is where result goes)
    // Actually Formula is: Target = Pool * (Basis / Total Basis)

    targetAccountPattern: varchar("target_account_pattern").notNull(), // e.g. "Segment1=Basis.Segment1, Segment2=Pool.Segment2..."
    offsetAccount: varchar("offset_account").notNull(), // Where to credit the pool

    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlAllocationSchema = createInsertSchema(glAllocations);
export type InsertGlAllocation = z.infer<typeof insertGlAllocationSchema>;
export type GlAllocation = typeof glAllocations.$inferSelect;

// 16. Security: Data Access Sets
export const glDataAccessSets = pgTable("gl_data_access_sets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(),
    description: text("description"),
    ledgerId: varchar("ledger_id").notNull(), // The primary ledger this set controls

    // Access Controls (Simplified for MVP)
    // "Read Only" or "Read/Write"
    accessLevel: varchar("access_level").default("Read/Write"),

    // Segment Security (JSON for flexibility)
    // e.g. { "segment1": ["100", "200"], "segment2": "ALL" }
    segmentSecurity: jsonb("segment_security"),

    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlDataAccessSetSchema = createInsertSchema(glDataAccessSets);
export type InsertGlDataAccessSet = z.infer<typeof insertGlDataAccessSetSchema>;
export type GlDataAccessSet = typeof glDataAccessSets.$inferSelect;

export const glDataAccessSetAssignments = pgTable("gl_data_access_set_assignments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    dataAccessSetId: varchar("data_access_set_id").notNull(),
    assignedBy: varchar("assigned_by"),
    assignedAt: timestamp("assigned_at").default(sql`now()`),
});

export const insertGlDataAccessSetAssignmentSchema = createInsertSchema(glDataAccessSetAssignments);
export type InsertGlDataAccessSetAssignment = z.infer<typeof insertGlDataAccessSetAssignmentSchema>;
export type GlDataAccessSetAssignment = typeof glDataAccessSetAssignments.$inferSelect;

// 17. Audit: Immutable Action Logs
export const glAuditLogs = pgTable("gl_audit_logs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    action: varchar("action").notNull(), // e.g. "JOURNAL_POST", "PERIOD_CLOSE"
    entity: varchar("entity").notNull(), // e.g. "GlJournal", "GlPeriod"
    entityId: varchar("entity_id").notNull(),

    // Who did it?
    userId: varchar("user_id").notNull(),

    // Context
    details: jsonb("details"), // generic payload
    beforeState: jsonb("before_state"), // Snapshot before
    afterState: jsonb("after_state"), // Snapshot after

    timestamp: timestamp("timestamp").default(sql`now()`).notNull(),
});

export const insertGlAuditLogSchema = createInsertSchema(glAuditLogs);
export type InsertGlAuditLog = z.infer<typeof insertGlAuditLogSchema>;
export type GlAuditLog = typeof glAuditLogs.$inferSelect;

// 19. Budgeting (Budgetary Control & Funds Check)
export const glBudgets = pgTable("gl_budgets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // e.g., "2026 Corporate Budget"
    description: text("description"),
    ledgerId: varchar("ledger_id").notNull(),
    status: varchar("status").default("Open"), // Open, Frozen, Closed
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const glBudgetBalances = pgTable("gl_budget_balances", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    budgetId: varchar("budget_id").notNull(),
    periodName: varchar("period_name").notNull(),
    codeCombinationId: varchar("code_combination_id").notNull(),
    budgetAmount: numeric("budget_amount", { precision: 18, scale: 2 }).default("0"),
    encumbranceAmount: numeric("encumbrance_amount", { precision: 18, scale: 2 }).default("0"), // Commitments
    actualAmount: numeric("actual_amount", { precision: 18, scale: 2 }).default("0"), // Posted
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const glBudgetControlRules = pgTable("gl_budget_control_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    ruleName: varchar("rule_name").notNull(),
    controlLevel: varchar("control_level").default("Absolute"), // Absolute (Reject), Advisory (Warn), Track (None)

    // Segment specific controls
    // { "segment3": { "min": "5000", "max": "5999" } } (e.g. all Expense accounts)
    controlFilters: jsonb("control_filters"),

    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlBudgetSchema = createInsertSchema(glBudgets);
export const insertGlBudgetBalanceSchema = createInsertSchema(glBudgetBalances);
export const insertGlBudgetControlRuleSchema = createInsertSchema(glBudgetControlRules);

export type GlBudget = typeof glBudgets.$inferSelect;
export type GlBudgetBalance = typeof glBudgetBalances.$inferSelect;
export type GlBudgetControlRule = typeof glBudgetControlRules.$inferSelect;

// 20. Recurring Journals (Automation)
export const glRecurringJournals = pgTable("gl_recurring_journals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    ledgerId: varchar("ledger_id").notNull(),
    currencyCode: varchar("currency_code").default("USD"),

    // Schedule
    scheduleType: varchar("schedule_type").notNull(), // Monthly, Quarterly, One-Time
    nextRunDate: timestamp("next_run_date").notNull(),
    lastRunDate: timestamp("last_run_date"),

    status: varchar("status").default("Active"), // Active, Inactive

    // Template (Simplified JSON storage for lines)
    // { "lines": [ { "accountId": "...", "debit": "100", ... } ] }
    journalTemplate: jsonb("journal_template").notNull(),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlRecurringJournalSchema = createInsertSchema(glRecurringJournals);
export type InsertGlRecurringJournal = z.infer<typeof insertGlRecurringJournalSchema>;
export type GlRecurringJournal = typeof glRecurringJournals.$inferSelect;
