import { db } from "./server/db";
import { apInvoices } from "./shared/schema";
import { slaEngine } from "./server/modules/sla/sla.service";
import { eq } from "drizzle-orm";

async function run() {
    try {
        const [invoice] = await db.select().from(apInvoices).limit(1);
        if (!invoice) {
            console.log("No invoices found");
            process.exit(0);
        }

        console.log(`Running SLA for invoice ${invoice.id}...`);

        const res = await slaEngine.createAccounting({
            eventClassId: "AP_INVOICE",
            eventTypeId: "AP_INVOICE_VALIDATED",
            entityId: String(invoice.id),
            entityTable: "ap_invoices",
            description: `Invoice Validated`,
            amount: Number(invoice.invoiceAmount),
            currencyCode: invoice.invoiceCurrencyCode || "USD",
            eventDate: invoice.invoiceDate,
            glDate: invoice.invoiceDate,
            ledgerId: invoice.ledgerId || "PRIMARY",
            sourceData: {
                invoiceId: invoice.id,
                supplierId: invoice.supplierId,
                amount: Number(invoice.invoiceAmount)
            }
        });

        console.log("SLA SUCCESS:", JSON.stringify(res, null, 2));
        process.exit(0);
    } catch (e) {
        console.error("SLA FAILED:", e);
        process.exit(1);
    }
}

run();
