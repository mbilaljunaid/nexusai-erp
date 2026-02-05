
import { db } from "../server/db";
import { referenceDataService } from "../server/services/ReferenceDataService";
import { fndLookupTypes } from "../shared/schema/reference";
import { eq } from "drizzle-orm";

async function verifyPhase9RefData() {
    console.log("Starting MDM Phase 9 (Reference Data) Verification...");

    try {
        // 1. Create Lookup Type
        console.log("\n[1] Creating Lookup Type...");
        const typeCode = `TEST_TYPE_${Date.now()}`;
        const newType = await referenceDataService.createLookupType({
            lookupType: typeCode,
            userLookupName: "Test Type for Phase 9",
            description: "Automated verification test",
            customizationLevel: "U"
        });
        console.log("   ✅ Created Type:", newType.lookupType, newType.id);

        // 2. Add Values
        console.log("\n[2] Adding Lookup Values...");
        const val1 = await referenceDataService.createLookupValue({
            lookupTypeId: newType.id,
            lookupCode: "VAL_A",
            meaning: "Value A",
            enabledFlag: true,
            sortOrder: 10
        });
        const val2 = await referenceDataService.createLookupValue({
            lookupTypeId: newType.id,
            lookupCode: "VAL_B",
            meaning: "Value B",
            enabledFlag: true,
            sortOrder: 20
        });
        console.log("   ✅ Added Values:", val1.lookupCode, val2.lookupCode);

        // 3. List All Types (New Method)
        console.log("\n[3] Listing All Lookup Types...");
        const allTypes = await referenceDataService.getAllLookupTypes();
        const found = allTypes.find(t => t.id === newType.id);
        if (found) {
            console.log(`   ✅ Found newly created type in list of ${allTypes.length} types`);
        } else {
            throw new Error("Newly created type not found in getAllLookupTypes()");
        }

        // 4. Get Type By ID (New Method)
        console.log("\n[4] Getting Type By ID...");
        const typeById = await referenceDataService.getLookupTypeById(newType.id);
        if (typeById && typeById.lookupType === typeCode) {
            console.log("   ✅ Retrieved Type by ID successfully");
        } else {
            throw new Error("Failed to retrieve type by ID");
        }

        // 5. Cleanup
        console.log("\n[5] Cleanup...");
        // (Optional: In a real test env we would delete, but we'll leave it for now or implement delete)
        console.log("   ⚠️ Cleanup skipped (keeping test data for inspection)");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

verifyPhase9RefData();
