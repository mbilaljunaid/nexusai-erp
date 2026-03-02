
import { pgTable, varchar, text, timestamp, numeric, integer, boolean, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== ENTERPRISE CONTRACTS (CLM) ==========
// Central repository for Procurement, Sales, Leases, and NDA contracts.

// 1. Contract Header
export const contracts = pgTable("contracts", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractNumber: varchar("contract_number").notNull().unique(), // Auto-generated or Manual
    title: varchar("title").notNull(),
    description: text("description"),

    // Classification
    contractType: varchar("contract_type").default("MSA"), // MSA, SOW, LEASE, NDA, PURCHASE, SALES
    status: varchar("status").default("DRAFT"), // DRAFT, IN_REVIEW, APPROVED, ACTIVE, ON_HOLD, EXPIRED, TERMINATED, CLOSED
    entBusinessUnitId: varchar("ent_business_unit_id"),

    // Parties
    vendorId: varchar("vendor_id"), // Link to scm_suppliers (optional if customer contract)
    customerId: varchar("customer_id"), // Link to crm_customers (optional if vendor contract)

    // Financials
    currency: varchar("currency").default("USD"),
    totalAmount: numeric("total_amount", { precision: 18, scale: 2 }),

    // Dates
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    renewalDate: timestamp("renewal_date"),
    signedDate: timestamp("signed_date"),

    // Metadata
    isRenewable: boolean("is_renewable").default(false),
    autoRenewal: boolean("auto_renewal").default(false),
    terminationNoticeDays: integer("termination_notice_days"),

    createdBy: varchar("created_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// 2. Contract Lines (Obligations / Items)
export const contractLines = pgTable("contract_lines", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: varchar("contract_id").notNull(), //.references(() => contracts.id),
    lineNumber: integer("line_number").notNull(),
    entBusinessUnitId: varchar("ent_business_unit_id"),

    itemDescription: varchar("item_description").notNull(),
    quantity: numeric("quantity", { precision: 15, scale: 2 }),
    unitPrice: numeric("unit_price", { precision: 18, scale: 2 }),
    lineAmount: numeric("line_amount", { precision: 18, scale: 2 }),

    obligationType: varchar("obligation_type").default("DELIVERABLE"), // DELIVERABLE, PAYMENT, MILESTONE
    dueDate: timestamp("due_date"),

    status: varchar("status").default("OPEN"), // OPEN, COMPLETED, CANCELLED

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 3. Contract Parties (Signatories / Stakeholders)
export const contractParties = pgTable("contract_parties", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: varchar("contract_id").notNull(),

    partyName: varchar("party_name").notNull(),
    role: varchar("role").default("SIGNER"), // SIGNER, REVIEWER, OBSERVER
    email: varchar("email"),

    hasSigned: boolean("has_signed").default(false),
    signedAt: timestamp("signed_at"),

    createdAt: timestamp("created_at").default(sql`now()`),
});

// 4. Contract Documents
export const contractDocuments = pgTable("contract_documents", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    contractId: varchar("contract_id").notNull(),

    documentName: varchar("document_name").notNull(),
    documentType: varchar("document_type").default("CONTRACT"), // CONTRACT, AMENDMENT, EXHIBIT
    url: varchar("url").notNull(), // S3 or Local Path

    uploadedBy: varchar("uploaded_by"),
    uploadedAt: timestamp("uploaded_at").default(sql`now()`),
});

// Zod Schemas
export const insertContractSchema = createInsertSchema(contracts).extend({
    contractNumber: z.string().min(1),
    title: z.string().min(1),
    startDate: z.string(), // Input as ISO string
    endDate: z.string().optional(),
});

export const insertContractLineSchema = createInsertSchema(contractLines);
export const insertContractPartySchema = createInsertSchema(contractParties);
export const insertContractDocumentSchema = createInsertSchema(contractDocuments);

export type Contract = typeof contracts.$inferSelect;
export type ContractLine = typeof contractLines.$inferSelect;
export type ContractParty = typeof contractParties.$inferSelect;
export type ContractDocument = typeof contractDocuments.$inferSelect;
