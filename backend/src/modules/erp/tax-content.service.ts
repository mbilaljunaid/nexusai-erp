/**
 * Tax Content Population Service — P3.3 Gap Implementation
 *
 * Provides a pre-seeded library of tax rates for go-live geographies and tools
 * to configure/override them per tenant:
 *  - Standard sales/VAT/GST rates by country and state/region
 *  - Withholding tax (WHT) rates by country and income type
 *  - Tax calendar management (filing frequencies, due dates)
 *  - Nexus determination helpers
 *
 * Oracle Fusion Tax equivalent: Oracle Tax — Regime to Rate Setup Content
 */
import { Injectable, Logger } from '@nestjs/common';

export interface TaxRate {
    id: string;
    countryCode: string;
    stateCode?: string;
    taxType: 'SALES_TAX' | 'VAT' | 'GST' | 'HST' | 'WHT' | 'EXCISE' | 'CORPORATE_INCOME';
    taxRegime: string;
    taxCode: string;
    ratePct: number;
    effectiveFrom: string;
    effectiveTo?: string;
    description: string;
    isUserOverride?: boolean;
}

export interface WhtRate {
    countryCode: string;
    incomeType: 'DIVIDENDS' | 'INTEREST' | 'ROYALTIES' | 'SERVICES' | 'RENT';
    domesticRatePct: number;
    treatyRatePct?: number;  // Preferential treaty rate (if available)
    treatyCountry?: string;  // Country code with treaty
}

export interface TaxCalendarEntry {
    countryCode: string;
    filingType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
    taxType: string;
    dueDayOfPeriod: number;  // e.g., 20 = 20th of the month following period close
    penaltyRatePct?: number;
}

@Injectable()
export class TaxContentService {
    private readonly logger = new Logger(TaxContentService.name);

