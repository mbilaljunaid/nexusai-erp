import { db } from "./server/db.js";
import { arInvoices } from "./shared/schema.js";

async function testQuery() {
    try {
        console.log("Fetching AR invoices...");
        const res = await db.select().from(arInvoices).limit(5);
        console.log("Success:", res);
    } catch(e) {
        console.error("DB Error:", e);
    }
}
testQuery();
