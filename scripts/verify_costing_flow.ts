
import { db } from "../server/db";
import { users, maintWorkOrders, maintWorkOrderMaterials, maintWorkOrderResources, maintWorkOrderCosts } from "@shared/schema";
import { eq } from "drizzle-orm";
import { maintenanceService } from "../server/services/MaintenanceService";
import { maintenanceCostingService } from "../server/services/MaintenanceCostingService";

async function verifyCostingFlow() {
    console.log("🛠️ Verifying Maintenance Costing Flow...");

    try {
        // 1. Setup User & Work Order (Reusing existing or creating new)
        let tech = await db.query.users.findFirst({ where: eq(users.email, "tech.john@example.com") });
        if (!tech) throw new Error("Test Technician not found. Run resource verification first.");

        // 1b. Find Exsting Asset
        const asset = await db.query.faAssets.findFirst();
        if (!asset) throw new Error("No Assets found in DB");

        console.log("📝 Creating Work Order for Costing Test...");
        const wo = await maintenanceService.createWorkOrder({
            description: "Costing Verification Order",
            assetId: asset.id,
            type: "CORRECTIVE",
            priority: "HI GH",
            status: "IN_PROGRESS"
        });

        console.log(`✅ Work Order Created: ${wo.workOrderNumber}`);

        // 2. Issue Material
        console.log("📦 Issuing Material...");

        // 2b. Find Inventory Item
        const item = await db.query.inventory.findFirst();
        if (!item) throw new Error("No Inventory items found in DB");

        // Ensure material req exists
        const [matReq] = await maintenanceService.addMaterialToWorkOrder(wo.id, {
            inventoryId: item.id,
            plannedQuantity: 5
        });


        // Issue it (Trigger Cost)
        await maintenanceService.issueMaterial(matReq.id);
        console.log("✅ Material Issued");

        // 3. Log Labor
        console.log("👷 Logging Labor...");
        const [resAssign] = await maintenanceService.assignTechnician(wo.id, { userId: tech.id, plannedHours: 4 });
        await maintenanceService.logLaborHours(resAssign.id, 2);
        console.log("✅ Labor Logged (2 hrs)");

        // 4. Verify Costs
        console.log("💰 Verifying Costs...");
        const costs = await maintenanceCostingService.getWorkOrderCosts(wo.id);

        console.table(costs.map(c => ({
            Type: c.costType,
            Desc: c.description,
            Qty: c.quantity,
            Unit: c.unitCost,
            Total: c.totalCost
        })));

        const summary = await maintenanceCostingService.getCostSummary(wo.id);
        console.log("📊 Cost Summary:", summary);

        if (summary.total > 0 && summary.material > 0 && summary.labor > 0) {
            console.log("✨ Costing Verification Passed!");
        } else {
            console.error("❌ Costing Verification Failed: Totals are zero or missing components.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyCostingFlow();
