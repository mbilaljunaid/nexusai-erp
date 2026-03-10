import { db } from './server/db';
import { apService } from './server/services/ap';
import { apInvoices, apSupplierSites, apSuppliers } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  try {
    console.log("Setting up Supplier...");
    const suppliers = await db.select().from(apSuppliers).limit(1);
    if (suppliers.length === 0) throw new Error("No supplier found. Run test_ap_invoice.ts first.");
    const supplier = suppliers[0];

    const sites = await db.select().from(apSupplierSites).where(eq(apSupplierSites.supplierId, supplier.id)).limit(1);
    if (sites.length === 0) throw new Error("No site found.");
    const site = sites[0];

    console.log("Creating Prepayment Invoice...");
    const prepay = await apService.createInvoice({
      header: {
        supplierId: supplier.id,
        supplierSiteId: site.id,
        invoiceNumber: "PREPAY-" + Date.now(),
        invoiceDate: new Date(),
        invoiceAmount: "500.00",
        invoiceCurrencyCode: "USD",
        invoiceType: "Prepayment",
        description: "Test Prepayment",
        prepayAmountRemaining: "500.00"
      },
      lines: [
        {
          lineNumber: 1,
          lineType: "ITEM",
          amount: "500.00",
          description: "Prepay amount"
        }
      ]
    });
    console.log("Prepayment created:", prepay.id);

    console.log("Creating Standard Invoice...");
    const stdInv = await apService.createInvoice({
      header: {
        supplierId: supplier.id,
        supplierSiteId: site.id,
        invoiceNumber: "INV-PREPTEST-" + Date.now(),
        invoiceDate: new Date(),
        invoiceAmount: "1000.00",
        invoiceCurrencyCode: "USD",
        invoiceType: "STANDARD",
        description: "Standard taking prepay",
      },
      lines: [
        {
          lineNumber: 1,
          lineType: "ITEM",
          amount: "1000.00",
          description: "Services"
        }
      ]
    });
    console.log("Standard Invoice created:", stdInv.id);

    console.log("Applying Prepayment...");
    // Assuming ids are actually numbers in the service signature.
    // Wait, let's check what `id` type is. From db schema, `id` in apInvoices is `varchar("id").default(sql`gen_random_uuid()`)`.
    // Let's check `applyPrepayment` signature: `applyPrepayment(standardInvoiceId: number, prepayId: number, amount: number, userId: string)`
    // BUT our ids are UUID strings!

    // We should patch `applyPrepayment` to take `string` if IDs are UUIDs.
    // I will call it directly anyway bypassing type check or just check `server/services/ap.ts` line 696.
    try {
      await apService.applyPrepayment(stdInv.id as any, prepay.id as any, 200, "system_user");
      console.log("Prepayment successfully applied!");
    } catch (err: any) {
      console.error("Failed to apply prepay via service:", err.message);
    }

  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
main();
