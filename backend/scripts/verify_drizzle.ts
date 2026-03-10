
import { DrizzleProvider } from '../src/database/drizzle.provider';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env explicitly from root
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function verify() {
    console.log('🔌 Connecting to DB with Drizzle (Backend Context)...');

    try {
        const factory = (DrizzleProvider as any).useFactory;
        const db = await factory();

        if (db) {
            console.log('✅ Drizzle Database Provider initialized successfully!');
            // Check if schema is loaded
            // @ts-ignore
            const schemaKeys = Object.keys(db._.schema || {});
            console.log(`📊 Schema loaded with ${schemaKeys.length} tables/relations.`);

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
