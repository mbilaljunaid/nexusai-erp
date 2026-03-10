import { db } from './server/db';
import { apService } from './server/services/ap';
import { apSuppliers, apSupplierSites } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
    try {
        console.log("Setting up Supplier...");
        const suppliers = await db.select().from(apSuppliers).limit(1);
        if (suppliers.length === 0) throw new Error("No supplier found.");
        const supplier = suppliers[0];

        const sites = await db.select().from(apSupplierSites).where(eq(apSupplierSites.supplierId, supplier.id)).limit(1);
        if (sites.length === 0) throw new Error("No site found.");
        const site = sites[0];

        console.log("Creating Invoice for Matching...");
        const invoice = await apService.createInvoice({
            header: {
                supplierId: supplier.id,
                supplierSiteId: site.id,
                invoiceNumber: "INV-MATCH-" + Date.now(),
                invoiceDate: new Date(),
                invoiceAmount: "1100.00",
                invoiceCurrencyCode: "USD",
                description: "Invoice for PO Matching",
            },
            lines: [
                {
                    lineNumber: 1,
                    lineType: "ITEM",
                    amount: "1100.00",
                    description: "Widget Purchase"
                }
            ]
        });
        console.log("Invoice created:", invoice.id);

        console.log("Matching Invoice to PO (with variance > 5%)...");
        try {
            // Invoice Amount = 1100. PO Amount = 100 * 10 = 1000. Variance = 10%
            const result = await apService.matchInvoiceToPO(invoice.id as any, {
                lineNumber: 1,
                poHeaderId: "PO-1001",
                poLineId: "POL-001",
                poUnitPrice: 10,
                poQuantity: 100
            });
            console.log("Matching Result:", result);
        } catch (e: any) {
            console.error("Match error:", e.message);
        }

        // Check Holds
        const holds = await apService.getInvoiceHolds(invoice.id as any);
        console.log("Holds generated:", holds);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}
main();
