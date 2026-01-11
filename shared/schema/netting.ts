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
    customerId: varchar("customer_id").notNull(),
    supplierId: integer("supplier_id").notNull(), // AP Supplier ID is integer in existing schema
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
