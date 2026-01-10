
import { db } from "../server/db";
import { apSuppliers, apSupplierSites, apInvoices } from "@shared/schema";
import { eq } from "drizzle-orm";

async function migrate() {
    console.log("Starting Supplier -> Site Migration...");

    // 1. Fetch all suppliers
    const suppliers = await db.select().from(apSuppliers);
    console.log(`Found ${suppliers.length} suppliers to process.`);

    let sitesCreated = 0;
    let invoicesUpdated = 0;

    for (const supplier of suppliers) {
        // Check if site exists
        const existingSites = await db.select().from(apSupplierSites)
            .where(eq(apSupplierSites.supplierId, supplier.id));

        if (existingSites.length > 0) {
            console.log(`Skipping Supplier #${supplier.id} (${supplier.name}) - Sites already exist.`);
            continue;
        }

        // Create Default Site
        console.log(`Creating 'HEADQUARTERS' site for Supplier #${supplier.id}...`);
        const [newSite] = await db.insert(apSupplierSites).values({
            supplierId: supplier.id,
            siteName: "HEADQUARTERS",
            address: supplier.address,
            taxId: supplier.taxId,
            paymentTermsId: supplier.paymentTermsId,
            isPaySite: true,
            isPurchasingSite: true
        }).returning();

        sitesCreated++;

        // Update Invoices for this Supplier to point to this new Site
        const result = await db.update(apInvoices)
            .set({ supplierSiteId: newSite.id })
            .where(eq(apInvoices.supplierId, supplier.id));

        // Drizzle update result structure might vary, but we can assume success if no error
        // Or if using node-postgres driver, result.rowCount might be available, 
        // but typically Drizzle .returning() is needed for count.
        // For migration safety, we proceed.
    }

    console.log("Migration Complete.");
    console.log(`Sites Created: ${sitesCreated}`);

    process.exit(0);
}

migrate().catch((err) => {
    console.error("Migration Failed:", err);
    process.exit(1);
});
