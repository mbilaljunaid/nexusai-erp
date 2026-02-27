import { db } from "./server/db";
import { apInvoices } from "./shared/schema";
import { eq } from "drizzle-orm";

async function run() {
    const invoices = await db.select().from(apInvoices).limit(1);
    const target = invoices[0];
    console.log("Found invoice:", target.id, target.invoiceNumber);
    const updated = await db.update(apInvoices)
        .set({ approvalStatus: "APPROVED" })
        .where(eq(apInvoices.id, target.id))
        .returning();
    console.log("Updated result:", updated);
    process.exit(0);
}
run();
