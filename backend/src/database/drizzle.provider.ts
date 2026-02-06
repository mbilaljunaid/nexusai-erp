import { Provider, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../shared/schema/index.ts';

export const DRIZZLE_DB = 'DRIZZLE_DB';

export const DrizzleProvider: Provider = {
    provide: DRIZZLE_DB,
    useFactory: async () => {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        // Test connection
        // await pool.query('SELECT 1'); 

        return drizzle(pool, { schema });
    },
};

