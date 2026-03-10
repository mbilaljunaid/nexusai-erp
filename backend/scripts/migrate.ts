import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { databaseConfig } from '../src/config/database.config';
import * as path from 'path';

async function runMigrations() {
    console.log('🔧 Starting database migrations...');

    const pool = new Pool(databaseConfig);
    const db = drizzle(pool);

    try {
        const migrationsFolder = path.join(__dirname, '../../migrations');
        console.log(`Migration folder: ${migrationsFolder}`);

        await migrate(db, { migrationsFolder });

        console.log('✅ Migrations completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations()
        .then(() => {
            console.log('✅ Migration process completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Migration process failed:', error);
            process.exit(1);
        });
}

export { runMigrations };
