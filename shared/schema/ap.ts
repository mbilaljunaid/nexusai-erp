// server/shared/schema/ap.ts
import { pgTable, varchar, text, timestamp, numeric, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Suppliers
export const apSuppliers = pgTable("ap_suppliers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    taxId: varchar("tax_id"),
    country: varchar("country"),
    riskScore: numeric("risk_score", { precision: 5, scale: 2 }).default("0"),
    address: text("address"),
    contactEmail: varchar("contact_email"),
    createdAt: timestamp("created_at").default(sql`now()`),
});
export const insertApSupplierSchema = createInsertSchema(apSuppliers).extend({
    name: z.string().min(1),
    taxId: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    riskScore: z.string().optional(),
    address: z.string().optional().nullable(),
    contactEmail: z.string().email().optional().nullable(),
});
export type InsertApSupplier = z.infer<typeof insertApSupplierSchema>;
export type ApSupplier = typeof apSuppliers.$inferSelect;

// Invoices
export const apInvoices = pgTable("ap_invoices", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    supplierId: varchar("supplier_id").notNull(),
    invoiceNumber: varchar("invoice_number").notNull().unique(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    dueDate: timestamp("due_date"),
    status: varchar("status").default("Draft"), // Draft, PendingApproval, Approved, OnHold, Paid
    approvalStatus: varchar("approval_status").default("Pending"),
    glAccountId: varchar("gl_account_id"),
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});
export const insertApInvoiceSchema = createInsertSchema(apInvoices).extend({
    supplierId: z.string().min(1),
    invoiceNumber: z.string().min(1),
    amount: z.string().min(1),
    currency: z.string().optional(),
    dueDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    status: z.string().optional(),
    approvalStatus: z.string().optional(),
    glAccountId: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
});
export type InsertApInvoice = z.infer<typeof insertApInvoiceSchema>;
export type ApInvoice = typeof apInvoices.$inferSelect;

// Payments
export const apPayments = pgTable("ap_payments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceIds: text("invoice_ids"), // comma‑separated list of invoice IDs
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    scheduledDate: timestamp("scheduled_date"),
    paymentDate: timestamp("payment_date"),
    transactionId: varchar("transaction_id"),
    status: varchar("status").default("Scheduled"), // Scheduled, Completed, Failed, Cancelled
    createdAt: timestamp("created_at").default(sql`now()`),
});
export const insertApPaymentSchema = createInsertSchema(apPayments).extend({
    invoiceIds: z.string().min(1),
    amount: z.string().min(1),
    scheduledDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    paymentDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
    transactionId: z.string().optional().nullable(),
    status: z.string().optional(),
});
export type InsertApPayment = z.infer<typeof insertApPaymentSchema>;
export type ApPayment = typeof apPayments.$inferSelect;

// Approvals (for invoices)
export const apApprovals = pgTable("ap_approvals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    invoiceId: varchar("invoice_id").notNull(),
    approverId: varchar("approver_id"),
    decision: varchar("decision").default("Pending"), // Pending, Approved, Rejected
    comments: text("comments"),
    actionDate: timestamp("action_date"),
    createdAt: timestamp("created_at").default(sql`now()`),
});
export const insertApApprovalSchema = createInsertSchema(apApprovals).extend({
    invoiceId: z.string().min(1),
    approverId: z.string().optional().nullable(),
    decision: z.string().optional(),
    comments: z.string().optional(),
    actionDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()).optional().nullable(),
});
export type InsertApApproval = z.infer<typeof insertApApprovalSchema>;
export type ApApproval = typeof apApprovals.$inferSelect;
