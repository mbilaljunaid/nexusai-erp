
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function checkColumns() {
    await client.connect();
    const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'cash_transactions';
    `);
    console.log("Columns:", res.rows.map(r => r.column_name));
    await client.end();
}

checkColumns().catch(console.error);
