
import "dotenv/config";
import { intercompanyService } from "../server/modules/intercompany/intercompany.service";
import { intercompanyReportService } from "../server/modules/intercompany/intercompany.report.service";
import { db } from "../server/db";
import { eq } from "drizzle-orm";

async function verifyIcReconciliation() {
    console.log("🚀 Verifying Intercompany Reconciliation (Phase 23)...");

    try {
        const userId = "test-user";
        const initiatorOrgId = "ICO-101";
        const receiverOrgId = "ICO-102";

        // 1. Create Draft Batch (In-Transit) -> Should create Variance
        console.log("1. Creating Draft Batch (In-Transit)...");
        const batch1 = await intercompanyService.createBatch({
            description: "In-Transit Test",
            initiatorOrgId,
            glDate: "2026-03-31",
            currencyCode: "USD",
            transactions: [{
                receiverOrgId,
                transactionTypeId: "SHARED_SERVICES",
                amount: 1000,
                lines: [{ codeCombinationId: "101-000-4000-000-000", enteredCr: 1000, description: "Revenue" }]
            }]
        }, userId);
        // Do NOT approve.

        // 2. Create & Approve Batch (Eliminated) -> Should be balanced
        console.log("2. Creating & Approving Batch (Eliminated)...");
        const batch2 = await intercompanyService.createBatch({
            description: "Eliminated Test",
            initiatorOrgId,
            glDate: "2026-03-31",
            currencyCode: "USD",
            transactions: [{
                receiverOrgId,
                transactionTypeId: "SHARED_SERVICES",
                amount: 2000,
                lines: [{ codeCombinationId: "101-000-4000-000-000", enteredCr: 2000, description: "Revenue" }]
            }]
        }, userId);
        await intercompanyService.submitBatch(batch2.id);

        const inbound = await intercompanyService.getInboundTransactions(receiverOrgId);
        const txn2 = inbound.find(t => t.batchId === batch2.id);
        if (txn2) await intercompanyService.respondToTransaction(txn2.id, "APPROVE", {
            receiverLines: [{ codeCombinationId: "102-000-5000-000-000", enteredDr: 2000, description: "Expense" }]
        });

        // 3. Generate Report
        console.log("3. Generating Reconciliation Report...");
        const report = await intercompanyReportService.getReconciliationReport("All");

        // 4. Verify Discrepancies
        // Locate Match for Batch 1 (In-Transit)
        const inTransitItem = report.details.find(d => d.batchId === batch1.id);
        if (!inTransitItem) throw new Error("In-Transit Item not found in report");

        console.log(`   - In-Transit Logic: Outbound=${inTransitItem.outboundAmount}, Inbound=${inTransitItem.inboundAmount} (Diff: ${inTransitItem.difference})`);

        if (inTransitItem.difference !== 1000) throw new Error("In-Transit Difference Incorrect");
        if (inTransitItem.inboundAmount !== 0) throw new Error("In-Transit Inbound should be 0");

        // Locate Match for Batch 2 (Eliminated)
        const eliminatedItem = report.details.find(d => d.batchId === batch2.id);
        if (!eliminatedItem) throw new Error("Eliminated Item not found in report");

        console.log(`   - Eliminated Logic: Outbound=${eliminatedItem.outboundAmount}, Inbound=${eliminatedItem.inboundAmount} (Diff: ${eliminatedItem.difference})`);

        if (eliminatedItem.difference !== 0) throw new Error("Eliminated Difference Incorrect");
        if (eliminatedItem.inboundAmount !== 2000) throw new Error("Eliminated Inbound should match Outbound");

        console.log("✅ Intercompany Reconciliation Verified!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyIcReconciliation();
