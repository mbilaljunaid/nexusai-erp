
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function debugSchema() {
    console.log("🔍 Checking columns for purchase_orders...");
    const res1 = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'purchase_orders'
    `);
    console.log("PO Columns:", res1.rows.map((r: any) => r.column_name).join(", "));

    console.log("🔍 Checking columns for purchase_order_lines...");
    const res2 = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'purchase_order_lines'
    `);
    console.log("PO Lines Columns:", res2.rows.map((r: any) => r.column_name).join(", "));
    process.exit(0);
}

debugSchema();
