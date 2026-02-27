import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const db = drizzle(pool);

import { sql } from 'drizzle-orm';

async function run() {
    try {
        await db.execute(sql`ALTER TABLE ic_disputes ALTER COLUMN tenant_id TYPE text;`);
        console.log("Successfully altered ic_disputes.tenant_id");
    } catch(e) {
        console.error("ic_disputes error", e);
    }
    
    try {
        await db.execute(sql`ALTER TABLE transfer_pricing_policies ALTER COLUMN tenant_id TYPE text;`);
        console.log("Successfully altered transfer_pricing_policies.tenant_id");
    } catch(e) {
        console.error("tpp error", e);
    }
    try {
        await db.execute(sql`ALTER TABLE transfer_pricing_analyses ALTER COLUMN tenant_id TYPE text;`);
        console.log("Successfully altered transfer_pricing_analyses.tenant_id");
    } catch(e) {
        console.error("tpa error", e);
    }
    try {
        await db.execute(sql`ALTER TABLE ic_netting_sessions ALTER COLUMN tenant_id TYPE text;`);
        console.log("Successfully altered ic_netting_sessions.tenant_id");
    } catch(e) {
        console.error("icn error", e);
    }
    process.exit(0);
}
run();
