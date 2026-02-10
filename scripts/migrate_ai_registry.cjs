
const { db } = require("../server/db");
const { aiCapabilities, aiTools, aiQuickActions } = require("../shared/schema/nexus_ai");
const { AI_CAPABILITIES_REGISTRY } = require("../src/config/ai-capabilities");
const { TOOL_PERMISSION_MAP } = require("../server/services/nexus-tool-executor");

async function migrate() {
    console.log("🚀 Starting AI Registry Migration (JS Version)...");

    for (const cap of AI_CAPABILITIES_REGISTRY) {
        console.log(`📦 Migrating capability: ${cap.name} (${cap.id})...`);

        try {
            // 1. Insert Capability
            const [dbCap] = await db.insert(aiCapabilities).values({
                moduleId: cap.id,
                moduleName: cap.module,
                name: cap.name,
                description: cap.description,
                routes: cap.routes || [],
                insights: cap.insights || [],
                isActive: true
            }).returning();

            // 2. Insert Tools
            if (cap.tools && cap.tools.length > 0) {
                const toolsToInsert = cap.tools.map(t => ({
                    capabilityId: dbCap.id,
                    name: t.name,
                    description: t.description,
                    parameters: t.parameters || {},
                    requiredPermission: TOOL_PERMISSION_MAP[t.name] || "PLATFORM_ADMIN",
                    action: t.action || "/api/nexus-ai/tools/execute",
                    isActive: true
                }));
                await db.insert(aiTools).values(toolsToInsert);
                console.log(`   ✅ Migrated ${toolsToInsert.length} tools.`);
            }

            // 3. Insert Quick Actions
            if (cap.quickActions && cap.quickActions.length > 0) {
                const actionsToInsert = cap.quickActions.map(a => ({
                    capabilityId: dbCap.id,
                    label: a.label,
                    prompt: a.prompt,
                    icon: a.icon || "Sparkles",
                    isActive: true
                }));
                await db.insert(aiQuickActions).values(actionsToInsert);
                console.log(`   ✅ Migrated ${actionsToInsert.length} quick actions.`);
            }

        } catch (error) {
            console.error(`   ❌ Failed to migrate ${cap.id}:`, error);
        }
    }

    console.log("🏁 AI Registry Migration Complete!");
    process.exit(0);
}

migrate();
