
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function checkColumns() {
    try {
        const tables = ['ap_system_parameters'];
        for (const table of tables) {
            const res = await db.execute(sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = ${table}
            `);
            console.log(`Columns in ${table}:`);
            res.rows.forEach(row => console.log(`- ${row.column_name}`));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkColumns();
