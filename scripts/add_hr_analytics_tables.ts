
import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addHrAnalyticsTables() {
    console.log("🛠️ Adding HR Analytics Tables...");

    try {
        // 1. hr_kpi_definitions
        console.log("🔧 Creating hr_kpi_definitions...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hr_kpi_definitions (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL,
                code VARCHAR NOT NULL UNIQUE,
                description TEXT,
                category VARCHAR NOT NULL,
                periodicity VARCHAR DEFAULT 'DAILY',
                direction VARCHAR DEFAULT 'UP',
                format VARCHAR DEFAULT 'NUMBER',
                target_value NUMERIC,
                sql_logic TEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `);

        // 2. hr_analytics_snapshots
        console.log("🔧 Creating hr_analytics_snapshots...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hr_analytics_snapshots (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                kpi_id VARCHAR NOT NULL,
                snapshot_date TIMESTAMP NOT NULL,
                value NUMERIC(18,4) NOT NULL,
                dimensions JSONB DEFAULT '{}'::jsonb,
                tenant_id VARCHAR NOT NULL,
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        // 3. hr_predictive_models
        console.log("🔧 Creating hr_predictive_models...");
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hr_predictive_models (
                id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL,
                type VARCHAR NOT NULL,
                target_kpi_id VARCHAR,
                accuracy NUMERIC,
                last_trained_at TIMESTAMP,
                config JSONB,
                status VARCHAR DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT now()
            );
        `);

        console.log("✅ HR Analytics Tables Added Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Failed to add tables:", error);
        process.exit(1);
    }
}

addHrAnalyticsTables();
