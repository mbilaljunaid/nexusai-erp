import { pgTable, varchar, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ========== AGENTIC AI CORE ==========

// 1. AI Actions Registry
// This table acts as a catalog of all deterministic actions the AI can perform.
// It maps a unique action name to its module and required permissions.
export const aiActions = pgTable("ai_actions", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    module: varchar("module").notNull(), // e.g., 'finance', 'crm', 'hr'
    actionName: varchar("action_name").notNull().unique(), // e.g., 'gl_create_journal', 'crm_score_lead'
    description: text("description"),
    requiredPermissions: jsonb("required_permissions").$type<string[]>(), // e.g., ['finance.write', 'journal.create']
    inputSchema: jsonb("input_schema"), // JSON Schema or Zod definition description for the input
    isEnabled: boolean("is_enabled").default(true),
    createdAt: timestamp("created_at").default(sql`now()`),
});

// 2. AI Audit Logs
// A strict, immutable log of every attempt the AI makes to execute an action.
// This is critical for rollback, auditing, and "no hallucination" enforcement.
export const aiAuditLogs = pgTable("ai_audit_logs", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id"), // The user who prompted the AI (if applicable)
    actionName: varchar("action_name").notNull(),
    inputPrompt: text("input_prompt"), // The natural language request
    structuredIntent: jsonb("structured_intent"), // The parsed JSON intent
    status: varchar("status").notNull(), // 'pending', 'success', 'failed', 'blocked_by_rbac'
    errorMessage: text("error_message"),
    executionTimeMs: integer("execution_time_ms"),
    timestamp: timestamp("timestamp").defaultNow()
});

// Zod Schemas
export const insertAiActionSchema = createInsertSchema(aiActions);
export const insertAiAuditLogSchema = createInsertSchema(aiAuditLogs);

export type AiAction = typeof aiActions.$inferSelect;
export type InsertAiAction = typeof aiActions.$inferInsert;

export type AiAuditLog = typeof aiAuditLogs.$inferSelect;
export type InsertAiAuditLog = typeof aiAuditLogs.$inferInsert;
