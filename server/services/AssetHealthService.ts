
import { db } from "../db";
import { maintWorkOrders, maintWorkOrderOperations } from "../../shared/schema/index";
import { eq, and, avg, count, sum, sql } from "drizzle-orm";

/**
 * Asset Health & Reliability Service
 * Calculates MTBF, MTTR and Health Scores.
 */
class AssetHealthService {

    /**
     * Calculate Reliability KPIs for an Asset
     */
    async getAssetHealth(assetId: string) {
        // 1. Fetch Completed Corrective Work Orders (Failures)
        const correctiveWos = await db.select().from(maintWorkOrders)
            .where(and(
                eq(maintWorkOrders.assetId, assetId),
                eq(maintWorkOrders.type, "CORRECTIVE"),
                eq(maintWorkOrders.status, "COMPLETED")
            ));

        const failureCount = correctiveWos.length;

        if (failureCount === 0) {
            return {
                healthScore: 100,
                mtbfHours: null,
                mttrHours: null,
                availability: 100,
                totalFailures: 0,
                status: "EXCELLENT"
            };
        }

        // 2. MTTR (Mean Time To Repair)
        // Average of (Actual Completion - Actual Start) for corrective WOs
        let totalRepairTimeMs = 0;
        correctiveWos.forEach(wo => {
            if (wo.actualCompletionDate && wo.actualStartDate) {
                totalRepairTimeMs += new Date(wo.actualCompletionDate).getTime() - new Date(wo.actualStartDate).getTime();
            }
        });

        const mttrHours = (totalRepairTimeMs / (1000 * 60 * 60)) / failureCount;

        // 3. MTBF (Mean Time Between Failures)
        // Simplification: (Total Time in Period - Total Down Time) / Failures
        // For MVP: (Time from first failure to now) / failureCount
        const firstFailureDate = new Date(correctiveWos[correctiveWos.length - 1].createdAt || new Date());
        const totalDurationMs = Date.now() - firstFailureDate.getTime();
        const totalDurationHours = totalDurationMs / (1000 * 60 * 60);

        const mtbfHours = totalDurationHours / failureCount;

        // 4. Availability = MTBF / (MTBF + MTTR)
        const availability = (mtbfHours / (mtbfHours + mttrHours)) * 100;

        // 5. Health Score (Weighted)
        // More failures = lower score. Long MTTR = lower score.
        let healthScore = availability;
        if (failureCount > 5) healthScore -= 5;
        if (failureCount > 10) healthScore -= 10;

        return {
            healthScore: Math.max(0, Math.min(100, Math.round(healthScore))),
            mtbfHours: Math.round(mtbfHours * 10) / 10,
            mttrHours: Math.round(mttrHours * 10) / 10,
            availability: Math.round(availability * 10) / 10,
            totalFailures: failureCount,
            status: healthScore > 90 ? "EXCELLENT" : healthScore > 75 ? "GOOD" : healthScore > 50 ? "WARNING" : "CRITICAL"
        };
    }
}

export const assetHealthService = new AssetHealthService();
