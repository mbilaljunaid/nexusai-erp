
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import { aiCapabilities, aiTools, aiQuickActions } from '../shared/schema/nexus_ai';
import { AI_CAPABILITIES_REGISTRY } from '../src/config/ai-capabilities';
import { TOOL_PERMISSION_MAP } from '../server/services/nexus-tool-executor';

// Connection string from environment
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
});

const db = drizzle(pool);

async function migrate() {
    console.log("🚀 Starting AI Registry Migration (Direct DB)...");

    for (const cap of AI_CAPABILITIES_REGISTRY) {
        console.log(`📦 Migrating capability: ${cap.name}...`);
        try {
            // Check if exists
            const existing = await db.select().from(aiCapabilities).where(sql`module_id = ${cap.id}`).limit(1);

            let capabilityId: string;
            if (existing.length > 0) {
                console.log(`   ⚠️ Capability ${cap.id} already exists, updating...`);
                capabilityId = existing[0].id;
                await db.update(aiCapabilities).set({
                    moduleName: cap.module,
                    name: cap.name,
                    description: cap.description,
                    routes: cap.routes || [],
                    insights: cap.insights || [],
                    updatedAt: new Date()
                }).where(sql`id = ${capabilityId}`);
            } else {
                const [dbCap] = await db.insert(aiCapabilities).values({
                    moduleId: cap.id,
                    moduleName: cap.module,
                    name: cap.name,
                    description: cap.description,
                    routes: cap.routes || [],
                    insights: cap.insights || [],
                }).returning();
                capabilityId = dbCap.id;
            }

            // Sync Tools
            if (cap.tools?.length) {
                console.log(`   🛠 Syncing ${cap.tools.length} tools...`);
                for (const t of cap.tools) {
                    const existingTool = await db.select().from(aiTools).where(sql`capability_id = ${capabilityId} AND name = ${t.name}`).limit(1);
                    if (existingTool.length > 0) {
                        await db.update(aiTools).set({
                            description: t.description,
                            parameters: t.parameters || {},
                            requiredPermission: TOOL_PERMISSION_MAP[t.name] || "PLATFORM_ADMIN",
                        }).where(sql`id = ${existingTool[0].id}`);
                    } else {
                        await db.insert(aiTools).values({
                            capabilityId: capabilityId,
                            name: t.name,
                            description: t.description,
                            parameters: t.parameters || {},
                            requiredPermission: TOOL_PERMISSION_MAP[t.name] || "PLATFORM_ADMIN",
                        });
                    }
                }
            }

            // Sync Quick Actions
            if (cap.quickActions?.length) {
                console.log(`   ⚡ Syncing ${cap.quickActions.length} quick actions...`);
                for (const a of cap.quickActions) {
                    const existingAction = await db.select().from(aiQuickActions).where(sql`capability_id = ${capabilityId} AND label = ${a.label}`).limit(1);
                    if (existingAction.length > 0) {
                        await db.update(aiQuickActions).set({
                            prompt: a.prompt,
                            icon: a.icon || "Sparkles"
                        }).where(sql`id = ${existingAction[0].id}`);
                    } else {
                        await db.insert(aiQuickActions).values({
                            capabilityId: capabilityId,
                            label: a.label,
                            prompt: a.prompt,
                            icon: a.icon || "Sparkles"
                        });
                    }
                }
            }
            console.log("   ✅ Success");
        } catch (e) {
            console.error(`   ❌ Error migrating ${cap.id}:`, e);
        }
    }
    console.log("🏁 Migration Complete.");
    await pool.end();
    process.exit(0);
}

// Helper for raw sql in where clauses
import { sql } from 'drizzle-orm';

migrate();
