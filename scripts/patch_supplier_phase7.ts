
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
        console.log("Connected to database for Phase 7 patch...");

        // 1. Update procurement_contracts with esign fields
        console.log("Updating procurement_contracts with esign fields...");
        await client.query(`
            ALTER TABLE procurement_contracts 
            ADD COLUMN IF NOT EXISTS esign_status VARCHAR(50) DEFAULT 'NOT_STARTED',
            ADD COLUMN IF NOT EXISTS esign_envelope_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS pdf_file_path VARCHAR(255);
        `);

        // 2. Create scm_supplier_documents table
        console.log("Creating scm_supplier_documents table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS scm_supplier_documents (
                id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                supplier_id VARCHAR(255) NOT NULL,
                document_type VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_path VARCHAR(255) NOT NULL,
                expiry_date TIMESTAMP,
                status VARCHAR(50) DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Phase 7 Patch completed successfully.");
    } catch (err) {
        console.error("Error applying Phase 7 patch:", err);
    } finally {
        await client.end();
    }
}

patch();
