
import "dotenv/config";
import { AnalyticsService } from "../server/services/AnalyticsService";

async function verifyAnalytics() {
    console.log("🚀 Starting verification for CRM Analytics (Phase 30)...");

    try {
        // 1. Pipeline Overview
        const pipeline = await AnalyticsService.getPipelineOverview();
        console.log(`✅ Pipeline Metrics: Retrieved ${pipeline.length} stages`);
        if (pipeline.length > 0) {
            console.log(`   Sample: ${pipeline[0].stage} - $${pipeline[0].totalValue}`);
        }

        // 2. Win Rate
        const winRate = await AnalyticsService.getWinRate();
        console.log(`✅ Win Rate: ${winRate.rate}% (Based on ${winRate.totalClosed} deals)`);

        // 3. Service Health
        const service = await AnalyticsService.getServiceHealth();
        console.log(`✅ Service Health: ${service.totalCases} Total Cases, ${service.slaCompliance}% Compliance`);

        // 4. Leaderboard
        const leaderboard = await AnalyticsService.getSalesLeaderboard();
        console.log(`✅ Sales Leaderboard: Top ${leaderboard.length} Reps`);
        if (leaderboard.length > 0) {
            console.log(`   Top Rep: ${leaderboard[0].name} - $${leaderboard[0].totalSales}`);
        }

        console.log("✅ Verification Passed");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyAnalytics();
