import { db } from "./server/db.js";
import { arInvoices, arCustomers, arReceipts } from "./shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { storage } from "./server/storage.js";

async function testList() {
    try {
        console.log("Starting Storage Call...");
        const result = await storage.listArInvoices(5, 0);
        console.log("Storage Result:", result);
    } catch (e) {
        console.error("FATAL ERROR FETCHING AR INVOICES!!");
        console.error(e.message);
        console.error(e.stack);
    }
}
testList();
