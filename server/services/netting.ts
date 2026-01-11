import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
    nettingAgreements,
    nettingSettlements,
    InsertNettingAgreement,
    InsertNettingSettlement,
} from "@shared/schema/netting";
import {
    apInvoices,
    apPayments,
    apInvoicePayments,
} from "@shared/schema/ap";
import {
    arInvoices,
    arReceipts,
    arReceiptApplications,
} from "@shared/schema/ar";

export class NettingService {

    // Agreement Management
    async getAgreements() {
        return await db.query.nettingAgreements.findMany({
            with: {
                customer: true,
                supplier: true,
            }
        });
    }

    async createAgreement(data: InsertNettingAgreement) {
        const [agreement] = await db
            .insert(nettingAgreements)
            .values(data)
            .returning();
        return agreement;
    }

    // Netting Execution Logic
    async calculateProposal(agreementId: string) {
        const agreement = await db.query.nettingAgreements.findFirst({
            where: eq(nettingAgreements.id, agreementId),
        });

        if (!agreement) throw new Error("Agreement not found");

        // Fetch Open AR Invoices for this customer
        const openArInvoices = await db.query.arInvoices.findMany({
            where: and(
                eq(arInvoices.customerId, agreement.customerId),
                // eq(arInvoices.status, "Sent"), // Simplified: anything not paid/cancelled
                eq(arInvoices.currency, agreement.nettingCurrency || "USD")
            ),
        });

        // Fetch Open AP Invoices for this supplier
        const openApInvoices = await db.query.apInvoices.findMany({
            where: and(
                eq(apInvoices.supplierId, agreement.supplierId),
                eq(apInvoices.paymentStatus, "UNPAID"),
                eq(apInvoices.paymentCurrencyCode, agreement.nettingCurrency || "USD")
            )
        });

        const totalAr = openArInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
        const totalAp = openApInvoices.reduce((sum, inv) => sum + Number(inv.invoiceAmount || 0), 0);

        // Netting logic: Lesser of the two totals is the max possible offset
        const nettedAmount = Math.min(totalAr, totalAp);

        return {
            agreementId,
            totalArAmount: totalAr,
            totalApAmount: totalAp,
            nettedAmount: nettedAmount,
            proposedDirection: totalAr > totalAp ? "ReceiveFromCustomer" : "PaySupplier", // Remaining balance direction
            arInvoices: openArInvoices,
            apInvoices: openApInvoices,
        };
    }

    async executeSettlement(settlementData: InsertNettingSettlement) {
        // 1. Create Settlement Record
        const [settlement] = await db.insert(nettingSettlements).values(settlementData).returning();

        // 2. Create AR Receipt (Dummy receipt to clear AR)
        // In a real system, we'd link specific invoices. Here we perform a bulk 'On Account' or 'Applied' action.
        const [receipt] = await db.insert(arReceipts).values({
            receiptNumber: `NET-${settlement.id.substring(0, 8)}`,
            customerId: (await this.getAgreementWithError(settlementData.agreementId)).customerId,
            amount: String(settlementData.nettedAmount),
            currencyCode: "USD", // TODO: Fetch from agreement
            receiptMethodId: "NETTING",
            receiptDate: new Date(),
            status: "Applied",
            type: "Standard"
        } as any).returning();

        // 3. Create AP Payment (Dummy payment to clear AP)
        const [payment] = await db.insert(apPayments).values({
            paymentNumber: 0, // Serial will handle
            checkNumber: `NET-${settlement.id.substring(0, 8)}`,
            paymentDate: new Date(),
            amount: String(settlementData.nettedAmount),
            currencyCode: "USD",
            paymentMethodCode: "NETTING",
            supplierId: (await this.getAgreementWithError(settlementData.agreementId)).supplierId,
            status: "CLEARED"
        }).returning();

        // 4. Update Settlement with References
        await db.update(nettingSettlements).set({
            arReceiptId: receipt.id,
            apPaymentId: String(payment.id),
            status: "Settled"
        }).where(eq(nettingSettlements.id, settlement.id));

        return settlement;
    }

    private async getAgreementWithError(id: string) {
        const agreement = await db.query.nettingAgreements.findFirst({
            where: eq(nettingAgreements.id, id)
        });
        if (!agreement) throw new Error("Agreement not found");
        return agreement;
    }
}

export const nettingService = new NettingService();
