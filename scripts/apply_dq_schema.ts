
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyDQSchema() {
    console.log("Applying Data Quality Schema via Raw SQL...");

    try {
        // 1. HZ_DUP_BATCH
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_dup_batch (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                batch_name varchar NOT NULL,
                status varchar DEFAULT 'COMPLETED',
                match_rule_code varchar,
                total_records_processed integer,
                candidates_found integer,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);

        // 2. HZ_DUP_SETS
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_dup_sets (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                batch_id varchar REFERENCES hz_dup_batch(id),
                status varchar DEFAULT 'OPEN',
                assigned_to varchar,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);

        // 3. HZ_DUP_SET_PARTIES
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_dup_set_parties (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                set_id varchar REFERENCES hz_dup_sets(id) NOT NULL,
                party_id varchar REFERENCES hz_parties(id) NOT NULL,
                score numeric NOT NULL,
                merge_status varchar DEFAULT 'CANDIDATE',
                created_at timestamp DEFAULT now()
            );
        `);

        console.log("Application of DQ Schema SUCCESS.");
        process.exit(0);

    } catch (e) {
        console.error("Failed to apply DQ schema:", e);
        process.exit(1);
    }
}

applyDQSchema();
