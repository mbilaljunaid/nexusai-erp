
import { db } from "@db";
import { lcmTradeOperations, lcmShipmentLines, lcmCharges, lcmCostComponents } from "@shared/schema/lcm";
import { eq, and, sql } from "drizzle-orm";

export class LcmService {

    // --- Cost Components ---
    async listCostComponents() {
        return await db.select().from(lcmCostComponents).where(eq(lcmCostComponents.isActive, true));
    }

    async createCostComponent(data: any) {
        return await db.insert(lcmCostComponents).values(data).returning();
    }

    // --- Trade Operations ---
    async listTradeOperations(page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        const data = await db.select().from(lcmTradeOperations)
            .limit(limit)
            .offset(offset)
            .orderBy(sql`${lcmTradeOperations.createdAt} DESC`);

        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(lcmTradeOperations);

        return {
            data,
            total: Number(countResult.count),
            page,
            limit,
            totalPages: Math.ceil(Number(countResult.count) / limit)
        };
    }

    async createTradeOperation(data: any) {
        return await db.insert(lcmTradeOperations).values({
            ...data,
            operationNumber: data.operationNumber || `TO-${Date.now()}` // Fallback if not provided
        }).returning();
    }

    async createTradeOperationWithLines(data: { header: any, shipmentLines?: any[] }) {
        return await db.transaction(async (tx) => {
            // 1. Header
            const [op] = await tx.insert(lcmTradeOperations).values({
                ...data.header,
                operationNumber: data.header.operationNumber || `TO-${Date.now()}`
            }).returning();

            // 2. Lines (if any)
            if (data.shipmentLines && data.shipmentLines.length > 0) {
                const lines = data.shipmentLines.map(l => ({
                    ...l,
                    tradeOperationId: op.id
                }));
                await tx.insert(lcmShipmentLines).values(lines);
            }

            return op;
        });
    }

    async getTradeOperationDetails(id: string) {
        const header = await db.query.lcmTradeOperations.findFirst({
            where: eq(lcmTradeOperations.id, id)
        });

        if (!header) return null;

        const lines = await db.select().from(lcmShipmentLines).where(eq(lcmShipmentLines.tradeOperationId, id));
        const charges = await db.select().from(lcmCharges).where(eq(lcmCharges.tradeOperationId, id));

        return { ...header, lines, charges };
    }

    // --- Charges ---
    async addCharge(data: any) {
        return await db.insert(lcmCharges).values(data).returning();
    }

    async trackActualCharge(data: { tradeOpId: string, amount: string, vendorId: string, referenceNumber: string, costComponentId: string }) {
        // Create an "Actual" charge record
        return await db.insert(lcmCharges).values({
            tradeOperationId: data.tradeOpId,
            costComponentId: data.costComponentId, // Must be passed from AP
            amount: data.amount,
            vendorId: data.vendorId,
            referenceNumber: data.referenceNumber,
            isActual: true
        }).returning();
    }
}

export const lcmService = new LcmService();
