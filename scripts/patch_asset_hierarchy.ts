
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Applying Asset Hierarchy Patch...");

    try {
        // Check if column exists
        const check = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'fa_assets' AND column_name = 'parent_id';
    `);

        if (check.rowCount === 0) {
            console.log("Adding parent_id column to fa_assets...");
            await db.execute(sql`
        ALTER TABLE fa_assets 
        ADD COLUMN parent_id varchar(255) REFERENCES fa_assets(id);
      `);
            console.log("Column added successfully.");
        } else {
            console.log("Column parent_id already exists.");
        }

        console.log("Asset Hierarchy Patch Completed.");
        process.exit(0);
    } catch (error) {
        console.error("Patch Failed:", error);
        process.exit(1);
    }
}

main();
