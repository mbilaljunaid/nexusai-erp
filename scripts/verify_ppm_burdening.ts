import { db } from "../server/db";
import { ppmService } from "../server/services/PpmService";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems,
    ppmBurdenSchedules, ppmBurdenRules, ppmExpenditureTypes
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function verifyPpmBurdening() {
    console.log("🚀 Starting PPM Burdening Engine Verification...");

    try {
        // 1. Setup Expenditure Type
        console.log("\n🧪 Step 1: Setting up Expenditure Type...");
        let [expType] = await db.select().from(ppmExpenditureTypes).where(eq(ppmExpenditureTypes.name, "Labor - Senior Consultant")).limit(1);
        if (!expType) {
            expType = await ppmService.createExpenditureType("Labor - Senior Consultant", "Hours", "Professional labor costing");
        }
        console.log(`   ✅ Expenditure Type: ${expType.name}`);

        // 2. Setup Burden Schedule & Rules
        console.log("\n🧪 Step 2: Creating Burden Schedule & Rules...");
        const schedule = await ppmService.createBurdenSchedule({
            name: `Std Corporate Burden - ${Date.now()}`,
            description: "Standard corporate overhead (20% Fringe + 10% G&A)"
        });

        const rule = await ppmService.addBurdenRule({
            scheduleId: schedule.id,
            expenditureTypeId: expType.id,
            multiplier: "0.3000", // 30% total burden
            precedence: 1
        });
        console.log(`   ✅ Schedule: ${schedule.name}, Multiplier: 30%`);

        // 3. Setup Project with Schedule
        console.log("\n🧪 Step 3: Setting up Project with default Burden Schedule...");
        const project = await ppmService.createProject({
            projectNumber: `PRJ-BRD-${Date.now()}`,
            name: "Burdening Test Project",
            projectType: "CONTRACT",
            startDate: new Date(),
            burdenScheduleId: schedule.id,
            status: "ACTIVE"
        });

        // 4. Test Scenario A: Project Level Inheritance
        console.log("\n🧪 Step 4: Testing Project Level Burden Inheritance...");
        const taskA = await ppmService.createTask({
            projectId: project.id,
            taskNumber: "TA",
            name: "Default Burden Task",
            startDate: new Date(),
            chargeableFlag: true
        });

        const [itemA] = await ppmService.importExpenditureItems([{
            taskId: taskA.id,
            expenditureTypeId: expType.id,
            expenditureItemDate: new Date(),
            quantity: "1.00",
            rawCost: "100.0000",
            transactionSource: "TIME",
            status: "UNCOSTED"
        }]);

        const costedA = await ppmService.applyBurdening(itemA.id);
        console.log(`   ✅ Raw: ${itemA.rawCost}, Burdened: ${costedA.burdenedCost}`);

        if (parseFloat(costedA.burdenedCost!) !== 130.00) {
            throw new Error(`Scenario A Failure: Expected 130.00, got ${costedA.burdenedCost}`);
        }

        // 5. Test Scenario B: Task Level Override
        console.log("\n🧪 Step 5: Testing Task Level Burden Override...");
        // Create second schedule with 50% burden
        const scheduleB = await ppmService.createBurdenSchedule({
            name: `High Overhead - ${Date.now()}`,
            description: "Project specific high overhead"
        });
        await ppmService.addBurdenRule({
            scheduleId: scheduleB.id,
            expenditureTypeId: expType.id,
            multiplier: "0.5000",
            precedence: 1
        });

        const taskB = await ppmService.createTask({
            projectId: project.id,
            taskNumber: "TB",
            name: "Override Burden Task",
            startDate: new Date(),
            chargeableFlag: true,
            burdenScheduleId: scheduleB.id // Override project default
        });

        const [itemB] = await ppmService.importExpenditureItems([{
            taskId: taskB.id,
            expenditureTypeId: expType.id,
            expenditureItemDate: new Date(),
            quantity: "1.00",
            rawCost: "100.0000",
            transactionSource: "TIME",
            status: "UNCOSTED"
        }]);

        const costedB = await ppmService.applyBurdening(itemB.id);
        console.log(`   ✅ Raw: ${itemB.rawCost}, Burdened: ${costedB.burdenedCost} (Override applied)`);

        if (parseFloat(costedB.burdenedCost!) !== 150.00) {
            throw new Error(`Scenario B Failure: Expected 150.00, got ${costedB.burdenedCost}`);
        }

        console.log("\n✨ PPM Burdening Engine Verified Successfully!");
        process.exit(0);

    } catch (error: any) {
        console.error("\n❌ Verification Failed:", error.message || error);
        process.exit(1);
    }
}

verifyPpmBurdening();
