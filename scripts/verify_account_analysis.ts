
import { db } from "../server/db";
import { glPeriods, glCodeCombinations } from "../shared/schema/finance";
import { slaJournalHeaders, slaJournalLines, slaEventClasses, slaEventTypes } from "../shared/schema/sla";
import { reportingService } from "../server/modules/finance/reporting.service";
import { eq } from "drizzle-orm";

async function verifyAccountAnalysis() {
    console.log("📊 Verifying Account Analysis Report...");

    const ledgerId = "PRIMARY";
    const periodName = "Test-Analysis-Jan-26";

    // 1. Seed Period
    console.log("   - Seeding Data...");
    await db.insert(glPeriods).values({
        periodName,
        ledgerId,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
        fiscalYear: 2026,
        status: "Open"
    }).onConflictDoNothing();

    // 2. Seed CCID (100-000-1000)
    const [ccid] = await db.insert(glCodeCombinations).values({
        code: "100-000-1000",
        ledgerId,
        segment1: "100",
        segment2: "000",
        segment3: "1000", // Cash
        accountType: "Asset"
    }).onConflictDoUpdate({
        target: glCodeCombinations.code,
        set: { segment3: "1000" }
    }).returning();

    // 3. Create SLA Header & Lines (Final)
    const [header] = await db.insert(slaJournalHeaders).values({
        ledgerId,
        eventClassId: "MANUAL",
        entityId: "TEST-ANALYSIS-1",
        entityTable: "manual_source",
        eventDate: new Date("2026-01-15"),
        glDate: new Date("2026-01-15"),
        currencyCode: "USD",
        status: "Final",
        description: "Analysis Test Transaction"
    }).returning();

    await db.insert(slaJournalLines).values([
        {
            headerId: header.id,
            lineNumber: 10,
            accountingClass: "Cash",
            codeCombinationId: ccid.id,
            enteredDr: "100.00",
            accountedDr: "100.00",
            currencyCode: "USD"
        }
    ]);

    // 4. Run Report
    console.log("   - Generating Report...");

    // Test 1: Full Period
    const fullReport = await reportingService.generateAccountAnalysis(ledgerId, periodName);
    console.log(`✅ Full Report Rows: ${fullReport.data.length}`);
    if (fullReport.data.length === 0) console.error("❌ Error: Valid transaction missing from report.");

    // Test 2: Filter by Account
    const filteredReport = await reportingService.generateAccountAnalysis(ledgerId, periodName, { segment3: "1000" });
    console.log(`✅ Filtered Report (1000) Rows: ${filteredReport.data.length}`);
    if (filteredReport.data.length === 0) console.error("❌ Error: Filtered transaction missing.");

    // Test 3: Filter by Wrong Account
    const emptyReport = await reportingService.generateAccountAnalysis(ledgerId, periodName, { segment3: "9999" });
    console.log(`✅ Filtered Report (9999) Rows: ${emptyReport.data.length} (Expected 0)`);
    if (emptyReport.data.length > 0) console.error("❌ Error: Filter failed.");

    console.log("✅ Verification Complete.");
    process.exit(0);
}

verifyAccountAnalysis().catch(console.error);
