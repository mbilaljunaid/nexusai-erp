import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export const PatientSchema = z.object({
    id: z.string().uuid(),
    mrn: z.string(), // Medical Record Number
    firstName: z.string(), // Encrypted at separate layer
    lastName: z.string(),  // Encrypted at separate layer
    dateOfBirth: z.string().datetime(),
    gender: z.enum(['M', 'F', 'O', 'U']),
    contactEmail: z.string().email().optional(),
    consentSMS: z.boolean().default(false),
    consentEmail: z.boolean().default(false),
});

export type Patient = z.infer<typeof PatientSchema>;

export enum EncounterStatus {
    SCHEDULED = 'SCHEDULED',
    CHECKED_IN = 'CHECKED_IN',
    IN_PROGRESS = 'IN_PROCESS',
    DISCHARGED = 'DISCHARGED',
    BILLED = 'BILLED',
    CANCELLED = 'CANCELLED',
}

export const EncounterSchema = z.object({
    id: z.string().uuid(),
    patientId: z.string().uuid(),
    providerId: z.string().uuid(),
    departmentId: z.string().uuid(),
    scheduledTime: z.string().datetime(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    status: z.nativeEnum(EncounterStatus),
    primaryDiagnosisCode: z.string().optional(), // ICD-10
});

export type Encounter = z.infer<typeof EncounterSchema>;

export const ClaimLineItemSchema = z.object({
    cptCode: z.string(),
    chargeAmount: z.number().min(0),
    units: z.number().int().positive(),
    modifiers: z.array(z.string()).optional(),
});

export const ClaimSchema = z.object({
    id: z.string().uuid(),
    encounterId: z.string().uuid(),
    payerId: z.string().uuid(),
    totalAmount: z.number().min(0),
    status: z.enum(['DRAFT', 'SUBMITTED', 'PAID', 'DENIED', 'DRAFT']),
    lineItems: z.array(ClaimLineItemSchema),
});

export type Claim = z.infer<typeof ClaimSchema>;

// --- AI ACTION SCHEMAS ---

// Action: PREDICT_CLAIM_DENIAL
export const PredictClaimDenialSchema = z.object({
    action: z.literal('PREDICT_CLAIM_DENIAL'),
    entity: z.literal('Claim'),
    params: z.object({
        claimId: z.string(),
    }),
    preconditions: z.array(z.string()).default(['claim_exists', 'payer_rules_active']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
    reversible: z.literal(true), // Can edit claim before submission
});

export type PredictClaimDenialAction = z.infer<typeof PredictClaimDenialSchema>;

// Action: OPTIMIZE_STAFFING
export const OptimizeStaffingSchema = z.object({
    action: z.literal('OPTIMIZE_STAFFING'),
    entity: z.literal('Department'),
    params: z.object({
        departmentId: z.string(),
        forecastPeriod: z.string(),
    }),
    preconditions: z.array(z.string()).default(['department_exists', 'roster_available']),
    requiresApproval: z.literal(true),
    auditLog: z.literal(true),
    reversible: z.literal(true), // Changes to schedule can be reverted
});

export type OptimizeStaffingAction = z.infer<typeof OptimizeStaffingSchema>;
