import { pgTable, varchar, timestamp, date, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { hrPersons } from "./hr_worker";

// ========== DOCUMENT RECORDS (DOR) ==========
// System of Record for Worker Documents (Passports, Visas, Contracts)

export const hrDocuments = pgTable("hr_documents", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    personId: varchar("person_id").notNull().references(() => hrPersons.id),

    // Attributes
    documentType: varchar("document_type").notNull(), // PASSPORT, VISA, CONTRACT, CERTIFICATION
    documentName: varchar("document_name").notNull(), // e.g. "US Passport"
    documentNumber: varchar("document_number"),       // e.g. "A12345678"

    issuingAuthority: varchar("issuing_authority"),   // e.g. "US Dept of State"
    issueDate: date("issue_date"),
    dateTo: date("date_to"),                          // Expiry Date (Crucial for alerts)

    // File Storage (Mock / URL)
    attachmentUrl: varchar("attachment_url"),         // Path to blob storage or base64 (for prototype)

    // Verification
    verificationStatus: varchar("verification_status").default("PENDING"), // PENDING, VERIFIED, REJECTED
    verifiedBy: varchar("verified_by"),
    verifiedAt: timestamp("verified_at"),

    // Audit
    createdBy: varchar("created_by"),
    updatedBy: varchar("updated_by"),
    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertDocumentSchema = createInsertSchema(hrDocuments);
export type HrDocument = typeof hrDocuments.$inferSelect;
