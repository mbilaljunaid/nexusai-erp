import "dotenv/config";
import { db } from "../server/db";
import { storage } from "../server/storage";
import { FinanceService } from "../server/services/finance";
import { glCrossValidationRules, glJournals, glJournalLines, glCodeCombinations, glPeriods } from "../shared/schema";
import { eq, and } from "drizzle-orm";

const financeService = new FinanceService();

async function verifyCVRAndApprovals() {
    console.log("🚀 Starting CVR & Approvals Verification...");

    try {
        const PERIOD_NAME = "Jan-2026";
        // 0. Resolve Ledger ID
        // Hardcoding "PRIMARY" might fail if system uses UUIDs.
        // Let's get the first ledger or use PRIMARY if none.
        const [ledger] = await storage.listGlLedgers();
        const LEDGER_ID = ledger?.id || "PRIMARY";
        console.log(`Using Ledger ID: ${LEDGER_ID}`);

        // 1. Cleanup
        console.log("1. Cleaning up...");
        await db.delete(glCrossValidationRules).where(eq(glCrossValidationRules.ledgerId, LEDGER_ID));
        // We don't delete journals here to keep history, but we'll use unique numbers.

        // Ensure Period
        const [period] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, PERIOD_NAME));
        const periodId = period?.id || (await storage.createGlPeriod({
            periodName: PERIOD_NAME,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-01-31"),
            fiscalYear: 2026,
            status: "Open"
        })).id;


        // 2. Setup CVR Rule
        // Rule: "No Ops Dept (200) for Sales Company (102)"
        // Include: Segment1=102 (Sales Co)
        // Exclude: Segment2=200 (Ops Dept)
        console.log("2. Seeding CVR Rule...");
        await db.insert(glCrossValidationRules).values({
            ledgerId: LEDGER_ID,
            ruleName: "No Ops for Sales",
            description: "Sales Company cannot book to Ops Dept",
            enabled: true,
            includeFilter: "segment1=102",
            excludeFilter: "segment2=200",
            errorMessage: "Sales Co (102) cannot use Ops Dept (200)"
        });

        // 3. Test CVR Violation
        console.log("3. Testing CVR Violation...");
        const badCC = await storage.getOrCreateCodeCombination(LEDGER_ID, ["102", "200", "5000", "000"]); // Violation!
        const goodCC = await storage.getOrCreateCodeCombination(LEDGER_ID, ["102", "100", "5000", "000"]); // Good (Sales Dept)

        const journalCVR = await storage.createGlJournal({
            journalNumber: `CVR-TEST-${Date.now()}`,
            ledgerId: LEDGER_ID,
            periodId: periodId,
            description: "CVR Violation Test",
            status: "Draft",
            approvalStatus: "Not Required"
        });

        console.log(`Created Journal ${journalCVR.journalNumber} with ID: ${journalCVR.id} and LedgerID: ${journalCVR.ledgerId}`);

        await storage.createGlJournalLine({
            journalId: journalCVR.id,
            accountId: badCC.id,
            debit: "100",
            credit: "0"
        });
        await storage.createGlJournalLine({
            journalId: journalCVR.id,
            accountId: goodCC.id,
            debit: "0",
            credit: "100"
        });

        try {
            await (financeService as any).processPostingInBackground(journalCVR.id, "SYSTEM");
            throw new Error("CVR Check Failed (Should have blocked posting)");
        } catch (e: any) {
            console.log(`✅ Expected Error: ${e.message}`);
            if (!e.message.includes("Cross Validation Rule Failed")) throw new Error("Wrong error for CVR");
        }


        // 4. Test Approval Workflow
        console.log("4. Testing Approval Workflow...");
        const journalApproval = await storage.createGlJournal({
            journalNumber: `APP-TEST-${Date.now()}`,
            ledgerId: LEDGER_ID,
            periodId: periodId,
            description: "Approval Test",
            status: "Draft",
            approvalStatus: "Required" // Blocked!
        });

        // Use Good CCs
        await storage.createGlJournalLine({
            journalId: journalApproval.id,
            accountId: goodCC.id,
            debit: "500",
            credit: "0"
        });
        const cashCC = await storage.getOrCreateCodeCombination(LEDGER_ID, ["102", "000", "1000", "000"]);
        await storage.createGlJournalLine({
            journalId: journalApproval.id,
            accountId: cashCC.id,
            debit: "0",
            credit: "500"
        });

        // Try Posting (Should Fail)
        try {
            await (financeService as any).processPostingInBackground(journalApproval.id, "SYSTEM");
            throw new Error("Approval Check Failed (Should have blocked posting)");
        } catch (e: any) {
            console.log(`✅ Expected Error: ${e.message}`);
            if (!e.message.includes("requires approval")) throw new Error("Wrong error for Approval");
        }

        // Submit & Approve
        console.log("Submitting for Approval...");
        await financeService.submitJournalForApproval(journalApproval.id, "USER1");

        console.log("Approving...");
        await financeService.approveJournal(journalApproval.id, "MANAGER", "Approve");

        // Try Posting Again (Should Pass)
        console.log("Posting Approved Journal...");
        await (financeService as any).processPostingInBackground(journalApproval.id, "SYSTEM");

        const postedJournal = await storage.getGlJournal(journalApproval.id);
        console.log(`Journal Status: ${postedJournal?.status}`);
        if (postedJournal?.status !== "Posted") throw new Error("Journal did not post after approval");

        console.log("✅ CVR & Approvals Verification Passed!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyCVRAndApprovals();
