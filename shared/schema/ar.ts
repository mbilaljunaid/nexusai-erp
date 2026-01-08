// server/shared/schema/ar.ts
import { pgTable, varchar, text, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// AR Customers
export const arCustomers = pgTable("ar_customers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    taxId: varchar("tax_id"),
    customerType: varchar("customer_type").default("Commercial"), // Commercial, Individual
    creditLimit: numeric("credit_limit", { precision: 18, scale: 2 }).default("0"),
    balance: numeric("balance", { precision: 18, scale: 2 }).default("0"),
    address: text("address"),
    contactEmail: varchar("contact_email"),
    creditHold: boolean("credit_hold").default(false),
    riskCategory: varchar("risk_category").default("Low"), // Low, Medium, High
    parentCustomerId: varchar("parent_customer_id"),
    status: varchar("status").default("Active"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArCustomerSchema = createInsertSchema(arCustomers).extend({
    name: z.string().min(1),
    taxId: z.string().optional().nullable(),
    customerType: z.string().optional(),
    creditLimit: z.string().optional(),
    balance: z.string().optional(),
    address: z.string().optional().nullable(),
    contactEmail: z.string().email().optional().nullable(),
    creditHold: z.boolean().optional(),
    riskCategory: z.string().optional(),
    parentCustomerId: z.string().optional().nullable(),
    status: z.string().optional(),
});

export type InsertArCustomer = z.infer<typeof insertArCustomerSchema>;
export type ArCustomer = typeof arCustomers.$inferSelect;

// AR Invoices (Sales Invoices)
export const arInvoices = pgTable("ar_invoices", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(),
    invoiceNumber: varchar("invoice_number").notNull().unique(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }).default("0"),
    totalAmount: numeric("total_amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    dueDate: timestamp("due_date"),
    status: varchar("status").default("Draft"), // Draft, Sent, PartiallyPaid, Paid, Overdue, Cancelled
    description: text("description"),
    glAccountId: varchar("gl_account_id"),
    revenueScheduleId: varchar("revenue_schedule_id"),
    recognitionStatus: varchar("recognition_status").default("Pending"), // Pending, InProgress, Completed
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArInvoiceSchema = createInsertSchema(arInvoices).extend({
    customerId: z.string().min(1),
    invoiceNumber: z.string().min(1),
    amount: z.string().min(1),
    taxAmount: z.string().optional(),
    totalAmount: z.string().min(1),
    currency: z.string().optional(),
    dueDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    status: z.string().optional(),
    description: z.string().optional().nullable(),
    glAccountId: z.string().optional().nullable(),
    revenueScheduleId: z.string().optional().nullable(),
    recognitionStatus: z.string().optional(),
});

export type InsertArInvoice = z.infer<typeof insertArInvoiceSchema>;
export type ArInvoice = typeof arInvoices.$inferSelect;

// AR Receipts (Incoming Payments)
export const arReceipts = pgTable("ar_receipts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(),
    invoiceId: varchar("invoice_id"), // Optional if unapplied receipt
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    receiptDate: timestamp("receipt_date"),
    paymentMethod: varchar("payment_method"), // Bank, Wire, CreditCard, Check
    transactionId: varchar("transaction_id"),
    status: varchar("status").default("Completed"), // Applied, Unapplied, Reversed
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertArReceiptSchema = createInsertSchema(arReceipts).extend({
    customerId: z.string().min(1),
    invoiceId: z.string().optional().nullable(),
    amount: z.string().min(1),
    receiptDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    paymentMethod: z.string().optional(),
    transactionId: z.string().optional().nullable(),
    status: z.string().optional(),
});

export type InsertArReceipt = z.infer<typeof insertArReceiptSchema>;
export type ArReceipt = typeof arReceipts.$inferSelect;
