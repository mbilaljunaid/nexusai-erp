
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function checkSchema() {
    console.log("Checking DB Schema...");

    // Check ap_suppliers columns
    const supplierCols = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'ap_suppliers';
    `);
    console.log("ap_suppliers columns:", supplierCols.rows.map((r: any) => r.column_name));

    // Check if ap_supplier_sites exists
    const sitesTable = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'ap_supplier_sites';
    `);
    console.log("ap_supplier_sites exists:", sitesTable.rowCount > 0);

    // List all AP tables
    const tables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'ap_%';
    `);
    console.log("AP Tables:", tables.rows.map((r: any) => r.table_name));

    // Check ap_distribution_sets
    const hasDistSets = tables.rows.some((r: any) => r.table_name === 'ap_distribution_sets');
    console.log("ap_distribution_sets exists:", hasDistSets);

    process.exit(0);
}

checkSchema().catch(console.error);
