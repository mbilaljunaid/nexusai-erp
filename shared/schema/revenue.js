"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertRevenueSourceEventSchema = exports.revenueSourceEvents = exports.insertRevenueRecognitionSchema = exports.revenueRecognitions = exports.insertPerformanceObligationSchema = exports.performanceObligations = exports.insertRevenueContractVersionSchema = exports.revenueContractVersions = exports.insertRevenueContractSchema = exports.revenueContracts = exports.insertRevenueSspLineSchema = exports.revenueSspLines = exports.insertRevenueSspBookSchema = exports.revenueSspBooks = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ==========================================
// 1. REVENUE CONFIGURATION & POLICY
// ==========================================
// Standalone Selling Price (SSP) Books
exports.revenueSspBooks = (0, pg_core_1.pgTable)("revenue_ssp_books", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull(), // "FY2026 Global SSP"
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    effectiveFrom: (0, pg_core_1.timestamp)("effective_from").notNull(),
    effectiveTo: (0, pg_core_1.timestamp)("effective_to"),
    status: (0, pg_core_1.varchar)("status").default("Active"), // Draft, Active, Archived
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRevenueSspBookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenueSspBooks);
// SSP Lines (The price list)
exports.revenueSspLines = (0, pg_core_1.pgTable)("revenue_ssp_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bookId: (0, pg_core_1.varchar)("book_id").notNull(), // FK to ssp_books
    itemId: (0, pg_core_1.varchar)("item_id"), // Link to Product Master
    itemGroup: (0, pg_core_1.varchar)("item_group"), // Or group by category
    sspValue: (0, pg_core_1.numeric)("ssp_value", { precision: 18, scale: 2 }).notNull(), // The fair value price
    minQuantity: (0, pg_core_1.numeric)("min_quantity", { precision: 18, scale: 2 }).default("0"),
    maxQuantity: (0, pg_core_1.numeric)("max_quantity", { precision: 18, scale: 2 }),
    region: (0, pg_core_1.varchar)("region"), // Americas, EMEA
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRevenueSspLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenueSspLines);
// ==========================================
// 2. REVENUE CONTRACTS (The "Deal")
// ==========================================
exports.revenueContracts = (0, pg_core_1.pgTable)("revenue_contracts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractNumber: (0, pg_core_1.varchar)("contract_number").notNull().unique(), // Human readable (REV-2026-001)
    status: (0, pg_core_1.varchar)("status").default("Draft"), // Draft, Active, Frozen, Closed
    customerId: (0, pg_core_1.varchar)("customer_id").notNull(),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    legalEntityId: (0, pg_core_1.varchar)("legal_entity_id"), // Added for Phase A
    orgId: (0, pg_core_1.varchar)("org_id"), // Added for Phase A
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    totalTransactionPrice: (0, pg_core_1.numeric)("total_transaction_price", { precision: 18, scale: 2 }).default("0"),
    totalAllocatedPrice: (0, pg_core_1.numeric)("total_allocated_price", { precision: 18, scale: 2 }).default("0"),
    approvalStatus: (0, pg_core_1.varchar)("approval_status").default("Pending"),
    contractSignDate: (0, pg_core_1.timestamp)("contract_sign_date"),
    versionNumber: (0, pg_core_1.integer)("version_number").default(1), // Added for Phase A
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRevenueContractSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenueContracts);
// Contract History (Snapshots)
exports.revenueContractVersions = (0, pg_core_1.pgTable)("revenue_contract_versions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(), // Link to the master contract
    versionNumber: (0, pg_core_1.integer)("version_number").notNull(),
    snapshotDate: (0, pg_core_1.timestamp)("snapshot_date").default((0, drizzle_orm_1.sql) `now()`),
    changeReason: (0, pg_core_1.text)("change_reason"), // "Added Seat", "Price Change"
    // Snapshot fields (subset of key fields)
    totalTransactionPrice: (0, pg_core_1.numeric)("total_transaction_price", { precision: 18, scale: 2 }),
    totalAllocatedPrice: (0, pg_core_1.numeric)("total_allocated_price", { precision: 18, scale: 2 }),
    status: (0, pg_core_1.varchar)("status"),
});
exports.insertRevenueContractVersionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenueContractVersions);
// ==========================================
// 3. PERFORMANCE OBLIGATIONS (POBs)
// ==========================================
exports.performanceObligations = (0, pg_core_1.pgTable)("performance_obligations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(), // Link to Parent Contract
    name: (0, pg_core_1.varchar)("name").notNull(), // "Software License", "Implementation"
    itemType: (0, pg_core_1.varchar)("item_type"), // Goods, Service, Subscription
    // Amounts
    transactionPrice: (0, pg_core_1.numeric)("transaction_price", { precision: 18, scale: 2 }).default("0"), // What we sold it for
    sspPrice: (0, pg_core_1.numeric)("ssp_price", { precision: 18, scale: 2 }).default("0"), // What it's worth
    allocatedPrice: (0, pg_core_1.numeric)("allocated_price", { precision: 18, scale: 2 }).default("0"), // The Final Revenue Number (ASC 606)
    // Satisfaction
    satisfactionMethod: (0, pg_core_1.varchar)("satisfaction_method").default("PointInTime"), // PointInTime, OverTime
    startDate: (0, pg_core_1.timestamp)("start_date"),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    status: (0, pg_core_1.varchar)("status").default("Open"), // Open, Satisfied, Cancelled
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertPerformanceObligationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.performanceObligations);
// ==========================================
// 4. REVENUE SCHEDULES (The Recognizable Events)
// ==========================================
exports.revenueRecognitions = (0, pg_core_1.pgTable)("revenue_recognitions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    pobId: (0, pg_core_1.varchar)("pob_id").notNull(), // Link to POB
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(),
    // Timing
    periodName: (0, pg_core_1.varchar)("period_name").notNull(), // "Jan-26"
    scheduleDate: (0, pg_core_1.timestamp)("schedule_date").notNull(),
    // Amounts
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    accountType: (0, pg_core_1.varchar)("account_type").default("Revenue"), // Revenue, ContractAsset, ContractLiability
    // Status
    status: (0, pg_core_1.varchar)("status").default("Pending"), // Pending, Posted, Error
    glJournalId: (0, pg_core_1.varchar)("gl_journal_id"), // Link to GL
    eventType: (0, pg_core_1.varchar)("event_type").default("Schedule"), // Schedule, Event, CatchUp
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRevenueRecognitionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenueRecognitions);
// ==========================================
// 5. SOURCE EVENTS (Staging)
// ==========================================
exports.revenueSourceEvents = (0, pg_core_1.pgTable)("revenue_source_events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    sourceSystem: (0, pg_core_1.varchar)("source_system").notNull(), // "OrderManagement", "Subscription", "Usage"
    sourceId: (0, pg_core_1.varchar)("source_id").notNull(), // OrderLineID, UsageID
    eventType: (0, pg_core_1.varchar)("event_type").notNull(), // Booking, Shipment, Consumption, Invoice
    eventDate: (0, pg_core_1.timestamp)("event_date").notNull(),
    // Data Payload
    itemId: (0, pg_core_1.varchar)("item_id"),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 18, scale: 2 }),
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }),
    currency: (0, pg_core_1.varchar)("currency"),
    // Ingested reference (e.g. Sales Order #, Billing Doc #)
    referenceNumber: (0, pg_core_1.varchar)("reference_number"), // Added for Phase A
    legalEntityId: (0, pg_core_1.varchar)("legal_entity_id"), // Added for Phase A
    orgId: (0, pg_core_1.varchar)("org_id"), // Added for Phase A
    // Processing Status
    processingStatus: (0, pg_core_1.varchar)("processing_status").default("Pending"), // Pending, Processed, Error, Ignored
    contractId: (0, pg_core_1.varchar)("contract_id"), // Linked after processing
    errorMessage: (0, pg_core_1.text)("error_message"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertRevenueSourceEventSchema = (0, drizzle_zod_1.createInsertSchema)(exports.revenueSourceEvents);
//# sourceMappingURL=revenue.js.map