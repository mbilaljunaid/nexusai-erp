
import { pgTable, text, serial, integer, jsonb, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Agent Actions Registry
// Defines what the AI can actually DO.
export const agentActions = pgTable("agent_actions", {
    code: text("code").primaryKey(), // e.g. "AR_CREATE_INVOICE"
    description: text("description").notNull(),
    requiredPermissions: jsonb("required_permissions").$type<string[]>(), // e.g. ["ar:write"]
    parametersSchema: jsonb("parameters_schema").notNull(), // JSON Schema or Zod definition for validation
    isEnabled: boolean("is_enabled").default(true),
});

// 2. Agent Executions
// Log of every intent/action attempt.
export const agentExecutions = pgTable("agent_executions", {
    id: serial("id").primaryKey(),
    intentText: text("intent_text").notNull(), // "Create invoice for Acme..."
    actionCode: text("action_code"), // Linked to agentActions.code
    parameters: jsonb("parameters"), // Extracted parameters
    status: text("status").notNull().default("PENDING"), // PENDING, SUCCESS, FAILED, ROLLED_BACK
    confidenceScore: decimal("confidence_score").default("0"),
    executedBy: text("executed_by").default("system"),
    createdAt: timestamp("created_at").defaultNow(),
    completedAt: timestamp("completed_at"),
    errorMessage: text("error_message"),
});

// 3. Audit Logs & Snapshots
// Detailed steps and rollback data.
export const agentAuditLogs = pgTable("agent_audit_logs", {
    id: serial("id").primaryKey(),
    executionId: integer("execution_id").references(() => agentExecutions.id),
    stepNumber: integer("step_number").notNull(),
    message: text("message").notNull(),
    actionType: text("action_type").notNull(), // EXECUTE, VALIDATE, ROLLBACK
    dataSnapshot: jsonb("data_snapshot"), // State BEFORE change (for rollback)
    createdAt: timestamp("created_at").defaultNow(),
});

// Zod Schemas
export const insertAgentActionSchema = createInsertSchema(agentActions);
export const selectAgentActionSchema = createSelectSchema(agentActions);
export type AgentAction = z.infer<typeof selectAgentActionSchema>;
export type InsertAgentAction = z.infer<typeof insertAgentActionSchema>;

export const insertAgentExecutionSchema = createInsertSchema(agentExecutions);
export const selectAgentExecutionSchema = createSelectSchema(agentExecutions);
export type AgentExecution = z.infer<typeof selectAgentExecutionSchema>;
export type InsertAgentExecution = z.infer<typeof insertAgentExecutionSchema>;

export const insertAgentAuditLogSchema = createInsertSchema(agentAuditLogs);
export type AgentAuditLog = typeof agentAuditLogs.$inferSelect;
export type InsertAgentAuditLog = z.infer<typeof insertAgentAuditLogSchema>;
