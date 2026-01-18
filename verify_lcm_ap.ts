
import "dotenv/config";
import { lcmService } from "./server/modules/lcm/lcm.service";
import { lcmAllocationService } from "./server/modules/lcm/lcm-allocation.service";

async function verifyLcmAp() {
    console.log("🔗 Verifying LCM Phase 35: AP Integration (Actuals)...");

    try {
        // 1. Setup Trade Op
        console.log("   --- Setup ---");
        const op = await lcmService.createTradeOperationWithLines({
            header: {
                operationNumber: `TO-AP-${Date.now()}`,
                name: "AP Integration Test Voyage",
            },
            shipmentLines: []
        });
        console.log("   ✅ Created Trade Op:", op.operationNumber);

        // 2. Create Cost Component (Freight)
        const comp = await lcmService.createCostComponent({
            name: "Actual Freight",
            componentType: "FREIGHT",
            allocationBasis: "VALUE"
        });

        // 3. Simulate AP Invoice Posting (Backend Logic Only)
        // Ideally this would be triggered by ApService.validateInvoice(), but we test the LCM sink directly here.
        console.log("   --- Simulating AP Invoice Post ---");
        const actualCharge = await lcmService.trackActualCharge({
            tradeOpId: op.id,
            costComponentId: comp[0].id,
            amount: "1200.00",
            vendorId: "VEN-MOCK-001",
            referenceNumber: "INV-12345"
        });
        console.log("   ✅ Tracked Actual Charge: $1200.00");

        // 4. Verify Data
        const details = await lcmService.getTradeOperationDetails(op.id);
        const actuals = details?.charges.filter(c => c.isActual);

        if (actuals?.length === 1 && actuals[0].amount === "1200.00") {
            console.log("   ✅ Actual Charge correctly linked to Trade Op.");
        } else {
            throw new Error("Actual Charge missing or incorrect amount");
        }

        console.log("🎉 Phase 35 Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyLcmAp();
