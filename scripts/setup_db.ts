
import pg from 'pg';

async function setup() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }

    // Parse connection string to connect to 'postgres' database first
    const url = new URL(connectionString);
    const targetDb = url.pathname.slice(1);
    url.pathname = '/postgres';

    const client = new pg.Pool({
        connectionString: url.toString(),
    });

    try {
        await client.connect();
        console.log(`Connected to postgres database. Checking for ${targetDb}...`);

        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDb]);
        if (res.rowCount === 0) {
            console.log(`Creating database ${targetDb}...`);
            await client.query(`CREATE DATABASE ${targetDb}`);
            console.log("Database created successfully.");
        } else {
            console.log("Database already exists.");
        }
    } catch (err) {
        console.error("Error setting up database:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setup();
