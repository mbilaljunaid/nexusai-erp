import { z } from 'zod';

// ==========================================
// 1. MASTER AI ACTION SCHEMA (The Protocol)
// ==========================================

export const AIActionPriority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const AIActionType = z.enum(['CREATE', 'UPDATE', 'DELETE', 'QUERY', 'ANALYZE', 'OPTIMIZE']);

export const MasterAIActionSchema = z.object({
    actionId: z.string().uuid(),
    tenantId: z.string().uuid(),
    traceId: z.string().uuid(),
    timestamp: z.date(),
    userId: z.string().uuid().optional(), // Null if system-initiated

    intent: z.string(), // Original natural language intent e.g. "Create production order"
    confidence: z.number().min(0).max(1),

    domain: z.enum(['CRM', 'HR', 'FINANCE', 'MANUFACTURING', 'LOGISTICS', 'HEALTHCARE', 'RETAIL', 'CORE']),
    module: z.string(), // e.g., "production_planning"
    action: z.string(), // e.g., "create_production_order"

    priority: AIActionPriority,

    // The actual payload for the service method
    parameters: z.record(z.any()),

    // Deterministic checks
    requiresApproval: z.boolean().default(false),
    isReversible: z.boolean().default(true),

    // Audit trail
    reasoning: z.string(), // "Why I did this"
});

export type MasterAIAction = z.infer<typeof MasterAIActionSchema>;

// ==========================================
// 2. RESPONSE SCHEMA
// ==========================================

export const AIResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    error: z.string().optional(),
    undoToken: z.string().optional(), // For reversibility
    metrics: z.object({
        executionTimeMs: z.number(),
        tokensUsed: z.number().optional()
    })
});

export type AIResponse = z.infer<typeof AIResponseSchema>;
