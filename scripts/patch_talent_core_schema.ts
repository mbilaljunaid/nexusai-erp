
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchTalentCore() {
    console.log("🛠️  Patching Talent Core Schema...");

    // 1. SKILLS
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_skills (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            name varchar NOT NULL UNIQUE,
            description text,
            category varchar,
            is_active boolean DEFAULT true,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("- Checked/Created hrm_skills");

    // 2. COMPETENCIES
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_competencies (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            name varchar NOT NULL,
            description text,
            behavioral_indicators jsonb,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("- Checked/Created hrm_competencies");

    // 3. JOB PROFILES
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_job_profiles (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            job_id varchar NOT NULL REFERENCES hr_jobs(id),
            profile_summary text,
            responsibilities text,
            qualifications text,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("- Checked/Created hrm_job_profiles");

    // 4. PERSON SKILLS
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS hrm_person_skills (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            person_id varchar NOT NULL REFERENCES hr_persons(id),
            competency_id varchar REFERENCES hrm_competencies(id),
            skill_name varchar,
            proficiency varchar,
            verified boolean DEFAULT false,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("- Checked/Created hrm_person_skills");

    console.log("✅ Talent Core Schema Patched Successfully.");
    process.exit(0);
}

patchTalentCore().catch((err) => {
    console.error("❌ Patch Error:", err);
    process.exit(1);
});
