import { z } from 'zod';

// --- DOMAIN ENTITIES ---

export const ProductSchema = z.object({
    id: z.string().uuid(),
    sku: z.string().min(3),
    name: z.string(),
    brand: z.string().optional(),
    categoryId: z.string().uuid(),
    price: z.number().min(0),
    cost: z.number().min(0),
    taxable: z.boolean().default(true),
    variants: z.array(z.object({
        id: z.string().uuid(),
        name: z.string(), // e.g., "Size: M"
        skuSuffix: z.string(),
    })).optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export enum InventoryType {
    AVAILABLE = 'AVAILABLE',
    ALLOCATED = 'ALLOCATED',
    DAMAGED = 'DAMAGED',
    IN_TRANSIT = 'IN_TRANSIT',
}

export const InventorySchema = z.object({
    productId: z.string().uuid(),
    locationId: z.string().uuid(), // Store or Warehouse
    quantity: z.number().int(),
    type: z.nativeEnum(InventoryType),
});

export type Inventory = z.infer<typeof InventorySchema>;

export enum OrderStatus {
    PLACED = 'PLACED',
    FRAUD_CHECK = 'FRAUD_CHECK',
    ALLOCATED = 'ALLOCATED',
    PICKED = 'PICKED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    RETURNED = 'RETURNED',
}

export const OrderSchema = z.object({
    id: z.string().uuid(),
    customerId: z.string().uuid(),
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive(),
        priceAtPurchase: z.number(),
    })),
    totalAmount: z.number(),
    status: z.nativeEnum(OrderStatus),
    shippingAddress: z.object({
        street: z.string(),
        city: z.string(),
        zip: z.string(),
    }),
});

export type Order = z.infer<typeof OrderSchema>;

// --- AI ACTION SCHEMAS ---

// Action: RECOMMEND_REPLENISHMENT
export const RecommendReplenishmentSchema = z.object({
    action: z.literal('RECOMMEND_REPLENISHMENT'),
    entity: z.literal('Product'),
    params: z.object({
        sku: z.string(),
        locationId: z.string(),
        suggestedQty: z.number().positive(),
    }),
    preconditions: z.array(z.string()).default(['product_active', 'vendor_active']),
    requiresApproval: z.literal(true),
    auditLog: z.literal(true),
});

export type RecommendReplenishmentAction = z.infer<typeof RecommendReplenishmentSchema>;

// Action: PERSONALIZE_PROMOTION
export const PersonalizePromotionSchema = z.object({
    action: z.literal('PERSONALIZE_PROMOTION'),
    entity: z.literal('Customer'),
    params: z.object({
        segmentId: z.string(),
        discountPercent: z.number().min(0).max(100),
        campaignName: z.string(),
    }),
    preconditions: z.array(z.string()).default(['segment_valid']),
    requiresApproval: z.literal(false),
    auditLog: z.literal(true),
});

export type PersonalizePromotionAction = z.infer<typeof PersonalizePromotionSchema>;
