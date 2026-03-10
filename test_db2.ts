import { db } from "./server/db";
import { apInvoices } from "@shared/schema";
async function run() {
    try {
        const invs = await db.select().from(apInvoices);
        console.log(`Found ${invs.length} invoices in DB.`);
        invs.slice(0, 5).forEach(i => console.log(i.id, i.invoiceNumber));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
