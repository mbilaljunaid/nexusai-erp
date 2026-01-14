import pg from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set in environment");
    process.exit(1);
}

async function runInit() {
    console.log("🚀 Starting Database Initialization...");

    const pool = new pg.Pool({
        connectionString: databaseUrl
    });

    try {
        const sqlPath = path.join(process.cwd(), "scripts", "init_manufacturing_tables.sql");
        const sql = fs.readFileSync(sqlPath, "utf-8");

        console.log("Executing SQL script...");
        await pool.query(sql);
        console.log("✅ Database initialized successfully.");
    } catch (error) {
        console.error("❌ Database initialization failed:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runInit();
