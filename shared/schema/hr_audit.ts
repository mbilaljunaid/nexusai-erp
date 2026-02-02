import { pgTable, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// ========== AUDIT LOGS ==========
// Immutable record of key transactions
// We do not rely on Temporal/CDC for Phase 7, but application-layer logging for key business events.

export const hrAuditLogs = pgTable("hr_audit_logs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    entityType: varchar("entity_type").notNull(), // PERSON, WORK_RELATIONSHIP, ASSIGNMENT
    entityId: varchar("entity_id").notNull(),

    action: varchar("action").notNull(), // CREATED, UPDATED, TERMINATED, TRANSFERRED
    actorId: varchar("actor_id").notNull(), // Who did it?

    changes: jsonb("changes"), // { field: { old: val, new: val } }

    timestamp: timestamp("timestamp").default(sql`now()`),
});

export const hrAuditApprovals = pgTable("hr_audit_approvals", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id").notNull(),

    formId: varchar("form_id").notNull(), // e.g. "PERSONAL_DATA_CHANGE"
    recordId: varchar("record_id").notNull(), // e.g. personId

    requestedBy: varchar("requested_by").notNull(),
    requestedAt: timestamp("requested_at").default(sql`now()`),

    status: varchar("status").default("pending"), // pending, approved, rejected

    approvers: jsonb("approvers").notNull(), // [{ userId, approved, approvedAt, notes }]
    requiredApprovals: integer("required_approvals").default(1),
    currentApprovals: integer("current_approvals").default(0),

    rejectionReason: varchar("rejection_reason"),

    metadata: jsonb("metadata"), // Extra context
});

export const insertHrAuditLogSchema = createInsertSchema(hrAuditLogs);
export const insertHrAuditApprovalsSchema = createInsertSchema(hrAuditApprovals);

export type HrAuditLog = typeof hrAuditLogs.$inferSelect;
export type HrAuditApproval = typeof hrAuditApprovals.$inferSelect;
