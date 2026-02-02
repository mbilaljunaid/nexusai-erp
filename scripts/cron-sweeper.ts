// cron-sweeper.ts – schedules the autonomous sweep engine to run hourly
import cron from "node-cron";
import { runSweepEngine } from "../scripts/sweeper_job";

// Schedule: every hour at minute 0
cron.schedule("0 * * * *", async () => {
    console.log("[Cron] Running autonomous sweep engine...");
    try {
        await runSweepEngine();
        console.log("[Cron] Sweep completed successfully.");
    } catch (err) {
        console.error("[Cron] Sweep failed:", err);
    }
});

console.log("Cron scheduler for sweep engine initialized (hourly).");
