import { db } from './server/db';
import { apInvoices } from './shared/schema/ap';
import { desc, eq } from 'drizzle-orm';

async function run() {
    const latestPrepay = await db.query.apInvoices.findFirst({
        where: eq(apInvoices.invoiceType, "PREPAYMENT"),
        orderBy: [desc(apInvoices.createdAt)]
    });
    console.log("Raw DB State for Latest Prepayment:");
    console.log(latestPrepay);
    process.exit(0);
}
run();
