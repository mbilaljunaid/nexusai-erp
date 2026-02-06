"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertGlLedgerControlSchema = exports.glLedgerControls = exports.insertGlJournalCategorySchema = exports.glJournalCategories = exports.insertGlJournalSourceSchema = exports.glJournalSources = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
/**
 * Advanced GL Configuration Tables
 * Optimized for Oracle Fusion Parity
 */
// 1. Journal Sources
// Defines where journals originate (Manual, Assets, Payables, etc.)
exports.glJournalSources = (0, pg_core_1.pgTable)("gl_je_sources", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(), // e.g. "Manual", "Payables"
    userSourceName: (0, pg_core_1.varchar)("user_source_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    importJournalReferences: (0, pg_core_1.boolean)("import_journal_references").default(false),
    journalApprovalFlag: (0, pg_core_1.boolean)("journal_approval_flag").default(false),
    effectiveDateRule: (0, pg_core_1.varchar)("effective_date_rule").default("Fail"), // Fail, Warn, Use
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlJournalSourceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glJournalSources);
// 2. Journal Categories
// Defines the type of transactions (Adjustment, Accrual, Netting, etc.)
exports.glJournalCategories = (0, pg_core_1.pgTable)("gl_je_categories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name").notNull().unique(), // e.g. "Adjustment"
    userCategoryName: (0, pg_core_1.varchar)("user_category_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    reversalMethod: (0, pg_core_1.varchar)("reversal_method").default("Switch Dr/Cr"), // Switch Dr/Cr, Change Sign
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlJournalCategorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.glJournalCategories);
// 3. Ledger Controls (Suspense & Rounding)
// Extends Ledger configuration with functional controls
exports.glLedgerControls = (0, pg_core_1.pgTable)("gl_ledger_controls", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull().unique(),
    // Suspense Posting
    enableSuspense: (0, pg_core_1.boolean)("enable_suspense").default(false),
    suspenseCcid: (0, pg_core_1.varchar)("suspense_ccid"), // Account to hold imbalances
    // Rounding
    roundingCcid: (0, pg_core_1.varchar)("rounding_ccid"), // Account for currency precision diffs
    thresholdAmount: (0, pg_core_1.numeric)("threshold_amount", { precision: 18, scale: 2 }).default("0"),
    // Automation
    autoPostJournals: (0, pg_core_1.boolean)("auto_post_journals").default(false),
    autoReverseJournals: (0, pg_core_1.boolean)("auto_reverse_journals").default(false),
    // Period & Integrity Controls (Chunk 5)
    enforcePeriodClose: (0, pg_core_1.boolean)("enforce_period_close").default(true), // Reject if Closed
    preventFutureEntry: (0, pg_core_1.boolean)("prevent_future_entry").default(false), // Warn/Reject future dates
    allowPriorPeriodEntry: (0, pg_core_1.boolean)("allow_prior_period_entry").default(true), // Allow if Open
    approvalLimit: (0, pg_core_1.numeric)("approval_limit", { precision: 18, scale: 2 }), // e.g. 10000
    enforceCvr: (0, pg_core_1.boolean)("enforce_cvr").default(true),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlLedgerControlSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glLedgerControls);
//# sourceMappingURL=gl-config.js.map