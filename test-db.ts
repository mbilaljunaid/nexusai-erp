import { db } from './server/db';
import { sql } from 'drizzle-orm';
async function run() {
    const res = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ic_disputes'`);
    console.log(res.rows);
    process.exit(0);
}
run();
