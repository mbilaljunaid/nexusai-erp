import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Initialize database connection
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create HTTP connection to Neon PostgreSQL
const sql = neon(databaseUrl);

// Initialize Drizzle ORM with schema
export const db = drizzle(sql, { schema });

export type Database = typeof db;
