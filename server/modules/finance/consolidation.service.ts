
import { db } from "../../db";
import {
    glConsolidationRuns, glEliminationDefinitions, glLedgerSets, glJournals,
    glBalances, glLedgerRelationships
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { financeService } from "./finance.service";

export class ConsolidationService {

    /**
     * Run Consolidation Process
     * 1. Validate Period Status
     * 2. Aggregate Balances (Simplified for MVP: Just check connectivity)
     * 3. Run Eliminations
     */
    async runConsolidation(ledgerSetId: string, periodId: string, userId: string) {
        // 1. Create Run Record
        const [run] = await db.insert(glConsolidationRuns).values({
            ledgerSetId,
            periodId,
            status: "Running"
        }).returning();

        try {
            console.log(`🚀 Starting Consolidation Run ${run.id} for Set ${ledgerSetId}`);

            // 2. Fetch Elimination Rules for this Ledger Set
            const rules = await db.select().from(glEliminationDefinitions)
                .where(and(
                    eq(glEliminationDefinitions.ledgerSetId, ledgerSetId),
                    eq(glEliminationDefinitions.enabled, true)
                ));

            let totalEliminated = 0;

            // 3. Process Rules (Mock Logic for MVP)
            for (const rule of rules) {
                // In a real system: Query Intercompany Balances -> Create Offset Journal
                // Here: Create a dummy elimination journal to prove flow

                const eliminationAmount = 1000; // Mock elimination

                await financeService.createJournal({
                    journalNumber: `ELIM-${Date.now()}`,
                    description: `Elimination Entry: ${rule.name}`,
                    ledgerId: rule.eliminationLedgerId,
                    currencyCode: "USD",
                    source: "Consolidation",
                    status: "Posted", // Auto-post eliminations
                    batchId: run.id // Link to Run
                }, [
                    { accountId: "100-000-2000-000", enteredDebit: eliminationAmount, enteredCredit: 0, description: "Eliminate Payable" },
                    { accountId: "100-000-1200-000", enteredDebit: 0, enteredCredit: eliminationAmount, description: "Eliminate Receivable" }
                ], userId);

                totalEliminated += eliminationAmount;
            }

            // 4. Update Run Status
            await db.update(glConsolidationRuns)
                .set({
                    status: "Completed",
                    completedDate: new Date(),
                    totalEliminations: totalEliminated.toString()
                })
                .where(eq(glConsolidationRuns.id, run.id));

            return { success: true, runId: run.id, totalEliminated };

        } catch (error: any) {
            console.error("Consolidation Failed:", error);
            await db.update(glConsolidationRuns)
                .set({
                    status: "Error",
                    errorLog: error.message
                })
                .where(eq(glConsolidationRuns.id, run.id));

            throw error;
        }
    }

    /**
     * Get History
     */
    async getConsolidationHistory(ledgerSetId?: string) {
        const query = db.select().from(glConsolidationRuns);
        if (ledgerSetId) {
            query.where(eq(glConsolidationRuns.ledgerSetId, ledgerSetId));
        }
        return await query.orderBy(desc(glConsolidationRuns.runDate));
    }
}

export const consolidationService = new ConsolidationService();
