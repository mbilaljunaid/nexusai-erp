
import { db } from "../db";
import { wmsZones, wmsTasks, inventory, inventoryTransactions } from "../shared/schema/scm";
import { eq } from "drizzle-orm";
import { wmsTaskService } from "../server/modules/inventory/wms-task.service";

async function verifyWmsFoundation() {
    console.log("Starting WMS Foundation Verification...");

    try {
        // 1. Create a Test Zone
        console.log("1. Creating Test Zone...");
        const [zone] = await db.insert(wmsZones).values({
            warehouseId: "ORG-001",
            zoneCode: "STORAGE-A",
            zoneName: "Main Storage A",
            zoneType: "STORAGE"
        }).returning();
        console.log("   ✅ Zone Created:", zone.id);

        // 2. Create a Test Task (Mocking a Pick)
        console.log("2. Creating Test PICK Task...");
        // Create dummy item if needed, but we'll use a placeholder ID "ITEM-001" for speed (FKs might fail if enforced, let's assume UUID/Strings)
        // Actually, scm.ts uses randomized UUIDs. We might need a real item ID.
        // Let's create a dummy inventory item first.
        const [item] = await db.insert(inventory).values({
            itemName: "Test WMS Widget",
            sku: "WMS-TEST-" + Date.now(),
            quantity: 100
        }).returning();

        const task = await wmsTaskService.createTask({
            warehouseId: "ORG-001",
            taskType: "PICK",
            taskNumber: "TSK-" + Date.now(),
            itemId: item.id,
            quantityPlanned: "10",
            fromLocatorId: "LOC-A1",
            toLocatorId: "STAGING",
            status: "PENDING"
        });
        console.log("   ✅ Task Created:", task.id, task.taskNumber);

        // 3. List Tasks
        console.log("3. Listing Tasks...");
        const tasks = await wmsTaskService.listTasks({ warehouseId: "ORG-001" });
        if (tasks.find(t => t.id === task.id)) {
            console.log("   ✅ Task found in list.");
        } else {
            console.error("   ❌ Task NOT found in list.");
        }

        // 4. Complete Task
        console.log("4. Completing Task...");
        const completedTask = await wmsTaskService.completeTask(task.id, "USER-TEST", 10);
        console.log("   ✅ Task Completed Status:", completedTask.status);

        if (completedTask.status !== "COMPLETED") throw new Error("Task status update failed");

        // 5. Verify Inventory Transaction
        console.log("5. Verifying Inventory Transaction...");
        const [txn] = await db.select().from(inventoryTransactions).where(eq(inventoryTransactions.referenceNumber, task.taskNumber));
        if (txn) {
            console.log("   ✅ Inventory Transaction found:", txn.id, txn.quantity);
        } else {
            throw new Error("Inventory Transaction NOT created");
        }

        console.log("✅ WMS Foundation Verification PASSED");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyWmsFoundation();