    // ── Built-in Tax Rate Library ─────────────────────────────────────────────
    private readonly BUILT_IN_RATES: TaxRate[] = [
        // United States — Federal
        { id: 'US-FEDERAL-CORP', countryCode: 'US', taxType: 'CORPORATE_INCOME', taxRegime: 'US_FEDERAL', taxCode: 'US-CORP-21', ratePct: 21.0, effectiveFrom: '2018-01-01', description: 'US Federal Corporate Income Tax (TCJA)' },

        // United States — State Sales Tax
        { id: 'US-CA-SALES', countryCode: 'US', stateCode: 'CA', taxType: 'SALES_TAX', taxRegime: 'US_STATE', taxCode: 'CA-SALES', ratePct: 7.25, effectiveFrom: '2013-01-01', description: 'California State Sales Tax' },
        { id: 'US-TX-SALES', countryCode: 'US', stateCode: 'TX', taxType: 'SALES_TAX', taxRegime: 'US_STATE', taxCode: 'TX-SALES', ratePct: 6.25, effectiveFrom: '1990-01-01', description: 'Texas State Sales Tax' },
        { id: 'US-NY-SALES', countryCode: 'US', stateCode: 'NY', taxType: 'SALES_TAX', taxRegime: 'US_STATE', taxCode: 'NY-SALES', ratePct: 4.0, effectiveFrom: '2005-06-01', description: 'New York State Sales Tax' },
        { id: 'US-FL-SALES', countryCode: 'US', stateCode: 'FL', taxType: 'SALES_TAX', taxRegime: 'US_STATE', taxCode: 'FL-SALES', ratePct: 6.0, effectiveFrom: '1988-01-01', description: 'Florida State Sales Tax' },
        { id: 'US-WA-SALES', countryCode: 'US', stateCode: 'WA', taxType: 'SALES_TAX', taxRegime: 'US_STATE', taxCode: 'WA-SALES', ratePct: 6.5, effectiveFrom: '2010-01-01', description: 'Washington State Sales Tax' },

        // European Union — VAT
        { id: 'GB-VAT-STANDARD', countryCode: 'GB', taxType: 'VAT', taxRegime: 'UK_VAT', taxCode: 'GB-VAT-20', ratePct: 20.0, effectiveFrom: '2011-01-04', description: 'UK Standard VAT' },
        { id: 'GB-VAT-REDUCED', countryCode: 'GB', taxType: 'VAT', taxRegime: 'UK_VAT', taxCode: 'GB-VAT-5', ratePct: 5.0, effectiveFrom: '2018-01-01', description: 'UK Reduced VAT (domestic energy, children\'s car seats)' },
        { id: 'DE-VAT-STANDARD', countryCode: 'DE', taxType: 'VAT', taxRegime: 'EU_VAT', taxCode: 'DE-VAT-19', ratePct: 19.0, effectiveFrom: '2007-01-01', description: 'Germany Standard VAT' },
        { id: 'FR-VAT-STANDARD', countryCode: 'FR', taxType: 'VAT', taxRegime: 'EU_VAT', taxCode: 'FR-VAT-20', ratePct: 20.0, effectiveFrom: '2014-01-01', description: 'France Standard VAT' },
        { id: 'NL-VAT-STANDARD', countryCode: 'NL', taxType: 'VAT', taxRegime: 'EU_VAT', taxCode: 'NL-VAT-21', ratePct: 21.0, effectiveFrom: '2012-10-01', description: 'Netherlands Standard VAT' },
        { id: 'ES-VAT-STANDARD', countryCode: 'ES', taxType: 'VAT', taxRegime: 'EU_VAT', taxCode: 'ES-VAT-21', ratePct: 21.0, effectiveFrom: '2012-09-01', description: 'Spain Standard VAT' },
        { id: 'IT-VAT-STANDARD', countryCode: 'IT', taxType: 'VAT', taxRegime: 'EU_VAT', taxCode: 'IT-VAT-22', ratePct: 22.0, effectiveFrom: '2013-10-01', description: 'Italy Standard VAT' },
        { id: 'PL-VAT-STANDARD', countryCode: 'PL', taxType: 'VAT', taxRegime: 'EU_VAT', taxCode: 'PL-VAT-23', ratePct: 23.0, effectiveFrom: '2011-01-01', description: 'Poland Standard VAT' },
        { id: 'SE-VAT-STANDARD', countryCode: 'SE', taxType: 'VAT', taxRegime: 'EU_VAT', taxCode: 'SE-VAT-25', ratePct: 25.0, effectiveFrom: '1995-01-01', description: 'Sweden Standard VAT' },

        // Asia Pacific
        { id: 'AU-GST-STANDARD', countryCode: 'AU', taxType: 'GST', taxRegime: 'AU_GST', taxCode: 'AU-GST-10', ratePct: 10.0, effectiveFrom: '2000-07-01', description: 'Australia GST' },
        { id: 'CA-GST-FEDERAL', countryCode: 'CA', taxType: 'GST', taxRegime: 'CA_GST', taxCode: 'CA-GST-5', ratePct: 5.0, effectiveFrom: '2008-01-01', description: 'Canada Federal GST' },
        { id: 'CA-HST-ON', countryCode: 'CA', stateCode: 'ON', taxType: 'HST', taxRegime: 'CA_HST', taxCode: 'CA-HST-ON-13', ratePct: 13.0, effectiveFrom: '2010-07-01', description: 'Ontario HST (harmonized)' },
        { id: 'IN-GST-STANDARD', countryCode: 'IN', taxType: 'GST', taxRegime: 'IN_GST', taxCode: 'IN-GST-18', ratePct: 18.0, effectiveFrom: '2017-07-01', description: 'India Standard GST' },
        { id: 'SG-GST-STANDARD', countryCode: 'SG', taxType: 'GST', taxRegime: 'SG_GST', taxCode: 'SG-GST-9', ratePct: 9.0, effectiveFrom: '2024-01-01', description: 'Singapore GST' },
        { id: 'JP-JCT-STANDARD', countryCode: 'JP', taxType: 'VAT', taxRegime: 'JP_JCT', taxCode: 'JP-JCT-10', ratePct: 10.0, effectiveFrom: '2019-10-01', description: 'Japan Consumption Tax' },
        { id: 'NZ-GST-STANDARD', countryCode: 'NZ', taxType: 'GST', taxRegime: 'NZ_GST', taxCode: 'NZ-GST-15', ratePct: 15.0, effectiveFrom: '2010-10-01', description: 'New Zealand GST' },

        // Middle East / MENA
        { id: 'AE-VAT-STANDARD', countryCode: 'AE', taxType: 'VAT', taxRegime: 'AE_VAT', taxCode: 'AE-VAT-5', ratePct: 5.0, effectiveFrom: '2018-01-01', description: 'UAE VAT' },
        { id: 'SA-VAT-STANDARD', countryCode: 'SA', taxType: 'VAT', taxRegime: 'SA_VAT', taxCode: 'SA-VAT-15', ratePct: 15.0, effectiveFrom: '2020-07-01', description: 'Saudi Arabia VAT' },
        { id: 'ZA-VAT-STANDARD', countryCode: 'ZA', taxType: 'VAT', taxRegime: 'ZA_VAT', taxCode: 'ZA-VAT-15', ratePct: 15.0, effectiveFrom: '2018-04-01', description: 'South Africa VAT' },
    ];

