
import { db } from "../server/db";
import { glConsolidationRuns, glEliminationDefinitions, glJournals } from "../shared/schema";
import { consolidationService } from "../server/modules/finance/consolidation.service";
import { eq, and } from "drizzle-orm";

async function verifyConsolidation() {
    console.log("🔍 Verifying Financial Consolidation...");

    const ledgerSetId = "GLOBAL_GRP";
    const eliminationLedgerId = "ELIM_LEDGER";
    const periodId = "Jan-2026";
    const userId = "test-user";

    // 1. Setup Elimination Rule
    console.log("   - Setting up Elimination Rule...");
    await db.delete(glEliminationDefinitions).where(eq(glEliminationDefinitions.ledgerSetId, ledgerSetId));

    await db.insert(glEliminationDefinitions).values({
        name: "Intercompany AP/AR Elimination",
        ledgerSetId: ledgerSetId,
        eliminationLedgerId: eliminationLedgerId,
        matchRule: "Standard",
        thresholdAmount: "100.00",
        enabled: true
    });

    // 2. Run Consolidation
    console.log("   - Running Consolidation Process...");
    const result = await consolidationService.runConsolidation(ledgerSetId, periodId, userId);

    console.log(`     Run ID: ${result.runId}`);
    console.log(`     Total Eliminated: $${result.totalEliminated}`);

    if (result.totalEliminated <= 0) {
        console.error("❌ Elimination amount should be > 0 (Mock logic produces 1000).");
        process.exit(1);
    }

    // 3. Verify Run Status
    const [run] = await db.select().from(glConsolidationRuns).where(eq(glConsolidationRuns.id, result.runId));
    console.log(`     Status: ${run.status}`);

    if (run.status !== "Completed") {
        console.error("❌ Run status is not Completed.");
        process.exit(1);
    }

    // 4. Verify Journal Creation
    const [journal] = await db.select().from(glJournals).where(eq(glJournals.batchId, run.id));

    if (!journal) {
        console.error("❌ No Elimination Journal created.");
        process.exit(1);
    }

    console.log(`     Elimination Journal Created: ${journal.journalNumber} (${journal.description})`);

    console.log("✅ Consolidation Verification Passed!");
    process.exit(0);
}

verifyConsolidation().catch((err) => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
