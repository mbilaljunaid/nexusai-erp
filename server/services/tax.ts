import { storage } from "../storage";
import { TaxCode, TaxExemption, TaxJurisdiction, arInvoices, arInvoiceLines } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

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

    /**
     * Applies the calculated tax to an invoice by updating its taxAmount, totalAmount, 
     * and creating formal TAX invoice lines.
     */
    async applyTaxToInvoice(invoiceId: string): Promise<boolean> {
        const result = await this.calculateTaxForInvoice(invoiceId);
        if (result.taxAmount === 0 && result.taxDetails.length === 0) return true;

        const [invoice] = await db.select().from(arInvoices).where(eq(arInvoices.id, invoiceId));
        if (!invoice) throw new Error("Invoice not found");

        const lines = await db.select().from(arInvoiceLines).where(eq(arInvoiceLines.invoiceId, invoiceId));

        // Remove existing TAX lines to prevent duplication if run multiple times
        await db.delete(arInvoiceLines).where(
            eq(arInvoiceLines.invoiceId, invoiceId) && eq(arInvoiceLines.lineType, "TAX")
        );

        const newTaxLines = [];
        for (const detail of result.taxDetails) {
            newTaxLines.push({
                invoiceId: invoiceId,
                lineNumber: lines.length + newTaxLines.length + 1,
                lineType: "TAX",
                description: `Tax (${detail.code} @ ${detail.rate * 100}%)${detail.exempt ? " - EXEMPT" : ""}`,
                quantity: "1",
                unitPrice: detail.amount.toFixed(2),
                amount: detail.amount.toFixed(2),
                taxAmount: "0",
                taxClassificationCode: detail.code,
                glAccount: invoice.glAccountId, // Simplified for now
            });
        }

        if (newTaxLines.length > 0) {
            await db.insert(arInvoiceLines).values(newTaxLines);

            const newTotal = Number(invoice.amount) + result.taxAmount;
            await db.update(arInvoices)
                .set({
                    taxAmount: result.taxAmount.toFixed(2),
                    totalAmount: newTotal.toFixed(2)
                })
                .where(eq(arInvoices.id, invoiceId));
        }

        return true;
    }

    /**
     * Simulate tax calculation without an invoice (for preview purposes).
     */
    async simulateTaxCalculation(customerId: string, siteId: string, amount: number): Promise<TaxCalculationResult> {
        const site = await storage.getArCustomerSite(siteId);
        if (!site) throw new Error("Site not found");

        // 1. Determine Applicable Jurisdiction
        const jurisdictions = await storage.listTaxJurisdictions();
        const matchingJurisdictions = jurisdictions.filter((j: TaxJurisdiction) =>
            site.address.toLowerCase().includes(j.name.toLowerCase())
        );

        if (matchingJurisdictions.length === 0) {
            return { taxAmount: 0, taxDetails: [] };
        }

        // 2. Find Active Tax Codes
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
            const exemptRule = exemptions.find((e: TaxExemption) =>
                (e.customerId === customerId || e.siteId === siteId) &&
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

            const taxLineAmount = amount * rate;
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
