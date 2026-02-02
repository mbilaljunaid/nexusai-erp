
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { storage } from "../storage";
import { glDailyRates, cashBankAccounts, cashRevaluationHistory } from "@shared/schema";
import { cashAccountingService } from "./cash-accounting.service";

export class CashRevaluationService {
    async calculateRevaluation(bankAccountId: string, targetDate: Date = new Date()) {
        const account = await storage.getCashBankAccount(bankAccountId);
        if (!account) throw new Error("Bank account not found");

        const ledgerCurrency = "USD";
        if (account.currency === ledgerCurrency) {
            return { gainLoss: 0, message: "No revaluation needed for functional currency" };
        }

        const foreignBalance = Number(account.currentBalance);

        // 1. Get functional value at CURRENT rate
        const currentRate = await this.getExchangeRate(account.currency!, ledgerCurrency, targetDate);
        if (!currentRate) {
            throw new Error(`No exchange rate found for ${account.currency} to ${ledgerCurrency}`);
        }

        // 2. Determine Historical Value (Cost Basis)
        const priorDate = new Date(targetDate);
        priorDate.setMonth(priorDate.getMonth() - 1);
        const historicalRate = await this.getExchangeRate(account.currency!, ledgerCurrency, priorDate) || (currentRate * 0.95);

        const currentFunctionalValue = foreignBalance * currentRate;
        const historicalFunctionalValue = foreignBalance * historicalRate;
        const gainLoss = currentFunctionalValue - historicalFunctionalValue;

        return {
            bankAccountId,
            currency: account.currency,
            foreignBalance,
            historicalRate,
            currentRate,
            functionalValue: currentFunctionalValue,
            gainLoss,
        };
    }

    private async getExchangeRate(from: string, to: string, date: Date): Promise<number | null> {
        const rates = await db.select()
            .from(glDailyRates)
            .where(and(
                eq(glDailyRates.fromCurrency, from),
                eq(glDailyRates.toCurrency, to)
            ))
            .orderBy(sql`${glDailyRates.conversionDate} desc`)
            .limit(1);

        if (rates.length > 0) return Number(rates[0].rate);

        const mocks: Record<string, number> = { "EUR": 1.08, "GBP": 1.27, "JPY": 0.0067 };
        return mocks[from] || null;
    }

    async postRevaluation(bankAccountId: string, userId: string = "system", rateOverride?: number) {
        const result = await this.calculateRevaluation(bankAccountId);

        // Apply manual override if provided
        let usedRate = result.currentRate;
        let finalGainLoss = result.gainLoss;
        const rateType = rateOverride ? "User" : "Corporate";

        if (rateOverride) {
            usedRate = rateOverride;
            const currentFunctionalValue = result.foreignBalance * usedRate;
            const historicalFunctionalValue = result.foreignBalance * result.historicalRate;
            finalGainLoss = currentFunctionalValue - historicalFunctionalValue;
        }

        if (typeof finalGainLoss === 'number' && finalGainLoss !== 0) {
            const account = await storage.getCashBankAccount(bankAccountId);
            const referenceId = `REVAL-${Date.now()}`;

            // Post to SLA
            await cashAccountingService.createAccounting({
                eventType: "REVALUATION",
                ledgerId: account?.ledgerId || "PRIMARY",
                description: `FX Revaluation for ${account?.name} (${rateType} Rate: ${usedRate})`,
                amount: finalGainLoss,
                currency: "USD",
                date: new Date(),
                sourceId: bankAccountId,
                referenceId: referenceId
            });

            // Log to Revaluation History (New)
            await db.insert(cashRevaluationHistory).values({
                bankAccountId,
                currency: result.currency!,
                systemRate: result.currentRate.toString(),
                usedRate: usedRate.toString(),
                rateType,
                unrealizedGainLoss: finalGainLoss.toFixed(2),
                postedJournalId: referenceId, // In a real system, we'd get the actual Journal ID
                userId
            });

            return {
                status: "Posted",
                gainLoss: finalGainLoss,
                usedRate,
                rateType
            };
        }
        return { status: "No Change", gainLoss: 0 };
    }
}

export const cashRevaluationService = new CashRevaluationService();
