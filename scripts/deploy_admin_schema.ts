import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployAdminSchema() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing');
        process.exit(1);
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();

        // Read the migration SQL file
        const sqlPath = path.join(__dirname, '../db/migrations/0099_admin_panel_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        console.log('📦 Deploying admin panel schema...');
        await client.query(sql);

        console.log('✅ Admin panel schema deployed successfully!');
        console.log('\n📊 Created tables:');
        console.log('  - demo_environments');
        console.log('  - modules');
        console.log('  - module_industry_mapping');
        console.log('  - tenant_modules');
        console.log('  - subscription_plans');
        console.log('  - tenant_subscriptions');
        console.log('  - invoices');
        console.log('  - support_requests');
        console.log('  - marketing_campaigns');
        console.log('  - blog_posts');
        console.log('  - email_campaigns');
        console.log('  - email_templates');
        console.log('  - affiliates');
        console.log('  - affiliate_referrals');
        console.log('  - database_backups');
        console.log('  - system_config');
        console.log('  - feature_flags');
        console.log('  - admin_audit_logs');

        console.log('\n🌱 Seeded data:');
        console.log('  - 3 subscription plans');
        console.log('  - 6 core modules');
        console.log('  - Module-industry mappings');
        console.log('  - 4 feature flags');

    } catch (error) {
        console.error('❌ Error deploying admin schema:', error);
        throw error;
    } finally {
        await client.end();
    }
}

deployAdminSchema().catch(console.error);
