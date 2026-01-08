
import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function verifySchema() {
    console.log("Verifying AP Schema Columns...");

    const tables = ["ap_suppliers", "ap_invoices", "ap_payments", "ar_revenue_schedules"];

    for (const table of tables) {
        console.log(`\nChecking table: ${table}`);
        try {
            const result = await db.execute(sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${table}
      `);

            const columns = result.rows.map((r: any) => r.column_name);
            console.log("Columns found:", columns.join(", "));

            // key columns to check
            if (table === "ap_suppliers") {
                console.log("Has credit_hold?", columns.includes("credit_hold"));
                console.log("Has risk_category?", columns.includes("risk_category"));
                console.log("Has parent_supplier_id?", columns.includes("parent_supplier_id"));
            }
            if (table === "ap_invoices") {
                console.log("Has tax_amount?", columns.includes("tax_amount"));
                console.log("Has payment_terms?", columns.includes("payment_terms"));
            }
            if (table === "ap_payments") {
                console.log("Has applied_invoice_ids?", columns.includes("applied_invoice_ids"));
            }
        } catch (e: any) {
            console.log(`Checking ${table} failed or table does not exist yet.`);
            // console.error(e);
        }
    }

    process.exit(0);
}

verifySchema().catch(console.error);
