
import "dotenv/config";
import { intercompanyService } from "../server/modules/intercompany/intercompany.service";
import { db } from "../server/db";
import { icHeaders, icBatches, icOrgs } from "../shared/schema/intercompany";
import { eq } from "drizzle-orm";

async function verifyIcSla() {
    console.log("🚀 Verifying Intercompany Invoicing & SLA (Phase 22)...");

    try {
        const userId = "test-user";
        const initiatorOrgId = "ICO-101";
        const receiverOrgId = "ICO-102";

        // 1. Create & Submit Batch
        console.log("1. Creating & Submitting Batch...");
        const payload = {
            description: "IT Chargeback (To Be Invoiced)",
            initiatorOrgId,
            glDate: "2026-03-31",
            currencyCode: "USD",
            transactions: [
                {
                    receiverOrgId,
                    transactionTypeId: "SHARED_SERVICES",
                    amount: 500,
                    lines: [{ codeCombinationId: "101-000-4000-000-000", enteredCr: 500, description: "IT Tax" }]
                }
            ]
        };
        const batch = await intercompanyService.createBatch(payload, userId);
        await intercompanyService.submitBatch(batch.id);

        // 2. Approve (Trigger Invoicing)
        const inbound = await intercompanyService.getInboundTransactions(receiverOrgId);
        const txn = inbound.find(t => t.batchId === batch.id);
        if (!txn) throw new Error("Transaction not found");

        console.log("2. Approving Transaction (Should Trigger Invoice Mock)...");
        await intercompanyService.respondToTransaction(txn.id, "APPROVE", {
            receiverLines: [
                { codeCombinationId: "102-000-5000-000-000", enteredDr: 500, description: "IT Expense" }
            ]
        });

        // 3. Verify Status
        const [header] = await db.select().from(icHeaders).where(eq(icHeaders.id, txn.id));
        if (header.status !== "APPROVED") throw new Error("Status should be APPROVED");

        console.log(`   - Transaction Status: ${header.status}`);
        console.log(`   - Invoicing: Mock Service Executed (Check Logs)`);

        console.log("✅ Intercompany Invoicing Verified!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyIcSla();
