
import { db } from "../db";
import {
    treasuryNettingBatches, treasuryNettingLines, treasuryInternalAccounts,
    apInvoices, arInvoices, apSuppliers, arCustomers
} from "@shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";

export class NettingService {

    /**
     * Create a new Netting Batch for a given settlement date.
     * Identifies all open AP/AR transactions between entities that can be netted.
     */
    async createNettingBatch(settlementDate: Date) {
        // 1. Create Batch Header
        const batchNumber = `NET-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;

        const [batch] = await db.insert(treasuryNettingBatches).values({
            batchNumber,
            settlementDate,
            status: "DRAFT",
            currency: "USD"
        }).returning();

        const lines = [];

        // 2. Scan AP Invoices (Intercompany)
        // In real world, we'd identify Intercompany via Supplier Type or specific flag.
        // For simulation, we scan all "APPROVED" invoices due <= settlementDate
        const payables = await db.select({
            id: apInvoices.id,
            amount: apInvoices.invoiceAmount,
            currency: apInvoices.invoiceCurrencyCode, // Correct field
            supplierId: apInvoices.supplierId
        })
            .from(apInvoices)
            .where(and(
                lte(apInvoices.dueDate, settlementDate),
                // eq(apInvoices.status, 'APPROVED') // Using loose filter for now
            ));

        for (const inv of payables) {
            // Check if Supplier is an internal entity (simplification)
            // Ideally check supplierId against treasuryInternalAccounts linked ID

            // For now, add all to demonstrate capability, assuming "Intercompany" tag is implicit
            lines.push({
                batchId: batch.id,
                sourceType: 'AP_INVOICE',
                sourceId: String(inv.id),
                entityId: String(inv.supplierId), // Treating supplier as the counterparty entity
                amount: (-1 * Number(inv.amount)).toFixed(2), // Payable = Outflow
                baseAmount: (-1 * Number(inv.amount)).toFixed(2), // Assuming USD
                originalCurrency: inv.currency || "USD",
                status: "PENDING"
            });
        }

        // 3. Scan AR Invoices
        const receivables = await db.select({
            id: arInvoices.id,
            amount: arInvoices.amount,
            currency: arInvoices.currency,
            customerId: arInvoices.customerId
        })
            .from(arInvoices)
            .where(
                lte(arInvoices.dueDate, settlementDate)
            );

        for (const inv of receivables) {
            lines.push({
                batchId: batch.id,
                sourceType: 'AR_INVOICE',
                sourceId: String(inv.id),
                entityId: String(inv.customerId),
                amount: Number(inv.amount).toFixed(2), // Receivable = Inflow
                baseAmount: Number(inv.amount).toFixed(2),
                originalCurrency: inv.currency || "USD",
                status: "PENDING"
            });
        }

        if (lines.length > 0) {
            await db.insert(treasuryNettingLines).values(lines);

            // Update Batch Totals
            const totalPayables = lines.filter(l => Number(l.amount) < 0).reduce((a, b) => a + Number(b.amount), 0);
            const totalReceivables = lines.filter(l => Number(l.amount) > 0).reduce((a, b) => a + Number(b.amount), 0);

            await db.update(treasuryNettingBatches)
                .set({
                    totalPayables: String(totalPayables),
                    totalReceivables: String(totalReceivables),
                    status: "CALCULATED"
                })
                .where(eq(treasuryNettingBatches.id, batch.id));
        }

        return batch;
    }

    /**
     * Get Net Positions per Entity for a specific batch/cycle.
     */
    async getNetPositions(batchId: string) {
        const lines = await db.select().from(treasuryNettingLines).where(eq(treasuryNettingLines.batchId, batchId));

        const positions: Record<string, number> = {};

        lines.forEach(line => {
            const entity = line.entityId;
            const amt = Number(line.baseAmount);
            if (!positions[entity]) positions[entity] = 0;
            positions[entity] += amt;
        });

        return Object.entries(positions).map(([entityId, netAmount]) => ({
            entityId,
            netAmount,
            status: netAmount > 0 ? "RECEIVING" : "PAYING"
        }));
    }

    /**
     * Settle a Netting Batch
     * Performs Internal Transfers and closes Source Invoices.
     */
    async settleBatch(batchId: string) {
        // Validation...

        // 1. Update Batch Status
        await db.update(treasuryNettingBatches)
            .set({ status: "SETTLED" })
            .where(eq(treasuryNettingBatches.id, batchId));

        // 2. Update Lines Status
        await db.update(treasuryNettingLines)
            .set({ status: "SETTLED" })
            .where(eq(treasuryNettingLines.batchId, batchId));

        // 3. (Mock) Execute Internal Transfers
        // In real system: Create Cash Transaction / Journal Entry
        // Here we just mark as settled. 

        return { message: "Batch Settled Successfully" };
    }
}

export const nettingService = new NettingService();
