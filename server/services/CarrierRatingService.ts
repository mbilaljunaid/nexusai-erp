import { db } from "../db";
import {
    tlCarriers, tlShipments, tlMilestones,
    type InsertTlCarrier, type TlCarrier
} from "../../shared/schema/transportation";
import { eq, and, sql, avg, count } from "drizzle-orm";

export class CarrierRatingService {

    /**
     * Get Carrier Scorecard
     * Metrics: On-Time %, Total Shipments, Avg Lead Time
     */
    async getCarrierScorecard(carrierId: string): Promise<{
        onTimePercent: number;
        totalShipments: number;
        avgRating: number;
    }> {
        // 1. Total Shipments
        const shipments = await db.select({
            count: count(tlShipments.id)
        }).from(tlShipments).where(eq(tlShipments.carrierId, carrierId));

        const total = Number(shipments[0]?.count || 0);

        // 2. On-Time Check (Mock logic: compare planned vs actual arrival in milestones)
        // For parity, we'd check 'DELIVERED' milestones where actual <= planned
        const onTimeShipments = await db.select({
            count: count(tlMilestones.id)
        }).from(tlMilestones)
            .innerJoin(tlShipments, eq(tlMilestones.shipmentId, tlShipments.id))
            .where(and(
                eq(tlShipments.carrierId, carrierId),
                eq(tlMilestones.eventCode, "DELIVERED"),
                sql`${tlMilestones.actualDate} <= ${tlMilestones.plannedDate}`
            ));

        const onTimeCount = Number(onTimeShipments[0]?.count || 0);

        // 3. Current Rating
        const [carrier] = await db.select().from(tlCarriers).where(eq(tlCarriers.id, carrierId)).limit(1);

        return {
            onTimePercent: total > 0 ? (onTimeCount / total) * 100 : 100,
            totalShipments: total,
            avgRating: Number(carrier?.rating || 5)
        };
    }

    /**
     * Update Carrier Rating based on recent performance
     */
    async refreshCarrierRating(carrierId: string): Promise<number> {
        const stats = await this.getCarrierScorecard(carrierId);

        // Simple rating formula: 5 stars base, deduct for late deliveries
        let newRating = 5.0;
        if (stats.onTimePercent < 95) newRating -= 0.5;
        if (stats.onTimePercent < 90) newRating -= 1.0;
        if (stats.onTimePercent < 80) newRating -= 2.0;

        await db.update(tlCarriers)
            .set({ rating: newRating.toFixed(2) })
            .where(eq(tlCarriers.id, carrierId));

        return newRating;
    }

    /**
     * Add New Carrier
     */
    async createCarrier(data: InsertTlCarrier): Promise<TlCarrier> {
        const [carrier] = await db.insert(tlCarriers).values(data).returning();
        return carrier;
    }

    /**
     * List All Carriers with ratings
     */
    async listCarriers(): Promise<TlCarrier[]> {
        return await db.select().from(tlCarriers).orderBy(tlCarriers.name);
    }
}

export const carrierRatingService = new CarrierRatingService();
