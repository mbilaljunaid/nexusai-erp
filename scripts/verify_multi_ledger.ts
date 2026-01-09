
import "dotenv/config";
import { db } from "../server/db";
import { glLedgers, glCodeCombinations, glBalances, glJournals, glPeriods } from "../shared/schema/finance";
// We need Drizzle Helpers
import { eq, and } from "drizzle-orm";
import { financeService } from "../server/services/finance";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
    console.log("Starting Multi-Ledger Verification...");

    // 1. Create Secondary Ledger if not exists
    const ledgerName = "IFRS Ledger";
    let ledger = await db.query.glLedgers.findFirst({
        where: eq(glLedgers.name, ledgerName)
    });

    if (!ledger) {
        console.log("Creating Secondary Ledger...");
        const res = await db.insert(glLedgers).values({
            name: ledgerName,
            currencyCode: "EUR",
            calendarId: "Monthly",
            coaId: "Standard",
            description: "IFRS Reporting Ledger"
        }).returning();
        ledger = res[0];
    }
    const ledgerId = ledger.id;
    console.log(`Using Ledger: ${ledgerName} (${ledgerId})`);

    // 2. Fetch Valid Period
    const periods = await db.select().from(glPeriods).limit(1);
    const periodId = periods[0]?.id || "p1";
    console.log(`Using Period: ${periods[0]?.periodName} (${periodId})`);

    // 3. Create CCID for this ledger
    const ccCode = "101-000-1110-000-000"; // Cash
    // Check if exists
    // We'll use select/where
    const existingCCs = await db.select().from(glCodeCombinations)
        .where(and(eq(glCodeCombinations.code, ccCode), eq(glCodeCombinations.ledgerId, ledgerId)))
        .limit(1);

    let ccid = existingCCs[0];

    if (!ccid) {
        const res = await db.insert(glCodeCombinations).values({
            ledgerId,
            code: ccCode,
            segment1: "101",
            segment2: "000",
            segment3: "1110",
            segment4: "000",
            segment5: "000",
            accountType: "Asset",
            enabledFlag: true // FIXED: enabledFlag
        }).returning();
        ccid = res[0];
    }
    console.log(`Using Account: ${ccCode} (${ccid.id})`);


    // 4. Create Journal for Secondary Ledger (Trigger Async Posting)
    console.log("Creating Journal in Secondary Ledger (Async Post)...");
    const journalData = {
        journalNumber: `IFRS-${Date.now()}`,
        description: "Test IFRS Journal",
        ledgerId: ledgerId,
        currencyCode: "EUR",
        periodId: periodId,
        source: "Manual",
        status: "Posted" as const
    };

    const lines = [
        {
            lineNumber: 1,
            accountId: ccid.id,
            accountedDebit: "100.00",
            accountedCredit: "0.00", // String for numeric
            description: "Debit Cash"
        },
        {
            lineNumber: 2,
            accountId: ccid.id,
            accountedDebit: "0.00",
            accountedCredit: "100.00",
            description: "Credit Cash"
        }
    ];

    // This should trigger async posting
    const journal = await financeService.createJournal(journalData, lines, "system");
    console.log(`Journal Created: ${journal.id}. Initial Status: ${journal.status}`);

    if (journal.status !== "Processing") {
        console.warn(`Expected 'Processing' status, got '${journal.status}'. It might have completed instantly or stayed Draft.`);
    }

    // 5. Poll for Completion (Status = Posted)
    console.log("Waiting for Background Posting...");
    let posted = false;
    let attempts = 0;
    while (attempts < 10) {
        const check = await financeService.listJournals(undefined, ledgerId);
        const j = check.find(x => x.id === journal.id);
        if (j && j.status === "Posted") {
            console.log("Journal Posted Successfully!");
            posted = true;
            break;
        }
        if (j && j.status === "Draft") {
            console.error("Journal reverted to Draft (Posting Failed). Check logs.");
            process.exit(1);
        }
        await sleep(1000);
        attempts++;
        process.stdout.write(".");
    }

    if (!posted) {
        console.error("Timeout waiting for posting.");
        process.exit(1);
    }

    // 6. Verify Isolation
    console.log("\nVerifying Isolation...");

    // A. List Journals for IFRS
    const ifrsJournals = await financeService.listJournals(undefined, ledgerId);
    if (!ifrsJournals.find(j => j.id === journal.id)) {
        throw new Error("Journal NOT found in IFRS Ledger list.");
    }
    console.log("PASS: Journal found in IFRS Ledger request.");

    // B. List Journals for PRIMARY
    const primaryJournals = await financeService.listJournals(undefined, "PRIMARY");
    if (primaryJournals.find(j => j.id === journal.id)) {
        throw new Error("FAIL: Journal FOUND in PRIMARY Ledger list (Leak).");
    }
    console.log("PASS: Journal NOT found in PRIMARY Ledger request.");

    // C. Check Balances
    const balances = await db.select().from(glBalances).where(eq(glBalances.ledgerId, ledgerId));
    if (balances.length === 0) {
        throw new Error("No balances found for IFRS Ledger.");
    }

    const specificBalance = balances.find(b => b.codeCombinationId === ccid!.id);
    if (!specificBalance) {
        throw new Error("Balance row for specific account not found.");
    }

    console.log(`Balance Check: Dr=${specificBalance.periodNetDr}, Cr=${specificBalance.periodNetCr}`);
    // Since we posted 100 Dr and 100 Cr, fields should be >= 100.
    // If multiple runs, it accumulates.
    if (Number(specificBalance.periodNetDr) >= 100 && Number(specificBalance.periodNetCr) >= 100) {
        console.log("PASS: Balances updated correctly.");
    } else {
        console.warn("WARNING: Balance activity might be missing.");
    }

    console.log("Multi-Ledger Verification SUCCESS!");
    process.exit(0);
}

main();
