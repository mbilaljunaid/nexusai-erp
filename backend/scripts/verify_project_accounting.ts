
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as schema from '../../shared/schema';
import { sql, eq } from 'drizzle-orm';
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

async function run() {
    console.log("Starting Project Accounting Verification...");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    try {
        // 1. Force Create Table
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS pa_cost_distribution_lines (
                id text PRIMARY KEY DEFAULT gen_random_uuid(),
                "project_id" text NOT NULL,
                "task_id" text,
                "cost_distribution_id" text NOT NULL,
                "amount" numeric(18, 4) NOT NULL,
                "currency_code" text NOT NULL,
                "billable_flag" boolean DEFAULT true,
                "billed_flag" boolean DEFAULT false,
                "created_at" timestamp DEFAULT now()
            );
        `);
        console.log("Table pa_cost_distribution_lines ensured.");

        // 2. Create Project
        const [project] = await db.insert(schema.projects2).values({
            name: "New AI Implementation",
            description: "Implementing ERP AI agents",
            status: "active"
        }).returning();
        console.log("Project Created:", project.id);

        // 3. Create Task
        const [task] = await db.insert(schema.issues).values({
            projectId: project.id,
            title: "Setup Costing Integration",
            status: "todo",
            type: "task"
        }).returning();
        console.log("Task Created:", task.id);

        // 4. Create PA Distribution Line
        const [line] = await db.insert(schema.paCostDistributionLines).values({
            projectId: project.id,
            taskId: task.id,
            costDistributionId: "DIST-123-MOCK", // Mock FK
            amount: "500.00",
            currencyCode: "USD",
            billableFlag: true
        }).returning();

        console.log("PA Line Created:", line.id);

        // 5. Verify Fetch
        const fetchedLine = await db.query.paCostDistributionLines.findFirst({
            where: eq(schema.paCostDistributionLines.id, line.id)
        });

        if (!fetchedLine) throw new Error("Failed to fetch PA line");
        console.log("Verification Successful.");

    } catch (e) {
        console.error("Verification Failed:", e);
    } finally {
        await pool.end();
    }
}

run();
