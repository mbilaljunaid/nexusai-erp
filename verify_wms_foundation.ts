
import "dotenv/config";
import { db } from "./server/db";
import { wmsZones, wmsTasks, inventory, inventoryTransactions, inventoryOrganizations } from "./shared/schema/scm";
import { eq } from "drizzle-orm";
import { wmsTaskService } from "./server/modules/inventory/wms-task.service";

async function verifyWmsFoundation() {
    console.log("Starting WMS Foundation Verification...");

    try {
        // 0. Ensure Organization Exists
        console.log("0. Checking/Creating Organization...");
        let [org] = await db.select().from(inventoryOrganizations).where(eq(inventoryOrganizations.code, "ORG-001"));
        if (!org) {
            [org] = await db.insert(inventoryOrganizations).values({
                code: "ORG-001",
                name: "Main Distribution Center"
            }).returning();
            console.log("   ✅ Created ORG-001");
        } else {
            console.log("   ℹ️ Found existing ORG-001");
        }

        // 1. Create a Test Zone
        console.log("1. Creating Test Zone...");
        // Zone uses warehouseId (string), check if it maps to Org ID or Code? scm says "warehouseId".
        // Usually code or ID. task service uses it directly.
        // We'll use Org ID to be safe if it's a FK (it's not enforcing in scm.ts).
        const [zone] = await db.insert(wmsZones).values({
            warehouseId: org.id,
            zoneCode: "STORAGE-A",
            zoneName: "Main Storage A",
            zoneType: "STORAGE"
        }).returning();
        console.log("   ✅ Zone Created:", zone.id);

        // 2. Create a Test Task (Mocking a Pick)
        console.log("2. Creating Test PICK Task...");

        // Create dummy item
        // Use proper columns for inv_items
        const [item] = await db.insert(inventory).values({
            itemNumber: "WMS-TEST-" + Date.now(),
            description: "Test WMS Widget",
            organizationId: org.id,
            quantityOnHand: "100"
        }).returning();

        const task = await wmsTaskService.createTask({
            warehouseId: org.id,
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
        const tasks = await wmsTaskService.listTasks({ warehouseId: org.id });
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
        // reference column 
        const [txn] = await db.select().from(inventoryTransactions).where(eq(inventoryTransactions.reference, task.taskNumber));
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
