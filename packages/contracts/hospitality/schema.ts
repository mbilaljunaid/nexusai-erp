import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export enum ReservationStatus {
    INQUIRY = 'INQUIRY',
    CONFIRMED = 'CONFIRMED',
    CHECKED_IN = 'CHECKED_IN',
    CHECKED_OUT = 'CHECKED_OUT',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
}

export const ReservationSchema = z.object({
    id: z.string().uuid(),
    propertyId: z.string().uuid(),
    guestId: z.string().uuid(),
    roomTypeId: z.string().uuid(),
    roomId: z.string().uuid().optional(), // Assigned later
    checkInDate: z.string().datetime(),
    checkOutDate: z.string().datetime(),
    adults: z.number().int().min(1),
    children: z.number().int().default(0),
    ratePlanId: z.string().uuid(),
    totalPrice: z.number().min(0),
    status: z.nativeEnum(ReservationStatus),
});

export type Reservation = z.infer<typeof ReservationSchema>;

export const GuestProfileSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    loyaltyTier: z.enum(['NONE', 'SILVER', 'GOLD', 'PLATINUM']).default('NONE'),
    preferences: z.array(z.string()).optional(), // e.g., ["Quiet Room", "Vegan"]
});

export type GuestProfile = z.infer<typeof GuestProfileSchema>;

// --- AI ACTION SCHEMAS ---

// Action: DYNAMIC_PRICING_ADJUSTMENT
export const DynamicPricingAdjustmentSchema = z.object({
    action: z.literal('DYNAMIC_PRICING_ADJUSTMENT'),
    entity: z.literal('RoomType'),
    params: z.object({
        propertyId: z.string(),
        dateRange: z.string(), // ISO range
        targetOccupancy: z.number().min(0).max(100),
    }),
    preconditions: z.array(z.string()).default(['property_active', 'rates_loaded']),
    requiresApproval: z.boolean().default(true), // Default to safety
    auditLog: z.literal(true),
    reversible: z.literal(true),
});

export type DynamicPricingAdjustmentAction = z.infer<typeof DynamicPricingAdjustmentSchema>;

// Action: SCHEDULE_HOUSEKEEPING
export const ScheduleHousekeepingSchema = z.object({
    action: z.literal('SCHEDULE_HOUSEKEEPING'),
    entity: z.literal('Schedule'),
    params: z.object({
        propertyId: z.string(),
        date: z.string().datetime(),
    }),
    preconditions: z.array(z.string()).default(['staff_roster_ready', 'checkout_list_ready']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
    reversible: z.literal(true),
});

export type ScheduleHousekeepingAction = z.infer<typeof ScheduleHousekeepingSchema>;
