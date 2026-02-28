import { db } from "../db";
import {
    apInvoices,
    apPaymentBatches,
    type InsertApPaymentBatch
} from "@shared/schema/ap";
import { eq, or, desc, sql, inArray } from "drizzle-orm";

/**
 * Enterprise AP Payments Service (Payment Process Requests - PPR)
 * 
 * Supports Oracle's 3-Step PPR Workflow:
 * 1. SELECTING: Gathering invoices based on criteria (due date, pay group)
 * 2. BUILDING: Draft state where users can review, add, or remove invoices before confirmation
 * 3. FORMATTING (Confirmed): Final state processing ISO20022/Checks and closing invoices
 */

export class ApPaymentsService {

    /**
     * STEP 1: Select Invoices for a new Payment Batch
     */
    static async selectInvoicesForBatch(criteria: {
        payThroughDate: string;
        payGroup?: string;
        priorityRangeFrom?: number;
        priorityRangeTo?: number;
        templateId?: string;
    }): Promise<string> {
        try {
            // Create a draft batch in SELECTING status
            const draftBatch: InsertApPaymentBatch = {
                batchName: `PPR-${new Date().getTime()}`,
                status: "SELECTING",
                totalAmount: "0",
                paymentCount: 0,
                payThroughDate: criteria.payThroughDate ? new Date(criteria.payThroughDate) : undefined,
                payGroup: criteria.payGroup,
                templateId: criteria.templateId,
            };

            const [batch] = await db.insert(apPaymentBatches).values(draftBatch).returning();

            // Find all unpaid, validated invoices due on or before payThroughDate
            const conditions = [
                eq(apInvoices.status, "UNPAID"),
                eq(apInvoices.validationStatus, "VALIDATED")
            ];

            if (criteria.payThroughDate) {
                conditions.push(sql`${apInvoices.termsDate} <= ${new Date(criteria.payThroughDate).toISOString()}`);
            }

            if (criteria.payGroup) {
                conditions.push(eq(apInvoices.payGroup, criteria.payGroup));
            }

            const eligibleInvoices = await db
                .select()
                .from(apInvoices)
                .where(and(...conditions));

            if (eligibleInvoices.length === 0) {
                // Automatically cancel batch if no invoices found
                await db.update(apPaymentBatches).set({ status: "CANCELLED" }).where(eq(apPaymentBatches.id, batch.id));
                throw new Error("No eligible invoices found for given criteria.");
            }

            // Link invoices to batch
            const txIds = eligibleInvoices.map(inv => inv.id);
            await db.update(apInvoices)
                .set({ paymentBatchId: batch.id, status: "SELECTED_FOR_PAYMENT" })
                .where(inArray(apInvoices.id, txIds));

            // Calculate totals
            const totalAmt = eligibleInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

            // Transition to BUILDING state so users can review the selection
            await db.update(apPaymentBatches)
                .set({
                    status: "BUILDING",
                    totalAmount: totalAmt.toString(),
                    paymentCount: eligibleInvoices.length
                })
                .where(eq(apPaymentBatches.id, batch.id));

            return batch.id;

        } catch (error: any) {
            console.error("PPR Selection Error:", error);
            throw error;
        }
    }

    /**
     * Remove a specific invoice during the BUILDING phase (e.g., user removes it from the review UI)
     */
    static async removeInvoiceFromBatch(batchId: string, invoiceId: string): Promise<boolean> {
        // Revert invoice to UNPAID
        await db.update(apInvoices)
            .set({ paymentBatchId: null, status: "UNPAID" })
            .where(eq(apInvoices.id, invoiceId));

        // Recalculate batch totals
        const remainingInvoices = await db.select().from(apInvoices).where(eq(apInvoices.paymentBatchId, batchId));
        const totalAmt = remainingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

        await db.update(apPaymentBatches)
            .set({
                totalAmount: totalAmt.toString(),
                paymentCount: remainingInvoices.length
            })
            .where(eq(apPaymentBatches.id, batchId));

        return true;
    }

    /**
     * STEP 2 -> 3: Move from BUILDING to FORMATTING and finalize payments.
     */
    static async confirmAndFormatBatch(batchId: string): Promise<boolean> {
        const [batch] = await db.select().from(apPaymentBatches).where(eq(apPaymentBatches.id, batchId)).limit(1);
        if (batch.status !== "BUILDING") throw new Error("Batch must be in BUILDING state to format.");

        // Advance batch state
        await db.update(apPaymentBatches)
            .set({ status: "FORMATTING" })
            .where(eq(apPaymentBatches.id, batchId));

        // Simulate payment network transmission delay
        // In a real system, a background job handles parsing into ISO20022 and sending to bank SFTP.

        // Finalize Batch & Invoices
        await db.update(apPaymentBatches)
            .set({ status: "CONFIRMED", paymentDate: new Date() })
            .where(eq(apPaymentBatches.id, batchId));

        await db.update(apInvoices)
            .set({ status: "PAID", amountPaid: sql`"totalAmount"` }) // Mark fully paid
            .where(eq(apInvoices.paymentBatchId, batchId));

        return true;
    }
}
