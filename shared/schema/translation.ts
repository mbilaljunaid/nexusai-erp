import { pgTable, varchar, text, timestamp, boolean, numeric, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 21. Translation Rules (Consolidation)
export const glTranslationRules = pgTable("gl_translation_rules", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    targetCurrency: varchar("target_currency").notNull(),
    ruleName: varchar("rule_name").notNull(),
    description: text("description"),

    // Rate Types for different account types
    assetRateType: varchar("asset_rate_type").default("Period End"), // e.g. Period End
    liabilityRateType: varchar("liability_rate_type").default("Period End"),
    revenueRateType: varchar("revenue_rate_type").default("Average"),
    expenseRateType: varchar("expense_rate_type").default("Average"),
    equityRateType: varchar("equity_rate_type").default("Historical"),

    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlTranslationRuleSchema = createInsertSchema(glTranslationRules);
export type InsertGlTranslationRule = z.infer<typeof insertGlTranslationRuleSchema>;
export type GlTranslationRule = typeof glTranslationRules.$inferSelect;

// 22. Historical Rates (for Equity/Specific Accounts)
export const glHistoricalRates = pgTable("gl_historical_rates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    ledgerId: varchar("ledger_id").notNull(),
    codeCombinationId: varchar("code_combination_id").notNull(), // Specific account (e.g. Common Stock)
    periodName: varchar("period_name"), // If rate is period-specific
    rate: numeric("rate", { precision: 20, scale: 10 }).notNull(),
    rateType: varchar("rate_type").default("Historical"),
    description: text("description"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertGlHistoricalRateSchema = createInsertSchema(glHistoricalRates);
export type InsertGlHistoricalRate = z.infer<typeof insertGlHistoricalRateSchema>;
export type GlHistoricalRate = typeof glHistoricalRates.$inferSelect;
