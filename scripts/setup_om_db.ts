
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function setupDB() {
    // --- Phase 7 Tables ---

    // Initial creation removed - moved to clean block below


    console.log("Active Order Management Tables Created.");


    console.log("Setting up Order Management Tables...");

    try {
        await db.execute(sql`DROP TABLE IF EXISTS om_order_lines CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS om_holds CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS om_price_adjustments CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS om_order_headers CASCADE`);

        // Phase 7 Drops
        await db.execute(sql`DROP TABLE IF EXISTS om_transaction_types CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS om_hold_definitions CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS om_price_list_items CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS om_price_lists CASCADE`);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS om_order_headers (

                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                order_number TEXT NOT NULL UNIQUE,
                customer_id TEXT NOT NULL,
                bill_to_site_id TEXT,
                ship_to_site_id TEXT,
                order_type TEXT NOT NULL DEFAULT 'STANDARD',

                status TEXT NOT NULL DEFAULT 'DRAFT',
                order_currency TEXT NOT NULL DEFAULT 'USD',



                total_amount NUMERIC(20, 2),
                tax_amount NUMERIC(20, 2),
                discount_amount NUMERIC(20, 2),
                
                org_id TEXT NOT NULL,
                warehouse_id TEXT,
                shipping_method TEXT,
                payment_terms TEXT,

                source_system TEXT,
                source_reference TEXT,
                ordered_date TIMESTAMP,
                requested_date TIMESTAMP,

                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now(),
                created_by TEXT,
                updated_by TEXT
            );
        `);
        console.log("Created om_order_headers");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS om_order_lines (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                header_id TEXT NOT NULL REFERENCES om_order_headers(id),
                line_number INTEGER NOT NULL,
                item_id TEXT NOT NULL,
                description TEXT,

                ordered_quantity NUMERIC(20, 2) NOT NULL,
                shipped_quantity NUMERIC(20, 2) DEFAULT 0,
                cancelled_quantity NUMERIC(20, 2) DEFAULT 0,
                uom TEXT,
                unit_list_price NUMERIC(20, 2),
                unit_selling_price NUMERIC(20, 2),
                extended_amount NUMERIC(20, 2),
                warehouse_id TEXT,
                status TEXT NOT NULL DEFAULT 'DRAFT',
                org_id TEXT NOT NULL,
                reference_line_id TEXT,
                project_id TEXT,
                task_id TEXT,

                created_at TIMESTAMP DEFAULT now(),

                updated_at TIMESTAMP DEFAULT now()
            );
        `);
        console.log("Created om_order_lines");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS om_holds (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                header_id TEXT REFERENCES om_order_headers(id),
                line_id TEXT REFERENCES om_order_lines(id),
                hold_name TEXT NOT NULL,
                hold_reason TEXT,
                applied_date TIMESTAMP DEFAULT now(),
                released_date TIMESTAMP,
                released_by TEXT,
                is_active BOOLEAN DEFAULT true
            );
        `);
        console.log("Created om_holds");

        // Create Phase 7 Tables (After Drop)

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS om_transaction_types (
               id text PRIMARY KEY,
               type_name text NOT NULL,
               description text,
               workflow text NOT NULL,
               is_active boolean DEFAULT true
            );
        `);
        console.log("Created om_transaction_types");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS om_hold_definitions (
               id text PRIMARY KEY,
               hold_name text NOT NULL,
               description text,
               type text NOT NULL,
               is_active boolean DEFAULT true
            );
        `);
        console.log("Created om_hold_definitions");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS om_price_lists (
               id text PRIMARY KEY,
               name text NOT NULL,
               currency_code text DEFAULT 'USD',
               status text DEFAULT 'ACTIVE',
               start_date timestamp,
               end_date timestamp
            );
        `);
        console.log("Created om_price_lists");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS om_price_list_items (
               id text PRIMARY KEY,
               price_list_id text NOT NULL REFERENCES om_price_lists(id),
               item_id text NOT NULL,
               unit_price decimal(16,2) NOT NULL,
               is_active boolean DEFAULT true
            );
        `);
        console.log("Created om_price_list_items");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS om_price_adjustments (
                id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
                header_id TEXT REFERENCES om_order_headers(id),
                line_id TEXT REFERENCES om_order_lines(id),
                adjustment_name TEXT NOT NULL,
                amount NUMERIC(20, 2) NOT NULL,
                type TEXT NOT NULL,
                applied_date TIMESTAMP DEFAULT now()
            );
        `);

        console.log("Created om_price_adjustments");

        await db.execute(sql`
        CREATE TABLE IF NOT EXISTS cst_transactions (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
            transaction_type TEXT NOT NULL,
            item_id TEXT NOT NULL,
            quantity NUMERIC(16, 4) NOT NULL,
            unit_cost NUMERIC(16, 4) DEFAULT 0,
            total_cost NUMERIC(16, 2) DEFAULT 0,
            source_type TEXT,
            source_id TEXT,
            source_line_id TEXT,
            org_id TEXT NOT NULL,
            transaction_date TIMESTAMP DEFAULT NOW(),
            gl_status TEXT DEFAULT 'PENDING'
        );
    `);
        console.log("Created cst_transactions");

        console.log("✅ DB Setup Complete");
        process.exit(0);
    } catch (e) {
        console.error("Setup Failed:", e);
    }
}

setupDB();
