
import "dotenv/config";
import { lcmService } from "./server/modules/lcm/lcm.service";
import { lcmAllocationService } from "./server/modules/lcm/lcm-allocation.service";

async function verifyAllocation() {
    console.log("🧮 Verifying LCM Phase 34: Allocation Engine...");

    try {
        // 1. Setup Data: Trade Op with 2 Lines (Different Weights)
        console.log("   --- Setup ---");
        const op = await lcmService.createTradeOperationWithLines({
            header: {
                operationNumber: `TO-ALLOC-${Date.now()}`,
                name: "Allocation Test Voyage",
            },
            shipmentLines: [
                { purchaseOrderLineId: "L1", quantity: "10", netWeight: "100" }, // 25% of weight
                { purchaseOrderLineId: "L2", quantity: "10", netWeight: "300" }  // 75% of weight
            ]
        });
        console.log("   ✅ Created Trade Op with 2 Lines (Wts: 100, 300).");

        // 2. Create Cost Component (Weight Basis)
        const comp = await lcmService.createCostComponent({
            name: "Weight Freight",
            componentType: "FREIGHT",
            allocationBasis: "WEIGHT"
        });

        // 3. Add Charge ($400)
        await lcmService.addCharge({
            tradeOperationId: op.id,
            costComponentId: comp[0].id,
            amount: "400.00"
        });
        console.log("   ✅ Added $400 Charge (Basis: WEIGHT).");

        // 4. Run Allocation
        console.log("   --- Execution ---");
        const result = await lcmAllocationService.allocateTradeOperation(op.id);
        console.log(`   ✅ Allocation Service ran. allocated ${result.allocated} records.`);

        // 5. Verify Split
        // Expect Line 1: 100/400 * 400 = 100
        // Expect Line 2: 300/400 * 400 = 300
        const allocations = await lcmAllocationService.listAllocations(op.id);

        let l1Alloc = 0;
        let l2Alloc = 0;

        allocations.forEach((a: any) => {
            if (a.basisValue === "100") l1Alloc = Number(a.allocatedAmount);
            if (a.basisValue === "300") l2Alloc = Number(a.allocatedAmount);
        });

        console.log(`   📊 Results: Line A (100kg): $${l1Alloc}, Line B (300kg): $${l2Alloc}`);

        if (l1Alloc === 100 && l2Alloc === 300) {
            console.log("   ✅ Math is CORRECT.");
        } else {
            throw new Error(`Math Mismatch! Expected 100/300 but got ${l1Alloc}/${l2Alloc}`);
        }

        console.log("🎉 Phase 34 Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyAllocation();
