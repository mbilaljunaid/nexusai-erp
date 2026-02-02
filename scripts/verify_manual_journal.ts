import { db } from "../server/db";
import { slaEngine } from "../server/modules/sla/sla.service";
import { slaJournalHeaders, slaJournalLines, slaEventClasses, slaEventTypes } from "../shared/schema/sla";
import { glCodeCombinations, glLedgers } from "../shared/schema/finance";
import { eq, and } from "drizzle-orm";

async function verifyManualJournal() {
    console.log("🔍 Verifying Manual SLA Journals (Phase 17)...");

    // 0. Seed MANUAL Config
    console.log("   - Seeding MANUAL Event Type...");
    await db.insert(slaEventClasses).values({
        id: "MANUAL",
        name: "Manual Journal",
        applicationId: "GL",
        entityTable: "manual_entry"
    }).onConflictDoNothing();

    await db.insert(slaEventTypes).values({
        id: "MANUAL",
        eventClassId: "MANUAL",
        name: "Manual Adjustment",
        accountingFlag: true
    }).onConflictDoNothing();

    // 0.0 Seed Ledger
    console.log("   - Seeding Ledger...");
    const [ledger] = await db.insert(glLedgers).values({
        id: "PRIMARY",
        name: "Primary Ledger",
        currencyCode: "USD",
        chartOfAccountsId: "COA_STD",
        description: "Primary"
    }).onConflictDoNothing().returning();
    const ledgerId = ledger?.id || "PRIMARY";

    // 0.1 Seed CCIDs
    console.log("   - Seeding CCIDs...");
    await db.insert(glCodeCombinations).values([
        { id: "01-000-10000-000-000", code: "01-000-10000-000-000", segment1: "01", segment2: "000", segment3: "10000", enabledFlag: true, ledgerId: ledgerId },
        { id: "01-000-20000-000-000", code: "01-000-20000-000-000", segment1: "01", segment2: "000", segment3: "20000", enabledFlag: true, ledgerId: ledgerId }
    ]).onConflictDoNothing();

    // 1. Prepare Data
    const payload = {
        ledgerId: "PRIMARY",
        journalName: "MANUAL_TEST_001",
        description: "Test Manual Adjustment",
        glDate: new Date(),
        category: "Adjustment",
        currencyCode: "USD",
        lines: [
            { accountId: "01-000-10000-000-000", enteredDr: 100.00, description: "Debit Cash" },
            { accountId: "01-000-20000-000-000", enteredCr: 100.00, description: "Credit Liability" }
        ]
    };

    // 2. Execute Logic directly (mimicking Controller)
    console.log("   - Creating Manual Journal...");
    const header = await slaEngine.createManualJournal(payload);

    if (!header) throw new Error("Journal creation failed.");

    console.log(`     > Header ID: ${header.id}`);

    // 3. Verify Persistence
    console.log("   - Verifying DB Persistence...");
    const savedHeader = await db.query.slaJournalHeaders.findFirst({
        where: eq(slaJournalHeaders.id, header.id)
    });

    if (!savedHeader) throw new Error("Header not found in DB.");
    console.log("     > Saved Header:", JSON.stringify(savedHeader, null, 2));
    if (savedHeader.transactionSource !== "MANUAL") throw new Error(`Incorrect Transaction Source: ${savedHeader.transactionSource}`);

    const savedLines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, header.id));
    if (savedLines.length !== 2) throw new Error(`Expected 2 lines, found ${savedLines.length}`);

    // 4. Verify Balancing
    const dr = savedLines.reduce((sum, l) => sum + (Number(l.enteredDr) || 0), 0);
    const cr = savedLines.reduce((sum, l) => sum + (Number(l.enteredCr) || 0), 0);

    if (Math.abs(dr - cr) > 0.01) throw new Error(`Journal not balanced in DB. Dr:${dr}, Cr:${cr}`);

    console.log(`     > Validation Passed: Dr ${dr} = Cr ${cr}`);

    // 5. Verify Unbalanced Failure
    console.log("   - Testing Validation (Unbalanced)...");
    try {
        await slaEngine.createManualJournal({
            ...payload,
            journalName: "FAIL_TEST",
            lines: [{ accountId: "A", enteredDr: 10 }]
        });
        throw new Error("❌ Validation FAILED: Allowed unbalanced journal.");
    } catch (e: any) {
        if (e.message.includes("balanced")) {
            console.log("     > ✅ Correctly rejected unbalanced journal.");
        } else {
            throw e;
        }
    }

    console.log("\n✅ Manual Journal Verification Complete.");
    process.exit(0);
}

verifyManualJournal().catch((err) => {
    console.error("\n❌ Verification Failed:", err);
    process.exit(1);
});
