
import pg from "pg";

async function listTables() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pool.query(`
            SELECT tablename 
            FROM pg_catalog.pg_tables 
            WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
        `);
        console.log("Database Tables:");
        res.rows.forEach(row => console.log(` - ${row.tablename}`));
    } finally {
        await pool.end();
    }
}

listTables();
