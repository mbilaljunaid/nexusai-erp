
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applySchema() {
    console.log("Applying TCA Schema via Raw SQL...");

    try {
        // 1. HZ_PARTIES
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_parties (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                party_number varchar(30) NOT NULL UNIQUE,
                party_name varchar NOT NULL,
                party_type varchar(30) NOT NULL,
                status varchar(1) DEFAULT 'A',
                category_code varchar,
                orig_system_reference varchar,
                duns_number varchar,
                validation_status varchar DEFAULT 'UNVALIDATED',
                url varchar,
                email varchar,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("Created hz_parties");

        // 2. HZ_ORGANIZATION_PROFILES
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_organization_profiles (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                party_id varchar NOT NULL REFERENCES hz_parties(id),
                organization_name varchar NOT NULL,
                duns_number varchar,
                tax_reference varchar,
                industry_code varchar,
                sic_code varchar,
                naics_code varchar,
                corporation_class varchar,
                employees_total integer,
                current_revenue numeric(20, 2),
                established_year integer,
                effective_start_date date DEFAULT now(),
                effective_end_date date,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("Created hz_organization_profiles");

        // 3. HZ_PERSON_PROFILES
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_person_profiles (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                party_id varchar NOT NULL REFERENCES hz_parties(id),
                first_name varchar,
                middle_name varchar,
                last_name varchar,
                person_title varchar,
                gender varchar(30),
                date_of_birth date,
                place_of_birth varchar,
                marital_status varchar,
                status varchar DEFAULT 'A',
                effective_start_date date DEFAULT now(),
                effective_end_date date,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("Created hz_person_profiles");

        // 4. HZ_LOCATIONS
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_locations (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                address1 varchar NOT NULL,
                address2 varchar,
                address3 varchar,
                address4 varchar,
                city varchar NOT NULL,
                state varchar,
                province varchar,
                county varchar,
                postal_code varchar,
                country varchar(2) NOT NULL,
                validation_status varchar DEFAULT 'UNVALIDATED',
                validated_date timestamp,
                latitude numeric(10, 6),
                longitude numeric(10, 6),
                timezone varchar,
                formatted_address text,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("Created hz_locations");

        // 5. HZ_PARTY_SITES
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_party_sites (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                party_id varchar NOT NULL REFERENCES hz_parties(id),
                location_id varchar NOT NULL REFERENCES hz_locations(id),
                party_site_name varchar,
                party_site_number varchar UNIQUE,
                identifying_address_flag boolean DEFAULT false,
                status varchar(1) DEFAULT 'A',
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("Created hz_party_sites");

        // 6. HZ_PARTY_SITE_USES
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_party_site_uses (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                party_site_id varchar NOT NULL REFERENCES hz_party_sites(id),
                site_use_type varchar NOT NULL,
                site_use_code varchar DEFAULT 'PRIMARY',
                status varchar(1) DEFAULT 'A',
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("Created hz_party_site_uses");

        // 7. HZ_RELATIONSHIPS
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_relationships (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                subject_id varchar NOT NULL REFERENCES hz_parties(id),
                object_id varchar NOT NULL REFERENCES hz_parties(id),
                relationship_code varchar NOT NULL,
                relationship_type varchar NOT NULL,
                start_date date DEFAULT now(),
                end_date date,
                status varchar(1) DEFAULT 'A',
                comments text,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("Created hz_relationships");

        // 8. HZ_ORG_CONTACTS
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS hz_org_contacts (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                party_relationship_id varchar NOT NULL REFERENCES hz_relationships(id),
                party_site_id varchar,
                department_code varchar,
                department varchar,
                job_title varchar,
                job_title_code varchar,
                decision_maker_flag boolean DEFAULT false,
                created_at timestamp DEFAULT now()
            );
        `);
        console.log("Created hz_org_contacts");

        // 9. FND_LOOKUP_TYPES
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fnd_lookup_types (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                lookup_type varchar(30) NOT NULL UNIQUE,
                application_id varchar,
                user_lookup_name varchar NOT NULL,
                description text,
                customization_level varchar(1) DEFAULT 'U',
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("Created fnd_lookup_types");

        // 10. FND_LOOKUP_VALUES
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS fnd_lookup_values (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                lookup_type_id varchar NOT NULL REFERENCES fnd_lookup_types(id),
                lookup_code varchar(30) NOT NULL,
                meaning varchar NOT NULL,
                description text,
                enabled_flag boolean DEFAULT true,
                start_date_active timestamp,
                end_date_active timestamp,
                sort_order integer,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now()
            );
        `);
        console.log("Created fnd_lookup_values");

        // 11. Alter SCM_SUPPLIERS
        try {
            await db.execute(sql`ALTER TABLE scm_suppliers ADD COLUMN IF NOT EXISTS party_id varchar REFERENCES hz_parties(id);`);
            console.log("Altered scm_suppliers");
        } catch (e: any) {
            console.log("scm_suppliers check: " + e.message);
        }

        // 12. Alter ACCOUNTS
        try {
            await db.execute(sql`ALTER TABLE accounts ADD COLUMN IF NOT EXISTS party_id varchar REFERENCES hz_parties(id);`);
            console.log("Altered accounts");
        } catch (e: any) {
            console.log("accounts check: " + e.message);
        }

        // 13. Alter CONTACTS
        try {
            await db.execute(sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS party_id varchar REFERENCES hz_parties(id);`);
            console.log("Altered contacts");
        } catch (e: any) {
            console.log("contacts check: " + e.message);
        }

        // 14. Alter LEADS
        try {
            await db.execute(sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS party_id varchar REFERENCES hz_parties(id);`);
            console.log("Altered leads");
        } catch (e: any) {
            console.log("leads check: " + e.message);
        }

        console.log("TCA Schema Applied Successfully.");
        process.exit(0);
    } catch (e: any) {
        console.error("Error applying schema:", e);
        process.exit(1);
    }
}

applySchema();
