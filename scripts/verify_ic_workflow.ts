
import "dotenv/config";
import { db } from "../server/db";
import { intercompanyService } from "../server/modules/intercompany/intercompany.service";
import { icBatches, icHeaders, icLines } from "../shared/schema/intercompany";
import { eq } from "drizzle-orm";

async function verifyIcWorkflow() {
    console.log("🚀 Verifying Intercompany Workflow (Phase 21)...");

    try {
        const initiatorOrgId = "ICO-101";
        const receiverOrgId = "ICO-102";
        const userId = "test-user";

        // 1. Create Batch
        console.log("1. Creating Batch...");
        const payload = {
            description: "Marketing Charge (To Be Rejected)",
            initiatorOrgId,
            glDate: "2026-03-31",
            currencyCode: "USD",
            transactions: [
                {
                    receiverOrgId,
                    transactionTypeId: "SHARED_SERVICES",
                    amount: 300,
                    lines: [
                        {
                            codeCombinationId: "101-000-4000-000-000",
                            enteredCr: 300,
                            description: "Marketing Income"
                        }
                    ]
                }
            ]
        };

        const batch = await intercompanyService.createBatch(payload, userId);
        console.log(`   - Batch Created: ${batch.id}`);

        // 2. Submit
        console.log("2. Submitting Batch...");
        await intercompanyService.submitBatch(batch.id);

        // 3. Find Transaction (Receiver View)
        const inbound = await intercompanyService.getInboundTransactions(receiverOrgId);
        const txn = inbound.find(t => t.batchId === batch.id);
        if (!txn) throw new Error("Transaction not found for Receiver");

        // 4. Reject
        console.log("3. Rejecting Transaction...");
        await intercompanyService.respondToTransaction(txn.id, "REJECT", {
            rejectionReason: "Wrong Cost Center"
        });

        const [rejectedHeader] = await db.select().from(icHeaders).where(eq(icHeaders.id, txn.id));
        console.log(`   - Transaction Status: ${rejectedHeader.status}`);
        console.log(`   - Rejection Reason: ${rejectedHeader.rejectionReason}`);

        if (rejectedHeader.status !== "REJECTED") throw new Error("Status should be REJECTED");
        if (rejectedHeader.rejectionReason !== "Wrong Cost Center") throw new Error("Reason mismatch");

        // 5. Resubmit
        console.log("4. Resubmitting Transaction...");
        const newBatch = await intercompanyService.resubmitTransaction(txn.id, userId);
        console.log(`   - New Batch Created: ${newBatch.id}`);
        console.log(`   - New Batch Description: ${newBatch.description}`);

        if (!newBatch.description?.includes("Resubmission")) throw new Error("Description doesn't indicate resubmission");
        if (newBatch.status !== "DRAFT") throw new Error("New Batch status should be DRAFT");

        console.log("✅ Intercompany Workflow Verified!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyIcWorkflow();
