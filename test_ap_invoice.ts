import { db } from './server/db';
import { apService } from './server/services/ap';
import { apSuppliers, apSupplierSites } from '@shared/schema';

async function main() {
  try {
    console.log("Creating/Fetching Supplier...");
    const [supplier] = await db.insert(apSuppliers).values({
      name: "Acme Corp (Test)",
      supplierNumber: "SUPP-" + Date.now(),
      taxId: "123456789",
      creditLimit: "50000"
    }).returning();

    const [site] = await db.insert(apSupplierSites).values({
      supplierId: supplier.id,
      siteName: "HQ",
      isPaySite: true,
      iban: "US1234567890",
      swiftCode: "ACMEUS33"
    }).returning();

    console.log("Supplier & Site created:", supplier.name, site.siteName);

    console.log("Creating Invoice...");
    const invoice = await apService.createInvoice({
      header: {
        supplierId: supplier.id,
        supplierSiteId: site.id,
        invoiceNumber: "INV-ACME-001",
        invoiceDate: new Date(),
        invoiceAmount: "1500.00",
        invoiceCurrencyCode: "USD",
        description: "Test Software License",
        paymentTerms: "Net 30"
      },
      lines: [
        {
          lineNumber: 1,
          lineType: "ITEM",
          amount: "1500.00",
          description: "Software License"
        }
      ]
    });

    console.log("Invoice created successfully with ID:", invoice.id);
  } catch (e) {
    console.error("Error creating invoice:", e);
  } finally {
    process.exit(0);
  }
}
main();
