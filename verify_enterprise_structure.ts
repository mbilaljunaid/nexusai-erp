
import "dotenv/config";
import { financeService } from "./server/services/finance";
import { glLedgers, glLedgerSets, glLegalEntities } from "./shared/schema/finance";
import { db } from "./server/db";
import { eq } from "drizzle-orm";

async function verifyEnterpriseStructure() {
    console.log("🚀 Starting Enterprise Structure Verification...");

    try {
        // 1. Create a Primary Ledger
        console.log("\n1. Creating Primary Ledger...");
        const ledger = await financeService.createLedger({
            name: "US Primary Ledger " + Date.now(),
            currencyCode: "USD",
            calendarId: "Monthly",
            coaId: "US_COA",
            description: "Main US Ledger",
            ledgerCategory: "PRIMARY"
        });
        console.log(`   ✅ Created Ledger: ${ledger.name} (${ledger.id})`);

        // 2. Create a Legal Entity
        console.log("\n2. Creating Legal Entity...");
        const le = await financeService.createLegalEntity({
            name: "US Legal Entity " + Date.now(),
            organizationId: "US-LE-001",
            registrationNumber: "REG-999",
            ledgerId: ledger.id
        });
        console.log(`   ✅ Created Legal Entity: ${le.name} (${le.id}) linked to Ledger ${ledger.name}`);

        // 3. Create a Ledger Set
        console.log("\n3. Creating Ledger Set...");
        const ledgerSet = await financeService.createLedgerSet({
            name: "Global Consolidation Set " + Date.now(),
            description: "Consolidated View",
            ledgerId: ledger.id
        });
        console.log(`   ✅ Created Ledger Set: ${ledgerSet.name} (${ledgerSet.id})`);

        // 4. Assign Ledger to Set
        console.log("\n4. Assigning Ledger to Set...");
        const assignment = await financeService.assignLedgerToSet(ledgerSet.id, ledger.id);
        console.log(`   ✅ Assigned Ledger ${ledger.id} to Set ${ledgerSet.id}`);

        // 5. Verify Fetch
        console.log("\n5. Verifying Data Retrieval...");
        const sets = await financeService.listLedgerSets();
        if (!sets.find(s => s.id === ledgerSet.id)) throw new Error("Ledger Set not found in list");

        const entities = await financeService.listLegalEntities();
        if (!entities.find(e => e.id === le.id)) throw new Error("Legal Entity not found in list");

        console.log("\n✨ Enterprise Structure Verification PASSED ✨");
        process.exit(0);

    } catch (e: any) {
        console.error("❌ Verification Failed:", e.message);
        console.error(e);
        process.exit(1);
    }
}

verifyEnterpriseStructure();
