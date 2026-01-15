
import { db } from "../server/db";
import { maintWorkOrders, maintWorkOrderCosts, glJournals, faAssets } from "@shared/schema";
import { eq } from "drizzle-orm";
import { maintenanceService } from "../server/services/MaintenanceService";
import { maintenanceCostingService } from "../server/services/MaintenanceCostingService";
import { maintenanceAccountingService } from "../server/services/MaintenanceAccountingService";

async function verifyAccountingFlow() {
    console.log("🛠️ Verifying Maintenance Accounting & GL Posting...");

    try {
        // 1. Setup: Get Asset & Create Work Order
        const asset = await db.query.faAssets.findFirst();
        if (!asset) throw new Error("No assets found. Run bootstrap_assets.");

        console.log("📝 Creating WO...");
        const wo = await maintenanceService.createWorkOrder({
            description: "GL Verification Order",
            assetId: asset.id,
            status: "IN_PROGRESS",
            priority: "URGENT"
        });


        // 2. Add Costs (Simulate)
        console.log("💰 Adding Costs...");
        // Material
        await db.insert(maintWorkOrderCosts).values({
            workOrderId: wo.id,
            costType: "MATERIAL",
            totalCost: "100.00",
            description: "Oil Filter"
        });
        // Labor
        await db.insert(maintWorkOrderCosts).values({
            workOrderId: wo.id,
            costType: "LABOR",
            totalCost: "250.00",
            description: "2.5 Hours Labor"
        });

        // 3. Post to GL
        console.log("📤 Posting to GL...");
        const result: any = await maintenanceAccountingService.postWorkOrderCosts(wo.id, "system-verifier");

        if (!result.success) throw new Error("Posting returned failed status: " + result.message);
        console.log(`✅ Posted! Journal ID: ${result.journalId}`);

        // 4. Verification Check
        // A. Check Costs updated
        const costs = await maintenanceCostingService.getWorkOrderCosts(wo.id);
        const unposted = costs.filter((c: any) => !c.glJournalId);
        if (unposted.length > 0) throw new Error("Some costs remain unposted!");

        // B. Check Journal Header
        const [journal] = await db.select().from(glJournals).where(eq(glJournals.id, result.journalId));
        if (!journal) throw new Error("Journal header not found in GL!");

        console.log(`✅ Journal Verified: ${journal.journalNumber} (${journal.totalDebit} DR)`);

        console.log("✨ Accounting Verification Passed!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyAccountingFlow();
