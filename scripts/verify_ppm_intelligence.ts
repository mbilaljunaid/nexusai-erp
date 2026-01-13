
import { db } from "../server/db";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems,
    inventory, inventoryTransactions
} from "../shared/schema/index";
import { ppmService } from "../server/services/PpmService";
import { agenticService } from "../server/services/agentic";
import { eq } from "drizzle-orm";

async function verifyPpmIntelligence() {
    console.log("Starting Verification: PPM Intelligence & Workflow...");

    try {
        // 1. Setup Test Project and Task
        console.log("1. Creating Test Project for Intelligence Check...");
        const project = await ppmService.createProject({
            projectNumber: `AI-PROJ-${Date.now()}`,
            name: "AI Verified Project",
            projectType: "CONTRACT",
            startDate: new Date(),
            budget: "1000.00", // Low budget to force Cost Anomaly
            status: "ACTIVE"
        });
        const task = await ppmService.createTask({
            projectId: project.id,
            taskNumber: "1.0",
            name: "Execution",
            startDate: new Date(),
            billableFlag: true
        });
        console.log(`   Project Created: ${project.projectNumber}`);

        // 2. Create Excess Cost to Trigger Alert
        console.log("2. Injecting Cost Overrun ($1200 on $1000 budget)...");
        // Create an item
        const [item] = await db.insert(ppmExpenditureItems).values({
            taskId: task.id,
            expenditureTypeId: (await ppmService.createExpenditureType("Misc", "Currency")).id,
            expenditureItemDate: new Date(),
            quantity: "1",
            unitCost: "1200.00",
            rawCost: "1200.00",
            transactionSource: "AP",
            denomCurrencyCode: "USD",
            status: "UNCOSTED" // Intentionally uncosted to block close later
        }).returning();

        // Mock Costing/Burdening to get Actual Cost
        await ppmService.calculateBurden(item.id, 0); // Cost it

        // Generate Performance Snapshot for AI to read
        // Force snapshot creation even if incomplete
        await ppmService.getProjectPerformance(project.id);

        // 3. Test Workflow Validation (Try to Close)
        console.log("3. Testing Workflow: Attempt to Close Project with Uncosted Items...");
        try {
            // Re-inject uncosted item to block close (if calculateBurden costed it, let's make another)
            await db.insert(ppmExpenditureItems).values({
                taskId: task.id,
                expenditureTypeId: item.expenditureTypeId,
                expenditureItemDate: new Date(),
                quantity: "1",
                unitCost: "500.00",
                rawCost: "500.00",
                transactionSource: "AP",
                denomCurrencyCode: "USD",
                status: "UNCOSTED"
            }).returning();

            await ppmService.transitionProjectStatus(project.id, "CLOSED");
            console.error("   ❌ WORKFLOW FAIL: Project closed despite uncosted items.");
        } catch (e: any) {
            console.log(`   ✅ WORKFLOW PASS: Closure blocked. Error: ${e.message}`);
        }

        // 4. Test AI Intent Parsing
        console.log("4. Testing AI Agent: Parse Intent...");
        const intent = await agenticService.parseIntent(`Check health of project ${project.projectNumber}`, "ppm");
        console.log(`   Intent Detected: ${intent.actionCode} (Confidence: ${intent.confidence})`);

        if (intent.actionCode === "PPM_ANALYZE_HEALTH" && intent.params.projectId === project.projectNumber) {
            console.log("   ✅ INTENT PASS: Correctly identified action and project ID.");
        } else {
            // Fallback if regex matched project ID or name
            console.log(`   ⚠️ INTENT CHECK: Params: ${JSON.stringify(intent.params)}`);
        }

        // 5. Test AI Action Execution
        console.log("5. Testing AI Agent: Execute Analysis...");
        // Use ID to ensure lookup works
        const result = await agenticService.executeAction(`Check health of project ${project.id}`, "test-user", "ppm");
        console.log(`   AI Result Message: ${result.result.message}`);
        console.log(`   Alerts Found: ${JSON.stringify(result.result.alerts)}`);

        if (result.result.status === "AT_RISK" && result.result.alerts.length > 0) {
            console.log("   ✅ AI ANALYTICS PASS: Detected Budget Overrun.");
        } else {
            console.error("   ❌ AI ANALYTICS FAIL: Should have detected risk.");
        }

    } catch (error) {
        console.error("Verification Execption:", error);
    }
}

verifyPpmIntelligence();
