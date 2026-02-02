
import 'dotenv/config';
import { db } from "../server/db";
import { financeService } from "../server/services/finance";
import { glJournals, glJournalLines } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { metadataRegistry } from "../metadata";

// Mock Express Request/Response for testing routes logic or duplicate logic here?
// Best to test via FinanceService directly or simulate route logic.
// Let's test standard FinanceService persistence first, relying on the fact that Routes now call this.

async function verifyPersistence() {
    console.log("Starting Persistence Verification...");

    const testFormId = "TEST_FORM_" + Date.now();
    const ledgerId = "PRIMARY";

    // 1. Create a Journal via FinanceService (simulating Route call)
    console.log("Creating Journal via Service...");
    const journalData = {
        journalNumber: `JE-TEST-${Date.now()}`,
        ledgerId: ledgerId,
        description: "Persistence Test Journal",
        source: testFormId,
        status: "Posted" as const,
        category: "Manual",
        currencyCode: "USD"
    };

    // Need valid account IDs for lines. 
    // Let's get or create a code combination.
    const cc = await financeService.getOrCreateCodeCombination(ledgerId, "101-000-1000-000-000"); // Cash

    const lines = [
        {
            accountId: cc.id,
            description: "Debit Cash",
            debit: "100.00",
            credit: "0.00",
            enteredDebit: "100.00",
            enteredCredit: "0.00",
            currencyCode: "USD"
        },
        {
            accountId: cc.id, // For simplicity using same account, balanced
            description: "Credit Cash",
            debit: "0.00",
            credit: "100.00",
            enteredDebit: "0.00",
            enteredCredit: "100.00",
            currencyCode: "USD"
        }
    ];

    const context = { ipAddress: "127.0.0.1", sessionId: "test-session" };
    const createdJournal = await financeService.createJournal(journalData, lines, "test-user", context);
    console.log(`Created Journal ID: ${createdJournal.id}`);

    // 2. Fetch directly from DB to confirm persistence
    console.log("Fetching from DB...");
    const [fetchedJournal] = await db.select().from(glJournals).where(eq(glJournals.id, createdJournal.id));

    if (!fetchedJournal) {
        throw new Error("❌ Journal not found in DB! Persistence failed.");
    }
    console.log("✅ Journal found in DB.");

    if (fetchedJournal.status !== "Posted" && fetchedJournal.status !== "Processing") {
        // Depending on async posting, might be Draft or Processing or Posted
        console.warn(`⚠️ Journal status is ${fetchedJournal.status}. Expected Posted or Processing.`);
    }

    const fetchedLines = await db.select().from(glJournalLines).where(eq(glJournalLines.journalId, createdJournal.id));
    if (fetchedLines.length !== 2) {
        throw new Error(`❌ Expected 2 lines, found ${fetchedLines.length}`);
    }
    console.log("✅ Lines persisted correctly.");

    console.log("✅ Persistence Verification Successful");
}

verifyPersistence().catch((err) => {
    console.error(err);
    process.exit(1);
});
