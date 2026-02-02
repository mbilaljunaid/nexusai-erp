
import { db } from "../../db";
import { icHeaders, icBatches, icOrgs } from "../../../shared/schema/intercompany";
import { eq, and, sql } from "drizzle-orm";

export class IntercompanyReportService {

    /**
     * Generates a Reconciliation Report matching Outbound (Provider) vs Inbound (Receiver).
     * Discrepancies occur if:
     * - Status is not APPROVED (In-Transit).
     * - Amounts differ (Currency logic, though currently headers have 1 amount).
     */
    async getReconciliationReport(periodName: string) {
        // For MVP, ignore period filtering or assume all data.

        // 1. Fetch all Headers
        const headers = await db.select().from(icHeaders);

        const report = headers.map(h => {
            const isEliminated = h.status === "APPROVED"; // Simplified Elimination Logic

            return {
                transactionId: h.id,
                batchId: h.batchId,
                providerOrgId: h.providerOrgId,
                receiverOrgId: h.receiverOrgId,
                amount: Number(h.amount),
                currency: h.currencyCode,
                status: h.status,
                outboundAmount: Number(h.amount), // Provider Side
                inboundAmount: isEliminated ? Number(h.amount) : 0, // Receiver Side (Recognized)
                difference: isEliminated ? 0 : Number(h.amount), // Variance
                reason: isEliminated ? "Eliminated" : "In-Transit / Dispute"
            };
        });

        // Summary
        const totalOutbound = report.reduce((sum, r) => sum + r.outboundAmount, 0);
        const totalInbound = report.reduce((sum, r) => sum + r.inboundAmount, 0);

        return {
            period: periodName,
            summary: {
                totalOutbound,
                totalInbound,
                variance: totalOutbound - totalInbound
            },
            details: report
        };
    }
}

export const intercompanyReportService = new IntercompanyReportService();
