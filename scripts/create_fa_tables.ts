
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createTables() {
    console.log("Creating FA Tables manually...");

    try {
        // 1. fa_books
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fa_books (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                book_code varchar(30) NOT NULL UNIQUE,
                description text NOT NULL,
                ledger_id varchar NOT NULL,
                depreciation_calendar varchar(50) NOT NULL,
                prorate_calendar varchar(50) DEFAULT 'MONTHLY',
                current_period_name varchar,
                status varchar(20) DEFAULT 'ACTIVE',
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created fa_books");

        // 2. fa_categories
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fa_categories (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                book_id varchar REFERENCES fa_books(id),
                major_category varchar(50) NOT NULL,
                minor_category varchar(50),
                asset_cost_account_ccid varchar NOT NULL,
                asset_clearing_account_ccid varchar,
                depr_expense_account_ccid varchar NOT NULL,
                accum_depr_account_ccid varchar NOT NULL,
                cip_cost_account_ccid varchar,
                default_life_years integer NOT NULL,
                default_method varchar(30) DEFAULT 'STL',
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created fa_categories");

        // 3. fa_assets
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fa_assets (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_number varchar(50) NOT NULL UNIQUE,
                tag_number varchar(50),
                description text NOT NULL,
                manufacturer varchar,
                model varchar,
                serial_number varchar,
                book_id varchar REFERENCES fa_books(id) NOT NULL,
                category_id varchar REFERENCES fa_categories(id) NOT NULL,
                date_placed_in_service timestamp NOT NULL,
                original_cost numeric(20,2) NOT NULL,
                salvage_value numeric(20,2) DEFAULT 0,
                recoverable_cost numeric(20,2) NOT NULL,
                life_years integer NOT NULL,
                life_months integer DEFAULT 0,
                method varchar(30) NOT NULL,
                status varchar(20) DEFAULT 'ACTIVE',
                fully_reserved boolean DEFAULT false,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created fa_assets");

        // 4. fa_transactions
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fa_transactions (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_id varchar REFERENCES fa_assets(id) NOT NULL,
                book_id varchar REFERENCES fa_books(id) NOT NULL,
                transaction_type varchar(30) NOT NULL,
                transaction_date timestamp NOT NULL,
                period_name varchar,
                amount numeric(20,2) NOT NULL,
                reference varchar,
                description text,
                status varchar(20) DEFAULT 'POSTED',
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created fa_transactions");

        // 5. fa_depreciation_history
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fa_depreciation_history (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                asset_id varchar REFERENCES fa_assets(id) NOT NULL,
                book_id varchar REFERENCES fa_books(id) NOT NULL,
                period_name varchar NOT NULL,
                amount numeric(20,2) NOT NULL,
                ytd_depreciation numeric(20,2) NOT NULL,
                accumulated_depreciation numeric(20,2) NOT NULL,
                net_book_value numeric(20,2) NOT NULL,
                is_posted_to_gl boolean DEFAULT false,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created fa_depreciation_history");

        console.log("✅ All FA Tables Created.");
    } catch (e) {
        console.error("Failed to create tables:", e);
        process.exit(1);
    }
    process.exit(0);
}

createTables();
