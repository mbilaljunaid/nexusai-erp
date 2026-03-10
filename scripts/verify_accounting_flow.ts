import { db } from "../server/db";
import { maintWorkOrders, maintWorkOrderCosts, glJournals, faAssets } from "@shared/schema";
import { eq } from "drizzle-orm";
import { maintenanceService } from "../server/modules/maintenance/services/MaintenanceService";

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
        await db.insert(maintWorkOrderCosts).values({
            workOrderId: wo.id,
            costType: "MATERIAL",
            totalCost: "100.00",
            description: "Oil Filter"
        } as any);
        await db.insert(maintWorkOrderCosts).values({
            workOrderId: wo.id,
            costType: "LABOR",
            totalCost: "250.00",
            description: "2.5 Hours Labor"
        } as any);

        // 3. Post to GL
        console.log("📤 Posting to GL...");
        // Note: MaintenanceAccountingService and MaintenanceCostingService modules need to be created
        // Placeholder verification
        console.log("⚠️ Skipping GL posting - accounting services not yet available");

        console.log("✨ Accounting Verification Partially Completed.");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyAccountingFlow();
