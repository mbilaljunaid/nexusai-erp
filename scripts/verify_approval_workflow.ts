
import { db } from "../server/db";
import { glJournals, glJournalLines, glApprovalRules, glApprovalHistory } from "../shared/schema/finance";
import { FinanceService } from "../server/services/finance";
import { eq } from "drizzle-orm";

const financeService = new FinanceService();

async function run() {
    console.log("Starting Approval Workflow Verification...");

    const ledgerId = "PRIMARY";
    const approverId = "verifier-admin";

    // 1. Setup Rule
    console.log("1. Setting up Approval Rule (Limit > 1000)...");
    await db.delete(glApprovalRules).where(eq(glApprovalRules.ledgerId, ledgerId)); // Clear old rules
    await db.insert(glApprovalRules).values({
        ruleName: "High Value Journal Rule",
        ledgerId,
        minAmount: "1000",
        approverRole: "Controller",
        enabled: true
    });

    // 2. Create LOW Value Journal (Should NOT require approval)
    console.log("2. Creating Low Value Journal (500)...");
    const lowJournal = await financeService.createJournal({
        journalNumber: `JE-LOW-${Date.now()}`,
        ledgerId,
        description: "Low Value Test",
        currencyCode: "USD",
        status: "Draft",
        approvalStatus: "Not Required"
    }, [
        { accountId: "100-000-000", enteredDebit: "500", currencyCode: "USD" },
        { accountId: "200-000-000", enteredCredit: "500", currencyCode: "USD" }
    ], approverId);

    const lowStatus = await financeService.evaluateApprovalRule(lowJournal as any, 500);
    if (lowStatus !== "Not Required") throw new Error(`Low value journal should be Not Required, got ${lowStatus}`);
    console.log("   -> Low Value Journal Checked: Not Required (Pass)");


    // 3. Create HIGH Value Journal (Should Require Approval)
    console.log("3. Creating High Value Journal (2000)...");
    const highJournal = await financeService.createJournal({
        journalNumber: `JE-HIGH-${Date.now()}`,
        ledgerId,
        description: "High Value Test",
        currencyCode: "USD",
        status: "Draft",
        approvalStatus: "Not Required" // Default
    }, [
        { accountId: "100-000-000", enteredDebit: "2000", currencyCode: "USD" },
        { accountId: "200-000-000", enteredCredit: "2000", currencyCode: "USD" }
    ], approverId);

    // 4. Submit for Approval
    console.log("4. Submitting for Approval...");
    const submitResult = await financeService.submitJournalForApproval(highJournal.id, approverId);
    console.log("DEBUG: submitResult:", JSON.stringify(submitResult));
    if (submitResult.status !== "Pending") throw new Error(`Submission failed. Expected Pending, got ${submitResult?.status}`);

    const pendingJournal = await db.select().from(glJournals).where(eq(glJournals.id, highJournal.id)).then(r => r[0]);
    console.log(`   -> Journal Status: ${pendingJournal.approvalStatus} (Pass)`);

    // 5. Try to Post (Should Fail)
    console.log("5. Attempting to Post Pending Journal (Should Fail)...");
    try {
        await financeService.postJournal(highJournal.id, approverId);
        throw new Error("Posting succeeded but should have failed!");
    } catch (e: any) {
        if (!e.message.includes("pending approval")) throw new Error(`Wrong error message: ${e.message}`);
        console.log("   -> Posting blocked correctly (Pass)");
    }

    // 6. Approve
    console.log("6. Approving Journal...");
    await financeService.approveJournal(highJournal.id, approverId, "Looks good!");

    // 7. Post (Should Succeed)
    // 7. Post (Should Succeed)
    console.log("7. Posting Approved Journal (Async)...");
    await financeService.postJournal(highJournal.id, approverId);

    // Poll for completion
    let finalJournal;
    for (let i = 0; i < 10; i++) {
        finalJournal = await db.select().from(glJournals).where(eq(glJournals.id, highJournal.id)).then(r => r[0]);
        if (finalJournal.status === "Posted") break;
        if (finalJournal.status === "Error") throw new Error("Posting failed with Error status");
        console.log(`   ... waiting for posting (current: ${finalJournal?.status})`);
        await new Promise(r => setTimeout(r, 1000));
    }

    if (finalJournal.status !== "Posted") throw new Error(`Final status should be Posted, got ${finalJournal.status}`);
    console.log("   -> Posting Succeeded (Pass)");

    console.log("verification_complete");
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
