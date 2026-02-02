
import { db } from "./server/db";
import {
    projects, ppmTasks, productionOrders, productionTransactions, ppmExpenditureItems,
    ppmExpenditureTypes, inventory, costElements, standardCosts
} from "@shared/schema";
import { manufacturingService } from "./server/services/ManufacturingService";
import { ppmService } from "./server/services/PpmService";
import { eq, desc } from "drizzle-orm";

async function verifyPjmIntegration() {
    console.log("Starting PJM Integration Verification...");

    // 1. Setup Project & Task
    console.log("1. Creating Project & Task...");
    const project = await ppmService.createProject({
        name: "PJM Test Project " + Date.now(),
        projectNumber: "PJM-" + Date.now(),
        projectType: "INDIRECT",
        status: "ACTIVE",
        startDate: new Date(),
        description: "Test Project for Manufacturing Integration"
    });

    // Create Task manually if service doesn't have it or via service
    // Assuming ppmService.createTask exists or we use db
    const [task] = await db.insert(ppmTasks).values({
        projectId: project.id,
        taskNumber: "1.0",
        name: "Manufacturing Task",
        startDate: new Date(),
        status: "ACTIVE"
    }).returning();

    console.log(`   Project: ${project.projectNumber} (${project.id})`);
    console.log(`   Task: ${task.taskNumber} (${task.id})`);

    // 1.5 Setup Product & Standard Cost
    console.log("1.5 Creating Product & Standard Cost...");
    const [product] = await db.insert(inventory).values({
        itemNumber: "PJM-PROD-" + Date.now(),
        description: "PJM Test Item",
        primaryUomCode: "EA",
        quantityOnHand: "100"
    }).returning();

    // Create a default cost element if missing
    let [costElement] = await db.select().from(costElements).where(eq(costElements.type, "MATERIAL")).limit(1);
    if (!costElement) {
        [costElement] = await db.insert(costElements).values({
            code: "MAT-PJM",
            name: "PJM Material",
            type: "MATERIAL"
        }).returning();
    }

    // Set standard cost
    await db.insert(standardCosts).values({
        targetType: "ITEM",
        targetId: product.id,
        costElementId: costElement.id,
        unitCost: "100.00",
        isActive: true
    });

    // 2. Create Work Order
    console.log("2. Creating Work Order linked to Project...");
    const wo = await manufacturingService.createWorkOrder({
        orderNumber: "WO-PJM-" + Date.now(),
        productId: product.id,
        quantity: 10,
        status: "planned",
        projectId: project.id,
        taskId: task.id,
        scheduledDate: new Date()
    });
    console.log(`   Work Order: ${wo.orderNumber} (${wo.id})`);

    // 3. Execute Transaction
    console.log("3. Executing Material Transaction...");
    const trx = await manufacturingService.recordTransaction({
        productionOrderId: wo.id,
        transactionType: "MATERIAL_ISSUE",
        productId: product.id,
        transactionDate: new Date(),
        quantity: 5,
        actualCost: "500.00", // Total cost $500
        description: "Material Issue for PJM Test"
    });
    console.log(`   Transaction ID: ${trx.id}`);

    // 4. Verify Expenditure Item
    console.log("4. Verifying PPM Expenditure Item...");
    // Give safe delay if async? No, logic is awaited.

    const expenditures = await db.select().from(ppmExpenditureItems)
        .where(eq(ppmExpenditureItems.transactionReference, trx.id));

    if (expenditures.length > 0) {
        const exp = expenditures[0];
        console.log("   [SUCCESS] Expenditure Item Found!");
        console.log(`   ID: ${exp.id}`);
        console.log(`   Type ID: ${exp.expenditureTypeId}`);
        console.log(`   Amount: ${exp.rawCost}`);
        console.log(`   Task ID: ${exp.taskId}`);

        if (exp.taskId === task.id && Number(exp.rawCost) === 500) {
            console.log("   [PASS] Data integrity verified.");
        } else {
            console.error("   [FAIL] Data mismatch in expenditure item.");
        }
    } else {
        console.error("   [FAIL] No Expenditure Item created.");
    }

    console.log("Verification Complete.");
    process.exit(0);
}

verifyPjmIntegration().catch(err => {
    console.error(err);
    process.exit(1);
});
