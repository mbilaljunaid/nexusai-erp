import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function runSQL() {
    const tables = [
        'ap_suppliers', 'ap_supplier_sites', 'ap_invoices', 'ap_payments',
        'purchase_orders', 'inv_organizations'
    ];

    for (const table of tables) {
        try {
            await db.execute(sql.raw(`UPDATE ${table} SET tenant_id = 'default' WHERE tenant_id IS NULL;`));
            console.log(`Updated tenant_id to 'default' on ${table}`);
        } catch (e) {
            console.log(`Error on ${table}:`, e.message);
        }
    }
    process.exit(0);
}
runSQL().catch(console.error);
