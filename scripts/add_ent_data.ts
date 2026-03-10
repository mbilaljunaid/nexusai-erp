import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addEnterpriseData() {
    try {
        await db.execute(sql.raw(`
            INSERT INTO ent_business_units (tenant_id, code, name, description, status)
            VALUES 
            ('default', 'US_OPS', 'US Operations', 'United States Operations', 'Active'),
            ('default', 'EU_OPS', 'EU Operations', 'European Operations', 'Active'),
            ('system', 'US_OPS', 'US Operations', 'United States Operations', 'Active'),
            ('system', 'EU_OPS', 'EU Operations', 'European Operations', 'Active'),
            ('tenant1', 'US_OPS', 'US Operations', 'United States Operations', 'Active'),
            ('tenant1', 'EU_OPS', 'EU Operations', 'European Operations', 'Active')
            ON CONFLICT DO NOTHING;
        `));

        await db.execute(sql.raw(`
            INSERT INTO ent_ledgers (tenant_id, code, name, currency, status)
            VALUES 
            ('default', 'US_LEDGER', 'Nexus Primary Ledger (USD)', 'USD', 'Active'),
            ('system', 'US_LEDGER', 'Nexus Primary Ledger (USD)', 'USD', 'Active')
            ON CONFLICT DO NOTHING;
        `));
        console.log("Enterprise baseline data inserted.");
    } catch (e: any) {
        console.error("Error inserting baseline:", e.message);
    }
    process.exit(0);
}

addEnterpriseData();
