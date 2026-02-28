import { db } from "../db";
import {
    apInvoices,
    apInvoiceLines,
    apInvoiceDistributions,
    type InsertApInvoiceDistribution
} from "@shared/schema/ap";
import { eq } from "drizzle-orm";
// Assume generic tax setup in a core module; for now we'll mock a default lookup
// import { getTaxRateByCode } from "./coreTaxEngine"; 

/**
 * Enterprise AP Tax Calculation Service
 * 
 * Functions:
 * - Reads `taxClassificationCode` off an AP Invoice Line.
 * - Looks up the active tax rate from the core tax setup.
 * - Calculates the exact tax amount.
 * - Automatically generates a distribution line of type "TAX" for the exact amount.
 */

export class ApTaxService {

    /**
     * Calculates tax for a specific AP Invoice Line and automatically creates the
     * corresponding AP Invoice Distribution for the tax amount.
     */
    static async calculateAndDistributeTax(invoiceId: string, invoiceLineId: string): Promise<{
        taxCalculated: boolean;
        taxAmount: number;
        distributionId?: string;
        message: string;
    }> {
        try {
            // 1. Fetch Line Data
            const [invLine] = await db
                .select()
                .from(apInvoiceLines)
                .where(eq(apInvoiceLines.id, invoiceLineId))
                .limit(1);

            if (!invLine) throw new Error(`Invoice line ${invoiceLineId} not found`);

            // 2. Determine Tax Rate
            const taxCode = invLine.taxClassificationCode;
            if (!taxCode) {
                return {
                    taxCalculated: false,
                    taxAmount: 0,
                    message: "No tax classification code found on this line."
                };
            }

            // TODO: Replace with actual cross-module call to Core Tax Engine
            // Example: const rateInfo = await getTaxRateByCode(taxCode, invLine.accountingDate);
            const taxRatePct = this.mockTaxRateLookup(taxCode);

            if (taxRatePct === 0) {
                return {
                    taxCalculated: false,
                    taxAmount: 0,
                    message: `Tax code ${taxCode} returned a 0% rate.`
                };
            }

            // 3. Calculate Tax Amount
            const lineAmount = Number(invLine.amount);
            const taxAmount = Number(((lineAmount * taxRatePct) / 100).toFixed(2));

            // 4. Generate the TAX Distribution Line
            const taxDist: InsertApInvoiceDistribution = {
                invoiceId,
                invoiceLineId: invLine.id,
                distributionLineNumber: 1, // To be sequenced properly in a real system
                distributionLineType: "TAX",
                amount: taxAmount.toString(),
                description: `Auto-calculated Tax (${taxRatePct}%) for Line ${invLine.lineNumber}`,
                isTaxLine: true,
                createdBy: "SYSTEM"
            };

            const [newDist] = await db.insert(apInvoiceDistributions).values(taxDist).returning();

            return {
                taxCalculated: true,
                taxAmount,
                distributionId: newDist.id,
                message: `Successfully generated ${taxAmount} in tax distributions.`
            };

        } catch (error: any) {
            console.error("AP Tax Calculation Error:", error);
            return {
                taxCalculated: false,
                taxAmount: 0,
                message: `Tax Error: ${(error as Error).message}`
            };
        }
    }

    /**
     * Placeholder for the Centralized Tax Engine lookup.
     */
    private static mockTaxRateLookup(taxCode: string): number {
        const defaultRates: Record<string, number> = {
            "STANDARD_20": 20.0,
            "REDUCED_5": 5.0,
            "ZERO": 0.0,
            "EXEMPT": 0.0,
            "VAT_STANDARD": 19.0 // Common EU rate
        };
        return defaultRates[taxCode] || 0.0;
    }
}
