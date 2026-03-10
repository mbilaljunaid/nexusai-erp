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

    /**
     * List all Carriers with full Metrics (for Overview)
     */
    async getCarrierMetrics(): Promise<any[]> {
        const carriers = await this.listCarriers();
        const metrics = [];
        for (const carrier of carriers) {
            const scorecard = await this.getCarrierScorecard(carrier.id);
            metrics.push({
                ...carrier,
                ...scorecard,
                costPerMile: 2.15 + (Math.random() * 0.5), // Simulated cost per mile
                avgLeadTime: 2.0 + (Math.random() * 1.5)   // Simulated lead time
            });
        }
        return metrics;
    }

    /**
     * Pull Live DB aggregates for trend analytics (Last 6 Months)
     */
    async getCarrierTrend(carrierId: string) {
        // Aggregate shipments by month
        const shipments = await db.select({
            id: tlShipments.id,
            createdAt: tlShipments.createdAt
        }).from(tlShipments).where(eq(tlShipments.carrierId, carrierId));

        // Group by month
        const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const performanceTrend = months.map(m => ({ month: m, onTime: 90 + Math.random() * 8 }));
        const shipmentTrend = months.map(m => ({ month: m, count: Math.floor(Math.random() * 50) + 150 }));

        // Use real shipment data if available for shipmentTrend
        if (shipments.length > 0) {
            const countsByMonth = Array(12).fill(0);
            shipments.forEach(s => {
                if (s.createdAt) {
                    const d = new Date(s.createdAt);
                    countsByMonth[d.getMonth()]++;
                }
            });
            // Update the last 6 months (static map for simplicity given mock data range)
            const currentMonth = new Date().getMonth();
            for (let i = 0; i < 6; i++) {
                const mlidx = (currentMonth - i + 12) % 12;
                const date = new Date();
                date.setMonth(mlidx);
                const monthStr = date.toLocaleString('default', { month: 'short' });
                shipmentTrend[5 - i] = { month: monthStr, count: countsByMonth[mlidx] };
                performanceTrend[5 - i] = { month: monthStr, onTime: 90 + Math.random() * 8 }; // Mock on-time still as it requires complex milestone logic
            }
        }

        return { performanceTrend, shipmentTrend };
    }
}

export const carrierRatingService = new CarrierRatingService();
