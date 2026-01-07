import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export enum EngagementType {
    TIME_AND_MATERIALS = 'TIME_AND_MATERIALS',
    FIXED_PRICE = 'FIXED_PRICE',
    RETAINER = 'RETAINER',
}

export const EngagementSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    clientId: z.string().uuid(), // Link to common.customers
    name: z.string(),
    type: z.nativeEnum(EngagementType),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    budgetAmount: z.number().min(0).optional(),
    status: z.enum(['OPPORTUNITY', 'ACTIVE', 'COMPLETED', 'ON_HOLD']),
});

export type Engagement = z.infer<typeof EngagementSchema>;

export const ResourceSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(), // Link to common.users
    skills: z.array(z.object({
        name: z.string(),
        proficiency: z.number().min(1).max(5),
    })),
    title: z.string(),
    billRate: z.number().min(0),
    costRate: z.number().min(0),
});

export type Resource = z.infer<typeof ResourceSchema>;

export const TimeEntrySchema = z.object({
    id: z.string().uuid(),
    resourceId: z.string().uuid(),
    engagementId: z.string().uuid(),
    date: z.string().datetime(), // Day of work
    hours: z.number().min(0.25).max(24),
    description: z.string(),
    billable: z.boolean().default(true),
    status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']),
});

export type TimeEntry = z.infer<typeof TimeEntrySchema>;

// --- AI ACTION SCHEMAS ---

// Action: MATCH_RESOURCE_TO_PROJECT
export const MatchResourceToProjectSchema = z.object({
    action: z.literal('MATCH_RESOURCE_TO_PROJECT'),
    entity: z.literal('Resource'),
    params: z.object({
        roleRequired: z.string(), // e.g. "Senior Dev"
        requiredSkills: z.array(z.string()),
        startDate: z.string().datetime(),
        maxBillRate: z.number().optional(),
    }),
    preconditions: z.array(z.string()).default(['roster_active']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
});

export type MatchResourceToProjectAction = z.infer<typeof MatchResourceToProjectSchema>;

// Action: FORECAST_BENCH_RISK
export const ForecastBenchRiskSchema = z.object({
    action: z.literal('FORECAST_BENCH_RISK'),
    entity: z.literal('Resource'),
    params: z.object({
        weeksOut: z.number().int().default(4),
        thresholdUtilization: z.number().default(0.5),
    }),
    preconditions: z.array(z.string()).default(['assignments_current']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
});

export type ForecastBenchRiskAction = z.infer<typeof ForecastBenchRiskSchema>;
