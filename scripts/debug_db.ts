
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { glLedgerControls } from "@shared/schema";

async function debugDb() {
    console.log("Checking tables in database...");

    // ORM Check
    try {
        console.log("Attempting ORM Select...");
        const res = await db.select().from(glLedgerControls).limit(1);
        console.log("ORM Select Success:", res);
    } catch (e: any) {
        console.error("ORM Select Failed:", e.message);
    }

    const tables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);

    console.log("Tables found:", tables.rows.map((r: any) => r.table_name).join(", "));

    // Check specific table columns
    try {
        const columns = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'gl_ledger_controls'
        `);
        console.log("Columns in gl_ledger_controls:", columns.rows);
    } catch (e: any) {
        console.log("Error checking columns:", e.message);
    }

    process.exit(0);
}

debugDb();
