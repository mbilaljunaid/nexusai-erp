"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertHzPersonProfileSchema = exports.insertHzOrgProfileSchema = exports.insertHzPartySchema = exports.hzPersonProfiles = exports.hzOrganizationProfiles = exports.hzParties = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ==========================================
// 1. HZ_PARTIES (The Master Table)
// ==========================================
exports.hzParties = (0, pg_core_1.pgTable)("hz_parties", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    partyNumber: (0, pg_core_1.varchar)("party_number", { length: 30 }).notNull().unique(), // The immutable business key
    partyName: (0, pg_core_1.varchar)("party_name").notNull(), // Denormalized name
    partyType: (0, pg_core_1.varchar)("party_type", { length: 30 }).notNull(), // 'ORGANIZATION', 'PERSON', 'GROUP'
    status: (0, pg_core_1.varchar)("status", { length: 1 }).default("A"), // 'A' = Active, 'I' = Inactive, 'M' = Merged
    categoryCode: (0, pg_core_1.varchar)("category_code"), // Classification
    // Data Quality & Lineage
    origSystemReference: (0, pg_core_1.varchar)("orig_system_reference"), // ID from legacy/source system
    dunsNumber: (0, pg_core_1.varchar)("duns_number"), // Common look-ahead
    validationStatus: (0, pg_core_1.varchar)("validation_status").default("UNVALIDATED"),
    url: (0, pg_core_1.varchar)("url"),
    email: (0, pg_core_1.varchar)("email"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 2. HZ_ORGANIZATION_PROFILES
// ==========================================
exports.hzOrganizationProfiles = (0, pg_core_1.pgTable)("hz_organization_profiles", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    partyId: (0, pg_core_1.varchar)("party_id").references(() => exports.hzParties.id).notNull(),
    organizationName: (0, pg_core_1.varchar)("organization_name").notNull(),
    dunsNumber: (0, pg_core_1.varchar)("duns_number"),
    taxReference: (0, pg_core_1.varchar)("tax_reference"), // Tax ID / EIN / VAT
    // Business Details
    industryCode: (0, pg_core_1.varchar)("industry_code"),
    sicCode: (0, pg_core_1.varchar)("sic_code"),
    naicsCode: (0, pg_core_1.varchar)("naics_code"),
    corporationClass: (0, pg_core_1.varchar)("corporation_class"), // 'C_CORP', 'S_CORP', 'LLC'
    employeesTotal: (0, pg_core_1.integer)("employees_total"),
    currentRevenue: (0, pg_core_1.numeric)("current_revenue", { precision: 20, scale: 2 }),
    establishedYear: (0, pg_core_1.integer)("established_year"),
    // Effective Dating (Versioning)
    effectiveStartDate: (0, pg_core_1.date)("effective_start_date").defaultNow(),
    effectiveEndDate: (0, pg_core_1.date)("effective_end_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 3. HZ_PERSON_PROFILES
// ==========================================
exports.hzPersonProfiles = (0, pg_core_1.pgTable)("hz_person_profiles", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    partyId: (0, pg_core_1.varchar)("party_id").references(() => exports.hzParties.id).notNull(),
    personFirstName: (0, pg_core_1.varchar)("first_name"),
    personMiddleName: (0, pg_core_1.varchar)("middle_name"),
    personLastName: (0, pg_core_1.varchar)("last_name"),
    personTitle: (0, pg_core_1.varchar)("person_title"), // 'MR', 'MS', 'DR'
    gender: (0, pg_core_1.varchar)("gender", { length: 30 }),
    dateOfBirth: (0, pg_core_1.date)("date_of_birth"),
    placeOfBirth: (0, pg_core_1.varchar)("place_of_birth"),
    maritalStatus: (0, pg_core_1.varchar)("marital_status"),
    status: (0, pg_core_1.varchar)("status").default("A"),
    effectiveStartDate: (0, pg_core_1.date)("effective_start_date").defaultNow(),
    effectiveEndDate: (0, pg_core_1.date)("effective_end_date"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// Zod Schemas
// ==========================================
exports.insertHzPartySchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzParties).extend({
    partyNumber: zod_1.z.string().min(1),
    partyName: zod_1.z.string().min(1),
    partyType: zod_1.z.enum(["ORGANIZATION", "PERSON", "GROUP"]),
    email: zod_1.z.string().email().optional().nullable(),
});
exports.insertHzOrgProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzOrganizationProfiles).extend({
    partyId: zod_1.z.string().min(1),
    organizationName: zod_1.z.string().min(1),
});
exports.insertHzPersonProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzPersonProfiles).extend({
    partyId: zod_1.z.string().min(1),
    personFirstName: zod_1.z.string().optional(),
    personLastName: zod_1.z.string().optional(),
});
//# sourceMappingURL=parties.js.map