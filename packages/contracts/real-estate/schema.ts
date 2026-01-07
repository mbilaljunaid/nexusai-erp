import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export enum PropertyType {
    COMMERCIAL = 'COMMERCIAL',
    RESIDENTIAL = 'RESIDENTIAL',
    MIXED_USE = 'MIXED_USE',
    INDUSTRIAL = 'INDUSTRIAL',
}

export const PropertySchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    type: z.nativeEnum(PropertyType),
    address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string(),
    }),
    gla: z.number().positive().optional(), // Gross Leasable Area
});

export type Property = z.infer<typeof PropertySchema>;

export const UnitSchema = z.object({
    id: z.string().uuid(),
    propertyId: z.string().uuid(),
    unitNumber: z.string(),
    floor: z.string().optional(),
    sqFt: z.number().positive(),
    status: z.enum(['VACANT', 'OCCUPIED', 'MAINTENANCE']),
    currentLeaseId: z.string().uuid().nullable(),
});

export type Unit = z.infer<typeof UnitSchema>;

export enum LeaseStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    TERMINATED = 'TERMINATED',
    EXPIRED = 'EXPIRED',
}

export const LeaseSchema = z.object({
    id: z.string().uuid(),
    unitId: z.string().uuid(),
    tenantId: z.string().uuid(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    baseRent: z.number().min(0),
    camCharges: z.number().min(0).default(0),
    securityDeposit: z.number().min(0).default(0),
    status: z.nativeEnum(LeaseStatus),
});

export type Lease = z.infer<typeof LeaseSchema>;

// --- AI ACTION SCHEMAS ---

// Action: FORECAST_OCCUPANCY
export const ForecastOccupancySchema = z.object({
    action: z.literal('FORECAST_OCCUPANCY'),
    entity: z.literal('Property'),
    params: z.object({
        propertyId: z.string(),
        forecastPeriod: z.string(),
    }),
    preconditions: z.array(z.string()).default(['property_exists']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
    reversible: z.literal(false),
});

export type ForecastOccupancyAction = z.infer<typeof ForecastOccupancySchema>;

// Action: OPTIMIZE_RENT_PRICING
export const OptimizeRentPricingSchema = z.object({
    action: z.literal('OPTIMIZE_RENT_PRICING'),
    entity: z.literal('Unit'),
    params: z.object({
        unitId: z.string(),
        minFloorPrice: z.number().positive().optional(),
    }),
    preconditions: z.array(z.string()).default(['unit_exists', 'unit_vacant']),
    requiresApproval: z.literal(true),
    auditLog: z.literal(true),
    reversible: z.literal(true),
});

export type OptimizeRentPricingAction = z.infer<typeof OptimizeRentPricingSchema>;
