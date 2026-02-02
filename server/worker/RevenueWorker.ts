
import { db } from "../db";
import { arRevenueSchedules } from "@shared/schema";
import { eq, and, lte } from "drizzle-orm";
import { arService } from "../services/ar";

export class RevenueWorker {
    /**
     * Sweeps all pending revenue schedules up to the given date (end of period).
     * @param periodEndDate Date up to which revenue should be recognized.
     */
    static async processMonthlySweep(periodEndDate: Date) {
        console.log(`[RevenueWorker] Starting sweep for period ending: ${periodEndDate.toISOString()}`);

        try {
            // 1. Find Pending Schedules
            const pending = await db.select()
                .from(arRevenueSchedules)
                .where(and(
                    eq(arRevenueSchedules.status, "Pending"),
                    lte(arRevenueSchedules.scheduleDate, periodEndDate)
                ));

            console.log(`[RevenueWorker] Found ${pending.length} pending schedules.`);

            let processed = 0;
            let errors = 0;

            // 2. Process Sync (or batch async if volume is huge, for now specific calls)
            // Note: recognizeRevenue handles DB update and SLA trigger
            for (const schedule of pending) {
                try {
                    await arService.recognizeRevenue(schedule.id.toString());
                    processed++;
                } catch (err) {
                    console.error(`[RevenueWorker] Failed to process schedule ${schedule.id}:`, err);
                    errors++;
                }
            }

            console.log(`[RevenueWorker] Sweep Complete. Processed: ${processed}, Errors: ${errors}`);
            return { processed, errors };

        } catch (err) {
            console.error("[RevenueWorker] Sweep Critical Failure:", err);
            throw err;
        }
    }
}
