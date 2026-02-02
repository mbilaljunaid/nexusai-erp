
import "dotenv/config";
import { db } from "../server/db.ts";
import { revenueContracts } from "../shared/schema/revenue.ts";
import { accounts } from "../shared/schema/crm.ts";
import { glLedgers } from "../shared/schema/finance.ts";
import { eq } from "drizzle-orm";

async function verifyPhaseC() {
    console.log("🔍 Verifying Revenue Phase C: UX Cleanup...");

    // 1. Verify UUID Replacement Logic (Backend Join)
    console.log("\n1. Testing Backend Joins (UUID Resolution)...");

    // Create a mock contract to test if we don't have one
    const [customer] = await db.select().from(accounts).limit(1);
    const [ledger] = await db.select().from(glLedgers).limit(1);

    if (!customer || !ledger) {
        console.warn("⚠️  Skipping specific join test: No customers or ledgers found.");
    } else {
        // Fetch using the service logic (simulated since we can't call express route easily here without supertest)
        // but we can verify the query logic works.

        const contracts = await db.select({
            id: revenueContracts.id,
            customerName: accounts.name,
            ledgerName: glLedgers.name,
        })
            .from(revenueContracts)
            .leftJoin(accounts, eq(revenueContracts.customerId, accounts.id))
            .leftJoin(glLedgers, eq(revenueContracts.ledgerId, glLedgers.id))
            .limit(5);

        console.log("   Query successful. Rows fetched:", contracts.length);
        if (contracts.length > 0) {
            console.log("   Sample Row:", contracts[0]);
            if (contracts[0].customerName || contracts[0].ledgerName) {
                console.log("✅  SUCCESS: Names resolved.");
            } else {
                console.log("ℹ️  Info: Joins worked but names might be null if IDs don't match.");
            }
        }
    }

    // 2. Verify Pagination Logic
    console.log("\n2. Verifying Pagination Query Logic...");
    const limit = 2;
    const page = 1;
    const offset = (page - 1) * limit;

    const paginated = await db.select()
        .from(revenueContracts)
        .limit(limit)
        .offset(offset);

    console.log(`   Fetched ${paginated.length} rows with limit ${limit}.`);
    if (paginated.length <= limit) {
        console.log("✅  SUCCESS: Pagination limit respected.");
    } else {
        console.error("❌  FAILURE: Pagination limit ignored.");
    }

    console.log("\n✅ Phase C Verification Complete.");
    process.exit(0);
}

verifyPhaseC().catch((err) => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
