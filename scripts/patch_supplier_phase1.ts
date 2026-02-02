import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Applying Supplier Portal Phase 1 Schema Patches...");

  try {
    // 1. Create scm_suppliers
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS scm_suppliers (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        email VARCHAR,
        phone VARCHAR,
        address TEXT,
        status VARCHAR DEFAULT 'active',
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log("✅ Created scm_suppliers table");

    // 2. Create scm_supplier_sites
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS scm_supplier_sites (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_id VARCHAR NOT NULL,
        site_name VARCHAR NOT NULL,
        address TEXT,
        is_purchasing VARCHAR DEFAULT 'true',
        is_pay VARCHAR DEFAULT 'true',
        status VARCHAR DEFAULT 'active',
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log("✅ Created scm_supplier_sites table");

    // 3. Create supplier_onboarding_requests
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS supplier_onboarding_requests (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR NOT NULL,
        tax_id VARCHAR NOT NULL,
        contact_email VARCHAR NOT NULL,
        phone VARCHAR,
        business_classification VARCHAR,
        status VARCHAR DEFAULT 'PENDING',
        notes TEXT,
        submitted_at TIMESTAMP DEFAULT now(),
        reviewed_at TIMESTAMP,
        reviewer_id VARCHAR,
        bank_account_name VARCHAR,
        bank_account_number VARCHAR,
        bank_routing_number VARCHAR
      );
    `);
    console.log("✅ Created supplier_onboarding_requests table");

    // 4. Create supplier_user_identities
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS supplier_user_identities (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        supplier_id VARCHAR NOT NULL,
        portal_token VARCHAR UNIQUE,
        role VARCHAR DEFAULT 'ADMIN',
        status VARCHAR DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log("✅ Created supplier_user_identities table");

    console.log("🎉 Supplier Portal Phase 1 Schema Patches Applied Successfully!");
  } catch (error) {
    console.error("❌ Error applying schema patches:", error);
    process.exit(1);
  }
}

main();
