import { storage } from "../storage";
import { TaxCode, TaxExemption, TaxJurisdiction } from "@shared/schema";

interface TaxCalculationResult {
    taxAmount: number;
    taxDetails: Array<{
        code: string;
        rate: number;
        amount: number;
        exempt: boolean;
    }>;
}

export class TaxService {
    /**
     * Calculate tax for an invoice based on customer site location, tax codes, and exemptions.
     */
    async calculateTaxForInvoice(invoiceId: string): Promise<TaxCalculationResult> {
        const invoice = await storage.getArInvoice(invoiceId);
        if (!invoice) throw new Error("Invoice not found");

        if (!invoice.siteId) {
            // Without a site, we can't determine jurisdiction. Return 0 tax.
            return { taxAmount: 0, taxDetails: [] };
        }

        const site = await storage.getArCustomerSite(invoice.siteId);
        if (!site) throw new Error("Site not found");

        // 1. Determine Applicable Jurisdiction
        // Logic: Fuzzy match site address to available jurisdictions.
        const jurisdictions = await storage.listTaxJurisdictions();

        // Naive match: Check if jurisdiction name is in address string.
        const matchingJurisdictions = jurisdictions.filter((j: TaxJurisdiction) =>
            site.address.toLowerCase().includes(j.name.toLowerCase())
        );

        // If no specific match, return 0. (Enhancement: Default logic)
        if (matchingJurisdictions.length === 0) {
            return { taxAmount: 0, taxDetails: [] };
        }

        // 2. Find Active Tax Codes for Matching Jurisdictions
        const taxCodes = await storage.listTaxCodes();

        const matchingJurisdictionIds = matchingJurisdictions.map((j: TaxJurisdiction) => j.id);
        const applicableCodes = taxCodes.filter((tc: TaxCode) =>
            matchingJurisdictionIds.includes(tc.jurisdictionId) && tc.active
        );

        if (applicableCodes.length === 0) {
            return { taxAmount: 0, taxDetails: [] };
        }

        // 3. Calculate Tax
        let totalTax = 0;
        const details = [];
        const exemptions = await storage.listTaxExemptions();

        for (const code of applicableCodes) {
            let rate = Number(code.rate);

            // 4. Check Exemptions
            // Schema uses varchar for customerId/siteId now.
            const exemptRule = exemptions.find((e: TaxExemption) =>
                (e.customerId === invoice.customerId || e.siteId === invoice.siteId) &&
                e.taxCodeId === code.id
            );

            let isExempt = false;
            if (exemptRule) {
                isExempt = true;
                if (exemptRule.exemptionType === 'Full') {
                    rate = 0;
                } else if (exemptRule.exemptionType === 'Partial' && exemptRule.exemptionValue) {
                    rate = rate * (1 - Number(exemptRule.exemptionValue));
                }
            }

            const taxLineAmount = Number(invoice.amount) * rate;
            totalTax += taxLineAmount;
            details.push({
                code: code.name,
                rate: rate,
                amount: taxLineAmount,
                exempt: isExempt
            });
        }

        return { taxAmount: totalTax, taxDetails: details };
    }
}

export const taxService = new TaxService();
