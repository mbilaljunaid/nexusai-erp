
import { pgTable, varchar, numeric, timestamp, integer, boolean, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Counterparties: Banks, Brokers, Issuers, etc.
export const treasuryCounterparties = pgTable("treasury_counterparties", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // 'BANK', 'BROKER', 'ISSUER', 'GOVERNMENT'
    shortName: varchar("short_name", { length: 50 }),
    taxId: varchar("tax_id", { length: 50 }),
    swiftCode: varchar("swift_code", { length: 11 }),
    address: text("address"),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTreasuryCounterpartySchema = createInsertSchema(treasuryCounterparties);
export type TreasuryCounterparty = typeof treasuryCounterparties.$inferSelect;

// Treasury Deals: Debt, Investments, FX Contracts
export const treasuryDeals = pgTable("treasury_deals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealNumber: varchar("deal_number", { length: 50 }).notNull().unique(), // Human-readable ID
    type: varchar("type", { length: 50 }).notNull(), // 'DEBT', 'INVESTMENT', 'FX_FORWARD', 'FX_SWAP'
    subType: varchar("sub_type", { length: 50 }), // 'REVOLVER', 'TERM_LOAN', 'CD', 'BOND'
    counterpartyId: varchar("counterparty_id").notNull(),
    bankAccountId: varchar("bank_account_id"), // Disbursement/Settlement account
    principalAmount: numeric("principal_amount", { precision: 20, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).default("USD"),

    // Interest Details
    interestRate: numeric("interest_rate", { precision: 10, scale: 6 }), // Yearly rate
    interestType: varchar("interest_type", { length: 20 }).default("FIXED"), // 'FIXED', 'FLOATING'
    basisPointsSpread: integer("basis_points_spread").default(0), // If floating (e.g. LIBOR + 200)
    dayCountConvention: varchar("day_count_convention", { length: 20 }).default("30/360"),

    // Dates
    startDate: timestamp("start_date").notNull(),
    maturityDate: timestamp("maturity_date"),
    termMonths: integer("term_months"),

    // Status & Logic
    status: varchar("status", { length: 20 }).default("DRAFT"), // 'DRAFT', 'CONFIRMED', 'ACTIVE', 'MATURED', 'CANCELLED'
    valuationMethod: varchar("valuation_method", { length: 20 }).default("AMORTIZED_COST"),

    legalEntityId: varchar("legal_entity_id"),
    ledgerId: varchar("ledger_id"),

    description: text("description"),
    metadata: jsonb("metadata"), // FX strike rates, swap legs, etc.

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertTreasuryDealSchema = createInsertSchema(treasuryDeals);
export type TreasuryDeal = typeof treasuryDeals.$inferSelect;

// Installments: P&I Schedule for Debt/Inv
export const treasuryInstallments = pgTable("treasury_installments", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealId: varchar("deal_id").notNull(),
    sequenceNumber: integer("sequence_number").notNull(),
    dueDate: timestamp("due_date").notNull(),

    principalAmount: numeric("principal_amount", { precision: 20, scale: 2 }).notNull(),
    interestAmount: numeric("interest_amount", { precision: 20, scale: 2 }).notNull(),
    totalAmount: numeric("total_amount", { precision: 20, scale: 2 }).notNull(),

    remainingPrincipal: numeric("remaining_principal", { precision: 20, scale: 2 }),

    status: varchar("status", { length: 20 }).default("PENDING"), // 'PENDING', 'PAID', 'OVERDUE'
    paymentId: varchar("payment_id"), // Link to AP/AR if settled

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTreasuryInstallmentSchema = createInsertSchema(treasuryInstallments);
export type TreasuryInstallment = typeof treasuryInstallments.$inferSelect;

// Consolidated FX Deals (Forwards, Swaps, Spots)
export const treasuryFxDeals = pgTable("treasury_fx_deals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    dealNumber: varchar("deal_number", { length: 50 }).notNull().unique(),
    dealType: varchar("deal_type", { length: 20 }).notNull(), // 'SPOT', 'FORWARD', 'SWAP'

    counterpartyId: varchar("counterparty_id").notNull(),
    portfolioId: varchar("portfolio_id"), // For grouping hedges

    // Currencies
    buyCurrency: varchar("buy_currency", { length: 3 }).notNull(),
    sellCurrency: varchar("sell_currency", { length: 3 }).notNull(),

    // Amounts
    buyAmount: numeric("buy_amount", { precision: 20, scale: 2 }).notNull(),
    sellAmount: numeric("sell_amount", { precision: 20, scale: 2 }).notNull(),

    // Rates
    exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6 }).notNull(), // The agreed rate
    spotRate: numeric("spot_rate", { precision: 12, scale: 6 }), // Rate at inception

    // Dates
    valueDate: timestamp("value_date").notNull(), // Settlement Date
    tradeDate: timestamp("trade_date").default(sql`now()`),

    status: varchar("status", { length: 20 }).default("DRAFT"), // 'DRAFT', 'CONFIRMED', 'SETTLED', 'CANCELLED'

    // Valuation
    markToMarket: numeric("mark_to_market", { precision: 20, scale: 2 }).default("0"),
    lastRevaluationDate: timestamp("last_revaluation_date"),

    notes: text("notes"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTreasuryFxDealSchema = createInsertSchema(treasuryFxDeals);
export type TreasuryFxDeal = typeof treasuryFxDeals.$inferSelect;

// Market Rates: For Revaluation (MtM)
export const treasuryMarketRates = pgTable("treasury_market_rates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    rateType: varchar("rate_type", { length: 20 }).notNull(), // 'FX_SPOT', 'FX_FORWARD', 'LIBOR', 'SOFR'
    currencyPair: varchar("currency_pair", { length: 7 }), // 'EUR/USD'

    rate: numeric("rate", { precision: 12, scale: 6 }).notNull(),
    date: timestamp("date").notNull(),
    source: varchar("source", { length: 50 }).default("MANUAL"), // 'BLOOMBERG', 'REUTERS', 'MANUAL'

    uploadedAt: timestamp("uploaded_at").default(sql`now()`),
});

export const insertTreasuryMarketRateSchema = createInsertSchema(treasuryMarketRates);
export type TreasuryMarketRate = typeof treasuryMarketRates.$inferSelect;

// Risk Limits
export const treasuryRiskLimits = pgTable("treasury_risk_limits", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    counterpartyId: varchar("counterparty_id").notNull(),

    limitType: varchar("limit_type", { length: 50 }).default("GLOBAL_EXPOSURE"), // 'FX_EXPOSURE', 'SETTLEMENT_RISK'
    currency: varchar("currency", { length: 3 }).default("USD"),
    maxAmount: numeric("max_amount", { precision: 20, scale: 2 }).notNull(),

    active: boolean("active").default(true),

    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertTreasuryRiskLimitSchema = createInsertSchema(treasuryRiskLimits);
export type TreasuryRiskLimit = typeof treasuryRiskLimits.$inferSelect;

// Cash Forecasts: Snapshots of projected liquidity
export const treasuryCashForecasts = pgTable("treasury_cash_forecasts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    forecastDate: timestamp("forecast_date").notNull(), // Target date of the cash flow
    currency: varchar("currency", { length: 3 }).default("USD"),
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    source: varchar("source", { length: 50 }).notNull(), // 'AP_INVOICE', 'AR_INVOICE', 'DEBT_PAYMENT', 'INVESTMENT_RETURN', 'FX_SETTLEMENT'

    scenario: varchar("scenario", { length: 50 }).default("BASELINE"), // 'BASELINE', 'OPTIMISTIC', 'PESSIMISTIC'
    confidence: numeric("confidence", { precision: 5, scale: 2 }).default("100"), // 0-100%

    sourceId: varchar("source_id"), // Link to Invoice ID or Deal ID

    generatedAt: timestamp("generated_at").default(sql`now()`),
});


export const insertTreasuryCashForecastSchema = createInsertSchema(treasuryCashForecasts);
export type TreasuryCashForecast = typeof treasuryCashForecasts.$inferSelect;

// ----------------------------------------------------------------------
// Phase 4: In-House Banking & Netting
// ----------------------------------------------------------------------

// Internal Accounts (IHB Accounts for Subsidiaries)
export const treasuryInternalAccounts = pgTable("treasury_internal_accounts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityName: varchar("entity_name", { length: 100 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD"),
    balance: numeric("balance", { precision: 20, scale: 2 }).default("0"),
    status: varchar("status", { length: 20 }).default("ACTIVE"),
    linkedGlAccount: varchar("linked_gl_account", { length: 50 }),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertTreasuryInternalAccountSchema = createInsertSchema(treasuryInternalAccounts);
export type TreasuryInternalAccount = typeof treasuryInternalAccounts.$inferSelect;

// Netting Batches (Header for a consolidated settlement run)
export const treasuryNettingBatches = pgTable("treasury_netting_batches", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    batchNumber: varchar("batch_number", { length: 50 }).notNull().unique(), // e.g. NET-2026-001
    settlementDate: timestamp("settlement_date").notNull(),
    status: varchar("status", { length: 20 }).default("DRAFT"), // DRAFT, CALCULATED, SETTLED
    totalPayables: numeric("total_payables", { precision: 20, scale: 2 }).default("0"),
    totalReceivables: numeric("total_receivables", { precision: 20, scale: 2 }).default("0"),
    currency: varchar("currency", { length: 3 }).default("USD"), // Base currency for netting
    createdBy: varchar("created_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertTreasuryNettingBatchSchema = createInsertSchema(treasuryNettingBatches);
export type TreasuryNettingBatch = typeof treasuryNettingBatches.$inferSelect;

// Netting Lines (Individual Invoices/Transactions included in the batch)
export const treasuryNettingLines = pgTable("treasury_netting_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    batchId: varchar("batch_id").notNull(), // FK to treasury_netting_batches
    sourceType: varchar("source_type", { length: 50 }).notNull(), // 'AP_INVOICE', 'AR_INVOICE'
    sourceId: varchar("source_id").notNull(),
    entityId: varchar("entity_id").notNull(), // Which subsidiary is involved
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(), // Positive = Receivabe (Inflow), Negative = Payable (Outflow)

    originalCurrency: varchar("original_currency", { length: 3 }),
    exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }).default("1"),
    baseAmount: numeric("base_amount", { precision: 20, scale: 2 }).notNull(), // Converted to Batch Currency

    status: varchar("status", { length: 20 }).default("PENDING"),
});

export const insertTreasuryNettingLineSchema = createInsertSchema(treasuryNettingLines);
export type TreasuryNettingLine = typeof treasuryNettingLines.$inferSelect;
