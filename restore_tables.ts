import { db } from "./server/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";

async function restore() {
    const sqlContent = fs.readFileSync("./migrations/0000_boring_phil_sheldon.sql", "utf-8");
    const tables = [
        "gl_fsg_column_sets", "gl_fsg_row_sets", "gl_fsg_cols", "gl_fsg_rows", "gl_fsg_defs",
        "gl_report_schedules", "gl_report_instances",
        "cash_bank_accounts", "cash_matching_groups", "cash_reconciliation_rules", "cash_statement_lines", "cash_transactions",
        "gl_ledger_sets", "gl_ledger_set_assignments",
        "gl_allocations", "gl_revaluations", "gl_exchange_rates",
        "gl_auto_post_rules", "gl_je_categories", "gl_je_sources", "gl_ledger_controls", "gl_close_tasks"
    ];

    for (const table of tables) {
        console.log(`Processing ${table}...`);
        // Find CREATE TABLE "table_name" ... );
        // Regex: CREATE TABLE "table_name" \(([\s\S]*?)\);
        const regex = new RegExp(`CREATE TABLE "${table}" \\(([\\s\\S]*?)\\);`, "g");
        const match = regex.exec(sqlContent);

        if (match) {
            const createStmt = match[0];
            console.log(`Found schema for ${table}. Creating...`);
            try {
                await db.execute(sql.raw(createStmt));
                console.log(`✅ Created ${table}`);
            } catch (e: any) {
                if (e.message.includes("already exists")) {
                    console.log(`⚠️ ${table} already exists.`);
                } else {
                    console.error(`❌ Failed to create ${table}: ${e.message}`);
                    // Try to recreate constraints/indexes separately? 
                    // Usually Create Table includes inline constraints.
                }
            }
        } else {
            console.error(`❌ Could not find CREATE statement for ${table}`);
        }
    }
}

restore();
