
import { db } from "../server/db";
import { faService } from "../server/services/fixedAssets";
import { faBooks, faCategories, faAssets, faDepreciationHistory, faTransactions } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyFaLifecycle() {
    console.log("Starting FA Lifecycle Verification...");

    // 0. Cleanup
    console.log("Cleaning up old test data...");
    await db.delete(faTransactions);
    await db.delete(faDepreciationHistory);
    await db.delete(faAssets);
    await db.delete(faCategories);
    await db.delete(faBooks);

    try {
        // 1. Setup Master Data (Book & Category)
        console.log("Creating Test Book & Category...");
        const [book] = await db.insert(faBooks).values({
            bookCode: "CORP_TEST",
            description: "Corporate Test Book",
            ledgerId: "PRIMARY",
            depreciationCalendar: "MONTHLY"
        }).returning();

        const [category] = await db.insert(faCategories).values({
            majorCategory: "COMPUTERS",
            minorCategory: "LAPTOPS",
            assetCostAccountCcid: "101.10.1520.000",
            deprExpenseAccountCcid: "101.10.6000.000",
            accumDeprAccountCcid: "101.10.1521.000",
            defaultLifeYears: 5,
            defaultMethod: "STL",
            bookId: book.id
        }).returning();

        // 2. Create Asset (Manual Addition)
        console.log("Creating Asset...");
        const asset = await faService.createAsset({
            assetNumber: "AST-10001",
            description: "MacBook Pro M4",
            tagNumber: "TAG-999",
            bookId: book.id,
            categoryId: category.id,
            datePlacedInService: new Date("2026-01-01"),
            originalCost: "12000", // 12,000 USD
            recoverableCost: "12000",
            lifeYears: 1, // Short life for testing (12 months)
            method: "STL"
        });
        console.log(`Asset Created: ${asset.assetNumber} (Cost: ${asset.originalCost})`);

        // 3. Run Depreciation for Jan-26
        console.log("Running Depreciation for Jan-26...");
        const periodEnd = new Date("2026-01-31");
        const results = await faService.runDepreciation(book.id, "Jan-26", periodEnd);

        if (results.length === 0) throw new Error("Depreciation run returned no results");
        const history = results[0];
        console.log(`Depreciation Calculated: ${history.amount} (Expected 1000.00)`);

        // 4. Verification Logic
        if (Number(history.amount) !== 1000.00) {
            throw new Error(`Depreciation calculation incorrect. Got ${history.amount}, expected 1000.00`);
        }

        // Verify NBV
        if (Number(history.netBookValue) !== 11000.00) {
            throw new Error(`NBV calculation incorrect. Got ${history.netBookValue}, expected 11000.00`);
        }

        // Verify Transaction Log
        const txns = await db.select().from(faTransactions).where(eq(faTransactions.assetId, asset.id));
        console.log(`Transactions found: ${txns.length} (Expected 2: ADDITION + DEPRECIATION)`);

        if (txns.length !== 2) throw new Error("Transaction log mismatch");

        console.log("✅ FA Lifecycle Verification Successful!");

    } catch (err) {
        console.error("❌ Verification Failed:", err);
        process.exit(1);
    } finally {
        await db.delete(faTransactions);
        await db.delete(faDepreciationHistory);
        await db.delete(faAssets);
        await db.delete(faCategories);
        await db.delete(faBooks);
        process.exit(0);
    }
}

// Run directly
verifyFaLifecycle();
