"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTaxExemptionSchema = exports.taxExemptions = exports.insertTaxCodeSchema = exports.taxCodes = exports.insertTaxJurisdictionSchema = exports.taxJurisdictions = void 0;
// shared/schema/tax.ts
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
exports.taxJurisdictions = (0, pg_core_1.pgTable)("tax_jurisdictions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(), // Country, State, City
    parentId: (0, pg_core_1.integer)("parent_id"),
}, (t) => ({
    parentFk: (0, pg_core_1.foreignKey)({ columns: [t.parentId], foreignColumns: [t.id] })
}));
exports.insertTaxJurisdictionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taxJurisdictions);
exports.taxCodes = (0, pg_core_1.pgTable)("tax_codes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name", { length: 255 }).notNull(),
    rate: (0, pg_core_1.numeric)("rate", { precision: 5, scale: 4 }).notNull(), // e.g., 0.0750 for 7.5%
    jurisdictionId: (0, pg_core_1.integer)("jurisdiction_id").notNull(),
    active: (0, pg_core_1.boolean)("active").default(true).notNull(),
}, (t) => ({
    jurisdictionFk: (0, pg_core_1.foreignKey)({ columns: [t.jurisdictionId], foreignColumns: [exports.taxJurisdictions.id] })
}));
exports.insertTaxCodeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taxCodes).extend({
    rate: zod_1.z.string(), // numeric is string in zod usually
});
exports.taxExemptions = (0, pg_core_1.pgTable)("tax_exemptions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    siteId: (0, pg_core_1.varchar)("site_id"),
    taxCodeId: (0, pg_core_1.integer)("tax_code_id").notNull(),
    exemptionType: (0, pg_core_1.varchar)("exemption_type", { length: 20 }).notNull(), // Full | Partial
    exemptionValue: (0, pg_core_1.numeric)("exemption_value", { precision: 5, scale: 4 }).default("0"),
}, (t) => ({
    taxCodeFk: (0, pg_core_1.foreignKey)({ columns: [t.taxCodeId], foreignColumns: [exports.taxCodes.id] })
}));
exports.insertTaxExemptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.taxExemptions).extend({
    exemptionValue: zod_1.z.string().optional(),
});
//# sourceMappingURL=tax.js.map