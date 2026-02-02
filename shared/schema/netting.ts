import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, date } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { arCustomers } from "./ar";
import { apSuppliers } from "./ap";

// Netting Agreements
export const nettingAgreements = pgTable("netting_agreements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    agreementName: varchar("agreement_name").notNull(),
    customerId: varchar("customer_id"), // Optional if IC
    supplierId: integer("supplier_id"), // Optional if IC
    intercompanyOrgId: varchar("intercompany_org_id"), // New: Link to ic_orgs
    nettingCurrency: varchar("netting_currency").default("USD"),
    status: varchar("status").default("Active"), // Active, Inactive
    frequency: varchar("frequency").default("Monthly"), // Monthly, Weekly, Adhoc
    lastRunDate: timestamp("last_run_date"),
    nextRunDate: timestamp("next_run_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const nettingAgreementsRelations = relations(nettingAgreements, ({ one }) => ({
    customer: one(arCustomers, {
        fields: [nettingAgreements.customerId],
        references: [arCustomers.id],
    }),
    supplier: one(apSuppliers, {
        fields: [nettingAgreements.supplierId],
        references: [apSuppliers.id],
    }),
}));

export const insertNettingAgreementSchema = createInsertSchema(nettingAgreements);
export type NettingAgreement = typeof nettingAgreements.$inferSelect;
export type InsertNettingAgreement = typeof nettingAgreements.$inferInsert;

// Netting Settlements (The "Run" or "Batch")
export const nettingSettlements = pgTable("netting_settlements", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    agreementId: varchar("agreement_id").notNull(),
    settlementDate: timestamp("settlement_date").defaultNow(),
    status: varchar("status").default("Draft"), // Draft, Proposed, Settled
    totalArAmount: numeric("total_ar_amount", { precision: 18, scale: 2 }).default("0"),
    totalApAmount: numeric("total_ap_amount", { precision: 18, scale: 2 }).default("0"),
    nettedAmount: numeric("netted_amount", { precision: 18, scale: 2 }).default("0"),
    finalSettlementAmount: numeric("final_settlement_amount", { precision: 18, scale: 2 }).default("0"),
    direction: varchar("direction"), // "PaySupplier" or "ReceiveFromCustomer"
    arReceiptId: varchar("ar_receipt_id"), // Created Receipt
    apPaymentId: varchar("ap_payment_id"), // Created Payment
    createdAt: timestamp("created_at").defaultNow(),
});

export const nettingSettlementsRelations = relations(nettingSettlements, ({ one }) => ({
    agreement: one(nettingAgreements, {
        fields: [nettingSettlements.agreementId],
        references: [nettingAgreements.id],
    }),
}));

export const insertNettingSettlementSchema = createInsertSchema(nettingSettlements);
export type NettingSettlement = typeof nettingSettlements.$inferSelect;
export type InsertNettingSettlement = typeof nettingSettlements.$inferInsert;

// --- Intercompany Netting Extensions ---

// IC Netting Batches (Specific to Intercompany Settlements)
export const icNettingBatches = pgTable("ic_netting_batches", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    batchNumber: serial("batch_number"),
    agreementId: varchar("agreement_id").references(() => nettingAgreements.id),
    orgId1: varchar("org_id_1").notNull(), // Party A
    orgId2: varchar("org_id_2").notNull(), // Party B
    settlementDate: timestamp("settlement_date").defaultNow(),
    status: varchar("status").default("Draft"), // Draft, Proposed, Settled
    currencyCode: varchar("currency_code").notNull(),

    // Amounts
    totalPayables: numeric("total_payables", { precision: 18, scale: 2 }).default("0"), // A owes B
    totalReceivables: numeric("total_receivables", { precision: 18, scale: 2 }).default("0"), // B owes A
    netAmount: numeric("net_amount", { precision: 18, scale: 2 }).default("0"), // Result

    // Settlement Artifacts
    settlementJournalId: varchar("settlement_journal_id"), // Linked GL Journal

    createdAt: timestamp("created_at").defaultNow(),
    createdBy: varchar("created_by")
});

export const icNettingBatchesRelations = relations(icNettingBatches, ({ one }) => ({
    agreement: one(nettingAgreements, {
        fields: [icNettingBatches.agreementId],
        references: [nettingAgreements.id],
    })
}));

// Extend Netting Agreements to support IC (Poly-morphic logic handled in application or explicit column)
// We need to modify the existing table definition. Since I can only replace chunks, 
// I will provide the instruction to add the column in a separate migration step or 
// assumes the user handles schema migration. 
// For this environment, I should modify the definition of `nettingAgreements`.

