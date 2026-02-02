import { Client } from "pg";
import { readFileSync } from "fs";

const dbUrl = "postgresql://postgres:postgres@localhost:5432/nexusai_erp";

async function applyMigration() {
    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        console.log("Connected to DB.");

        const sql = readFileSync("migrations/0005_sla_refactor.sql", "utf-8");
        console.log("Applying Migration: 0005_sla_refactor.sql");

        await client.query(sql);
        console.log("✅ Migration applied successfully.");
    } catch (e) {
        console.error("❌ Migration failed:", e);
    } finally {
        await client.end();
    }
}

applyMigration();
