
import 'dotenv/config';
import { financeService } from '../server/services/finance';
import { storage } from '../server/storage';
import { db } from '../server/db';
import { glJournals, glPeriods } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function testIntercompany() {
    console.log("Testing Intercompany Balancing...");

    // 1. Setup Test Journal Data
    const rules = await storage.listIntercompanyRules();
    console.log("Existing Rules:", JSON.stringify(rules, null, 2));

    const journalId = randomUUID();
    const ledgerId = "primary-ledger-001";
    const periodName = "Jan-2026";
    // We need a valid Period ID.
    const periods = await financeService.listPeriods();
    let period = periods.find(p => p.periodName === periodName);
    if (!period) {
        console.log("Period Jan-2026 not found, creating it...");
        const [newPeriod] = await db.insert(glPeriods).values({
            periodName,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-01-31"),
            fiscalYear: 2026,
            status: "Open"
        }).returning();
        period = newPeriod;
    }

    // Scenario: Co 102 pays for Co 101 Expense.
    // Dr Expense (101) 1000 -> Co 101 Net Dr 1000 (Needs Cr)
    // Cr Cash (102) 1000    -> Co 102 Net Cr 1000 (Needs Dr)

    // We need valid CCIDs for these lines.
    // 101-000-5000 (Expense) a fake expense
    // 102-000-1000 (Cash)
    const ccidExp101 = await storage.getOrCreateCodeCombination(ledgerId, ["101", "000", "5000", "000", "000"]);
    const ccidCash102 = await storage.getOrCreateCodeCombination(ledgerId, ["102", "000", "1000", "000", "000"]);

    console.log("Creating Journal...");
    await financeService.createJournal({
        id: journalId,
        journalNumber: `JE-IC-${Date.now()}`,
        ledgerId, // Note: Schema might vary, checking implementation
        periodId: period.id,
        source: "Manual",
        status: "Draft",
        approvalStatus: "Approved", // Auto-approve for test
        currencyCode: "USD",
        description: "Test Intercompany Journal",
        totalDebit: "1000",
        totalCredit: "1000"
    }, [
        {
            journalId,
            accountId: ccidExp101.id,
            description: "Expense in Co 101",
            enteredDebit: "1000",
            enteredCredit: "0",
            currencyCode: "USD"
        },
        {
            journalId,
            accountId: ccidCash102.id,
            description: "Paid by Co 102",
            enteredDebit: "0",
            enteredCredit: "1000",
            currencyCode: "USD"
        }
    ]);

    // 2. Post Journal
    console.log(`Posting Journal ${journalId}...`);
    try {
        await financeService.postJournal(journalId);
        console.log("Journal Posted.");
    } catch (e) {
        console.error("Posting Failed:", e);
        process.exit(1);
    }

    // 3. Verify Lines
    const lines = await storage.listGlJournalLines(journalId);
    console.log(`Total Lines after Posting: ${lines.length}`);

    if (lines.length !== 4) {
        console.error("FAILURE: Expected 4 lines (2 Original + 2 Intercompany). Found " + lines.length);
        console.log(JSON.stringify(lines, null, 2));
        process.exit(1);
    }

    // Check content
    const descriptions = lines.map(l => l.description);
    const hasDueTo = descriptions.some(d => d && d.includes("Due to 102"));
    const hasDueFrom = descriptions.some(d => d && d.includes("Due from 101"));

    if (hasDueTo && hasDueFrom) {
        console.log("SUCCESS: Intercompany lines generated correctly.");
    } else {
        console.error("FAILURE: Missing expected Intercompany descriptions.");
        console.log(descriptions);
        process.exit(1);
    }

    // Cleanup (optional)
    await db.delete(glJournals).where(eq(glJournals.id, journalId));

    process.exit(0);
}

testIntercompany();
