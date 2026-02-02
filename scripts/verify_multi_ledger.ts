
import { db } from "../server/db";
import { slaEngine } from "../server/modules/sla/sla.service";
import {
    glLedgers, glLedgerRelationships, glDailyRates, glCodeCombinations
} from "../shared/schema/finance";
import {
    slaJournalHeaders, slaJournalLines, slaEventClasses, slaEventTypes, slaJournalLineTypes, slaAccountingRules
} from "../shared/schema/sla";
import { glPeriods } from "../shared/schema/finance";
import { eq, and } from "drizzle-orm";

async function verifyMultiLedger() {
    console.log("🔍 Verifying Multi-Ledger SLA Support (Phase 16)...");

    // 1. Setup / Validate Ledgers
    console.log("   - Setting up Primary & Secondary Ledgers...");

    // Ensure Primary
    const [primary] = await db.insert(glLedgers).values({
        name: "PRIMARY_ML_TEST",
        currencyCode: "USD",
        description: "Primary Ledger for Multi-Ledger Test"
    }).onConflictDoUpdate({ target: glLedgers.name, set: { currencyCode: "USD" } }).returning();

    // Ensure Secondary
    const [secondary] = await db.insert(glLedgers).values({
        name: "SECONDARY_EUR_TEST",
        currencyCode: "EUR",
        description: "Secondary Ledger (EUR) for Multi-Ledger Test"
    }).onConflictDoUpdate({ target: glLedgers.name, set: { currencyCode: "EUR" } }).returning();

    console.log(`     > Primary: ${primary.id} (USD)`);
    console.log(`     > Primary: ${primary.id} (USD)`);
    console.log(`     > Secondary: ${secondary.id} (EUR)`);

    // 1.1 Ensure Period is Open for Primary
    console.log("   - Opening Period 'Jan-2026'...");
    // Check if period exists
    const existingPeriod = await db.query.glPeriods.findFirst({
        where: and(eq(glPeriods.periodName, "Jan-2026"), eq(glPeriods.ledgerId, primary.id))
    });

    if (existingPeriod) {
        await db.update(glPeriods)
            .set({
                status: "Open",
                endDate: new Date("2026-02-01") // Force extend date for existing record
            })
            .where(eq(glPeriods.id, existingPeriod.id));
    } else {
        await db.insert(glPeriods).values({
            periodName: "Jan-2026",
            ledgerId: primary.id,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-02-01"), // Extend to Feb 1st to cover full Jan 31st
            fiscalYear: 2026,
            status: "Open"
        });
    }

    // 2. Setup Relationship
    console.log("   - Establishing Ledger Relationship...");
    await db.insert(glLedgerRelationships).values({
        primaryLedgerId: primary.id,
        secondaryLedgerId: secondary.id,
        relationshipType: "SECONDARY",
        conversionLevel: "JOURNAL"
    }).onConflictDoNothing(); // Assume uniqueness or minimal dups for test

    // 3. Setup FX Rate
    console.log("   - Seeding FX Rate (USD -> EUR = 0.85)...");
    await db.insert(glDailyRates).values({
        fromCurrency: "USD",
        toCurrency: "EUR",
        conversionDate: new Date(),
        rate: "0.85",
        conversionType: "Spot"
    }); // insert without conflict check implies "just add it", might duplicate but OK for test

    // 3.1 Setup Custom SLA Rules (To avoid Seed Data Conflicts with 01-000...)
    console.log("   - Seeding Custom SLA Rules (99-000-000... for isolation)...");

    await db.insert(slaAccountingRules).values([
        { code: "ML_TEST_LIAB", name: "ML Test Liability", ruleType: "Account", sourceType: "Constant", constantValue: "99-000-20000-000-000-000-000-000-000-000", description: "Test Liab" },
        { code: "ML_TEST_EXP", name: "ML Test Expense", ruleType: "Account", sourceType: "Constant", constantValue: "99-000-50000-000-000-000-000-000-000-000", description: "Test Exp" }
    ]).onConflictDoNothing();

    // 3.2 Setup Custom Event Class/Type
    const TEST_CLASS = "ML_TEST_CLASS";
    const TEST_TYPE = "ML_TEST_TYPE";
    await db.insert(slaEventClasses).values({ id: TEST_CLASS, applicationId: "AP", name: "Multi Ledger Test Class", entityTable: "test_entity" }).onConflictDoNothing();
    await db.insert(slaEventTypes).values({ id: TEST_TYPE, eventClassId: TEST_CLASS, name: "ML Test Type", accountingFlag: true }).onConflictDoNothing();

    // 3.3 Setup JLTs
    await db.insert(slaJournalLineTypes).values([
        {
            code: "ML_LIAB", eventClassId: TEST_CLASS, name: "ML Liability", side: "CREDIT",
            accountingClass: "ML_TEST_LIAB", amountSource: "amount", descriptionRule: "ML Liability", ledgerId: null
        },
        {
            code: "ML_EXP", eventClassId: TEST_CLASS, name: "ML Expense", side: "DEBIT",
            accountingClass: "ML_TEST_EXP", amountSource: "amount", descriptionRule: "ML Expense", ledgerId: null
        }
    ]).onConflictDoNothing();

    // 4. Create Accounting Event
    console.log("   - Creating Accounting (USD Transaction)...");
    const payload = {
        eventClassId: TEST_CLASS,
        eventTypeId: TEST_TYPE,
        entityId: `ML-TEST-${Date.now()}`,
        entityTable: "ap_invoices",
        ledgerId: primary.id,
        eventDate: new Date(),
        glDate: new Date(),
        currencyCode: "USD",
        amount: 1000.00,
        description: "Multi-Ledger Test Invoice",
        sourceData: {
            invoiceId: 101,
            amount: 1000.00,
            supplierType: "VENDOR"
        }
    };

    const header = await slaEngine.createAccounting(payload);
    if (!header) throw new Error("Primary Accounting failed to generate.");

    console.log(`     > Primary Header Created: ${header.id}`);

    // 5. Verify Secondary Replciation
    // Give async process a moment (though currently not awaited in service catch block, the loop awaits)
    // Wait, the processSecondaryLedgers is async but NOT validly awaited in createAccounting (fire-and-forget).
    // So we need to wait a sec.
    await new Promise(r => setTimeout(r, 2000));

    // Check for Secondary Header
    console.log("   - Verifying Secondary Ledger Entry...");
    const secHeaders = await db.select().from(slaJournalHeaders)
        .where(and(
            eq(slaJournalHeaders.ledgerId, secondary.id),
            eq(slaJournalHeaders.entityId, payload.entityId)
        ));

    if (secHeaders.length === 0) {
        throw new Error("❌ Secondary Header NOT found. Replication failed.");
    }

    const secHeader = secHeaders[0];
    console.log(`     > Secondary Header Found: ${secHeader.id}`);

    // 6. Verify FX Conversion
    // Fetch Lines
    // Fetch Lines
    const secLines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, secHeader.id));

    console.log(`     > Found ${secLines.length} lines in Secondary Journal.`);

    // Check amounts. Primary was 1000 USD. Rate is 0.85. Secondary Accounted should be 850 EUR.
    // Entered should still be 1000 (if we kept entered as transaction currency).

    const drLine = secLines.find(l => Number(l.accountedDr) > 0);
    if (!drLine) throw new Error("No Debit line found in Secondary.");

    console.log(`     > Debit Line Amounts: Entered=${drLine.enteredDr} (USD), Accounted=${drLine.accountedDr} (EUR)`);

    if (Number(drLine.accountedDr) === 850) {
        console.log("✅ Currency Conversion Verified (1000 * 0.85 = 850).");
    } else {
        console.error(`❌ Currency Conversion Mismatch. Expected 850, Got ${drLine.accountedDr}`);
        process.exit(1);
    }

    console.log("\n✅ Multi-Ledger Verification Complete.");
    process.exit(0);
}

verifyMultiLedger().catch((err) => {
    console.error("\n❌ Verification Failed:", err);
    process.exit(1);
});
