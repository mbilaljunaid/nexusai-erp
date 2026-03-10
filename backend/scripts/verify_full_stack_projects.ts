
// Native fetch used
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as schema from '../../shared/schema';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
const BASE_URL = 'http://localhost:5001/api';

async function verify() {
    console.log("Starting Full Stack Verification...");

    // DB Setup for Pre-requisites
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    try {
        // 1. Create Project (Direct DB - Bypassing API Conflict)
        console.log("Creating Project (Direct DB)...");
        const [project] = await db.insert(schema.projects2).values({
            name: "Direct DB Project",
            description: "Bypassing API Conflict",
            status: "active"
        }).returning();
        console.log("Project Created:", project.id);

        // 2. Create Task (Via API - Verification Target)
        console.log("Creating Task (Via API)...");
        // API expecting CreateTaskDto
        const taskRes = await fetch(`${BASE_URL}/projects/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project: project.id,
                title: "Test Task via API",
                description: "Testing POST /api/projects/tasks",
                status: "todo",
                assignee: "user-123" // Mock assignee
            })
        });

        if (!taskRes.ok) {
            const err = await taskRes.text();
            throw new Error(`Task creation failed: ${taskRes.status} ${err}`);
        }
        const task = await taskRes.json();
        console.log("Task Created:", task.id);

        // 3. List Tasks (Via API)
        console.log("Listing Tasks...");
        const listRes = await fetch(`${BASE_URL}/projects/tasks`);
        const tasks: any[] = await listRes.json();

        console.log(`Found ${tasks.length} tasks.`);
        const found = tasks.find((t: any) => t.id === task.id);

        if (found) {
            console.log("✅ Verified: Task persists via Drizzle Service.");
        } else {
            console.error("❌ Verification Failed: Created task not found in list.");
        }

    } catch (e) {
        console.error("Verification Failed:", e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

verify();
