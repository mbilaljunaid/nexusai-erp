
import "dotenv/config";
import { db } from "../server/db";
import { PpmBillingService } from "../server/services/PpmBillingService";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems, ppmBillingRules,
    ppmBillingEvents, ppmProjectInvoices, arInvoices, revenueSourceEvents,
    ppmExpenditureTypes
} from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function verifyPpmBilling() {
    console.log("🔍 Starting PPM Phase 39 Billing Verification...");
    const billingService = new PpmBillingService();

    // 1. Setup: Create Project, Task, and Billing Rule
    console.log("1. Setting up Test Project & Billing Rule...");
    const projectNumber = `PROJ-BILL-${Date.now()}`;
    const [project] = await db.insert(ppmProjects).values({
        projectNumber,
        name: `Billing Test Project ${projectNumber}`,
        projectType: "CONTRACT",
        status: "ACTIVE",
        startDate: new Date(),
        budget: "50000.00"
    }).returning();
    console.log(`   ✅ Project Created: ${project.name} (${project.id})`);

    const [task] = await db.insert(ppmTasks).values({
        projectId: project.id,
        taskNumber: "1.0",
        name: "Billable Task",
        startDate: new Date(),
        billableFlag: true
    }).returning();
    console.log(`   ✅ Billable Task Created: ${task.taskNumber}`);

    // Create T&M Billing Rule with 20% Markup
    await db.insert(ppmBillingRules).values({
        projectId: project.id,
        ruleName: "Standard T&M",
        ruleType: "TM",
        markupPercentage: "20.00",
        activeFlag: true
    });
    console.log("   ✅ T&M Billing Rule Created (20% Markup)");

    // Create Expenditure Type
    const [expType] = await db.insert(ppmExpenditureTypes).values({
        name: `Billing Test Type ${Date.now()}`,
        unitOfMeasure: "HOURS"
    }).returning(); // Ensure ppmExpenditureTypes is imported

    // 2. Create Costed Expenditure Item
    console.log("2. Inserting Costed Expenditure Item...");
    const rawCost = 1000.00;
    const [item] = await db.insert(ppmExpenditureItems).values({
        projectId: project.id,
        taskId: task.id,
        expenditureItemDate: new Date(),
        expenditureTypeId: expType.id, // Correct FK
        quantity: "10",
        // uom: "HOURS", // Schema doesn't have UOM on item? It's on Type. Let's check schema.
        unitCost: "100.00",
        rawCost: rawCost.toFixed(2),
        burdenedCost: rawCost.toFixed(2), // Simplified
        denomCurrencyCode: "USD",
        status: "COSTED",
        transactionSource: "Manual Entry"
    }).returning();
    console.log(`   ✅ Item Inserted: Cost $${item.rawCost}`);

    // 3. Generate Billing Events
    console.log("3. Generating Billing Events...");
    const events = await billingService.generateBillingEvents(project.id);

    if (events.length === 1) {
        const event = events[0];
        const expectedAmount = 1200.00; // 1000 * 1.2
        console.log(`   👉 Event Amount: $${event.amount} (Expected $${expectedAmount})`);

        if (Math.abs(parseFloat(event.amount) - expectedAmount) < 0.01) {
            console.log("   ✅ Billing Event Generated Correctly (Markup Applied)");
        } else {
            console.error("   ❌ Amount Mismatch");
        }
    } else {
        console.error(`   ❌ Failed to generate event. Count: ${events.length}`);
        process.exit(1);
    }

    // 4. Generate Draft Invoice
    console.log("4. Generating Draft Invoice...");
    const invResult = await billingService.generateDraftInvoice(project.id);
    if (invResult) {
        console.log(`   ✅ Invoice Created: ${invResult.invoice.invoiceNumber}, Amount: $${invResult.invoice.amount}`);
    } else {
        console.error("   ❌ Failed to create invoice");
        process.exit(1);
    }

    const invoiceId = invResult.invoice.id;

    // 5. Approve Invoice
    console.log("5. Approving Invoice...");
    await billingService.approveInvoice(invoiceId);
    console.log("   ✅ Invoice Approved");

    // 6. Interface to AR & Revenue
    console.log("6. Interfacing to AR & Revenue...");
    await billingService.interfaceToAR(invoiceId);
    await billingService.interfaceToRevenue(invoiceId);

    // Verify AR
    const [updatedInv] = await db.select().from(ppmProjectInvoices).where(eq(ppmProjectInvoices.id, invoiceId));
    if (updatedInv.transferStatus === "TRANSFERRED" && updatedInv.arInvoiceId) {
        console.log(`   ✅ PPM Invoice Marked as TRANSFERRED (AR ID: ${updatedInv.arInvoiceId})`);

        // Check AR Table
        const [arInv] = await db.select().from(arInvoices).where(eq(arInvoices.id, updatedInv.arInvoiceId));
        if (arInv) {
            console.log(`   ✅ AR Invoice Found: ${arInv.invoiceNumber}`);
        } else {
            console.error("   ❌ AR Invoice Record Missing");
        }
    } else {
        console.error("   ❌ Interface Status Failed");
    }

    // Verify Revenue Event
    const revEvents = await db.select().from(revenueSourceEvents).where(eq(revenueSourceEvents.referenceNumber, invoiceId));
    if (revEvents.length > 0) {
        console.log(`   ✅ Revenue Source Event Created (${revEvents.length} events)`);
    } else {
        console.log("   ⚠️ No Revenue Events found (Check InterfaceToRevenue logic)");
    }

    console.log("✅ Verification Complete.");
    process.exit(0);
}

verifyPpmBilling().catch(err => {
    console.error("Verification Failed:", err);
    process.exit(1);
});
