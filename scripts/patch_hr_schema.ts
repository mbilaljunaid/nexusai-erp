
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function patchHrSchema() {
    console.log("🛠️  Patching HR Schema...");

    // DROP IN REVERSE ORDER
    await db.execute(sql`DROP TABLE IF EXISTS hr_assignments CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hr_work_relationships CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hr_persons CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hr_organizations CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hr_locations CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS hr_jobs CASCADE`);

    // 1. LOCATIONS
    await db.execute(sql`
        CREATE TABLE hr_locations (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            code varchar,
            name varchar,
            active_status varchar DEFAULT 'ACTIVE',
            address_line_1 varchar,
            address_line_2 varchar,
            city varchar,
            state varchar,
            postal_code varchar,
            country varchar,
            description varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);

    // 2. ORGANIZATIONS
    await db.execute(sql`
        CREATE TABLE hr_organizations (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            name varchar NOT NULL,
            classification_code varchar NOT NULL,
            location_id varchar REFERENCES hr_locations(id),
            manager_id varchar,
            active_status varchar DEFAULT 'ACTIVE',
            tax_id varchar,
            registration_number varchar,
            legal_address_id varchar,
            parent_id varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);

    // 3. PERSONS
    await db.execute(sql`
        CREATE TABLE hr_persons (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            person_number varchar NOT NULL UNIQUE,
            first_name varchar NOT NULL,
            middle_name varchar,
            last_name varchar NOT NULL,
            date_of_birth date,
            national_id varchar,
            country varchar DEFAULT 'US',
            email varchar,
            phone varchar,
            user_id varchar,
            created_by varchar,
            updated_by varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);

    // 4. WORK RELATIONSHIPS
    await db.execute(sql`
        CREATE TABLE hr_work_relationships (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            person_id varchar NOT NULL REFERENCES hr_persons(id),
            legal_employer_id varchar NOT NULL REFERENCES hr_organizations(id),
            date_start date NOT NULL,
            worker_type varchar DEFAULT 'EMPLOYEE',
            primary_flag boolean DEFAULT true,
            termination_date date,
            created_by varchar,
            updated_by varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);

    // 5. JOBS
    await db.execute(sql`
        CREATE TABLE hr_jobs (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            code varchar,
            name varchar,
            active_status varchar DEFAULT 'ACTIVE',
            job_family_id varchar,
            valid_grade_id varchar,
            fte numeric(5,2) DEFAULT 1.0,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);

    // 6. ASSIGNMENTS
    await db.execute(sql`
        CREATE TABLE hr_assignments (
            id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id varchar NOT NULL,
            work_relationship_id varchar NOT NULL REFERENCES hr_work_relationships(id),
            person_id varchar NOT NULL REFERENCES hr_persons(id),
            assignment_number varchar NOT NULL,
            assignment_status varchar DEFAULT 'ACTIVE',
            assignment_type varchar DEFAULT 'E',
            job_id varchar REFERENCES hr_jobs(id),
            position_id varchar,
            grade_id varchar,
            department_id varchar REFERENCES hr_organizations(id),
            location_id varchar REFERENCES hr_locations(id),
            manager_id varchar REFERENCES hr_persons(id),
            primary_assignment_flag boolean DEFAULT true,
            fte numeric(5,2) DEFAULT 1.0,
            effective_start_date date,
            effective_end_date date,
            created_by varchar,
            updated_by varchar,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    `);

    console.log("✅ HR Schema Patched Successfully.");
    process.exit(0);
}

patchHrSchema().catch((err) => {
    console.error("❌ Patch Error:", err);
    process.exit(1);
});
