
import "dotenv/config";
import { db } from "../server/db";
import {
    ppmBudgetLines,
    ppmExpenditureItems,
    ppmBudgetVersions
} from "../shared/schema";
import { eq, sum, sql } from "drizzle-orm";

async function debugQuery() {
    console.log("🔍 Debugging PPM Queries...");

    // 1. Get a Project ID (Mock)
    const projectId = "mock-project-id";
    const versionId = "mock-version-id";

    try {
        console.log("1. Testing Budget Sum Query...");
        // Explicitly test the sum query
        const budgetRes = await db.select({ total: sum(ppmBudgetLines.amount) })
            .from(ppmBudgetLines)
            .where(eq(ppmBudgetLines.versionId, versionId));
        console.log("   ✅ Budget Query Passed. Result:", budgetRes);
    } catch (err: any) {
        console.error("   ❌ Budget Query Failed:", err.message);
    }

    try {
        console.log("2. Testing Actuals Sum Query...");
        // Explicitly test the actuals sum query with raw column string
        const actualsRes = await db.select({ total: sql<number>`sum(burdened_cost)` })
            .from(ppmExpenditureItems)
            .where(eq(ppmExpenditureItems.projectId, projectId));
        console.log("   ✅ Actuals Query Passed. Result:", actualsRes);
    } catch (err: any) {
        console.error("   ❌ Actuals Query Failed:", err.message);
    }

    try {
        console.log("3. Testing Simple Select...");
        const simpleRes = await db.select().from(ppmExpenditureItems).limit(1);
        console.log("   ✅ Simple Select Passed. Result length:", simpleRes.length);
    } catch (err: any) {
        console.error("   ❌ Simple Select Failed:", err.message);
    }

    try {
        console.log("4. Testing Count Query...");
        const countRes = await db.select({ count: sql<number>`count(*)` })
            .from(ppmExpenditureItems);
        console.log("   ✅ Count Query Passed. Result:", countRes);
    } catch (err: any) {
        console.error("   ❌ Count Query Failed:", err.message);
    }

    process.exit(0);
}

debugQuery();
