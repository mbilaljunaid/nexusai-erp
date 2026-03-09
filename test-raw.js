import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://mbjunaid@localhost:5432/nexusai" });
async function run() {
    try {
        const res = await pool.query("SELECT * FROM ar_invoices LIMIT 1");
        console.log("Found:", res.rows);
    } catch(e) {
        console.error("RAW DB ERROR:", e.message);
    }
}
run();
