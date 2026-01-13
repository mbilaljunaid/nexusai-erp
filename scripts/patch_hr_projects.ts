
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Applying HR schema patch for Project Integation (Time Entries)...");

    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS time_entries (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                employee_id varchar NOT NULL,
                project_id varchar NOT NULL,
                task_id varchar NOT NULL,
                date timestamp NOT NULL,
                hours numeric(5, 2) NOT NULL,
                description varchar,
                billable_flag boolean DEFAULT false,
                cost_rate numeric(18, 2),
                status varchar DEFAULT 'SUBMITTED',
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created time_entries table.");

        console.log("HR schema patch applied successfully!");
    } catch (error) {
        console.error("Error applying HR schema patch:", error);
    }
}

main();
