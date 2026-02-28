import "dotenv/config";
import { db } from "./db";
import { sql } from "drizzle-orm";

async function runMigration() {
    try {
        console.log("Creating ar_customer_profiles...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "ar_customer_profiles" (
                "id" character varying PRIMARY KEY DEFAULT gen_random_uuid(),
                "entity_type" character varying NOT NULL,
                "entity_id" character varying NOT NULL,
                "profile_class_name" character varying NOT NULL,
                "credit_limit" numeric(18, 2),
                "order_limit" numeric(18, 2),
                "currency" character varying DEFAULT 'USD',
                "payment_terms" character varying,
                "statement_cycle" character varying,
                "dunning_letters" boolean DEFAULT true,
                "send_statements" boolean DEFAULT true,
                "late_charge_assessment" boolean DEFAULT false,
                "credit_hold" boolean DEFAULT false,
                "status" character varying DEFAULT 'Active',
                "created_at" timestamp without time zone DEFAULT now()
            );
        `);

        console.log("Creating ar_customer_bank_accounts...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "ar_customer_bank_accounts" (
                "id" character varying PRIMARY KEY DEFAULT gen_random_uuid(),
                "customer_id" character varying NOT NULL,
                "account_id" character varying,
                "site_id" character varying,
                "bank_name" character varying NOT NULL,
                "branch_name" character varying,
                "account_number" character varying NOT NULL,
                "routing_number" character varying,
                "currency" character varying DEFAULT 'USD',
                "primary_flag" boolean DEFAULT false,
                "active_date" timestamp without time zone DEFAULT now(),
                "inactive_date" timestamp without time zone,
                "created_at" timestamp without time zone DEFAULT now()
            );
        `);

        console.log("Migration complete.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
runMigration();
