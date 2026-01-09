
import 'dotenv/config';
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Dropping conflicting GL tables...");
    try {
        await db.execute(sql`DROP TABLE IF EXISTS "gl_accounts" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "gl_accounts_new" CASCADE`);
        console.log("Dropped gl_accounts & new");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_ledgers" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "gl_ledgers_new" CASCADE`);
        console.log("Dropped gl_ledgers & new");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_journal_lines" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "gl_journal_lines_new" CASCADE`);
        console.log("Dropped gl_journal_lines & new");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_journals" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "gl_journals_new" CASCADE`);
        console.log("Dropped gl_journals & new");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_balances" CASCADE`);
        console.log("Dropped gl_balances");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_cross_validation_rules" CASCADE`);
        console.log("Dropped gl_cross_validation_rules");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_intercompany_rules" CASCADE`);
        console.log("Dropped gl_intercompany_rules");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_accounts_v2" CASCADE`);
        console.log("Dropped gl_accounts_v2");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_ledgers_v2" CASCADE`);
        console.log("Dropped gl_ledgers_v2");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_journal_lines_v2" CASCADE`);
        console.log("Dropped gl_journal_lines_v2");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_journals_v2" CASCADE`);
        console.log("Dropped gl_journals_v2");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_balances_v2" CASCADE`);
        console.log("Dropped gl_balances_v2");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_cross_validation_rules_v2" CASCADE`);
        console.log("Dropped gl_cross_validation_rules_v2");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_intercompany_rules_v2" CASCADE`);
        console.log("Dropped gl_intercompany_rules_v2");

        await db.execute(sql`DROP TABLE IF EXISTS "gl_segments_v2" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "gl_segment_values_v2" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "gl_code_combinations_v2" CASCADE`);
        console.log("Dropped gl_segments_v2, gl_segment_values_v2, gl_code_combinations_v2");

    } catch (error) {
        console.error("Error dropping tables:", error);
    }
    process.exit(0);
}

main();
