"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertBillingAnomalySchema = exports.billingAnomalies = exports.insertBillingEventSchema = exports.billingEvents = exports.insertBillingBatchSchema = exports.billingBatches = exports.insertBillingProfileSchema = exports.billingProfiles = exports.insertBillingRuleSchema = exports.billingRules = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== BILLING RULES ==========
// Defines how usage or recurring fees are calculated
exports.billingRules = (0, pg_core_1.pgTable)("billing_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    ruleType: (0, pg_core_1.varchar)("rule_type").notNull(), // 'Recurring', 'Milestone', 'Usage', 'OneTime'
    frequency: (0, pg_core_1.varchar)("frequency"), // 'Monthly', 'Quarterly', 'Annually' (for Recurring)
    milestonePercentage: (0, pg_core_1.numeric)("milestone_percentage"), // e.g. 50.00 (for Milestone)
    usageUnit: (0, pg_core_1.varchar)("usage_unit"), // 'GB', 'Hours', 'Users' (for Usage)
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertBillingRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.billingRules).extend({
    name: zod_1.z.string().min(1),
    ruleType: zod_1.z.enum(['Recurring', 'Milestone', 'Usage', 'OneTime']),
    frequency: zod_1.z.enum(['Monthly', 'Quarterly', 'Annually']).optional(),
    milestonePercentage: zod_1.z.string().optional(),
    usageUnit: zod_1.z.string().optional(),
});
// ========== BILLING PROFILES ==========
// Customer-specific billing configuration override
exports.billingProfiles = (0, pg_core_1.pgTable)("billing_profiles", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(), // Link to AR Customer
    defaultRuleId: (0, pg_core_1.varchar)("default_rule_id"), // Default rule for this customer
    taxExempt: (0, pg_core_1.boolean)("tax_exempt").default(false),
    taxExemptionNumber: (0, pg_core_1.varchar)("tax_exemption_number"),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    paymentTerms: (0, pg_core_1.varchar)("payment_terms").default("Net 30"),
    autoInvoiceEnabled: (0, pg_core_1.boolean)("auto_invoice_enabled").default(true),
    emailInvoices: (0, pg_core_1.boolean)("email_invoices").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertBillingProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.billingProfiles).extend({
    customerId: zod_1.z.string().min(1),
    defaultRuleId: zod_1.z.string().optional(),
    taxExempt: zod_1.z.boolean().optional(),
    currency: zod_1.z.string().optional(),
});
// ========== BILLING BATCHES ==========
// Tracks Auto-Invoice runs
exports.billingBatches = (0, pg_core_1.pgTable)("billing_batches", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    runDate: (0, pg_core_1.timestamp)("run_date").default((0, drizzle_orm_1.sql) `now()`),
    status: (0, pg_core_1.varchar)("status").default("Processing"), // 'Processing', 'Completed', 'Failed', 'Completed with Errors'
    totalEventsProcessed: (0, pg_core_1.integer)("total_events_processed").default(0),
    totalInvoicesCreated: (0, pg_core_1.integer)("total_invoices_created").default(0),
    totalErrors: (0, pg_core_1.integer)("total_errors").default(0),
    errorMessage: (0, pg_core_1.text)("error_message"),
    createdBy: (0, pg_core_1.varchar)("created_by"), // User ID who triggered it (or 'System')
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertBillingBatchSchema = (0, drizzle_zod_1.createInsertSchema)(exports.billingBatches);
// ========== BILLING EVENTS ==========
// The raw feed of billable items from upstream systems
exports.billingEvents = (0, pg_core_1.pgTable)("billing_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    sourceSystem: (0, pg_core_1.varchar)("source_system").notNull(), // 'Projects', 'Orders', 'Contracts', 'Usage'
    sourceTransactionId: (0, pg_core_1.varchar)("source_transaction_id").notNull(), // ID of the Project Task, Order Line, etc.
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    eventDate: (0, pg_core_1.timestamp)("event_date").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    description: (0, pg_core_1.text)("description").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity").default("1"),
    unitPrice: (0, pg_core_1.numeric)("unit_price", { precision: 18, scale: 2 }),
    // Status tracking
    status: (0, pg_core_1.varchar)("status").default("Pending"), // 'Pending', 'Invoiced', 'Error', 'Hold', 'OnAccount'
    batchId: (0, pg_core_1.varchar)("batch_id"), // Link to the batch that processed it
    invoiceId: (0, pg_core_1.varchar)("invoice_id"), // Link to the resulting AR Invoice
    // Error handling
    errorCode: (0, pg_core_1.varchar)("error_code"),
    errorMessage: (0, pg_core_1.text)("error_message"),
    // Classification
    ruleId: (0, pg_core_1.varchar)("rule_id"), // Applied rule
    taxCode: (0, pg_core_1.varchar)("tax_code"),
    taxAmount: (0, pg_core_1.numeric)("tax_amount", { precision: 18, scale: 2 }).default("0"),
    taxLines: (0, pg_core_1.jsonb)("tax_lines"), // Stores detailed tax breakdown
    glAccount: (0, pg_core_1.varchar)("gl_account"), // Revenue Account (Segment 1-5 usually)
    glStatus: (0, pg_core_1.varchar)("gl_status").default("Pending"), // Pending, Created, Posted
    glDate: (0, pg_core_1.timestamp)("gl_date"),
    glImportRef: (0, pg_core_1.varchar)("gl_import_ref"), // Reference to GL Import Batch
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertBillingEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.billingEvents).extend({
    sourceSystem: zod_1.z.enum(['Projects', 'Orders', 'Contracts', 'Usage', 'Manual']),
    sourceTransactionId: zod_1.z.string().min(1),
    customerId: zod_1.z.string().min(1),
    eventDate: zod_1.z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date)
            return new Date(arg);
    }, zod_1.z.date()),
    amount: zod_1.z.string().min(1),
    taxAmount: zod_1.z.string().optional(),
    taxLines: zod_1.z.any().optional(),
    glStatus: zod_1.z.string().optional(),
    glDate: zod_1.z.date().optional(),
});
// ========== BILLING ANOMALIES (AI) ==========
// Detected issues in billing events or invoices
exports.billingAnomalies = (0, pg_core_1.pgTable)("billing_anomalies", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    targetType: (0, pg_core_1.varchar)("target_type").notNull(), // 'EVENT', 'INVOICE'
    targetId: (0, pg_core_1.varchar)("target_id").notNull(),
    anomalyType: (0, pg_core_1.varchar)("anomaly_type").notNull(), // 'HIGH_VALUE', 'DUPLICATE_SUSPECT', 'PATTERN_DEVIATION'
    severity: (0, pg_core_1.varchar)("severity").notNull(), // 'LOW', 'MEDIUM', 'HIGH'
    confidence: (0, pg_core_1.numeric)("confidence", { precision: 5, scale: 2 }), // 0.00 to 1.00
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // 'PENDING', 'DISMISSED', 'CONFIRMED'
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertBillingAnomalySchema = (0, drizzle_zod_1.createInsertSchema)(exports.billingAnomalies);
//# sourceMappingURL=billing_enterprise.js.map