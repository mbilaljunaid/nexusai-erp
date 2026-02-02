
import { contractService } from "../server/services/ContractService";
import { db } from "@db";
import { contracts } from "@shared/schema/contracts";

async function verifyPhase16() {
    console.log("Starting Phase 16 Verification: Enterprise Contracts (CLM)...");

    try {
        // 1. Create a Contract via Service
        console.log("1. Testing Contract Creation...");
        const newContract = await contractService.createContract({
            title: "Test MSA 2026",
            contractType: "MSA",
            startDate: new Date(),
            totalAmount: 100000
        });

        if (!newContract.id || !newContract.contractNumber) {
            throw new Error("Contract creation failed: ID/Number missing");
        }
        console.log(`   SUCCESS: Contract Created [${newContract.contractNumber}]`);

        // 2. Retrieve Contract
        console.log("2. Testing Contract Retrieval...");
        const fetched = await contractService.getContract(newContract.id);
        if (!fetched || fetched.title !== "Test MSA 2026") {
            throw new Error("Contract retrieval failed");
        }
        console.log("   SUCCESS: Contract Retrieved");

        // 3. Add Line Item
        console.log("3. Testing Bill of Quantities (Lines)...");
        const line = await contractService.addLine({
            contractId: newContract.id,
            lineNumber: 1,
            itemDescription: "Consulting Services",
            quantity: 10,
            unitPrice: 150,
            lineAmount: 1500
        });
        if (!line.id) throw new Error("Line creation failed");
        console.log("   SUCCESS: Line item added.");

        console.log("\n✅ PHASE 16 VERIFICATION PASSED");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:", error);
        process.exit(1);
    }
}

verifyPhase16();
