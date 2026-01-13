
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Applying SCM schema patch for Project Integration...");

    try {
        // 1. Add project/task columns to purchase_order_lines if they don't exist
        await db.execute(sql`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_lines' AND column_name = 'project_id') THEN
                    ALTER TABLE purchase_order_lines ADD COLUMN project_id varchar;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_order_lines' AND column_name = 'task_id') THEN
                    ALTER TABLE purchase_order_lines ADD COLUMN task_id varchar;
                END IF;
            END $$;
        `);
        console.log("Updated purchase_order_lines table.");

        // 2. Create inventory_transactions table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS inventory_transactions (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                inventory_id varchar NOT NULL,
                transaction_type varchar NOT NULL,
                quantity integer NOT NULL,
                project_id varchar,
                task_id varchar,
                transaction_date timestamp DEFAULT now(),
                reference_number varchar,
                cost numeric(18, 2),
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created inventory_transactions table.");

        console.log("SCM schema patch applied successfully!");
    } catch (error) {
        console.error("Error applying SCM schema patch:", error);
    }
}

main();
