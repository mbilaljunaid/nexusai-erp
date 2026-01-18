
import "dotenv/config";
import { lcmService } from "./server/modules/lcm/lcm.service";
import { lcmAiService } from "./server/modules/lcm/lcm-ai.service";

async function verifyLcmAi() {
    console.log("🤖 Verifying LCM Phase 36: AI Predictive Intelligence...");

    try {
        // 1. Setup History: Create "Closed" Ops with Actual Charges
        console.log("   --- Setup History ---");
        // Op 1: 100kg, $50 Freight -> Rate $0.50/kg
        const op1 = await lcmService.createTradeOperationWithLines({
            header: { operationNumber: `TO-HIST-1-${Date.now()}`, name: "History Voyage 1", status: "CLOSED" },
            shipmentLines: [{ purchaseOrderLineId: "POL-H1", quantity: "10", netWeight: "100" }]
        });
        const comp = await lcmService.createCostComponent({ name: "Predictive Freight", componentType: "FREIGHT", allocationBasis: "WEIGHT" });

        await lcmService.trackActualCharge({
            tradeOpId: op1.id,
            costComponentId: comp[0].id,
            amount: "50.00",
            vendorId: "VEN-HIST",
            referenceNumber: "INV-HIST-1"
        });

        // Op 2: 200kg, $100 Freight -> Rate $0.50/kg
        const op2 = await lcmService.createTradeOperationWithLines({
            header: { operationNumber: `TO-HIST-2-${Date.now()}`, name: "History Voyage 2", status: "CLOSED" },
            shipmentLines: [{ purchaseOrderLineId: "POL-H2", quantity: "20", netWeight: "200" }]
        });
        await lcmService.trackActualCharge({
            tradeOpId: op2.id,
            costComponentId: comp[0].id,
            amount: "100.00",
            vendorId: "VEN-HIST",
            referenceNumber: "INV-HIST-2"
        });
        console.log("   ✅ Created History: 300kg total, $150 total (Avg $0.50/kg)");

        // 2. Create Target Op (Open)
        console.log("   --- Target Operation ---");
        // Target: 500kg. Expected Prediction: 500 * 0.50 = $250.
        const targetOp = await lcmService.createTradeOperationWithLines({
            header: { operationNumber: `TO-PREDICT-${Date.now()}`, name: "Future Voyage" },
            shipmentLines: [{ purchaseOrderLineId: "POL-F1", quantity: "50", netWeight: "500" }]
        });
        console.log(`   ✅ Target Created (500kg). Ref: ${targetOp.operationNumber}`);

        // 3. Run Prediction
        console.log("   --- Running AI Prediction ---");
        const result = await lcmAiService.predictCosts(targetOp.id);

        const prediction = result.predictions.find(p => p.costComponentId === comp[0].id);

        if (!prediction) throw new Error("AI returned no prediction for Freight.");

        console.log(`   🤖 AI Prediction: Amount $${prediction.predictedAmount} (Rate: ${prediction.avgRate})`);

        // 4. Validate
        if (Number(prediction.predictedAmount) === 250.00) {
            console.log("   ✅ Prediction Accuracy: 100% (Expected $250.00)");
        } else {
            // Allow small float variance
            if (Math.abs(Number(prediction.predictedAmount) - 250) < 0.1) {
                console.log("   ✅ Prediction Accuracy: Acceptable Float variance.");
            } else {
                throw new Error(`Prediction Mismatch! Expected $250, got $${prediction.predictedAmount}`);
            }
        }

        console.log("🎉 Phase 36 Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyLcmAi();
