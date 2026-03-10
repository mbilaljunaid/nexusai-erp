import { apService } from "./server/services/ap";
import { db } from "./server/db";
import { apInvoices } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

async function run() {
    try {
        const [inv] = await db.select().from(apInvoices).where(eq(apInvoices.invoiceNumber, "INV-PO-1772105027999")).limit(1);
        if (!inv) {
            console.log("Not found in db query");
            process.exit(0);
        }
        console.log("Inv id is:", inv.id);
        const res = await apService.validateInvoice(inv.id);
        console.log(res);
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
run();
