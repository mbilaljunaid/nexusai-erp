import { z } from 'zod';

// --- AI INTENT ---

export const AIIntentSchema = z.object({
    originalInput: z.string(), // "Create a budget..."
    confidence: z.number().min(0).max(1),
    intentType: z.string(), // "FINANCE.CREATE_BUDGET"
    entities: z.record(z.any()), // { amount: 50000, department: "Marketing" }
    reasoning: z.string().optional(), // "User explicitly stated..."
});

export type AIIntent = z.infer<typeof AIIntentSchema>;

// --- AI ACTION ---

export enum ActionStatus {
    PROPOSED = 'PROPOSED',
    VALIDATED = 'VALIDATED',
    APPROVED = 'APPROVED',
    EXECUTED = 'EXECUTED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

export const AIActionSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    userId: z.string().uuid(), // Who initiated it
    actionType: z.string(), // "FINANCE.CREATE_BUDGET"
    payload: z.record(z.any()), // The arguments for the handler
    status: z.nativeEnum(ActionStatus),
    confidenceScore: z.number(),
    requiresApproval: z.boolean(),
    reversible: z.boolean(),
    createdAt: z.string().datetime(),
    executedAt: z.string().datetime().optional(),
    error: z.string().optional(),
});

export type AIAction = z.infer<typeof AIActionSchema>;

// --- ACTION RESPONSE ---

export const ActionResponseSchema = z.object({
    actionId: z.string().uuid(),
    success: z.boolean(),
    data: z.any().optional(), // Result of the transaction
    message: z.string().optional(),
});

export type ActionResponse = z.infer<typeof ActionResponseSchema>;

// --- SYSTEM PROMPT TEMPLATE ---

export interface SystemPromptContext {
    userRole: string;
    availableActions: string[]; // List of registered action keys
    recentHistory: string[];
}
