"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDocumentSchema = exports.hrDocuments = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const hr_worker_1 = require("./hr_worker");
// ========== DOCUMENT RECORDS (DOR) ==========
// System of Record for Worker Documents (Passports, Visas, Contracts)
exports.hrDocuments = (0, pg_core_1.pgTable)("hr_documents", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    personId: (0, pg_core_1.varchar)("person_id").notNull().references(() => hr_worker_1.hrPersons.id),
    // Attributes
    documentType: (0, pg_core_1.varchar)("document_type").notNull(), // PASSPORT, VISA, CONTRACT, CERTIFICATION
    documentName: (0, pg_core_1.varchar)("document_name").notNull(), // e.g. "US Passport"
    documentNumber: (0, pg_core_1.varchar)("document_number"), // e.g. "A12345678"
    issuingAuthority: (0, pg_core_1.varchar)("issuing_authority"), // e.g. "US Dept of State"
    issueDate: (0, pg_core_1.date)("issue_date"),
    dateTo: (0, pg_core_1.date)("date_to"), // Expiry Date (Crucial for alerts)
    // File Storage (Mock / URL)
    attachmentUrl: (0, pg_core_1.varchar)("attachment_url"), // Path to blob storage or base64 (for prototype)
    // Verification
    verificationStatus: (0, pg_core_1.varchar)("verification_status").default("PENDING"), // PENDING, VERIFIED, REJECTED
    verifiedBy: (0, pg_core_1.varchar)("verified_by"),
    verifiedAt: (0, pg_core_1.timestamp)("verified_at"),
    // Audit
    createdBy: (0, pg_core_1.varchar)("created_by"),
    updatedBy: (0, pg_core_1.varchar)("updated_by"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertDocumentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrDocuments);
//# sourceMappingURL=hr_documents.js.map