"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertCashForecastSchema = exports.cashForecasts = exports.insertCashRevaluationHistorySchema = exports.cashRevaluationHistory = exports.insertCashBankBranchSchema = exports.cashBankBranches = exports.insertCashBankSchema = exports.cashBanks = exports.insertCashZbaSweepSchema = exports.cashZbaSweeps = exports.insertCashZbaStructureSchema = exports.cashZbaStructures = exports.insertCashMatchingGroupSchema = exports.cashMatchingGroups = exports.insertCashReconciliationRuleSchema = exports.cashReconciliationRules = exports.insertCashTransactionSchema = exports.cashTransactions = exports.insertCashStatementLineSchema = exports.cashStatementLines = exports.insertCashStatementHeaderSchema = exports.cashStatementHeaders = exports.insertCashBankAccountSchema = exports.cashBankAccounts = void 0;
// Cash Management Schema
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// Bank Accounts: Internal representation of bank accounts
exports.cashBankAccounts = (0, pg_core_1.pgTable)("cash_bank_accounts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    accountNumber: (0, pg_core_1.varchar)("account_number", { length: 100 }).notNull(),
    bankName: (0, pg_core_1.varchar)("bank_name", { length: 255 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency", { length: 10 }).default("USD"),
    swiftCode: (0, pg_core_1.varchar)("swift_code", { length: 50 }),
    ledgerId: (0, pg_core_1.varchar)("ledger_id"), // Link to GL Ledger
    secondaryLedgerId: (0, pg_core_1.varchar)("secondary_ledger_id"), // Secondary reporting ledger
    glAccountId: (0, pg_core_1.varchar)("gl_account_id"), // Legacy field, keeping for compatibility
    cashAccountCCID: (0, pg_core_1.integer)("cash_account_ccid"), // The Asset Account (e.g. 1010)
    cashClearingCCID: (0, pg_core_1.integer)("cash_clearing_ccid"), // The Liability/Contra Account (e.g. 2010)
    currentBalance: (0, pg_core_1.numeric)("current_balance", { precision: 20, scale: 2 }).default("0"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("Active"), // 'Pending', 'Active', 'Rejected'
    pendingData: (0, pg_core_1.jsonb)("pending_data"), // New data waiting for approval
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`)
});
exports.insertCashBankAccountSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashBankAccounts);
// Bank Statement Headers: The file/import event itself
exports.cashStatementHeaders = (0, pg_core_1.pgTable)("cash_statement_headers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bankAccountId: (0, pg_core_1.varchar)("bank_account_id").notNull(),
    statementNumber: (0, pg_core_1.varchar)("statement_number", { length: 50 }),
    statementDate: (0, pg_core_1.timestamp)("statement_date").notNull(),
    openingBalance: (0, pg_core_1.numeric)("opening_balance", { precision: 20, scale: 2 }),
    closingBalance: (0, pg_core_1.numeric)("closing_balance", { precision: 20, scale: 2 }),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("Uploaded"), // Uploaded, Validated, Processed
    importFormat: (0, pg_core_1.varchar)("import_format", { length: 20 }), // CSV, MT940, BAI2
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`)
});
exports.insertCashStatementHeaderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashStatementHeaders);
// Bank Statement Lines: External transactions from bank feed/CSV
exports.cashStatementLines = (0, pg_core_1.pgTable)("cash_statement_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    headerId: (0, pg_core_1.varchar)("header_id"), // Link to header
    bankAccountId: (0, pg_core_1.varchar)("bank_account_id").notNull(),
    transactionDate: (0, pg_core_1.timestamp)("transaction_date").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    referenceNumber: (0, pg_core_1.varchar)("reference_number", { length: 100 }),
    reconciled: (0, pg_core_1.boolean)("reconciled").default(false),
    isIntraday: (0, pg_core_1.boolean)("is_intraday").default(false),
    matchingGroupId: (0, pg_core_1.varchar)("matching_group_id"), // Link to reconciliation batch
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`)
});
exports.insertCashStatementLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashStatementLines);
// Cash Transactions: Link between internal source (AR/AP) and Cash module
exports.cashTransactions = (0, pg_core_1.pgTable)("cash_transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bankAccountId: (0, pg_core_1.varchar)("bank_account_id").notNull(),
    sourceModule: (0, pg_core_1.varchar)("source_module", { length: 20 }).notNull(), // 'AP', 'AR', 'GL'
    sourceId: (0, pg_core_1.varchar)("source_id").notNull(), // ID of Payment or Receipt
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(),
    transactionDate: (0, pg_core_1.timestamp)("transaction_date").default((0, drizzle_orm_1.sql) `now()`),
    reference: (0, pg_core_1.varchar)("reference", { length: 100 }),
    description: (0, pg_core_1.text)("description"), // For manual transactions
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("Unreconciled"), // 'Unreconciled', 'Cleared'
    matchingGroupId: (0, pg_core_1.varchar)("matching_group_id")
});
exports.insertCashTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashTransactions);
// Reconciliation Rules: High-volume matching logic definitions
exports.cashReconciliationRules = (0, pg_core_1.pgTable)("cash_reconciliation_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    bankAccountId: (0, pg_core_1.varchar)("bank_account_id"), // Optional: can be global or specific
    ruleName: (0, pg_core_1.varchar)("rule_name").notNull(),
    priority: (0, pg_core_1.integer)("priority").default(10),
    matchingCriteria: (0, pg_core_1.jsonb)("matching_criteria").notNull(), // { dateToleranceDays: 3, refFuzzyFactor: 0.8, etc }
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertCashReconciliationRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashReconciliationRules);
// Matching Groups: Records of reconciliation runs (Batch)
exports.cashMatchingGroups = (0, pg_core_1.pgTable)("cash_matching_groups", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    reconciledDate: (0, pg_core_1.timestamp)("reconciled_date").default((0, drizzle_orm_1.sql) `now()`),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    method: (0, pg_core_1.varchar)("method").notNull(), // AUTO, MANUAL, AI
    batchId: (0, pg_core_1.varchar)("batch_id"), // Statement UUID
});
exports.insertCashMatchingGroupSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashMatchingGroups);
// ZBA Hierarchies: Treasury structures for automated sweeping
exports.cashZbaStructures = (0, pg_core_1.pgTable)("cash_zba_structures", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    masterAccountId: (0, pg_core_1.varchar)("master_account_id").notNull(),
    subAccountId: (0, pg_core_1.varchar)("sub_account_id").notNull(),
    targetBalance: (0, pg_core_1.numeric)("target_balance", { precision: 20, scale: 2 }).default("0"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("Active"), // 'Pending', 'Active', 'Rejected'
    pendingData: (0, pg_core_1.jsonb)("pending_data"), // New data waiting for approval
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`)
});
exports.insertCashZbaStructureSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashZbaStructures);
// ZBA Sweep History: Log of automated fund movements
exports.cashZbaSweeps = (0, pg_core_1.pgTable)("cash_zba_sweeps", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    structureId: (0, pg_core_1.varchar)("structure_id").notNull(),
    sweepDate: (0, pg_core_1.timestamp)("sweep_date").default((0, drizzle_orm_1.sql) `now()`),
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(),
    direction: (0, pg_core_1.varchar)("direction", { length: 20 }).notNull(), // 'SUB_TO_MASTER', 'MASTER_TO_SUB'
    transactionId: (0, pg_core_1.varchar)("transaction_id"), // Link to Cash Transaction
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("Completed")
});
exports.insertCashZbaSweepSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashZbaSweeps);
// --- Phase 4: Master Data Normalization ---
// Banks: Top-level financial institutions
exports.cashBanks = (0, pg_core_1.pgTable)("cash_banks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bankName: (0, pg_core_1.varchar)("bank_name", { length: 255 }).notNull().unique(), // e.g., "JPMorgan Chase"
    countryCode: (0, pg_core_1.varchar)("country_code", { length: 2 }), // ISO 3166-1 alpha-2
    taxPayerId: (0, pg_core_1.varchar)("tax_payer_id", { length: 50 }),
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`)
});
exports.insertCashBankSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashBanks);
// Bank Branches: Specific locations/entities of a bank
exports.cashBankBranches = (0, pg_core_1.pgTable)("cash_bank_branches", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bankId: (0, pg_core_1.varchar)("bank_id").notNull(), // FK to cashBanks (logical)
    branchName: (0, pg_core_1.varchar)("branch_name", { length: 255 }).notNull(), // e.g., "New York Main"
    routingNumber: (0, pg_core_1.varchar)("routing_number", { length: 50 }), // ABA, Sort Code, etc.
    bicCode: (0, pg_core_1.varchar)("bic_code", { length: 11 }), // SWIFT/BIC
    addressLine1: (0, pg_core_1.varchar)("address_line1", { length: 255 }),
    city: (0, pg_core_1.varchar)("city", { length: 100 }),
    state: (0, pg_core_1.varchar)("state", { length: 100 }),
    zipCode: (0, pg_core_1.varchar)("zip_code", { length: 20 }),
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`)
});
exports.insertCashBankBranchSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashBankBranches);
// Revaluation History: Log of FX revaluation events
exports.cashRevaluationHistory = (0, pg_core_1.pgTable)("cash_revaluation_history", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bankAccountId: (0, pg_core_1.varchar)("bank_account_id").notNull(),
    currency: (0, pg_core_1.varchar)("currency", { length: 10 }).notNull(),
    revaluationDate: (0, pg_core_1.timestamp)("revaluation_date").default((0, drizzle_orm_1.sql) `now()`),
    systemRate: (0, pg_core_1.numeric)("system_rate", { precision: 20, scale: 6 }).notNull(), // Rate from DB
    usedRate: (0, pg_core_1.numeric)("used_rate", { precision: 20, scale: 6 }).notNull(), // Rate actually used (override or system)
    rateType: (0, pg_core_1.varchar)("rate_type", { length: 20 }).default("Corporate"), // 'Corporate', 'Spot', 'User'
    unrealizedGainLoss: (0, pg_core_1.numeric)("unrealized_gain_loss", { precision: 20, scale: 2 }).notNull(),
    postedJournalId: (0, pg_core_1.varchar)("posted_journal_id"), // Link to GL/SLA
    userId: (0, pg_core_1.varchar)("user_id").default("system"),
});
exports.insertCashRevaluationHistorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashRevaluationHistory);
// Forecast adjustments: Manual entries for cash forecasting
exports.cashForecasts = (0, pg_core_1.pgTable)("cash_forecasts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bankAccountId: (0, pg_core_1.varchar)("bank_account_id"), // Optional if global, but usually specific
    forecastDate: (0, pg_core_1.timestamp)("forecast_date").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency", { length: 10 }).default("USD"),
    description: (0, pg_core_1.text)("description").notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 20 }).default("MANUAL"), // MANUAL, TAX, PAYROLL
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`)
});
exports.insertCashForecastSchema = (0, drizzle_zod_1.createInsertSchema)(exports.cashForecasts);
//# sourceMappingURL=cash.js.map