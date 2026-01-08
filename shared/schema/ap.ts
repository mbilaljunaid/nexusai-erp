// Accounts Payable (AP) schema definitions for Oracle Fusion parity
import { pgTable, serial, text, varchar, numeric, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

// Supplier entity
export const apSuppliers = pgTable("ap_suppliers", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    taxId: varchar("tax_id", { length: 100 }),
    creditHold: boolean("credit_hold").default(false),
    riskCategory: varchar("risk_category", { length: 50 }).default("Low"),
    parentSupplierId: integer("parent_supplier_id"),
    address: text("address"),
    contactEmail: varchar("contact_email", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertApSupplierSchema = z.object({
    name: z.string().min(1),
    taxId: z.string().optional().nullable(),
    creditHold: z.boolean().optional(),
    riskCategory: z.enum(["Low", "Medium", "High"]).optional(),
    parentSupplierId: z.number().int().optional().nullable(),
    address: z.string().optional().nullable(),
    contactEmail: z.string().email().optional().nullable()
});

export type ApSupplier = typeof apSuppliers.$inferSelect;
export type InsertApSupplier = typeof apSuppliers.$inferInsert;

// Invoice entity
export const apInvoices = pgTable("ap_invoices", {
    id: serial("id").primaryKey(),
    supplierId: integer("supplier_id").notNull(),
    invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default(0),
    currency: varchar("currency", { length: 10 }).default("USD"),
    dueDate: timestamp("due_date"),
    paymentTerms: varchar("payment_terms", { length: 100 }),
    status: varchar("status", { length: 50 }).default("Draft"),
    recognitionStatus: varchar("recognition_status", { length: 50 }).default("Pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});

export const insertApInvoiceSchema = z.object({
    supplierId: z.number().int(),
    invoiceNumber: z.string(),
    amount: z.number(),
    taxAmount: z.number().optional(),
    currency: z.string().optional(),
    dueDate: z.string().optional().nullable(),
    paymentTerms: z.string().optional().nullable(),
    status: z.enum(["Draft", "Posted", "Paid", "Overdue"]).optional(),
    recognitionStatus: z.enum(["Pending", "Completed"]).optional()
});

export type ApInvoice = typeof apInvoices.$inferSelect;
export type InsertApInvoice = typeof apInvoices.$inferInsert;

// Payment entity
export const apPayments = pgTable("ap_payments", {
    id: serial("id").primaryKey(),
    invoiceId: integer("invoice_id").notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).default("BankTransfer"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paymentDate: timestamp("payment_date").defaultNow(),
    appliedInvoiceIds: jsonb("applied_invoice_ids").default("[]"),
    createdAt: timestamp("created_at").defaultNow()
});

export const insertApPaymentSchema = z.object({
    invoiceId: z.number().int(),
    paymentMethod: z.string().optional(),
    amount: z.number(),
    paymentDate: z.string().optional().nullable(),
    appliedInvoiceIds: z.array(z.number()).optional()
});

export type ApPayment = typeof apPayments.$inferSelect;
export type InsertApPayment = typeof apPayments.$inferInsert;
