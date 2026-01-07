import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export enum ProjectStatus {
    BIDDING = 'BIDDING',
    AWARDED = 'AWARDED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    WARRANTY = 'WARRANTY',
}

export const ProjectSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    name: z.string(),
    status: z.nativeEnum(ProjectStatus),
    startDate: z.string().datetime(),
    estimatedEndDate: z.string().datetime(),
    contractValue: z.number().min(0),
    address: z.object({
        street: z.string(),
        city: z.string(),
        zip: z.string(),
    }),
});

export type Project = z.infer<typeof ProjectSchema>;

export const BudgetSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    costCode: z.string(), // e.g., "03-3000 Concrete"
    originalEstimate: z.number().min(0),
    approvedCOs: z.number().default(0),
    committedCost: z.number().default(0),
    actualCost: z.number().default(0),
});

export type Budget = z.infer<typeof BudgetSchema>;

export enum CommitmentStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    EXECUTED = 'EXECUTED',
    CLOSED = 'CLOSED',
}

export const CommitmentSchema = z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    vendorId: z.string().uuid(),
    amount: z.number().min(0),
    retainagePercent: z.number().min(0).max(100).default(10),
    status: z.nativeEnum(CommitmentStatus),
});

export type Commitment = z.infer<typeof CommitmentSchema>;

// --- AI ACTION SCHEMAS ---

// Action: PREDICT_PROJECT_DELAY
export const PredictProjectDelaySchema = z.object({
    action: z.literal('PREDICT_PROJECT_DELAY'),
    entity: z.literal('Project'),
    params: z.object({
        projectId: z.string(),
        currentSpi: z.number(), // Schedule Performance Index
    }),
    preconditions: z.array(z.string()).default(['schedule_active']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
    reversible: z.literal(false),
});

export type PredictProjectDelayAction = z.infer<typeof PredictProjectDelaySchema>;

// Action: DETECT_SAFETY_RISK
export const DetectSafetyRiskSchema = z.object({
    action: z.literal('DETECT_SAFETY_RISK'),
    entity: z.literal('Incident'),
    params: z.object({
        projectId: z.string(),
        location: z.string(), // "Zone A"
        riskType: z.enum(['PPE_VIOLATION', 'FALL_HAZARD', 'EQUIPMENT_PROXIMITY']),
        confidence: z.number().min(0).max(1),
    }),
    preconditions: z.array(z.string()).default(['camera_feed_active']),
    requiresApproval: z.literal(true), // Safety officer confirm
    auditLog: z.literal(true),
});

export type DetectSafetyRiskAction = z.infer<typeof DetectSafetyRiskSchema>;
