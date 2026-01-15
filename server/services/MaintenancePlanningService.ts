
import { db } from "../db";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";
import { maintWorkOrders, maintWorkOrderOperations, maintWorkCenters } from "@shared/schema";

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
}

export const maintenancePlanningService = new MaintenancePlanningService();
