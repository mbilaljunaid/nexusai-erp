
import { pgTable, text, varchar, timestamp, numeric, boolean, integer, jsonb, date } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Asset Books (Corporate, Tax, etc.) - The Master Definition of a Book
export const faBooks = pgTable("fa_books", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bookCode: varchar("book_code", { length: 30 }).notNull().unique(), // e.g., CORP_USD
    description: text("description").notNull(),
    ledgerId: varchar("ledger_id").notNull(), // Link to GL
    depreciationCalendar: varchar("depreciation_calendar", { length: 50 }).notNull(), // Monthly
    prorateCalendar: varchar("prorate_calendar", { length: 50 }).default("MONTHLY"),
    currentPeriodName: varchar("current_period_name"),
    status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE, CLOSED
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. Asset Categories (Accounting Defaults)
export const faCategories = pgTable("fa_categories", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    bookId: varchar("book_id").references(() => faBooks.id),
    majorCategory: varchar("major_category", { length: 50 }).notNull(), // e.g., FURNITURE
    minorCategory: varchar("minor_category", { length: 50 }),           // e.g., DESKS

    // Default Accounts (CCIDs)
    assetCostAccountCcid: varchar("asset_cost_account_ccid").notNull(),
    assetClearingAccountCcid: varchar("asset_clearing_account_ccid"),
    deprExpenseAccountCcid: varchar("depr_expense_account_ccid").notNull(),
    accumDeprAccountCcid: varchar("accum_depr_account_ccid").notNull(),
    cipCostAccountCcid: varchar("cip_cost_account_ccid"),

    // Default Rules
    defaultLifeYears: integer("default_life_years").notNull(),
    defaultMethod: varchar("default_method", { length: 30 }).default("STL"), // STL, 200DB

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3. Assets (Physical/Logical Reference)
export const faAssets = pgTable("fa_assets", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetNumber: varchar("asset_number", { length: 50 }).notNull().unique(),
    tagNumber: varchar("tag_number", { length: 50 }),
    description: text("description").notNull(),
    manufacturer: varchar("manufacturer"),
    model: varchar("model"),
    serialNumber: varchar("serial_number"),

    // Links
    categoryId: varchar("category_id").references(() => faCategories.id).notNull(),

    // Overall Status
    status: varchar("status", { length: 20 }).default("ACTIVE"), // ACTIVE, RETIRED, CIP

    // Lease Reference (L4)
    leaseId: varchar("lease_id"),

    // Physical Verification (L3)
    qrCode: text("qr_code"),
    lastVerifiedAt: timestamp("last_verified_at"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3a. Asset Financials (Multi-Book)
export const faAssetBooks = pgTable("fa_asset_books", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetId: varchar("asset_id").references(() => faAssets.id).notNull(),
    bookId: varchar("book_id").references(() => faBooks.id).notNull(),

    // Financial Details (Independent per Book)
    datePlacedInService: timestamp("date_placed_in_service").notNull(),
    originalCost: numeric("original_cost", { precision: 20, scale: 2 }).notNull(),
    salvageValue: numeric("salvage_value", { precision: 20, scale: 2 }).default("0"),
    recoverableCost: numeric("recoverable_cost", { precision: 20, scale: 2 }).notNull(),

    // Depreciation Rules (Independent per Book)
    lifeYears: integer("life_years").notNull(),
    lifeMonths: integer("life_months").default(0),
    method: varchar("method", { length: 30 }).notNull(), // STL

    // Book-Specific Status
    status: varchar("status", { length: 20 }).default("ACTIVE"),
    fullyReserved: boolean("fully_reserved").default(false),

    // Advanced Depreciation (L3)
    totalUnits: numeric("total_units", { precision: 20, scale: 2 }), // For Units of Production
    unitsConsumed: numeric("units_consumed", { precision: 20, scale: 2 }).default("0"),
    dbRate: numeric("db_rate", { precision: 5, scale: 2 }), // For Declining Balance (e.g. 2.0 for 200% DB)

    // Current Assignment (Simplified - 1:1 for now)
    locationId: varchar("location_id"),
    ccid: varchar("ccid"), // GL Code Combination ID for depreciation expense

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 4. Transactions (Lifecycle Events)
export const faTransactions = pgTable("fa_transactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetBookId: varchar("asset_book_id").references(() => faAssetBooks.id).notNull(), // Link to specific asset in a book

    transactionType: varchar("transaction_type", { length: 30 }).notNull(), // ADDITION, DEPRECIATION, ADJUSTMENT, RETIREMENT
    transactionDate: timestamp("transaction_date").notNull(),
    periodName: varchar("period_name"),

    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(), // Impact on NBV

    // Audit
    reference: varchar("reference"), // Source Invoice, etc.
    description: text("description"),
    status: varchar("status", { length: 20 }).default("POSTED"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 5. Depreciation History (Periodic)
export const faDepreciationHistory = pgTable("fa_depreciation_history", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetBookId: varchar("asset_book_id").references(() => faAssetBooks.id).notNull(),
    periodName: varchar("period_name").notNull(),

    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    ytdDepreciation: numeric("ytd_depreciation", { precision: 20, scale: 2 }).notNull(),
    accumulatedDepreciation: numeric("accumulated_depreciation", { precision: 20, scale: 2 }).notNull(),
    netBookValue: numeric("net_book_value", { precision: 20, scale: 2 }).notNull(),

    isPostedToGl: boolean("is_posted_to_gl").default(false),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// Zod Schemas
export const insertFaBookSchema = createInsertSchema(faBooks);
export const insertFaCategorySchema = createInsertSchema(faCategories);
export const insertFaAssetSchema = createInsertSchema(faAssets);
export const insertFaAssetBookSchema = createInsertSchema(faAssetBooks);
export const insertFaTransactionSchema = createInsertSchema(faTransactions);

export type FaBook = typeof faBooks.$inferSelect;
export type InsertFaBook = typeof faBooks.$inferInsert;

export type FaCategory = typeof faCategories.$inferSelect;
export type InsertFaCategory = typeof faCategories.$inferInsert;

export type FaAsset = typeof faAssets.$inferSelect;
export type InsertFaAsset = typeof faAssets.$inferInsert;

export type FaAssetBook = typeof faAssetBooks.$inferSelect;
export type InsertFaAssetBook = typeof faAssetBooks.$inferInsert;

export type FaTransaction = typeof faTransactions.$inferSelect;
export type InsertFaTransaction = typeof faTransactions.$inferInsert;

export type FaDepreciationHistory = typeof faDepreciationHistory.$inferSelect;

// 6. Retirements
export const faRetirements = pgTable("fa_retirements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetBookId: varchar("asset_book_id").references(() => faAssetBooks.id).notNull(),

    retirementDate: timestamp("retirement_date").notNull(),
    periodName: varchar("period_name").notNull(),

    proceedsOfSale: numeric("proceeds_of_sale", { precision: 20, scale: 2 }).default("0"),
    costOfRemoval: numeric("cost_of_removal", { precision: 20, scale: 2 }).default("0"),

    netBookValueRetired: numeric("net_book_value_retired", { precision: 20, scale: 2 }).notNull(),
    gainLossAmount: numeric("gain_loss_amount", { precision: 20, scale: 2 }).notNull(), // Proceeds - CostRemoval - NBV

    // Approval Workflow (L11)
    approvalStatus: varchar("approval_status", { length: 20 }).default("PENDING"), // PENDING, APPROVED, REJECTED
    approvedBy: varchar("approved_by"),
    approvedAt: timestamp("approved_at"),

    status: varchar("status", { length: 20 }).default("PROCESSED"),
    postingStatus: varchar("posting_status", { length: 20 }).default("UNPOSTED"), // To GL

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 7. Mass Additions (Interface Table from AP)
export const faMassAdditions = pgTable("fa_mass_additions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    // Source Info
    sourceType: varchar("source_type", { length: 20 }).default("AP_INVOICE"),
    invoiceNumber: varchar("invoice_number", { length: 50 }),
    invoiceLineNumber: integer("invoice_line_number"),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    date: timestamp("date").notNull(),
    vendorName: varchar("vendor_name"),

    // Asset Prep Info
    status: varchar("status", { length: 20 }).default("QUEUE"), // QUEUE, POSTED, ON_HOLD
    assetBookId: varchar("asset_book_id"), // User selects this
    assetCategoryId: varchar("asset_category_id"), // User selects this

    // Link to created asset
    createdAssetId: varchar("created_asset_id"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertFaRetirementSchema = createInsertSchema(faRetirements);
export const insertFaMassAdditionSchema = createInsertSchema(faMassAdditions);

export type FaRetirement = typeof faRetirements.$inferSelect;
export type InsertFaRetirement = typeof faRetirements.$inferInsert;

export type FaMassAddition = typeof faMassAdditions.$inferSelect;
export type InsertFaMassAddition = typeof faMassAdditions.$inferInsert;

// 7. Asset Transfers (L3)
export const faTransfers = pgTable("fa_transfers", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    assetBookId: varchar("asset_book_id").references(() => faAssetBooks.id).notNull(),

    transactionDate: timestamp("transaction_date").notNull(),

    fromLocationId: varchar("from_location_id"),
    toLocationId: varchar("to_location_id"),
    fromCcid: varchar("from_ccid"),
    toCcid: varchar("to_ccid"),

    units: numeric("units").default("1"),

    description: text("description"),
    createdBy: varchar("created_by"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertFaTransferSchema = createInsertSchema(faTransfers);
export type FaTransfer = typeof faTransfers.$inferSelect;
export type InsertFaTransfer = typeof faTransfers.$inferInsert;

// 8. Leases (L4 - IFRS 16)
export const faLeases = pgTable("fa_leases", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    leaseNumber: varchar("lease_number").notNull().unique(),
    description: text("description"),

    lessor: varchar("lessor"),
    leaseType: varchar("lease_type", { length: 30 }).notNull(), // OPERATING, FINANCE

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    termMonths: integer("term_months").notNull(),

    monthlyPayment: numeric("monthly_payment", { precision: 20, scale: 2 }).notNull(),
    interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(), // Incremental Borrowing Rate

    pvOfPayments: numeric("pv_of_payments", { precision: 20, scale: 2 }), // Calculated Lease Liability
    status: varchar("status", { length: 20 }).default("ACTIVE"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertFaLeaseSchema = createInsertSchema(faLeases);
export type FaLease = typeof faLeases.$inferSelect;
export type InsertFaLease = typeof faLeases.$inferInsert;

// 9. Physical Inventory (L3)
export const faPhysicalInventory = pgTable("fa_physical_inventory", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    inventoryName: varchar("inventory_name").notNull(),
    status: varchar("status", { length: 20 }).default("OPEN"), // OPEN, CLOSED, RECONCILED

    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),

    description: text("description"),
    createdBy: varchar("created_by"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const faInventoryScans = pgTable("fa_inventory_scans", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    inventoryId: varchar("inventory_id").references(() => faPhysicalInventory.id).notNull(),
    assetId: varchar("asset_id").references(() => faAssets.id).notNull(),

    scanDate: timestamp("scan_date").default(sql`now()`),
    scannedLocationId: varchar("scanned_location_id"),
    scannedBy: varchar("scanned_by"),

    condition: varchar("condition", { length: 50 }), // GOOD, DAMAGED, OBSOLETE
    notes: text("notes"),

    reconciliationStatus: varchar("reconciliation_status", { length: 20 }).default("PENDING"), // MATCH, MISMATCH, NEW
});

export const insertFaPhysicalInventorySchema = createInsertSchema(faPhysicalInventory);
export const insertFaInventoryScanSchema = createInsertSchema(faInventoryScans);
export type FaPhysicalInventory = typeof faPhysicalInventory.$inferSelect;
export type FaInventoryScan = typeof faInventoryScans.$inferSelect;
