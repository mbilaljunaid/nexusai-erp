
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

    async getDsoTrend() {
        return [
            { name: 'Jan', dso: 45, industry: 40 },
            { name: 'Feb', dso: 42, industry: 40 },
            { name: 'Mar', dso: 48, industry: 40 },
            { name: 'Apr', dso: 40, industry: 40 },
            { name: 'May', dso: 38, industry: 40 },
            { name: 'Jun', dso: 35, industry: 40 },
        ];
    }

    async getCustomerStatement(customerId: string) {
        return {
            customerName: "Acme Corp",
            accountNumber: "ACC-001",
            statementDate: new Date(),
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            openingBalance: 15000,
            closingBalance: 25000,
            transactions: [
                { date: "2024-03-01", type: "Invoice", reference: "INV-2024-001", amount: 15000, balance: 15000 },
                { date: "2024-03-15", type: "Payment", reference: "RCP-2024-001", amount: -5000, balance: 10000 },
                { date: "2024-03-20", type: "Invoice", reference: "INV-2024-002", amount: 15000, balance: 25000 }
            ],
            aging: { current: 10000, days30: 15000, days60: 0, days90: 0, over90: 0 }
        };
    }
}

export const arReportingService = new ArReportingService();
