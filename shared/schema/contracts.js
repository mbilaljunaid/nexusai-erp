"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertContractDocumentSchema = exports.insertContractPartySchema = exports.insertContractLineSchema = exports.insertContractSchema = exports.contractDocuments = exports.contractParties = exports.contractLines = exports.contracts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== ENTERPRISE CONTRACTS (CLM) ==========
// Central repository for Procurement, Sales, Leases, and NDA contracts.
// 1. Contract Header
exports.contracts = (0, pg_core_1.pgTable)("contracts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractNumber: (0, pg_core_1.varchar)("contract_number").notNull().unique(), // Auto-generated or Manual
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    // Classification
    contractType: (0, pg_core_1.varchar)("contract_type").default("MSA"), // MSA, SOW, LEASE, NDA, PURCHASE, SALES
    status: (0, pg_core_1.varchar)("status").default("DRAFT"), // DRAFT, IN_REVIEW, APPROVED, ACTIVE, ON_HOLD, EXPIRED, TERMINATED, CLOSED
    // Parties
    vendorId: (0, pg_core_1.varchar)("vendor_id"), // Link to scm_suppliers (optional if customer contract)
    customerId: (0, pg_core_1.varchar)("customer_id"), // Link to crm_customers (optional if vendor contract)
    // Financials
    currency: (0, pg_core_1.varchar)("currency").default("USD"),
    totalAmount: (0, pg_core_1.numeric)("total_amount", { precision: 18, scale: 2 }),
    // Dates
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date"),
    renewalDate: (0, pg_core_1.timestamp)("renewal_date"),
    signedDate: (0, pg_core_1.timestamp)("signed_date"),
    // Metadata
    isRenewable: (0, pg_core_1.boolean)("is_renewable").default(false),
    autoRenewal: (0, pg_core_1.boolean)("auto_renewal").default(false),
    terminationNoticeDays: (0, pg_core_1.integer)("termination_notice_days"),
    createdBy: (0, pg_core_1.varchar)("created_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. Contract Lines (Obligations / Items)
exports.contractLines = (0, pg_core_1.pgTable)("contract_lines", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(), //.references(() => contracts.id),
    lineNumber: (0, pg_core_1.integer)("line_number").notNull(),
    itemDescription: (0, pg_core_1.varchar)("item_description").notNull(),
    quantity: (0, pg_core_1.numeric)("quantity", { precision: 15, scale: 2 }),
    unitPrice: (0, pg_core_1.numeric)("unit_price", { precision: 18, scale: 2 }),
    lineAmount: (0, pg_core_1.numeric)("line_amount", { precision: 18, scale: 2 }),
    obligationType: (0, pg_core_1.varchar)("obligation_type").default("DELIVERABLE"), // DELIVERABLE, PAYMENT, MILESTONE
    dueDate: (0, pg_core_1.timestamp)("due_date"),
    status: (0, pg_core_1.varchar)("status").default("OPEN"), // OPEN, COMPLETED, CANCELLED
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 3. Contract Parties (Signatories / Stakeholders)
exports.contractParties = (0, pg_core_1.pgTable)("contract_parties", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(),
    partyName: (0, pg_core_1.varchar)("party_name").notNull(),
    role: (0, pg_core_1.varchar)("role").default("SIGNER"), // SIGNER, REVIEWER, OBSERVER
    email: (0, pg_core_1.varchar)("email"),
    hasSigned: (0, pg_core_1.boolean)("has_signed").default(false),
    signedAt: (0, pg_core_1.timestamp)("signed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 4. Contract Documents
exports.contractDocuments = (0, pg_core_1.pgTable)("contract_documents", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    contractId: (0, pg_core_1.varchar)("contract_id").notNull(),
    documentName: (0, pg_core_1.varchar)("document_name").notNull(),
    documentType: (0, pg_core_1.varchar)("document_type").default("CONTRACT"), // CONTRACT, AMENDMENT, EXHIBIT
    url: (0, pg_core_1.varchar)("url").notNull(), // S3 or Local Path
    uploadedBy: (0, pg_core_1.varchar)("uploaded_by"),
    uploadedAt: (0, pg_core_1.timestamp)("uploaded_at").default((0, drizzle_orm_1.sql) `now()`),
});
// Zod Schemas
exports.insertContractSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contracts).extend({
    contractNumber: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    startDate: zod_1.z.string(), // Input as ISO string
    endDate: zod_1.z.string().optional(),
});
exports.insertContractLineSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contractLines);
exports.insertContractPartySchema = (0, drizzle_zod_1.createInsertSchema)(exports.contractParties);
exports.insertContractDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.contractDocuments);
//# sourceMappingURL=contracts.js.map