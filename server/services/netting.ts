import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import {
    nettingAgreements,
    nettingSettlements,
    InsertNettingAgreement,
    InsertNettingSettlement,
    icNettingBatches // Corrected
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
import { icHeaders, icOrgs } from "@shared/schema/intercompany"; // Added icOrgs
import { cashBankAccounts } from "@shared/schema/cash"; // Added cashBankAccounts
import { cashService } from "./cash"; // Added cashService

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

    // --- Intercompany Netting ---

    async createIcNettingBatch(orgId1: string, orgId2: string, currencyCode: string) {
        // 1. Find Unsettled IC Transactions between these two orgs
        // Directions: Org1 -> Org2 AND Org2 -> Org1
        const transactions = await db.select().from(icHeaders)
            .where(and(
                eq(icHeaders.currencyCode, currencyCode),
                eq(icHeaders.settlementStatus, "Unsettled"),
                sql`(${icHeaders.status} = 'APPROVED' OR ${icHeaders.status} = 'RECEIVED')`,
                sql`
                (
                    (${icHeaders.providerOrgId} = ${orgId1} AND ${icHeaders.receiverOrgId} = ${orgId2})
                    OR
                    (${icHeaders.providerOrgId} = ${orgId2} AND ${icHeaders.receiverOrgId} = ${orgId1})
                )`
            ));

        if (transactions.length === 0) {
            throw new Error("No open transactions found for netting.");
        }

        // 2. Calculate Totals
        let totalPay1to2 = 0; // Org1 owes Org2 (Org2 is Provider)
        let totalPay2to1 = 0; // Org2 owes Org1 (Org1 is Provider)

        for (const txn of transactions) {
            const amount = Number(txn.amount); // Assume this is the Payable Amount (Markup Included)
            if (txn.providerOrgId === orgId1 && txn.receiverOrgId === orgId2) {
                // Org1 is Provider. Org2 is Receiver (Payer).
                // So this is Receivable for Org1, Payable for Org2.
                totalPay2to1 += amount;
            } else {
                // Org2 is Provider. Org1 is Receiver (Payer).
                totalPay1to2 += amount;
            }
        }

        const netAmount = totalPay2to1 - totalPay1to2;
        // If > 0: Org2 pays Org1.
        // If < 0: Org1 pays Org2.

        return await db.transaction(async (tx) => {
            // Create Batch
            const [batch] = await tx.insert(icNettingBatches).values({
                orgId1,
                orgId2,
                currencyCode,
                totalPayables: totalPay1to2.toString(),
                totalReceivables: totalPay2to1.toString(),
                netAmount: netAmount.toString(),
                status: "Draft"
            } as any).returning(); // Cast to any to avoid strict type checks if schema import is lagging

            // Lock Headers
            await tx.update(icHeaders)
                .set({
                    settlementStatus: "Selected",
                    settlementBatchId: batch.id
                })
                .where(sql`${icHeaders.id} IN ${transactions.map(t => t.id)}`);

            return batch;
        });
    }

    async settleIcNettingBatch(batchId: string) {
        // 1. Get Batch
        const [batch] = await db.select().from(icNettingBatches).where(eq(icNettingBatches.id, batchId));
        if (!batch) throw new Error("Batch not found");
        if (batch.status !== "Draft") throw new Error("Batch already processed");

        // 2. Determine Payer and Payee
        const netAmount = Number(batch.netAmount);
        if (netAmount === 0) {
            // No movement needed
            await db.update(icNettingBatches).set({ status: "Settled", settlementDate: new Date() }).where(eq(icNettingBatches.id, batchId));
            await db.update(icHeaders).set({ settlementStatus: "Settled" }).where(eq(icHeaders.settlementBatchId, batchId));
            return { success: true, batchId, message: "Net amount is zero. No cash movement." };
        }

        let payerOrgId = "";
        let payeeOrgId = "";
        let absAmount = Math.abs(netAmount);

        if (netAmount > 0) {
            // Org2 pays Org1
            payerOrgId = batch.orgId2;
            payeeOrgId = batch.orgId1;
        } else {
            // Org1 pays Org2
            payerOrgId = batch.orgId1;
            payeeOrgId = batch.orgId2;
        }

        // 3. Find Ledgers and Bank Accounts
        // Helper to find account
        const findBankAccount = async (orgId: string): Promise<string | null> => {
            const orgs = await db.select().from(icOrgs).where(eq(icOrgs.id, orgId)).limit(1);
            if (orgs.length === 0) return null;
            const ledgerId = orgs[0].ledgerId;

            const accts = await db.select().from(cashBankAccounts)
                .where(and(eq(cashBankAccounts.ledgerId, ledgerId), eq(cashBankAccounts.currency, batch.currencyCode)))
                .limit(1);

            console.log(`[NETTING DEBUG] Looking for acct. Org: ${orgId}, Ledger: ${ledgerId}, Currency: ${batch.currencyCode}. Found: ${accts.length}`);
            return accts.length > 0 ? accts[0].id : null;
        };

        const payerAccountId = await findBankAccount(payerOrgId);
        const payeeAccountId = await findBankAccount(payeeOrgId);

        // 4. Create Cash Transactions (if accounts found)
        if (payerAccountId) {
            console.log(`[NETTING] Creating Outbound Payment for Org ${payerOrgId} (Acct ${payerAccountId})`);
            await cashService.createTransaction({
                bankAccountId: payerAccountId,
                sourceModule: 'IC',
                sourceId: batch.id,
                amount: (-absAmount).toString(), // Outflow
                date: new Date(),
                reference: `NET-${batch.id.substring(0, 6)}`,
                description: `IC Netting Payment to ${payeeOrgId}`,
                status: 'Cleared' // Auto-cleared for IC?
            });
        } else {
            console.warn(`[NETTING] No bank account found for Payer Org ${payerOrgId}. Skipping Cash Payment.`);
        }

        if (payeeAccountId) {
            console.log(`[NETTING] Creating Inbound Receipt for Org ${payeeOrgId} (Acct ${payeeAccountId})`);
            await cashService.createTransaction({
                bankAccountId: payeeAccountId,
                sourceModule: 'IC',
                sourceId: batch.id,
                amount: absAmount.toString(), // Inflow
                date: new Date(),
                reference: `NET-${batch.id.substring(0, 6)}`,
                description: `IC Netting Receipt from ${payerOrgId}`,
                status: 'Cleared'
            });
        } else {
            console.warn(`[NETTING] No bank account found for Payee Org ${payeeOrgId}. Skipping Cash Receipt.`);
        }

        // 5. Update Status
        await db.update(icNettingBatches)
            .set({ status: "Settled", settlementDate: new Date() })
            .where(eq(icNettingBatches.id, batchId));

        await db.update(icHeaders)
            .set({ settlementStatus: "Settled" })
            .where(eq(icHeaders.settlementBatchId, batchId));

        return { success: true, batchId, payerAccountId, payeeAccountId };
    }

    async getIcNettingBatches() {
        return await db.select().from(icNettingBatches).orderBy(sql`${icNettingBatches.createdAt} DESC`);
    }

}

export const nettingService = new NettingService();
