
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function run() {
    console.log("Checking tables...");
    const url = process.env.DATABASE_URL || '';
    console.log("DB URL starts with:", url.substring(0, 15) + "...");

    const client = new Client({ connectionString: url });
    await client.connect();

    const res = await client.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    `);

    console.log("Tables in public schema:");
    res.rows.forEach(r => console.log(` - ${r.table_name}`));

    const glEntries = res.rows.find(r => r.table_name === 'gl_entries');
    if (glEntries) {
        console.log("FOUND gl_entries!");
    } else {
        console.log("MISSING gl_entries!");
    }

    await client.end();
}

run();
