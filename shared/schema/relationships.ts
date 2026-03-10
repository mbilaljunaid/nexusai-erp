
import { pgTable, varchar, text, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { hzParties } from "./parties";

// ==========================================
// 1. HZ_RELATIONSHIPS (Linking Parties)
// ==========================================
// E.g. "John Smith" (Person) is "Employee Of" "Google" (Org)
// E.g. "Google UK" (Org) is "Subsidiary Of" "Google Inc" (Org)
export const hzRelationships = pgTable("hz_relationships", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    subjectId: varchar("subject_id").references(() => hzParties.id).notNull(), // The 'From' Party
    objectId: varchar("object_id").references(() => hzParties.id).notNull(),   // The 'To' Party

    relationshipCode: varchar("relationship_code").notNull(), // 'EMPLOYEE_OF', 'PARENT_OF', 'CONTACT_OF'
    relationshipType: varchar("relationship_type").notNull(), // 'EMPLOYMENT', 'PARENTAL', 'CONTACT'

    startDate: date("start_date").defaultNow(),
    endDate: date("end_date"),

    status: varchar("status", { length: 1 }).default("A"),
    comments: text("comments"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// 2. HZ_ORG_CONTACTS (Implicit Relationship)
// ==========================================
// Simplified view for organizational contacts (Party Relationships of type CONTACT)
export const hzOrgContacts = pgTable("hz_org_contacts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

    partyRelationshipId: varchar("party_relationship_id").references(() => hzRelationships.id).notNull(),

    partySiteId: varchar("party_site_id"), // Optional: Contact at a specific site
    departmentCode: varchar("department_code"),
    department: varchar("department"),
    jobTitle: varchar("job_title"),
    jobTitleCode: varchar("job_title_code"),

    decisionMakerFlag: boolean("decision_maker_flag").default(false),

    createdAt: timestamp("created_at").default(sql`now()`),
});


// ==========================================
// Zod Schemas
// ==========================================

export const insertHzRelationshipSchema = createInsertSchema(hzRelationships).extend({
    subjectId: z.string().min(1),
    objectId: z.string().min(1),
    relationshipCode: z.string().min(1),
});

export const insertHzOrgContactSchema = createInsertSchema(hzOrgContacts).extend({
    partyRelationshipId: z.string().min(1),
});

// Types
export type HzRelationship = typeof hzRelationships.$inferSelect;
export type InsertHzRelationship = typeof hzRelationships.$inferInsert;

export type HzOrgContact = typeof hzOrgContacts.$inferSelect;
export type InsertHzOrgContact = typeof hzOrgContacts.$inferInsert;
