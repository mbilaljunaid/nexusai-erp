
import { pgTable, varchar, text, timestamp, boolean, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { hzParties } from "./parties";

// ==========================================
// 1. HZ_LOCATIONS (The Physical Address Registry)
// ==========================================
export const hzLocations = pgTable("hz_locations", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    address1: varchar("address1").notNull(),
    address2: varchar("address2"),
    address3: varchar("address3"),
    address4: varchar("address4"),

    city: varchar("city").notNull(),
    state: varchar("state"), // State can be free text or code
    province: varchar("province"),
    county: varchar("county"),
    postalCode: varchar("postal_code"),

    country: varchar("country", { length: 2 }).notNull(), // ISO 3166-1 alpha-2

    // Validation
    validationStatus: varchar("validation_status").default("UNVALIDATED"),
    validatedDate: timestamp("validated_date"),

    // Geospatial
    latitude: numeric("latitude", { precision: 10, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),
    timezone: varchar("timezone"),

    // Full formatted string
    formattedAddress: text("formatted_address"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 2. HZ_PARTY_SITES (Linking Party -> Location)
// ==========================================
// A Party Site is a Party in a Location. (e.g., "Google" in "Mountain View")
export const hzPartySites = pgTable("hz_party_sites", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    partyId: varchar("party_id").references(() => hzParties.id).notNull(),
    locationId: varchar("location_id").references(() => hzLocations.id).notNull(),

    partySiteName: varchar("party_site_name"), // e.g. "Headquarters", "Warehouse A"
    partySiteNumber: varchar("party_site_number").unique(), // User-facing ID

    identifyingAddressFlag: boolean("identifying_address_flag").default(false), // Is this the primary address?
    status: varchar("status", { length: 1 }).default("A"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 3. HZ_PARTY_SITE_USES (Business Purpose)
// ==========================================
// What is this site used for? (Bill To, Ship To, Statement To)
export const hzPartySiteUses = pgTable("hz_party_site_uses", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    partySiteId: varchar("party_site_id").references(() => hzPartySites.id).notNull(),

    siteUseType: varchar("site_use_type").notNull(), // 'BILL_TO', 'SHIP_TO', 'LEGAL', 'MARKETING'
    siteUseCode: varchar("site_use_code").default("PRIMARY"), // PRIMARY, SECONDARY

    status: varchar("status", { length: 1 }).default("A"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// Zod Schemas
// ==========================================

export const insertHzLocationSchema = createInsertSchema(hzLocations).extend({
    address1: z.string().min(1),
    city: z.string().min(1),
    country: z.string().length(2),
});

export const insertHzPartySiteSchema = createInsertSchema(hzPartySites).extend({
    partyId: z.string().min(1),
    locationId: z.string().min(1),
});

export const insertHzPartySiteUseSchema = createInsertSchema(hzPartySiteUses).extend({
    partySiteId: z.string().min(1),
    siteUseType: z.enum(["BILL_TO", "SHIP_TO", "LEGAL", "MARKETING", "PAY_TO", "OTHER"]),
});


// Types
export type HzLocation = typeof hzLocations.$inferSelect;
export type InsertHzLocation = typeof hzLocations.$inferInsert;

export type HzPartySite = typeof hzPartySites.$inferSelect;
export type InsertHzPartySite = typeof hzPartySites.$inferInsert;

export type HzPartySiteUse = typeof hzPartySiteUses.$inferSelect;
export type InsertHzPartySiteUse = typeof hzPartySiteUses.$inferInsert;
