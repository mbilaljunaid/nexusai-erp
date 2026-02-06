"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertHrAuditApprovalsSchema = exports.insertHrAuditLogSchema = exports.hrAuditApprovals = exports.hrAuditLogs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== AUDIT LOGS ==========
// Immutable record of key transactions
// We do not rely on Temporal/CDC for Phase 7, but application-layer logging for key business events.
exports.hrAuditLogs = (0, pg_core_1.pgTable)("hr_audit_logs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    entityType: (0, pg_core_1.varchar)("entity_type").notNull(), // PERSON, WORK_RELATIONSHIP, ASSIGNMENT
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    action: (0, pg_core_1.varchar)("action").notNull(), // CREATED, UPDATED, TERMINATED, TRANSFERRED
    actorId: (0, pg_core_1.varchar)("actor_id").notNull(), // Who did it?
    changes: (0, pg_core_1.jsonb)("changes"), // { field: { old: val, new: val } }
    timestamp: (0, pg_core_1.timestamp)("timestamp").default((0, drizzle_orm_1.sql) `now()`),
});
exports.hrAuditApprovals = (0, pg_core_1.pgTable)("hr_audit_approvals", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    tenantId: (0, pg_core_1.varchar)("tenant_id").notNull(),
    formId: (0, pg_core_1.varchar)("form_id").notNull(), // e.g. "PERSONAL_DATA_CHANGE"
    recordId: (0, pg_core_1.varchar)("record_id").notNull(), // e.g. personId
    requestedBy: (0, pg_core_1.varchar)("requested_by").notNull(),
    requestedAt: (0, pg_core_1.timestamp)("requested_at").default((0, drizzle_orm_1.sql) `now()`),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, approved, rejected
    approvers: (0, pg_core_1.jsonb)("approvers").notNull(), // [{ userId, approved, approvedAt, notes }]
    requiredApprovals: (0, pg_core_1.integer)("required_approvals").default(1),
    currentApprovals: (0, pg_core_1.integer)("current_approvals").default(0),
    rejectionReason: (0, pg_core_1.varchar)("rejection_reason"),
    // Escalation & Multi-step support
    stepOrder: (0, pg_core_1.integer)("step_order").default(1),
    escalationRuleId: (0, pg_core_1.varchar)("escalation_rule_id"),
    statusHistory: (0, pg_core_1.jsonb)("status_history"), // Log of status changes
    metadata: (0, pg_core_1.jsonb)("metadata"), // Extra context
});
exports.insertHrAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrAuditLogs);
exports.insertHrAuditApprovalsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.hrAuditApprovals);
//# sourceMappingURL=hr_audit.js.map