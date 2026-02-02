
import "dotenv/config";
import { db } from "../server/db";
import { PpmPlanningService } from "../server/services/PpmPlanningService";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems,
    ppmExpenditureTypes
} from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyPpmPlanning() {
    console.log("🔍 Starting PPM Phase 40 Planning Verification...");
    const planningService = new PpmPlanningService();

    // 1. Setup Project
    console.log("1. Setting up Test Project...");
    const projectNumber = `PROJ-PLAN-${Date.now()}`;
    const [project] = await db.insert(ppmProjects).values({
        projectNumber,
        name: `Planning Test Project ${projectNumber}`,
        projectType: "CAPITAL",
        status: "ACTIVE",
        startDate: new Date(),
        budget: "100000.00"
    }).returning();
    console.log(`   ✅ Project Created: ${project.name}`);

    const [task] = await db.insert(ppmTasks).values({
        projectId: project.id,
        taskNumber: "1.0",
        name: "Planning Task",
        startDate: new Date()
    }).returning();

    // Create Exp Type
    const [expType] = await db.insert(ppmExpenditureTypes).values({
        name: `Planning Type ${Date.now()}`,
        unitOfMeasure: "CURRENCY"
    }).returning();

    // 2. Create Budget
    console.log("2. Creating Budget Version...");
    const version = await planningService.createBudgetVersion(project.id, "Original V1", "Initial Budget");
    console.log(`   ✅ Version Created: ${version.versionName}`);

    // Add Lines ($10,000)
    await planningService.addBudgetLines(version.id, [
        { taskId: task.id, periodName: "Jan-26", amount: "10000.00" }
    ]);
    console.log("   ✅ Budget Line Added: $10,000");

    // Baseline
    await planningService.baselineBudget(version.id);
    console.log("   ✅ Budget Baselined");

    // 3. Set Control Rule
    console.log("3. Setting Control Rule (ABSOLUTE / PROJECT)...");
    await planningService.setControlRule(project.id, "ABSOLUTE", "PROJECT");
    console.log("   ✅ Rule Set");

    // 4. Test Funds Check (Scenario A: No Actuals)
    console.log("4. Testing Funds Check (Clean)...");
    const check1 = await planningService.checkFunds(project.id, 5000, task.id);
    if (check1.status === "PASS") {
        console.log(`   ✅ Check 1 (5000 vs 10000) PASSED. Available: ${check1.available}`);
    } else {
        console.error(`   ❌ Check 1 FAILED: ${check1.message}`);
        process.exit(1);
    }

    // 5. Insert Cost ($8,000)
    console.log("5. Inserting Actual Cost ($8,000)...");
    await db.insert(ppmExpenditureItems).values({
        projectId: project.id,
        taskId: task.id,
        expenditureTypeId: expType.id,
        expenditureItemDate: new Date(),
        quantity: "1",
        rawCost: "8000.00",
        burdenedCost: "8000.00",
        status: "COSTED",
        transactionSource: "Manual"
    });
    console.log("   ✅ Actual Cost Inserted");

    // 6. Test Funds Check (Scenario B: Partial Consumption)
    // Available = 10,000 - 8,000 = 2,000
    // Request = 1,000 (Should Pass)
    console.log("6. Testing Funds Check (Partial)...");
    const check2 = await planningService.checkFunds(project.id, 1000, task.id);
    if (check2.status === "PASS") {
        console.log(`   ✅ Check 2 (1000 vs 2000) PASSED. Available: ${check2.available}`);
    } else {
        console.error(`   ❌ Check 2 FAILED: ${check2.message}`);
    }

    // 7. Test Funds Check (Scenario C: Overspending)
    // Available = 2,000
    // Request = 3,000 (Should Fail)
    console.log("7. Testing Funds Check (Overspend)...");
    const check3 = await planningService.checkFunds(project.id, 3000, task.id);
    if (check3.status === "FAIL") {
        console.log(`   ✅ Check 3 (3000 vs 2000) FAILED (As Expected). Message: ${check3.message}`);
    } else {
        console.error(`   ❌ Check 3 PASSED INCORRECTLY: ${check3.status}`);
    }

    console.log("✅ Verification Complete.");
    process.exit(0);
}

verifyPpmPlanning().catch(err => {
    console.error("Verification Failed:", err);
    process.exit(1);
});
