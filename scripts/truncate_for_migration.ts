
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function run() {
    console.log("Dropping ALL tables to force clean schema sync...");
    try {
        const tables = await db.execute(sql`
            SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        `);

        for (const row of tables.rows) {
            const tableName = row.tablename;
            console.log(`Dropping table: ${tableName}`);
            await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE`));
        }
        console.log("Successfully dropped all tables.");
    } catch (err) {
        console.error("Error dropping tables:", err);
    }
    process.exit(0);
}

run();
