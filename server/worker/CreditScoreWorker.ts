
import { db } from "../db";
import { arCustomers, arCustomerAccounts, arInvoices, arReceipts } from "@shared/schema";
import { eq, and, gt, sql, lt } from "drizzle-orm";

export class CreditScoreWorker {
    static async calculateScore(accountId: string) {
        console.log(`[CreditScoreWorker] Calculating for ${accountId}`);
        try {
            // 1. Fetch Account
            const [account] = await db.select().from(arCustomerAccounts).where(eq(arCustomerAccounts.id, accountId));
            if (!account) return;

            let score = 100;
            const limit = Number(account.creditLimit) || 0;

            // 2. Overdue Penalty (Direct DB Count)
            // Count invoices where status != Paid/Cancelled AND dueDate < NOW
            const [overdueRes] = await db.select({ count: sql<number>`count(*)` })
                .from(arInvoices)
                .where(and(
                    eq(arInvoices.accountId, accountId),
                    sql`${arInvoices.status} NOT IN ('Paid', 'Cancelled')`,
                    sql`${arInvoices.dueDate} < NOW()`
                ));
            const overdueCount = Number(overdueRes?.count || 0);
            score -= (overdueCount * 5);

            // 3. Utilization Penalty (Direct Sum)
            // Sum totalAmount of invoices (Outstanding = Invoiced - Paid, simplified check)
            // Better: Sum of (totalAmount) where status != Paid/Cancelled
            // Note: This matches getAccountBalance logic but optimized
            const [invSum] = await db.select({ total: sql<number>`sum(total_amount)` })
                .from(arInvoices)
                .where(and(
                    eq(arInvoices.accountId, accountId),
                    sql`${arInvoices.status} != 'Cancelled'`
                ));

            const [recSum] = await db.select({ total: sql<number>`sum(amount)` })
                .from(arReceipts)
                .where(eq(arReceipts.accountId, accountId));

            const totalInvoiced = Number(invSum?.total || 0);
            const totalPaid = Number(recSum?.total || 0);
            const outstanding = totalInvoiced - totalPaid;

            if (limit > 0) {
                const utilization = outstanding / limit;
                if (utilization > 0.9) score -= 20;
                else if (utilization > 0.75) score -= 10;
                else if (utilization > 0.5) score -= 5;
            }

            // 4. Update
            score = Math.max(0, Math.min(100, score));
            let risk = "Low";
            if (score < 50) risk = "High";
            else if (score < 75) risk = "Medium";

            await db.update(arCustomerAccounts).set({
                creditScore: score,
                riskCategory: risk,
                lastScoreUpdate: new Date()
            }).where(eq(arCustomerAccounts.id, accountId));

            console.log(`[CreditScoreWorker] Updated ${accountId}: Score=${score} (${risk})`);

        } catch (err) {
            console.error(`[CreditScoreWorker] Failed for ${accountId}`, err);
        }
    }
}
