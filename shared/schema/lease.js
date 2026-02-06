"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertLeaseAmendmentSchema = exports.insertLeaseAssetSchema = exports.insertLeasePaymentSchema = exports.insertLeaseHeaderSchema = exports.leaseAmendments = exports.leaseSchedules = exports.leaseAssets = exports.leasePayments = exports.leaseHeaders = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== LEASE ACCOUNTING (IFRS 16 / ASC 842) ==========
// 1. Lease Header (The Contract)
exports.leaseHeaders = (0, pg_core_1.pgTable)("lease_headers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    leaseNumber: (0, pg_core_1.varchar)("lease_number").notNull().unique(),
    description: (0, pg_core_1.varchar)("description").notNull(),
    vendorId: (0, pg_core_1.varchar)("vendor_id").notNull(), // Link to scm_suppliers
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, ACTIVE, CLOSED, TERMINATED
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    // Dates
    commencementDate: (0, pg_core_1.timestamp)("commencement_date").notNull(),
    expirationDate: (0, pg_core_1.timestamp)("expiration_date").notNull(),
    termMonths: (0, pg_core_1.integer)("term_months").notNull(),
    // Financials
    discountRate: (0, pg_core_1.numeric)("discount_rate", { precision: 10, scale: 6 }).notNull(), // e.g. 0.045 for 4.5%
    initialDirectCosts: (0, pg_core_1.numeric)("initial_direct_costs", { precision: 18, scale: 2 }).default("0"),
    prepaidLeasePayments: (0, pg_core_1.numeric)("prepaid_lease_payments", { precision: 18, scale: 2 }).default("0"),
    leaseIncentives: (0, pg_core_1.numeric)("lease_incentives", { precision: 18, scale: 2 }).default("0"),
    // Classification
    leaseType: (0, pg_core_1.varchar)("lease_type").default("OPERATING"), // OPERATING, FINANCE
    assetClass: (0, pg_core_1.varchar)("asset_class").default("REAL_ESTATE"), // REAL_ESTATE, EQUIPMENT, VEHICLE
    // Modification Tracking (ASC 842 / IFRS 16 Remeasurement)
    isModified: (0, pg_core_1.boolean)("is_modified").default(false),
    modificationDate: (0, pg_core_1.timestamp)("modification_date"),
    previousLiability: (0, pg_core_1.numeric)("previous_liability", { precision: 18, scale: 2 }),
    modificationReason: (0, pg_core_1.varchar)("modification_reason"), // RENEWAL, TERMINATION, IMPAIRMENT
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. Lease Payments (Cash Flows)
exports.leasePayments = (0, pg_core_1.pgTable)("lease_payments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    leaseId: (0, pg_core_1.varchar)("lease_id").notNull(), // FK to lease_headers
    paymentType: (0, pg_core_1.varchar)("payment_type").default("FIXED"), // FIXED, VARIABLE, BALLOON
    amount: (0, pg_core_1.numeric)("amount", { precision: 18, scale: 2 }).notNull(),
    frequency: (0, pg_core_1.varchar)("frequency").default("MONTHLY"), // MONTHLY, QUARTERLY, ANNUALLY
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. Lease Assets (ROU Linkage)
exports.leaseAssets = (0, pg_core_1.pgTable)("lease_assets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    leaseId: (0, pg_core_1.varchar)("lease_id").notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    locationId: (0, pg_core_1.varchar)("location_id"), // Link to logic_locations
    fairValue: (0, pg_core_1.numeric)("fair_value", { precision: 18, scale: 2 }),
    usefulLifeMonths: (0, pg_core_1.integer)("useful_life_months"),
    serialNumber: (0, pg_core_1.varchar)("serial_number"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. Amortization Schedules (Generated)
exports.leaseSchedules = (0, pg_core_1.pgTable)("lease_schedules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    leaseId: (0, pg_core_1.varchar)("lease_id").notNull(),
    period: (0, pg_core_1.integer)("period").notNull(), // 1, 2, 3...
    date: (0, pg_core_1.timestamp)("date").notNull(),
    // Liability Side
    openingLiability: (0, pg_core_1.numeric)("opening_liability", { precision: 18, scale: 2 }).notNull(),
    interestExpense: (0, pg_core_1.numeric)("interest_expense", { precision: 18, scale: 2 }).notNull(),
    paymentAmount: (0, pg_core_1.numeric)("payment_amount", { precision: 18, scale: 2 }).notNull(),
    closingLiability: (0, pg_core_1.numeric)("closing_liability", { precision: 18, scale: 2 }).notNull(),
    // Asset Side
    rouOpeningBalance: (0, pg_core_1.numeric)("rou_opening_balance", { precision: 18, scale: 2 }).notNull(),
    amortizationExpense: (0, pg_core_1.numeric)("amortization_expense", { precision: 18, scale: 2 }).notNull(),
    rouClosingBalance: (0, pg_core_1.numeric)("rou_closing_balance", { precision: 18, scale: 2 }).notNull(),
    // Status
    isPosted: (0, pg_core_1.boolean)("is_posted").default(false),
    journalEntryId: (0, pg_core_1.varchar)("journal_entry_id"),
});
// 5. Lease Amendments (Audit Trail)
exports.leaseAmendments = (0, pg_core_1.pgTable)("lease_amendments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    leaseId: (0, pg_core_1.varchar)("lease_id").notNull(), // FK to lease_headers
    amendmentDate: (0, pg_core_1.timestamp)("amendment_date").default((0, drizzle_orm_1.sql) `now()`),
    effectiveDate: (0, pg_core_1.timestamp)("effective_date").notNull(),
    modificationType: (0, pg_core_1.varchar)("modification_type").notNull(), // RENEWAL, TERMINATION, IMPAIRMENT, TERMS_CHANGE
    changeReason: (0, pg_core_1.varchar)("change_reason"),
    // Snapshots
    previousTerms: (0, pg_core_1.jsonb)("previous_terms"), // Snapshot of header before change
    newTerms: (0, pg_core_1.jsonb)("new_terms"), // Snapshot of header after change
    // Audit
    modifiedBy: (0, pg_core_1.varchar)("modified_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// Schemas
exports.insertLeaseHeaderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leaseHeaders).extend({
    leaseNumber: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    vendorId: zod_1.z.string().min(1),
    discountRate: zod_1.z.number().min(0).max(1),
    commencementDate: zod_1.z.string(), // Receives date string
    expirationDate: zod_1.z.string(),
});
exports.insertLeasePaymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leasePayments).extend({
    amount: zod_1.z.number(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
});
exports.insertLeaseAssetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leaseAssets);
exports.insertLeaseAmendmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.leaseAmendments);
//# sourceMappingURL=lease.js.map