import { db } from "../db";
import {
    tlShipments, tlLanes, tlCarriers, tlRateAgreements, tlMilestones, tlStops,
    type InsertTlShipment, type TlShipment, type TlLane, type TlCarrier
} from "../../shared/schema/transportation";
import { eq, and, asc, desc } from "drizzle-orm";

export class TLOptimizationService {

    /**
     * Plan Shipment from Order
     * Converts an OM Order into a planned shipment
     */
    async planShipment(orderId: string, sourceModule: string = "ORDER"): Promise<TlShipment> {
        // ... (existing code)
        // 1. Fetch Order details (Link to OM would go here)
        // For now, we generate a shipment placeholder
        const shipmentNumber = `SHP-${Date.now().toString().slice(-6)}`;

        const [shipment] = await db.insert(tlShipments).values({
            shipmentNumber,
            sourceModule,
            sourceId: orderId,
            status: "PLANNED",
            createdAt: new Date(),
        } as InsertTlShipment).returning();

        // 2. Initial Milestone: PLANNED
        await db.insert(tlMilestones).values({
            shipmentId: shipment.id,
            eventCode: "PLANNED",
            eventName: "Shipment Planned",
            plannedDate: new Date(),
            status: "COMPLETED"
        });

        return shipment;
    }

    /**
     * Optimize Route & Carrier Selection
     * ... (existing)
     */
    async optimizeRoute(shipmentId: string): Promise<{
        selectedCarrier: TlCarrier;
        selectedLane: TlLane;
        estimatedCost: number;
    }> {
        // ... (existing code, keep as is)
        const [shipment] = await db.select().from(tlShipments).where(eq(tlShipments.id, shipmentId)).limit(1);
        if (!shipment) throw new Error("Shipment not found");

        const agreements = await db.select()
            .from(tlRateAgreements)
            .where(eq(tlRateAgreements.active, true))
            .orderBy(asc(tlRateAgreements.baseRate));

        if (agreements.length === 0) throw new Error("No active rate agreements found for optimization.");

        const bestAgreement = agreements[0];

        const [carrier] = await db.select().from(tlCarriers).where(eq(tlCarriers.id, bestAgreement.carrierId)).limit(1);
        const [lane] = await db.select().from(tlLanes).where(eq(tlLanes.id, bestAgreement.laneId)).limit(1);

        await db.update(tlShipments)
            .set({
                carrierId: carrier.id,
                laneId: lane.id,
                totalCost: bestAgreement.baseRate,
                plannedDeparture: new Date(),
                plannedArrival: new Date(Date.now() + (Number(lane.transitTimeDays) || 3) * 24 * 60 * 60 * 1000)
            })
            .where(eq(tlShipments.id, shipmentId));

        return {
            selectedCarrier: carrier,
            selectedLane: lane,
            estimatedCost: Number(bestAgreement.baseRate)
        };
    }

    /**
     * Multi-Leg Optimization (Complex Load)
     * Calculates costs for shipments with multiple stops.
     */
    async optimizeMultiLegRoute(shipmentId: string): Promise<any> {
        const stops = await db.select().from(tlStops)
            .where(eq(tlStops.shipmentId, shipmentId))
            .orderBy(asc(tlStops.stopSequence));

        if (stops.length === 0) {
            return { message: "No stops found. Standard optimization applies." };
        }

        // Mock Logic: Each stop adds $150 to the base cost + 10% overhead
        // In a real engine, this would use Rate Agreements per leg.
        let stopCost = stops.length * 150;

        // Fetch current cost (base)
        const [shipment] = await db.select().from(tlShipments).where(eq(tlShipments.id, shipmentId));
        const baseCost = Number(shipment.totalCost || 0);

        // Apply 10% overhead to the total (Base + Stops)
        const multiLegTotal = (baseCost + stopCost) * 1.10;

        // Update Shipment
        await db.update(tlShipments)
            .set({
                totalCost: multiLegTotal.toString(),
                notes: `Multi-leg optimized: ${stops.length} stops included.`
            })
            .where(eq(tlShipments.id, shipmentId));

        return {
            originalCost: baseCost,
            stopsAdded: stops.length,
            stopSurcharge: stopCost,
            finalTotal: multiLegTotal
        };
    }

    /**
     * AI Prediction: Exception Risk Scoring
     * ... (existing)
     */
    async predictDelayRisk(shipmentId: string): Promise<{
        riskScore: number; // 0-100
        flags: string[];
    }> {
        // ... (existing code keys risk off rating/lane)
        const [shipment] = await db.select().from(tlShipments).where(eq(tlShipments.id, shipmentId)).limit(1);
        if (!shipment || !shipment.carrierId) return { riskScore: 0, flags: [] };

        const [carrier] = await db.select().from(tlCarriers).where(eq(tlCarriers.id, shipment.carrierId)).limit(1);

        let riskScore = 0;
        const flags: string[] = [];

        const rating = Number(carrier.rating || 5);
        if (rating < 4) {
            riskScore += (5 - rating) * 20;
            flags.push("Low Carrier Rating");
        }

        const [lane] = await db.select().from(tlLanes).where(eq(tlLanes.id, shipment.laneId)).limit(1);
        if (lane && Number(lane.distanceKm) > 1000) {
            riskScore += 15;
            flags.push("Long Distance Route (>1000km)");
        }

        const currentMonth = new Date().getMonth();
        if (currentMonth === 11) {
            riskScore += 25;
            flags.push("Holiday Season Congestion");
        }

        return {
            riskScore: Math.min(riskScore, 100),
            flags
        };
    }
}

export const tlOptimizationService = new TLOptimizationService();
