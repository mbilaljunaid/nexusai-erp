
import { db } from "@db";
import { sql } from "drizzle-orm";

async function debugSchema() {
    console.log("🔍 Debugging Schemas...");

    // Check Inv Tx columns
    const cols = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'inv_material_transactions'
    `);
    console.log("inv_material_transactions columns:", cols.rows.map(r => r.column_name));

    process.exit(0);
}

debugSchema().catch(console.error);
