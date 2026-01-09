
import { storage } from "../storage";
import { type GlBalance } from "@shared/schema";

export class GlReportingService {

    /**
     * Translates balances from a source ledger's functional currency to a target reporting currency.
     * Creates new balance entries in the same ledger (or a reporting ledger) with the target currency.
     * In this implementation, we store them in the SAME ledger with a different currencyCode and translatedFlag=true.
     */
    async translateBalances(ledgerId: string, periodName: string, targetCurrency: string, conversionDate: Date) {
        console.log(`Starting Translation for Ledger ${ledgerId} to ${targetCurrency}`);

        // 1. Get Source Ledger
        const ledger = await storage.getGlLedger(ledgerId);
        if (!ledger) throw new Error("Ledger not found");
        const sourceCurrency = ledger.currencyCode;

        if (sourceCurrency === targetCurrency) {
            throw new Error("Source and Target currency are the same");
        }

        // 2. Get Exchange Rate
        const rateRecord = await storage.getGlDailyRate(sourceCurrency, targetCurrency, conversionDate);
        if (!rateRecord) {
            throw new Error(`No exchange rate found from ${sourceCurrency} to ${targetCurrency} for ${conversionDate.toISOString()}`);
        }
        const rate = Number(rateRecord.rate);
        console.log(`Using Exchange Rate: ${rate}`);

        // 3. Get Source Balances
        const sourceBalances = await storage.getGlBalances(ledgerId, periodName, sourceCurrency);
        console.log(`Found ${sourceBalances.length} source balance rows`);

        // 4. Convert and Upsert
        const translatedBalances: GlBalance[] = [];
        for (const bal of sourceBalances) {
            const newBal = await storage.upsertGlBalance({
                ledgerId: ledgerId,
                codeCombinationId: bal.codeCombinationId,
                currencyCode: targetCurrency,
                periodName: bal.periodName,
                periodYear: bal.periodYear,
                periodNum: bal.periodNum,

                // Translation Logic
                periodNetDr: (Number(bal.periodNetDr) * rate).toString(),
                periodNetCr: (Number(bal.periodNetCr) * rate).toString(),
                beginBalance: (Number(bal.beginBalance) * rate).toString(),
                endBalance: (Number(bal.endBalance) * rate).toString(),

                translatedFlag: true // Mark as translated
            });
            translatedBalances.push(newBal);
        }

        return translatedBalances;
    }

    /**
     * Aggregates balances across a Ledger Set.
     * Assumes all balances are already in the desired reporting currency (i.e., Translation has been run).
     */
    async getConsolidatedBalances(ledgerSetId: string, periodName: string, reportingCurrency: string) {
        console.log(`Starting Consolidation for Set ${ledgerSetId} in ${reportingCurrency}`);

        // 1. Get Ledger Set Members
        const ledgers = await storage.getLedgerSetMembers(ledgerSetId);
        if (ledgers.length === 0) throw new Error("Ledger Set is empty or not found");

        const aggregatedMap = new Map<string, {
            periodNetDr: number,
            periodNetCr: number,
            beginBalance: number,
            endBalance: number
        }>();

        // 2. Iterate and Aggregate
        for (const ledger of ledgers) {
            const balances = await storage.getGlBalances(ledger.id, periodName, reportingCurrency);

            for (const bal of balances) {
                const existing = aggregatedMap.get(bal.codeCombinationId) || {
                    periodNetDr: 0, periodNetCr: 0, beginBalance: 0, endBalance: 0
                };

                aggregatedMap.set(bal.codeCombinationId, {
                    periodNetDr: existing.periodNetDr + Number(bal.periodNetDr),
                    periodNetCr: existing.periodNetCr + Number(bal.periodNetCr),
                    beginBalance: existing.beginBalance + Number(bal.beginBalance),
                    endBalance: existing.endBalance + Number(bal.endBalance)
                });
            }
        }

        // 3. Format Result
        const result = Array.from(aggregatedMap.entries()).map(([ccid, totals]) => ({
            codeCombinationId: ccid,
            currencyCode: reportingCurrency,
            periodName,
            ...totals
        }));

        return result;
    }
}

export const glReportingService = new GlReportingService();
