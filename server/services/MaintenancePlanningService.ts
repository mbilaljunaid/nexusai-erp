
import { db } from "../db";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";
import { maintWorkOrders, maintWorkOrderOperations, maintWorkCenters, maintPMDefinitions } from "@shared/schema";


export class MaintenancePlanningService {

    /**
     * Get Schedule for a Date Range
     * Returns Work Orders and their Operations
     */
    async getSchedule(startDate: Date, endDate: Date) {
        // Fetch all WOs that overlap or are active in this range
        // For simplicity, we fetch WOs with status not CLOSED/CANCELLED
        // And operations scheduled within range

        // 1. Fetch Operations in Range
        const operations = await db.query.maintWorkOrderOperations.findMany({
            where: and(
                gte(maintWorkOrderOperations.scheduledDate, startDate),
                lte(maintWorkOrderOperations.scheduledDate, endDate)
            ),
            with: {
                workOrder: {
                    with: {
                        asset: true
                    }
                }
            }
        });

        // 2. Fetch Unscheduled Operations (Backlog)
        const backlog = await db.query.maintWorkOrderOperations.findMany({
            where: and(
                isNull(maintWorkOrderOperations.scheduledDate),
                or(
                    eq(maintWorkOrderOperations.status, "PENDING"),
                    eq(maintWorkOrderOperations.status, "READY")
                )
            ),
            with: {
                workOrder: true
            },
            limit: 50 // Limit backlog size for UI
        });

        return {
            scheduled: operations,
            backlog: backlog
        };
    }

    /**
     * Update Operation Schedule (Drag & Drop)
     */
    async scheduleOperation(operationId: string, scheduledDate: Date, workCenterId?: string) {
        const updateData: any = { scheduledDate };
        if (workCenterId) updateData.workCenterId = workCenterId;

        return await db.update(maintWorkOrderOperations)
            .set(updateData)
            .where(eq(maintWorkOrderOperations.id, operationId))
            .returning();
    }

    /**
     * Get Work Centers
     */
    async getWorkCenters() {
        return await db.query.maintWorkCenters.findMany({
            where: eq(maintWorkCenters.active, true)
        });
    }

    /**
     * Get Work Center Capacity Load
     */
    async getWorkCenterLoad(startDate: Date, endDate: Date) {
        // Aggregate planned hours by Work Center & Date
        // This is complex in pure ORM, might need raw SQL
        // For now, fetching operations and manual aggregation in JS
        const ops = await db.query.maintWorkOrderOperations.findMany({
            where: and(
                gte(maintWorkOrderOperations.scheduledDate, startDate),
                lte(maintWorkOrderOperations.scheduledDate, endDate)
            )
        });

        const loadMap: Record<string, number> = {}; // "WC_ID:DATE" -> Hours

        for (const op of ops) {
            if (!op.workCenterId || !op.scheduledDate) continue;

            const dateKey = new Date(op.scheduledDate).toISOString().split('T')[0];
            const key = `${op.workCenterId}:${dateKey}`;

            // Assume Duration is Labor Hours (or default 1h)
            // Note: Schema has 'actualDurationHours' but not explicit 'plannedDuration'. 
            // We should use Work Definition planned hours ideally. 
            // For now, let's look at Labor Hours or specific duration field? 
            // 'maint_work_definition_ops' has laborHours. 'maint_work_order_operations' is execution. 
            // We should have copied it. Let's assume 2 hours default for planning.
            const pDuration = 2;

            loadMap[key] = (loadMap[key] || 0) + pDuration;
        }

        return loadMap;
    }


    /**
     * Get PM Forecast
     * Simulates PM generation for a future range
     */
    async getForecast(startDate: Date, endDate: Date) {
        const events: any[] = [];
        const pms = await db.query.maintPMDefinitions.findMany({
            where: and(
                eq(maintPMDefinitions.active, true),
                eq(maintPMDefinitions.triggerType, "TIME")
            ),
            with: {
                asset: true
            }
        });

        for (const pm of pms) {
            // Determine base date (Last Generated or Effective Start)
            let baseDate = pm.lastGeneratedDate ? new Date(pm.lastGeneratedDate) : new Date(pm.effectiveStartDate || startDate);
            const freq = pm.frequency || 0;
            const uom = pm.frequencyUom;

            if (freq <= 0 || !uom) continue;

            // Loop and add interval until we surpass endDate
            // Avoid infinite loops
            let cursor = new Date(baseDate);
            // Advance cursor to at least startDate if it's behind
            // Effectively finding the first occurrence >= startDate?
            // Actually, we should just step forward.
            // But if last generated was 1 year ago, and we ask for next month, we might iterate 52 times for weekly.
            // That's acceptable for now.

            // Safety limit
            let iterations = 0;
            while (iterations < 1000) {
                // Add Interval
                if (uom === "DAY") cursor.setDate(cursor.getDate() + freq);
                if (uom === "WEEK") cursor.setDate(cursor.getDate() + (freq * 7));
                if (uom === "MONTH") cursor.setMonth(cursor.getMonth() + freq);
                if (uom === "YEAR") cursor.setFullYear(cursor.getFullYear() + freq);

                iterations++;

                if (cursor > endDate) break;

                if (cursor >= startDate) {
                    events.push({
                        id: `forecast-${pm.id}-${iterations}`,
                        type: "PM",
                        date: new Date(cursor),
                        title: pm.name,
                        asset: pm.asset ? `${pm.asset.assetNumber} - ${pm.asset.description}` : "Unknown Asset",
                        description: `Forecasted PM: ${pm.name}`

                    });
                }
            }
        }

        // Sort by date
        return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
}


export const maintenancePlanningService = new MaintenancePlanningService();
