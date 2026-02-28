import { db } from "./server/db";
import { apInvoices } from "./shared/schema";
import { eq } from "drizzle-orm";

async function run() {
    try {
        const [invoice] = await db.select().from(apInvoices).where(eq(apInvoices.invoiceNumber, "INV-SUCCESS"));
        console.log("Invoice:", invoice);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
