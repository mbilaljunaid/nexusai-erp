"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMdmChangeRequestSchema = exports.insertMdmAuditLogSchema = exports.mdmChangeRequests = exports.mdmAuditLog = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ==========================================
// AUDIT LOG
// ==========================================
exports.mdmAuditLog = (0, pg_core_1.pgTable)("mdm_audit_log", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(), // 'PARTY', 'ITEM', 'RELATIONSHIP'
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    action: (0, pg_core_1.varchar)("action").notNull(), // 'CREATE', 'UPDATE', 'DELETE'
    changedBy: (0, pg_core_1.varchar)("changed_by").default("SYSTEM"),
    changes: (0, pg_core_1.jsonb)("changes"), // { old: {}, new: {} }
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// CHANGE REQUESTS
// ==========================================
exports.mdmChangeRequests = (0, pg_core_1.pgTable)("mdm_change_requests", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(),
    entityId: (0, pg_core_1.varchar)("entity_id"), // Can be null for NEW records
    requestType: (0, pg_core_1.varchar)("request_type").notNull(), // 'CREATE_RECORD', 'UPDATE_RECORD'
    status: (0, pg_core_1.varchar)("status").default("PENDING"), // 'PENDING', 'APPROVED', 'REJECTED'
    proposedChanges: (0, pg_core_1.jsonb)("proposed_changes").notNull(),
    requesterId: (0, pg_core_1.varchar)("requester_id").default("SYSTEM"),
    approverId: (0, pg_core_1.varchar)("approver_id"),
    rejectionReason: (0, pg_core_1.text)("rejection_reason"),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
// ==========================================
// Zod Schemas
// ==========================================
exports.insertMdmAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mdmAuditLog);
exports.insertMdmChangeRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mdmChangeRequests);
//# sourceMappingURL=governance.js.map