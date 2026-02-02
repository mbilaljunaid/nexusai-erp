import { pgTable, varchar, text, timestamp, boolean, integer, jsonb, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Advanced GL Configuration Tables
 * Optimized for Oracle Fusion Parity
 */

// 1. Journal Sources
// Defines where journals originate (Manual, Assets, Payables, etc.)
export const glJournalSources = pgTable("gl_je_sources", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // e.g. "Manual", "Payables"
    userSourceName: varchar("user_source_name").notNull(),
    description: text("description"),
    importJournalReferences: boolean("import_journal_references").default(false),
    journalApprovalFlag: boolean("journal_approval_flag").default(false),
    effectiveDateRule: varchar("effective_date_rule").default("Fail"), // Fail, Warn, Use
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlJournalSourceSchema = createInsertSchema(glJournalSources);
export type InsertGlJournalSource = z.infer<typeof insertGlJournalSourceSchema>;
export type GlJournalSource = typeof glJournalSources.$inferSelect;

// 2. Journal Categories
// Defines the type of transactions (Adjustment, Accrual, Netting, etc.)
export const glJournalCategories = pgTable("gl_je_categories", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull().unique(), // e.g. "Adjustment"
    userCategoryName: varchar("user_category_name").notNull(),
    description: text("description"),
    reversalMethod: varchar("reversal_method").default("Switch Dr/Cr"), // Switch Dr/Cr, Change Sign
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlJournalCategorySchema = createInsertSchema(glJournalCategories);
export type InsertGlJournalCategory = z.infer<typeof insertGlJournalCategorySchema>;
export type GlJournalCategory = typeof glJournalCategories.$inferSelect;

// 3. Ledger Controls (Suspense & Rounding)
// Extends Ledger configuration with functional controls
export const glLedgerControls = pgTable("gl_ledger_controls", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull().unique(),

    // Suspense Posting
    enableSuspense: boolean("enable_suspense").default(false),
    suspenseCcid: varchar("suspense_ccid"), // Account to hold imbalances

    // Rounding
    roundingCcid: varchar("rounding_ccid"), // Account for currency precision diffs
    thresholdAmount: numeric("threshold_amount", { precision: 18, scale: 2 }).default("0"),

    // Automation
    autoPostJournals: boolean("auto_post_journals").default(false),
    autoReverseJournals: boolean("auto_reverse_journals").default(false),

    // Period & Integrity Controls (Chunk 5)
    enforcePeriodClose: boolean("enforce_period_close").default(true), // Reject if Closed
    preventFutureEntry: boolean("prevent_future_entry").default(false), // Warn/Reject future dates
    allowPriorPeriodEntry: boolean("allow_prior_period_entry").default(true), // Allow if Open
    approvalLimit: numeric("approval_limit", { precision: 18, scale: 2 }), // e.g. 10000
    enforceCvr: boolean("enforce_cvr").default(true),

    updatedAt: timestamp("updated_at").default(sql`now()`),
});


export const insertGlLedgerControlSchema = createInsertSchema(glLedgerControls);
export type InsertGlLedgerControl = z.infer<typeof insertGlLedgerControlSchema>;
export type GlLedgerControl = typeof glLedgerControls.$inferSelect;


