
import { db } from "../server/db";
import { glConsolidationRuns, glEliminationDefinitions, glLedgerSets, glLedgerSetAssignments, glLedgers, glJournals } from "../shared/schema/finance";
import { ConsolidationService } from "../server/services/ConsolidationService";
import { eq } from "drizzle-orm";

const service = new ConsolidationService();

async function run() {
    console.log("Starting Consolidation Verification...");

    const ledgerSetId = "GLOBAL_GRP_" + Date.now();
    const periodId = "Jan-2026";
    const userId = "verifier-admin";

    // 1. Setup Data: Ledger Set
    console.log("1. Setting up Ledger Set...");
    await db.insert(glLedgerSets).values({
        id: ledgerSetId,
        name: "Global Consolidation Group " + Date.now(),
        description: "Test Group"
    });

    // Assign Ledgers (Mocking existing ledgers or creating dummies?)
    // Assuming PRIMARY exists.
    await db.insert(glLedgerSetAssignments).values({
        ledgerSetId: ledgerSetId,
        ledgerId: "PRIMARY"
    });

    // 2. Setup Elimination Rule
    console.log("2. Setting up Elimination Rule...");
    await db.insert(glEliminationDefinitions).values({
        name: "Intercompany AP/AR Offset",
        ledgerSetId: ledgerSetId,
        enabled: true,
        eliminationLedgerId: "ELIM_LEDGER"
    });

    // 3. Run Consolidation
    console.log("3. Running Consolidation...");
    const result = await service.runConsolidation(ledgerSetId, periodId, userId);
    console.log("   -> Triggered Run ID:", result.runId);

    // 4. Verify Status
    const runRecord = await db.select().from(glConsolidationRuns).where(eq(glConsolidationRuns.id, result.runId)).then(r => r[0]);
    if (runRecord.status !== "Completed") throw new Error(`Status mismatch: Expected Completed, got ${runRecord.status}`);
    console.log("   -> Status Verified: Completed");

    // 5. Verify Elimination Journal
    const elims = parseFloat(runRecord.totalEliminations || "0");
    if (elims <= 0) throw new Error("Expected > 0 eliminations (mock logic should trigger)");
    console.log(`   -> Eliminations Generated: $${elims}`);

    // Check if Journal Exists
    const journals = await db.select().from(glJournals)
        .where(eq(glJournals.ledgerId, "ELIM_LEDGER")); // Simple check

    const createdJournal = journals.find(j => j.journalNumber.startsWith("ELIM-"));
    if (!createdJournal) throw new Error("Elimination Journal not found in DB");
    console.log("   -> Elimination Journal Found:", createdJournal.journalNumber);

    console.log("verification_complete");
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
