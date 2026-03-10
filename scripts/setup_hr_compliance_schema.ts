import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function setupSchema() {
    console.log("🛠️  Setting up HR Compliance Schema...");

    try {
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS hr_compliance_frameworks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR NOT NULL,
        code VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        description TEXT,
        jurisdiction VARCHAR,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS hr_compliance_rules (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR NOT NULL,
        framework_id VARCHAR REFERENCES hr_compliance_frameworks(id),
        code VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        description TEXT,
        severity VARCHAR NOT NULL,
        automation_level VARCHAR NOT NULL,
        rule_logic JSONB,
        effective_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS hr_compliance_events (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR NOT NULL,
        rule_id VARCHAR REFERENCES hr_compliance_rules(id),
        entity_type VARCHAR NOT NULL,
        entity_id VARCHAR NOT NULL,
        evaluation_result VARCHAR NOT NULL,
        metadata JSONB,
        timestamp TIMESTAMP DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS hr_compliance_violations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR NOT NULL,
        event_id VARCHAR REFERENCES hr_compliance_events(id),
        rule_id VARCHAR REFERENCES hr_compliance_rules(id),
        status VARCHAR DEFAULT 'open',
        severity VARCHAR NOT NULL,
        description TEXT,
        remediation_actions JSONB,
        assigned_to VARCHAR,
        resolved_at TIMESTAMP,
        resolution_notes TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `);

        console.log("✅ HR Compliance Schema created successfully!");
    } catch (error) {
        console.error("❌ Error creating schema:", error);
        process.exit(1);
    }
}

setupSchema();
