import { pgTable, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ========== HDL IMPORTS ==========
// Tracks bulk data loading jobs

export const hrHdlImports = pgTable("hr_hdl_imports", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    fileName: varchar("file_name").notNull(),
    businessObject: varchar("business_object").notNull(), // WORKER, DEPT, JOB
    status: varchar("status").default("PENDING"), // PENDING, PROCESSING, COMPLETED, FAILED

    totalLines: text("total_lines"), // Storing as text to avoid int overflow if huge, though unlikely for "Lite"
    successLines: text("success_lines").default("0"),
    failedLines: text("failed_lines").default("0"),

    errorReport: jsonb("error_report"), // Array of { line: 1, error: "..." }

    uploadedBy: varchar("uploaded_by").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
    completedAt: timestamp("completed_at"),
});

export const insertHdlImportSchema = createInsertSchema(hrHdlImports);
export type HrHdlImport = typeof hrHdlImports.$inferSelect;
