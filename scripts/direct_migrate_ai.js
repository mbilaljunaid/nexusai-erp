
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { aiCapabilities, aiTools, aiQuickActions } from './shared/schema/nexus_ai.js';
import { AI_CAPABILITIES_REGISTRY } from './src/config/ai-capabilities.js';
import { TOOL_PERMISSION_MAP } from './server/services/nexus-tool-executor.js';

// Connection string from environment or default local
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/nexusai";
const client = postgres(connectionString);
const db = drizzle(client);

async function migrate() {
    console.log("🚀 Starting AI Registry Migration (Direct DB)...");

    for (const cap of AI_CAPABILITIES_REGISTRY) {
        console.log(`📦 Migrating capability: ${cap.name}...`);
        try {
            const [dbCap] = await db.insert(aiCapabilities).values({
                moduleId: cap.id,
                moduleName: cap.module,
                name: cap.name,
                description: cap.description,
                routes: cap.routes || [],
                insights: cap.insights || [],
                isActive: true
            }).returning();

            if (cap.tools?.length) {
                await db.insert(aiTools).values(cap.tools.map(t => ({
                    capabilityId: dbCap.id,
                    name: t.name,
                    description: t.description,
                    parameters: t.parameters || {},
                    requiredPermission: TOOL_PERMISSION_MAP[t.name] || "PLATFORM_ADMIN",
                    action: t.action || "/api/nexus-ai/tools/execute"
                })));
            }

            if (cap.quickActions?.length) {
                await db.insert(aiQuickActions).values(cap.quickActions.map(a => ({
                    capabilityId: dbCap.id,
                    label: a.label,
                    prompt: a.prompt,
                    icon: a.icon || "Sparkles"
                })));
            }
            console.log("   ✅ Success");
        } catch (e) {
            console.error(`   ❌ Error migrating ${cap.id}:`, e.message);
        }
    }
    console.log("🏁 Migration Complete.");
    process.exit(0);
}

migrate();
