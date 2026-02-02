
import { db } from "../server/db";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems,
    inventory, inventoryTransactions
} from "../shared/schema/index";
import { ppmService } from "../server/services/PpmService";
import { eq } from "drizzle-orm";

async function verifyCrossCharge() {
    console.log("Starting Verification: PPM Cross-Charge (Inter-Project)...");

    try {
        // 1. Create Provider Project (Source of Cost)
        console.log("1. Creating Provider Project...");
        const providerProject = await ppmService.createProject({
            projectNumber: `PROV-PROJ-${Date.now()}`,
            name: "Provider Project (IT Shared Services)",
            projectType: "INDIRECT",
            startDate: new Date(),
            budget: "100000.00",
            status: "ACTIVE"
        });
        const providerTask = await ppmService.createTask({
            projectId: providerProject.id,
            taskNumber: "1.0",
            name: "IT Support",
            startDate: new Date(),
            billableFlag: false
        });
        console.log(`   Provider Task: ${providerTask.taskNumber}`);

        // 2. Create Receiver Project (Billable Client Project)
        console.log("2. Creating Receiver Project...");
        const receiverProject = await ppmService.createProject({
            projectNumber: `RCV-PROJ-${Date.now()}`,
            name: "Receiver Project (Client Implementation)",
            projectType: "CONTRACT",
            startDate: new Date(),
            budget: "200000.00",
            status: "ACTIVE"
        });
        const receiverTask = await ppmService.createTask({
            projectId: receiverProject.id,
            taskNumber: "99.0",
            name: "Cross-Charge In",
            startDate: new Date(),
            billableFlag: true,
            capitalizableFlag: false
        });
        console.log(`   Receiver Task: ${receiverTask.taskNumber}`);

        // 3. Create a Source Expenditure Item (e.g. Purchased Software License)
        console.log("3. Creating Source Expenditure Item (Provider)...");
        const [sourceItem] = await db.insert(ppmExpenditureItems).values({
            taskId: providerTask.id,
            expenditureTypeId: (await ppmService.createExpenditureType("Software", "Currency")).id,
            expenditureItemDate: new Date(),
            quantity: "1",
            unitCost: "500.00",
            rawCost: "500.00",
            transactionSource: "AP",
            denomCurrencyCode: "USD",
            status: "COSTED"
        }).returning();
        console.log(`   Source Item Created: $${sourceItem.rawCost} on Provider Project`);

        // 4. Perform Cross-Charge with 10% Markup
        console.log("4. Executing Cross-Charge (10% Markup)...");
        const rxItem = await ppmService.createCrossCharge(sourceItem.id, receiverTask.id, 0.10);

        // 5. Verify Receiver Item
        console.log("5. Verifying Receiver Expenditure Item...");
        console.log(`   ID: ${rxItem.id}`);
        console.log(`   Task ID: ${rxItem.taskId} (Expected: Receiver Task)`);
        console.log(`   Raw Cost: ${rxItem.rawCost} (Expected: 500 * 1.10 = 550.00)`);
        console.log(`   Source: ${rxItem.transactionSource}`);
        console.log(`   Ref: ${rxItem.transactionReference} (Expected: Source Item ID)`);

        if (rxItem.taskId === receiverTask.id && parseFloat(rxItem.rawCost) === 550.00) {
            console.log("   ✅ CROSS-CHARGE: Verified successfully!");
        } else {
            console.error("   ❌ CROSS-CHARGE: Verification Failed!");
        }

    } catch (error) {
        console.error("Verification Execption:", error);
    }
}

verifyCrossCharge();
