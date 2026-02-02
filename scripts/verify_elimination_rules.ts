
import { db } from "../server/db";
import { glEliminationDefinitions } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyEliminationRules() {
    console.log("🔍 Verifying Elimination Rules CRUD...");

    const testRule = {
        name: "Test Elimination Rule",
        ledgerSetId: "TEST_GRP",
        eliminationLedgerId: "TEST_ELIM",
        matchRule: "Standard",
        thresholdAmount: "500.00",
        enabled: true
    };

    // 1. Create
    console.log("   - Creating Rule...");
    const [created] = await db.insert(glEliminationDefinitions).values(testRule).returning();

    if (!created) {
        console.error("❌ Creation Failed");
        process.exit(1);
    }
    console.log(`     Created Rule ID: ${created.id}`);

    // 2. Read
    console.log("   - Reading Rules...");
    const rules = await db.select().from(glEliminationDefinitions).where(eq(glEliminationDefinitions.id, created.id));

    if (rules.length === 0 || rules[0].name !== testRule.name) {
        console.error("❌ Read Failed");
        process.exit(1);
    }
    console.log("     Rule found.");

    // 3. Update
    console.log("   - Updating Rule...");
    const [updated] = await db.update(glEliminationDefinitions)
        .set({ description: "Updated Description" })
        .where(eq(glEliminationDefinitions.id, created.id))
        .returning();

    if (updated.description !== "Updated Description") {
        console.error("❌ Update Failed");
        process.exit(1);
    }
    console.log("     Rule updated.");

    // 4. Delete
    console.log("   - Deleting Rule...");
    await db.delete(glEliminationDefinitions).where(eq(glEliminationDefinitions.id, created.id));

    const check = await db.select().from(glEliminationDefinitions).where(eq(glEliminationDefinitions.id, created.id));
    if (check.length > 0) {
        console.error("❌ Delete Failed");
        process.exit(1);
    }
    console.log("     Rule deleted.");

    console.log("✅ Elimination Rules API Verification Passed!");
    process.exit(0);
}

verifyEliminationRules().catch((err) => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
