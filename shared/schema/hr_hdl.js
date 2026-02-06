"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertHdlImportSchema = exports.hrHdlImports = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== HDL IMPORTS ==========
// Tracks bulk data loading jobs
exports.hrHdlImports = (0, pg_core_1.pgTable)("hr_hdl_imports", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    fileName: (0, pg_core_1.varchar)("file_name").notNull(),
    businessObject: (0, pg_core_1.varchar)("business_object").notNull(), // WORKER, DEPT, JOB
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // PENDING, PROCESSING, COMPLETED, FAILED
    totalLines: (0, pg_core_1.text)("total_lines"), // Storing as text to avoid int overflow if huge, though unlikely for "Lite"
    successLines: (0, pg_core_1.text)("success_lines").default("0"),
    failedLines: (0, pg_core_1.text)("failed_lines").default("0"),
    errorReport: (0, pg_core_1.jsonb)("error_report"), // Array of { line: 1, error: "..." }
    uploadedBy: (0, pg_core_1.varchar)("uploaded_by").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
});
exports.insertHdlImportSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrHdlImports);
//# sourceMappingURL=hr_hdl.js.map