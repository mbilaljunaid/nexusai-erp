
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { users } from "@shared/schema";

async function main() {
    console.log("Starting migration: Add tenant_id to users...");

    try {
        // 1. Add tenant_id column if it doesn't exist
        await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tenant_id') THEN
          ALTER TABLE users ADD COLUMN tenant_id VARCHAR;
        END IF;
      END $$;
    `);
        console.log("Verified/Added tenant_id column.");

        // 2. Create Default Tenant if tenants table exists and is empty, or ensure 'System' tenant exists
        // We need to check if tenants table exists first (it should from platform.ts)
        // NOTE: 'tenants' is in 'platform' schema, let's assume it's created. 
        // If not, we might need to run full push, but this script assumes partial sync.
        // Let's safe guard.

        // We'll try to find a system tenant or create one.
        // We use raw sql because we don't want to rely on importing 'tenants' if it causes circular or compilation issues in this script context just yet

        const result = await db.execute(sql`SELECT id FROM tenants WHERE slug = 'system'`);
        const systemTenant = result.rows ? result.rows[0] : null;

        let tenantId;
        if (systemTenant && systemTenant.id) {
            tenantId = systemTenant.id;
            console.log("Found existing System tenant:", tenantId);
        } else {
            console.log("Creating System tenant...");
            const insertResult = await db.execute(sql`
            INSERT INTO tenants (name, slug, description, status) 
            VALUES ('System Tenant', 'system', 'Default system tenant', 'active') 
            RETURNING id
        `);
            const newTenant = insertResult.rows ? insertResult.rows[0] : null;
            tenantId = newTenant?.id;
            console.log("Created System tenant:", tenantId);
        }

        // 3. Backfill existing users with system tenant
        if (tenantId) {
            await db.execute(sql`UPDATE users SET tenant_id = ${tenantId} WHERE tenant_id IS NULL`);
            console.log("Backfilled existing users with tenant_id:", tenantId);
        }

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }

    console.log("Migration complete.");
    process.exit(0);
}

main();
