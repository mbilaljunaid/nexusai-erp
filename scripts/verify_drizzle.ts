import { DrizzleProvider } from '../backend/src/database/drizzle.provider.ts';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verify() {
    console.log('🔌 Connecting to DB with Drizzle...');

    try {
        const factory = DrizzleProvider.useFactory as () => Promise<any>;
        const db = await factory();

        if (db) {
            console.log('✅ Drizzle Database Provider initialized successfully!');
            // Check if schema is loaded
            // @ts-ignore
            const schemaKeys = Object.keys(db._.schema || {});
            console.log(`📊 Schema loaded with ${schemaKeys.length} tables/relations.`);

            // Basic query check if possible, or just exit
            console.log('🚀 Verification Complete.');
            process.exit(0);
        } else {
            console.error('❌ Factory returned undefined.');
            process.exit(1);
        }
    } catch (e) {
        console.error('❌ Drizzle Initialization Failed:', e);
        process.exit(1);
    }
}

verify();
