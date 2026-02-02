
import { db } from "../server/db";
import { competitors, opportunityCompetitors, salesQuotas, users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifySalesPerformance() {
    console.log("🚀 Starting verification for Sales Performance (Phase 21.1)...");

    try {
        // 1. Verify Competitors
        console.log("\n--- Verifying Competitors ---");
        const compName = "Acme Corp Verify-" + Date.now();

        // Create
        const [newComp] = await db.insert(competitors).values({
            name: compName,
            website: "https://acme.com",
            strengths: "Fast delivery",
            weaknesses: "High price",
            threatLevel: "High"
        }).returning();
        console.log("✅ Created Competitor:", newComp.id, newComp.name);

        // Fetch
        const fetchedComp = await db.select().from(competitors).where(eq(competitors.id, newComp.id));
        if (fetchedComp.length !== 1) throw new Error("Failed to fetch created competitor");
        console.log("✅ Fetched Competitor");

        // 2. Verify Quotas
        console.log("\n--- Verifying Sales Quotas ---");
        const userId = "1"; // Assuming admin user exists or we just use ID 1
        const period = "Q1-2026-Verify";

        // Create Quota
        const [newQuota] = await db.insert(salesQuotas).values({
            userId,
            periodName: period,
            quotaAmount: "100000",
            currencyCode: "USD",
            targetType: "Revenue"
        }).returning();
        console.log("✅ Created Quota:", newQuota.id, newQuota.quotaAmount);

        // Fetch Quota
        const fetchedQuota = await db.select().from(salesQuotas).where(eq(salesQuotas.id, newQuota.id));
        if (fetchedQuota.length !== 1) throw new Error("Failed to fetch created quota");
        console.log("✅ Fetched Quota");

        // Cleanup
        console.log("\n--- Cleanup ---");
        await db.delete(competitors).where(eq(competitors.id, newComp.id));
        await db.delete(salesQuotas).where(eq(salesQuotas.id, newQuota.id));
        console.log("✅ Cleanup complete");

        console.log("\n🎉 Verification SUCCESS!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifySalesPerformance();
