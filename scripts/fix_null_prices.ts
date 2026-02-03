
import pg from 'pg';

async function fix() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }

    const pool = new pg.Pool({
        connectionString: databaseUrl,
    });

    try {
        console.log("Updating NULL unit_selling_price in om_order_lines...");
        const res = await pool.query("UPDATE om_order_lines SET unit_selling_price = 0 WHERE unit_selling_price IS NULL;");
        console.log(`Updated ${res.rowCount} rows.`);

        console.log("Updating NULL unit_selling_price in om_price_list_items...");
        const res2 = await pool.query("UPDATE om_price_list_items SET unit_price = 0 WHERE unit_price IS NULL;");
        console.log(`Updated ${res2.rowCount} rows.`);

    } catch (err) {
        console.error("Error fixing data:", err);
    } finally {
        await pool.end();
    }
}

fix();
