import { pgTable, varchar, text, timestamp, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== FINANCE MODULE ==========
export const generalLedger = pgTable("general_ledger", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    accountCode: varchar("account_code").notNull(),
    description: text("description"),
    accountType: varchar("account_type"), // asset, liability, equity, revenue, expense
    balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

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
