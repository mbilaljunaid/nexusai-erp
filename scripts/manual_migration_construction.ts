import pg from "pg";
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

const sql = `
DROP TABLE IF EXISTS construction_claims CASCADE;

CREATE TABLE construction_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL,
    variation_id UUID,
    claim_number VARCHAR NOT NULL UNIQUE,
    subject VARCHAR NOT NULL,
    description TEXT,
    type VARCHAR DEFAULT 'CONTRACTUAL',
    status VARCHAR DEFAULT 'DRAFT' NOT NULL,
    amount_claimed DECIMAL(15, 2) DEFAULT 0.00,
    amount_approved DECIMAL(15, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    submitted_date TIMESTAMP,
    settled_date TIMESTAMP,
    evidence_urls TEXT,
    reported_by UUID,
    internal_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS construction_cost_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR,
    status VARCHAR DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS construction_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'AVAILABLE',
    rates JSONB,
    specs JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS construction_resource_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL,
    project_id UUID NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
`;

async function runMigration() {
    const client = new Client({ connectionString: DATABASE_URL });
    try {
        await client.connect();
        console.log("Connected to database. Running manual migration...");
        await client.query(sql);
        console.log("✅ Manual migration successful.");
    } catch (err: any) {
        console.error("❌ Migration failed:", err.message);
    } finally {
        await client.end();
    }
}

runMigration();
