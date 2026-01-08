
// Cash Management Schema
import { pgTable, serial, varchar, numeric, timestamp, integer, boolean, text } from "drizzle-orm/pg-core";
import { z } from "zod";

// Bank Accounts: Internal representation of bank accounts
export const cashBankAccounts = pgTable("cash_bank_accounts", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    accountNumber: varchar("account_number", { length: 100 }).notNull(),
    bankName: varchar("bank_name", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("USD"),
    swiftCode: varchar("swift_code", { length: 50 }),
    glAccountId: integer("gl_account_id"), // Link to GL Chart of Accounts
    currentBalance: numeric("current_balance", { precision: 12, scale: 2 }).default("0"),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertCashBankAccountSchema = z.object({
    name: z.string().min(1),
    accountNumber: z.string().min(1),
    bankName: z.string().min(1),
    currency: z.string().optional(),
    swiftCode: z.string().optional(),
    glAccountId: z.number().int().optional(),
    currentBalance: z.number().optional()
});

export type CashBankAccount = typeof cashBankAccounts.$inferSelect;
export type InsertCashBankAccount = typeof cashBankAccounts.$inferInsert;


// Bank Statement Lines: External transactions from bank feed/CSV
export const cashStatementLines = pgTable("cash_statement_lines", {
    id: serial("id").primaryKey(),
    bankAccountId: integer("bank_account_id").notNull(),
    transactionDate: timestamp("transaction_date").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    description: text("description"),
    referenceNumber: varchar("reference_number", { length: 100 }),
    reconciled: boolean("reconciled").default(false),
    createdAt: timestamp("created_at").defaultNow()
});

export const insertCashStatementLineSchema = z.object({
    bankAccountId: z.number().int(),
    transactionDate: z.string(),
    amount: z.number(),
    description: z.string().optional(),
    referenceNumber: z.string().optional(),
    reconciled: z.boolean().optional()
});

export type CashStatementLine = typeof cashStatementLines.$inferSelect;
export type InsertCashStatementLine = typeof cashStatementLines.$inferInsert;


// Cash Transactions: Link between internal source (AR/AP) and Cash module
export const cashTransactions = pgTable("cash_transactions", {
    id: serial("id").primaryKey(),
    bankAccountId: integer("bank_account_id").notNull(),
    sourceModule: varchar("source_module", { length: 20 }).notNull(), // 'AP', 'AR', 'GL'
    sourceId: integer("source_id").notNull(), // ID of Payment or Receipt
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    transactionDate: timestamp("transaction_date").defaultNow(),
    reference: varchar("reference", { length: 100 }),
    status: varchar("status", { length: 20 }).default("Unreconciled") // 'Unreconciled', 'Cleared'
});

export const insertCashTransactionSchema = z.object({
    bankAccountId: z.number().int(),
    sourceModule: z.enum(["AP", "AR", "GL"]),
    sourceId: z.number().int(),
    amount: z.number(),
    transactionDate: z.string().optional(),
    reference: z.string().optional(),
    status: z.enum(["Unreconciled", "Cleared"]).optional()
});

export type CashTransaction = typeof cashTransactions.$inferSelect;
export type InsertCashTransaction = typeof cashTransactions.$inferInsert;
