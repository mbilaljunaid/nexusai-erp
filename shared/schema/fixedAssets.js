"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFaInventoryScanSchema = exports.insertFaPhysicalInventorySchema = exports.faInventoryScans = exports.faPhysicalInventory = exports.insertFaLeaseSchema = exports.faLeases = exports.insertFaTransferSchema = exports.faTransfers = exports.insertFaMassAdditionSchema = exports.insertFaRetirementSchema = exports.faMassAdditions = exports.faRetirements = exports.insertFaTransactionSchema = exports.insertFaAssetBookSchema = exports.insertFaAssetSchema = exports.insertFaCategorySchema = exports.insertFaBookSchema = exports.faDepreciationHistory = exports.faTransactions = exports.faAssetBooks = exports.faAssets = exports.faCategories = exports.faBooks = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// 1. Asset Books (Corporate, Tax, etc.) - The Master Definition of a Book
exports.faBooks = (0, pg_core_1.pgTable)("fa_books", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bookCode: (0, pg_core_1.varchar)("book_code", { length: 30 }).notNull().unique(), // e.g., CORP_USD
    description: (0, pg_core_1.text)("description").notNull(),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(), // Link to GL
    depreciationCalendar: (0, pg_core_1.varchar)("depreciation_calendar", { length: 50 }).notNull(), // Monthly
    prorateCalendar: (0, pg_core_1.varchar)("prorate_calendar", { length: 50 }).default("MONTHLY"),
    currentPeriodName: (0, pg_core_1.varchar)("current_period_name"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("ACTIVE"), // ACTIVE, CLOSED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. Asset Categories (Accounting Defaults)
exports.faCategories = (0, pg_core_1.pgTable)("fa_categories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    bookId: (0, pg_core_1.varchar)("book_id").references(() => exports.faBooks.id),
    majorCategory: (0, pg_core_1.varchar)("major_category", { length: 50 }).notNull(), // e.g., FURNITURE
    minorCategory: (0, pg_core_1.varchar)("minor_category", { length: 50 }), // e.g., DESKS
    // Default Accounts (CCIDs)
    assetCostAccountCcid: (0, pg_core_1.varchar)("asset_cost_account_ccid").notNull(),
    assetClearingAccountCcid: (0, pg_core_1.varchar)("asset_clearing_account_ccid"),
    deprExpenseAccountCcid: (0, pg_core_1.varchar)("depr_expense_account_ccid").notNull(),
    accumDeprAccountCcid: (0, pg_core_1.varchar)("accum_depr_account_ccid").notNull(),
    cipCostAccountCcid: (0, pg_core_1.varchar)("cip_cost_account_ccid"),
    // Default Rules
    defaultLifeYears: (0, pg_core_1.integer)("default_life_years").notNull(),
    defaultMethod: (0, pg_core_1.varchar)("default_method", { length: 30 }).default("STL"), // STL, 200DB
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. Assets (Physical/Logical Reference)
exports.faAssets = (0, pg_core_1.pgTable)("fa_assets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    assetNumber: (0, pg_core_1.varchar)("asset_number", { length: 50 }).notNull().unique(),
    tagNumber: (0, pg_core_1.varchar)("tag_number", { length: 50 }),
    description: (0, pg_core_1.text)("description").notNull(),
    manufacturer: (0, pg_core_1.varchar)("manufacturer"),
    model: (0, pg_core_1.varchar)("model"),
    serialNumber: (0, pg_core_1.varchar)("serial_number"),
    // Links
    categoryId: (0, pg_core_1.varchar)("category_id").references(() => exports.faCategories.id).notNull(),
    // Overall Status
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("ACTIVE"), // ACTIVE, RETIRED, CIP
    // Lease Reference (L4)
    leaseId: (0, pg_core_1.varchar)("lease_id"),
    // Hierarchy (L3 Reference)
    parentId: (0, pg_core_1.varchar)("parent_id").references(() => exports.faAssets.id),
    // Physical Verification (L3)
    qrCode: (0, pg_core_1.text)("qr_code"),
    lastVerifiedAt: (0, pg_core_1.timestamp)("last_verified_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3a. Asset Financials (Multi-Book)
exports.faAssetBooks = (0, pg_core_1.pgTable)("fa_asset_books", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    assetId: (0, pg_core_1.varchar)("asset_id").references(() => exports.faAssets.id).notNull(),
    bookId: (0, pg_core_1.varchar)("book_id").references(() => exports.faBooks.id).notNull(),
    // Financial Details (Independent per Book)
    datePlacedInService: (0, pg_core_1.timestamp)("date_placed_in_service").notNull(),
    originalCost: (0, pg_core_1.numeric)("original_cost", { precision: 20, scale: 2 }).notNull(),
    salvageValue: (0, pg_core_1.numeric)("salvage_value", { precision: 20, scale: 2 }).default("0"),
    recoverableCost: (0, pg_core_1.numeric)("recoverable_cost", { precision: 20, scale: 2 }).notNull(),
    // Depreciation Rules (Independent per Book)
    lifeYears: (0, pg_core_1.integer)("life_years").notNull(),
    lifeMonths: (0, pg_core_1.integer)("life_months").default(0),
    method: (0, pg_core_1.varchar)("method", { length: 30 }).notNull(), // STL
    // Book-Specific Status
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("ACTIVE"),
    fullyReserved: (0, pg_core_1.boolean)("fully_reserved").default(false),
    // Advanced Depreciation (L3)
    totalUnits: (0, pg_core_1.numeric)("total_units", { precision: 20, scale: 2 }), // For Units of Production
    unitsConsumed: (0, pg_core_1.numeric)("units_consumed", { precision: 20, scale: 2 }).default("0"),
    dbRate: (0, pg_core_1.numeric)("db_rate", { precision: 5, scale: 2 }), // For Declining Balance (e.g. 2.0 for 200% DB)
    // Current Assignment (Simplified - 1:1 for now)
    locationId: (0, pg_core_1.varchar)("location_id"),
    ccid: (0, pg_core_1.varchar)("ccid"), // GL Code Combination ID for depreciation expense
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. Transactions (Lifecycle Events)
exports.faTransactions = (0, pg_core_1.pgTable)("fa_transactions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    assetBookId: (0, pg_core_1.varchar)("asset_book_id").references(() => exports.faAssetBooks.id).notNull(), // Link to specific asset in a book
    transactionType: (0, pg_core_1.varchar)("transaction_type", { length: 30 }).notNull(), // ADDITION, DEPRECIATION, ADJUSTMENT, RETIREMENT
    transactionDate: (0, pg_core_1.timestamp)("transaction_date").notNull(),
    periodName: (0, pg_core_1.varchar)("period_name"),
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(), // Impact on NBV
    // Audit
    reference: (0, pg_core_1.varchar)("reference"), // Source Invoice, etc.
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("POSTED"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 5. Depreciation History (Periodic)
exports.faDepreciationHistory = (0, pg_core_1.pgTable)("fa_depreciation_history", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    assetBookId: (0, pg_core_1.varchar)("asset_book_id").references(() => exports.faAssetBooks.id).notNull(),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(),
    ytdDepreciation: (0, pg_core_1.numeric)("ytd_depreciation", { precision: 20, scale: 2 }).notNull(),
    accumulatedDepreciation: (0, pg_core_1.numeric)("accumulated_depreciation", { precision: 20, scale: 2 }).notNull(),
    netBookValue: (0, pg_core_1.numeric)("net_book_value", { precision: 20, scale: 2 }).notNull(),
    isPostedToGl: (0, pg_core_1.boolean)("is_posted_to_gl").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// Zod Schemas
exports.insertFaBookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faBooks);
exports.insertFaCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.faCategories);
exports.insertFaAssetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faAssets);
exports.insertFaAssetBookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faAssetBooks);
exports.insertFaTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faTransactions);
// 6. Retirements
exports.faRetirements = (0, pg_core_1.pgTable)("fa_retirements", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    assetBookId: (0, pg_core_1.varchar)("asset_book_id").references(() => exports.faAssetBooks.id).notNull(),
    retirementDate: (0, pg_core_1.timestamp)("retirement_date").notNull(),
    periodName: (0, pg_core_1.varchar)("period_name").notNull(),
    proceedsOfSale: (0, pg_core_1.numeric)("proceeds_of_sale", { precision: 20, scale: 2 }).default("0"),
    costOfRemoval: (0, pg_core_1.numeric)("cost_of_removal", { precision: 20, scale: 2 }).default("0"),
    netBookValueRetired: (0, pg_core_1.numeric)("net_book_value_retired", { precision: 20, scale: 2 }).notNull(),
    gainLossAmount: (0, pg_core_1.numeric)("gain_loss_amount", { precision: 20, scale: 2 }).notNull(), // Proceeds - CostRemoval - NBV
    // Approval Workflow (L11)
    approvalStatus: (0, pg_core_1.varchar)("approval_status", { length: 20 }).default("PENDING"), // PENDING, APPROVED, REJECTED
    approvedBy: (0, pg_core_1.varchar)("approved_by"),
    approvedAt: (0, pg_core_1.timestamp)("approved_at"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("PROCESSED"),
    postingStatus: (0, pg_core_1.varchar)("posting_status", { length: 20 }).default("UNPOSTED"), // To GL
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 7. Mass Additions (Interface Table from AP)
exports.faMassAdditions = (0, pg_core_1.pgTable)("fa_mass_additions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    // Source Info
    sourceType: (0, pg_core_1.varchar)("source_type", { length: 20 }).default("AP_INVOICE"),
    invoiceNumber: (0, pg_core_1.varchar)("invoice_number", { length: 50 }),
    invoiceLineNumber: (0, pg_core_1.integer)("invoice_line_number"),
    description: (0, pg_core_1.text)("description").notNull(),
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(),
    date: (0, pg_core_1.timestamp)("date").notNull(),
    vendorName: (0, pg_core_1.varchar)("vendor_name"),
    // Asset Prep Info
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("QUEUE"), // QUEUE, POSTED, ON_HOLD
    assetBookId: (0, pg_core_1.varchar)("asset_book_id"), // User selects this
    assetCategoryId: (0, pg_core_1.varchar)("asset_category_id"), // User selects this
    // Link to created asset
    createdAssetId: (0, pg_core_1.varchar)("created_asset_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertFaRetirementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faRetirements);
exports.insertFaMassAdditionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faMassAdditions);
// 7. Asset Transfers (L3)
exports.faTransfers = (0, pg_core_1.pgTable)("fa_transfers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    assetBookId: (0, pg_core_1.varchar)("asset_book_id").references(() => exports.faAssetBooks.id).notNull(),
    transactionDate: (0, pg_core_1.timestamp)("transaction_date").notNull(),
    fromLocationId: (0, pg_core_1.varchar)("from_location_id"),
    toLocationId: (0, pg_core_1.varchar)("to_location_id"),
    fromCcid: (0, pg_core_1.varchar)("from_ccid"),
    toCcid: (0, pg_core_1.varchar)("to_ccid"),
    units: (0, pg_core_1.numeric)("units").default("1"),
    description: (0, pg_core_1.text)("description"),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertFaTransferSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faTransfers);
// 8. Leases (L4 - IFRS 16)
exports.faLeases = (0, pg_core_1.pgTable)("fa_leases", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    leaseNumber: (0, pg_core_1.varchar)("lease_number").notNull().unique(),
    description: (0, pg_core_1.text)("description"),
    lessor: (0, pg_core_1.varchar)("lessor"),
    leaseType: (0, pg_core_1.varchar)("lease_type", { length: 30 }).notNull(), // OPERATING, FINANCE
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    termMonths: (0, pg_core_1.integer)("term_months").notNull(),
    monthlyPayment: (0, pg_core_1.numeric)("monthly_payment", { precision: 20, scale: 2 }).notNull(),
    interestRate: (0, pg_core_1.numeric)("interest_rate", { precision: 5, scale: 2 }).notNull(), // Incremental Borrowing Rate
    pvOfPayments: (0, pg_core_1.numeric)("pv_of_payments", { precision: 20, scale: 2 }), // Calculated Lease Liability
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertFaLeaseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faLeases);
// 9. Physical Inventory (L3)
exports.faPhysicalInventory = (0, pg_core_1.pgTable)("fa_physical_inventory", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    inventoryName: (0, pg_core_1.varchar)("inventory_name").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("OPEN"), // OPEN, CLOSED, RECONCILED
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    description: (0, pg_core_1.text)("description"),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.faInventoryScans = (0, pg_core_1.pgTable)("fa_inventory_scans", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    inventoryId: (0, pg_core_1.varchar)("inventory_id").references(() => exports.faPhysicalInventory.id).notNull(),
    assetId: (0, pg_core_1.varchar)("asset_id").references(() => exports.faAssets.id).notNull(),
    scanDate: (0, pg_core_1.timestamp)("scan_date").default((0, drizzle_orm_1.sql) `now()`),
    scannedLocationId: (0, pg_core_1.varchar)("scanned_location_id"),
    scannedBy: (0, pg_core_1.varchar)("scanned_by"),
    condition: (0, pg_core_1.varchar)("condition", { length: 50 }), // GOOD, DAMAGED, OBSOLETE
    notes: (0, pg_core_1.text)("notes"),
    reconciliationStatus: (0, pg_core_1.varchar)("reconciliation_status", { length: 20 }).default("PENDING"), // MATCH, MISMATCH, NEW
});
exports.insertFaPhysicalInventorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.faPhysicalInventory);
exports.insertFaInventoryScanSchema = (0, drizzle_zod_1.createInsertSchema)(exports.faInventoryScans);
//# sourceMappingURL=fixedAssets.js.map