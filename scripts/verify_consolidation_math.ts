import { db } from "../server/db";
import {
    glLedgers, glPeriods, glLedgerSets, glLedgerSetAssignments,
    glBalances, glDailyRates, glEliminationDefinitions, glCodeCombinations,
    glConsolidationRuns, glJournals, glJournalLines
} from "../shared/schema/finance";
import { ConsolidationService } from "../server/services/ConsolidationService";
import { eq, and, sql } from "drizzle-orm";

async function verifyMath() {
    console.log("Starting Consolidation Math Verification...");

    const service = new ConsolidationService();
    const uniqueId = Date.now().toString();
    const periodName = `Jan-${uniqueId}`;

    // 1. Setup Master Data
    console.log("1. Setting up Test Data...");

    // Ledgers
    const [usLedger] = await db.insert(glLedgers).values({
        name: `US Ledger ${uniqueId}`, currencyCode: "USD"
    }).returning();

    const [euLedger] = await db.insert(glLedgers).values({
        name: `EU Ledger ${uniqueId}`, currencyCode: "EUR"
    }).returning();

    // Ledger Set
    const [ledgerSet] = await db.insert(glLedgerSets).values({
        name: `Global Set ${uniqueId}`
    }).returning();

    await db.insert(glLedgerSetAssignments).values([
        { ledgerSetId: ledgerSet.id, ledgerId: usLedger.id },
        { ledgerSetId: ledgerSet.id, ledgerId: euLedger.id }
    ]);

    // Period (Need one period record, usually global or per ledger. Schema defaults ledgerId=PRIMARY, logic checks periodName)
    // The service checks `glPeriods` by periodName.
    await db.insert(glPeriods).values({
        periodName: periodName,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
        fiscalYear: 2026,
        ledgerId: "PRIMARY"
    });

    // Exchange Rate: EUR -> USD = 1.10
    await db.insert(glDailyRates).values({
        fromCurrency: "EUR",
        toCurrency: "USD",
        conversionDate: new Date("2026-01-31"),
        rate: "1.10"
    });

    // Accounts (CCIDs)
    // Needs Segment3 to be "2000" for our Rule to work (based on service logic split)
    const [apCcid] = await db.insert(glCodeCombinations).values({
        code: `200-00-2000-${uniqueId}`,
        ledgerId: "GLOBAL", // Dummy
        segment3: "2000"
    }).returning();

    // 2. Setup Balances
    console.log("2. Seeding Balances...");

    // EU Ledger has 1000 EUR in AP (Liability = Credit)
    // Net Credit = 1000
    // Net Debit = 0
    await db.insert(glBalances).values({
        ledgerId: euLedger.id,
        codeCombinationId: apCcid.id,
        currencyCode: "EUR",
        periodName: periodName,
        periodNetCr: "1000",
        periodNetDr: "0"
    });

    // 3. Setup Elimination Rule
    // Match Rule "Segment3=2000"
    await db.insert(glEliminationDefinitions).values({
        name: `Eliminate AP ${uniqueId}`,
        matchRule: "Segment3=2000",
        eliminationLedgerId: "ELIM_LEDGER",
        ledgerSetId: ledgerSet.id, // Fixed: Required by DB
        enabled: true
    });

    // 4. Run Consolidation
    console.log("3. Running Consolidation...");
    const result = await service.runConsolidation(ledgerSet.id, periodName, "user-verifier");
    console.log("   -> Run ID:", result.runId);

    // 5. Verify Results
    console.log("4. Verifying Results...");

    // Check Run Status
    const [run] = await db.select().from(glConsolidationRuns).where(eq(glConsolidationRuns.id, result.runId));
    console.log("   -> Run Status:", run.status);
    console.log("   -> Total Eliminated:", run.totalEliminations);

    if (run.status !== "Completed") {
        console.error("Run Error Log:", run.errorLog);
        throw new Error("Run failed");
    }

    // Expected Calculation:
    // Source: 1000 EUR 
    // Rate: 1.10
    // USD Equivalent: 1100
    // Elimination should be 1100.

    if (parseFloat(run.totalEliminations || "0") !== 1100) {
        throw new Error(`Math Mismatch. Expected 1100, got ${run.totalEliminations}`);
    }
    console.log("   -> MATH VERIFIED: 1000 EUR * 1.10 = 1100 USD");

    // Check Journal
    const journals = await db.select().from(glJournals)
        .where(eq(glJournals.journalNumber, `ELIM-${result.runId.substring(0, 8)}-${run.completedDate?.getTime()}`)); // Logic uses Date.now(), hard to guess exactly. 

    // Check by description
    const [journal] = await db.select().from(glJournals)
        .where(
            and(
                eq(glJournals.periodId, periodName),
                eq(glJournals.source, "Consolidation")
            )
        )
        .orderBy(sql`${glJournals.createdAt} DESC`)
        .limit(1);

    if (!journal) throw new Error("Journal not created");

    const lines = await db.select().from(glJournalLines).where(eq(glJournalLines.journalId, journal.id));
    console.log("   -> Journal Lines Found:", lines.length);
    lines.forEach(l => {
        console.log(`      Line: ${l.accountId} | Dr: ${l.enteredDebit} | Cr: ${l.enteredCredit}`);
    });

    console.log("VERIFICATION SUCCESSFUL");
}

verifyMath().catch(e => {
    console.error(e);
    process.exit(1);
});
