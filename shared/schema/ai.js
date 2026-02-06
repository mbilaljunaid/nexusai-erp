"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAiCreditsSchema = exports.aiCredits = exports.insertAiAuditLogSchema = exports.insertAiActionSchema = exports.aiAuditLogs = exports.aiActions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// ========== AGENTIC AI CORE ==========
// 1. AI Actions Registry
// This table acts as a catalog of all deterministic actions the AI can perform.
// It maps a unique action name to its module and required permissions.
exports.aiActions = (0, pg_core_1.pgTable)("ai_actions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    module: (0, pg_core_1.varchar)("module").notNull(), // e.g., 'finance', 'crm', 'hr'
    actionName: (0, pg_core_1.varchar)("action_name").notNull().unique(), // e.g., 'gl_create_journal', 'crm_score_lead'
    description: (0, pg_core_1.text)("description"),
    requiredPermissions: (0, pg_core_1.jsonb)("required_permissions").$type(), // e.g., ['finance.write', 'journal.create']
    inputSchema: (0, pg_core_1.jsonb)("input_schema"), // JSON Schema or Zod definition description for the input
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").default((0, drizzle_orm_1.sql) `now()`),
});
// 2. AI Audit Logs
// A strict, immutable log of every attempt the AI makes to execute an action.
// This is critical for rollback, auditing, and "no hallucination" enforcement.
exports.aiAuditLogs = (0, pg_core_1.pgTable)("ai_audit_logs", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    userId: (0, pg_core_1.varchar)("user_id"), // The user who prompted the AI (if applicable)
    actionName: (0, pg_core_1.varchar)("action_name").notNull(),
    inputPrompt: (0, pg_core_1.text)("input_prompt"), // The natural language request
    structuredIntent: (0, pg_core_1.jsonb)("structured_intent"), // The parsed JSON intent
    status: (0, pg_core_1.varchar)("status").notNull(), // 'pending', 'success', 'failed', 'blocked_by_rbac'
    errorMessage: (0, pg_core_1.text)("error_message"),
    executionTimeMs: (0, pg_core_1.integer)("execution_time_ms"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow()
});
// Zod Schemas
exports.insertAiActionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiActions);
exports.insertAiAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiAuditLogs);
exports.aiCredits = (0, pg_core_1.pgTable)("ai_credits", {
    userId: (0, pg_core_1.varchar)("user_id").primaryKey(),
    balance: (0, pg_core_1.integer)("balance").notNull().default(0),
    totalMined: (0, pg_core_1.integer)("total_mined").default(0),
    lastDailyBonus: (0, pg_core_1.timestamp)("last_daily_bonus"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").default((0, drizzle_orm_1.sql) `now()`),
});
exports.insertAiCreditsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiCredits);
//# sourceMappingURL=ai.js.map