
import { db } from "../server/db";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems,
    timeEntries, employees
} from "../shared/schema/index";
import { ppmService } from "../server/services/PpmService";
import { eq } from "drizzle-orm";

async function verifyLaborIntegration() {
    console.log("Starting Verification: PPM Labor Integration (Time-to-Project)...");

    try {
        // 1. Create a Test Project & Task
        console.log("1. Creating Test Project...");
        const project = await ppmService.createProject({
            projectNumber: `LAB-PROJ-${Date.now()}`,
            name: "Labor Integration Test Project",
            projectType: "CONTRACT",
            startDate: new Date(),
            budget: "50000.00",
            status: "ACTIVE"
        });
        console.log(`   Project Created: ${project.projectNumber}`);

        const task = await ppmService.createTask({
            projectId: project.id,
            taskNumber: "2.0",
            name: "Consulting Phase",
            startDate: new Date(),
            chargeableFlag: true,
            billableFlag: true
        });
        console.log(`   Task Created: ${task.taskNumber}`);

        // 2. Create an Employee
        console.log("2. Creating Employee...");
        const [emp] = await db.insert(employees).values({
            firstName: "John",
            lastName: "Labor",
            email: `john.labor.${Date.now()}@test.com`,
            department: "Consulting"
        }).returning();
        console.log(`   Employee Created: ${emp.firstName} ${emp.lastName}`);

        // 3. Create a Time Entry (Approved)
        console.log("3. Creating Approved Time Entry...");
        const [entry] = await db.insert(timeEntries).values({
            employeeId: emp.id,
            projectId: project.id,
            taskId: task.id,
            date: new Date(),
            hours: "8.00",
            description: "On-site consulting",
            billableFlag: true,
            costRate: "150.00", // $150/hr
            status: "APPROVED"
        }).returning();
        console.log(`   Time Entry Created: ${entry.hours} hrs @ $${entry.costRate}/hr`);

        // 4. Run Cost Collector
        console.log("4. Running PpmService.collectFromLabor()...");
        const collectedItems = await ppmService.collectFromLabor();
        console.log(`   Collector finished. Items collected: ${collectedItems.length}`);

        // 5. Verify Expenditure Item
        if (collectedItems.length > 0) {
            const expItem = collectedItems.find(i => i.transactionReference === entry.id);
            if (expItem) {
                console.log("   ✅ SUCCESS: Expenditure Item created!");
                console.log(`      ID: ${expItem.id}`);
                console.log(`      Exp Type ID: ${expItem.expenditureTypeId}`);
                console.log(`      Quantity: ${expItem.quantity}`);
                console.log(`      Raw Cost: ${expItem.rawCost} (Expected: 8 * 150 = 1200)`);
                console.log(`      Source: ${expItem.transactionSource}`);

                if (parseFloat(expItem.rawCost) === 1200.00) {
                    console.log("   ✅ COST CALCULATION: Verified");
                } else {
                    console.error("   ❌ COST CALCULATION: Mismatch");
                }
            } else {
                console.error("   ❌ FAILURE: Specific entry not collected.");
            }
        } else {
            console.error("   ❌ FAILURE: No items collected.");
        }

    } catch (error) {
        console.error("Verification Execption:", error);
    }
}

verifyLaborIntegration();
