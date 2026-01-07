const { Client } = require('pg');

async function applySchema() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    const client = new Client({ connectionString });
    await client.connect();

    const sql = `
    CREATE SCHEMA IF NOT EXISTS common;

    CREATE TABLE IF NOT EXISTS common.tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        subscription_plan VARCHAR(50) DEFAULT 'FREE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS common.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES common.tenants(id),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'VIEWER',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS common.audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES common.tenants(id),
        user_id UUID NOT NULL REFERENCES common.users(id),
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    `;

    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('Common Schema applied successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applySchema();
