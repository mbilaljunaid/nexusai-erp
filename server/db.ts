import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });

export async function initializeDatabase() {
  try {
    console.log("[db] Connecting to PostgreSQL...");
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("[db] Connection successful:", result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error("[db] Connection failed:", error);
    return false;
  }
}

export async function closeDatabase() {
  await pool.end();
}
