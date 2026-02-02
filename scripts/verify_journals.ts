
import { db } from "../server/db";
import { glJournals, glJournalLines, glApprovalHistory, glApprovalRules } from "../shared/schema";
import { journalService } from "../server/modules/finance/journal.service";
import { financeService } from "../server/modules/finance/finance.service";
import { eq } from "drizzle-orm";

async function verifyJournals() {
    console.log("🔍 Verifying Enterprise Journals...");

    // 1. Setup Rule
    console.log("   - Setting up Approval Rule...");
    await db.delete(glApprovalRules).where(eq(glApprovalRules.ledgerId, "PRIMARY"));
    await db.insert(glApprovalRules).values({
        ruleName: "Test Rule > 1000",
        ledgerId: "PRIMARY",
        minAmount: "1000",
        approverRole: "Manager",
        approverUserId: "test-approver",
        priority: 1,
        enabled: true
    });

    // 2. Create Journal
    console.log("   - Creating Journal (Amount: 5000)...");
    // Note: financeService.createJournal expects (header, lines, userId)
    const journal = await financeService.createJournal({
        journalNumber: `TEST-${Date.now()}`,
        description: "Test Journal for Approval",
        ledgerId: "PRIMARY",
        currencyCode: "USD",
        source: "Manual",
        status: "Draft",
    }, [
        { accountId: "100-1110-000", enteredDebit: 5000, enteredCredit: 0, description: "Debit" },
        { accountId: "200-2220-000", enteredDebit: 0, enteredCredit: 5000, description: "Credit" }
    ], "test-user");

    console.log(`     Created Journal: ${journal.id} (${journal.journalNumber})`);

    // 3. Submit
    console.log("   - Submitting for Approval...");
    const submission = await journalService.submitJournal(journal.id, "test-user");
    console.log(`     Submission Result: ${submission.status} (${submission.message})`);

    if (submission.status !== "Pending") {
        console.error("❌ Expected Pending status for >1000 amount.");
        process.exit(1);
    }

    // 4. Verify History
    const history = await journalService.getAuditLogs(journal.id);
    console.log(`     Audit Logs Found: ${history.length}`);
    if (history.length === 0) {
        console.error("❌ No Audit Logs found.");
        process.exit(1);
    }
    console.log(`     Last Action: ${history[0].action}`);

    // 5. Approve
    console.log("   - Approving...");
    await journalService.approveJournal(journal.id, "test-approver", "Looks good");

    // Check status
    const [finalJournal] = await db.select().from(glJournals).where(eq(glJournals.id, journal.id));
    console.log(`     Final Status: ${finalJournal.approvalStatus}`);

    if (finalJournal.approvalStatus !== "Approved") {
        console.error("❌ Journal not approved.");
        process.exit(1);
    }

    console.log("✅ Enterprise Journals Verification Passed!");
    process.exit(0);
}

verifyJournals().catch((err) => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
