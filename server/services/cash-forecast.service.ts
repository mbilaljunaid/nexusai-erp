
import { db } from "../db";
import {
    cashBankAccounts,
    apInvoices,
    arInvoices,
    cashForecasts
} from "@shared/schema";
import { eq, sql, and, gte, lte, ne } from "drizzle-orm";

export interface DailyForecast {
    date: string;
    openingBalance: number;
    inflow: number;  // AR + Manual In
    outflow: number; // AP + Manual Out
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
    type?: string; // For manual type
}

export class CashForecastService {

    /**
     * Generates a liquidity forecast for N days starting from a given date.
     * Aggregates:
     * 1. Current Bank Balances (as Opening Balance for Day 0)
     * 2. Confirmed AP Invoices (Unpaid, due within range) -> Outflows
     * 3. Confirmed AR Invoices (Unpaid, due within range) -> Inflows
     * 4. Manual Forecast Adjustments (Tax, Payroll, etc.)
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

        // 4. Fetch Manual Forecasts
        const manualForecasts = await db.select().from(cashForecasts)
            .where(
                and(
                    gte(cashForecasts.forecastDate, startDate),
                    lte(cashForecasts.forecastDate, endDate)
                )
            );

        // 5. Build Daily Forecast
        const forecast: DailyForecast[] = [];

        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            // Aggregations
            const inputs = arInflows.filter(t => t.date && t.date.toISOString().startsWith(dateStr));
            const outputs = apOutflows.filter(t => t.date && t.date.toISOString().startsWith(dateStr));
            const manual = manualForecasts.filter(t => t.forecastDate && t.forecastDate.toISOString().startsWith(dateStr));

            const manualInflow = manual.filter(m => Number(m.amount) > 0).reduce((sum, m) => sum + Number(m.amount), 0);
            const manualOutflow = manual.filter(m => Number(m.amount) < 0).reduce((sum, m) => sum + Math.abs(Number(m.amount)), 0);

            const dailyInflow = (inputs.reduce((sum, item) => sum + Number(item.amount), 0) * multipliers.inflow) + manualInflow;
            const dailyOutflow = (outputs.reduce((sum, item) => sum + Number(item.amount), 0) * multipliers.outflow) + manualOutflow;

            const netChange = dailyInflow - dailyOutflow;
            const closing = runningBalance + netChange;

            // Detail mapping
            const details: ForecastDetail[] = [
                ...inputs.map(i => ({
                    source: "AR" as const,
                    reference: i.ref,
                    amount: Number(i.amount),
                    date: dateStr,
                    entityName: `Customer ${i.customerId}`
                })),
                ...outputs.map(o => ({
                    source: "AP" as const,
                    reference: o.ref,
                    amount: -Number(o.amount),
                    date: dateStr,
                    entityName: `Supplier ${o.supplierId}`
                })),
                ...manual.map(m => ({
                    source: "MANUAL" as const,
                    reference: m.type || "Adjustment",
                    amount: Number(m.amount),
                    date: dateStr,
                    entityName: m.description,
                    type: m.type || "MANUAL"
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
