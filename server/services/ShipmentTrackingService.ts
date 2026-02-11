import { db } from "../db";
import {
    tlShipmentTracking,
    tlTrackingMilestones,
    tlTrackingAlerts,
    tlShipments,
    tlLanes,
    tlCarriers,
    InsertTlShipmentTracking,
    InsertTlTrackingMilestone,
    InsertTlTrackingAlert
} from "../../shared/schema/transportation";
import { eq, and, lte, gte, sql, desc, isNull } from "drizzle-orm";

export class ShipmentTrackingService {

    // ========== TRACKING STATUS ==========

    static async getTracking(shipmentId: string) {
        const [tracking] = await db
            .select()
            .from(tlShipmentTracking)
            .where(eq(tlShipmentTracking.shipmentId, shipmentId));

        return tracking;
    }

    static async updateLocation(shipmentId: string, location: {
        latitude: number;
        longitude: number;
        currentLocationId?: string;
    }) {
        const { latitude, longitude, currentLocationId } = location;

        // Upsert tracking record
        const existing = await this.getTracking(shipmentId);

        if (existing) {
            const [updated] = await db
                .update(tlShipmentTracking)
                .set({
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    currentLocationId,
                    lastUpdated: sql`now()`
                })
                .where(eq(tlShipmentTracking.shipmentId, shipmentId))
                .returning();

            return updated;
        } else {
            const [created] = await db
                .insert(tlShipmentTracking)
                .values({
                    shipmentId,
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    currentLocationId,
                    status: "IN_TRANSIT"
                })
                .returning();

            return created;
        }
    }

    // ========== MILESTONES ==========

    static async getMilestones(shipmentId: string) {
        return await db
            .select()
            .from(tlTrackingMilestones)
            .where(eq(tlTrackingMilestones.shipmentId, shipmentId))
            .orderBy(tlTrackingMilestones.timestamp);
    }

    static async createMilestone(shipmentId: string, data: {
        milestoneType: string;
        location?: string;
        latitude?: number;
        longitude?: number;
        notes?: string;
        createdBy?: string;
    }) {
        const [milestone] = await db
            .insert(tlTrackingMilestones)
            .values({
                shipmentId,
                milestoneType: data.milestoneType,
                location: data.location,
                latitude: data.latitude?.toString(),
                longitude: data.longitude?.toString(),
                notes: data.notes,
                createdBy: data.createdBy || "system"
            })
            .returning();

        return milestone;
    }

    // ========== ALERTS ==========

    static async getAlerts(filters?: {
        severity?: string;
        resolved?: boolean;
        limitDays?: number;
    }) {
        let query = db.select().from(tlTrackingAlerts);

        const conditions: any[] = [];

        if (filters?.severity) {
            conditions.push(eq(tlTrackingAlerts.severity, filters.severity));
        }

        if (filters?.resolved === false) {
            conditions.push(isNull(tlTrackingAlerts.resolvedAt));
        } else if (filters?.resolved === true) {
            conditions.push(sql`${tlTrackingAlerts.resolvedAt} IS NOT NULL`);
        }

        if (filters?.limitDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - filters.limitDays);
            conditions.push(gte(tlTrackingAlerts.createdAt, cutoffDate));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        return await query.orderBy(desc(tlTrackingAlerts.createdAt));
    }

    static async createAlert(shipmentId: string, alertData: {
        alertType: string;
        message: string;
        severity?: string;
    }) {
        const [alert] = await db
            .insert(tlTrackingAlerts)
            .values({
                shipmentId,
                alertType: alertData.alertType,
                message: alertData.message,
                severity: alertData.severity || "MEDIUM"
            })
            .returning();

        return alert;
    }

    static async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
        const [updated] = await db
            .update(tlTrackingAlerts)
            .set({
                acknowledgedAt: sql`now()`,
                acknowledgedBy
            })
            .where(eq(tlTrackingAlerts.id, alertId))
            .returning();

        return updated;
    }

    static async resolveAlert(alertId: string) {
        const [updated] = await db
            .update(tlTrackingAlerts)
            .set({ resolvedAt: sql`now()` })
            .where(eq(tlTrackingAlerts.id, alertId))
            .returning();

        return updated;
    }

    // ========== ACTIVE SHIPMENTS ==========

    static async getActiveShipments() {
        return await db
            .select()
            .from(tlShipmentTracking)
            .where(eq(tlShipmentTracking.status, "IN_TRANSIT"));
    }

    // ========== ETA CALCULATION ==========

    static async calculateETA(shipmentId: string) {
        // Get shipment and tracking details
        const [shipment] = await db.select().from(tlShipments).where(eq(tlShipments.id, shipmentId));
        if (!shipment) {
            throw new Error("Shipment not found");
        }

        const tracking = await this.getTracking(shipmentId);
        if (!tracking) {
            throw new Error("No tracking data found");
        }

        //Calculate based on planned arrival
        let estimatedDelivery = shipment.plannedArrival || new Date();
        const factors: string[] = [];
        let confidencePercent = 85;

        // Get lane and carrier performance data
        if (shipment.laneId) {
            const [lane] = await db.select().from(tlLanes).where(eq(tlLanes.id, shipment.laneId));
            if (lane && lane.transitTimeDays) {
                // Use historical transit time
                const transitMs = parseInt(lane.transitTimeDays.toString()) * 24 * 60 * 60 * 1000;
                estimatedDelivery = new Date(shipment.actualDeparture || shipment.plannedDeparture || new Date());
                estimatedDelivery.setTime(estimatedDelivery.getTime() + transitMs);
                factors.push(`Historical transit time: ${lane.transitTimeDays} days`);
                confidencePercent += 5;
            }
        }

        // Adjust for carrier rating
        if (shipment.carrierId) {
            const [carrier] = await db.select().from(tlCarriers).where(eq(tlCarriers.id, shipment.carrierId));
            if (carrier && carrier.rating) {
                const rating = parseFloat(carrier.rating);
                if (rating >= 4.5) {
                    confidencePercent += 10;
                    factors.push("High-performing carrier");
                } else if (rating < 3.5) {
                    confidencePercent -= 10;
                    factors.push("Lower carrier performance");
                    // Add 1 day delay
                    estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
                }
            }
        }

        // Adjust confidence based on time remaining
        const now = new Date();
        const hoursRemaining = (estimatedDelivery.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursRemaining > 0) {
            confidencePercent = Math.max(50, confidencePercent - Math.floor(hoursRemaining / 24) * 2);
            factors.push(`${Math.floor(hoursRemaining)} hours remaining`);
        }

        // Cap confidence
        confidencePercent = Math.min(95, Math.max(50, confidencePercent));

        // Update tracking record
        await db
            .update(tlShipmentTracking)
            .set({
                estimatedDelivery,
                confidencePercent
            })
            .where(eq(tlShipmentTracking.shipmentId, shipmentId));

        return {
            estimatedDelivery,
            confidencePercent,
            factors
        };
    }
}
