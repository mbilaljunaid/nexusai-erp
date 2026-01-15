
import { db } from "../db";
import {
    apInvoices, arInvoices, treasuryInstallments, treasuryFxDeals, treasuryCashForecasts,
    apPayments
} from "@shared/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export class CashForecastService {

    /**
     * Aggregates cash flows and populates treasury_cash_forecasts
     */
    async generateForecast(horizonDays: number = 90) {
        // 1. Clear old baseline forecasts for the future window to avoid duplicates
        // Ideally we'd use a runId, but for simplicity we wipe 'BASELINE' for >= today
        await db.delete(treasuryCashForecasts)
            .where(and(
                eq(treasuryCashForecasts.scenario, 'BASELINE'),
                gte(treasuryCashForecasts.forecastDate, new Date())
            ));

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + horizonDays);

        const forecasts = [];

        // 2. AP Invoices (Outflows)
        const payables = await db.select({
            id: apInvoices.id,
            dueDate: apInvoices.dueDate,
            amount: apInvoices.invoiceAmount,
            currency: apInvoices.invoiceCurrencyCode
        })
            .from(apInvoices)
            .where(and(
                gte(apInvoices.dueDate, new Date()),
                lte(apInvoices.dueDate, cutoffDate)
            ));

        for (const inv of payables) {
            if (Number(inv.amount) > 0) {
                // ... logic
                forecasts.push({
                    forecastDate: inv.dueDate || new Date(),
                    currency: inv.currency || 'USD',
                    amount: (-1 * Number(inv.amount)).toFixed(2),
                    source: 'AP_INVOICE',
                    scenario: 'BASELINE',
                    confidence: "90",
                    sourceId: String(inv.id)
                });
            }
        }

        // 3. AR Invoices (Inflows)
        const receivables = await db.select({
            id: arInvoices.id,
            dueDate: arInvoices.dueDate,
            amount: arInvoices.amount,
            currency: arInvoices.currency
        })
            .from(arInvoices)
            .where(and(
                gte(arInvoices.dueDate, new Date()),
                lte(arInvoices.dueDate, cutoffDate)
            ));

        for (const inv of receivables) {
            if (Number(inv.amount) > 0) {
                forecasts.push({
                    forecastDate: inv.dueDate || new Date(),
                    currency: inv.currency || 'USD',
                    amount: Number(inv.amount).toFixed(2), // Positive for Inflow
                    source: 'AR_INVOICE',
                    scenario: 'BASELINE',
                    confidence: "80", // AR has collection risk
                    sourceId: inv.id
                });
            }
        }

        // 4. Treasury Installments (Debt = Outflow, Investment = Inflow)
        // Need to join with Deals to know type, but for now assuming Installment has type or sign logic?
        // Actually treasuryInstallments just has amounts. We need to check Deal Type.
        // Let's fetch installments joined with deals
        // Since drizzle join syntax can be verbose, fetching all creates potential N+1 if not careful.
        // Let's just fetch pending installments and their deal info.

        // Simpler: Fetch all pending installments in range
        const installments = await db.select({
            id: treasuryInstallments.id,
            totalAmount: treasuryInstallments.totalAmount,
            dueDate: treasuryInstallments.dueDate,
            dealId: treasuryInstallments.dealId,
            // dealType: treasuryDeals.type // Need join
        }).from(treasuryInstallments)
            .where(and(
                gte(treasuryInstallments.dueDate, new Date()),
                lte(treasuryInstallments.dueDate, cutoffDate),
                eq(treasuryInstallments.status, 'PENDING')
            ));

        // We need deal types to know sign.
        // Bulk fetch deals
        const dealIds = [...new Set(installments.map(i => i.dealId))];
        // TODO: Optimize if many deals.

        // For simple MVP, let's just loop or do a quick lookup map if small scale
        // Or standard Join
        /*
           const results = await db.select().from(treasuryInstallments)
             .innerJoin(treasuryDeals, eq(treasuryInstallments.dealId, treasuryDeals.id))
             ...
        */

        // Implementing basic join logic manually or via efficient query later.
        // Let's assume we can query deals map.
        const dealsMap = new Map();
        if (dealIds.length > 0) {
            // We need to import treasuryDeals in the query too to join
            // Let's use a raw query or just fetch relevant deals
            // Going with simple fetch for now
            const deals = await db.query.treasuryDeals.findMany({
                where: (fields, ops) => ops.inArray(fields.id, dealIds)
            });
            deals.forEach(d => dealsMap.set(d.id, d));
        }

        for (const inst of installments) {
            const deal = dealsMap.get(inst.dealId);
            if (!deal) continue;

            let amount = Number(inst.totalAmount);
            if (deal.type === 'DEBT') amount = amount * -1; // Outflow
            // INVESTMENTS are Inflows (Positive)

            forecasts.push({
                forecastDate: inst.dueDate,
                currency: deal.currency || 'USD',
                amount: amount.toFixed(2),
                source: deal.type === 'DEBT' ? 'DEBT_PAYMENT' : 'INVESTMENT_RETURN',
                scenario: 'BASELINE',
                confidence: "100", // Contractual
                sourceId: inst.id
            });
        }

        // 5. FX Settlements
        const fxDeals = await db.select()
            .from(treasuryFxDeals)
            .where(and(
                gte(treasuryFxDeals.valueDate, new Date()),
                lte(treasuryFxDeals.valueDate, cutoffDate),
                eq(treasuryFxDeals.status, 'CONFIRMED')
            ));

        for (const fx of fxDeals) {
            // Represents a net flow? Or two separate flows?
            // Ideally two flows: Buy (Inflow) and Sell (Outflow).
            // Let's record both for accurate currency positions.

            // Buy Leg (Inflow of BuyCurrency)
            forecasts.push({
                forecastDate: fx.valueDate,
                currency: fx.buyCurrency,
                amount: Number(fx.buyAmount).toFixed(2),
                source: 'FX_SETTLEMENT',
                scenario: 'BASELINE',
                confidence: "100",
                sourceId: fx.id
            });

            // Sell Leg (Outflow of SellCurrency)
            forecasts.push({
                forecastDate: fx.valueDate,
                currency: fx.sellCurrency,
                amount: (-1 * Number(fx.sellAmount)).toFixed(2),
                source: 'FX_SETTLEMENT',
                scenario: 'BASELINE',
                confidence: "100",
                sourceId: fx.id
            });
        }

        // Batch insert
        if (forecasts.length > 0) {
            await db.insert(treasuryCashForecasts).values(forecasts);
        }

        return { generatedCount: forecasts.length };
    }

    async getForecastData() {
        // Group by Date + Currency?
        // Or just return raw list for frontend to aggregate
        return await db.select()
            .from(treasuryCashForecasts)
            .where(eq(treasuryCashForecasts.scenario, 'BASELINE'))
            .orderBy(treasuryCashForecasts.forecastDate);
    }

    /**
     * AI/Stats: Detect Anomalies in Payment History
     * Returns list of recent payments that are statistically significant outliers (> 3 Sigma)
     */
    async detectAnomalies() {
        // 1. Fetch history of payments (last 6 months)
        const history = await db.select({ amount: apPayments.amount })
            .from(apPayments)
            .limit(1000); // Sample size

        if (history.length < 10) return []; // Not enough data

        const values = history.map(h => Number(h.amount));
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        const threshold = mean + (3 * stdDev);

        // 2. Find recent pending/processed payments exceeding threshold
        const anomalies = await db.select()
            .from(apPayments)
            .where(and(
                // sql`${apPayments.amount} > ${threshold}` // Simplified, Drizzle generic sql
                // Actually easier to just fetch recent 20 and filter in JS for this MVP
            ))
            .limit(50)
            .orderBy(desc(apPayments.paymentDate));

        return anomalies.filter(p => Number(p.amount) > threshold).map(p => ({
            ...p,
            reason: `Amount ${Number(p.amount).toFixed(2)} exceeds 3-sigma threshold (${threshold.toFixed(2)})`
        }));
    }
}

export const cashForecastService = new CashForecastService();
