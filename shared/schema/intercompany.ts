
import { pgTable, text, serial, integer, boolean, timestamp, uuid, date, numeric, uniqueIndex, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Intercompany Organizations
// Maps an Org to a Legal Entity and specific settings
export const icOrgs = pgTable("ic_orgs", {
    id: text("id").primaryKey(), // e.g. "ICO-101"
    orgName: text("org_name").notNull(),
    legalEntityId: text("legal_entity_id").notNull(),
    ledgerId: text("ledger_id").notNull(),
    companySegment: text("company_segment").notNull(), // e.g. "101"
    receivablesAccountId: text("receivables_account_id"), // Default IC AR
    payablesAccountId: text("payables_account_id"), // Default IC AP
    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").defaultNow()
});

// 2. Transaction Types
// Rules for Invoicing, Approval, and Balancing
export const icTransactionTypes = pgTable("ic_transaction_types", {
    id: text("id").primaryKey(), // e.g. "SHARED_SERVICES"
    typeName: text("type_name").notNull(),
    description: text("description"),
    requiresApproval: boolean("requires_approval").default(true),
    requiresInvoicing: boolean("requires_invoicing").default(false), // If true, generates AP/AR
    manualApproveAllowed: boolean("manual_approve_allowed").default(false),
    defaultMarkup: numeric("default_markup", { precision: 5, scale: 2 }).default("0"), // e.g. 0.10 for 10%
    createdAt: timestamp("created_at").defaultNow()
});

// 3. Batches (Group of Transactions)
export const icBatches = pgTable("ic_batches", {
    id: uuid("id").defaultRandom().primaryKey(),
    batchNumber: serial("batch_number"),
    description: text("description"),
    initiatorOrgId: text("initiator_org_id").references(() => icOrgs.id),
    status: text("status").notNull(), // DRAFT, SUBMITTED, PARTIAL, COMPLETE
    glDate: date("gl_date").notNull(),
    currencyCode: text("currency_code").notNull(),
    totalAmount: numeric("total_amount", { precision: 20, scale: 2 }),
    totalTransactions: integer("total_transactions").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    createdBy: text("created_by")
});

// 4. Headers (Individual Transaction: Provider -> Receiver)
export const icHeaders = pgTable("ic_headers", {
    id: uuid("id").defaultRandom().primaryKey(),
    batchId: uuid("batch_id").references(() => icBatches.id),
    transactionTypeId: text("transaction_type_id").references(() => icTransactionTypes.id),
    providerOrgId: text("provider_org_id").references(() => icOrgs.id),
    receiverOrgId: text("receiver_org_id").references(() => icOrgs.id),
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    currencyCode: text("currency_code").notNull(),
    conversionRate: numeric("conversion_rate", { precision: 20, scale: 10 }).default("1"),
    markupRate: numeric("markup_rate", { precision: 5, scale: 2 }).default("0"), // Applied Markup
    status: text("status").notNull(), // NEW, RECEIVED, APPROVED, REJECTED, TRANSFERRED
    rejectionReason: text("rejection_reason"),
    glStatus: text("gl_status").default("Pending"), // Pending, Transferred
    invoiceStatus: text("invoice_status").default("Not Required"),
    settlementStatus: text("settlement_status").default("Unsettled"), // Unsettled, Selected, Settled
    settlementBatchId: varchar("settlement_batch_id"), // Link to ic_netting_batches
    createdAt: timestamp("created_at").defaultNow()
});

// 5. Lines (Distributions)
// Can be Provider Lines (Revenue/Expense) or Receiver Lines (Expense)
export const icLines = pgTable("ic_lines", {
    id: uuid("id").defaultRandom().primaryKey(),
    headerId: uuid("header_id").references(() => icHeaders.id),
    lineNumber: integer("line_number").notNull(),
    side: text("side").notNull(), // PROVIDER or RECEIVER
    codeCombinationId: text("code_combination_id").notNull(),
    enteredDr: numeric("entered_dr", { precision: 20, scale: 2 }),
    enteredCr: numeric("entered_cr", { precision: 20, scale: 2 }),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const icBatchesRelations = relations(icBatches, ({ many }) => ({
    headers: many(icHeaders)
}));

export const icHeadersRelations = relations(icHeaders, ({ one, many }) => ({
    batch: one(icBatches, { fields: [icHeaders.batchId], references: [icBatches.id] }),
    lines: many(icLines)
}));

export const icLinesRelations = relations(icLines, ({ one }) => ({
    header: one(icHeaders, { fields: [icLines.headerId], references: [icHeaders.id] })
}));

// 6. Transfer Pricing Rules
// Rules for automated markup calculation
export const icTransferPricingRules = pgTable("ic_transfer_pricing_rules", {
    id: uuid("id").defaultRandom().primaryKey(),
    providerOrgId: text("provider_org_id").references(() => icOrgs.id).notNull(),
    receiverOrgId: text("receiver_org_id").references(() => icOrgs.id).notNull(), // Can be "ALL" for global rule
    transactionTypeId: text("transaction_type_id").references(() => icTransactionTypes.id), // Optional specific rule
    markupType: text("markup_type").notNull().default("PERCENTAGE"), // PERCENTAGE, FIXED_AMOUNT, NONE
    markupValue: numeric("markup_value", { precision: 10, scale: 4 }).notNull(), // e.g. 0.15 for 15% or 100.00 for amount
    activeFrom: date("active_from").notNull().defaultNow(),
    activeTo: date("active_to"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow()
});

// 7. Data Access Sets (Security)
// Maps Users to permitted IC Orgs
export const icDataAccessSets = pgTable("ic_data_access_sets", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(), // Links to auth system
    icOrgId: text("ic_org_id").references(() => icOrgs.id).notNull(),
    accessLevel: text("access_level").default("FULL"), // FULL, READ_ONLY
    createdAt: timestamp("created_at").defaultNow()
});

// 8. Allocation Rules (Mass Allocations)
// Header for allocation formulas
export const icAllocationRules = pgTable("ic_allocation_rules", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    sourceOrgId: text("source_org_id").references(() => icOrgs.id).notNull(),
    allocationMethod: text("allocation_method").default("PERCENTAGE"), // PERCENTAGE, FIXED
    status: text("status").default("ACTIVE"),
    createdAt: timestamp("created_at").defaultNow()
});

// 9. Allocation Lines (Targets)
export const icAllocationLines = pgTable("ic_allocation_lines", {
    id: uuid("id").defaultRandom().primaryKey(),
    ruleId: uuid("rule_id").references(() => icAllocationRules.id).notNull(),
    targetOrgId: text("target_org_id").references(() => icOrgs.id).notNull(),
    percentage: numeric("percentage", { precision: 5, scale: 2 }), // e.g. 50.00
    fixedAmount: numeric("fixed_amount", { precision: 20, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow()
});

// 10. IC Netting Sessions (IC-OG-02)
export const icNettingSessions = pgTable("ic_netting_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: text("tenant_id").notNull(),
    sessionName: text("session_name").notNull(),
    period: text("period").notNull(),
    currency: text("currency").notNull(),
    entitiesInScope: jsonb("entities_in_scope"),
    settlementDate: date("settlement_date"),
    status: text("status").default("Draft"),
    netPositions: jsonb("net_positions"),
    runBy: text("run_by"),
    settledBy: text("settled_by"),
    settlementInstructions: jsonb("settlement_instructions"),
    createdAt: timestamp("created_at").defaultNow()
});

// 11. Transfer Pricing Policies (IC-OG-03)
export const transferPricingPolicies = pgTable("transfer_pricing_policies", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: text("tenant_id").notNull(),
    policyName: text("policy_name").notNull(),
    transactionCategory: text("transaction_category").notNull(),
    method: text("method").notNull(),
    fromEntity: text("from_entity"),
    toEntity: text("to_entity"),
    armLengthMarginPct: numeric("arm_length_margin_pct", { precision: 5, scale: 2 }),
    benchmarkRangeLow: numeric("benchmark_range_low", { precision: 5, scale: 2 }),
    benchmarkRangeHigh: numeric("benchmark_range_high", { precision: 5, scale: 2 }),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    approvedBy: text("approved_by"),
    createdAt: timestamp("created_at").defaultNow()
});

// 12. Transfer Pricing Analyses (IC-OG-03)
export const transferPricingAnalyses = pgTable("transfer_pricing_analyses", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: text("tenant_id").notNull(),
    policyId: uuid("policy_id").references(() => transferPricingPolicies.id),
    period: text("period").notNull(),
    actualMarginPct: numeric("actual_margin_pct", { precision: 5, scale: 2 }),
    benchmarkMarginPct: numeric("benchmark_margin_pct", { precision: 5, scale: 2 }),
    variancePct: numeric("variance_pct", { precision: 5, scale: 2 }),
    inRange: boolean("in_range").default(true),
    flagged: boolean("flagged").default(false),
    transactionsReviewed: integer("transactions_reviewed").default(0),
    analysisNotes: text("analysis_notes"),
    createdAt: timestamp("created_at").defaultNow()
});

// 13. IC Disputes (IC-OG-04)
export const icDisputes = pgTable("ic_disputes", {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: text("tenant_id").notNull(),
    disputeNumber: text("dispute_number").notNull().unique(),
    icTransactionId: text("ic_transaction_id"),
    fromEntity: text("from_entity").notNull(),
    toEntity: text("to_entity").notNull(),
    disputedAmount: numeric("disputed_amount", { precision: 20, scale: 2 }),
    currency: text("currency").notNull().default("USD"),
    reason: text("reason").notNull(),
    status: text("status").default("Open"),
    openedBy: text("opened_by").notNull(),
    openedAt: timestamp("opened_at").defaultNow(),
    resolvedBy: text("resolved_by"),
    resolvedAt: timestamp("resolved_at"),
    resolution: text("resolution"),
    events: jsonb("events").default("[]"),
    createdAt: timestamp("created_at").defaultNow()
});
