
import { db } from "../server/db";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems,
    inventory, inventoryTransactions
} from "../shared/schema/index";
import { ppmService } from "../server/services/PpmService";
import { eq, desc } from "drizzle-orm";

async function verifyInventoryIntegration() {
    console.log("Starting Verification: PPM Inventory Integration (Issue-to-Project)...");

    try {
        // 1. Create a Test Project & Task
        console.log("1. Creating Test Project...");
        const project = await ppmService.createProject({
            projectNumber: `INV-PROJ-${Date.now()}`,
            name: "Inventory Integration Test Project",
            projectType: "CAPITAL",
            startDate: new Date(),
            budget: "10000.00",
            status: "ACTIVE"
        });
        console.log(`   Project Created: ${project.projectNumber}`);

        const task = await ppmService.createTask({
            projectId: project.id,
            taskNumber: "1.0",
            name: "Construction Phase",
            startDate: new Date(),
            chargeableFlag: true,
            billableFlag: false
        });
        console.log(`   Task Created: ${task.taskNumber}`);

        // 2. Create an Inventory Item
        console.log("2. Creating Inventory Item...");
        const [item] = await db.insert(inventory).values({
            itemName: "Steel Beam",
            sku: `ST-BEAM-${Date.now()}`,
            quantity: 100,
            location: "Warehouse A"
        }).returning();
        console.log(`   Item Created: ${item.itemName} (ID: ${item.id})`);

        // 3. Create an Inventory Issue Transaction linked to Project
        console.log("3. Issuing Inventory to Project...");
        const [trx] = await db.insert(inventoryTransactions).values({
            inventoryId: item.id,
            transactionType: "ISSUE",
            quantity: 5,
            projectId: project.id,
            taskId: task.id,
            cost: "250.00", // Unit cost
            referenceNumber: "REQ-001"
        }).returning();
        console.log(`   Transaction Created: Type=${trx.transactionType}, Qty=${trx.quantity}, Cost=${trx.cost}`);

        // 4. Run Cost Collector
        console.log("4. Running PpmService.collectFromInventory()...");
        const collectedItems = await ppmService.collectFromInventory();
        console.log(`   Collector finished. Items collected: ${collectedItems.length}`);

        // 5. Verify Expenditure Item
        if (collectedItems.length > 0) {
            const expItem = collectedItems.find(i => i.transactionReference === trx.id);
            if (expItem) {
                console.log("   ✅ SUCCESS: Expenditure Item created!");
                console.log(`      ID: ${expItem.id}`);
                console.log(`      Exp Type ID: ${expItem.expenditureTypeId}`);
                console.log(`      Quantity: ${expItem.quantity}`);
                console.log(`      Raw Cost: ${expItem.rawCost} (Expected: 5 * 250 = 1250)`);
                console.log(`      Source: ${expItem.transactionSource}`);

                if (parseFloat(expItem.rawCost) === 1250.00) {
                    console.log("   ✅ COST CALCULATION: Verified");
                } else {
                    console.error("   ❌ COST CALCULATION: Mismatch");
                }
            } else {
                console.error("   ❌ FAILURE: Specific transaction not collected.");
            }
        } else {
            console.error("   ❌ FAILURE: No items collected.");
        }

    } catch (error) {
        console.error("Verification Execption:", error);
    }
}

verifyInventoryIntegration();
