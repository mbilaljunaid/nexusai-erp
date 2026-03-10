import { pgTable, varchar, text, timestamp, numeric, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== LEASE ACCOUNTING (IFRS 16 / ASC 842) ==========

// 1. Lease Header (The Contract)
export const leaseHeaders = pgTable("lease_headers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    leaseNumber: varchar("lease_number").notNull().unique(),
    description: varchar("description").notNull(),
    vendorId: varchar("vendor_id").notNull(), // Link to scm_suppliers
    status: varchar("status").default("DRAFT"), // DRAFT, ACTIVE, CLOSED, TERMINATED
    currency: varchar("currency").default("USD"),
    entBusinessUnitId: varchar("ent_business_unit_id"),
    entLegalEntityId: varchar("ent_legal_entity_id"),

    // Dates
    commencementDate: timestamp("commencement_date").notNull(),
    expirationDate: timestamp("expiration_date").notNull(),
    termMonths: integer("term_months").notNull(),

    // Financials
    discountRate: numeric("discount_rate", { precision: 10, scale: 6 }).notNull(), // e.g. 0.045 for 4.5%
    initialDirectCosts: numeric("initial_direct_costs", { precision: 18, scale: 2 }).default("0"),
    prepaidLeasePayments: numeric("prepaid_lease_payments", { precision: 18, scale: 2 }).default("0"),
    leaseIncentives: numeric("lease_incentives", { precision: 18, scale: 2 }).default("0"),

    // Classification
    leaseType: varchar("lease_type").default("OPERATING"), // OPERATING, FINANCE
    assetClass: varchar("asset_class").default("REAL_ESTATE"), // REAL_ESTATE, EQUIPMENT, VEHICLE

    // Modification Tracking (ASC 842 / IFRS 16 Remeasurement)
    isModified: boolean("is_modified").default(false),
    modificationDate: timestamp("modification_date"),
    previousLiability: numeric("previous_liability", { precision: 18, scale: 2 }),
    modificationReason: varchar("modification_reason"), // RENEWAL, TERMINATION, IMPAIRMENT

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 2. Lease Payments (Cash Flows)
export const leasePayments = pgTable("lease_payments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    leaseId: varchar("lease_id").notNull(), // FK to lease_headers
    entBusinessUnitId: varchar("ent_business_unit_id"),
    entLegalEntityId: varchar("ent_legal_entity_id"),
    paymentType: varchar("payment_type").default("FIXED"), // FIXED, VARIABLE, BALLOON
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    frequency: varchar("frequency").default("MONTHLY"), // MONTHLY, QUARTERLY, ANNUALLY
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3. Lease Assets (ROU Linkage)
export const leaseAssets = pgTable("lease_assets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    leaseId: varchar("lease_id").notNull(),
    name: varchar("name").notNull(),
    locationId: varchar("location_id"), // Link to logic_locations
    fairValue: numeric("fair_value", { precision: 18, scale: 2 }),
    usefulLifeMonths: integer("useful_life_months"),
    serialNumber: varchar("serial_number"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 4. Amortization Schedules (Generated)
export const leaseSchedules = pgTable("lease_schedules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    leaseId: varchar("lease_id").notNull(),
    entBusinessUnitId: varchar("ent_business_unit_id"),
    entLegalEntityId: varchar("ent_legal_entity_id"),
    period: integer("period").notNull(), // 1, 2, 3...
    date: timestamp("date").notNull(),

    // Liability Side
    openingLiability: numeric("opening_liability", { precision: 18, scale: 2 }).notNull(),
    interestExpense: numeric("interest_expense", { precision: 18, scale: 2 }).notNull(),
    paymentAmount: numeric("payment_amount", { precision: 18, scale: 2 }).notNull(),
    closingLiability: numeric("closing_liability", { precision: 18, scale: 2 }).notNull(),

    // Asset Side
    rouOpeningBalance: numeric("rou_opening_balance", { precision: 18, scale: 2 }).notNull(),
    amortizationExpense: numeric("amortization_expense", { precision: 18, scale: 2 }).notNull(),
    rouClosingBalance: numeric("rou_closing_balance", { precision: 18, scale: 2 }).notNull(),

    // Status
    isPosted: boolean("is_posted").default(false),
    journalEntryId: varchar("journal_entry_id"),
});

// 5. Lease Amendments (Audit Trail)
export const leaseAmendments = pgTable("lease_amendments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    leaseId: varchar("lease_id").notNull(), // FK to lease_headers
    amendmentDate: timestamp("amendment_date").default(sql`now()`),
    effectiveDate: timestamp("effective_date").notNull(),
    modificationType: varchar("modification_type").notNull(), // RENEWAL, TERMINATION, IMPAIRMENT, TERMS_CHANGE
    changeReason: varchar("change_reason"),

    // Snapshots
    previousTerms: jsonb("previous_terms"), // Snapshot of header before change
    newTerms: jsonb("new_terms"),         // Snapshot of header after change

    // Audit
    modifiedBy: varchar("modified_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// Schemas
export const insertLeaseHeaderSchema = createInsertSchema(leaseHeaders).extend({
    leaseNumber: z.string().min(1),
    description: z.string().min(1),
    vendorId: z.string().min(1),
    discountRate: z.number().min(0).max(1),
    commencementDate: z.string(), // Receives date string
    expirationDate: z.string(),
});

export const insertLeasePaymentSchema = createInsertSchema(leasePayments).extend({
    amount: z.number(),
    startDate: z.string(),
    endDate: z.string(),
});

export const insertLeaseAssetSchema = createInsertSchema(leaseAssets);
export const insertLeaseAmendmentSchema = createInsertSchema(leaseAmendments);

export type LeaseHeader = typeof leaseHeaders.$inferSelect;
export type LeasePayment = typeof leasePayments.$inferSelect;
export type LeaseAsset = typeof leaseAssets.$inferSelect;
export type LeaseSchedule = typeof leaseSchedules.$inferSelect;
export type LeaseAmendment = typeof leaseAmendments.$inferSelect;
