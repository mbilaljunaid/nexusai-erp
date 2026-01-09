import "dotenv/config";
import { db } from "../server/db";
import { storage } from "../server/storage";
import { FinanceService } from "../server/services/finance";
import { glBudgets, glBudgetBalances, glBudgetControlRules, glCodeCombinations, glJournals, glJournalLines, glBalances, glPeriods } from "../shared/schema";
import { eq, and } from "drizzle-orm";

const financeService = new FinanceService();

async function verifyBudgetaryControl() {
    console.log("🚀 Starting Budgetary Control Verification...");

    const LEDGER_ID = "PRIMARY";
    const PERIOD_NAME = "Budget-Test-2026";

    try {
        // 1. Setup Test Data
        console.log("1. Seeding Data...");

        // Cleanup
        await db.delete(glJournalLines);
        await db.delete(glJournals);
        await db.delete(glBudgets).where(eq(glBudgets.ledgerId, LEDGER_ID));
        await db.delete(glBudgetControlRules).where(eq(glBudgetControlRules.ledgerId, LEDGER_ID));

        const [period] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, PERIOD_NAME));
        const periodId = period?.id || (await storage.createGlPeriod({
            periodName: PERIOD_NAME,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-01-31"),
            fiscalYear: 2026,
            status: "Open"
        })).id;

        const ccRent = await storage.getOrCreateCodeCombination(LEDGER_ID, ["101", "000", "5000", "000"]); // Rent Expense

        // 2. Create Budget
        const budget = await storage.createGlBudget({
            name: "2026 Q1 Budget",
            ledgerId: LEDGER_ID,
            status: "Open"
        });

        // Seed $1000 budget for Rent
        await storage.createGlBudgetBalance({
            budgetId: budget.id,
            periodName: PERIOD_NAME,
            codeCombinationId: ccRent.id,
            budgetAmount: "1000.00",
            actualAmount: "0.00",
            encumbranceAmount: "0.00"
        });

        // 3. Define Rule (Absolute)
        await storage.createGlBudgetControlRule({
            ledgerId: LEDGER_ID,
            ruleName: "Rent Control",
            controlLevel: "Absolute",
            controlFilters: { segment3: { min: "5000", max: "5000" } }
        });

        console.log("✅ Budget & Rules Seeded.");

        // 4. Test Scenario A: Successful Spend ($600)
        console.log("2. Testing Successful Spend ($600)...");
        const journalPass = await storage.createGlJournal({
            journalNumber: "BUD-PASS-001",
            ledgerId: LEDGER_ID,
            periodId: periodId,
            description: "Rent Payment Part 1",
            status: "Draft"
        });

        // Rent Line ($600 Debit)
        await storage.createGlJournalLine({
            journalId: journalPass.id,
            accountId: ccRent.id,
            debit: "600.00",
            credit: "0.00",
            description: "Rent"
        });

        // Cash Offset ($600 Credit - Account 1000)
        const ccCash = await storage.getOrCreateCodeCombination(LEDGER_ID, ["101", "000", "1000", "000"]);
        await storage.createGlJournalLine({
            journalId: journalPass.id,
            accountId: ccCash.id,
            debit: "0.00",
            credit: "600.00",
            description: "Cash"
        });

        // Post
        console.log("Posting Journal BUD-PASS-001...");
        await (financeService as any).processPostingInBackground(journalPass.id, "SYSTEM");

        // Check Actuals Updated
        const balAfterPass = await storage.getGlBudgetBalance(budget.id, PERIOD_NAME, ccRent.id);
        console.log(`Actual Amount after post: ${balAfterPass?.actualAmount} (Expected 600)`);
        if (Number(balAfterPass?.actualAmount) !== 600) throw new Error("Actual amount not updated correctly");

        // 5. Test Scenario B: Overspend ($500 more -> Total $1100 > $1000)
        console.log("3. Testing Overspend ($500 more)...");
        const journalFail = await storage.createGlJournal({
            journalNumber: "BUD-FAIL-001",
            ledgerId: LEDGER_ID,
            periodId: periodId,
            description: "Rent Payment Part 2 - Overlimit",
            status: "Draft"
        });

        await storage.createGlJournalLine({
            journalId: journalFail.id,
            accountId: ccRent.id,
            debit: "500.00",
            credit: "0.00",
            description: "Rent Overspend"
        });

        await storage.createGlJournalLine({
            journalId: journalFail.id,
            accountId: ccCash.id,
            debit: "0.00",
            credit: "500.00",
            description: "Cash Offset"
        });

        console.log("Attempting to post over-budget journal (Expect failure)...");
        await (financeService as any).processPostingInBackground(journalFail.id, "SYSTEM");

        const journalFailResult = await storage.getGlJournal(journalFail.id);
        console.log(`Journal Status after failed funds check: ${journalFailResult?.status} (Expected Draft)`);

        if (journalFailResult?.status !== "Draft") {
            throw new Error("Journal should have been reset to Draft status after funds check failure.");
        }

        console.log("✅ Budgetary Control Verification Passed!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyBudgetaryControl();
