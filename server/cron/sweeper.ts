
import cron from "node-cron";
import { cashService } from "../services/cash.service";
import { logger } from "../logging/logger";

/**
 * Autonomous Sweep Engine
 * Schedules the ZBA sweep to run every hour at minute 0.
 */
export function initCronJobs() {
    logger.info("[Cron] Initializing Autonomous Sweep Engine...");

    // Schedule: every hour at minute 0
    cron.schedule("0 * * * *", async () => {
        logger.info("[Cron] Running autonomous sweep engine...");
        try {
            // Fetch ZBA structures pending sweep
            const pendingZbas = await cashService.getPendingZbaStructures();
            for (const zba of pendingZbas) {
                await cashService.sweepZba(zba.id);
                logger.info(`[Cron] Swept ZBA id=${zba.id}`);
            }
            logger.info("[Cron] Sweep completed successfully.");
        } catch (err) {
            logger.error("[Cron] Sweep failed:", err);
        }
    });
}
