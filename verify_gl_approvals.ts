
import { financeService } from "./server/services/finance";
import { storage } from "./server/storage";

async function verifyApprovals() {
    console.log("Starting Journal Approvals Verification...");
    console.log("Storage Provider:", storage.constructor.name);

    try {
        // 1. Create a Batch
        console.log("1. Creating Batch...");
        // Need to import GlJournalBatch to check type if strict, but we'll infer
        const batch = await financeService.createBatch("End of Month Jan 2026", "Monthly closing batch");
        if (!batch) throw new Error("Batch creation returned undefined");
        console.log("   Batch Created:", batch.id, batch.batchName);

        // 2. Create a Journal
        console.log("2. Creating Journal...");
        const journal = await financeService.createJournal(
            {
                journalNumber: "JRN-" + Date.now(),
                description: "Test Journal for Approval",
                periodId: batch.periodId,
                batchId: batch.id,
                approvalStatus: "Required" // Trigger approval logic
            },
            [
                { accountId: "mock-acc-1", debit: "100", credit: "0" },
                { accountId: "mock-acc-2", debit: "0", credit: "100" }
            ]
        );
        console.log("   Journal Created:", journal.id, journal.approvalStatus);

        // 3. Submit for Approval
        console.log("3. Submitting for Approval...");
        const approval = await financeService.submitForApproval(journal.id, "user-admin-1");
        console.log("   Approval Request Created:", approval.id, approval.status);

        if (approval.status === "Pending") {
            console.log("✅ Approval Workflow Verified: Journal is pending approval.");
        } else {
            console.error("❌ Approval Workflow Failed: Status is " + approval.status);
            process.exit(1);
        }

        // 4. Test Reversal (Requires a Posted Journal)
        // Let's create a separate simple posted journal to test reversal quickly
        console.log("4. Testing Reversal...");
        const journalToReverse = await financeService.createJournal(
            {
                journalNumber: "JRN-REV-" + Date.now(),
                description: "To be reversed",
                periodId: batch.periodId,
                status: "Posted", // Manually set to posted for test
            },
            [{ accountId: "acc-1", debit: "500", credit: "0" }, { accountId: "acc-2", debit: "0", credit: "500" }]
        );
        console.log("   Original Journal Created (Posted):", journalToReverse.id);

        const reversal = await financeService.reverseJournal(journalToReverse.id);
        console.log("   Reversal Journal Created:", reversal.id, reversal.journalNumber);

        // Check line swaps
        const revLine1 = reversal.lines.find(l => l.accountId === "acc-1");
        if (revLine1 && Number(revLine1.credit) === 500 && Number(revLine1.debit) === 0) {
            console.log("✅ Reversal Logic Verified: Debits/Credits swapped correctly.");
        } else {
            console.error("❌ Reversal Logic Failed: Lines not swapped.", revLine1);
            process.exit(1);
        }

        process.exit(0);
    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

verifyApprovals();
