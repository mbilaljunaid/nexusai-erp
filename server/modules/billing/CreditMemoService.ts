import { db } from "../../db";
import { arInvoices, arInvoiceLines, arAdjustments, type ArInvoice } from "@shared/schema/ar";
import { eq, sql } from "drizzle-orm";

/**
 * CreditMemoService
 * Handles creation of Credit Memos (CM).
 */
export class CreditMemoService {

    /**
     * Create a Credit Memo linked to an original Invoice.
     * @param originalInvoiceId ID of the invoice being credited
     * @param amount Positive amount to credit (will be stored as negative)
     * @param reason Reason for credit
     */
    async createCreditMemo(originalInvoiceId: string, amount: string, reason: string, user: string = "System") {
        const [original] = await db.select().from(arInvoices).where(eq(arInvoices.id, originalInvoiceId));
        if (!original) throw new Error("Original Invoice not found");

        const cmAmount = Math.abs(Number(amount)); // Ensure positive input for logic

        // Create CM Header (Negative Amount to reflect credit)
        const [cm] = await db.insert(arInvoices).values({
            customerId: original.customerId,
            invoiceNumber: `CM-${original.invoiceNumber}-${Date.now().toString().slice(-4)}`,
            amount: (-cmAmount).toString(),
            totalAmount: (-cmAmount).toString(),
            currency: original.currency,
            status: "Approved",
            transactionClass: "CM",
            sourceTransactionId: original.id,
            description: `Credit for ${original.invoiceNumber}: ${reason}`,
            paymentTerms: "Immediate"
        }).returning();

        // Create CM Line
        await db.insert(arInvoiceLines).values({
            invoiceId: cm.id,
            lineNumber: 1,
            description: reason,
            amount: (-cmAmount).toString(),
            quantity: "1",
            unitPrice: (-cmAmount).toString()
        });

        // Apply Credit Logic
        await this.applyCredit(cm.id, original.id, cmAmount);

        return cm;
    }

    /**
     * Apply Credit: Creates an Adjustment on the Target Invoice
     */
    async applyCredit(creditMemoId: string, targetInvoiceId: string, amountToApply: number) {
        await db.insert(arAdjustments).values({
            invoiceId: targetInvoiceId,
            adjustmentType: "Credit Memo",
            amount: (-amountToApply).toString(), // Negative reduces the balance
            reason: `Applied Credit Memo ${creditMemoId}`,
            status: "Approved",
            createdBy: "System"
        });
    }
}

export const creditMemoService = new CreditMemoService();
