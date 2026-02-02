import { db } from "../server/db";
import {
    constructionContracts,
    constructionContractLines,
    constructionPayApps,
    constructionPayAppLines
} from "../shared/schema";
import { ConstructionService } from "../server/services/ConstructionService";
import { eq } from "drizzle-orm";

async function verifyBilling() {
    console.log("Starting Construction Billing Verification...");
    const service = new ConstructionService();

    // 1. Setup: Create Contract and Lines
    console.log("1. Creating Contract...");
    const contract = await service.createContract({
        projectId: "PROJ-BILL-TEST",
        contractNumber: "CN-BILL-" + Date.now(),
        subject: "Billing Test Contract",
        vendorId: "VEND-1",
        originalAmount: "0" // Will be updated by lines
    });
    console.log("   Contract Created:", contract.contractNumber);

    console.log("2. Adding SOV Lines...");
    await service.addContractLine({
        contractId: contract.id,
        lineNumber: 1,
        description: "Foundation",
        scheduledValue: "10000.00"
    });
    await service.addContractLine({
        contractId: contract.id,
        lineNumber: 2,
        description: "Framing",
        scheduledValue: "20000.00"
    });

    // Verify Contract Amount logic from previous phase
    const contractRefreshed = await service.getContract(contract.id);
    if (Number(contractRefreshed?.originalAmount) !== 30000) {
        throw new Error(`Contract Total Mismatch: Expected 30000, got ${contractRefreshed?.originalAmount}`);
    }
    console.log("   Contract Amount Verified: $30,000");

    // 2. Create Pay App #1
    console.log("3. Creating Pay App #1...");
    const payApp = await service.createPayApp({
        contractId: contract.id,
        applicationNumber: 1,
        periodStart: new Date(),
        periodEnd: new Date(),
        status: "DRAFT"
    });

    const payAppDetail = await service.getPayApp(payApp.id);
    if (!payAppDetail || payAppDetail.lines.length !== 2) {
        throw new Error("Pay App Lines not initialized correctly");
    }
    console.log("   Pay App #1 Initialized with 2 lines based on SOV.");

    // 3. Update Progress
    console.log("4. Updating Progress (50% Foundation)...");
    const line1 = payAppDetail.lines.find(l => l.description === "Foundation");
    if (!line1) throw new Error("Line 1 not found");

    await service.updatePayAppLine(line1.id, {
        totalCompletedToDate: "5000.00",
        percentageComplete: "50.00"
    });

    // 4. Verification Calculations
    console.log("5. Vefifying Calculations...");
    const payAppFinal = await service.getPayApp(payApp.id);

    const totalCompleted = Number(payAppFinal?.totalCompleted);
    const retention = Number(payAppFinal?.retentionAmount);
    const due = Number(payAppFinal?.currentPaymentDue);

    console.log(`   Total Completed: ${totalCompleted} (Expected 5000)`);
    console.log(`   Retention (10%): ${retention} (Expected 500)`);
    console.log(`   Net Due: ${due} (Expected 4500)`);

    if (totalCompleted !== 5000) throw new Error("Total Completed Calculation Failed");
    if (retention !== 500) throw new Error("Retention Calculation Failed");
    if (due !== 4500) throw new Error("Net Due Calculation Failed");

    console.log("✅ Billing Verification Passed!");
    process.exit(0);
}

verifyBilling().catch(err => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
