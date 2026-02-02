
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyPhase2Schema() {
    console.log("Applying Fixed Assets Phase 2 Schema...");

    try {
        // 1. Create Retirements Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "fa_retirements" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "asset_id" varchar NOT NULL REFERENCES "fa_assets"("id"),
                "book_id" varchar NOT NULL REFERENCES "fa_books"("id"),
                "retirement_date" timestamp NOT NULL,
                "period_name" varchar NOT NULL,
                "proceeds_of_sale" numeric(20, 2) DEFAULT '0',
                "cost_of_removal" numeric(20, 2) DEFAULT '0',
                "net_book_value_retired" numeric(20, 2) NOT NULL,
                "gain_loss_amount" numeric(20, 2) NOT NULL,
                "status" varchar(20) DEFAULT 'PROCESSED',
                "posting_status" varchar(20) DEFAULT 'UNPOSTED',
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log("✅ fa_retirements created.");

        // 2. Create Mass Additions Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "fa_mass_additions" (
                "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "source_type" varchar(20) DEFAULT 'AP_INVOICE',
                "invoice_number" varchar(50),
                "invoice_line_number" integer,
                "description" text NOT NULL,
                "amount" numeric(20, 2) NOT NULL,
                "date" timestamp NOT NULL,
                "vendor_name" varchar,
                "status" varchar(20) DEFAULT 'QUEUE',
                "asset_book_id" varchar,
                "asset_category_id" varchar,
                "created_asset_id" varchar,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log("✅ fa_mass_additions created.");

        console.log("Phase 2 Schema applied successfully!");
    } catch (err) {
        console.error("Failed to apply Phase 2 schema:", err);
        process.exit(1);
    }
}

applyPhase2Schema().then(() => process.exit(0));
