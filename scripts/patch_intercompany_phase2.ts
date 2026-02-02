
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Starting Intercompany Phase 2 Schema Patch...");

    // 1. Create ic_transfer_pricing_rules table
    console.log("Creating table: ic_transfer_pricing_rules...");
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ic_transfer_pricing_rules (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            provider_org_id text NOT NULL REFERENCES ic_orgs(id),
            receiver_org_id text NOT NULL REFERENCES ic_orgs(id),
            transaction_type_id text REFERENCES ic_transaction_types(id),
            markup_type text NOT NULL DEFAULT 'PERCENTAGE',
            markup_value numeric(10, 4) NOT NULL,
            active_from date NOT NULL DEFAULT CURRENT_DATE,
            active_to date,
            description text,
            created_at timestamp DEFAULT now()
        );
    `);

    // 1b. Patch ic_headers to add markup_rate if missing
    console.log("Patching table: ic_headers...");
    await db.execute(sql`
        ALTER TABLE ic_headers 
        ADD COLUMN IF NOT EXISTS markup_rate numeric(5, 2) DEFAULT 0;
    `);

    // 2. Seed Default TP Rules
    // Ensure we have some Orgs first (from Phase 1)
    // We will assume typical setup: "ICO-101" (Provider) -> "ICO-102" (Receiver)

    /*
     * We will try to insert a default rule:
     * Provider: ICO-101 (US)
     * Receiver: ICO-102 (UK)
     * Markup: 15% (0.1500)
     */

    // Check if Orgs exist first to avoid FK errors
    const orgs = await db.execute(sql`SELECT id FROM ic_orgs LIMIT 2`);

    if (orgs.rows.length >= 2) {
        const providerId = orgs.rows[0].id;
        const receiverId = orgs.rows[1].id;

        console.log(`Seeding TP Rule for ${providerId} -> ${receiverId}...`);

        await db.execute(sql`
            INSERT INTO ic_transfer_pricing_rules (provider_org_id, receiver_org_id, markup_type, markup_value, description)
            VALUES (${providerId}, ${receiverId}, 'PERCENTAGE', 0.1500, 'Standard Global Markup')
            ON CONFLICT DO NOTHING;
        `);
    } else {
        console.log("Skipping seed: Not enough Intercompany Orgs found.");
    }

    console.log("✅ Intercompany Phase 2 Patch Completed Successfully.");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Patch Failed:", err);
    process.exit(1);
});
