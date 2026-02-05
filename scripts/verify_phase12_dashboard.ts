
import "dotenv/config";
import { dataQualityService } from "../server/services/DataQualityService";

async function verifyPhase12() {
    console.log("Starting MDM Phase 12 (Data Quality Dashboard) Verification...");

    try {
        console.log("\n[1] Fetching Dashboard Metrics...");
        const stats = await dataQualityService.getDashboardMetrics();
        console.log("   ✅ Received Stats:", stats);

        if (typeof stats.totalParties !== 'number') throw new Error("totalParties invalid");
        if (typeof stats.totalItems !== 'number') throw new Error("totalItems invalid");
        if (typeof stats.openDuplicateSets !== 'number') throw new Error("openDuplicateSets invalid");
        if (typeof stats.dataHealthScore !== 'number') throw new Error("dataHealthScore invalid");

        console.log("\n[2] Verifying Data Health Score Logic...");
        if (stats.dataHealthScore < 0 || stats.dataHealthScore > 100) {
            throw new Error(`Health Score ${stats.dataHealthScore} out of range (0-100)`);
        }
        console.log(`   ✅ Health Score (${stats.dataHealthScore}%) is within valid range.`);


    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

verifyPhase12();
