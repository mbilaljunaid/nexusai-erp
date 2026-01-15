import { pgTable, varchar, text, timestamp, numeric, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== BILLING RULES ==========
// Defines how usage or recurring fees are calculated
export const billingRules = pgTable("billing_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    description: text("description"),
    ruleType: varchar("rule_type").notNull(), // 'Recurring', 'Milestone', 'Usage', 'OneTime'
    frequency: varchar("frequency"), // 'Monthly', 'Quarterly', 'Annually' (for Recurring)
    milestonePercentage: numeric("milestone_percentage"), // e.g. 50.00 (for Milestone)
    usageUnit: varchar("usage_unit"), // 'GB', 'Hours', 'Users' (for Usage)
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertBillingRuleSchema = createInsertSchema(billingRules).extend({
    name: z.string().min(1),
    ruleType: z.enum(['Recurring', 'Milestone', 'Usage', 'OneTime']),
    frequency: z.enum(['Monthly', 'Quarterly', 'Annually']).optional(),
    milestonePercentage: z.string().optional(),
    usageUnit: z.string().optional(),
});

export type InsertBillingRule = z.infer<typeof insertBillingRuleSchema>;
export type BillingRule = typeof billingRules.$inferSelect;

// ========== BILLING PROFILES ==========
// Customer-specific billing configuration override
export const billingProfiles = pgTable("billing_profiles", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerId: varchar("customer_id").notNull(), // Link to AR Customer
    defaultRuleId: varchar("default_rule_id"), // Default rule for this customer
    taxExempt: boolean("tax_exempt").default(false),
    taxExemptionNumber: varchar("tax_exemption_number"),
    currency: varchar("currency").default("USD"),
    paymentTerms: varchar("payment_terms").default("Net 30"),
    autoInvoiceEnabled: boolean("auto_invoice_enabled").default(true),
    emailInvoices: boolean("email_invoices").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertBillingProfileSchema = createInsertSchema(billingProfiles).extend({
    customerId: z.string().min(1),
    defaultRuleId: z.string().optional(),
    taxExempt: z.boolean().optional(),
    currency: z.string().optional(),
});

export type InsertBillingProfile = z.infer<typeof insertBillingProfileSchema>;
export type BillingProfile = typeof billingProfiles.$inferSelect;

// ========== BILLING BATCHES ==========
// Tracks Auto-Invoice runs
export const billingBatches = pgTable("billing_batches", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    runDate: timestamp("run_date").default(sql`now()`),
    status: varchar("status").default("Processing"), // 'Processing', 'Completed', 'Failed', 'Completed with Errors'
    totalEventsProcessed: integer("total_events_processed").default(0),
    totalInvoicesCreated: integer("total_invoices_created").default(0),
    totalErrors: integer("total_errors").default(0),
    errorMessage: text("error_message"),
    createdBy: varchar("created_by"), // User ID who triggered it (or 'System')
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBillingBatchSchema = createInsertSchema(billingBatches);
export type InsertBillingBatch = z.infer<typeof insertBillingBatchSchema>;
export type BillingBatch = typeof billingBatches.$inferSelect;

// ========== BILLING EVENTS ==========
// The raw feed of billable items from upstream systems
export const billingEvents = pgTable("billing_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    sourceSystem: varchar("source_system").notNull(), // 'Projects', 'Orders', 'Contracts', 'Usage'
    sourceTransactionId: varchar("source_transaction_id").notNull(), // ID of the Project Task, Order Line, etc.
    customerId: varchar("customer_id").notNull(),
    eventDate: timestamp("event_date").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currency: varchar("currency").default("USD"),
    description: text("description").notNull(),
    quantity: numeric("quantity").default("1"),
    unitPrice: numeric("unit_price", { precision: 18, scale: 2 }),

    // Status tracking
    status: varchar("status").default("Pending"), // 'Pending', 'Invoiced', 'Error', 'Hold', 'OnAccount'
    batchId: varchar("batch_id"), // Link to the batch that processed it
    invoiceId: varchar("invoice_id"), // Link to the resulting AR Invoice

    // Error handling
    errorCode: varchar("error_code"),
    errorMessage: text("error_message"),

    // Classification
    ruleId: varchar("rule_id"), // Applied rule
    taxCode: varchar("tax_code"),
    taxAmount: numeric("tax_amount", { precision: 18, scale: 2 }).default("0"),
    taxLines: jsonb("tax_lines"), // Stores detailed tax breakdown
    glAccount: varchar("gl_account"), // Revenue Account (Segment 1-5 usually)
    glStatus: varchar("gl_status").default("Pending"), // Pending, Created, Posted
    glDate: timestamp("gl_date"),
    glImportRef: varchar("gl_import_ref"), // Reference to GL Import Batch

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertBillingEventSchema = createInsertSchema(billingEvents).extend({
    sourceSystem: z.enum(['Projects', 'Orders', 'Contracts', 'Usage', 'Manual']),
    sourceTransactionId: z.string().min(1),
    customerId: z.string().min(1),
    eventDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    }, z.date()),
    amount: z.string().min(1),
    taxAmount: z.string().optional(),
    taxLines: z.any().optional(),
    glStatus: z.string().optional(),
    glDate: z.date().optional(),
});


export type InsertBillingEvent = z.infer<typeof insertBillingEventSchema>;
export type BillingEvent = typeof billingEvents.$inferSelect;

// ========== BILLING ANOMALIES (AI) ==========
// Detected issues in billing events or invoices
export const billingAnomalies = pgTable("billing_anomalies", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    targetType: varchar("target_type").notNull(), // 'EVENT', 'INVOICE'
    targetId: varchar("target_id").notNull(),
    anomalyType: varchar("anomaly_type").notNull(), // 'HIGH_VALUE', 'DUPLICATE_SUSPECT', 'PATTERN_DEVIATION'
    severity: varchar("severity").notNull(), // 'LOW', 'MEDIUM', 'HIGH'
    confidence: numeric("confidence", { precision: 5, scale: 2 }), // 0.00 to 1.00
    description: text("description"),
    status: varchar("status").default("PENDING"), // 'PENDING', 'DISMISSED', 'CONFIRMED'
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertBillingAnomalySchema = createInsertSchema(billingAnomalies);
export type InsertBillingAnomaly = z.infer<typeof insertBillingAnomalySchema>;
export type BillingAnomaly = typeof billingAnomalies.$inferSelect;
