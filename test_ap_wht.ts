import { db } from './server/db';
import { apService } from './server/services/ap';
import { apSuppliers, apSupplierSites, apWhtGroups, apWhtRates, apInvoices, apInvoiceDistributions } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
    try {
        console.log("Setting up Multi-tier WHT Group and Rates...");

        // Create WHT Group
        const [whtGroup] = await db.insert(apWhtGroups).values({
            groupName: "Professional Services - Multi-Tier",
            description: "Standard 5% + Education Cess 1%"
        }).returning();

        // Create primary WHT Rate
        await db.insert(apWhtRates).values({
            groupId: whtGroup.id,
            taxRateName: "Standard TDS",
            ratePercent: "5.00",
            priority: 1
        });

        // Create secondary WHT Rate (multi-tier)
        await db.insert(apWhtRates).values({
            groupId: whtGroup.id,
            taxRateName: "Education Cess",
            ratePercent: "1.00",
            priority: 2
        });

        console.log("Setting up Supplier with WHT Group...");
        const suppliers = await db.select().from(apSuppliers).limit(1);
        if (suppliers.length === 0) throw new Error("No supplier found.");
        const supplier = suppliers[0];

        // Enable WHT on Supplier
        await db.update(apSuppliers)
            .set({
                allowWithholdingTax: true,
                withholdingTaxGroupId: whtGroup.id
            })
            .where(eq(apSuppliers.id, supplier.id));

        const sites = await db.select().from(apSupplierSites).where(eq(apSupplierSites.supplierId, supplier.id)).limit(1);
        if (sites.length === 0) throw new Error("No site found.");
        const site = sites[0];

        console.log("Creating Invoice for WHT Calculation...");
        const invoice = await apService.createInvoice({
            header: {
                supplierId: supplier.id,
                supplierSiteId: site.id,
                invoiceNumber: "INV-WHT-" + Date.now(),
                invoiceDate: new Date(),
                invoiceAmount: "10000.00", // 10k -> WHT: 500 (5%) + 100 (1%) = 600 total
                invoiceCurrencyCode: "USD",
                description: "Invoice for WHT Calculation",
            },
            lines: [
                {
                    lineNumber: 1,
                    lineType: "ITEM",
                    amount: "10000.00",
                    description: "Consulting Fees"
                }
            ]
        });
        console.log("Invoice created:", invoice.id);

        console.log("Validating Invoice to trigger WHT calculation...");
        await apService.validateInvoice(invoice.id as any);

        // Verify WHT Distributions
        const dists = await db.select().from(apInvoiceDistributions)
            .where(eq(apInvoiceDistributions.invoiceId, invoice.id as any));

        console.log("Generated Distributions:");
        for (const d of dists) {
            console.log(`- Line ${d.distLineNumber}: [${d.distCodeCombinationId}] ${d.description} - Amount: ${d.amount}`);
        }

        const [updatedInvoice] = await db.select().from(apInvoices).where(eq(apInvoices.id, invoice.id as any));
        console.log("Total WHT Amount calculated on Header:", updatedInvoice.withholdingTaxAmount);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}
main();
