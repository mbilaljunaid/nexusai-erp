import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patch() {
    console.log("Applying AR Collections Schema...");

    // 1. ar_dunning_templates
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ar_dunning_templates (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR NOT NULL,
            subject VARCHAR NOT NULL,
            content TEXT,
            days_overdue_min INTEGER DEFAULT 0,
            days_overdue_max INTEGER DEFAULT 1000,
            severity VARCHAR DEFAULT 'Medium',
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);
    console.log("- ar_dunning_templates created/verified.");

    // 2. ar_dunning_runs
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ar_dunning_runs (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            run_date TIMESTAMP DEFAULT NOW(),
            status VARCHAR DEFAULT 'Completed',
            total_invoices_processed INTEGER DEFAULT 0,
            total_letters_generated INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);
    console.log("- ar_dunning_runs created/verified.");

    // 3. ar_collector_tasks
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ar_collector_tasks (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            task_type VARCHAR NOT NULL,
            priority VARCHAR DEFAULT 'Medium',
            status VARCHAR DEFAULT 'Open',
            assigned_to_user VARCHAR,
            customer_id VARCHAR NOT NULL,
            invoice_id VARCHAR,
            due_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);
    console.log("- ar_collector_tasks created/verified.");

    console.log("Schema patch completed successfully.");
    process.exit(0);
}

patch().catch(err => {
    console.error("Patch failed:", err);
    process.exit(1);
});
