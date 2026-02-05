
import "dotenv/config";
import { db } from "../server/db";
import { itemService } from "../server/services/ItemService";
import { egpSystemItems } from "../shared/schema/pim";
import { eq } from "drizzle-orm";

async function verifyPhase11PIM() {
    console.log("Starting MDM Phase 11 (Product Information Management) Verification...");

    try {
        const testItemNumber = `TEST-ITEM-${Date.now()}`;

        // 1. Create Item
        console.log(`\n[1] Creating Item: ${testItemNumber}...`);
        const item = await itemService.createItem({
            itemNumber: testItemNumber,
            itemName: "Verification Product",
            description: "A test item for verification.",
            primaryUomCode: "EA",
            itemType: "GOODS",
            organizationId: "GLOBAL"
        });
        console.log("   ✅ Created Item. ID:", item.id);

        // 2. Add Category
        console.log("\n[2] Adding Category...");
        await itemService.addCategory({
            itemId: item.id,
            categoryName: "Test Category",
            categorySet: "DEFAULT"
        });
        console.log("   ✅ Category Linked.");

        // 3. Confirm Linking (Get Query)
        console.log("\n[3] Verifying Item Retrieval...");
        const retrieved = await itemService.getItemById(item.id);
        if (retrieved && retrieved.categories && retrieved.categories.length > 0) {
            console.log("   ✅ Item Retrieved with Categories:", retrieved.categories.length);
        } else {
            throw new Error("Failed to retrieve associated categories.");
        }

        // 4. Test Search
        console.log("\n[4] Testing Search...");
        const searchResults = await itemService.searchItems(testItemNumber);
        if (searchResults.length > 0) {
            console.log("   ✅ Found item via search.");
        } else {
            throw new Error("Search failed to find new item.");
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

verifyPhase11PIM();
