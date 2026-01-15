/**
 * ExchangeRateService
 * Handles currency conversion for GL and Reporting.
 * V1: Stubbed rates. Future: Integration with Fixer.io or Oracle GL Rates.
 */
export class ExchangeRateService {

    // Default Functional Currency of the Ledger
    private functionalCurrency = "USD";

    async getRate(fromCurrency: string, toCurrency: string = this.functionalCurrency, date: Date = new Date()): Promise<number> {
        if (fromCurrency === toCurrency) return 1.0;

        // Stubbed Rates (approximate)
        const rates: Record<string, number> = {
            "EUR": 1.10, // 1 EUR = 1.10 USD
            "GBP": 1.30,
            "CAD": 0.75,
            "INR": 0.012
        };

        if (rates[fromCurrency]) {
            // In real app, we query `gl_daily_rates` table
            return rates[fromCurrency];
        }

        // Default fallback
        return 1.0;
    }

    async convert(amount: number, fromCurrency: string, toCurrency: string = this.functionalCurrency): Promise<number> {
        const rate = await this.getRate(fromCurrency, toCurrency);
        return amount * rate;
    }
}

export const exchangeRateService = new ExchangeRateService();
