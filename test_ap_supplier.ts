import { db } from './server/db';
import { apSuppliers, apSupplierSites } from './shared/schema/ap';

async function runTest() {
    try {
        console.log("--- Starting Supplier Master Integration Test ---");

        // 1. Create Supplier Header
        console.log("1. Simulating Supplier Header Creation...");
        const [supplier] = await db.insert(apSuppliers).values({
            supplierNumber: `VND-${Date.now()}`,
            name: "Global Tech Logistics",
            taxOrganizationType: "CORPORATION",
            country: "US",
            contactEmail: "ap@globaltech.test"
        }).returning();

        console.log(`✅ Supplier Header Created: ID=${supplier.id}, Number=${supplier.supplierNumber}`);

        // 2. Create Supplier Site (with Bank details)
        console.log("2. Simulating Supplier Site Creation (IBAN & SWIFT)...");
        const [site] = await db.insert(apSupplierSites).values({
            supplierId: supplier.id,
            orgId: "1",
            siteName: "MAIN-PAYMENTS",
            address: "123 Logistics Blvd, NY 10001",
            taxId: "TX-9988776655",
            isPaySite: true,
            isPurchasingSite: true,
            iban: "US99TESTBANK000188992200",
            swiftCode: "TESTUS33"
        }).returning();

        console.log(`✅ Supplier Site Created: ID=${site.id}, Site Name=${site.siteName}`);
        console.log(`   IBAN Attached: ${site.iban}`);
        console.log(`   SWIFT Attached: ${site.swiftCode}`);

        // 3. Verify Constraints & Hierarchy
        console.log("3. Verifying Parent-Child Relationship natively...");
        const verifiedHierarchy = await db.query.apSuppliers.findFirst({
            where: (sup, { eq }) => eq(sup.id, supplier.id),
            with: {
                sites: true
            }
        });

        if (verifiedHierarchy?.sites && verifiedHierarchy.sites.length > 0) {
            console.log(`✅ Parent-Child Linked Successfully. Site Count: ${verifiedHierarchy.sites.length}`);
        } else {
            throw new Error("Failed to map Supplier Sites inside internal Drizzle Query scope.");
        }

        console.log("\n--- Supplier Master Flow Completed Successfully! ---");
    } catch (e: any) {
        console.error("❌ E2E TEST FAILED:");
        console.error(e.message || e);
    } finally {
        process.exit(0);
    }
}

runTest();
