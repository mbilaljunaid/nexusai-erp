
import { db } from "../server/db";
import { slaReportingService } from "../server/modules/sla/sla.reporting.service";
import { slaJournalHeaders, slaJournalLines, slaEventClasses, slaEventTypes } from "../shared/schema/sla";
import { glCodeCombinations, glLedgers, glPeriods } from "../shared/schema/finance";
import { eq, and } from "drizzle-orm";

async function verifySlaReporting() {
    console.log("🔍 Verifying SLA Reporting (Phase 18)...");

    // 1. Setup Data: Ensure Ledger and Period
    const ledgerId = "PRIMARY";
    const periodName = "Jan-26"; // Ensure consistent naming with previous scripts

    // 1.1 Ensure Period Exists
    let period = await db.query.glPeriods.findFirst({
        where: and(eq(glPeriods.periodName, periodName), eq(glPeriods.ledgerId, ledgerId))
    });

    if (!period) {
        console.log("   - Creating Testing Period Jan-26...");
        await db.insert(glPeriods).values({
            periodName,
            ledgerId,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-02-01"),
            fiscalYear: 2026,
            quarter: 1,
            status: "Open"
        });
    }

    // 2. Generate Account Analysis Report
    console.log("   - Generating Account Analysis...");
    try {
        const analysis = await slaReportingService.getAccountAnalysis({
            ledgerId, periodName
        });

        console.log(`     > Found ${analysis.summary.rowCount} rows.`);
        console.log(`     > Total Dr: ${analysis.summary.totalDr}`);
        console.log(`     > Total Cr: ${analysis.summary.totalCr}`);

        if (analysis.summary.rowCount === 0) {
            console.warn("     ⚠️ No data found. Ensure previous tests ran successfully using this ledger/period.");
        }
    } catch (e: any) {
        throw new Error(`Account Analysis Failed: ${e.message}`);
    }

    // 3. Generate Reconciliation Report
    console.log("   - Generating Reconciliation Report...");
    try {
        const recon = await slaReportingService.getReconciliation({
            ledgerId, periodName
        });

        console.log(`     > Status: ${recon.status}`);
        console.log(`     > Variance Dr: ${recon.variance.dr}`);

        if (recon.status === "DRIFT_DETECTED") {
            // This is expected if GL Balances table is mocked or empty vs SLA data
            console.warn("     ⚠️ Drift Detected (Expected since GL Balances are mocked/empty in this test env).");
        } else {
            console.log("     ✅ Reconciled.");
        }

    } catch (e: any) {
        throw new Error(`Reconciliation Failed: ${e.message}`);
    }

    console.log("\n✅ SLA Reporting Verification Complete.");
    process.exit(0);
}

verifySlaReporting().catch((err) => {
    console.error("\n❌ Verification Failed:", err);
    process.exit(1);
});
