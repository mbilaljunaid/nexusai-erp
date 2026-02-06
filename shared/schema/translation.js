"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertGlHistoricalRateSchema = exports.glHistoricalRates = exports.insertGlTranslationRuleSchema = exports.glTranslationRules = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// 21. Translation Rules (Consolidation)
exports.glTranslationRules = (0, pg_core_1.pgTable)("gl_translation_rules", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    targetCurrency: (0, pg_core_1.varchar)("target_currency").notNull(),
    ruleName: (0, pg_core_1.varchar)("rule_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    // Rate Types for different account types
    assetRateType: (0, pg_core_1.varchar)("asset_rate_type").default("Period End"), // e.g. Period End
    liabilityRateType: (0, pg_core_1.varchar)("liability_rate_type").default("Period End"),
    revenueRateType: (0, pg_core_1.varchar)("revenue_rate_type").default("Average"),
    expenseRateType: (0, pg_core_1.varchar)("expense_rate_type").default("Average"),
    equityRateType: (0, pg_core_1.varchar)("equity_rate_type").default("Historical"),
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlTranslationRuleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glTranslationRules);
// 22. Historical Rates (for Equity/Specific Accounts)
exports.glHistoricalRates = (0, pg_core_1.pgTable)("gl_historical_rates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ledgerId: (0, pg_core_1.varchar)("ledger_id").notNull(),
    codeCombinationId: (0, pg_core_1.varchar)("code_combination_id").notNull(), // Specific account (e.g. Common Stock)
    periodName: (0, pg_core_1.varchar)("period_name"), // If rate is period-specific
    rate: (0, pg_core_1.numeric)("rate", { precision: 20, scale: 10 }).notNull(),
    rateType: (0, pg_core_1.varchar)("rate_type").default("Historical"),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertGlHistoricalRateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.glHistoricalRates);
//# sourceMappingURL=translation.js.map