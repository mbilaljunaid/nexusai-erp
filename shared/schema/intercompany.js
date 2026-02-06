"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.icAllocationLines = exports.icAllocationRules = exports.icDataAccessSets = exports.icTransferPricingRules = exports.icLinesRelations = exports.icHeadersRelations = exports.icBatchesRelations = exports.icLines = exports.icHeaders = exports.icBatches = exports.icTransactionTypes = exports.icOrgs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// 1. Intercompany Organizations
// Maps an Org to a Legal Entity and specific settings
exports.icOrgs = (0, pg_core_1.pgTable)("ic_orgs", {
    id: (0, pg_core_1.text)("id").primaryKey(), // e.g. "ICO-101"
    orgName: (0, pg_core_1.text)("org_name").notNull(),
    legalEntityId: (0, pg_core_1.text)("legal_entity_id").notNull(),
    ledgerId: (0, pg_core_1.text)("ledger_id").notNull(),
    companySegment: (0, pg_core_1.text)("company_segment").notNull(), // e.g. "101"
    receivablesAccountId: (0, pg_core_1.text)("receivables_account_id"), // Default IC AR
    payablesAccountId: (0, pg_core_1.text)("payables_account_id"), // Default IC AP
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// 2. Transaction Types
// Rules for Invoicing, Approval, and Balancing
exports.icTransactionTypes = (0, pg_core_1.pgTable)("ic_transaction_types", {
    id: (0, pg_core_1.text)("id").primaryKey(), // e.g. "SHARED_SERVICES"
    typeName: (0, pg_core_1.text)("type_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    requiresApproval: (0, pg_core_1.boolean)("requires_approval").default(true),
    requiresInvoicing: (0, pg_core_1.boolean)("requires_invoicing").default(false), // If true, generates AP/AR
    manualApproveAllowed: (0, pg_core_1.boolean)("manual_approve_allowed").default(false),
    defaultMarkup: (0, pg_core_1.numeric)("default_markup", { precision: 5, scale: 2 }).default("0"), // e.g. 0.10 for 10%
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// 3. Batches (Group of Transactions)
exports.icBatches = (0, pg_core_1.pgTable)("ic_batches", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    batchNumber: (0, pg_core_1.serial)("batch_number"),
    description: (0, pg_core_1.text)("description"),
    initiatorOrgId: (0, pg_core_1.text)("initiator_org_id").references(() => exports.icOrgs.id),
    status: (0, pg_core_1.text)("status").notNull(), // DRAFT, SUBMITTED, PARTIAL, COMPLETE
    glDate: (0, pg_core_1.date)("gl_date").notNull(),
    currencyCode: (0, pg_core_1.text)("currency_code").notNull(),
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 20, scale: 2 }),
    totalTransactions: (0, pg_core_1.integer)("total_transactions").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    createdBy: (0, pg_core_1.text)("created_by")
});
// 4. Headers (Individual Transaction: Provider -> Receiver)
exports.icHeaders = (0, pg_core_1.pgTable)("ic_headers", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    batchId: (0, pg_core_1.uuid)("batch_id").references(() => exports.icBatches.id),
    transactionTypeId: (0, pg_core_1.text)("transaction_type_id").references(() => exports.icTransactionTypes.id),
    providerOrgId: (0, pg_core_1.text)("provider_org_id").references(() => exports.icOrgs.id),
    receiverOrgId: (0, pg_core_1.text)("receiver_org_id").references(() => exports.icOrgs.id),
    amount: (0, pg_core_1.numeric)("amount", { precision: 20, scale: 2 }).notNull(),
    currencyCode: (0, pg_core_1.text)("currency_code").notNull(),
    conversionRate: (0, pg_core_1.numeric)("conversion_rate", { precision: 20, scale: 10 }).default("1"),
    markupRate: (0, pg_core_1.numeric)("markup_rate", { precision: 5, scale: 2 }).default("0"), // Applied Markup
    status: (0, pg_core_1.text)("status").notNull(), // NEW, RECEIVED, APPROVED, REJECTED, TRANSFERRED
    rejectionReason: (0, pg_core_1.text)("rejection_reason"),
    glStatus: (0, pg_core_1.text)("gl_status").default("Pending"), // Pending, Transferred
    invoiceStatus: (0, pg_core_1.text)("invoice_status").default("Not Required"),
    settlementStatus: (0, pg_core_1.text)("settlement_status").default("Unsettled"), // Unsettled, Selected, Settled
    settlementBatchId: (0, pg_core_1.varchar)("settlement_batch_id"), // Link to ic_netting_batches
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// 5. Lines (Distributions)
// Can be Provider Lines (Revenue/Expense) or Receiver Lines (Expense)
exports.icLines = (0, pg_core_1.pgTable)("ic_lines", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    headerId: (0, pg_core_1.uuid)("header_id").references(() => exports.icHeaders.id),
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    side: (0, pg_core_1.text)("side").notNull(), // PROVIDER or RECEIVER
    codeCombinationId: (0, pg_core_1.text)("code_combination_id").notNull(),
    enteredDr: (0, pg_core_1.numeric)("entered_dr", { precision: 20, scale: 2 }),
    enteredCr: (0, pg_core_1.numeric)("entered_cr", { precision: 20, scale: 2 }),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// Relations
exports.icBatchesRelations = (0, drizzle_orm_1.relations)(exports.icBatches, ({ many }) => ({
    headers: many(exports.icHeaders)
}));
exports.icHeadersRelations = (0, drizzle_orm_1.relations)(exports.icHeaders, ({ one, many }) => ({
    batch: one(exports.icBatches, { fields: [exports.icHeaders.batchId], references: [exports.icBatches.id] }),
    lines: many(exports.icLines)
}));
exports.icLinesRelations = (0, drizzle_orm_1.relations)(exports.icLines, ({ one }) => ({
    header: one(exports.icHeaders, { fields: [exports.icLines.headerId], references: [exports.icHeaders.id] })
}));
// 6. Transfer Pricing Rules
// Rules for automated markup calculation
exports.icTransferPricingRules = (0, pg_core_1.pgTable)("ic_transfer_pricing_rules", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    providerOrgId: (0, pg_core_1.text)("provider_org_id").references(() => exports.icOrgs.id).notNull(),
    receiverOrgId: (0, pg_core_1.text)("receiver_org_id").references(() => exports.icOrgs.id).notNull(), // Can be "ALL" for global rule
    transactionTypeId: (0, pg_core_1.text)("transaction_type_id").references(() => exports.icTransactionTypes.id), // Optional specific rule
    markupType: (0, pg_core_1.text)("markup_type").notNull().default("PERCENTAGE"), // PERCENTAGE, FIXED_AMOUNT, NONE
    markupValue: (0, pg_core_1.numeric)("markup_value", { precision: 10, scale: 4 }).notNull(), // e.g. 0.15 for 15% or 100.00 for amount
    activeFrom: (0, pg_core_1.date)("active_from").notNull().defaultNow(),
    activeTo: (0, pg_core_1.date)("active_to"),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// 7. Data Access Sets (Security)
// Maps Users to permitted IC Orgs
exports.icDataAccessSets = (0, pg_core_1.pgTable)("ic_data_access_sets", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull(), // Links to auth system
    icOrgId: (0, pg_core_1.text)("ic_org_id").references(() => exports.icOrgs.id).notNull(),
    accessLevel: (0, pg_core_1.text)("access_level").default("FULL"), // FULL, READ_ONLY
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// 8. Allocation Rules (Mass Allocations)
// Header for allocation formulas
exports.icAllocationRules = (0, pg_core_1.pgTable)("ic_allocation_rules", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    sourceOrgId: (0, pg_core_1.text)("source_org_id").references(() => exports.icOrgs.id).notNull(),
    allocationMethod: (0, pg_core_1.text)("allocation_method").default("PERCENTAGE"), // PERCENTAGE, FIXED
    status: (0, pg_core_1.text)("status").default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// 9. Allocation Lines (Targets)
exports.icAllocationLines = (0, pg_core_1.pgTable)("ic_allocation_lines", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    ruleId: (0, pg_core_1.uuid)("rule_id").references(() => exports.icAllocationRules.id).notNull(),
    targetOrgId: (0, pg_core_1.text)("target_org_id").references(() => exports.icOrgs.id).notNull(),
    percentage: (0, pg_core_1.numeric)("percentage", { precision: 5, scale: 2 }), // e.g. 50.00
    fixedAmount: (0, pg_core_1.numeric)("fixed_amount", { precision: 20, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
//# sourceMappingURL=intercompany.js.map