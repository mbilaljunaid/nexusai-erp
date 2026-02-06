"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructionClaims = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const construction_1 = require("./construction");
exports.constructionClaims = (0, pg_core_1.pgTable)("construction_claims", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").references(() => construction_1.constructionContracts.id).notNull(),
    variationId: (0, pg_core_1.varchar)("variation_id").references(() => construction_1.constructionVariations.id), // Link to a cost variation if applicable
    claimNumber: (0, pg_core_1.varchar)("claim_number").notNull().unique(), // e.g. CLAIM-2026-001
    subject: (0, pg_core_1.varchar)("subject").notNull(),
    description: (0, pg_core_1.text)("description"),
    type: (0, pg_core_1.varchar)("type").default("CONTRACTUAL"), // CONTRACTUAL, EOT (Extension of Time), DISRUPTIVE
    status: (0, pg_core_1.varchar)("status").default("DRAFT").notNull(), // DRAFT, SUBMITTED, UNDER_REVIEW, SETTLED, REJECTED, DISPUTED
    amountClaimed: (0, pg_core_1.numeric)("amount_claimed", { precision: 18, scale: 2 }).default("0.00"),
    amountApproved: (0, pg_core_1.numeric)("amount_approved", { precision: 18, scale: 2 }).default("0.00"),
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default("USD"),
    submittedDate: (0, pg_core_1.timestamp)("submitted_date"),
    settledDate: (0, pg_core_1.timestamp)("settled_date"),
    evidenceUrls: (0, pg_core_1.text)("evidence_urls"), // Comma-separated or JSON array of links
    reportedBy: (0, pg_core_1.varchar)("reported_by"), // Reference to user/resource
    internalNotes: (0, pg_core_1.text)("internal_notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
//# sourceMappingURL=construction_claims.js.map