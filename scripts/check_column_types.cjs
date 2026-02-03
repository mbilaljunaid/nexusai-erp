const { Client } = require('pg');

const DATABASE_URL = 'postgresql://nexusai:nexusai_dev@localhost:5432/nexusai';

async function checkColumnTypes() {
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();

    const tablesToCheck = [
        'maint_work_centers',
        'lcm_audit_logs',
        'ic_batches',
        'ic_headers',
        'ic_lines',
        'ic_transfer_pricing_rules',
        'ic_data_access_sets',
        'ic_allocation_rules',
        'ic_allocation_lines',
        'hrm_skills',
        'hrm_competencies',
        'hrm_job_profiles',
        'hrm_person_skills',
        'construction_projects',
        'construction_sites',
        'construction_entities',
        'construction_activity_logs',
        'construction_permits',
        'construction_inspectors',
        'construction_contractors',
        'hr_persons',
        'purchase_requisitions',
        'maint_work_orders',
        'maint_meters',
        'maint_meter_readings'
    ];

    console.log('--- Checking Column Types ---');
    for (const table of tablesToCheck) {
        try {
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}' AND column_name = 'id'
            `);
            if (res.rows.length > 0) {
                console.log(`${table}.id: ${res.rows[0].data_type}`);
            } else {
                console.log(`${table}: Table or id column not found.`);
            }
        } catch (err) {
            console.error(`Error checking ${table}:`, err.message);
        }
    }

    await client.end();
}

checkColumnTypes();
