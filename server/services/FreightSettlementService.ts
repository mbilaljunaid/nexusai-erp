import { db } from "../db";
import {
    tlFreightCharges, tlShipments,
    type InsertTlFreightCharge, type TlFreightCharge
} from "../../shared/schema/transportation";
import { eq, and, sum } from "drizzle-orm";

export class FreightSettlementService {

    /**
     * Reconcile Freight Invoice
     * Matches carrier-provided cost against planned cost
     */
    async reconcileCharge(chargeId: string, invoiceAmount: number): Promise<TlFreightCharge> {
        const [charge] = await db.select().from(tlFreightCharges).where(eq(tlFreightCharges.id, chargeId)).limit(1);
        if (!charge) throw new Error("Freight charge not found");

        const plannedAmount = Number(charge.plannedAmount);
        const variance = invoiceAmount - plannedAmount;

        // Auto-match if variance is within tolerance (e.g. 5%)
        const tolerance = plannedAmount * 0.05;
        const status = Math.abs(variance) <= tolerance ? "MATCHED" : "DISPUTED";

        const [updated] = await db.update(tlFreightCharges)
            .set({
                actualAmount: invoiceAmount.toString(),
                varianceAmount: variance.toString(),
                status,
                reconciledAt: new Date(),
                reconciledBy: "AI_SETTLEMENT_ENGINE"
            })
            .where(eq(tlFreightCharges.id, chargeId))
            .returning();

        return updated;
    }

    /**
     * Interface to AP
     * Stub for creating invoice records in Accounts Payable
     */
    async interfaceToAP(chargeId: string) {
        const [charge] = await db.select().from(tlFreightCharges).where(eq(tlFreightCharges.id, chargeId)).limit(1);
        if (!charge || charge.status !== "MATCHED") throw new Error("Charge not ready for AP interface");

        // Logic to insert into ap_invoice_headers/lines would go here
        console.log(`Interfacing Charge ${chargeId} to AP for payment.`);

        await db.update(tlFreightCharges)
            .set({ status: "PAID" })
            .where(eq(tlFreightCharges.id, chargeId));
    }

    /**
     * Get Total Accrued Freight
     */
    async getAccruedLiability(): Promise<number> {
        const result = await db.select({
            total: sum(tlFreightCharges.plannedAmount)
        })
            .from(tlFreightCharges)
            .where(eq(tlFreightCharges.status, "ACCRUED"));

        return Number(result[0]?.total || 0);
    }
}

export const freightSettlementService = new FreightSettlementService();
