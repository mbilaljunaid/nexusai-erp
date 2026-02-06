"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertGlPeriodCloseStatusSchema = exports.glPeriodCloseStatus = exports.insertGlPeriodCloseChecklistTemplateSchema = exports.glPeriodCloseChecklistTemplates = exports.insertGlCloseTaskSchema = exports.glCloseTasks = exports.insertGlSegmentHierarchySchema = exports.glSegmentHierarchies = exports.insertGlSegmentValueSchema = exports.glSegmentValues = exports.insertGlIntercompanyRuleSchema = exports.glIntercompanyRules = exports.insertGlBalanceSchema = exports.glBalances = exports.insertGlCrossValidationRuleSchema = exports.glCrossValidationRules = exports.insertGlSegmentSchema = exports.glSegments = exports.insertGlCoaStructureSchema = exports.glCoaStructures = exports.insertGlValueSetSchema = exports.glValueSets = exports.insertGlLedgerSetAssignmentSchema = exports.insertGlLedgerSetSchema = exports.glLedgerSetAssignments = exports.glLedgerSets = exports.insertGlLedgerRelationshipSchema = exports.glLedgerRelationships = exports.insertGlLegalEntitySchema = exports.glLegalEntities = exports.insertGlLedgerSchema = exports.glLedgers = exports.insertExpenseSchema = exports.expenses = exports.insertInvoiceSchema = exports.invoices = exports.insertGlJournalApprovalSchema = exports.glJournalApprovals = exports.insertGlJournalBatchSchema = exports.glJournalBatches = exports.insertGlJournalLineSchema = exports.glJournalLines = exports.insertGlRecurringJournalSchema = exports.glRecurringJournals = exports.insertGlJournalSchema = exports.glJournals = exports.insertGlPeriodSchema = exports.glPeriods = exports.insertGlAccountSchema = exports.glAccounts = void 0;
exports.insertGlBudgetControlRuleSchema = exports.insertGlBudgetBalanceSchema = exports.insertGlBudgetSchema = exports.glBudgetControlRules = exports.glBudgetBalances = exports.glBudgets = exports.insertGlEliminationDefinitionSchema = exports.glEliminationDefinitions = exports.insertGlConsolidationRunSchema = exports.glConsolidationRuns = exports.glAuditLogs = exports.glEntries = exports.insertGlDataAccessSetAssignmentSchema = exports.glDataAccessSetAssignments = exports.insertGlDataAccessSetSchema = exports.glDataAccessSets = exports.insertGlApprovalHistorySchema = exports.glApprovalHistory = exports.insertGlApprovalRuleSchema = exports.glApprovalRules = exports.insertGlAutoPostRuleSchema = exports.glAutoPostRules = exports.insertGlAllocationSchema = exports.glAllocations = exports.insertGlReportDefinitionSchema = exports.glReportDefinitions = exports.insertGlReportColumnSchema = exports.glReportColumns = exports.insertGlFsgColumnSetSchema = exports.glFsgColumnSets = exports.insertGlReportRowSchema = exports.glReportRows = exports.insertGlFsgRowSetSchema = exports.glFsgRowSets = exports.insertGlRevaluationSchema = exports.insertGlExchangeRateSchema = exports.glExchangeRates = exports.insertGlRevaluationEntrySchema = exports.glRevaluationEntries = exports.glRevaluations = exports.insertGlDailyRateSchema = exports.glDailyRates = exports.insertGlCurrencySchema = exports.glCurrencies = exports.insertGlCodeCombinationSchema = exports.glCodeCombinations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== FINANCE MODULE ==========
// 1. Chart of Accounts (COA)
exports.glAccounts = (0, pg_core_1.pgTable)("gl_accounts_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    accountCode: (0, pg_core_1.varchar)("account_code").notNull().unique(), // e.g. 1000
    accountName: (0, pg_core_1.varchar)("account_name").notNull(),
    accountType: (0, pg_core_1.varchar)("account_type").notNull(), // Asset, Liability, Equity, Revenue, Expense
    parentAccountId: (0, pg_core_1.varchar)("parent_account_id"), // For hierarchy
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlAccountSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glAccounts).extend({
    accountCode: zod_1.z.string().min(1),
    accountName: zod_1.z.string().min(1),
    accountType: zod_1.z.enum(["Asset", "Liability", "Equity", "Revenue", "Expense"]),
    parentAccountId: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
});
// 2. Fiscal Periods
exports.glPeriods = (0, pg_core_1.pgTable)("gl_periods", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(), // e.g., "Jan-2026"
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull().default("PRIMARY"), // Multi-ledger calendar support
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    fiscalYear: (0, pg_core_1.integer)("fiscal_year").notNull(),
    status: (0, pg_core_1.varchar)("status").default("Open"), // Open, Closed, Future-Entry
});
exports.insertGlPeriodSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glPeriods).extend({
    periodName: zod_1.z.string().min(1),
    ledgerId: zod_1.z.string().optional(),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    fiscalYear: zod_1.z.number().int(),
    status: zod_1.z.enum(["Open", "Closed", "Future-Entry"]).optional(),
});
// 2.1 AR Period Statuses (New Table for AR Period Control)
// 3. Journal Headers
exports.glJournals = (0, pg_core_1.pgTable)("gl_journals_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    journalNumber: (0, pg_core_1.varchar)("journal_number").notNull().unique(),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull().default("PRIMARY"), // Linked to glLedgers
    batchId: (0, pg_core_1.varchar)("batch_id"), // Link to Batch
    createdBy: (0, pg_core_1.varchar)("created_by"), // User who created the journal
    periodId: (0, pg_core_1.varchar)("period_id"), // Linked to glPeriods
    description: (0, pg_core_1.text)("description"),
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull().default("USD"),
    source: (0, pg_core_1.varchar)("source").default("Manual"), // Manual, AP, AR, etc.
    status: (0, pg_core_1.varchar)("status").default("Draft"), // Draft, Processing, Posted
    approvalStatus: (0, pg_core_1.varchar)("approval_status").default("Not Required"), // Not Required, Required, Pending, Approved, Rejected
    reversalJournalId: (0, pg_core_1.varchar)("reversal_journal_id"), // Link to the reversal entry
    autoReverse: (0, pg_core_1.boolean)("auto_reverse").default(false), // Auto-reverse in next period
    postedDate: (0, pg_core_1.timestamp)("posted_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlJournalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glJournals).extend({
    journalNumber: zod_1.z.string().min(1),
    ledgerId: zod_1.z.string().optional(), // Optional for now to support legacy calls defaulting to PRIMARY
    batchId: zod_1.z.string().optional().nullable(),
    periodId: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    currencyCode: zod_1.z.string().optional().default("USD"),
    source: zod_1.z.string().optional(),
    status: zod_1.z.enum(["Draft", "Processing", "Posted"]).optional(),
    approvalStatus: zod_1.z.enum(["Not Required", "Required", "Pending", "Approved", "Rejected"]).optional(),
    reversalJournalId: zod_1.z.string().optional().nullable(),
    postedDate: zod_1.z.date().optional().nullable(),
});
// 3.1 Recurring Journals (Template for Periodic Auto-Generation)
exports.glRecurringJournals = (0, pg_core_1.pgTable)("gl_recurring_journals", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    recurringBatchName: (0, pg_core_1.varchar)("recurring_batch_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    // Schedule
    frequency: (0, pg_core_1.varchar)("frequency").default("Monthly"), // Monthly, Weekly, Quarterly
    status: (0, pg_core_1.varchar)("status").default("Active"), // Active, Inactive, Completed
    nextRunDate: (0, pg_core_1.timestamp)("next_run_date"),
    lastRunDate: (0, pg_core_1.timestamp)("last_run_date"),
    // Content: Logic to allocate or copy
    // Simplified: Link to a "Template" Journal or contain lines directly?
    // Enterprise Parity: Usually a "Skeleton" Journal
    templateJournalId: (0, pg_core_1.varchar)("template_journal_id"), // FK to glJournals which acts as template
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlRecurringJournalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glRecurringJournals);
// 4. Journal Lines
exports.glJournalLines = (0, pg_core_1.pgTable)("gl_journal_lines_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    journalId: (0, pg_core_1.varchar)("journal_id").notNull(),
    accountId: (0, pg_core_1.varchar)("account_id").notNull(),
    description: (0, pg_core_1.text)("description"),
    // Entered Amounts (Transaction Currency)
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull().default("USD"),
    enteredDebit: (0, pg_core_1.numeric)("entered_debit", { precision: 18, scale: 2 }),
    enteredCredit: (0, pg_core_1.numeric)("entered_credit", { precision: 18, scale: 2 }),
    // Accounted Amounts (Ledger Currency)
    accountedDebit: (0, pg_core_1.numeric)("accounted_debit", { precision: 18, scale: 2 }),
    accountedCredit: (0, pg_core_1.numeric)("accounted_credit", { precision: 18, scale: 2 }),
    // For specific rate override
    exchangeRate: (0, pg_core_1.numeric)("exchange_rate", { precision: 20, scale: 10 }).default("1"),
    // Legacy / Convenience columns mapped to Accounted for backward compat
    debit: (0, pg_core_1.numeric)("debit", { precision: 18, scale: 2 }).default("0"),
    credit: (0, pg_core_1.numeric)("credit", { precision: 18, scale: 2 }).default("0"),
});
exports.insertGlJournalLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glJournalLines).extend({
    journalId: zod_1.z.string().min(1),
    accountId: zod_1.z.string().min(1),
    debit: zod_1.z.string().optional(),
    credit: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    currencyCode: zod_1.z.string().optional(),
    enteredDebit: zod_1.z.string().optional(),
    enteredCredit: zod_1.z.string().optional(),
    accountedDebit: zod_1.z.string().optional(),
    accountedCredit: zod_1.z.string().optional(),
    exchangeRate: zod_1.z.string().optional(),
});
// 4.1 Journal Batches
exports.glJournalBatches = (0, pg_core_1.pgTable)("gl_journal_batches", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    batchName: (0, pg_core_1.varchar)("batch_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    periodId: (0, pg_core_1.varchar)("period_id"),
    status: (0, pg_core_1.varchar)("status").default("Unposted"), // Unposted, Posted
    totalDebit: (0, pg_core_1.numeric)("total_debit", { precision: 18, scale: 2 }).default("0"),
    totalCredit: (0, pg_core_1.numeric)("total_credit", { precision: 18, scale: 2 }).default("0"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlJournalBatchSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glJournalBatches);
// 4.2 Journal Approvals
exports.glJournalApprovals = (0, pg_core_1.pgTable)("gl_journal_approvals", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    journalId: (0, pg_core_1.varchar)("journal_id").notNull(),
    approverId: (0, pg_core_1.varchar)("approver_id"),
    status: (0, pg_core_1.varchar)("status").default("Pending"), // Pending, Approved, Rejected
    comments: (0, pg_core_1.text)("comments"),
    actionDate: (0, pg_core_1.timestamp)("action_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlJournalApprovalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glJournalApprovals);
// ========== LEGACY / OTHER FINANCE TABLES ==========
exports.invoices = (0, pg_core_1.pgTable)("invoices", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    invoiceNumber: (0, pg_core_1.varchar)("invoice_number").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    status: (0, pg_core_1.varchar)("status").default("draft"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertInvoiceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.invoices).extend({
    invoiceNumber: zod_1.z.string().min(1),
    customerId: zod_1.z.string().optional().nullable(),
    amount: zod_1.z.string().min(1),
    dueDate: zod_1.z.date().optional().nullable(),
    status: zod_1.z.string().optional(),
});
exports.expenses = (0, pg_core_1.pgTable)("expenses", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    description: (0, pg_core_1.text)("description").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    category: (0, pg_core_1.varchar)("category"),
    status: (0, pg_core_1.varchar)("status").default("pending"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertExpenseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.expenses).extend({
    description: zod_1.z.string().min(1),
    amount: zod_1.z.string().min(1),
    category: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
// ========== ADVANCED GL ARCHITECTURE (Phase 2) ==========
// 5. Ledgers (The "Books") - NEW (Using gl_ledgers_v2)
exports.glLedgers = (0, pg_core_1.pgTable)("gl_ledgers_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull().default("USD"),
    calendarId: (0, pg_core_1.varchar)("calendar_id"),
    coaId: (0, pg_core_1.varchar)("coa_id"),
    description: (0, pg_core_1.text)("description"),
    ledgerCategory: (0, pg_core_1.varchar)("ledger_category").default("PRIMARY"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlLedgerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glLedgers);
// 5.2 Legal Entities
exports.glLegalEntities = (0, pg_core_1.pgTable)("gl_legal_entities", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    taxId: (0, pg_core_1.varchar)("tax_id"),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(), // One-to-Many: Ledger can have multiple Legal Entities
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlLegalEntitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.glLegalEntities);
// 5.3 Ledger Relationships (Primary to Secondary/Reporting)
exports.glLedgerRelationships = (0, pg_core_1.pgTable)("gl_ledger_relationships", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    primaryLedgerId: (0, pg_core_1.varchar)("primary_ledger_id").notNull(),
    secondaryLedgerId: (0, pg_core_1.varchar)("secondary_ledger_id").notNull(),
    relationshipType: (0, pg_core_1.varchar)("relationship_type").notNull(), // SECONDARY, REPORTING
    conversionLevel: (0, pg_core_1.varchar)("conversion_level").default("JOURNAL"), // SUBLEDGER, JOURNAL, BALANCE
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlLedgerRelationshipSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glLedgerRelationships);
// 5.1 Ledger Sets (Consolidation Groups)
exports.glLedgerSets = (0, pg_core_1.pgTable)("gl_ledger_sets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.glLedgerSetAssignments = (0, pg_core_1.pgTable)("gl_ledger_set_assignments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerSetId: (0, pg_core_1.varchar)("ledger_set_id").notNull(), // FK to glLedgerSets
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(), // FK to glLedgers
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlLedgerSetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glLedgerSets);
exports.insertGlLedgerSetAssignmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glLedgerSetAssignments);
// ================= MASTER DATA MANAGEMENT (Chunk 4) =================
// 6.1 Value Sets (Validation Rules)
exports.glValueSets = (0, pg_core_1.pgTable)("gl_value_sets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    validationType: (0, pg_core_1.varchar)("validation_type").default("Independent"), // Independent, Dependent, Table
    formatType: (0, pg_core_1.varchar)("format_type").default("Char"), // Char, Number, Date
    maxLength: (0, pg_core_1.integer)("max_length"),
    uppercaseOnly: (0, pg_core_1.boolean)("uppercase_only").default(true),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlValueSetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glValueSets);
// 6.2 CoA Structures (The Container)
exports.glCoaStructures = (0, pg_core_1.pgTable)("gl_coa_structures", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    delimiter: (0, pg_core_1.varchar)("delimiter").default("-"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlCoaStructureSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glCoaStructures);
// 6.3 Segments (The Dimensions)
exports.glSegments = (0, pg_core_1.pgTable)("gl_segments_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    coaStructureId: (0, pg_core_1.varchar)("coa_structure_id").notNull(),
    segmentName: (0, pg_core_1.varchar)("segment_name").notNull(), // e.g., Company, CostCenter
    segmentNumber: (0, pg_core_1.integer)("segment_number").notNull(), // 1, 2, 3...
    columnName: (0, pg_core_1.varchar)("column_name").notNull(), // segment1, segment2...
    valueSetId: (0, pg_core_1.varchar)("value_set_id").notNull(), // Link to validation
    prompt: (0, pg_core_1.varchar)("prompt").notNull(),
    displayWidth: (0, pg_core_1.integer)("display_width").default(20),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlSegmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glSegments);
// 11. Custom Validation Rules (CVR)
exports.glCrossValidationRules = (0, pg_core_1.pgTable)("gl_cross_validation_rules_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(true),
    errorMessage: (0, pg_core_1.text)("error_message"),
    // Logic: If CodeCombination matches 'conditionFilter', then it MUST match 'validationFilter'.
    // If it does NOT match 'validationFilter', it is invalid.
    conditionFilter: (0, pg_core_1.text)("condition_filter"), // e.g. "Segment3=1000" (If Account is 1000)
    validationFilter: (0, pg_core_1.text)("validation_filter"), // e.g. "Segment2=000" (Then Dept must be 000)
    // Legacy support or alternative logic
    includeFilter: (0, pg_core_1.text)("include_filter"),
    excludeFilter: (0, pg_core_1.text)("exclude_filter"),
    errorAction: (0, pg_core_1.varchar)("error_action").default("Error"), // Error, Warning
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlCrossValidationRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glCrossValidationRules).extend({
    conditionFilter: zod_1.z.string().optional(),
    validationFilter: zod_1.z.string().optional(),
    errorAction: zod_1.z.enum(["Error", "Warning"]).optional(),
});
// 12. GL Balances Cube (Aggregated)
exports.glBalances = (0, pg_core_1.pgTable)("gl_balances_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    codeCombinationId: (0, pg_core_1.varchar)("code_combination_id").notNull(), // Link to glCodeCombinations
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull(),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(), // e.g. "Jan-2026"
    periodYear: (0, pg_core_1.integer)("period_year"),
    periodNum: (0, pg_core_1.integer)("period_num"),
    // Period Activity
    periodNetDr: (0, pg_core_1.numeric)("period_net_dr", { precision: 18, scale: 2 }).default("0"),
    periodNetCr: (0, pg_core_1.numeric)("period_net_cr", { precision: 18, scale: 2 }).default("0"),
    // Balances
    beginBalance: (0, pg_core_1.numeric)("begin_balance", { precision: 18, scale: 2 }).default("0"),
    endBalance: (0, pg_core_1.numeric)("end_balance", { precision: 18, scale: 2 }).default("0"),
    // Translated Balances (for consolidated reporting)
    translatedFlag: (0, pg_core_1.boolean)("translated_flag").default(false),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
}, (table) => {
    return {
        // Composite Index for Consolidation Aggregation (Ledger + Period)
        ledgerPeriodIdx: (0, pg_core_1.index)("gl_balances_ledger_period_idx").on(table.ledgerId, table.periodName),
    };
});
exports.insertGlBalanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glBalances);
// 13. Intercompany Rules
exports.glIntercompanyRules = (0, pg_core_1.pgTable)("gl_intercompany_rules_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    fromCompany: (0, pg_core_1.varchar)("from_company").notNull(), // Initiating Legal Entity
    toCompany: (0, pg_core_1.varchar)("to_company").notNull(), // Receiving Legal Entity
    receivableAccountId: (0, pg_core_1.varchar)("receivable_account_id").notNull(), // Due From
    payableAccountId: (0, pg_core_1.varchar)("payable_account_id").notNull(), // Due To
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlIntercompanyRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glIntercompanyRules);
// 7. Segment Values (The actual checklist for each segment)
// 6.4 Segment Values (The Data)
exports.glSegmentValues = (0, pg_core_1.pgTable)("gl_segment_values_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    valueSetId: (0, pg_core_1.varchar)("value_set_id").notNull(),
    value: (0, pg_core_1.varchar)("value").notNull(),
    description: (0, pg_core_1.text)("description"),
    parentValueId: (0, pg_core_1.varchar)("parent_value_id"), // For simple hierarchy
    isSummary: (0, pg_core_1.boolean)("is_summary").default(false), // Parent node?
    enabledFlag: (0, pg_core_1.boolean)("enabled_flag").default(true),
    startDateActive: (0, pg_core_1.timestamp)("start_date_active"),
    endDateActive: (0, pg_core_1.timestamp)("end_date_active"),
    accountType: (0, pg_core_1.varchar)("account_type"), // Asset, Liability, etc. (Only for Natural Account segment)
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlSegmentValueSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glSegmentValues);
// 6.5 Segment Hierarchies (Complex Trees)
exports.glSegmentHierarchies = (0, pg_core_1.pgTable)("gl_segment_hierarchies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    valueSetId: (0, pg_core_1.varchar)("value_set_id").notNull(),
    parentValue: (0, pg_core_1.varchar)("parent_value").notNull(),
    childValue: (0, pg_core_1.varchar)("child_value").notNull(),
    treeName: (0, pg_core_1.varchar)("tree_name").default("DEFAULT"), // Support multiple versions
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlSegmentHierarchySchema = (0, drizzle_zod_1.createInsertSchema)(exports.glSegmentHierarchies);
// 14. Period Close Tasks
exports.glCloseTasks = (0, pg_core_1.pgTable)("gl_close_tasks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    periodId: (0, pg_core_1.varchar)("period_id").notNull(),
    taskName: (0, pg_core_1.varchar)("task_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // PENDING, COMPLETED, NOT_APPLICABLE
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    completedBy: (0, pg_core_1.varchar)("completed_by"),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlCloseTaskSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glCloseTasks);
// 14.1 Period Close Checklist Template
exports.glPeriodCloseChecklistTemplates = (0, pg_core_1.pgTable)("gl_period_close_checklist_templates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    taskName: (0, pg_core_1.varchar)("task_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    isRequired: (0, pg_core_1.boolean)("is_required").default(true),
    sequence: (0, pg_core_1.integer)("sequence").default(10),
    dayOffset: (0, pg_core_1.integer)("day_offset").default(0), // T-Minus days (e.g. -2)
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlPeriodCloseChecklistTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glPeriodCloseChecklistTemplates);
// 14.2 Period Close Status (Dashboard Metrics)
exports.glPeriodCloseStatus = (0, pg_core_1.pgTable)("gl_period_close_status", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    periodId: (0, pg_core_1.varchar)("period_id").notNull(),
    totalTasks: (0, pg_core_1.integer)("total_tasks").default(0),
    completedTasks: (0, pg_core_1.integer)("completed_tasks").default(0),
    blockingExceptions: (0, pg_core_1.integer)("blocking_exceptions").default(0),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlPeriodCloseStatusSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glPeriodCloseStatus);
// 8. Code Combinations (CCID - The intersection)
exports.glCodeCombinations = (0, pg_core_1.pgTable)("gl_code_combinations_v2", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    code: (0, pg_core_1.varchar)("code").notNull().unique(), // e.g. "100-200-5000"
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    segment1: (0, pg_core_1.varchar)("segment1"), // Company
    segment2: (0, pg_core_1.varchar)("segment2"), // Cost Center
    segment3: (0, pg_core_1.varchar)("segment3"), // Natural Account
    segment4: (0, pg_core_1.varchar)("segment4"), // Product
    segment5: (0, pg_core_1.varchar)("segment5"), // Intercompany / Future
    segment6: (0, pg_core_1.varchar)("segment6"),
    segment7: (0, pg_core_1.varchar)("segment7"),
    segment8: (0, pg_core_1.varchar)("segment8"),
    segment9: (0, pg_core_1.varchar)("segment9"),
    segment10: (0, pg_core_1.varchar)("segment10"),
    accountType: (0, pg_core_1.varchar)("account_type"), // Inherited from Segment 3 (Natural Account)
    enabledFlag: (0, pg_core_1.boolean)("enabled_flag").default(true),
    startDateActive: (0, pg_core_1.timestamp)("start_date_active"),
    endDateActive: (0, pg_core_1.timestamp)("end_date_active"),
    summaryFlag: (0, pg_core_1.boolean)("summary_flag").default(false), // Is this a parent node?
});
exports.insertGlCodeCombinationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glCodeCombinations);
// 9. Currencies
exports.glCurrencies = (0, pg_core_1.pgTable)("gl_currencies", {
    code: (0, pg_core_1.varchar)("code").primaryKey(), // USD, EUR
    name: (0, pg_core_1.varchar)("name").notNull(),
    symbol: (0, pg_core_1.varchar)("symbol"),
    precision: (0, pg_core_1.integer)("precision").default(2),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
});
exports.insertGlCurrencySchema = (0, drizzle_zod_1.createInsertSchema)(exports.glCurrencies);
// 10. Daily Rates (Multi-Currency)
exports.glDailyRates = (0, pg_core_1.pgTable)("gl_daily_rates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    fromCurrency: (0, pg_core_1.varchar)("from_currency").notNull(), // USD
    toCurrency: (0, pg_core_1.varchar)("to_currency").notNull(), // GBP
    conversionDate: (0, pg_core_1.timestamp)("conversion_date").notNull(),
    conversionType: (0, pg_core_1.varchar)("conversion_type").default("Spot"), // Spot, Corporate, User
    rate: (0, pg_core_1.numeric)("rate", { precision: 20, scale: 10 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
}, (table) => {
    return {
        // Unique Index for FX Lookup speed and integrity
        rateIdx: (0, pg_core_1.uniqueIndex)("gl_daily_rates_lookup_idx").on(table.fromCurrency, table.toCurrency, table.conversionDate),
    };
});
exports.insertGlDailyRateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glDailyRates);
// 14. Revaluation Runs
exports.glRevaluations = (0, pg_core_1.pgTable)("gl_revaluations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(), // e.g., "Jan-2026"
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull(), // Target currency to revalue
    rateType: (0, pg_core_1.varchar)("rate_type").notNull().default("Spot"),
    unrealizedGainLossAccountId: (0, pg_core_1.varchar)("unrealized_gain_loss_account_id").notNull(),
    status: (0, pg_core_1.varchar)("status").default("Draft"), // Draft, Posted
    journalBatchId: (0, pg_core_1.varchar)("journal_batch_id"), // Link to generated journal
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 15. Revaluation Entries (FX Gains/Losses)
exports.glRevaluationEntries = (0, pg_core_1.pgTable)("gl_revaluation_entries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(),
    currency: (0, pg_core_1.varchar)("currency").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 10 }).notNull(),
    fxRate: (0, pg_core_1.numeric)("fx_rate", { precision: 20, scale: 10 }).notNull(),
    gainLoss: (0, pg_core_1.numeric)("gain_loss", { precision: 20, scale: 10 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlRevaluationEntrySchema = (0, drizzle_zod_1.createInsertSchema)(exports.glRevaluationEntries);
// New table for exchange rates (functional currency conversion)
exports.glExchangeRates = (0, pg_core_1.pgTable)("gl_exchange_rates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    currency: (0, pg_core_1.varchar)("currency").notNull(), // e.g., EUR, GBP
    periodName: (0, pg_core_1.varchar)("period_name").notNull(), // e.g., "Jan-2026"
    rateToFunctional: (0, pg_core_1.numeric)("rate_to_functional", { precision: 20, scale: 10 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlExchangeRateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glExchangeRates);
exports.insertGlRevaluationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glRevaluations);
// Financial Statement Generator (FSG) Schema - REUSABLE SETS MODEL
// 18.1 Row Sets
exports.glFsgRowSets = (0, pg_core_1.pgTable)("gl_fsg_row_sets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    ledgerId: (0, pg_core_1.varchar)("ledger_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlFsgRowSetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glFsgRowSets);
exports.glReportRows = (0, pg_core_1.pgTable)("gl_fsg_rows", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    rowSetId: (0, pg_core_1.varchar)("row_set_id").notNull(), // FK to glFsgRowSets
    rowNumber: (0, pg_core_1.integer)("row_number").notNull(), // 10, 20, 30...
    description: (0, pg_core_1.varchar)("description").notNull(), // Row Label
    rowType: (0, pg_core_1.varchar)("row_type").notNull().default("DETAIL"), // DETAIL, CALCULATION, TITLE
    // Account Filter (Multi-segment range support)
    accountFilterMin: (0, pg_core_1.varchar)("account_filter_min"),
    accountFilterMax: (0, pg_core_1.varchar)("account_filter_max"),
    segmentFilter: (0, pg_core_1.jsonb)("segment_filter"), // e.g. { "Segment1": "01", "Segment2": ["100", "200"] }
    calculationFormula: (0, pg_core_1.varchar)("calculation_formula"),
    indentLevel: (0, pg_core_1.integer)("indent_level").default(0),
    inverseSign: (0, pg_core_1.boolean)("inverse_sign").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlReportRowSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glReportRows);
// 18.2 Column Sets
exports.glFsgColumnSets = (0, pg_core_1.pgTable)("gl_fsg_column_sets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    ledgerId: (0, pg_core_1.varchar)("ledger_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlFsgColumnSetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glFsgColumnSets);
exports.glReportColumns = (0, pg_core_1.pgTable)("gl_fsg_cols", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    columnSetId: (0, pg_core_1.varchar)("column_set_id").notNull(), // FK to glFsgColumnSets
    columnNumber: (0, pg_core_1.integer)("column_number").notNull(),
    columnHeader: (0, pg_core_1.varchar)("column_header").notNull(),
    amountType: (0, pg_core_1.varchar)("amount_type").default("PTD"), // PTD, YTD, QTD
    currencyType: (0, pg_core_1.varchar)("currency_type").default("Functional"),
    periodOffset: (0, pg_core_1.integer)("period_offset").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlReportColumnSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glReportColumns);
// 18.3 Report Definitions (Templates)
exports.glReportDefinitions = (0, pg_core_1.pgTable)("gl_fsg_defs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    rowSetId: (0, pg_core_1.varchar)("row_set_id").notNull(),
    columnSetId: (0, pg_core_1.varchar)("column_set_id").notNull(),
    ledgerId: (0, pg_core_1.varchar)("ledger_id"),
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlReportDefinitionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glReportDefinitions);
// 15. Mass Allocations (Phase 3)
exports.glAllocations = (0, pg_core_1.pgTable)("gl_allocations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    // Formula: A * B / C
    // Pool (A): Source Cost Pool (e.g., Rent Expense)
    poolAccountFilter: (0, pg_core_1.varchar)("pool_account_filter").notNull(),
    // Basis (B): Driver (e.g., Headcount or SqFt or Revenue)
    basisAccountFilter: (0, pg_core_1.varchar)("basis_account_filter").notNull(),
    // Target (C? No, Target is where result goes)
    // Actually Formula is: Target = Pool * (Basis / Total Basis)
    targetAccountPattern: (0, pg_core_1.varchar)("target_account_pattern").notNull(), // e.g. "Segment1=Basis.Segment1, Segment2=Pool.Segment2..."
    offsetAccount: (0, pg_core_1.varchar)("offset_account").notNull(), // Where to credit the pool
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlAllocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glAllocations);
// Chunk 5: Auto-Post Rules
exports.glAutoPostRules = (0, pg_core_1.pgTable)("gl_auto_post_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    criteriaName: (0, pg_core_1.text)("criteria_name").notNull(),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    source: (0, pg_core_1.varchar)("source"), // Filter by Source
    category: (0, pg_core_1.varchar)("category"), // Filter by Category
    amountLimit: (0, pg_core_1.numeric)("amount_limit", { precision: 18, scale: 2 }), // Only auto-post if total < limit
    effectiveDateFrom: (0, pg_core_1.timestamp)("effective_date_from"),
    priority: (0, pg_core_1.integer)("priority").default(10), // Added priority
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlAutoPostRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glAutoPostRules);
// 4.3 Jouranl Approval Rules
exports.glApprovalRules = (0, pg_core_1.pgTable)("gl_approval_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    minAmount: (0, pg_core_1.numeric)("min_amount", { precision: 18, scale: 2 }).default("0"),
    maxAmount: (0, pg_core_1.numeric)("max_amount", { precision: 18, scale: 2 }),
    source: (0, pg_core_1.varchar)("source"),
    category: (0, pg_core_1.varchar)("category"),
    approverRole: (0, pg_core_1.varchar)("approver_role"), // e.g. "Controller"
    approverUserId: (0, pg_core_1.varchar)("approver_user_id"),
    priority: (0, pg_core_1.integer)("priority").default(10),
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    ruleName: (0, pg_core_1.varchar)("rule_name"), // Legacy column restoration
});
exports.insertGlApprovalRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glApprovalRules);
// 4.4 Journal Approval History
exports.glApprovalHistory = (0, pg_core_1.pgTable)("gl_approval_history", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    journalId: (0, pg_core_1.varchar)("journal_id").notNull(),
    action: (0, pg_core_1.varchar)("action").notNull(), // SUBMIT, APPROVE, REJECT
    actorId: (0, pg_core_1.varchar)("actor_id").notNull(),
    comments: (0, pg_core_1.text)("comments"),
    actionDate: (0, pg_core_1.timestamp)("action_date").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlApprovalHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.glApprovalHistory);
// 16. Security: Data Access Sets
exports.glDataAccessSets = (0, pg_core_1.pgTable)("gl_data_access_sets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(), // The primary ledger this set controls
    // Access Controls (Simplified for MVP)
    // "Read Only" or "Read/Write"
    accessLevel: (0, pg_core_1.varchar)("access_level").default("Read/Write"),
    // Segment Security (JSON for flexibility)
    // e.g. { "segment1": ["100", "200"], "segment2": "ALL" }
    segmentSecurity: (0, pg_core_1.jsonb)("segment_security"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlDataAccessSetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glDataAccessSets);
exports.glDataAccessSetAssignments = (0, pg_core_1.pgTable)("gl_data_access_set_assignments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    dataAccessSetId: (0, pg_core_1.varchar)("data_access_set_id").notNull(),
    assignedBy: (0, pg_core_1.varchar)("assigned_by"),
    assignedAt: (0, pg_core_1.timestamp)("assigned_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlDataAccessSetAssignmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glDataAccessSetAssignments);
// ========== LEGACY COMPATIBILITY ==========
// Legacy: Simple Journal Entry (Used by FinanceGlIntegrationService, Tax, etc.) - gl_entries
exports.glEntries = (0, pg_core_1.pgTable)("gl_entries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    journalDate: (0, pg_core_1.timestamp)("journalDate").notNull(),
    description: (0, pg_core_1.varchar)("description").notNull(),
    debitAccount: (0, pg_core_1.varchar)("debitAccount").notNull(),
    debitAmount: (0, pg_core_1.numeric)("debitAmount", { precision: 18, scale: 2 }).notNull(),
    creditAccount: (0, pg_core_1.varchar)("creditAccount").notNull(),
    creditAmount: (0, pg_core_1.numeric)("creditAmount", { precision: 18, scale: 2 }).notNull(),
    status: (0, pg_core_1.varchar)("status").default("draft"),
    createdAt: (0, pg_core_1.timestamp)("createdAt").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updatedAt").default((0, drizzle_orm_1.sql) `now()`), // TypeORM auto-update
});
// 17. Audit: Immutable Action Logs
exports.glAuditLogs = (0, pg_core_1.pgTable)("gl_audit_logs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    action: (0, pg_core_1.varchar)("action").notNull(), // e.g. "JOURNAL_POST", "PERIOD_CLOSE"
    entity: (0, pg_core_1.varchar)("entity").notNull(), // e.g. "GlJournal", "GlPeriod"
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    details: (0, pg_core_1.jsonb)("details"),
    ipAddress: (0, pg_core_1.varchar)("ip_address"),
    sessionId: (0, pg_core_1.varchar)("session_id"),
    beforeState: (0, pg_core_1.jsonb)("before_state"),
    afterState: (0, pg_core_1.jsonb)("after_state"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").default((0, drizzle_orm_1.sql) `now()`),
});
// 19. Consolidation Runs
exports.glConsolidationRuns = (0, pg_core_1.pgTable)("gl_consolidation_runs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerSetId: (0, pg_core_1.varchar)("ledger_set_id").notNull(), // The group being consolidated
    periodId: (0, pg_core_1.varchar)("period_id").notNull(),
    status: (0, pg_core_1.varchar)("status").default("Pending"), // Pending, Running, Completed, Error
    runDate: (0, pg_core_1.timestamp)("run_date").default((0, drizzle_orm_1.sql) `now()`),
    completedDate: (0, pg_core_1.timestamp)("completed_date"),
    totalEliminations: (0, pg_core_1.numeric)("total_eliminations", { precision: 18, scale: 2 }).default("0"),
    errorLog: (0, pg_core_1.text)("error_log"), // Detailed run log
});
exports.insertGlConsolidationRunSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glConsolidationRuns);
// 19.1 Elimination Rules (Definitions)
exports.glEliminationDefinitions = (0, pg_core_1.pgTable)("gl_elimination_definitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    ledgerSetId: (0, pg_core_1.varchar)("ledger_set_id"), // Optional scope
    // Match Criteria
    matchRule: (0, pg_core_1.varchar)("match_rule"), // e.g. "Segment3=4000" (Intercompany Payables)
    // Elimination Logic
    eliminationLedgerId: (0, pg_core_1.varchar)("elimination_ledger_id"), // Where to post the elimination entry
    thresholdAmount: (0, pg_core_1.numeric)("threshold_amount", { precision: 18, scale: 2 }), // Minimum amount to process
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlEliminationDefinitionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glEliminationDefinitions);
// 19. Budgeting (Budgetary Control & Funds Check)
exports.glBudgets = (0, pg_core_1.pgTable)("gl_budgets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(), // e.g., "2026 Corporate Budget"
    description: (0, pg_core_1.text)("description"),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    status: (0, pg_core_1.varchar)("status").default("Open"), // Open, Frozen, Closed
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.glBudgetBalances = (0, pg_core_1.pgTable)("gl_budget_balances", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    budgetId: (0, pg_core_1.varchar)("budget_id").notNull(),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(),
    codeCombinationId: (0, pg_core_1.varchar)("code_combination_id").notNull(),
    budgetAmount: (0, pg_core_1.numeric)("budget_amount", { precision: 18, scale: 2 }).default("0"),
    encumbranceAmount: (0, pg_core_1.numeric)("encumbrance_amount", { precision: 18, scale: 2 }).default("0"), // Commitments
    actualAmount: (0, pg_core_1.numeric)("actual_amount", { precision: 18, scale: 2 }).default("0"), // Posted
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.glBudgetControlRules = (0, pg_core_1.pgTable)("gl_budget_control_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    controlLevel: (0, pg_core_1.varchar)("control_level").default("Absolute"), // Absolute (Reject), Advisory (Warn), Track (None)
    // Segment specific controls
    // { "segment3": { "min": "5000", "max": "5999" } } (e.g. all Expense accounts)
    controlFilters: (0, pg_core_1.jsonb)("control_filters"),
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlBudgetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glBudgets);
exports.insertGlBudgetBalanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glBudgetBalances);
exports.insertGlBudgetControlRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glBudgetControlRules);
//# sourceMappingURL=finance.js.map