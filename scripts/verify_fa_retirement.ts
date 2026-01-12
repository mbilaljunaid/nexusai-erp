
import { faService } from "../server/services/fixedAssets";
import { db } from "../server/db";
import { faAssets, faBooks, faCategories, faDepreciationHistory, faRetirements } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyFaRetirement() {
    console.log("Verifying FA Retirement Logic...");

    try {
        // 1. Setup Master Data (Book & Category)
        console.log("Setting up Test Book & Category...");

        // Use insert and ignore if exists or just create new ones for this test
        const [book] = await db.insert(faBooks).values({
            bookCode: "RETIRE_BOOK_" + Date.now(),
            description: "Retirement Test Book",
            ledgerId: "PRIMARY",
            depreciationCalendar: "MONTHLY"
        }).returning();

        const [cat] = await db.insert(faCategories).values({
            majorCategory: "EQUIPMENT",
            minorCategory: "GENERAL",
            assetCostAccountCcid: "101.10.1520.000",
            deprExpenseAccountCcid: "101.10.6000.000",
            accumDeprAccountCcid: "101.10.1521.000",
            defaultLifeYears: 5,
            defaultMethod: "STL",
            bookId: book.id
        }).returning();


        const assetNumber = "RETIRE-TEST-" + Date.now();
        const asset = await faService.createAsset({
            assetNumber,
            description: "Asset for Retirement Test",
            originalCost: "10000.00",
            recoverableCost: "10000.00",
            bookId: book.id,
            categoryId: cat.id,
            datePlacedInService: new Date(),
            method: "STL",
            lifeYears: 5
        });

        // Seed depr history soNBV calc works (1 month depr = 10000/60 = 166.67)
        await db.insert(faDepreciationHistory).values({
            assetId: asset.id,
            bookId: book.id,
            periodName: "JAN-2026",
            amount: "166.67",
            ytdDepreciation: "166.67",
            accumulatedDepreciation: "166.67",
            netBookValue: "9833.33"
        });

        // 2. Perform Retirement
        console.log("Retiring asset...");
        const retirement = await faService.retireAsset(asset.id, {
            retirementDate: new Date(),
            proceeds: 5000,
            removalCost: 500
        });

        console.log("Retirement Record:", retirement);

        // NBV = 10000 - 166.67 = 9833.33
        // Gain/Loss = 5000 - 500 - 9833.33 = -5333.33
        const expectedGainLoss = 5000 - 500 - 9833.33;
        console.log(`Gain/Loss: ${retirement.gainLossAmount} (Expected: ${expectedGainLoss.toFixed(2)})`);

        if (Math.abs(Number(retirement.gainLossAmount) - expectedGainLoss) > 0.01) {
            throw new Error("Gain/Loss calculation mismatch");
        }

        // 3. Verify Asset Status
        const [updatedAsset] = await db.select().from(faAssets).where(eq(faAssets.id, asset.id));
        console.log("Asset Status:", updatedAsset.status);
        if (updatedAsset.status !== "RETIRED") {
            throw new Error("Asset status was not updated to RETIRED");
        }

        console.log("✅ FA Retirement Verification Successful!");
    } catch (err) {
        console.error("Verification failed:", err);
        process.exit(1);
    }
}

verifyFaRetirement().then(() => process.exit(0));
