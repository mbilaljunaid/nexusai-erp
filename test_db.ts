import { db } from './server/db';
import { apInvoices, apInvoiceDistributions } from './shared/schema/ap';
import { desc, eq } from 'drizzle-orm';

async function run() {
    const latestInv = await db.query.apInvoices.findFirst({
        orderBy: [desc(apInvoices.createdAt)]
    });
    console.log("Invoice Gross:", latestInv?.invoiceAmount);
    console.log("Withholding Total:", latestInv?.withholdingTaxAmount);

    const dists = await db.query.apInvoiceDistributions.findMany({
        where: eq(apInvoiceDistributions.invoiceId, latestInv!.id)
    });
    for(const d of dists) {
      console.log(`- Dist: $${d.amount} [${d.description}]`);
    }

    process.exit(0);
}
run();
