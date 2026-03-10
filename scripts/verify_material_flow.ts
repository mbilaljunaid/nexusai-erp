
import { db } from "../server/db";
import { maintenanceService } from "../server/modules/maintenance/services/MaintenanceService";
import { inventory, maintWorkOrderMaterials, maintWorkOrders, faAssets } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyMaterialFlow() {
    console.log("🛠️ Verifying Supply Chain (Material) Flow...");

    try {
        // 1. Create a Spare Part in Inventory
        let part = await db.query.inventory.findFirst({
            where: eq(inventory.itemName, "Test Bearing X1")
        });

        if (!part) {
            console.log("📦 Creating Test Part...");
            [part] = await db.insert(inventory).values({
                itemName: "Test Bearing X1",
                sku: "BRG-X1",
                quantity: 10,
                location: "Warehouse A"
            }).returning();
        }
        console.log(`✅ Using Part: ${part.itemName} (Qty: ${part.quantity})`);
        const initialQty = part.quantity || 0;

        // 2. Create a Work Order
        console.log("📝 Creating Work Order...");
        // Ensure Asset
        const asset = await db.query.faAssets.findFirst();

        const wo = await maintenanceService.createWorkOrder({
            description: "Replace Bearing",
            type: "CORRECTIVE",
            priority: "NORMAL",
            assetId: asset?.id || "unknown"
        });
        console.log(`✅ Work Order: ${wo.workOrderNumber}`);

        // 3. Add Material Requirement
        console.log("➕ Adding Material Requirement...");
        const [mat] = await maintenanceService.addMaterialToWorkOrder(wo.id, {
            inventoryId: part.id,
            plannedQuantity: 1
        });
        console.log(`✅ Material Added: Planned 1`);

        // 4. Issue Material
        console.log("🚚 Issuing Material...");
        await maintenanceService.issueMaterial(mat.id);
        console.log("✅ Material Issued");

        // 5. Verify Inventory Decrement
        const updatedPart = await db.query.inventory.findFirst({
            where: eq(inventory.id, part.id)
        });

        if (updatedPart?.quantity !== initialQty - 1) {
            throw new Error(`Inventory not decremented correctly. Expected ${initialQty - 1}, Got ${updatedPart?.quantity}`);
        }
        console.log(`✅ Inventory Decremented: ${initialQty} -> ${updatedPart.quantity}`);

        // 6. Verify Actuals Updated
        const updatedMat = await db.query.maintWorkOrderMaterials.findFirst({
            where: eq(maintWorkOrderMaterials.id, mat.id)
        });
        if (updatedMat?.actualQuantity !== 1) {
            throw new Error("Material Actuals not updated");
        }
        console.log("✅ Material Actuals Updated");

        console.log("✨ Supply Chain Integration Verified Successfully!");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verifyMaterialFlow();
