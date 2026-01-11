
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
    glAccountId: varchar("gl_account_id"), // Legacy field, keeping for compatibility
    cashAccountCCID: integer("cash_account_ccid"), // The Asset Account (e.g. 1010)
    cashClearingCCID: integer("cash_clearing_ccid"), // The Liability/Contra Account (e.g. 2010)
    currentBalance: numeric("current_balance", { precision: 20, scale: 2 }).default("0"),
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
