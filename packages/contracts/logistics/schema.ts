import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export enum ShipmentStatus {
    PLANNED = 'PLANNED',
    DISPATCHED = 'DISPATCHED',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    EXCEPTION = 'EXCEPTION',
}

export const ShipmentSchema = z.object({
    id: z.string().uuid(),
    tenantId: z.string().uuid(),
    orderIds: z.array(z.string().uuid()),
    originAddress: z.object({
        street: z.string(),
        city: z.string(),
        zip: z.string(),
    }),
    destinationAddress: z.object({
        street: z.string(),
        city: z.string(),
        zip: z.string(),
    }),
    status: z.nativeEnum(ShipmentStatus),
    carrierId: z.string().uuid().optional(), // Internal or External
    driverId: z.string().uuid().optional(),
    vehicleId: z.string().uuid().optional(),
    estimatedArrival: z.string().datetime(),
    actualArrival: z.string().datetime().optional(),
});

export type Shipment = z.infer<typeof ShipmentSchema>;

export const RouteSchema = z.object({
    id: z.string().uuid(),
    vehicleId: z.string().uuid(),
    driverId: z.string().uuid(),
    stops: z.array(z.object({
        sequence: z.number().int(),
        location: z.object({ lat: z.number(), lng: z.number() }),
        type: z.enum(['PICKUP', 'DELIVERY', 'BREAK']),
        shipmentId: z.string().uuid().optional(),
    })),
    totalDistanceKm: z.number(),
    totalTimeMinutes: z.number(),
});

export type Route = z.infer<typeof RouteSchema>;

// --- AI ACTION SCHEMAS ---

// Action: PREDICT_ETA_DELAY
export const PredictEtaDelaySchema = z.object({
    action: z.literal('PREDICT_ETA_DELAY'),
    entity: z.literal('Shipment'),
    params: z.object({
        shipmentId: z.string(),
        currentLocation: z.object({ lat: z.number(), lng: z.number() }),
    }),
    preconditions: z.array(z.string()).default(['shipment_in_transit']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
    reversible: z.literal(false),
});

export type PredictEtaDelayAction = z.infer<typeof PredictEtaDelaySchema>;

// Action: OPTIMIZE_ROUTE
export const OptimizeRouteSchema = z.object({
    action: z.literal('OPTIMIZE_ROUTE'),
    entity: z.literal('Route'),
    params: z.object({
        routeId: z.string(),
        constraints: z.enum(['FASTEST', 'SHORTEST', 'AVOID_TOLLS']).default('FASTEST'),
    }),
    preconditions: z.array(z.string()).default(['route_planned']),
    requiresApproval: z.literal(true), // Driver/Dispatcher must confirm
    auditLog: z.literal(true),
    reversible: z.literal(true),
});

export type OptimizeRouteAction = z.infer<typeof OptimizeRouteSchema>;
