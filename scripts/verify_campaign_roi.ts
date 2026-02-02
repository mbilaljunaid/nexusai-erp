
import { db } from "../server/db";
import { campaigns, opportunities, users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { CampaignService } from "../server/services/CampaignService";

async function verifyCampaignROI() {
    console.log("🚀 Starting verification for Campaign ROI (Phase 24)...");

    let campaignId: string = "";
    let oppId: string = "";

    try {
        // 1. Create Campaign (Cost: $1,000)
        const [camp] = await db.insert(campaigns).values({
            name: "ROI Test Campaign",
            type: "Email",
            status: "In Progress",
            budgetedCost: "1000",
            actualCost: "1000",
            isActive: 1
        }).returning();
        campaignId = camp.id;
        console.log("✅ Created Campaign: Cost $1,000");

        // 2. Create Opportunity (Revenue: $5,000) linked to Campaign
        const [opp] = await db.insert(opportunities).values({
            name: "Campaign Deal",
            amount: "5000",
            stage: "Closed Won",
            campaignId: campaignId,
            closeDate: new Date(),
            probability: 100
        }).returning();
        oppId = opp.id;
        console.log("✅ Created Won Opportunity: Value $5,000");

        // 3. Verify Stats
        console.log("\n--- Calculating Stats ---");
        const { stats } = await CampaignService.getCampaignStats(campaignId);

        console.log("Stats Result:", JSON.stringify(stats, null, 2));

        // ROI = (5000 - 1000) / 1000 * 100 = 400%
        if (stats.roi !== 400) throw new Error(`Incorrect ROI. Expected 400, got ${stats.roi}`);
        if (stats.totalRevenue !== 5000) throw new Error("Incorrect Revenue");
        if (stats.wonDeals !== 1) throw new Error("Incorrect Won Deals Count");

        console.log("✅ ROI Calculation Verified!");

        // Cleanup
        console.log("\n--- Cleanup ---");
        await db.delete(opportunities).where(eq(opportunities.id, oppId));
        await db.delete(campaigns).where(eq(campaigns.id, campaignId));
        console.log("✅ Cleanup complete");

        process.exit(0);

    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        try {
            if (oppId) await db.delete(opportunities).where(eq(opportunities.id, oppId));
            if (campaignId) await db.delete(campaigns).where(eq(campaigns.id, campaignId));
        } catch (e) { }
        process.exit(1);
    }
}

verifyCampaignROI();
