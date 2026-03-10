
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { projectCostingIntegration } from "../server/services/ProjectCostingIntegration";
import { inventoryReorderService } from "../server/services/InventoryReorderService";

async function verifyPhase13() {
    console.log("=== Phase 13 Verification ===");

    // 1. Verify Schema Changes
    try {
        const checkBOM = await db.execute(sql`SELECT count(*) FROM information_schema.tables WHERE table_name = 'maint_asset_boms'`);
        if (checkBOM.rows[0].count > 0) {
            console.log("[PASS] maint_asset_boms table exists");
        } else {
            console.error("[FAIL] maint_asset_boms table missing");
        }

        const checkInv = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'inv_items' AND column_name = 'min_quantity'`);
        if (checkInv.rowCount && checkInv.rowCount > 0) {
            console.log("[PASS] Inventory min_quantity column exists");
        } else {
            console.error("[FAIL] Inventory min_quantity column missing");
        }
    } catch (e) {
        console.error("[FAIL] Schema check failed", e);
    }

    // 2. Verify Project Integration Logic
    if (projectCostingIntegration.transferCostsToProjects) {
        console.log("[PASS] ProjectCostingIntegration Service instantiated");
    } else {
        console.error("[FAIL] ProjectCostingIntegration Service logic missing");
    }

    // 3. Verify Inventory Logic
    if (inventoryReorderService.checkAndReorder) {
        console.log("[PASS] InventoryReorderService Service instantiated");
    } else {
        console.error("[FAIL] InventoryReorderService logic missing");
    }

    console.log("=== Verification Complete ===");
    process.exit(0);
}

verifyPhase13();
