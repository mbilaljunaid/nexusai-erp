
import { executeTool } from "../server/services/nexus-tool-executor";
import { db } from "../server/db";
import { leads } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyCrossModuleAction() {
    console.log("🔍 Starting Cross-Module AI Action Verification...");

    const testEmail = `test.cross.module.${Date.now()}@acme.inc`;
    const toolName = "create_lead";
    // Updated params to match schema requirements
    const params = {
        firstName: "Cross",
        lastName: "Module-Test",
        company: "Acme Cross Module Inc.",
        email: testEmail,
        leadSource: "AI_VERIFICATION",
        phone: "555-0123",
        status: "new"
    };

    // Simulation: Finance User (e.g., CFO) triggering a CRM action
    const mockUserRole = "admin"; // Using admin for now

    console.log(`Available permissions for ${mockUserRole}: Checking...`);

    try {
        console.log(`🚀 Executing tool '${toolName}' with params:`, params);
        const result = await executeTool({
            toolName,
            parameters: params,
            userRole: mockUserRole,
            userId: "verification-script"
        });

        console.log("✅ Tool Execution Result:", result);

        if (!result.success) {
            console.error("❌ Tool execution failed:", result.error);
            process.exit(1);
        }

        // Verify in DB
        console.log("🔎 Verifying Lead existence in DB...");
        // We need to wait a moment for DB propagation if async, but it should be awaited.
        const foundLeads = await db.select().from(leads).where(eq(leads.email, testEmail));

        if (foundLeads.length > 0) {
            console.log("✅ verification SUCCESS: Lead found in DB:", foundLeads[0]);

            // Cleanup
            console.log("🧹 Cleaning up test data...");
            await db.delete(leads).where(eq(leads.email, testEmail));
            console.log("✨ Cleanup complete.");
            process.exit(0);
        } else {
            console.error("❌ verification FAILED: Lead not found in DB after successful execution.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Unexpected error:", error);
        process.exit(1);
    }
}

verifyCrossModuleAction();
