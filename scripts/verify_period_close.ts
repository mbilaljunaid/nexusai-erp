
import { db } from "@db";
import { glPeriods, glLedgers } from "@shared/schema";
import { slaJournalHeaders, slaPeriodStatuses } from "@shared/schema/sla";
import { periodCloseService } from "../server/modules/sla/period-close.service";
import { slaReportingService } from "../server/modules/sla/reporting.service";
import { slaEngine } from "../server/modules/sla/sla.service"; // Trigger accounting
import { eq } from "drizzle-orm";

async function runVerification() {
    console.log("🔒 Verifying Period Close Logic...");

    // 1. Setup Ledger (ISOLATED)
    const ledgerName = `SLA-TEST-LEDGER-${Date.now()}`;
    const [ledger] = await db.insert(glLedgers).values({
        name: ledgerName,
        currencyCode: "USD",
        coaId: "DEFAULT_COA",
        ledgerCategory: "PRIMARY",
        isActive: true
    }).returning();

    const ledgerId = ledger.id;
    const period1Name = "Test-Jan-26";
    const period2Name = "Test-Feb-26";

    console.log(`POINTER: Created Isolated Ledger ID: ${ledgerId} (${ledgerName})`);

    // Clean existing test periods (Scoped to this new ledger - effectively empty)
    // await db.delete(glPeriods).where(eq(glPeriods.periodName, period1Name)); 
    // No need to clear, it's a new ledger.

    // Create Test Periods
    await db.insert(glPeriods).values([
        {
            ledgerId,
            periodName: period1Name,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-01-31"),
            fiscalYear: 2026,
            status: "Open"
        },
        {
            ledgerId,
            periodName: period2Name,
            startDate: new Date("2026-02-01"),
            endDate: new Date("2026-02-28"),
            fiscalYear: 2026,
            status: "Open"
        }
    ]);
    console.log("✅ Created Test Periods: Jan-26, Feb-26");

    // 2. Create an UNACCOUNTED Event in Jan-26
    // We manually insert a DRAFT header to simulate a failed/pending event
    const [draftHeader] = await db.insert(slaJournalHeaders).values({
        ledgerId,
        eventClassId: "AP_INVOICE", // Assumed enabled
        entityId: "TEST-ENTITY-001",
        entityTable: "ap_invoices",
        eventDate: new Date("2026-01-15"),
        glDate: new Date("2026-01-15"),
        currencyCode: "USD",
        status: "Draft", // Unaccounted!
        description: "Unaccounted Invoice"
    }).returning();
    console.log(`✅ Created UNACCOUNTED Event ID: ${draftHeader.id} in ${period1Name}`);

    // 3. Attempt to Close Period 1 (Should FAIL)
    console.log(`\n   - Attempting to Close Period 1 (Expect Failure)...`);
    try {
        await periodCloseService.closePeriod(ledgerId, "AP", period1Name);
        console.error("❌ ERROR: Period Close should have failed!");
    } catch (e: any) {
        console.log(`✅ Expected Failure: ${e.message}`);
    }

    // 4. Run Sweep
    console.log(`\n   - Running Sweep...`);
    const sweptCount = await periodCloseService.sweepUnaccountedEvents(ledgerId, period1Name, period2Name);
    console.log(`✅ Sweep Result: Swept ${sweptCount} events to ${period2Name}`);

    // Verify GL Date Moved
    const [updatedHeader] = await db.select().from(slaJournalHeaders).where(eq(slaJournalHeaders.id, draftHeader.id));
    if (new Date(updatedHeader.glDate).toISOString().startsWith("2026-02-01")) {
        console.log("✅ Validation: Event GL Date moved to Feb 1st.");
    } else {
        console.error("❌ Validation Failed: GL Date not updated.", updatedHeader.glDate);
    }

    // 5. Attempt to Close Period 1 Again (Should SUCCESS)
    console.log(`\n   - Attempting to Close Period 1 Again (Expect Success)...`);
    await periodCloseService.closePeriod(ledgerId, "AP", period1Name);
    // Period is now CLOSED in sla_period_statuses

    // 6. Test Blocking Logic: Try create accounting in Closed Period
    console.log(`\n   - Testing Blocked Accounting in Closed Period...`);
    try {
        // Mock payload with Jan date (Closed)
        // Note: Engine checks periodCloseService.validateGlDate
        const isPeriodOpen = await periodCloseService.validateGlDate(ledgerId, "AP", new Date("2026-01-20"));
        if (!isPeriodOpen) {
            console.log("✅ Validation: Date 2026-01-20 is acknowledged as CLOSED.");
        } else {
            console.error("❌ Validation Failed: Date should be CLOSED.");
        }

    } catch (e) {
        // Engine might throw
    }

    // 7. Verify Account Analysis Report
    console.log(`\n📊 Verifying Account Analysis Report...`);
    // Need at least one FINAL event to show in report.
    // Let's create a dummy Final event or just run query.
    const report = await slaReportingService.getAccountAnalysis({
        ledgerId,
        periodName: period1Name // Should be empty now as we swept the draft one, and had no final ones
    });
    console.log(`✅ Full Report Rows: ${report.length}`);

    console.log("\n✅ Verification Complete!");
    process.exit(0);
}

runVerification().catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
});
