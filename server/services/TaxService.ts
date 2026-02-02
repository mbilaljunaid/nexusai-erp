
export class TaxService {

    // 2025 Standard Deduction (Single Filer)
    static STANDARD_DEDUCTION = 14600;

    // 2025 Federal Tax Brackets (Single Filer)
    // Source: IRS Revenue Procedure 2024-40
    static BRACKETS = [
        { limit: 11925, rate: 0.10 },
        { limit: 48475, rate: 0.12 },
        { limit: 103350, rate: 0.22 },
        { limit: 197300, rate: 0.24 },
        { limit: 250525, rate: 0.32 },
        { limit: 626350, rate: 0.35 },
        { limit: Infinity, rate: 0.37 },
    ];

    /**
     * Calculates Progressive Income Tax based on Annual Gross Income.
     * Subtracts Standard Deduction first.
     */
    static calculateFederalTax(annualGross: number): number {
        let taxableIncome = annualGross - this.STANDARD_DEDUCTION;
        if (taxableIncome <= 0) return 0;

        let tax = 0;
        let previousLimit = 0;

        for (const bracket of this.BRACKETS) {
            const currentLimit = bracket.limit;
            const taxableInBracket = Math.min(taxableIncome, currentLimit) - previousLimit;

            if (taxableInBracket > 0) {
                tax += taxableInBracket * bracket.rate;
                previousLimit = currentLimit;
            }

            if (taxableIncome <= currentLimit) break;
        }

        return Number(tax.toFixed(2));
    }
}
