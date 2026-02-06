"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.icNettingBatchesRelations = exports.icNettingBatches = exports.insertNettingSettlementSchema = exports.nettingSettlementsRelations = exports.nettingSettlements = exports.insertNettingAgreementSchema = exports.nettingAgreementsRelations = exports.nettingAgreements = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const ar_1 = require("./ar");
const ap_1 = require("./ap");
// Netting Agreements
exports.nettingAgreements = (0, pg_core_1.pgTable)("netting_agreements", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    agreementName: (0, pg_core_1.varchar)("agreement_name").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id"), // Optional if IC
    supplierId: (0, pg_core_1.integer)("supplier_id"), // Optional if IC
    intercompanyOrgId: (0, pg_core_1.varchar)("intercompany_org_id"), // New: Link to ic_orgs
    nettingCurrency: (0, pg_core_1.varchar)("netting_currency").default("USD"),
    status: (0, pg_core_1.varchar)("status").default("Active"), // Active, Inactive
    frequency: (0, pg_core_1.varchar)("frequency").default("Monthly"), // Monthly, Weekly, Adhoc
    lastRunDate: (0, pg_core_1.timestamp)("last_run_date"),
    nextRunDate: (0, pg_core_1.timestamp)("next_run_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.nettingAgreementsRelations = (0, drizzle_orm_1.relations)(exports.nettingAgreements, ({ one }) => ({
    customer: one(ar_1.arCustomers, {
        fields: [exports.nettingAgreements.customerId],
        references: [ar_1.arCustomers.id],
    }),
    supplier: one(ap_1.apSuppliers, {
        fields: [exports.nettingAgreements.supplierId],
        references: [ap_1.apSuppliers.id],
    }),
}));
exports.insertNettingAgreementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.nettingAgreements);
// Netting Settlements (The "Run" or "Batch")
exports.nettingSettlements = (0, pg_core_1.pgTable)("netting_settlements", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    agreementId: (0, pg_core_1.varchar)("agreement_id").notNull(),
    settlementDate: (0, pg_core_1.timestamp)("settlement_date").defaultNow(),
    status: (0, pg_core_1.varchar)("status").default("Draft"), // Draft, Proposed, Settled
    totalArAmount: (0, pg_core_1.numeric)("total_ar_amount", { precision: 18, scale: 2 }).default("0"),
    totalApAmount: (0, pg_core_1.numeric)("total_ap_amount", { precision: 18, scale: 2 }).default("0"),
    nettedAmount: (0, pg_core_1.numeric)("netted_amount", { precision: 18, scale: 2 }).default("0"),
    finalSettlementAmount: (0, pg_core_1.numeric)("final_settlement_amount", { precision: 18, scale: 2 }).default("0"),
    direction: (0, pg_core_1.varchar)("direction"), // "PaySupplier" or "ReceiveFromCustomer"
    arReceiptId: (0, pg_core_1.varchar)("ar_receipt_id"), // Created Receipt
    apPaymentId: (0, pg_core_1.varchar)("ap_payment_id"), // Created Payment
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.nettingSettlementsRelations = (0, drizzle_orm_1.relations)(exports.nettingSettlements, ({ one }) => ({
    agreement: one(exports.nettingAgreements, {
        fields: [exports.nettingSettlements.agreementId],
        references: [exports.nettingAgreements.id],
    }),
}));
exports.insertNettingSettlementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.nettingSettlements);
// --- Intercompany Netting Extensions ---
// IC Netting Batches (Specific to Intercompany Settlements)
exports.icNettingBatches = (0, pg_core_1.pgTable)("ic_netting_batches", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    batchNumber: (0, pg_core_1.serial)("batch_number"),
    agreementId: (0, pg_core_1.varchar)("agreement_id").references(() => exports.nettingAgreements.id),
    orgId1: (0, pg_core_1.varchar)("org_id_1").notNull(), // Party A
    orgId2: (0, pg_core_1.varchar)("org_id_2").notNull(), // Party B
    settlementDate: (0, pg_core_1.timestamp)("settlement_date").defaultNow(),
    status: (0, pg_core_1.varchar)("status").default("Draft"), // Draft, Proposed, Settled
    currencyCode: (0, pg_core_1.varchar)("currency_code").notNull(),
    // Amounts
    totalPayables: (0, pg_core_1.numeric)("total_payables", { precision: 18, scale: 2 }).default("0"), // A owes B
    totalReceivables: (0, pg_core_1.numeric)("total_receivables", { precision: 18, scale: 2 }).default("0"), // B owes A
    netAmount: (0, pg_core_1.numeric)("net_amount", { precision: 18, scale: 2 }).default("0"), // Result
    // Settlement Artifacts
    settlementJournalId: (0, pg_core_1.varchar)("settlement_journal_id"), // Linked GL Journal
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    createdBy: (0, pg_core_1.varchar)("created_by")
});
exports.icNettingBatchesRelations = (0, drizzle_orm_1.relations)(exports.icNettingBatches, ({ one }) => ({
    agreement: one(exports.nettingAgreements, {
        fields: [exports.icNettingBatches.agreementId],
        references: [exports.nettingAgreements.id],
    })
}));
// Extend Netting Agreements to support IC (Poly-morphic logic handled in application or explicit column)
// We need to modify the existing table definition. Since I can only replace chunks, 
// I will provide the instruction to add the column in a separate migration step or 
// assumes the user handles schema migration. 
// For this environment, I should modify the definition of `nettingAgreements`.
//# sourceMappingURL=netting.js.map