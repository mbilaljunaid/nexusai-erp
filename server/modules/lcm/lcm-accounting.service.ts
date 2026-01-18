
import { db } from "@db";
import { lcmTradeOperations, lcmAllocations, lcmShipmentLines } from "@shared/schema/lcm";
import { slaJournalHeaders, slaJournalLines } from "@shared/schema/sla";
import { glLedgers } from "@shared/schema/finance";
import { eq, sql } from "drizzle-orm";

export class LcmAccountingService {

    /**
     * Generates SLA Journals for a finalized Trade Operation.
     * Debit: Inventory (Landed Cost Element)
     * Credit: Landed Cost Absorption
     */
    async createAccounting(tradeOpId: string) {
        return await db.transaction(async (tx) => {
            // 1. Validate Trade Op
            const [op] = await tx.select().from(lcmTradeOperations).where(eq(lcmTradeOperations.id, tradeOpId));
            if (!op) throw new Error("Trade Operation not found");

            // 2. Fetch Allocations
            // We need to join with shipment lines to get the item/PO info if we want real accounts.
            // For V1, we just sum up the allocations.
            const allocations = await tx.select({
                id: lcmAllocations.id,
                amount: lcmAllocations.amount,
                lineId: lcmAllocations.shipmentLineId
            })
                .from(lcmAllocations)
                .innerJoin(lcmShipmentLines, eq(lcmAllocations.shipmentLineId, lcmShipmentLines.id))
                .where(eq(lcmShipmentLines.tradeOperationId, tradeOpId));

            if (allocations.length === 0) throw new Error("No allocations found to account for.");

            // 3. Get Default Ledger (Just pick the first one for MVP)
            const [ledger] = await tx.select().from(glLedgers).limit(1);
            if (!ledger) throw new Error("No General Ledger defined in system.");

            // 4. Create Header
            const [header] = await tx.insert(slaJournalHeaders).values({
                ledgerId: ledger.id,
                entityId: tradeOpId,
                entityTable: 'lcm_trade_operations',
                eventClassId: 'LCM_ABSORPTION', // Assuming this exists or we treat as generic
                eventDate: new Date(),
                glDate: new Date(),
                currencyCode: 'USD', // Default
                description: `Landed Cost Absorption for ${op.operationNumber}`,
                status: 'Draft'
            }).returning();

            // 5. Create Lines (Summary Level for MVP)
            // Total Amount
            const totalAmount = allocations.reduce((sum, a) => sum + Number(a.amount), 0);

            // Line 1: Debit Inventory (Material Overhead)
            await tx.insert(slaJournalLines).values({
                headerId: header.id,
                lineNumber: 1,
                accountingClass: 'Inventory Valuation',
                enteredDr: totalAmount.toFixed(2),
                currencyCode: 'USD',
                description: 'Landed Cost Capitalization'
            });

            // Line 2: Credit Absorption
            await tx.insert(slaJournalLines).values({
                headerId: header.id,
                lineNumber: 2,
                accountingClass: 'LCM Absorption',
                enteredCr: totalAmount.toFixed(2),
                currencyCode: 'USD',
                description: 'Landed Cost Clearing'
            });

            return { success: true, journalId: header.id, totalAmount };
        });
    }
}

export const lcmAccountingService = new LcmAccountingService();
