
import "dotenv/config";
import { db } from "../server/db";
import { icOrgs, icTransactionTypes } from "../shared/schema/intercompany";
import { eq } from "drizzle-orm";

async function verifyIcSchema() {
    console.log("🔍 Verifying Intercompany Logic (Phase 19)...");

    // 1. Verify Transaction Types
    console.log("1. Checking Transaction Types...");
    const types = await db.select().from(icTransactionTypes);
    console.log(`   - Found ${types.length} transaction types.`);

    const requiredTypes = ["SHARED_SERVICES", "INVENTORY", "ROYALTY", "MANUAL"];
    for (const t of requiredTypes) {
        const exists = types.find(x => x.id === t);
        if (!exists) throw new Error(`Missing Transaction Type: ${t}`);
    }

    // 2. Verify Organizations
    console.log("2. Checking IC Organizations...");
    const orgs = await db.select().from(icOrgs);
    console.log(`   - Found ${orgs.length} IC Organizations.`);

    const hq = orgs.find(o => o.companySegment === "101");
    if (!hq) throw new Error("Missing HQ Organization (101)");
    if (!hq.receivablesAccountId || !hq.payablesAccountId) throw new Error("HQ Org missing default IC accounts");

    console.log("✅ Intercompany Schema Verified!");
    process.exit(0);
}

verifyIcSchema().catch((err) => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
