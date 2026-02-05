
import { DrizzleProvider } from '../src/database/drizzle.provider';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { sql } from 'drizzle-orm';

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function run() {
    console.log('🔌 Connecting to DB to force create inv_on_hand_quantities...');
    const factory = (DrizzleProvider as any).useFactory;
    const db = await factory();

    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS inv_on_hand_quantities (
                id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
                "organizationId" varchar NOT NULL,
                "itemId" varchar NOT NULL,
                "subinventoryId" varchar NOT NULL,
                "locatorId" varchar,
                lot_number varchar,
                serial_number varchar,
                quantity numeric(18, 4) DEFAULT '0' NOT NULL,
                last_updated timestamp DEFAULT now()
            );
        `);
        console.log('✅ Table inv_on_hand_quantities created or already exists.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed to create table:', e);
        process.exit(1);
    }
}

run();
