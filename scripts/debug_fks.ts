
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
    console.log("Testing FK application...");

    // Test 1: crm_opportunity_line_items
    try {
        console.log("Applying FK on crm_opportunity_line_items.product_id...");
        await db.execute(sql.raw(`
            ALTER TABLE "crm_opportunity_line_items" 
            ADD CONSTRAINT "test_fk_1" 
            FOREIGN KEY ("product_id") REFERENCES "public"."crm_products"("id");
        `));
        console.log("Success: crm_opportunity_line_items");
    } catch (e: any) {
        console.error("FAIL: crm_opportunity_line_items", e.message);
    }

    // Test 2: crm_quote_line_items
    try {
        console.log("Applying FK on crm_quote_line_items.product_id...");
        await db.execute(sql.raw(`
            ALTER TABLE "crm_quote_line_items" 
            ADD CONSTRAINT "test_fk_2" 
            FOREIGN KEY ("product_id") REFERENCES "public"."crm_products"("id");
        `));
        console.log("Success: crm_quote_line_items");
    } catch (e: any) {
        console.error("FAIL: crm_quote_line_items", e.message);
    }

    // Test 3: Check types again to be paranoid
    const t1 = await db.execute(sql`SELECT data_type FROM information_schema.columns WHERE table_name='crm_opportunity_line_items' AND column_name='product_id'`);
    const t2 = await db.execute(sql`SELECT data_type FROM information_schema.columns WHERE table_name='crm_products' AND column_name='id'`);
    console.log("Types:", { opp: t1.rows[0], prod: t2.rows[0] });

    process.exit(0);
}

run();