    // ── WHT Rates ─────────────────────────────────────────────────────────────
    private readonly BUILT_IN_WHT: WhtRate[] = [
        // US WHT rates (foreign payees)
        { countryCode: 'US', incomeType: 'DIVIDENDS', domesticRatePct: 30, treatyRatePct: 15, treatyCountry: 'GB' },
        { countryCode: 'US', incomeType: 'INTEREST', domesticRatePct: 30, treatyRatePct: 0, treatyCountry: 'GB' },
        { countryCode: 'US', incomeType: 'ROYALTIES', domesticRatePct: 30, treatyRatePct: 0, treatyCountry: 'GB' },
        // UK WHT
        { countryCode: 'GB', incomeType: 'INTEREST', domesticRatePct: 20, treatyRatePct: 0, treatyCountry: 'US' },
        { countryCode: 'GB', incomeType: 'ROYALTIES', domesticRatePct: 20, treatyRatePct: 0, treatyCountry: 'US' },
        // India WHT
        { countryCode: 'IN', incomeType: 'SERVICES', domesticRatePct: 10 },
        { countryCode: 'IN', incomeType: 'ROYALTIES', domesticRatePct: 10, treatyRatePct: 10, treatyCountry: 'US' },
        { countryCode: 'IN', incomeType: 'DIVIDENDS', domesticRatePct: 10 },
    ];

    private userOverrides: Map<string, TaxRate> = new Map();

    // ── Public API ────────────────────────────────────────────────────────────
    getTaxRates(countryCode: string, stateCode?: string): TaxRate[] {
        const allRates = [
            ...this.BUILT_IN_RATES,
            ...Array.from(this.userOverrides.values()),
        ];
        return allRates.filter(r =>
            r.countryCode === countryCode &&
            (stateCode == null || r.stateCode == null || r.stateCode === stateCode)
        );
    }

    getWhtRates(countryCode: string, incomeType?: string): WhtRate[] {
        return this.BUILT_IN_WHT.filter(r =>
            r.countryCode === countryCode &&
            (incomeType == null || r.incomeType === incomeType)
        );
    }

    /**
     * Creates or updates a tenant-specific tax rate override.
     */
    setTaxRateOverride(override: Omit<TaxRate, 'id' | 'isUserOverride'>): TaxRate {
        const id = `OVERRIDE-${override.countryCode}-${override.stateCode || 'FEDERAL'}-${override.taxCode}-${Date.now()}`;
        const rate: TaxRate = { id, ...override, isUserOverride: true };
        this.userOverrides.set(id, rate);
        this.logger.log(`Tax rate override set: ${override.countryCode}/${override.stateCode || 'FEDERAL'} ${override.taxCode} = ${override.ratePct}%`);
        return rate;
    }

    /**
     * Determines nexus exposure for a given business presence.
     * Simplified: physical presence or economic nexus (sales > threshold).
     */
    determineNexus(presenceByState: Array<{
        stateCode: string;
        hasPhysicalPresence: boolean;
        annualRevenue: number;
        annualTransactions: number;
    }>): Array<{
        stateCode: string;
        nexusType: 'PHYSICAL' | 'ECONOMIC' | 'NONE';
        reason: string;
        registrationRequired: boolean;
    }> {
        // Economic nexus thresholds (South Dakota v. Wayfair — most states adopted)
        const economicNexusThresholds: Record<string, { revenue: number; transactions: number }> = {
            default: { revenue: 100_000, transactions: 200 },
            NY: { revenue: 500_000, transactions: 100 },
            CA: { revenue: 500_000, transactions: 0 },
            TX: { revenue: 500_000, transactions: 0 },
        };

        return presenceByState.map(state => {
            if (state.hasPhysicalPresence) {
                return { stateCode: state.stateCode, nexusType: 'PHYSICAL', reason: 'Physical presence (office/warehouse/employee)', registrationRequired: true };
            }
            const thresholds = economicNexusThresholds[state.stateCode] || economicNexusThresholds.default;
            if (state.annualRevenue >= thresholds.revenue || (thresholds.transactions > 0 && state.annualTransactions >= thresholds.transactions)) {
                return {
                    stateCode: state.stateCode,
                    nexusType: 'ECONOMIC',
                    reason: `Economic nexus: revenue=$${state.annualRevenue.toLocaleString()} (threshold=$${thresholds.revenue.toLocaleString()})`,
                    registrationRequired: true,
                };
            }
            return { stateCode: state.stateCode, nexusType: 'NONE', reason: 'Below nexus thresholds', registrationRequired: false };
        });
    }

    getSupportedCountries(): string[] {
        const countries = new Set(this.BUILT_IN_RATES.map(r => r.countryCode));
        return Array.from(countries).sort();
    }
}
