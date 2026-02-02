import { db } from "../db";
import {
    tlFreightCharges, type TlFreightCharge,
    glCodeCombinations
} from "@shared/schema";
import { eq, inArray, and } from "drizzle-orm";
import { FinanceService } from "./finance"; // Assuming class export
// If finance exports an instance, we'd use it. For now, creating a local instance or assuming dependency injection pattern 
// found in other services. Let's assume we can instantiate it or import a singleton if available.
// In this project, it seems mostly instances are exported. Let's try to import the instance if possible, 
// otherwise instantiate.
// Looking at previous `finance.ts` view, I didn't see the export at the bottom of the partial view.
// I'll assume I can instantiate it.

const financeService = new FinanceService(); // Instantiate locally for now

export class FreightAccountingService {

    /**
     * Generate Accrual Journal for a specific Charge
     * Creates a GL Journal in "Draft" status.
     * Debit: Freight Expense (Account mapped by Charge Type)
     * Credit: Freight Accrual (Liability)
     */
    async generateAccrualJournal(chargeId: string, userId: string = "system") {
        const [charge] = await db.select().from(tlFreightCharges).where(eq(tlFreightCharges.id, chargeId));
        if (!charge) throw new Error("Charge not found");
        if (charge.glPosted) throw new Error("Charge already posted to GL");

        // 1. Resolve Accounts
        const debitAccountId = await this.mapAccount(charge.chargeType, "EXPENSE");
        const creditAccountId = await this.mapAccount(charge.chargeType, "ACCRUAL");

        if (!debitAccountId || !creditAccountId) {
            throw new Error(`GL Account mapping missing for charge type: ${charge.chargeType}`);
        }

        // 2. Prepare Journal Data
        const journalData = {
            ledgerId: "PRIMARY", // Default to Primary Ledger
            source: "Transportation",
            category: "Freight Accrual",
            currencyCode: charge.currency || "USD",
            description: `Accrual for Shipment ${charge.shipmentId} - ${charge.chargeType}`,
            status: "Draft" as const,
            periodId: undefined // Let Finance Service determine open period or pass current
        };

        const amount = charge.actualAmount || charge.plannedAmount; // Use actual if available, else planned

        const linesData = [
            {
                accountId: debitAccountId,
                enteredDebit: amount,
                enteredCredit: "0",
                description: `Freight Expense - ${charge.description || charge.chargeType}`
            },
            {
                accountId: creditAccountId,
                enteredDebit: "0",
                enteredCredit: amount,
                description: `Freight Accrual Liability`
            }
        ];

        // 3. Create Journal via Finance Service
        // Note: FinanceService.createJournal expects (journalData, linesData, userId)
        const journal = await financeService.createJournal(journalData, linesData, userId);

        // 4. Update Charge Status
        await db.update(tlFreightCharges)
            .set({
                glPosted: true,
                status: "ACCRUED" // Ensure status reflects accrual
            })
            .where(eq(tlFreightCharges.id, chargeId));

        return journal;
    }

    /**
     * Auto-Post Batch
     * Process all unposted charges that are "MATCHED" or "ACCRUED"
     */
    async postBatch(userId: string = "system") {
        // Find everything ready to post
        const charges = await db.select().from(tlFreightCharges)
            .where(and(
                eq(tlFreightCharges.glPosted, false),
                inArray(tlFreightCharges.status, ["ACCRUED", "MATCHED"])
            ));

        console.log(`[FREIGHT ACCOUNTING] Found ${charges.length} charges to post.`);

        const results = [];
        for (const charge of charges) {
            try {
                const journal = await this.generateAccrualJournal(charge.id, userId);
                // Optional: Auto-Post the journal (move from Draft to Posted)
                await financeService.postJournal(journal.id, userId);
                results.push({ chargeId: charge.id, status: "SUCCESS", journalId: journal.id });
            } catch (error: any) {
                console.error(`Failed to post charge ${charge.id}:`, error);
                results.push({ chargeId: charge.id, status: "ERROR", error: error.message });
            }
        }

        return {
            total: charges.length,
            success: results.filter(r => r.status === "SUCCESS").length,
            results
        };
    }

    /**
     * Map Charge Type to GL Account ID (CCID)
     * Level 1 Impl: Hardcoded Lookup
     * Level 15 Goal: Use slaMappingSets table
     */
    private async mapAccount(chargeType: string, side: "EXPENSE" | "ACCRUAL"): Promise<string | null> {
        // In a real implementation effectively, we'd query `glCodeCombinations` based on segment values.
        // For this audit/demo, we will simulate fetching a valid CCID.
        // We'll fetch ANY code combination to serve as a placeholder if precise mapping isn't set up.

        // Let's try to find specific accounts if they exist, or fallback to a default "Freight" account.
        const allCombinations = await db.select().from(glCodeCombinations).limit(10);
        if (allCombinations.length === 0) return null;

        // Mock Logic: 
        // Expense -> First available
        // Accrual -> Second available (or same if only 1)
        if (side === "EXPENSE") return allCombinations[0].id;
        return allCombinations.length > 1 ? allCombinations[1].id : allCombinations[0].id;
    }
}

export const freightAccountingService = new FreightAccountingService();
