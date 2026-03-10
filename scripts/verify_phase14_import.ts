
import "dotenv/config";
import { bulkImportService } from "../server/services/BulkImportService";
import { partyService } from "../server/services/PartyService";
import { itemService } from "../server/services/ItemService";

async function verifyPhase14() {
    console.log("Starting MDM Phase 14 (Bulk Import) Verification...");

    try {
        // [1] Test Party Import (Success)
        console.log("\n[1] Testing Party Import...");
        const partyCsv = `partyName,partyType
Test Bulk Party 1,ORGANIZATION
Test Bulk Party 2,PERSON`;

        const partyResult = await bulkImportService.processImport("PARTY", partyCsv);
        console.log(`   Processed ${partyResult.total} rows. Success: ${partyResult.success}, Failed: ${partyResult.failed}`);

        if (partyResult.failed > 0) {
            console.error("Errors:", JSON.stringify(partyResult.errors, null, 2));
            throw new Error("Expected 0 failures for valid Party CSV");
        }

        // Verify DB
        const parties = await partyService.searchParties("Test Bulk Party 1");
        if (parties.length === 0) throw new Error("Bulk Party 1 not found in DB");
        console.log("   ✅ Parties imported successfully.");


        // [2] Test Item Import (Success)
        console.log("\n[2] Testing Item Import...");
        const itemCsv = `itemNumber,itemName,uomCode
BULK-ITEM-001,Bulk Widget A,EA
BULK-ITEM-002,Bulk Widget B,BOX`;

        const itemResult = await bulkImportService.processImport("ITEM", itemCsv);
        console.log(`   Processed ${itemResult.total} rows. Success: ${itemResult.success}, Failed: ${itemResult.failed}`);

        if (itemResult.failed > 0) throw new Error("Expected 0 failures for valid Item CSV");

        // Verify DB
        const items = await itemService.searchItems("BULK-ITEM-001");
        if (items.length === 0) throw new Error("Bulk Item 1 not found in DB");
        console.log("   ✅ Items imported successfully.");


        // [3] Test Import Validation (Failure)
        console.log("\n[3] Testing Validation Failures...");
        const invalidCsv = `partyName,partyType
Valid Party,ORGANIZATION
,PERSON`; // Missing name

        const errorResult = await bulkImportService.processImport("PARTY", invalidCsv);
        console.log(`   Processed ${errorResult.total} rows. Success: ${errorResult.success}, Failed: ${errorResult.failed}`);

        if (errorResult.failed !== 1) throw new Error("Expected 1 failure for invalid row");
        if (!errorResult.errors[0].reason.includes("Missing required fields")) throw new Error("Unexpected error message");
        console.log("   ✅ Validation logic confirmed (caught missing field).");


    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

verifyPhase14();
