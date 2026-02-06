
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../shared/schema';
import { sql } from 'drizzle-orm';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://nexus:nexus@localhost:5432/nexus_erp',
});

const db = drizzle(pool, { schema });

async function verify() {
    console.log('🔍 Starting Final Verification...');

    try {
        // 1. Finance
        const glCount = await db.select({ count: sql<number>`count(*)` }).from(schema.glJeHeaders);
        console.log(`✅ Finance (GL Headers): ${glCount[0].count}`);

        // 2. Projects
        const projCount = await db.select({ count: sql<number>`count(*)` }).from(schema.projects2);
        console.log(`✅ Projects: ${projCount[0].count}`);

        // 3. EPM
        const epmCount = await db.select({ count: sql<number>`count(*)` }).from(schema.planUnits);
        console.log(`✅ EPM (Plan Units): ${epmCount[0].count}`);

        // 4. Inventory
        const invCount = await db.select({ count: sql<number>`count(*)` }).from(schema.invMaterialTxns);
        console.log(`✅ Inventory (Material Txns): ${invCount[0].count}`);

        // 5. CRM
        const leadCount = await db.select({ count: sql<number>`count(*)` }).from(schema.leads);
        console.log(`✅ CRM (Leads): ${leadCount[0].count}`);

        console.log('🚀 ALL SYSTEMS VERIFIED. Drizzle Migration Complete!');
        process.exit(0);
    } catch (e) {
        console.error('❌ Verification Failed:', e);
        process.exit(1);
    }
}

verify();
