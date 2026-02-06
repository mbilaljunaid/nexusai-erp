"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAgentAuditLogSchema = exports.selectAgentExecutionSchema = exports.insertAgentExecutionSchema = exports.selectAgentActionSchema = exports.insertAgentActionSchema = exports.agentAuditLogs = exports.agentExecutions = exports.agentActions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// 1. Agent Actions Registry
// Defines what the AI can actually DO.
exports.agentActions = (0, pg_core_1.pgTable)("agent_actions", {
    code: (0, pg_core_1.text)("code").primaryKey(), // e.g. "AR_CREATE_INVOICE"
    description: (0, pg_core_1.text)("description").notNull(),
    requiredPermissions: (0, pg_core_1.jsonb)("required_permissions").$type(), // e.g. ["ar:write"]
    parametersSchema: (0, pg_core_1.jsonb)("parameters_schema").notNull(), // JSON Schema or Zod definition for validation
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(true),
});
// 2. Agent Executions
// Log of every intent/action attempt.
exports.agentExecutions = (0, pg_core_1.pgTable)("agent_executions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    intentText: (0, pg_core_1.text)("intent_text").notNull(), // "Create invoice for Acme..."
    actionCode: (0, pg_core_1.text)("action_code"), // Linked to agentActions.code
    parameters: (0, pg_core_1.jsonb)("parameters"), // Extracted parameters
    status: (0, pg_core_1.text)("status").notNull().default("PENDING"), // PENDING, SUCCESS, FAILED, ROLLED_BACK
    confidenceScore: (0, pg_core_1.decimal)("confidence_score").default("0"),
    executedBy: (0, pg_core_1.text)("executed_by").default("system"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    errorMessage: (0, pg_core_1.text)("error_message"),
});
// 3. Audit Logs & Snapshots
// Detailed steps and rollback data.
exports.agentAuditLogs = (0, pg_core_1.pgTable)("agent_audit_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    executionId: (0, pg_core_1.integer)("execution_id").references(() => exports.agentExecutions.id),
    stepNumber: (0, pg_core_1.integer)("step_number").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    actionType: (0, pg_core_1.text)("action_type").notNull(), // EXECUTE, VALIDATE, ROLLBACK
    dataSnapshot: (0, pg_core_1.jsonb)("data_snapshot"), // State BEFORE change (for rollback)
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Zod Schemas
exports.insertAgentActionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentActions);
exports.selectAgentActionSchema = (0, drizzle_zod_1.createSelectSchema)(exports.agentActions);
exports.insertAgentExecutionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentExecutions);
exports.selectAgentExecutionSchema = (0, drizzle_zod_1.createSelectSchema)(exports.agentExecutions);
exports.insertAgentAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentAuditLogs);
//# sourceMappingURL=agentic.js.map