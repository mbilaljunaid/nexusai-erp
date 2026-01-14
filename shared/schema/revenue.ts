
import { pgTable, varchar, text, timestamp, numeric, boolean, integer, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// 1. REVENUE CONFIGURATION & POLICY
// ==========================================

// Standalone Selling Price (SSP) Books
export const revenueSspBooks = pgTable("revenue_ssp_books", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(), // "FY2026 Global SSP"
    currency: varchar("currency").default("USD"),
    effectiveFrom: timestamp("effective_from").notNull(),
    effectiveTo: timestamp("effective_to"),
    status: varchar("status").default("Active"), // Draft, Active, Archived
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenueSspBookSchema = createInsertSchema(revenueSspBooks);

// SSP Lines (The price list)
export const revenueSspLines = pgTable("revenue_ssp_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bookId: varchar("book_id").notNull(), // FK to ssp_books
    itemId: varchar("item_id"), // Link to Product Master
    itemGroup: varchar("item_group"), // Or group by category
    sspValue: numeric("ssp_value", { precision: 18, scale: 2 }).notNull(), // The fair value price
    minQuantity: numeric("min_quantity", { precision: 18, scale: 2 }).default("0"),
    maxQuantity: numeric("max_quantity", { precision: 18, scale: 2 }),
    region: varchar("region"), // Americas, EMEA
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenueSspLineSchema = createInsertSchema(revenueSspLines);

// ==========================================
// 2. REVENUE CONTRACTS (The "Deal")
// ==========================================

export const revenueContracts = pgTable("revenue_contracts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractNumber: varchar("contract_number").notNull().unique(), // Human readable (REV-2026-001)
    status: varchar("status").default("Draft"), // Draft, Active, Frozen, Closed
    customerId: varchar("customer_id").notNull(),
    ledgerId: varchar("ledger_id").notNull(),
    legalEntityId: varchar("legal_entity_id"), // Added for Phase A
    orgId: varchar("org_id"),                 // Added for Phase A
    currency: varchar("currency").default("USD"),
    totalTransactionPrice: numeric("total_transaction_price", { precision: 18, scale: 2 }).default("0"),
    totalAllocatedPrice: numeric("total_allocated_price", { precision: 18, scale: 2 }).default("0"),
    approvalStatus: varchar("approval_status").default("Pending"),
    contractSignDate: timestamp("contract_sign_date"),
    versionNumber: integer("version_number").default(1), // Added for Phase A
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenueContractSchema = createInsertSchema(revenueContracts);

// ==========================================
// 3. PERFORMANCE OBLIGATIONS (POBs)
// ==========================================

export const performanceObligations = pgTable("performance_obligations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: varchar("contract_id").notNull(), // Link to Parent Contract
    name: varchar("name").notNull(), // "Software License", "Implementation"
    itemType: varchar("item_type"), // Goods, Service, Subscription

    // Amounts
    transactionPrice: numeric("transaction_price", { precision: 18, scale: 2 }).default("0"), // What we sold it for
    sspPrice: numeric("ssp_price", { precision: 18, scale: 2 }).default("0"), // What it's worth
    allocatedPrice: numeric("allocated_price", { precision: 18, scale: 2 }).default("0"), // The Final Revenue Number (ASC 606)

    // Satisfaction
    satisfactionMethod: varchar("satisfaction_method").default("PointInTime"), // PointInTime, OverTime
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    status: varchar("status").default("Open"), // Open, Satisfied, Cancelled
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertPerformanceObligationSchema = createInsertSchema(performanceObligations);

// ==========================================
// 4. REVENUE SCHEDULES (The Recognizable Events)
// ==========================================

export const revenueRecognitions = pgTable("revenue_recognitions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    pobId: varchar("pob_id").notNull(), // Link to POB
    contractId: varchar("contract_id").notNull(),

    // Timing
    periodName: varchar("period_name").notNull(), // "Jan-26"
    scheduleDate: timestamp("schedule_date").notNull(),

    // Amounts
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    accountType: varchar("account_type").default("Revenue"), // Revenue, ContractAsset, ContractLiability

    // Status
    status: varchar("status").default("Pending"), // Pending, Posted, Error
    glJournalId: varchar("gl_journal_id"), // Link to GL

    eventType: varchar("event_type").default("Schedule"), // Schedule, Event, CatchUp
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenueRecognitionSchema = createInsertSchema(revenueRecognitions);

// ==========================================
// 5. SOURCE EVENTS (Staging)
// ==========================================

export const revenueSourceEvents = pgTable("revenue_source_events", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    sourceSystem: varchar("source_system").notNull(), // "OrderManagement", "Subscription", "Usage"
    sourceId: varchar("source_id").notNull(), // OrderLineID, UsageID
    eventType: varchar("event_type").notNull(), // Booking, Shipment, Consumption, Invoice
    eventDate: timestamp("event_date").notNull(),

    // Data Payload
    itemId: varchar("item_id"),
    quantity: numeric("quantity", { precision: 18, scale: 2 }),
    amount: numeric("amount", { precision: 18, scale: 2 }),
    currency: varchar("currency"),
    // Ingested reference (e.g. Sales Order #, Billing Doc #)
    referenceNumber: varchar("reference_number"), // Added for Phase A
    legalEntityId: varchar("legal_entity_id"),     // Added for Phase A
    orgId: varchar("org_id"),                     // Added for Phase A

    // Processing Status
    processingStatus: varchar("processing_status").default("Pending"), // Pending, Processed, Error, Ignored
    contractId: varchar("contract_id"), // Linked after processing
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertRevenueSourceEventSchema = createInsertSchema(revenueSourceEvents);
