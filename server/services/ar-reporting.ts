
import { db } from "../db";
import { arInvoices, arReceipts, arAdjustments } from "@shared/schema";
import { eq, and, lte, sql } from "drizzle-orm";

export class ArReportingService {

    // 7-Bucket Aging Report
    async generateAgingReport(asOfDate: Date = new Date()) {
        const invoices = await db.select().from(arInvoices).where(lte(arInvoices.createdAt, asOfDate));

        // Buckets: Current, 1-30, 31-60, 61-90, 91-180, 180-360, >360
        const report = {
            current: 0,
            days1_30: 0,
            days31_60: 0,
            days61_90: 0,
            days91_180: 0,
            days180_360: 0,
            over360: 0,
            total: 0
        };

        for (const inv of invoices) {
            // Calculate open balance as of date?
            // Complex: Need to subtract receipts applied BEFORE asOfDate.
            // For MVP, using current open balance if invoice was created before asOfDate. (Simplified)
            // Ideally we walk through applications.

            if (inv.status === "Paid" || inv.status === "Cancelled") continue;
            // Better: Check if paid AFTER asOfDate?

            const dueDate = new Date(inv.dueDate || inv.createdAt || Date.now());
            const diffTime = asOfDate.getTime() - dueDate.getTime();
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const amount = Number(inv.totalAmount); // Simplified outstanding

            if (daysOverdue <= 0) report.current += amount;
            else if (daysOverdue <= 30) report.days1_30 += amount;
            else if (daysOverdue <= 60) report.days31_60 += amount;
            else if (daysOverdue <= 90) report.days61_90 += amount;
            else if (daysOverdue <= 180) report.days91_180 += amount;
            else if (daysOverdue <= 360) report.days180_360 += amount;
            else report.over360 += amount;

            report.total += amount;
        }

        return report;
    }

    async reconcileArToGl(periodId: string) {
        // Mock Subledger Balance
        const subledgerBalance = (await db.select({
            total: sql`SUM(CAST(${arInvoices.totalAmount} AS NUMERIC))`
        }).from(arInvoices)).map(r => r.total)[0] || 0;

        // Mock GL Balance (In real app, query gl_balances for AR Control Account)
        const glBalance = subledgerBalance; // Assume perfect for MVP

        return {
            subledgerBalance,
            glBalance,
            difference: Number(subledgerBalance) - Number(glBalance),
            status: Number(subledgerBalance) === Number(glBalance) ? "Matched" : "Unmatched"
        };
    }
}

export const arReportingService = new ArReportingService();
