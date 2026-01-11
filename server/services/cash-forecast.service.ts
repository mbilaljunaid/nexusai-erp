
import { db } from "../db";
import {
    cashBankAccounts,
    apInvoices,
    arInvoices
} from "@shared/schema";
import { eq, sql, and, gte, lte, ne } from "drizzle-orm";

export interface DailyForecast {
    date: string;
    openingBalance: number;
    inflow: number;  // AR
    outflow: number; // AP
    netChange: number;
    closingBalance: number;
    details: ForecastDetail[];
}

export interface ForecastDetail {
    source: "AR" | "AP" | "MANUAL";
    reference: string;
    amount: number;
    date: string;
    entityName?: string; // Supplier or Customer
}

export class CashForecastService {

    /**
     * Generates a liquidity forecast for N days starting from a given date.
     * Aggregates:
     * 1. Current Bank Balances (as Opening Balance for Day 0)
     * 2. Confirmed AP Invoices (Unpaid, due within range) -> Outflows
     * 3. Confirmed AR Invoices (Unpaid, due within range) -> Inflows
     */
    async generateForecast(startDate: Date = new Date(), days: number = 5, scenario: "BASELINE" | "OPTIMISTIC" | "PESSIMISTIC" = "BASELINE"): Promise<DailyForecast[]> {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);

        // Scenario Multipliers
        const multipliers = {
            BASELINE: { inflow: 1.0, outflow: 1.0 },
            OPTIMISTIC: { inflow: 1.1, outflow: 0.9 }, // Faster collections, managed payments
            PESSIMISTIC: { inflow: 0.8, outflow: 1.2 }  // Slow collections, high urgent payments
        }[scenario];

        // 1. Get Current Liquidity Position (Across all enabled accounts)
        // In a real scenario, this might filter by Ledger or Currency. 
        // For now, we assume base currency (USD) consolidation.
        const accounts = await db.select().from(cashBankAccounts).where(eq(cashBankAccounts.active, true));
        let runningBalance = accounts.reduce((sum, acc) => sum + Number(acc.currentBalance || 0), 0);

        // 2. Fetch AP Outflows (Due in range)
        const apOutflows = await db.select({
            date: apInvoices.dueDate,
            amount: apInvoices.invoiceAmount, // Using full amount for simplicity; ideally use 'amountRemaining'
            ref: apInvoices.invoiceNumber,
            supplierId: apInvoices.supplierId
        })
            .from(apInvoices)
            .where(
                and(
                    ne(apInvoices.paymentStatus, "PAID"),
                    gte(apInvoices.dueDate, startDate),
                    lte(apInvoices.dueDate, endDate)
                )
            );

        // 3. Fetch AR Inflows (Due in range)
        const arInflows = await db.select({
            date: arInvoices.dueDate,
            amount: arInvoices.totalAmount, // Assuming totalAmount is the receivable
            ref: arInvoices.invoiceNumber,
            customerId: arInvoices.customerId
        })
            .from(arInvoices)
            .where(
                and(
                    ne(arInvoices.status, "Paid"),
                    gte(arInvoices.dueDate, startDate),
                    lte(arInvoices.dueDate, endDate)
                )
            );

        // 4. Build Daily Forecast
        const forecast: DailyForecast[] = [];

        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            // Aggregations
            const inputs = arInflows.filter(t => t.date && t.date.toISOString().startsWith(dateStr));
            const outputs = apOutflows.filter(t => t.date && t.date.toISOString().startsWith(dateStr));

            const dailyInflow = inputs.reduce((sum, item) => sum + Number(item.amount), 0) * multipliers.inflow;
            const dailyOutflow = outputs.reduce((sum, item) => sum + Number(item.amount), 0) * multipliers.outflow;
            const netChange = dailyInflow - dailyOutflow;

            const closing = runningBalance + netChange;

            // Detail mapping
            const details: ForecastDetail[] = [
                ...inputs.map(i => ({
                    source: "AR" as const,
                    reference: i.ref,
                    amount: Number(i.amount),
                    date: dateStr,
                    entityName: `Customer ${i.customerId}` // Ideally fetch name
                })),
                ...outputs.map(o => ({
                    source: "AP" as const,
                    reference: o.ref,
                    amount: -Number(o.amount), // Negative for display/sorting if needed, but forecast usually separates In/Out
                    date: dateStr,
                    entityName: `Supplier ${o.supplierId}`
                }))
            ];

            forecast.push({
                date: dateStr,
                openingBalance: runningBalance,
                inflow: dailyInflow,
                outflow: dailyOutflow,
                netChange,
                closingBalance: closing,
                details
            });

            // Update running balance for next day
            runningBalance = closing;
        }

        return forecast;
    }
}

export const cashForecastService = new CashForecastService();
