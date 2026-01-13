import { db } from "../server/db";
import { ppmService } from "../server/services/PpmService";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems, ppmCostDistributions,
    ppmExpenditureTypes, glCodeCombinations, glLedgers
} from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyPpmSubledger() {
    console.log("🚀 Starting PPM Subledger Foundation Verification...");

    try {
        // 1. Setup Master Ledger if not exists (Required for CCIDs)
        let [ledger] = await db.select().from(glLedgers).limit(1);
        if (!ledger) {
            console.log("   Seeding test ledger...");
            [ledger] = await db.insert(glLedgers).values({
                name: "PPM Verification Ledger",
                currencyCode: "USD",
                ledgerCategory: "PRIMARY"
            }).returning();
        }

        // 2. Ensure we have at least one CCID
        let [ccid] = await db.select().from(glCodeCombinations).limit(1);
        if (!ccid) {
            console.log("   Seeding test CCID...");
            [ccid] = await db.insert(glCodeCombinations).values({
                code: "PPM-DEFAULT-001",
                ledgerId: ledger.id,
                segment1: "01",
                segment2: "000",
                segment3: "5000"
            }).returning();
        }

        // 3. Create Project
        console.log("\n🧪 Testing Project Creation...");
        const project = await ppmService.createProject({
            projectNumber: `PRJ-PPM-${Date.now()}`,
            name: "PPM Foundation Implementation",
            projectType: "CAPITAL",
            startDate: new Date(),
            status: "ACTIVE"
        });
        console.log(`   ✅ Project Created: ${project.projectNumber} (${project.id})`);

        // 4. Create Task
        console.log("\n🧪 Testing Task Creation...");
        const task = await ppmService.createTask({
            projectId: project.id,
            taskNumber: "1.1",
            name: "Schema Design",
            startDate: new Date(),
            capitalizableFlag: true
        });
        console.log(`   ✅ Task Created: ${task.taskNumber} (${task.id})`);

        // 5. Create Expenditure Type
        console.log("\n🧪 Testing Expenditure Type Creation...");
        const expType = await ppmService.createExpenditureType(
            `Professional Services ${Date.now()}`,
            "Hours",
            "Consultancy time"
        );
        console.log(`   ✅ Expenditure Type Created: ${expType.name}`);

        // 6. Import Expenditure Item
        console.log("\n🧪 Testing Expenditure Item Import...");
        const items = await ppmService.importExpenditureItems([{
            taskId: task.id,
            expenditureTypeId: expType.id,
            expenditureItemDate: new Date(),
            quantity: "40.00",
            unitCost: "150.00",
            rawCost: "6000.00",
            transactionSource: "MANUAL",
            status: "UNCOSTED"
        }]);
        const expItem = items[0];
        console.log(`   ✅ Expenditure Item Imported: Raw Cost = ${expItem.rawCost}`);

        // 7. Calculate Burden
        console.log("\n🧪 Testing Burden Calculation...");
        const costedItem = await ppmService.calculateBurden(expItem.id, 0.2); // 20% Overhead
        console.log(`   ✅ Burden Calculated: Burdened Cost = ${costedItem?.burdenedCost}`);
        if (parseFloat(costedItem?.burdenedCost || "0") !== 7200) {
            throw new Error(`Burden mismatch. Expected 7200.00, got ${costedItem?.burdenedCost}`);
        }

        // 8. Generate Distributions
        console.log("\n🧪 Testing Cost Distribution...");
        const dist = await ppmService.generateDistributions(expItem.id, ccid.id, ccid.id);
        console.log(`   ✅ Distribution Created: Amount = ${dist.amount}, Status = ${dist.status}`);

        // 9. Final Verification
        const [finalItem] = await db.select().from(ppmExpenditureItems).where(eq(ppmExpenditureItems.id, expItem.id));
        console.log(`   ✅ Final Item Status: ${finalItem.status}`);
        if (finalItem.status !== "DISTRIBUTED") {
            throw new Error(`Status mismatch. Expected DISTRIBUTED, got ${finalItem.status}`);
        }

        console.log("\n✨ PPM Subledger Foundation Verified Successfully!");

    } catch (error: any) {
        console.error("\n❌ Verification Failed:", error.message || error);
        process.exit(1);
    }
}

verifyPpmSubledger();
