
import "dotenv/config";
import { lcmService } from "./server/modules/lcm/lcm.service";
import { lcmAllocationService } from "./server/modules/lcm/lcm-allocation.service";
import { lcmAccountingService } from "./server/modules/lcm/lcm-accounting.service";
import { db } from "@db";
import { glLedgers } from "@shared/schema/finance";
import { slaEventClasses } from "@shared/schema/sla";
import { eq } from "drizzle-orm";

async function verifyLcmAccounting() {
    console.log("💰 Verifying LCM Phase 37: Enterprise Accounting...");

    try {
        // 0. Ensure a Ledger Exists
        const existingLedger = await db.select().from(glLedgers).limit(1);
        if (existingLedger.length === 0) {
            await db.insert(glLedgers).values({
                name: "Primary US Ledger",
                currencyCode: "USD",
                chartOfAccountsId: "COA-1",
                calendarId: "CAL-1",
                slaMethodCode: "std"
            });
            console.log("   ✅ Created Mock Ledger.");
        }

        // 0.5 Ensure SLA Event Class Exists
        const slaClass = await db.select().from(slaEventClasses).where(eq(slaEventClasses.id, 'LCM_ABSORPTION'));
        if (slaClass.length === 0) {
            await db.insert(slaEventClasses).values({
                id: 'LCM_ABSORPTION',
                applicationId: 'LCM',
                name: 'Landed Cost Absorption',
                description: 'Absorption of Landed Costs into Inventory',
                enabledFlag: true
            });
            console.log("   ✅ Seeded SLA Event Class: LCM_ABSORPTION");
        }

        // 1. Setup: Create Trade Op, Charge, and Allocate
        console.log("   --- Setup Trade Op ---");
        const op = await lcmService.createTradeOperationWithLines({
            header: { operationNumber: `TO-ACC-${Date.now()}`, name: "Accounting Voyage" },
            shipmentLines: [{ purchaseOrderLineId: "POL-A1", quantity: "10", netWeight: "100" }]
        });
        const comp = await lcmService.createCostComponent({ name: "Duty", componentType: "DUTY", allocationBasis: "VALUE" });
        await lcmService.addCharge({
            tradeOperationId: op.id,
            costComponentId: comp[0].id,
            amount: "100.00"
        });

        await lcmAllocationService.allocateTradeOperation(op.id);
        console.log("   ✅ Trade Op Allocated. Ready for Accounting.");

        // 2. Create Accounting
        console.log("   --- Generating SLA Journals ---");
        const result = await lcmAccountingService.createAccounting(op.id);

        console.log(`   ✅ Journal Created: ID ${result.journalId}, Total Amount: $${result.totalAmount}`);

        if (result.totalAmount !== 100) throw new Error("Journal Amount Mismatch");

        console.log("🎉 Phase 37 (Accounting) Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyLcmAccounting();
