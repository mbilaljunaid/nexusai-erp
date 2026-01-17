import { pgTable, uuid, varchar, text, numeric, timestamp, varchar as status } from "drizzle-orm/pg-core";
import { constructionContracts, constructionVariations } from "./construction";

export const constructionClaims = pgTable("construction_claims", {
    id: uuid("id").primaryKey().defaultRandom(),
    contractId: uuid("contract_id").references(() => constructionContracts.id).notNull(),
    variationId: uuid("variation_id").references(() => constructionVariations.id), // Link to a cost variation if applicable
    claimNumber: varchar("claim_number").notNull().unique(), // e.g. CLAIM-2026-001
    subject: varchar("subject").notNull(),
    description: text("description"),
    type: varchar("type").default("CONTRACTUAL"), // CONTRACTUAL, EOT (Extension of Time), DISRUPTIVE
    status: varchar("status").default("DRAFT").notNull(), // DRAFT, SUBMITTED, UNDER_REVIEW, SETTLED, REJECTED, DISPUTED
    amountClaimed: numeric("amount_claimed", { precision: 18, scale: 2 }).default("0.00"),
    amountApproved: numeric("amount_approved", { precision: 18, scale: 2 }).default("0.00"),
    currency: varchar("currency", { length: 3 }).default("USD"),
    submittedDate: timestamp("submitted_date"),
    settledDate: timestamp("settled_date"),
    evidenceUrls: text("evidence_urls"), // Comma-separated or JSON array of links
    reportedBy: uuid("reported_by"), // Reference to user/resource
    internalNotes: text("internal_notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ConstructionClaim = typeof constructionClaims.$inferSelect;
export type InsertConstructionClaim = typeof constructionClaims.$inferInsert;
