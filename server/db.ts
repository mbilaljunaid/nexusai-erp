import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../shared/schema";

// Initialize database connection
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Use pg.Pool for connection pooling and standard TCP connection
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // Default pool size
});

// Initialize Drizzle ORM with schema
export const db = drizzle(pool, { schema });

export type Database = typeof db;
