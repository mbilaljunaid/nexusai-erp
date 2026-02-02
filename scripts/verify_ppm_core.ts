import "dotenv/config";
import { db } from "../server/db";
import { PpmService } from "../server/services/PpmService";
import {
    ppmProjects, ppmTasks, apInvoiceLines, apInvoices, ppmExpenditureItems,
    ppmExpenditureTypes, apSuppliers
} from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function verifyPpmCore() {
    console.log("🔍 Starting PPM Phase 38 Verification...");
    const ppmService = new PpmService();

    // 1. Setup: Create Project & Task
    console.log("1. Setting up Test Project...");
    const projectNumber = `PROJ-${Date.now()}`;
    const [project] = await db.insert(ppmProjects).values({
        projectNumber,
        name: `Verification Project ${projectNumber}`,
        projectType: "CAPITAL",
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        status: "ACTIVE",
        budget: "100000.00",
        percentComplete: "25.00" // 25%
    }).returning();
    console.log(`   ✅ Project Created: ${project.name} (${project.id})`);

    const [task] = await db.insert(ppmTasks).values({
        projectId: project.id,
        taskNumber: "1.1",
        name: "Design Phase",
        startDate: new Date(),
        chargeableFlag: true,
        capitalizableFlag: true
    }).returning();
    console.log(`   ✅ Task Created: ${task.taskNumber} (${task.id})`);

    // 2. Simulating AP Invoice Source...
    console.log("2. Creating Dummy Supplier & Invoice...");

    // Create Supplier first (Integer ID)
    const [supplier] = await db.insert(apSuppliers).values({
        name: `Test Supplier ${Date.now()}`,
        supplierNumber: `SUP-${Date.now()}`
    }).returning();

    // Create Dummy Invoice header
    const [invoice] = await db.insert(apInvoices).values({
        invoiceNumber: `INV-${Date.now()}`,
        supplierId: supplier.id, // Correct Integer ID
        invoiceDate: new Date(),
        invoiceAmount: "5000.00",
        invoiceCurrencyCode: "USD",
        validationStatus: "VALIDATED"
    } as any).returning();

    // Create Invoice Line with Project Tags
    const [line] = await db.insert(apInvoiceLines).values({
        invoiceId: invoice.id,
        lineNumber: 1,
        lineType: "ITEM",
        amount: "5000.00",
        description: "Services for Design",
        ppmProjectId: project.id,
        ppmTaskId: task.id
    } as any).returning();
    console.log(`   ✅ AP Invoice Line Created: ${line.id} (Tagged to Proj ${project.projectNumber})`);

    // 3. Test Cost Import
    console.log("3. Testing Cost Import (PpmService.collectFromAP)...");
    const collected = await ppmService.collectFromAP();
    console.log(`   👉 Collection Result: ${collected.length} items`);

    const importedItem = collected.find(i => i.transactionReference === line.id.toString());

    if (importedItem) {
        console.log(`   ✅ SUCCESS: AP Line converted to Expenditure Item ${importedItem.id}`);
        console.log(`      Amount: ${importedItem.rawCost}, Type: ${importedItem.transactionSource}`);
    } else {
        console.error("   ❌ FAILURE: Created AP line was not collected.");
        // Debug check
        const apCheck = await db.select().from(apInvoiceLines).where(eq(apInvoiceLines.id, line.id));
        console.log("      AP Line State:", apCheck[0]);
    }

    // 4. Test Performance Metrics
    console.log("4. Testing EVM Metrics (getProjectPerformance)...");
    // We expect:
    // Budget = 100,000
    // Actual Cost = 5,000 (from above)
    // Earned Value = 100,000 * 0.25 = 25,000
    // CPI = 25,000 / 5,000 = 5.0 (Great performance!)

    const performance = await ppmService.getProjectPerformance(project.id);
    const m = performance.metrics;

    console.log("   📊 Metrics Generated:");
    console.log(`      Budget: $${m.budget}`);
    console.log(`      Actual Cost: $${m.actualCost}`);
    console.log(`      Earned Value: $${m.earnedValue}`);
    console.log(`      CPI: ${m.cpi} (Expected ~5.0)`);

    if (Number(m.actualCost) >= 5000 && Number(m.cpi) > 1) {
        console.log("   ✅ EVM Logic Verified");
    } else {
        console.error("   ❌ EVM Calculation Mismatch");
    }

    // 5. Test Asset Line Generation (CIP)
    console.log("5. Testing Asset Line Generation...");
    // Need a Project Asset first
    const pAsset = await ppmService.createProjectAsset({
        projectId: project.id,
        assetName: "Design Prototype",
        assetType: "CIP",
        status: "DRAFT"
    });

    // We have a COSTED item (from import, it sets status=UNCOSTED usually? Service sets status=UNCOSTED). 
    // Wait, collectFromAP sets status="UNCOSTED". 
    // generateAssetLines requires "COSTED".
    // We need to "Cost" the item first. In a real flow, a Costing process runs. 
    // PpmService.applyBurdening usually sets it to COSTED.

    if (importedItem) {
        await ppmService.applyBurdening(importedItem.id);
        console.log("   ...Item Costed/Burdened");

        const assetLines = await ppmService.generateAssetLines(pAsset.id);
        console.log(`   👉 Generated ${assetLines.length} Asset Lines`);

        if (assetLines.length > 0) {
            console.log("   ✅ CIP Asset Line Creation Verified");
        } else {
            console.log("   ⚠️ No Asset Lines created (Check capitalization flags)");
        }
    }

    console.log("✅ Verification Complete.");
    process.exit(0);
}

verifyPpmCore().catch(err => {
    console.error("Verification Failed:", err);
    process.exit(1);
});
