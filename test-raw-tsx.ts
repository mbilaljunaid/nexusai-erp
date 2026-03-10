import { db } from "./server/db";
import { arInvoices } from "@shared/schema";
import { sql } from "drizzle-orm";

async function run() {
    try {
        console.log("TSX: Executing query...");
        const res = await db.select({ count: sql`count(*)` }).from(arInvoices);
        console.log("TSX: Found:", res);
    } catch(e) {
        console.error("TSX DB ERROR:");
        console.error(e);
    }
}
run();
