
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Applying Inventory Levels & BOM Patch...");

    try {
        // 1. Patch inv_items
        const checkInv = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inv_items' AND column_name = 'min_quantity';
    `);

        if (checkInv.rowCount === 0) {
            console.log("Adding min/max columns to inv_items...");
            await db.execute(sql`
        ALTER TABLE inv_items 
        ADD COLUMN min_quantity numeric(18, 4) DEFAULT 0,
        ADD COLUMN max_quantity numeric(18, 4) DEFAULT 0;
      `);
            console.log("Inventory columns added.");
        } else {
            console.log("Inventory columns already exist.");
        }

        // 2. Create Asset BOM table
        console.log("Creating maint_asset_boms table...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS maint_asset_boms (
        id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id varchar NOT NULL REFERENCES fa_assets(id),
        inventory_id varchar NOT NULL REFERENCES inv_items(id),
        quantity integer DEFAULT 1,
        is_critical boolean DEFAULT false,
        notes varchar,
        created_at timestamp DEFAULT now()
      );
    `);
        console.log("BOM Table checked/created.");

        console.log("Patch Completed Successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Patch Failed:", error);
        process.exit(1);
    }
}

main();
