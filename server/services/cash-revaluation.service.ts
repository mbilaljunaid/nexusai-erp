
import { db } from "../db";
import { eq, and } from "drizzle-orm";
import { storage } from "../storage";
import { glDailyRates, cashBankAccounts } from "@shared/schema";
import { cashAccountingService } from "./cash-accounting.service";

export class CashRevaluationService {
    async calculateRevaluation(bankAccountId: string, targetDate: Date = new Date()) {
        const account = await storage.getCashBankAccount(bankAccountId);
        if (!account) throw new Error("Bank account not found");

        // Only revalue if currency is different from Ledger currency
        // For simplicity, we assume ledger currency is 'USD' for this ERP prototype
        const ledgerCurrency = "USD";
        if (account.currency === ledgerCurrency) {
            return { gainLoss: 0, message: "No revaluation needed for functional currency" };
        }

        // 1. Get current foreign balance
        const foreignBalance = Number(account.currentBalance);

        // 2. Get historical value (sum of all transactions in functional currency)
        // In this ERP, we simulate cost basis by looking for a 'historical' rate or using an average.
        // For parity, we use a fixed cost basis if not available in transactions.
        const historicalRate = 1.1;

        // 3. Get latest exchange rate
        const rates = await db.select()
            .from(glDailyRates)
            .where(and(
                eq(glDailyRates.fromCurrency, account.currency as string),
                eq(glDailyRates.toCurrency, ledgerCurrency)
            ))
            .limit(1);

        const currentRate = rates.length > 0 ? Number(rates[0].rate) : 1.2;

        // 4. Calculate Unrealized Gain/Loss
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

    async postRevaluation(bankAccountId: string, userId: string = "system") {
        const result = await this.calculateRevaluation(bankAccountId);
        if (typeof result.gainLoss === 'number' && result.gainLoss !== 0) {
            const account = await storage.getCashBankAccount(bankAccountId);

            // Post to SLA
            await cashAccountingService.createAccounting({
                eventType: "REVALUATION",
                ledgerId: account?.ledgerId || "PRIMARY",
                description: `FX Revaluation for ${account?.name}`,
                amount: result.gainLoss,
                currency: "USD",
                date: new Date(),
                sourceId: bankAccountId,
                referenceId: `REVAL-${Date.now()}`
            });

            return {
                status: "Posted",
                gainLoss: result.gainLoss
            };
        }
        return { status: "No Change", gainLoss: 0 };
    }
}

export const cashRevaluationService = new CashRevaluationService();
