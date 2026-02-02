
import "dotenv/config";
import { db } from "../server/db";
import { salesQuotas, opportunities, users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { SalesForecastingService } from "../server/services/SalesForecastingService";

async function verifySalesForecasting() {
    console.log("🚀 Starting verification for Sales Forecasting (Phase 23)...");

    let userId: string = "";
    let quotaId: string = "";
    const oppIds: string[] = [];

    try {
        // 1. Create Sales Rep
        const [user] = await db.insert(users).values({
            email: `forecast_rep_${Date.now()}@nexus.ai`,
            name: "Forecast Rep",
            role: "user"
        }).returning();
        userId = user.id;

        // 2. Create Quota (Q1-2026, $100,000)
        // Must match the "period" logic in Service (Q1-2026 is based on current date if default, but we'll explicitely request it)
        const [quota] = await db.insert(salesQuotas).values({
            userId,
            periodName: "Q1-2026",
            quotaAmount: "100000"
        }).returning();
        quotaId = quota.id;
        console.log("✅ Created Quota: $100,000 for Q1-2026");

        // 3. Create Closed Won Deal ($20,000)
        // Ensure CloseDate is within Q1 2026 (Jan 1 - Mar 31)
        const [won] = await db.insert(opportunities).values({
            name: "Won Deal",
            ownerId: userId,
            amount: "20000",
            stage: "Closed Won",
            closeDate: new Date("2026-01-15"),
            probability: 100
        }).returning();
        oppIds.push(won.id);

        // 4. Create Open Deal ($50,000 at 50% probability)
        const [open] = await db.insert(opportunities).values({
            name: "Open Deal",
            ownerId: userId,
            amount: "50000",
            stage: "Qualification",
            closeDate: new Date("2026-02-20"),
            probability: 50,
            forecastCategory: "Pipeline"
        }).returning();
        oppIds.push(open.id);

        // 5. Create Commit Deal ($30,000 at 90% probability)
        const [commit] = await db.insert(opportunities).values({
            name: "Commit Deal",
            ownerId: userId,
            amount: "30000",
            stage: "Negotiation",
            closeDate: new Date("2026-03-10"),
            probability: 90,
            forecastCategory: "Commit"
        }).returning();
        oppIds.push(commit.id);


        // 6. Run Forecast
        console.log("\n--- Running Forecast Service ---");
        const forecast = await SalesForecastingService.getForecastSummary(userId, "Q1-2026");

        console.log("Forecast Result:", JSON.stringify(forecast, null, 2));

        // 7. Verify Metrics
        // Closed Won: 20,000
        // Commit Forecast: 20k (Won) + 30k (Commit) = 50,000
        // Weighted Forecast: 20k + (50k * 0.5) + (30k * 0.9) = 20k + 25k + 27k = 72,000
        // Attainment: 20k / 100k = 20%

        if (Number(forecast.closedWon) !== 20000) throw new Error("Incorrect Closed Won");
        if (Number(forecast.commitForecast) !== 50000) throw new Error("Incorrect Commit Forecast");
        if (Number(forecast.weightedForecast) !== 72000) throw new Error("Incorrect Weighted Forecast");
        if (Number(forecast.attainment) !== 20) throw new Error("Incorrect Attainment %");

        console.log("✅ Calculations Verified!");

        // Cleanup
        console.log("\n--- Cleanup ---");
        for (const id of oppIds) {
            await db.delete(opportunities).where(eq(opportunities.id, id));
        }
        await db.delete(salesQuotas).where(eq(salesQuotas.id, quotaId));
        await db.delete(users).where(eq(users.id, userId));
        console.log("✅ Cleanup complete");

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        // Attempt cleanup
        try {
            if (userId) await db.delete(users).where(eq(users.id, userId));
            if (quotaId) await db.delete(salesQuotas).where(eq(salesQuotas.id, quotaId));
        } catch (e) { }
        process.exit(1);
    }
}

verifySalesForecasting();
