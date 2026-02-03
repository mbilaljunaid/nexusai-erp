import { pgTable, varchar, text, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenseReports = pgTable("expense_reports", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    reportNumber: varchar("report_number").notNull().unique(),
    employeeId: varchar("employee_id").notNull(),
    purpose: text("purpose"),
    status: varchar("status").notNull().default("DRAFT"), // DRAFT, SUBMITTED, APPROVED, PAID, REJECTED
    totalAmount: decimal("total_amount", { precision: 20, scale: 2 }).notNull().default("0"),
    currency: varchar("currency").notNull().default("USD"),
    submittedAt: timestamp("submitted_at"),
    approvedAt: timestamp("approved_at"),
    approvedBy: varchar("approved_by"),
    paymentDate: timestamp("payment_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const expenseLines = pgTable("expense_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    reportId: varchar("report_id").notNull().references(() => expenseReports.id),
    date: timestamp("expense_date").notNull(),
    category: varchar("category").notNull(), // TRAVEL, MEALS, SUPPLIES, etc.
    merchant: varchar("merchant"),
    amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
    taxAmount: decimal("tax_amount", { precision: 20, scale: 2 }).default("0"),
    currency: varchar("currency").notNull().default("USD"),
    description: text("description"),
    receiptUrl: text("receipt_url"),
    status: varchar("status").notNull().default("PENDING"), // PENDING, VALIDATED, FLAGGED
    justification: text("justification"),
    glCodeCombinationId: varchar("gl_code_combination_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expensePolicies = pgTable("expense_policies", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    name: varchar("name").notNull(),
    category: varchar("category"),
    limitAmount: decimal("limit_amount", { precision: 20, scale: 2 }),
    currency: varchar("currency").default("USD"),
    requiresReceiptAbove: decimal("requires_receipt_above", { precision: 20, scale: 2 }).default("0"),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expensePerDiems = pgTable("expense_per_diems", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    locationCode: varchar("location_code").notNull(), // e.g. "PARIS", "LONDON"
    rate: decimal("rate", { precision: 20, scale: 2 }).notNull(),
    currency: varchar("currency").notNull().default("USD"),
    effectiveStartDate: timestamp("effective_start_date").notNull(),
    effectiveEndDate: timestamp("effective_end_date"),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const corporateCardTransactions = pgTable("corporate_card_transactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),
    cardId: varchar("card_id").notNull(), // e.g. "VISA-1234"
    employeeId: varchar("employee_id").notNull(),
    transactionDate: timestamp("transaction_date").notNull(),
    merchant: varchar("merchant").notNull(),
    amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
    currency: varchar("currency").notNull().default("USD"),
    status: varchar("status").notNull().default("UNRECONCILED"), // UNRECONCILED, MATCHED, EXCLUDED
    expenseLineId: varchar("expense_line_id"),
    externalReference: varchar("external_reference"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseReportSchema = createInsertSchema(expenseReports);
export const insertExpenseLineSchema = createInsertSchema(expenseLines);
export const insertExpensePolicySchema = createInsertSchema(expensePolicies);
export const insertExpensePerDiemSchema = createInsertSchema(expensePerDiems);
export const insertCorporateCardTransactionSchema = createInsertSchema(corporateCardTransactions);

export type ExpenseReport = typeof expenseReports.$inferSelect;
export type InsertExpenseReport = z.infer<typeof insertExpenseReportSchema>;
export type ExpenseLine = typeof expenseLines.$inferSelect;
export type InsertExpenseLine = z.infer<typeof insertExpenseLineSchema>;
export type ExpensePolicy = typeof expensePolicies.$inferSelect;
export type InsertExpensePolicy = z.infer<typeof insertExpensePolicySchema>;
export type ExpensePerDiem = typeof expensePerDiems.$inferSelect;
export type InsertExpensePerDiem = z.infer<typeof insertExpensePerDiemSchema>;
export type CorporateCardTransaction = typeof corporateCardTransactions.$inferSelect;
export type InsertCorporateCardTransaction = z.infer<typeof insertCorporateCardTransactionSchema>;
