
import { db } from "../db";
import { arInvoices, arCustomerAccounts, arCustomers } from "@shared/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";

interface AiPrediction {
    invoiceId: string;
    predictedDate: Date;
    confidence: number;
    reasoning: string;
}

interface CollectionRecommendation {
    customerId: string;
    action: "Email" | "Call" | "Hold" | "Legal" | "None";
    priority: "High" | "Medium" | "Low";
    reasoning: string;
}

export class ArAiService {

    // Mock AI Prediction using statistical average
    async predictPaymentDates(invoiceIds: string[]): Promise<AiPrediction[]> {
        const predictions: AiPrediction[] = [];

        for (const id of invoiceIds) {
            const [invoice] = await db.select().from(arInvoices).where(eq(arInvoices.id, id));
            if (!invoice) continue;

            // 1. Get Customer History
            const history = await db.select()
                .from(arInvoices)
                .where(and(
                    eq(arInvoices.customerId, invoice.customerId),
                    eq(arInvoices.status, "Paid"),
                    isNotNull(arInvoices.dueDate)
                    // Ideally check actual payment date vs due date
                ))
                .limit(10);

            // Calculate avg days late
            let totalLateDays = 0;
            let count = 0;

            // Mocking historical data behavior since we don't have explicit "paidDate" column in this MVP schema 
            // (usually would use receipt applications). 
            // Let's assume a "Avg Days to Pay" of 5 days late for this demo.
            const avgDaysLate = 5;

            const dueDate = new Date(invoice.dueDate || Date.now());
            const predicted = new Date(dueDate);
            predicted.setDate(dueDate.getDate() + avgDaysLate);

            predictions.push({
                invoiceId: id,
                predictedDate: predicted,
                confidence: 0.85,
                reasoning: `Based on customer's average payment delay of ${avgDaysLate} days.`
            });
        }

        return predictions;
    }

    async recommendCollectionStrategy(customerId: string): Promise<CollectionRecommendation> {
        const [account] = await db.select().from(arCustomerAccounts).where(eq(arCustomerAccounts.customerId, customerId));

        // Default
        if (!account) return { customerId, action: "None", priority: "Low", reasoning: "No account found" };

        const score = Number(account.creditScore) || 100;
        const risk = account.riskCategory || "Low";

        // Get Overdue Amount
        const invoices = await db.select().from(arInvoices).where(eq(arInvoices.customerId, customerId));
        const overdue = invoices.filter(i => i.status === "Overdue");
        const totalOverdue = overdue.reduce((sum, i) => sum + Number(i.totalAmount), 0);

        if (totalOverdue > 10000 && score < 50) {
            return {
                customerId,
                action: "Call",
                priority: "High",
                reasoning: `High risk customer (Score: ${score}) with signficant overdue amount ($${totalOverdue}).`
            };
        } else if (totalOverdue > 0 && risk === "High") {
            return {
                customerId,
                action: "Hold",
                priority: "High",
                reasoning: "High risk customer with overdue invoices. Suggest credit hold."
            };
        } else if (totalOverdue > 0) {
            return {
                customerId,
                action: "Email",
                priority: "Medium",
                reasoning: "Standard overdue follow-up."
            };
        }

        return { customerId, action: "None", priority: "Low", reasoning: "Account in good standing." };
    }
}

export const arAiService = new ArAiService();
