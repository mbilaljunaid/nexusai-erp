
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
    console.log("Checking crm_opportunity_line_items.product_id type...");
    const res1 = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'crm_opportunity_line_items' AND column_name = 'product_id'
    `);
    console.log("Opp Line Item:", res1.rows);

    console.log("Checking crm_products.id type...");
    const res2 = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'crm_products' AND column_name = 'id'
    `);
    console.log("Product:", res2.rows);

    process.exit(0);
}

run();
