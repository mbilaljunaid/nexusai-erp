
import "dotenv/config";
import { db } from "../server/db";
import { glJournals, glAutoPostRules } from "../shared/schema/finance";
import { financeService } from "../server/services/finance";
import { eq } from "drizzle-orm";

async function verifyPostingRules() {
    console.log("Starting Auto-Post Verification...");

    const ledgerId = "primary-ledger-id";
    const ruleName = "AUTO_POST_SMALL_SPREADSHEET";

    try {
        // 1. Clean up
        const existingRules = await financeService.listAutoPostRules(ledgerId);
        for (const r of existingRules) {
            if (r.criteriaName === ruleName) {
                await financeService.deleteAutoPostRule(r.id);
            }
        }

        // 2. Create Rule
        console.log("Creating Auto-Post Rule...");
        await financeService.createAutoPostRule({
            criteriaName: ruleName,
            ledgerId,
            source: "Spreadsheet",
            amountLimit: "1000",
            enabled: true
        });

        // 3. Create Candidate Journal (Should Post)
        console.log("Creating Journal < $1000...");
        const passLines = [{
            accountId: "dummy-account-id",
            debit: "500.00",
            credit: "500.00"
        }];
        const journalPass = await financeService.createJournal({
            journalNumber: `AP-TEST-${Date.now()}-PASS`,
            ledgerId,
            source: "Spreadsheet",
            description: "Small Spreadsheet Entry",
            status: "Unposted",
            currencyCode: "USD",
        }, passLines as any);

        // 4. Create Non-Candidate Journal (Should NOT Post)
        console.log("Creating Journal > $1000...");
        const failLines = [{
            accountId: "dummy-account-id",
            debit: "1500.00",
            credit: "1500.00"
        }];
        const journalFail = await financeService.createJournal({
            journalNumber: `AP-TEST-${Date.now()}-FAIL`,
            ledgerId,
            source: "Spreadsheet",
            description: "Large Spreadsheet Entry",
            status: "Unposted",
            currencyCode: "USD",
        }, failLines as any);

        // Mock total debits for logic check (since we aren't creating lines here)
        // Hack: Update totalDebits directly for test
        // Note: In real app, totalDebits is calculated from lines. 
        // We'll update glJournalBatches or glJournals. 
        // Wait, finance.ts logic checks `batch.totalDebits`.
        // Let's update `totalDebits` (Wait, glJournals table doesn't have totalDebits in schema above? 
        // GlJournalBatches has it. GlJournals connects to batches. 
        // The implementation in finance.ts creates a Batch automatically? 
        // Actually financeService.createJournal creates a header. 
        // Let's check `finance.ts` implementation of `processAutoPosting`.
        // It selects from `glJournals`. 
        // Ah, `glJournals` schema doesn't have `totalDebits`. 
        // `glJournalBatches` has it.
        // My implementation of `processAutoPosting` in finance.ts checks `batch.totalDebits`.
        // But it selects from `glJournals`! This is a bug in my implementation.
        // I need to fix `processAutoPosting` to check headers or join batches.
        // Or assume `glJournals` has the info.

        // Let's run this script to confirm failure, then fix.
        await financeService.processAutoPosting(ledgerId);

    } catch (error) {
        console.error("Verification Failed:", error);
    } finally {
        process.exit(0);
    }
}

verifyPostingRules();
