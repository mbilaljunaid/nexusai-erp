
import "dotenv/config";
import { db } from "../server/db";
import { territories, territoryRules, accounts } from "../shared/schema";
import { eq } from "drizzle-orm";
import { TerritoryService } from "../server/services/TerritoryService";

async function verifyTerritoryManagement() {
    console.log("🚀 Starting verification for Territory Management (Phase 21.3)...");

    try {
        // 1. Create Territory
        console.log("\n--- Creating Territory ---");
        const tName = "East Coast " + Date.now();
        const [territory] = await db.insert(territories).values({
            name: tName,
            description: "Eastern Region",
        }).returning();
        console.log("✅ Created Territory:", territory.id, territory.name);

        // 2. Add Rule
        console.log("\n--- Adding Assignment Rule ---");
        await db.insert(territoryRules).values({
            territoryId: territory.id,
            field: "billingState",
            operator: "equals",
            value: "NY",
            priority: 1
        });
        console.log("✅ Added Rule: billingState equals NY");

        // 3. Create Account matching rule
        console.log("\n--- Creating Matching Account ---");
        const accName = "Empire State Building " + Date.now();
        const [account] = await db.insert(accounts).values({
            name: accName,
            billingState: "NY",
            annualRevenue: "500000"
        }).returning();
        console.log("✅ Created Account:", account.id, account.name, "(State: NY)");

        // 4. Run Assignment
        console.log("\n--- Running Territory Assignment Engine ---");
        const assignedId = await TerritoryService.assignAccount(account.id);

        console.log(`✅ Result: Assigned ID ${assignedId}`);

        if (assignedId !== territory.id) {
            throw new Error(`Assignment Failed. Expected ${territory.id}, got ${assignedId}`);
        }
        console.log("✅ Assignment Verified!");

        // Cleanup
        console.log("\n--- Cleanup ---");
        await db.delete(accounts).where(eq(accounts.id, account.id));
        await db.delete(territoryRules).where(eq(territoryRules.territoryId, territory.id));
        await db.delete(territories).where(eq(territories.id, territory.id));
        console.log("✅ Cleanup complete");

        console.log("\n🎉 Verification SUCCESS!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyTerritoryManagement();
