
import { db } from "../server/db";
import { accounts } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyAccountHierarchy() {
    console.log("🚀 Starting verification for Account Hierarchy (Phase 21.2)...");

    try {
        // 1. Create Parent Account
        console.log("\n--- Creating Parent Account ---");
        const parentName = "Global Corp - " + Date.now();
        const [parent] = await db.insert(accounts).values({
            name: parentName,
            industry: "Conglomerate",
            annualRevenue: "1000000000"
        }).returning();
        console.log("✅ Created Parent:", parent.id, parent.name);

        // 2. Create Child Account
        console.log("\n--- Creating Child Account ---");
        const childName = "Local Branch - " + Date.now();
        const [child] = await db.insert(accounts).values({
            name: childName,
            parentAccountId: parent.id,
            industry: "Retail",
            annualRevenue: "5000000"
        }).returning();
        console.log("✅ Created Child:", child.id, child.name, "linked to Parent:", child.parentAccountId);

        // 3. Verify Hierarchy Fetch Logic (Simulation)
        // Note: We can't easily call the API endpoint here without supertest or running server, 
        // so we verify the DB relationship and logic directly.

        const fetchedChild = await db.select().from(accounts).where(eq(accounts.id, child.id));
        if (fetchedChild[0].parentAccountId !== parent.id) {
            throw new Error("Hierarchy link broken in DB");
        }
        console.log("✅ DB Relationship Verified");

        // 4. Verify Sibling Logic
        console.log("\n--- Creating Sibling Account ---");
        const siblingName = "Regional Branch - " + Date.now();
        const [sibling] = await db.insert(accounts).values({
            name: siblingName,
            parentAccountId: parent.id,
            industry: "Retail"
        }).returning();

        const siblings = await db.select().from(accounts).where(eq(accounts.parentAccountId, parent.id));
        console.log(`✅ Fetched ${siblings.length} children for parent.`);
        if (siblings.length < 2) throw new Error("Sibling check failed");

        // Cleanup
        console.log("\n--- Cleanup ---");
        await db.delete(accounts).where(eq(accounts.id, child.id));
        await db.delete(accounts).where(eq(accounts.id, sibling.id));
        await db.delete(accounts).where(eq(accounts.id, parent.id));
        console.log("✅ Cleanup complete");

        console.log("\n🎉 Verification SUCCESS!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyAccountHierarchy();
