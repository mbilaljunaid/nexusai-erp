
import { faService } from "../server/services/fixedAssets";
import { db } from "../server/db";
import { faMassAdditions, faAssets, faBooks, faCategories } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyFaMassAdditions() {
    console.log("Verifying FA Mass Additions Workflow...");

    try {
        // 1. Setup: Create Book and Category for posting
        const [book] = await db.insert(faBooks).values({
            bookCode: "MASS_BOOK_" + Date.now(),
            description: "Mass Additions Test Book",
            ledgerId: "PRIMARY",
            depreciationCalendar: "MONTHLY"
        }).returning();

        const [category] = await db.insert(faCategories).values({
            majorCategory: "FURNITURE",
            minorCategory: "CHAIRS",
            assetCostAccountCcid: "101.10.1520.000",
            deprExpenseAccountCcid: "101.10.6000.000",
            accumDeprAccountCcid: "101.10.1521.000",
            defaultLifeYears: 5,
            defaultMethod: "STL",
            bookId: book.id
        }).returning();

        // 2. Prepare: "Scan" for new additions
        console.log("Scanning for mass additions...");
        const scanResult = await faService.prepareMassAdditions();
        console.log("Scan result:", scanResult);

        const [item] = await db.select().from(faMassAdditions).where(eq(faMassAdditions.status, "QUEUE")).limit(1);
        if (!item) throw new Error("No mass addition item found in QUEUE");

        // 3. Post to Asset
        console.log(`Posting item ${item.id} to assets...`);
        const assetNumber = "MASS-AST-" + Date.now();
        const asset = await faService.postMassAddition(item.id, {
            bookId: book.id,
            categoryId: category.id,
            assetNumber: assetNumber
        });

        console.log("Created Asset:", asset.assetNumber);

        // 4. Verify Status
        const [updatedItem] = await db.select().from(faMassAdditions).where(eq(faMassAdditions.id, item.id));
        if (updatedItem.status !== "POSTED") {
            throw new Error(`Mass addition status not updated to POSTED. Got: ${updatedItem.status}`);
        }
        if (updatedItem.createdAssetId !== asset.id) {
            throw new Error("Missing link to created asset");
        }

        console.log("✅ FA Mass Additions Verification Successful!");
    } catch (err) {
        console.error("Verification failed:", err);
        process.exit(1);
    }
}

verifyFaMassAdditions().then(() => process.exit(0));
