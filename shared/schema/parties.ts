
import { pgTable, varchar, text, timestamp, boolean, integer, numeric, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// 1. HZ_PARTIES (The Master Table)
// ==========================================
export const hzParties = pgTable("hz_parties", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    partyNumber: varchar("party_number", { length: 30 }).notNull().unique(), // The immutable business key
    partyName: varchar("party_name").notNull(), // Denormalized name
    partyType: varchar("party_type", { length: 30 }).notNull(), // 'ORGANIZATION', 'PERSON', 'GROUP'

    status: varchar("status", { length: 1 }).default("A"), // 'A' = Active, 'I' = Inactive, 'M' = Merged
    categoryCode: varchar("category_code"), // Classification

    // Data Quality & Lineage
    origSystemReference: varchar("orig_system_reference"), // ID from legacy/source system
    dunsNumber: varchar("duns_number"), // Common look-ahead
    validationStatus: varchar("validation_status").default("UNVALIDATED"),

    url: varchar("url"),
    email: varchar("email"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 2. HZ_ORGANIZATION_PROFILES
// ==========================================
export const hzOrganizationProfiles = pgTable("hz_organization_profiles", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    partyId: varchar("party_id").references(() => hzParties.id).notNull(),

    organizationName: varchar("organization_name").notNull(),
    dunsNumber: varchar("duns_number"),
    taxReference: varchar("tax_reference"), // Tax ID / EIN / VAT

    // Business Details
    industryCode: varchar("industry_code"),
    sicCode: varchar("sic_code"),
    naicsCode: varchar("naics_code"),

    corporationClass: varchar("corporation_class"), // 'C_CORP', 'S_CORP', 'LLC'
    employeesTotal: integer("employees_total"),
    currentRevenue: numeric("current_revenue", { precision: 20, scale: 2 }),
    establishedYear: integer("established_year"),

    // Effective Dating (Versioning)
    effectiveStartDate: date("effective_start_date").defaultNow(),
    effectiveEndDate: date("effective_end_date"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 3. HZ_PERSON_PROFILES
// ==========================================
export const hzPersonProfiles = pgTable("hz_person_profiles", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    partyId: varchar("party_id").references(() => hzParties.id).notNull(),

    personFirstName: varchar("first_name"),
    personMiddleName: varchar("middle_name"),
    personLastName: varchar("last_name"),
    personTitle: varchar("person_title"), // 'MR', 'MS', 'DR'

    gender: varchar("gender", { length: 30 }),
    dateOfBirth: date("date_of_birth"),
    placeOfBirth: varchar("place_of_birth"),

    maritalStatus: varchar("marital_status"),
    status: varchar("status").default("A"),

    effectiveStartDate: date("effective_start_date").defaultNow(),
    effectiveEndDate: date("effective_end_date"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});


// ==========================================
// Zod Schemas
// ==========================================

export const insertHzPartySchema = createInsertSchema(hzParties).extend({
    partyNumber: z.string().min(1),
    partyName: z.string().min(1),
    partyType: z.enum(["ORGANIZATION", "PERSON", "GROUP"]),
    email: z.string().email().optional().nullable(),
});

export const insertHzOrgProfileSchema = createInsertSchema(hzOrganizationProfiles).extend({
    partyId: z.string().min(1),
    organizationName: z.string().min(1),
});

export const insertHzPersonProfileSchema = createInsertSchema(hzPersonProfiles).extend({
    partyId: z.string().min(1),
    personFirstName: z.string().optional(),
    personLastName: z.string().optional(),
});


// Types
export type HzParty = typeof hzParties.$inferSelect;
export type InsertHzParty = typeof hzParties.$inferInsert;

export type HzOrganizationProfile = typeof hzOrganizationProfiles.$inferSelect;
export type InsertHzOrganizationProfile = typeof hzOrganizationProfiles.$inferInsert;

export type HzPersonProfile = typeof hzPersonProfiles.$inferSelect;
export type InsertHzPersonProfile = typeof hzPersonProfiles.$inferInsert;
