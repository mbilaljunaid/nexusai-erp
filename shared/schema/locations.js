"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertHzPartySiteUseSchema = exports.insertHzPartySiteSchema = exports.insertHzLocationSchema = exports.hzPartySiteUses = exports.hzPartySites = exports.hzLocations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const parties_1 = require("./parties");
// ==========================================
// 1. HZ_LOCATIONS (The Physical Address Registry)
// ==========================================
exports.hzLocations = (0, pg_core_1.pgTable)("hz_locations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    address1: (0, pg_core_1.varchar)("address1").notNull(),
    address2: (0, pg_core_1.varchar)("address2"),
    address3: (0, pg_core_1.varchar)("address3"),
    address4: (0, pg_core_1.varchar)("address4"),
    city: (0, pg_core_1.varchar)("city").notNull(),
    state: (0, pg_core_1.varchar)("state"), // State can be free text or code
    province: (0, pg_core_1.varchar)("province"),
    county: (0, pg_core_1.varchar)("county"),
    postalCode: (0, pg_core_1.varchar)("postal_code"),
    country: (0, pg_core_1.varchar)("country", { length: 2 }).notNull(), // ISO 3166-1 alpha-2
    // Validation
    validationStatus: (0, pg_core_1.varchar)("validation_status").default("UNVALIDATED"),
    validatedDate: (0, pg_core_1.timestamp)("validated_date"),
    // Geospatial
    latitude: (0, pg_core_1.numeric)("latitude", { precision: 10, scale: 6 }),
    longitude: (0, pg_core_1.numeric)("longitude", { precision: 10, scale: 6 }),
    timezone: (0, pg_core_1.varchar)("timezone"),
    // Full formatted string
    formattedAddress: (0, pg_core_1.text)("formatted_address"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 2. HZ_PARTY_SITES (Linking Party -> Location)
// ==========================================
// A Party Site is a Party in a Location. (e.g., "Google" in "Mountain View")
exports.hzPartySites = (0, pg_core_1.pgTable)("hz_party_sites", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    partyId: (0, pg_core_1.varchar)("party_id").references(() => parties_1.hzParties.id).notNull(),
    locationId: (0, pg_core_1.varchar)("location_id").references(() => exports.hzLocations.id).notNull(),
    partySiteName: (0, pg_core_1.varchar)("party_site_name"), // e.g. "Headquarters", "Warehouse A"
    partySiteNumber: (0, pg_core_1.varchar)("party_site_number").unique(), // User-facing ID
    identifyingAddressFlag: (0, pg_core_1.boolean)("identifying_address_flag").default(false), // Is this the primary address?
    status: (0, pg_core_1.varchar)("status", { length: 1 }).default("A"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 3. HZ_PARTY_SITE_USES (Business Purpose)
// ==========================================
// What is this site used for? (Bill To, Ship To, Statement To)
exports.hzPartySiteUses = (0, pg_core_1.pgTable)("hz_party_site_uses", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    partySiteId: (0, pg_core_1.varchar)("party_site_id").references(() => exports.hzPartySites.id).notNull(),
    siteUseType: (0, pg_core_1.varchar)("site_use_type").notNull(), // 'BILL_TO', 'SHIP_TO', 'LEGAL', 'MARKETING'
    siteUseCode: (0, pg_core_1.varchar)("site_use_code").default("PRIMARY"), // PRIMARY, SECONDARY
    status: (0, pg_core_1.varchar)("status", { length: 1 }).default("A"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// Zod Schemas
// ==========================================
exports.insertHzLocationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzLocations).extend({
    address1: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    country: zod_1.z.string().length(2),
});
exports.insertHzPartySiteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzPartySites).extend({
    partyId: zod_1.z.string().min(1),
    locationId: zod_1.z.string().min(1),
});
exports.insertHzPartySiteUseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzPartySiteUses).extend({
    partySiteId: zod_1.z.string().min(1),
    siteUseType: zod_1.z.enum(["BILL_TO", "SHIP_TO", "LEGAL", "MARKETING", "PAY_TO", "OTHER"]),
});
//# sourceMappingURL=locations.js.map