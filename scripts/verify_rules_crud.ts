import { db } from "../server/db";
import { glEliminationDefinitions } from "../shared/schema/finance";
import { eq } from "drizzle-orm";

async function verifyRules() {
    console.log("Verifying Elimination Rules CRUD...");

    // 1. Create
    const ruleName = "Test Rule " + Date.now();
    console.log(`1. Creating Rule '${ruleName}'...`);

    // Simulate what the API does
    const [inserted] = await db.insert(glEliminationDefinitions).values({
        name: ruleName,
        ledgerSetId: "GLOBAL_GRP",
        eliminationLedgerId: "ELIM_LEDGER",
        matchRule: "Standard",
        thresholdAmount: "100.00",
        enabled: true
    }).returning();

    if (!inserted) throw new Error("Insert failed");
    console.log("   -> Created ID:", inserted.id);

    // 2. Read
    console.log("2. Reading Rules...");
    const rules = await db.select().from(glEliminationDefinitions).where(eq(glEliminationDefinitions.id, inserted.id));
    if (rules.length === 0) throw new Error("Read failed");
    console.log("   -> Rule found.");

    // 3. Update
    console.log("3. Updating Rule...");
    const [updated] = await db.update(glEliminationDefinitions)
        .set({ description: "Updated Description" })
        .where(eq(glEliminationDefinitions.id, inserted.id))
        .returning();

    if (updated.description !== "Updated Description") throw new Error("Update failed");
    console.log("   -> Update verified.");

    // 4. Delete
    console.log("4. Deleting Rule...");
    await db.delete(glEliminationDefinitions).where(eq(glEliminationDefinitions.id, inserted.id));

    const check = await db.select().from(glEliminationDefinitions).where(eq(glEliminationDefinitions.id, inserted.id));
    if (check.length > 0) throw new Error("Delete failed");
    console.log("   -> Delete verified.");

    console.log("Rule CRUD Verification Complete");
}

verifyRules().catch(console.error);
