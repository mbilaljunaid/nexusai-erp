
import "dotenv/config";
import { db } from "../server/db";
import { intercompanyService } from "../server/modules/intercompany/intercompany.service";
import { icBatches, icHeaders, icLines } from "../shared/schema/intercompany";
import { eq } from "drizzle-orm";

async function verifyIcEngine() {
    console.log("🚀 Verifying Intercompany Engine (Phase 20)...");

    try {
        const initiatorOrgId = "ICO-101"; // Nexus HQ
        const receiverOrgId = "ICO-102"; // Nexus EU
        const userId = "test-user";

        // 1. Create Batch
        console.log("1. Creating Batch...");
        const payload = {
            description: "Quarterly Shared Services Charge",
            initiatorOrgId,
            glDate: "2026-03-31",
            currencyCode: "USD",
            transactions: [
                {
                    receiverOrgId,
                    transactionTypeId: "SHARED_SERVICES",
                    amount: 5000,
                    lines: [
                        {
                            codeCombinationId: "101-000-4000-000-000", // Revenue P&L
                            enteredCr: 5000,
                            description: "Management Fees Income"
                        }
                    ]
                }
            ]
        };

        const batch = await intercompanyService.createBatch(payload, userId);
        console.log(`   - Batch Created: ${batch.id}, Status: ${batch.status}`);

        if (batch.status !== "DRAFT") throw new Error("Batch should be DRAFT");
        if (Number(batch.totalAmount) !== 5000) throw new Error("Batch Amount mismatch");

        // 2. Submit Batch
        console.log("2. Submitting Batch...");
        await intercompanyService.submitBatch(batch.id);

        const [submittedBatch] = await db.select().from(icBatches).where(eq(icBatches.id, batch.id));
        console.log(`   - Batch Status: ${submittedBatch.status}`);
        if (submittedBatch.status !== "SUBMITTED") throw new Error("Batch should be SUBMITTED");

        // 3. Verify Receiver View
        console.log("3. Verifying Receiver Queue...");
        const inbound = await intercompanyService.getInboundTransactions(receiverOrgId);
        console.log(`   - Found ${inbound.length} inbound transactions.`);

        const txn = inbound.find(t => t.batchId === batch.id);
        if (!txn) throw new Error("Transaction not found in Receiver Queue");
        if (txn.status !== "RECEIVED") throw new Error("Transaction Status mismatch");

        // 4. Receiver Approve
        console.log("4. Receiver Approving...");
        await intercompanyService.respondToTransaction(txn.id, "APPROVE", {
            receiverLines: [
                {
                    codeCombinationId: "102-000-6000-000-000", // Expense P&L
                    enteredDr: 5000,
                    description: "Management Fees Expense"
                }
            ]
        });

        const [approvedHeader] = await db.select().from(icHeaders).where(eq(icHeaders.id, txn.id));
        console.log(`   - Transaction Status: ${approvedHeader.status}`);
        if (approvedHeader.status !== "APPROVED") throw new Error("Transaction should be APPROVED");

        // Verify Lines
        const lines = await db.select().from(icLines).where(eq(icLines.headerId, txn.id));
        console.log(`   - Total Lines: ${lines.length}`);

        // Expected: 1 Provider Line + 1 Receiver Line
        const providerLine = lines.find(l => l.side === "PROVIDER");
        const receiverLine = lines.find(l => l.side === "RECEIVER");

        if (!providerLine) throw new Error("Missing Provider Line");
        if (!receiverLine) throw new Error("Missing Receiver Line");

        console.log(`   - Provider Line (Revenue): ${providerLine.enteredCr} CR`);
        console.log(`   - Receiver Line (Expense): ${receiverLine.enteredDr} DR`);

        console.log("✅ Intercompany Engine Verified!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyIcEngine();
