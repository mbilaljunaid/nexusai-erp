
import "dotenv/config";
import { lcmService } from "./server/modules/lcm/lcm.service";

async function verifyLCM() {
    console.log("🚢 Verifying LCM Phase 33: Foundation...");

    try {
        // 1. Create Cost Component
        console.log("   --- Cost Components ---");
        const comp = await lcmService.createCostComponent({
            name: "Test Ocean Freight",
            componentType: "FREIGHT",
            allocationBasis: "VOLUME"
        });
        console.log("   ✅ Created Component:", comp[0].name);

        const listC = await lcmService.listCostComponents();
        if (listC.length === 0) throw new Error("List Components Failed");
        console.log("   ✅ Listed Components OK");


        // 2. Create Trade Operation with Dummy Lines
        console.log("   --- Trade Operations ---");
        const op = await lcmService.createTradeOperationWithLines({
            header: {
                operationNumber: `TO-TEST-${Date.now()}`,
                name: "Test Voyage 101",
                carrier: "MAERSK"
            },
            shipmentLines: [
                { purchaseOrderLineId: "PO-LINE-UUID-MOCK", quantity: "100" }
            ]
        });
        console.log("   ✅ Created Trade Op:", op.operationNumber);

        const details = await lcmService.getTradeOperationDetails(op.id);
        if (!details || details.lines.length !== 1) throw new Error("Trade Op Lines Mismatch");
        console.log("   ✅ Verified Trade Op Lines");

        // 3. Add Estimated Charge
        console.log("   --- Charges ---");
        const charge = await lcmService.addCharge({
            tradeOperationId: op.id,
            costComponentId: comp[0].id,
            amount: "1500.00",
            currency: "USD"
        });
        console.log("   ✅ Added Charge:", charge[0].amount);

        const detailsWithCharge = await lcmService.getTradeOperationDetails(op.id);
        if (detailsWithCharge?.charges.length !== 1) throw new Error("Charge not found on Trade Op");
        console.log("   ✅ Verified Charge Linkage");

        console.log("🎉 Phase 33 Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyLCM();
