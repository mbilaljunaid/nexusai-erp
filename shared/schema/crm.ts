import { pgTable, varchar, timestamp, numeric, text, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== CRM MODULE ==========

// --- Leads ---
export const leads = pgTable("leads", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(), // Person name or Company name if ambiguous
    email: varchar("email"),
    phone: varchar("phone"),
    company: varchar("company"),
    title: varchar("title"),
    score: numeric("score", { precision: 5, scale: 2 }).default("0"),
    status: varchar("status").default("new"), // new, contacted, qualified, lost
    source: varchar("source"),
    createdAt: timestamp("created_at").default(sql`now()`),
    ownerId: varchar("owner_id"), // User ID of sales rep
});

export const insertLeadSchema = createInsertSchema(leads).extend({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional().nullable().or(z.literal("")),
});

// --- Accounts (Companies) ---
export const accounts = pgTable("accounts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    industry: varchar("industry"),
    website: varchar("website"),
    annualRevenue: numeric("annual_revenue"),
    status: varchar("status").default("active"), // active, churned
    createdAt: timestamp("created_at").default(sql`now()`),
    ownerId: varchar("owner_id"),
});

export const insertAccountSchema = createInsertSchema(accounts).extend({
    name: z.string().min(1, "Account name is required"),
});

// --- Contacts (People) ---
export const contacts = pgTable("contacts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    accountId: varchar("account_id"), // FK to accounts
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    email: varchar("email"),
    phone: varchar("phone"),
    title: varchar("title"),
    createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertContactSchema = createInsertSchema(contacts).extend({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email().optional().nullable().or(z.literal("")),
});

// --- Opportunities (Deals) ---
export const opportunities = pgTable("opportunities", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    accountId: varchar("account_id"), // FK to accounts (optional if deal is with individual)
    amount: numeric("amount").notNull(),
    stage: varchar("stage").notNull(), // qualification, proposal, negotiation, closed-won, closed-lost
    closeDate: timestamp("close_date"),
    probability: integer("probability"), // 0-100
    createdAt: timestamp("created_at").default(sql`now()`),
    ownerId: varchar("owner_id"),
});

export const insertOpportunitySchema = createInsertSchema(opportunities).extend({
    name: z.string().min(1, "Opportunity name is required"),
    amount: z.number().or(z.string().transform(v => Number(v))), // Allow string input for numeric fields
});

// --- Interactions (Activities) ---
export const interactions = pgTable("interactions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(), // lead, contact, account, opportunity
    entityId: varchar("entity_id").notNull(),
    type: varchar("type").notNull(), // call, email, meeting, note
    summary: text("summary").notNull(),
    description: text("description"),
    performedAt: timestamp("performed_at").default(sql`now()`),
    performedBy: varchar("performed_by"),
});

export const insertInteractionSchema = createInsertSchema(interactions).extend({
    summary: z.string().min(1, "Summary is required"),
    type: z.enum(["call", "email", "meeting", "note"]),
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;

export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;
