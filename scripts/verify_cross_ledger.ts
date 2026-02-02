
import "dotenv/config";
import { db } from "../server/db";
import { intercompanyService } from "../server/modules/intercompany/intercompany.service";
import { financeService } from "../server/modules/finance/finance.service";
import { slaJournalHeaders, slaJournalLines } from "../shared/schema/sla";
import { eq, desc } from "drizzle-orm";

async function main() {
    console.log("🧪 Verifying Cross-Ledger Settlement...");

    const providerId = "ICO-101"; // Ledger US
    const receiverId = "ICO-103"; // Ledger UK

    // Ledger UUIDs
    const LEDGER_US = "ff74def3-c9ee-46b1-b2b0-82432adf33dc";
    const LEDGER_UK = "28281957-a9e7-4868-997a-3c26f297b0c6";

    // 0. Prepare CCIDs
    console.log("0. Preparing Code Combinations...");
    const providerRevenueAccount = await financeService.getOrCreateCodeCombination(LEDGER_US, "101-000-41000-000-000-000-000-000-000-000");
    const receiverExpenseAccount = await financeService.getOrCreateCodeCombination(LEDGER_UK, "103-000-50000-000-000-000-000-000-000-000");

    // 1. Create a Batch
    console.log(`1. Creating Batch: ${providerId} -> ${receiverId} (Amount: 2000)...`);
    const batch = await intercompanyService.createBatch({
        description: "Cross-Ledger Service Fee",
        initiatorOrgId: providerId,
        glDate: new Date().toISOString().split('T')[0],
        currencyCode: "USD",
        transactions: [
            {
                receiverOrgId: receiverId,
                transactionTypeId: "SHARED_SERVICES",
                amount: 2000.00,
                lines: [
                    {
                        codeCombinationId: providerRevenueAccount.id, // Valid ID
                        enteredCr: 2000.00,
                        description: "Consulting Revenue"
                    }
                ]
            }
        ]
    }, "test-user");

    console.log(`Batch Created: ${batch.id}`);

    // 2. Submit Batch
    await intercompanyService.submitBatch(batch.id);
    console.log("Batch Submitted.");

    // 3. Respond (Approve)
    const headers = await intercompanyService.getInboundTransactions(receiverId);
    const targetHeader = headers.find(h => h.batchId === batch.id); // Assuming getInbound returns newly submitted ones

    // Note: getInboundTransactions filters by 'RECEIVED'. submitBatch sets 'RECEIVED'.
    // If the batch was drafted but previously failed submission, it might be in different state?
    // The previous run of this script might have left data.
    // We are creating a NEW batch, so it should be fine.

    if (!targetHeader) {
        throw new Error("Header not found or not in RECEIVED status");
    }

    console.log(`3. Approving Transaction ${targetHeader.id}...`);
    await intercompanyService.respondToTransaction(targetHeader.id, "APPROVE", {
        receiverLines: [
            {
                codeCombinationId: receiverExpenseAccount.id, // Valid ID
                enteredDr: Number(targetHeader.amount),
                description: "Intercompany Service Expense"
            }
        ]
    });

    console.log("Transaction Approved. Checking Accounting...");

    // 4. Verify Accounting (SLA Journals)
    const recentJournals = await db.select().from(slaJournalHeaders)
        .orderBy(desc(slaJournalHeaders.createdAt))
        .limit(10);

    console.log("Recent Journals Found:", recentJournals.map(j => ({ id: j.id, name: j.journalName, ledger: j.ledgerId })));

    const providerJournal = recentJournals.find(j => j.description && j.description.startsWith(`IC Provider: ${targetHeader.id}`));
    const receiverJournal = recentJournals.find(j => j.description && j.description.startsWith(`IC Receiver: ${targetHeader.id}`));

    if (providerJournal) {
        console.log(`✅ Provider Journal Found: ID ${providerJournal.id} (Ledger ${providerJournal.ledgerId})`);
        if (providerJournal.ledgerId !== LEDGER_US) console.error(`❌ Provider Ledger Mismatch! Expected ${LEDGER_US}, Got ${providerJournal.ledgerId}`);
    } else {
        console.error("❌ Provider Journal Missing!");
    }

    if (receiverJournal) {
        console.log(`✅ Receiver Journal Found: ID ${receiverJournal.id} (Ledger ${receiverJournal.ledgerId})`);
        if (receiverJournal.ledgerId !== LEDGER_UK) console.error(`❌ Receiver Ledger Mismatch! Expected ${LEDGER_UK}, Got ${receiverJournal.ledgerId}`);
    } else {
        console.error("❌ Receiver Journal Missing!");
    }

    if (providerJournal && receiverJournal && providerJournal.ledgerId === LEDGER_US && receiverJournal.ledgerId === LEDGER_UK) {
        console.log("✅ SUCCESS: Cross-Ledger Accounting Generated!");
    } else {
        process.exit(1);
    }

    process.exit(0);
}

main().catch(err => {
    console.error("Test Failed:", err);
    process.exit(1);
});
