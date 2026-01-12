
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyFaPhase3Migration() {
    console.log("Applying Fixed Assets Phase 3 Migration (Multi-Book)...");

    try {
        // 1. Create fa_asset_books table
        console.log("Creating fa_asset_books table...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "fa_asset_books" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "asset_id" varchar NOT NULL REFERENCES "fa_assets"("id"),
                "book_id" varchar NOT NULL REFERENCES "fa_books"("id"),
                "date_placed_in_service" timestamp NOT NULL,
                "original_cost" numeric(20, 2) NOT NULL,
                "salvage_value" numeric(20, 2) DEFAULT '0',
                "recoverable_cost" numeric(20, 2) NOT NULL,
                "life_years" integer NOT NULL,
                "life_months" integer DEFAULT 0,
                "method" varchar(30) NOT NULL,
                "status" varchar(20) DEFAULT 'ACTIVE',
                "fully_reserved" boolean DEFAULT false,
                "created_at" timestamp DEFAULT now()
            );
        `);

        // 2. Migrate data from fa_assets to fa_asset_books
        console.log("Migrating asset financial data to fa_asset_books...");
        // We only migrate if the table is empty to avoid duplicates on re-run
        const existingBooksRes = await db.execute(sql`SELECT count(*) as count FROM "fa_asset_books"`);
        const count = Number((existingBooksRes.rows[0] as any).count);
        if (count === 0) {
            await db.execute(sql`
                INSERT INTO "fa_asset_books" (
                    asset_id, book_id, date_placed_in_service, original_cost, 
                    salvage_value, recoverable_cost, life_years, life_months, 
                    method, status, fully_reserved
                )
                SELECT 
                    id, book_id, date_placed_in_service, original_cost, 
                    salvage_value, recoverable_cost, life_years, life_months, 
                    method, status, fully_reserved
                FROM "fa_assets";
            `);
        }

        // 3. Update fa_transactions to use asset_book_id
        console.log("Updating fa_transactions to use asset_book_id...");
        // Add the column if it doesn't exist (Drizzle might have issues if we do it in schema but not DB)
        await db.execute(sql`ALTER TABLE "fa_transactions" ADD COLUMN IF NOT EXISTS "asset_book_id" varchar;`);

        await db.execute(sql`
            UPDATE "fa_transactions" t
            SET asset_book_id = ab.id
            FROM "fa_asset_books" ab
            WHERE t.asset_id = ab.asset_id AND t.book_id = ab.book_id;
        `);

        // 4. Update fa_depreciation_history
        console.log("Updating fa_depreciation_history to use asset_book_id...");
        await db.execute(sql`ALTER TABLE "fa_depreciation_history" ADD COLUMN IF NOT EXISTS "asset_book_id" varchar;`);
        await db.execute(sql`
            UPDATE "fa_depreciation_history" d
            SET asset_book_id = ab.id
            FROM "fa_asset_books" ab
            WHERE d.asset_id = ab.asset_id AND d.book_id = ab.book_id;
        `);

        // 5. Update fa_retirements
        console.log("Updating fa_retirements to use asset_book_id...");
        await db.execute(sql`ALTER TABLE "fa_retirements" ADD COLUMN IF NOT EXISTS "asset_book_id" varchar;`);
        await db.execute(sql`
            UPDATE "fa_retirements" r
            SET asset_book_id = ab.id
            FROM "fa_asset_books" ab
            WHERE r.asset_id = ab.asset_id AND r.book_id = ab.book_id;
        `);

        // 6. Clean up fa_assets (Drop old financial columns now migrated to fa_asset_books)
        console.log("Cleaning up fa_assets legacy columns...");
        await db.execute(sql`
            ALTER TABLE "fa_assets" 
            DROP COLUMN IF EXISTS "book_id",
            DROP COLUMN IF EXISTS "date_placed_in_service",
            DROP COLUMN IF EXISTS "original_cost",
            DROP COLUMN IF EXISTS "salvage_value",
            DROP COLUMN IF EXISTS "recoverable_cost",
            DROP COLUMN IF EXISTS "life_years",
            DROP COLUMN IF EXISTS "life_months",
            DROP COLUMN IF EXISTS "method",
            DROP COLUMN IF EXISTS "fully_reserved";
        `);

        // 7. Cleanup fa_transactions, fa_depreciation_history, fa_retirements
        console.log("Cleaning up legacy columns in transaction/history tables...");
        await db.execute(sql`ALTER TABLE "fa_transactions" DROP COLUMN IF EXISTS "asset_id", DROP COLUMN IF EXISTS "book_id";`);
        await db.execute(sql`ALTER TABLE "fa_depreciation_history" DROP COLUMN IF EXISTS "asset_id", DROP COLUMN IF EXISTS "book_id";`);
        await db.execute(sql`ALTER TABLE "fa_retirements" DROP COLUMN IF EXISTS "asset_id", DROP COLUMN IF EXISTS "book_id";`);

        console.log("✅ Fixed Assets Phase 3 Migration Complete!");
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

applyFaPhase3Migration().then(() => process.exit(0));
