
// Cash Management Schema
import { pgTable, varchar, numeric, timestamp, integer, boolean, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Bank Accounts: Internal representation of bank accounts
export const cashBankAccounts = pgTable("cash_bank_accounts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    accountNumber: varchar("account_number", { length: 100 }).notNull(),
    bankName: varchar("bank_name", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("USD"),
    swiftCode: varchar("swift_code", { length: 50 }),
    ledgerId: varchar("ledger_id"), // Link to GL Ledger
    secondaryLedgerId: varchar("secondary_ledger_id"), // Secondary reporting ledger
    glAccountId: varchar("gl_account_id"), // Legacy field, keeping for compatibility
    cashAccountCCID: integer("cash_account_ccid"), // The Asset Account (e.g. 1010)
    cashClearingCCID: integer("cash_clearing_ccid"), // The Liability/Contra Account (e.g. 2010)
    currentBalance: numeric("current_balance", { precision: 20, scale: 2 }).default("0"),
    status: varchar("status", { length: 20 }).default("Active"), // 'Pending', 'Active', 'Rejected'
    pendingData: jsonb("pending_data"), // New data waiting for approval
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`)
});

export const insertCashBankAccountSchema = createInsertSchema(cashBankAccounts);
export type CashBankAccount = typeof cashBankAccounts.$inferSelect;
export type InsertCashBankAccount = z.infer<typeof insertCashBankAccountSchema>;



// Bank Statement Headers: The file/import event itself
export const cashStatementHeaders = pgTable("cash_statement_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bankAccountId: varchar("bank_account_id").notNull(),
    statementNumber: varchar("statement_number", { length: 50 }),
    statementDate: timestamp("statement_date").notNull(),
    openingBalance: numeric("opening_balance", { precision: 20, scale: 2 }),
    closingBalance: numeric("closing_balance", { precision: 20, scale: 2 }),
    status: varchar("status", { length: 20 }).default("Uploaded"), // Uploaded, Validated, Processed
    importFormat: varchar("import_format", { length: 20 }), // CSV, MT940, BAI2
    createdAt: timestamp("created_at").default(sql`now()`)
});

export const insertCashStatementHeaderSchema = createInsertSchema(cashStatementHeaders);
export type CashStatementHeader = typeof cashStatementHeaders.$inferSelect;
export type InsertCashStatementHeader = z.infer<typeof insertCashStatementHeaderSchema>;

// Bank Statement Lines: External transactions from bank feed/CSV
export const cashStatementLines = pgTable("cash_statement_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    headerId: varchar("header_id"), // Link to header
    bankAccountId: varchar("bank_account_id").notNull(),
    transactionDate: timestamp("transaction_date").notNull(),
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    description: text("description"),
    referenceNumber: varchar("reference_number", { length: 100 }),
    reconciled: boolean("reconciled").default(false),
    isIntraday: boolean("is_intraday").default(false),
    matchingGroupId: varchar("matching_group_id"), // Link to reconciliation batch
    createdAt: timestamp("created_at").default(sql`now()`)
});

export const insertCashStatementLineSchema = createInsertSchema(cashStatementLines);
export type CashStatementLine = typeof cashStatementLines.$inferSelect;
export type InsertCashStatementLine = z.infer<typeof insertCashStatementLineSchema>;


// Cash Transactions: Link between internal source (AR/AP) and Cash module
export const cashTransactions = pgTable("cash_transactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bankAccountId: varchar("bank_account_id").notNull(),
    sourceModule: varchar("source_module", { length: 20 }).notNull(), // 'AP', 'AR', 'GL'
    sourceId: varchar("source_id").notNull(), // ID of Payment or Receipt
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    transactionDate: timestamp("transaction_date").default(sql`now()`),
    reference: varchar("reference", { length: 100 }),
    description: text("description"), // For manual transactions
    status: varchar("status", { length: 20 }).default("Unreconciled"), // 'Unreconciled', 'Cleared'
    matchingGroupId: varchar("matching_group_id")
});

export const insertCashTransactionSchema = createInsertSchema(cashTransactions);
export type CashTransaction = typeof cashTransactions.$inferSelect;
export type InsertCashTransaction = z.infer<typeof insertCashTransactionSchema>;

// Reconciliation Rules: High-volume matching logic definitions
export const cashReconciliationRules = pgTable("cash_reconciliation_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    bankAccountId: varchar("bank_account_id"), // Optional: can be global or specific
    ruleName: varchar("rule_name").notNull(),
    priority: integer("priority").default(10),
    matchingCriteria: jsonb("matching_criteria").notNull(), // { dateToleranceDays: 3, refFuzzyFactor: 0.8, etc }
    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertCashReconciliationRuleSchema = createInsertSchema(cashReconciliationRules);
export type InsertCashReconciliationRule = z.infer<typeof insertCashReconciliationRuleSchema>;
export type CashReconciliationRule = typeof cashReconciliationRules.$inferSelect;

// Matching Groups: Records of reconciliation runs (Batch)
export const cashMatchingGroups = pgTable("cash_matching_groups", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reconciledDate: timestamp("reconciled_date").default(sql`now()`),
    userId: varchar("user_id").notNull(),
    method: varchar("method").notNull(), // AUTO, MANUAL, AI
    batchId: varchar("batch_id"), // Statement UUID
});

export const insertCashMatchingGroupSchema = createInsertSchema(cashMatchingGroups);
export type InsertCashMatchingGroup = z.infer<typeof insertCashMatchingGroupSchema>;
export type CashMatchingGroup = typeof cashMatchingGroups.$inferSelect;

// ZBA Hierarchies: Treasury structures for automated sweeping
export const cashZbaStructures = pgTable("cash_zba_structures", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    masterAccountId: varchar("master_account_id").notNull(),
    subAccountId: varchar("sub_account_id").notNull(),
    targetBalance: numeric("target_balance", { precision: 20, scale: 2 }).default("0"),
    status: varchar("status", { length: 20 }).default("Active"), // 'Pending', 'Active', 'Rejected'
    pendingData: jsonb("pending_data"), // New data waiting for approval
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`)
});

