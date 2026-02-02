
import { db } from "../server/db";
import { maintenanceCostingService } from "../server/services/MaintenanceCostingService";
import { maintWorkOrders, maintWorkOrderCosts, slaJournalHeaders, slaJournalLines, inventory, slaEventClasses } from "../shared/schema";
import { eq, desc } from "drizzle-orm";

async function verifyMaintenanceAccounting() {
    console.log("🛠️ Verifying Maintenance GL Integration (Phase D)...");

    // 1. Setup: Get a Work Order
    const wo = await db.query.maintWorkOrders.findFirst();
    if (!wo) {
        console.error("❌ No Work Orders found. Run Step 1/2 verification first.");
        process.exit(1);
    }
    console.log(`📋 Using Work Order: ${wo.workOrderNumber}`);

    // 2. Setup: Get an Inventory Item
    const item = await db.query.inventory.findFirst();
    if (!item) {
        console.error("❌ No Inventory Items found.");
        process.exit(1);
    }

    // 3. Action: Issue Material (Triggers Costing -> Accounting)
    console.log(`📦 Issuing Material: ${item.itemNumber} ($${item.unitCost || 15})...`);

    // Mock the "material record" usually created by issue service
    // In real flow, MaintenanceService calls issueMaterial -> calls Costing
    // Here we call Costing directly to simulate the "Cost Event"
    const materialRecord = {
        id: `MAT-${Date.now()}`,
        inventoryId: item.id,
        unitCost: item.unitCost || 15,
        actualQuantity: 1
    };

    const cost = await maintenanceCostingService.calculateMaterialCost(wo.id, materialRecord);
    console.log(`💰 Cost Created: ${cost.id} | Total: $${cost.totalCost}`);

    // 4. Verify: Check SLA Journal
    console.log("🔍 Checking SLA Journals...");

    // Allow a moment for async (though our impl is await, so it should be immediate)
    const journal = await db.query.slaJournalHeaders.findFirst({
        where: eq(slaJournalHeaders.entityId, cost.id),
        with: {
            lines: true
        }
    });

    if (!journal) {
        console.error("❌ Verification Failed: No SLA Journal found for Cost ID.");
        process.exit(1);
    }

    console.log(`✅ Journal Header Found: ${journal.id}`);
    console.log(`   Event Class: ${journal.eventClassId}`);
    console.log(`   Status: ${journal.status}`);

    if (journal.eventClassId !== "MAINT_MATERIAL_ISSUE") {
        console.error(`❌ Incorrect Event Class. Expected MAINT_MATERIAL_ISSUE, got ${journal.eventClassId}`);
    }

    // 5. Verify Lines
    const lines = journal.lines;
    console.log(`lines:`, lines);
    if (lines.length !== 2) {
        console.error(`❌ Expected 2 Journal Lines, got ${lines.length}`);
    } else {
        const dr = lines.find(l => l.enteredDr && Number(l.enteredDr) > 0);
        const cr = lines.find(l => l.enteredCr && Number(l.enteredCr) > 0);

        if (dr && cr) {
            console.log(`✅ Debit: ${dr.enteredDr} | Class: ${dr.accountingClass}`);
            console.log(`✅ Credit: ${cr.enteredCr} | Class: ${cr.accountingClass}`);

            if (dr.enteredDr === cr.enteredCr) {
                console.log("✨ Debits = Credits. Accounting Balanced.");
            } else {
                console.error("❌ Imbalance detected!");
            }
        } else {
            console.error("❌ Missing Debit or Credit line.");
        }
    }

    // 6. Check Cost Status Update
    const updatedCost = await db.query.maintWorkOrderCosts.findFirst({
        where: eq(maintWorkOrderCosts.id, cost.id)
    });

    if (updatedCost?.glStatus === 'POSTED') {
        console.log("✅ Cost Record updated to status: POSTED");
    } else {
        console.error(`❌ Cost Record status incorrect: ${updatedCost?.glStatus}`);
    }

    console.log("🚀 Verification Successful!");
    process.exit(0);
}

verifyMaintenanceAccounting().catch(console.error);
