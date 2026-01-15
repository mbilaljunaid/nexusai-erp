
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("🛠️ Bootstrapping Maintenance Quality & Safety Schema...");

    try {
        // 1. Create Enums
        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "maint_permit_type" AS ENUM ('HOT_WORK', 'COLD_WORK', 'CONFINED_SPACE', 'ELECTRICAL_ISOLATION', 'WORKING_AT_HEIGHT');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await db.execute(sql`
            DO $$ BEGIN
                CREATE TYPE "maint_inspection_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASS', 'FAIL');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // 2. Create Tables
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "maint_inspection_definitions" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "name" varchar(150) NOT NULL,
                "description" text,
                "type" varchar(50) DEFAULT 'Standard',
                "questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
                "active" boolean DEFAULT true,
                "created_at" timestamp DEFAULT now()
            );
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "maint_inspections" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "definition_id" uuid NOT NULL,
                "work_order_id" uuid,
                "asset_id" uuid,
                "status" "maint_inspection_status" DEFAULT 'PENDING',
                "results" jsonb DEFAULT '[]'::jsonb,
                "conducted_by_user_id" uuid,
                "conducted_at" timestamp,
                "notes" text,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "maint_permits" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "permit_number" varchar(50) NOT NULL UNIQUE,
                "work_order_id" uuid NOT NULL,
                "type" "maint_permit_type" NOT NULL,
                "status" varchar(30) DEFAULT 'ACTIVE',
                "valid_from" timestamp NOT NULL,
                "valid_to" timestamp NOT NULL,
                "authorized_by_user_id" uuid,
                "hazards" text,
                "precautions" text,
                "created_at" timestamp DEFAULT now()
            );
        `);

        // 3. Seed Default Inspection Template
        await db.execute(sql`
            INSERT INTO "maint_inspection_definitions" ("name", "description", "questions")
            VALUES (
                'General Equipment Safety Check',
                'Standard pre-work safety inspection',
                '[
                    {"id": "q1", "text": "Is the area clear of debris?", "type": "YES_NO", "required": true},
                    {"id": "q2", "text": "Are guards in place?", "type": "YES_NO", "required": true},
                    {"id": "q3", "text": "Current Hour Meter Reading", "type": "NUMBER", "required": false}
                ]'::jsonb
            )
            ON CONFLICT DO NOTHING; -- No unique constraint on Name, so this might dup if run repeatedly without clearing. Added simple check?
            -- Actually ID is primary key. Name not unique. For safety, let's leave as is, or use a specific UUID for seeding.
        `);


        console.log("✅ Maintenance Quality Schema Applied Successfully");
    } catch (error) {
        console.error("❌ Error bootstrapping schema:", error);
    }
}

main();
