
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function initLearningSchema() {
    console.log("🛠️ Initializing Learning Schema...");

    // DROP IN REVERSE ORDER
    await db.execute(sql`DROP TABLE IF EXISTS hrm_learning_enrollments CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hrm_learning_offerings CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hrm_learning_certifications CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hrm_learning_content_items CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hrm_learning_courses CASCADE`);

    // 1. COURSES
    await db.execute(sql`
        CREATE TABLE hrm_learning_courses (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            title varchar NOT NULL,
            description text,
            category varchar,
            provider varchar,
            duration_minutes integer,
            validity_months integer,
            renewal_rule varchar,
            status varchar DEFAULT 'ACTIVE',
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_courses");

    // 2. CONTENT ITEMS
    await db.execute(sql`
        CREATE TABLE hrm_learning_content_items (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            title varchar NOT NULL,
            type varchar NOT NULL,
            url text,
            launch_data text,
            created_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_content_items");

    // 3. CERTIFICATIONS
    await db.execute(sql`
        CREATE TABLE hrm_learning_certifications (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            title varchar NOT NULL,
            description text,
            validity_period_days integer,
            renewal_window_days integer,
            owner_id varchar REFERENCES hr_persons(id),
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_certifications");

    // 4. OFFERINGS
    await db.execute(sql`
        CREATE TABLE hrm_learning_offerings (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            course_id varchar NOT NULL REFERENCES hrm_learning_courses(id),
            title varchar NOT NULL,
            type varchar DEFAULT 'SELF_PACED',
            start_date date,
            end_date date,
            instructor_id varchar REFERENCES hr_persons(id),
            location varchar,
            capacity integer,
            enrolled_count integer DEFAULT 0,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_offerings");

    // 5. ENROLLMENTS
    await db.execute(sql`
        CREATE TABLE hrm_learning_enrollments (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            offering_id varchar NOT NULL REFERENCES hrm_learning_offerings(id),
            person_id varchar NOT NULL REFERENCES hr_persons(id),
            status varchar DEFAULT 'ENROLLED',
            progress_percent integer DEFAULT 0,
            score integer,
            completion_date date,
            certificate_url text,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);
    console.log("- Created hrm_learning_enrollments");

    console.log("✅ Learning Schema Initialized Successfully.");
    process.exit(0);
}

initLearningSchema().catch((err) => {
    console.error("❌ Init Error:", err);
    process.exit(1);
});
