import { db } from "./server/db.js";
import { arInvoices, arCustomers, arReceipts } from "./shared/schema.js";
import { eq, desc } from "drizzle-orm";

async function testList() {
    try {
        console.log("Starting AR Invoice Fetch...");
        let query = db.select().from(arInvoices).orderBy(desc(arInvoices.createdAt)).limit(5);
        const result = await query;
        console.log("Result:", result);
    } catch (e) {
        console.error("FAILED TO FETCH AR INVOICES!!");
        console.error(e);
    }
}
testList();
