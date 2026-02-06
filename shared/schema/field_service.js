"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFieldServiceJobSchema = exports.fieldServiceJobs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// ========== FIELD SERVICE ==========
exports.fieldServiceJobs = (0, pg_core_1.pgTable)("field_service_jobs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    jobNumber: (0, pg_core_1.varchar)("job_number").notNull(),
    customerId: (0, pg_core_1.varchar)("customer_id"),
    technicianId: (0, pg_core_1.varchar)("technician_id"),
    jobType: (0, pg_core_1.varchar)("job_type"), // installation, repair, maintenance
    status: (0, pg_core_1.varchar)("status").default("scheduled"), // scheduled, in_progress, completed, cancelled
    priority: (0, pg_core_1.varchar)("priority").default("medium"),
    scheduledDate: (0, pg_core_1.timestamp)("scheduled_date"),
    completedDate: (0, pg_core_1.timestamp)("completed_date"),
    location: (0, pg_core_1.jsonb)("location"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertFieldServiceJobSchema = (0, drizzle_zod_1.createInsertSchema)(exports.fieldServiceJobs).extend({
    jobNumber: zod_1.z.string().min(1),
    customerId: zod_1.z.string().optional().nullable(),
    technicianId: zod_1.z.string().optional().nullable(),
    jobType: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    scheduledDate: zod_1.z.date().optional().nullable(),
    completedDate: zod_1.z.date().optional().nullable(),
    location: zod_1.z.record(zod_1.z.any()).optional(),
    notes: zod_1.z.string().optional(),
});
//# sourceMappingURL=field_service.js.map