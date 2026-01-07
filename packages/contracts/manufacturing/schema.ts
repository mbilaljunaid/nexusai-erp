import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export enum ItemType {
    RAW_MATERIAL = 'RM',
    WIP = 'WIP',
    FINISHED_GOOD = 'FG',
}

export const ItemSchema = z.object({
    id: z.string().uuid(),
    sku: z.string().min(3),
    name: z.string(),
    type: z.nativeEnum(ItemType),
    uom: z.string(),
    costingMethod: z.enum(['STD', 'FIFO', 'AVG']),
    standardCost: z.number().min(0),
});

export type Item = z.infer<typeof ItemSchema>;

export const BOMComponentSchema = z.object({
    childItemId: z.string().uuid(),
    quantity: z.number().positive(),
    scrapFactor: z.number().min(0).optional(),
});

export const BOMSchema = z.object({
    id: z.string().uuid(),
    parentItemId: z.string().uuid(),
    revision: z.string(),
    status: z.enum(['DRAFT', 'ACTIVE', 'OBSOLETE']),
    components: z.array(BOMComponentSchema),
});

export type BOM = z.infer<typeof BOMSchema>;

export enum ProductionOrderStatus {
    PLANNED = 'PLANNED',
    RELEASED = 'RELEASED',
    IN_PROCESS = 'IN_PROCESS',
    COMPLETED = 'COMPLETED',
    CLOSED = 'CLOSED',
}

export const ProductionOrderSchema = z.object({
    id: z.string().uuid(),
    itemId: z.string().uuid(),
    quantity: z.number().positive(),
    bomRevision: z.string(),
    routingRevision: z.string(),
    plantId: z.string().uuid(),
    dueDate: z.string().datetime(), // ISO 8601
    status: z.nativeEnum(ProductionOrderStatus),
});

export type ProductionOrder = z.infer<typeof ProductionOrderSchema>;

// --- AI ACTION SCHEMAS ---

// Action: PREDICT_EQUIPMENT_FAILURE
export const PredictEquipmentFailureSchema = z.object({
    action: z.literal('PREDICT_EQUIPMENT_FAILURE'),
    entity: z.literal('Machine'),
    params: z.object({
        machineId: z.string(),
        forecastPeriod: z.string(), // e.g. "2026-02-01 to 2026-02-28"
    }),
    preconditions: z.array(z.string()).default(['machine_exists', 'sensor_data_available']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
    reversible: z.literal(false),
});

export type PredictEquipmentFailureAction = z.infer<typeof PredictEquipmentFailureSchema>;

// Action: OPTIMIZE_PRODUCTION_SCHEDULE
export const OptimizeProductionScheduleSchema = z.object({
    action: z.literal('OPTIMIZE_PRODUCTION_SCHEDULE'),
    entity: z.literal('Schedule'),
    params: z.object({
        plantId: z.string(),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        optimizeFor: z.enum(['THROUGHPUT', 'MIN_CHANGEOVER', 'DUE_DATE']).default('DUE_DATE'),
    }),
    preconditions: z.array(z.string()).default(['plant_exists', 'active_orders_exist']),
    requiresApproval: z.literal(true),
    auditLog: z.literal(true),
    reversible: z.literal(true),
});

export type OptimizeProductionScheduleAction = z.infer<typeof OptimizeProductionScheduleSchema>;
