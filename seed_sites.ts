import { db } from "./server/db";
import { apSuppliers, apSupplierSites } from "./shared/schema";
import { eq } from "drizzle-orm";

async function run() {
  const suppliers = await db.select().from(apSuppliers).limit(5);
  for (const s of suppliers) {
    const existing = await db.select().from(apSupplierSites).where(eq(apSupplierSites.supplierId, s.id));
    if (existing.length === 0) {
      console.log(`Adding demo sites for ${s.name}`);
      await db.insert(apSupplierSites).values({
        supplierId: s.id,
        orgId: "org-1",
        siteName: "Primary Office",
        address: "123 Main St",
        isPaySite: true,
      });
      await db.insert(apSupplierSites).values({
        supplierId: s.id,
        orgId: "org-1",
        siteName: "Secondary Office",
        address: "456 Side St",
        isPaySite: false,
      });
    } else {
      console.log(`Sites already exist for ${s.name}`);
    }
  }
  console.log("Done seeding sites.");
  process.exit(0);
}

run().catch(console.error);
