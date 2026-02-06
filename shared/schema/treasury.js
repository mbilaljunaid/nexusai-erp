"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treasuryPaymentMessages = exports.treasuryHedgeRelationships = exports.insertTreasuryNettingLineSchema = exports.treasuryNettingLines = exports.insertTreasuryNettingBatchSchema = exports.treasuryNettingBatches = exports.insertTreasuryInternalAccountSchema = exports.treasuryInternalAccounts = exports.insertTreasuryCashForecastSchema = exports.treasuryCashForecasts = exports.insertTreasuryRiskLimitSchema = exports.treasuryRiskLimits = exports.insertTreasuryMarketRateSchema = exports.treasuryMarketRates = exports.insertTreasuryFxDealSchema = exports.treasuryFxDeals = exports.insertTreasuryInstallmentSchema = exports.treasuryInstallments = exports.insertTreasuryDealSchema = exports.treasuryDeals = exports.insertTreasuryCounterpartySchema = exports.treasuryCounterparties = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// Counterparties: Banks, Brokers, Issuers, etc.
exports.treasuryCounterparties = (0, pg_core_1.pgTable)("treasury_counterparties", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(), // 'BANK', 'BROKER', 'ISSUER', 'GOVERNMENT'
    shortName: (0, pg_core_1.varchar)("short_name", { length: 50 }),
    taxId: (0, pg_core_1.varchar)("tax_id", { length: 50 }),
    swiftCode: (0, pg_core_1.varchar)("swift_code", { length: 11 }),
    address: (0, pg_core_1.text)("address"),
    active: (0, pg_core_1.boolean)("active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTreasuryCounterpartySchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryCounterparties);
// Treasury Deals: Debt, Investments, FX Contracts
exports.treasuryDeals = (0, pg_core_1.pgTable)("treasury_deals", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    dealNumber: (0, pg_core_1.varchar)("deal_number", { length: 50 }).notNull().unique(), // Human-readable ID
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(), // 'DEBT', 'INVESTMENT', 'FX_FORWARD', 'FX_SWAP'
    subType: (0, pg_core_1.varchar)("sub_type", { length: 50 }), // 'REVOLVER', 'TERM_LOAN', 'CD', 'BOND'
    counterpartyId: (0, pg_core_1.varchar)("counterparty_id").notNull(),
    bankAccountId: (0, pg_core_1.varchar)("bank_account_id"), // Disbursement/Settlement account
    principalAmount: (0, pg_core_1.numeric)("principal_amount", { precision: 20, scale: 2 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency", { length: 10 }).default("USD"),
    // Interest Details
    interestRate: (0, pg_core_1.numeric)("interest_rate", { precision: 10, scale: 6 }), // Yearly rate
    interestType: (0, pg_core_1.varchar)("interest_type", { length: 20 }).default("FIXED"), // 'FIXED', 'FLOATING'
    basisPointsSpread: (0, pg_core_1.integer)("basis_points_spread").default(0), // If floating (e.g. LIBOR + 200)
    dayCountConvention: (0, pg_core_1.varchar)("day_count_convention", { length: 20 }).default("30/360"),
    // Dates
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    maturityDate: (0, pg_core_1.timestamp)("maturity_date"),
    termMonths: (0, pg_core_1.integer)("term_months"),
    // Status & Logic
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("DRAFT"), // 'DRAFT', 'CONFIRMED', 'ACTIVE', 'MATURED', 'CANCELLED'
    confirmationStatus: (0, pg_core_1.varchar)("confirmation_status", { length: 20 }).default("PENDING"), // Phase 5
    settlementStatus: (0, pg_core_1.varchar)("settlement_status", { length: 20 }).default("PENDING"), // Phase 5
    traderId: (0, pg_core_1.varchar)("trader_id"), // Phase 5
    backOfficeUserId: (0, pg_core_1.varchar)("back_office_user_id"), // Phase 5
    valuationMethod: (0, pg_core_1.varchar)("valuation_method", { length: 20 }).default("AMORTIZED_COST"),
    legalEntityId: (0, pg_core_1.varchar)("legal_entity_id"),
    ledgerId: (0, pg_core_1.varchar)("ledger_id"),
    description: (0, pg_core_1.text)("description"),
    metadata: (0, pg_core_1.jsonb)("metadata"), // FX strike rates, swap legs, etc.
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTreasuryDealSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryDeals);
// Installments: P&I Schedule for Debt/Inv
exports.treasuryInstallments = (0, pg_core_1.pgTable)("treasury_installments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    dealId: (0, pg_core_1.varchar)("deal_id").notNull(),
    sequenceNumber: (0, pg_core_1.integer)("sequence_number").notNull(),
    dueDate: (0, pg_core_1.timestamp)("due_date").notNull(),
    principalAmount: (0, pg_core_1.numeric)("principal_amount", { precision: 20, scale: 2 }).notNull(),
    interestAmount: (0, pg_core_1.numeric)("interest_amount", { precision: 20, scale: 2 }).notNull(),
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 20, scale: 2 }).notNull(),
    remainingPrincipal: (0, pg_core_1.numeric)("remaining_principal", { precision: 20, scale: 2 }),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("PENDING"), // 'PENDING', 'PAID', 'OVERDUE'
    paymentId: (0, pg_core_1.varchar)("payment_id"), // Link to AP/AR if settled
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTreasuryInstallmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryInstallments);
// Consolidated FX Deals (Forwards, Swaps, Spots)
exports.treasuryFxDeals = (0, pg_core_1.pgTable)("treasury_fx_deals", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    dealNumber: (0, pg_core_1.varchar)("deal_number", { length: 50 }).notNull().unique(),
    dealType: (0, pg_core_1.varchar)("deal_type", { length: 20 }).notNull(), // 'SPOT', 'FORWARD', 'SWAP'
    counterpartyId: (0, pg_core_1.varchar)("counterparty_id").notNull(),
    portfolioId: (0, pg_core_1.varchar)("portfolio_id"), // For grouping hedges
    // Currencies
    buyCurrency: (0, pg_core_1.varchar)("buy_currency", { length: 3 }).notNull(),
    sellCurrency: (0, pg_core_1.varchar)("sell_currency", { length: 3 }).notNull(),
    // Amounts
    buyAmount: (0, pg_core_1.numeric)("buy_amount", { precision: 20, scale: 2 }).notNull(),
    sellAmount: (0, pg_core_1.numeric)("sell_amount", { precision: 20, scale: 2 }).notNull(),
    // Rates
    exchangeRate: (0, pg_core_1.numeric)("exchange_rate", { precision: 12, scale: 6 }).notNull(), // The agreed rate
    spotRate: (0, pg_core_1.numeric)("spot_rate", { precision: 12, scale: 6 }), // Rate at inception
    // Dates
    valueDate: (0, pg_core_1.timestamp)("value_date").notNull(), // Settlement Date
    tradeDate: (0, pg_core_1.timestamp)("trade_date").default((0, drizzle_orm_1.sql) `now()`),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("DRAFT"), // 'DRAFT', 'CONFIRMED', 'SETTLED', 'CANCELLED'
    confirmationStatus: (0, pg_core_1.varchar)("confirmation_status", { length: 20 }).default("PENDING"), // Phase 5
    settlementStatus: (0, pg_core_1.varchar)("settlement_status", { length: 20 }).default("PENDING"), // Phase 5
    traderId: (0, pg_core_1.varchar)("trader_id"), // Phase 5
    backOfficeUserId: (0, pg_core_1.varchar)("back_office_user_id"), // Phase 5
    // Valuation
    markToMarket: (0, pg_core_1.numeric)("mark_to_market", { precision: 20, scale: 2 }).default("0"),
    lastRevaluationDate: (0, pg_core_1.timestamp)("last_revaluation_date"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTreasuryFxDealSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryFxDeals);
// Market Rates: For Revaluation (MtM)
exports.treasuryMarketRates = (0, pg_core_1.pgTable)("treasury_market_rates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    rateType: (0, pg_core_1.varchar)("rate_type", { length: 20 }).notNull(), // 'FX_SPOT', 'FX_FORWARD', 'LIBOR', 'SOFR'
    currencyPair: (0, pg_core_1.varchar)("currency_pair", { length: 7 }), // 'EUR/USD'
    rate: (0, pg_core_1.numeric)("rate", { precision: 12, scale: 6 }).notNull(),
    date: (0, pg_core_1.timestamp)("date").notNull(),
    source: (0, pg_core_1.varchar)("source", { length: 50 }).default("MANUAL"), // 'BLOOMBERG', 'REUTERS', 'MANUAL'
    uploadedAt: (0, pg_core_1.timestamp)("uploaded_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTreasuryMarketRateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryMarketRates);
// Risk Limits
exports.treasuryRiskLimits = (0, pg_core_1.pgTable)("treasury_risk_limits", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    counterpartyId: (0, pg_core_1.varchar)("counterparty_id").notNull(),
    limitType: (0, pg_core_1.varchar)("limit_type", { length: 50 }).default("GLOBAL_EXPOSURE"), // 'FX_EXPOSURE', 'SETTLEMENT_RISK'
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default("USD"),
    maxAmount: (0, pg_core_1.numeric)("max_amount", { precision: 20, scale: 2 }).notNull(),
    active: (0, pg_core_1.boolean)("active").default(true),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTreasuryRiskLimitSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryRiskLimits);
// Cash Forecasts: Snapshots of projected liquidity
exports.treasuryCashForecasts = (0, pg_core_1.pgTable)("treasury_cash_forecasts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    forecastDate: (0, pg_core_1.timestamp)("forecast_date").notNull(), // Target date of the cash flow
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default("USD"),
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(),
    source: (0, pg_core_1.varchar)("source", { length: 50 }).notNull(), // 'AP_INVOICE', 'AR_INVOICE', 'DEBT_PAYMENT', 'INVESTMENT_RETURN', 'FX_SETTLEMENT'
    scenario: (0, pg_core_1.varchar)("scenario", { length: 50 }).default("BASELINE"), // 'BASELINE', 'OPTIMISTIC', 'PESSIMISTIC'
    confidence: (0, pg_core_1.numeric)("confidence", { precision: 5, scale: 2 }).default("100"), // 0-100%
    sourceId: (0, pg_core_1.varchar)("source_id"), // Link to Invoice ID or Deal ID
    generatedAt: (0, pg_core_1.timestamp)("generated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTreasuryCashForecastSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryCashForecasts);
// ----------------------------------------------------------------------
// Phase 4: In-House Banking & Netting
// ----------------------------------------------------------------------
// Internal Accounts (IHB Accounts for Subsidiaries)
exports.treasuryInternalAccounts = (0, pg_core_1.pgTable)("treasury_internal_accounts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityName: (0, pg_core_1.varchar)("entity_name", { length: 100 }).notNull(),
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default("USD"),
    balance: (0, pg_core_1.numeric)("balance", { precision: 20, scale: 2 }).default("0"),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("ACTIVE"),
    linkedGlAccount: (0, pg_core_1.varchar)("linked_gl_account", { length: 50 }),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTreasuryInternalAccountSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryInternalAccounts);
// Netting Batches (Header for a consolidated settlement run)
exports.treasuryNettingBatches = (0, pg_core_1.pgTable)("treasury_netting_batches", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    batchNumber: (0, pg_core_1.varchar)("batch_number", { length: 50 }).notNull().unique(), // e.g. NET-2026-001
    settlementDate: (0, pg_core_1.timestamp)("settlement_date").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("DRAFT"), // DRAFT, CALCULATED, SETTLED
    totalPayables: (0, pg_core_1.numeric)("total_payables", { precision: 20, scale: 2 }).default("0"),
    totalReceivables: (0, pg_core_1.numeric)("total_receivables", { precision: 20, scale: 2 }).default("0"),
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default("USD"), // Base currency for netting
    createdBy: (0, pg_core_1.varchar)("created_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertTreasuryNettingBatchSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryNettingBatches);
// Netting Lines (Individual Invoices/Transactions included in the batch)
exports.treasuryNettingLines = (0, pg_core_1.pgTable)("treasury_netting_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    batchId: (0, pg_core_1.varchar)("batch_id").notNull(), // FK to treasury_netting_batches
    sourceType: (0, pg_core_1.varchar)("source_type", { length: 50 }).notNull(), // 'AP_INVOICE', 'AR_INVOICE'
    sourceId: (0, pg_core_1.varchar)("source_id").notNull(),
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(), // Which subsidiary is involved
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(), // Positive = Receivabe (Inflow), Negative = Payable (Outflow)
    originalCurrency: (0, pg_core_1.varchar)("original_currency", { length: 3 }),
    exchangeRate: (0, pg_core_1.numeric)("exchange_rate", { precision: 10, scale: 6 }).default("1"),
    baseAmount: (0, pg_core_1.numeric)("base_amount", { precision: 20, scale: 2 }).notNull(), // Converted to Batch Currency
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("PENDING"),
});
exports.insertTreasuryNettingLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treasuryNettingLines);
// Phase 5: Hedge Relationships
exports.treasuryHedgeRelationships = (0, pg_core_1.pgTable)("treasury_hedge_relationships", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    dealId: (0, pg_core_1.varchar)("deal_id").notNull(),
    sourceType: (0, pg_core_1.varchar)("source_type", { length: 20 }).notNull(), // AP_INVOICE, AR_INVOICE
    sourceId: (0, pg_core_1.varchar)("source_id").notNull(),
    hedgeAmount: (0, pg_core_1.numeric)("hedge_amount", { precision: 20, scale: 2 }).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("ACTIVE"), // ACTIVE, CLOSED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// Phase 5: Payment Transmission (ISO 20022/SWIFT)
exports.treasuryPaymentMessages = (0, pg_core_1.pgTable)("treasury_payment_messages", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    batchId: (0, pg_core_1.varchar)("batch_id"),
    messageType: (0, pg_core_1.varchar)("message_type", { length: 20 }).notNull(), // pain.001, pain.002
    xmlContent: (0, pg_core_1.text)("xml_content"),
    externalReference: (0, pg_core_1.varchar)("external_reference", { length: 100 }),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("SENT"), // SENT, ACCEPTED, REJECTED
    errorDetails: (0, pg_core_1.text)("error_details"),
    sentAt: (0, pg_core_1.timestamp)("sent_at").default((0, drizzle_orm_1.sql) `now()`),
});
//# sourceMappingURL=treasury.js.map