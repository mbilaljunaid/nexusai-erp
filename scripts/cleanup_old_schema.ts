
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function cleanup() {
    console.log("Cleaning up old FA tables...");
    try {
        await db.execute(sql`DROP TABLE IF EXISTS fa_transaction_headers CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS fa_depreciation_summary CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS fa_asset_books CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS fa_additions CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS fa_transactions CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS fa_depreciation_history CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS fa_assets CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS fa_categories CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS fa_books CASCADE`);
        console.log("Old tables dropped.");
    } catch (e) {
        console.error("Cleanup failed:", e);
    }
    process.exit(0);
}

cleanup();
