
import pg from "pg";
const { Client } = pg;
import * as dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

async function patch() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Connected to database for Phase 6 patch...");

        // Add compliance columns to purchase_orders
        console.log("Adding compliance columns to purchase_orders...");
        await client.query(`
            ALTER TABLE purchase_orders 
            ADD COLUMN IF NOT EXISTS compliance_status VARCHAR(50) DEFAULT 'COMPLIANT',
            ADD COLUMN IF NOT EXISTS compliance_reason TEXT;
        `);

        console.log("Phase 6 Patch completed successfully.");
    } catch (err) {
        console.error("Error applying Phase 6 patch:", err);
    } finally {
        await client.end();
    }
}

patch();
