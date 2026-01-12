
import { faService } from "../server/services/fixedAssets";
import { db } from "../server/db";
import { faBooks, faCategories } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyFaPhase3() {
    console.log("Starting Fixed Assets Phase 3 Verification...");

    try {
        // 1. Setup: Create a Book
        const bookCode = `P3_BOOK_${Date.now()}`;
        console.log(`Creating book ${bookCode}...`);
        const [book] = await db.insert(faBooks).values({
            bookCode,
            description: "Phase 3 Verification Book",
            ledgerId: "REV-TEST-LEDGER-V2", // Using an existing ledger to pass SLA validation
            depreciationCalendar: "MONTHLY"
        }).returning();

        // 2. Setup: Create a Category
        // ... (rest of category stays same)
        const [category] = await db.insert(faCategories).values({
            bookId: book.id,
            majorCategory: "VEHICLES",
            minorCategory: "TRUCKS",
            assetCostAccountCcid: "1001",
            deprExpenseAccountCcid: "5001",
            accumDeprAccountCcid: "1002",
            defaultLifeYears: 5,
            defaultMethod: "STL"
        }).returning();

        // 3. Create Asset
        console.log("Creating Asset...");
        const asset = await faService.createAsset({
            assetNumber: `TRK-${Date.now()}`,
            description: "Delivery Truck - Verification",
            categoryId: category.id,
            bookId: book.id,
            periodName: "JAN-2026", // Added
            datePlacedInService: new Date("2026-01-01"),
            originalCost: "60000.00",
            recoverableCost: "60000.00"
        });

        // ... (runDepreciation stays same)
        await faService.runDepreciation(book.id, "JAN-2026", new Date("2026-01-31"));

        // 5. Verify Roll Forward Report
        console.log("Verifying Roll Forward Report (JAN-2026)...");
        const report = await faService.getRollForwardReport(book.id, "JAN-2026");
        console.log("Report Findings:", JSON.stringify(report, null, 2));

        if (report.length === 0) throw new Error("Roll Forward Report is empty");
        const categoryReport = report[0];
        if (Number(categoryReport.additions) !== 60000) throw new Error(`Additions mismatch: ${categoryReport.additions}`);

        // 6. Retire Asset
        console.log("Retiring Asset...");
        await faService.retireAsset(asset.id, {
            bookId: book.id,
            retirementDate: new Date("2026-02-15"),
            periodName: "FEB-2026", // Added
            proceeds: 50000,
            removalCost: 1000
        });

        // 7. Verify Roll Forward for FEB-2026
        console.log("Verifying Roll Forward Report (FEB-2026)...");
        const reportFeb = await faService.getRollForwardReport(book.id, "FEB-2026");
        console.log("FEB Report:", JSON.stringify(reportFeb, null, 2));

        const retirementAmt = Number(reportFeb[0].retirements);
        if (retirementAmt === 0) throw new Error("Retirement amount not found in FEB report");

        console.log("✅ Fixed Assets Phase 3 Verification Successful!");
    } catch (err) {
        console.error("❌ Verification failed:", err);
        process.exit(1);
    }
}

verifyFaPhase3().then(() => process.exit(0));
