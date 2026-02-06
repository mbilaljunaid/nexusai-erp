
import * as schema from '../shared/schema/index.ts';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

console.log('Schema loaded:', Object.keys(schema).length, 'keys');

try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/nexusai_erp' });
    const db = drizzle(pool, { schema });
    console.log('Drizzle initialized successfully');
} catch (e) {
    console.error('Drizzle initialization failed:', e);
}
