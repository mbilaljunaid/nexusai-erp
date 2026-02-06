"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertHzOrgContactSchema = exports.insertHzRelationshipSchema = exports.hzOrgContacts = exports.hzRelationships = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const parties_1 = require("./parties");
// ==========================================
// 1. HZ_RELATIONSHIPS (Linking Parties)
// ==========================================
// E.g. "John Smith" (Person) is "Employee Of" "Google" (Org)
// E.g. "Google UK" (Org) is "Subsidiary Of" "Google Inc" (Org)
exports.hzRelationships = (0, pg_core_1.pgTable)("hz_relationships", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    subjectId: (0, pg_core_1.varchar)("subject_id").references(() => parties_1.hzParties.id).notNull(), // The 'From' Party
    objectId: (0, pg_core_1.varchar)("object_id").references(() => parties_1.hzParties.id).notNull(), // The 'To' Party
    relationshipCode: (0, pg_core_1.varchar)("relationship_code").notNull(), // 'EMPLOYEE_OF', 'PARENT_OF', 'CONTACT_OF'
    relationshipType: (0, pg_core_1.varchar)("relationship_type").notNull(), // 'EMPLOYMENT', 'PARENTAL', 'CONTACT'
    startDate: (0, pg_core_1.date)("start_date").defaultNow(),
    endDate: (0, pg_core_1.date)("end_date"),
    status: (0, pg_core_1.varchar)("status", { length: 1 }).default("A"),
    comments: (0, pg_core_1.text)("comments"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// 2. HZ_ORG_CONTACTS (Implicit Relationship)
// ==========================================
// Simplified view for organizational contacts (Party Relationships of type CONTACT)
exports.hzOrgContacts = (0, pg_core_1.pgTable)("hz_org_contacts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    partyRelationshipId: (0, pg_core_1.varchar)("party_relationship_id").references(() => exports.hzRelationships.id).notNull(),
    partySiteId: (0, pg_core_1.varchar)("party_site_id"), // Optional: Contact at a specific site
    departmentCode: (0, pg_core_1.varchar)("department_code"),
    department: (0, pg_core_1.varchar)("department"),
    jobTitle: (0, pg_core_1.varchar)("job_title"),
    jobTitleCode: (0, pg_core_1.varchar)("job_title_code"),
    decisionMakerFlag: (0, pg_core_1.boolean)("decision_maker_flag").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// Zod Schemas
// ==========================================
exports.insertHzRelationshipSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzRelationships).extend({
    subjectId: zod_1.z.string().min(1),
    objectId: zod_1.z.string().min(1),
    relationshipCode: zod_1.z.string().min(1),
});
exports.insertHzOrgContactSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hzOrgContacts).extend({
    partyRelationshipId: zod_1.z.string().min(1),
});
//# sourceMappingURL=relationships.js.map