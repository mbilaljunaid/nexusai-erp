import pg from "pg";
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

async function checkSchema() {
    const client = new Client({ connectionString: DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE tablename LIKE 'construction_%'");
        console.log("Current Construction Tables:", res.rows.map(r => r.tablename).join(", "));

        const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'construction_contracts'");
        console.log("Columns in construction_contracts:", cols.rows);
    } catch (err: any) {
        console.error("❌ Error:", err.message);
    } finally {
        await client.end();
    }
}

checkSchema();
