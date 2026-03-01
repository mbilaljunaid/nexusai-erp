import { db } from "../../server/db";
import { sql } from "drizzle-orm";

async function runMore() {
    try {
        console.log("Dropping and recreating ar_auto_accounting_rules...");
        await db.execute(sql`DROP TABLE IF EXISTS ar_auto_accounting_rules CASCADE;`);
        await db.execute(sql`
            CREATE TABLE ar_auto_accounting_rules (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                rule_name TEXT NOT NULL,
                rule_type TEXT NOT NULL,
                account_type TEXT NOT NULL,
                description TEXT,
                segment_name TEXT NOT NULL,
                source_type TEXT NOT NULL,
                constant_value TEXT,
                table_name TEXT,
                column_name TEXT,
                status TEXT DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Success (ar_auto_accounting_rules)!");
    } catch (e) {
        console.error("Failed:", e);
    } finally {
        process.exit(0);
    }
}
runMore();
