
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patch() {
    console.log("Applying Phase 8 Sourcing Schema Patch...");

    try {
        // 1. Create sourcing tables
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS scm_sourcing_rfqs (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                rfq_number VARCHAR NOT NULL UNIQUE,
                title VARCHAR NOT NULL,
                description TEXT,
                status VARCHAR DEFAULT 'DRAFT',
                close_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS scm_sourcing_rfq_lines (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                rfq_id VARCHAR NOT NULL REFERENCES scm_sourcing_rfqs(id),
                line_number INTEGER NOT NULL,
                item_description TEXT NOT NULL,
                target_quantity NUMERIC(18, 4) NOT NULL,
                uom VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS scm_sourcing_bids (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                rfq_id VARCHAR NOT NULL REFERENCES scm_sourcing_rfqs(id),
                supplier_id VARCHAR NOT NULL,
                bid_status VARCHAR DEFAULT 'DRAFT',
                submission_date TIMESTAMP,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS scm_sourcing_bid_lines (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                bid_id VARCHAR NOT NULL REFERENCES scm_sourcing_bids(id),
                rfq_line_id VARCHAR NOT NULL REFERENCES scm_sourcing_rfq_lines(id),
                offered_price NUMERIC(18, 4) NOT NULL,
                offered_quantity NUMERIC(18, 4) NOT NULL,
                supplier_lead_time INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Phase 8 Patch Applied Successfully.");
    } catch (err) {
        console.error("Patch failed:", err);
        process.exit(1);
    }
}

patch();
