
import { db } from "../server/db";
import { maintWorkOrders, maintWorkOrderMaterials, inventory, purchaseRequisitions, purchaseRequisitionLines } from "../shared/schema/index";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("🔍 Verifying Direct Procurement Step 2...");

    // 1. Ensure an Inventory Item exists
    let [item] = await db.select().from(inventory).limit(1);
    if (!item) {
        console.log("🌱 Creating seed inventory item...");
        [item] = await db.insert(inventory).values({
            itemName: "Critical Hub Bearing",
            sku: "HUB-BRG-001",
            quantity: 0
        }).returning();
    }

    // 2. Ensure a Work Order exists
    let [wo] = await db.select().from(maintWorkOrders).limit(1);
    if (!wo) {
        console.error("❌ No work orders found. Run previous seeds.");
        process.exit(1);
    }

    // 3. Create a material requirement
    console.log("📦 Creating material requirement for WO...");
    const [mat] = await db.insert(maintWorkOrderMaterials).values({
        workOrderId: wo.id,
        inventoryId: item.id,
        plannedQuantity: 2
    }).returning();

    // 4. Simulate Raise PR API
    console.log(`🛒 Raising PR for Material Requirement ID: ${mat.id}`);

    // We could use fetch, but testing service logic directly is safer for environment variations
    const { maintenanceSCMService } = await import("../server/services/MaintenanceSCMService");
    const result = await maintenanceSCMService.raisePRForMaterial(mat.id);

    console.log(`✅ PR Created: ${result.pr.requisitionNumber}`);
    console.log(`✅ PR Line Created: ID ${result.prLine.id}`);

    // 5. Verify Database Links
    const [updatedMat] = await db.select().from(maintWorkOrderMaterials).where(eq(maintWorkOrderMaterials.id, mat.id));

    if (updatedMat.purchaseRequisitionLineId === result.prLine.id) {
        console.log("✨ Verification Successful: Material Requirement linked to PR Line.");
    } else {
        console.error("❌ Verification Failed: Data mismatch.");
        process.exit(1);
    }

    // Check if PR exists in DB
    const [dbPr] = await db.select().from(purchaseRequisitions).where(eq(purchaseRequisitions.id, result.pr.id));
    if (dbPr) {
        console.log(`✨ Requisition ${dbPr.requisitionNumber} exists in database.`);
    }

    process.exit(0);
}

verify();
