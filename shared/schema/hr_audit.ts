import { pgTable, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
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

export const insertHrAuditLogSchema = createInsertSchema(hrAuditLogs);
export type HrAuditLog = typeof hrAuditLogs.$inferSelect;
