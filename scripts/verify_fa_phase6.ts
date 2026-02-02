
import { faService } from "../server/services/fixedAssets";
import { db } from "../server/db";
import { faLeases, faAssetBooks, faCategories } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyFaPhase6() {
    console.log("🚀 Starting Fixed Assets Phase 6 Verification...");

    // 1. Test Lease PV Calculation (L4)
    console.log("\n--- 1. Testing Lease PV Calculation (IFRS 16) ---");
    const lease = await faService.createLease({
        leaseNumber: `LEASE-TEST-${Date.now()}`,
        description: "Office Building Lease",
        leaseType: "FINANCE",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2028-12-31"),
        termMonths: 36,
        monthlyPayment: "1000.00",
        interestRate: "5.00"
    });

    console.log(`PV of Payments calculated: ${lease.pvOfPayments}`);
    // Expected for 1000 pmt, 5% rate, 36 months: ~33365.69
    if (Math.abs(Number(lease.pvOfPayments) - 33365.69) < 1.0) {
        console.log("✅ IFRS 16 PV Calculation accurate.");
    } else {
        console.warn(`⚠️ PV Calculation mismatch. Got ${lease.pvOfPayments}, Expected ~33365.69`);
    }

    // 2. Test Advanced Depreciation (L3)
    console.log("\n--- 2. Testing Advanced Depreciation Methods ---");
    const [cat] = await db.select().from(faCategories).limit(1);
    const bookId = cat.bookId;

    // A. DB Method
    console.log("Setting up 200% DB Asset...");
    const dbAsset = await faService.createAsset({
        assetNumber: `DB-ASSET-${Date.now()}`,
        description: "DB Test",
        categoryId: cat.id,
        bookId: bookId,
        originalCost: "10000.00",
        recoverableCost: "10000.00",
        datePlacedInService: new Date(),
        method: "DB",
        lifeYears: 5,
        dbRate: "2.0" // 200% DB
    });

    // B. UOP Method
    console.log("Setting up UOP Asset...");
    const uopAsset = await faService.createAsset({
        assetNumber: `UOP-ASSET-${Date.now()}`,
        description: "UOP Test",
        categoryId: cat.id,
        bookId: bookId,
        originalCost: "20000.00",
        recoverableCost: "20000.00",
        datePlacedInService: new Date(),
        method: "UOP",
        totalUnits: "10000"
    });

    console.log("\nTriggering Depreciation Run for DB/UOP Assets...");
    const deprResult = await faService.runDepreciation(bookId, "APR-2026", new Date("2026-04-30"));
    console.log(deprResult.message);

    console.log("\n🚀 Phase 6 Verification Initiated (Check server logs for background worker results)!");
}

verifyFaPhase6().catch(console.error).then(() => process.exit(0));