export const insertCashZbaStructureSchema = createInsertSchema(cashZbaStructures);
export type InsertCashZbaStructure = z.infer<typeof insertCashZbaStructureSchema>;
export type CashZbaStructure = typeof cashZbaStructures.$inferSelect;

// ZBA Sweep History: Log of automated fund movements
export const cashZbaSweeps = pgTable("cash_zba_sweeps", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    structureId: varchar("structure_id").notNull(),
    sweepDate: timestamp("sweep_date").default(sql`now()`),
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    direction: varchar("direction", { length: 20 }).notNull(), // 'SUB_TO_MASTER', 'MASTER_TO_SUB'
    transactionId: varchar("transaction_id"), // Link to Cash Transaction
    status: varchar("status", { length: 20 }).default("Completed")
});

export const insertCashZbaSweepSchema = createInsertSchema(cashZbaSweeps);
export type InsertCashZbaSweep = z.infer<typeof insertCashZbaSweepSchema>;
export type CashZbaSweep = typeof cashZbaSweeps.$inferSelect;

// --- Phase 4: Master Data Normalization ---

// Banks: Top-level financial institutions
export const cashBanks = pgTable("cash_banks", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bankName: varchar("bank_name", { length: 255 }).notNull().unique(), // e.g., "JPMorgan Chase"
    countryCode: varchar("country_code", { length: 2 }), // ISO 3166-1 alpha-2
    taxPayerId: varchar("tax_payer_id", { length: 50 }),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`)
});

export const insertCashBankSchema = createInsertSchema(cashBanks);
export type InsertCashBank = z.infer<typeof insertCashBankSchema>;
export type CashBank = typeof cashBanks.$inferSelect;

// Bank Branches: Specific locations/entities of a bank
export const cashBankBranches = pgTable("cash_bank_branches", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bankId: varchar("bank_id").notNull(), // FK to cashBanks (logical)
    branchName: varchar("branch_name", { length: 255 }).notNull(), // e.g., "New York Main"
    routingNumber: varchar("routing_number", { length: 50 }), // ABA, Sort Code, etc.
    bicCode: varchar("bic_code", { length: 11 }), // SWIFT/BIC
    addressLine1: varchar("address_line1", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    zipCode: varchar("zip_code", { length: 20 }),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`)
});

export const insertCashBankBranchSchema = createInsertSchema(cashBankBranches);
export type InsertCashBankBranch = z.infer<typeof insertCashBankBranchSchema>;
export type CashBankBranch = typeof cashBankBranches.$inferSelect;

// Revaluation History: Log of FX revaluation events
export const cashRevaluationHistory = pgTable("cash_revaluation_history", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bankAccountId: varchar("bank_account_id").notNull(),
    currency: varchar("currency", { length: 10 }).notNull(),
    revaluationDate: timestamp("revaluation_date").default(sql`now()`),
    systemRate: numeric("system_rate", { precision: 20, scale: 6 }).notNull(), // Rate from DB
    usedRate: numeric("used_rate", { precision: 20, scale: 6 }).notNull(), // Rate actually used (override or system)
    rateType: varchar("rate_type", { length: 20 }).default("Corporate"), // 'Corporate', 'Spot', 'User'
    unrealizedGainLoss: numeric("unrealized_gain_loss", { precision: 20, scale: 2 }).notNull(),
    postedJournalId: varchar("posted_journal_id"), // Link to GL/SLA
    userId: varchar("user_id").default("system"),
});

export const insertCashRevaluationHistorySchema = createInsertSchema(cashRevaluationHistory);
export type InsertCashRevaluationHistory = z.infer<typeof insertCashRevaluationHistorySchema>;
export type CashRevaluationHistory = typeof cashRevaluationHistory.$inferSelect;




// Forecast adjustments: Manual entries for cash forecasting
export const cashForecasts = pgTable("cash_forecasts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bankAccountId: varchar("bank_account_id"), // Optional if global, but usually specific
    forecastDate: timestamp("forecast_date").notNull(),
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("USD"),
    description: text("description").notNull(),
    type: varchar("type", { length: 20 }).default("MANUAL"), // MANUAL, TAX, PAYROLL
    createdAt: timestamp("created_at").default(sql`now()`)
});

export const insertCashForecastSchema = createInsertSchema(cashForecasts);
export type InsertCashForecast = z.infer<typeof insertCashForecastSchema>;
export type CashForecast = typeof cashForecasts.$inferSelect;
