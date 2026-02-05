
import { pgTable, varchar, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==========================================
// AUDIT LOG
// ==========================================
export const mdmAuditLog = pgTable("mdm_audit_log", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(), // 'PARTY', 'ITEM', 'RELATIONSHIP'
    entityId: varchar("entity_id").notNull(),
    action: varchar("action").notNull(), // 'CREATE', 'UPDATE', 'DELETE'
    changedBy: varchar("changed_by").default("SYSTEM"),
    changes: jsonb("changes"), // { old: {}, new: {} }
    createdAt: timestamp("created_at").default(sql`now()`),
});

// ==========================================
// CHANGE REQUESTS
// ==========================================
export const mdmChangeRequests = pgTable("mdm_change_requests", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    entityType: varchar("entity_type").notNull(),
    entityId: varchar("entity_id"), // Can be null for NEW records
    requestType: varchar("request_type").notNull(), // 'CREATE_RECORD', 'UPDATE_RECORD'
    status: varchar("status").default("PENDING"), // 'PENDING', 'APPROVED', 'REJECTED'

    proposedChanges: jsonb("proposed_changes").notNull(),

    requesterId: varchar("requester_id").default("SYSTEM"),
    approverId: varchar("approver_id"),
    rejectionReason: text("rejection_reason"),

    createdAt: timestamp("created_at").default(sql`now()`),
    updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ==========================================
// Zod Schemas
// ==========================================
export const insertMdmAuditLogSchema = createInsertSchema(mdmAuditLog);
export const insertMdmChangeRequestSchema = createInsertSchema(mdmChangeRequests);

// Types
export type MdmAuditLog = typeof mdmAuditLog.$inferSelect;
export type InsertMdmAuditLog = typeof mdmAuditLog.$inferInsert;

export type MdmChangeRequest = typeof mdmChangeRequests.$inferSelect;
export type InsertMdmChangeRequest = typeof mdmChangeRequests.$inferInsert;
