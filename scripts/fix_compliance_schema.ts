import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function fixSchema() {
    console.log("🛠️ Applying manual schema fixes...");

    try {
        // 1. Add columns to hr_compliance_rules if they don't exist
        await db.execute(sql`
            ALTER TABLE hr_compliance_rules 
            ADD COLUMN IF NOT EXISTS category varchar(255) NOT NULL DEFAULT 'REGULATORY',
            ADD COLUMN IF NOT EXISTS legislation_code varchar(255) NOT NULL DEFAULT 'GLOBAL';
        `);
        console.log("✅ hr_compliance_rules updated.");

        // 2. Create hr_aor table if it doesn't exist
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hr_aor (
                id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id varchar(255) NOT NULL,
                person_id varchar(255) NOT NULL,
                scope_type varchar(255) NOT NULL,
                scope_value_id varchar(255) NOT NULL,
                responsibility_type varchar(255),
                is_active boolean DEFAULT true,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("✅ hr_aor table created/verified.");

        // 3. Create hr_audit_logs table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hr_audit_logs (
                id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id varchar(255) NOT NULL,
                entity_type varchar(255) NOT NULL,
                entity_id varchar(255) NOT NULL,
                action varchar(255) NOT NULL,
                actor_id varchar(255) NOT NULL,
                changes jsonb,
                timestamp timestamp DEFAULT now()
            );
        `);
        console.log("✅ hr_audit_logs table created/verified.");

        // 4. Create hr_audit_approvals table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hr_audit_approvals (
                id varchar(255) PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id varchar(255) NOT NULL,
                form_id varchar(255) NOT NULL,
                record_id varchar(255) NOT NULL,
                requested_by varchar(255) NOT NULL,
                requested_at timestamp DEFAULT now(),
                status varchar(255) DEFAULT 'pending',
                approvers jsonb NOT NULL,
                required_approvals integer DEFAULT 1,
                current_approvals integer DEFAULT 0,
                rejection_reason varchar(255),
                metadata jsonb
            );
        `);
        console.log("✅ hr_audit_approvals table created/verified.");

    } catch (error) {
        console.error("❌ Schema fix failed:", error);
    }
}

fixSchema();
