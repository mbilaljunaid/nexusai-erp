// shared/schema/tax.ts
import { pgTable, serial, varchar, numeric, integer, foreignKey, boolean } from "drizzle-orm/pg-core";
import { arCustomers } from "./ar";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const taxJurisdictions = pgTable("tax_jurisdictions", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // Country, State, City
    parentId: integer("parent_id"),
}, (t) => ({
    parentFk: foreignKey({ columns: [t.parentId], foreignColumns: [t.id] })
}));

export const insertTaxJurisdictionSchema = createInsertSchema(taxJurisdictions);

export const taxCodes = pgTable("tax_codes", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    rate: numeric("rate", { precision: 5, scale: 4 }).notNull(), // e.g., 0.0750 for 7.5%
    jurisdictionId: integer("jurisdiction_id").notNull(),
    active: boolean("active").default(true).notNull(),
}, (t) => ({
    jurisdictionFk: foreignKey({ columns: [t.jurisdictionId], foreignColumns: [taxJurisdictions.id] })
}));

export const insertTaxCodeSchema = createInsertSchema(taxCodes).extend({
    rate: z.string(), // numeric is string in zod usually
});

export const taxExemptions = pgTable("tax_exemptions", {
    id: serial("id").primaryKey(),
    customerId: varchar("customer_id"),
    siteId: varchar("site_id"),
    taxCodeId: integer("tax_code_id").notNull(),
    exemptionType: varchar("exemption_type", { length: 20 }).notNull(), // Full | Partial
    exemptionValue: numeric("exemption_value", { precision: 5, scale: 4 }).default("0"),
}, (t) => ({
    taxCodeFk: foreignKey({ columns: [t.taxCodeId], foreignColumns: [taxCodes.id] })
}));

export const insertTaxExemptionSchema = createInsertSchema(taxExemptions).extend({
    exemptionValue: z.string().optional(),
});

export type TaxJurisdiction = typeof taxJurisdictions.$inferSelect;
export type InsertTaxJurisdiction = typeof taxJurisdictions.$inferInsert;
export type TaxCode = typeof taxCodes.$inferSelect;
export type InsertTaxCode = typeof taxCodes.$inferInsert;
export type TaxExemption = typeof taxExemptions.$inferSelect;
export type InsertTaxExemption = typeof taxExemptions.$inferInsert;
