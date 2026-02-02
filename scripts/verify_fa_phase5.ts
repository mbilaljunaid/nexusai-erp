
import { faService } from "../server/services/fixedAssets";
import { db } from "../server/db";
import { faAssets, faAssetBooks, faRetirements, faTransfers, faCategories } from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function verifyFaPhase5() {
    console.log("🚀 Starting Fixed Assets Phase 5 Verification...");

    // Fetch a real category and book from DB
    const [cat] = await db.select().from(faCategories).limit(1);
    if (!cat) throw new Error("No categories found in DB");

    const bookId = cat.bookId;
    const categoryId = cat.id;

    // 1. Setup Test Asset
    console.log("\n--- 1. Setting up Test Asset ---");
    const asset = await faService.createAsset({
        assetNumber: `TEST-PH5-${Date.now()}`,
        description: "Phase 5 Test Asset",
        categoryId: categoryId,
        bookId: bookId,
        originalCost: "5000.00",
        recoverableCost: "5000.00",
        datePlacedInService: new Date()
    });
    console.log(`Created Asset: ${asset.assetNumber}`);

    // 2. Test Transfer (L3)
    console.log("\n--- 2. Testing Asset Transfer (L3) ---");
    const [ab] = await db.select().from(faAssetBooks).where(and(eq(faAssetBooks.assetId, asset.id), eq(faAssetBooks.bookId, bookId)));

    const transferResult = await faService.transferAsset(ab.id, {
        toLocationId: "LOC-WAREHOUSE",
        toCcid: "600-001",
        description: "Moving to Warehouse"
    });

    const [updatedAb] = await db.select().from(faAssetBooks).where(eq(faAssetBooks.id, ab.id));
    if (updatedAb.locationId === "LOC-WAREHOUSE" && updatedAb.ccid === "600-001") {
        console.log("✅ Asset Transfer successful (Current state updated).");
    } else {
        console.error("❌ Asset Transfer failed (Current state mismatch).");
    }

    const [transferLog] = await db.select().from(faTransfers).where(eq(faTransfers.assetBookId, ab.id));
    if (transferLog) {
        console.log("✅ Asset Transfer history record created.");
    }

    // 3. Test Retirement & Approval (L11)
    console.log("\n--- 3. Testing Retirement Approval (L11) ---");
    const retirement = await faService.retireAsset(asset.id, {
        bookId: bookId,
        retirementDate: new Date(),
        proceeds: 1000,
        removalCost: 100
    });

    if (retirement.approvalStatus === "PENDING") {
        console.log("✅ Retirement created with PENDING status.");
    }

    const approvedRet = await faService.approveRetirement(retirement.id, "system-admin");
    if (approvedRet.approvalStatus === "APPROVED" && approvedRet.approvedBy === "system-admin") {
        console.log("✅ Retirement Approval successful.");
    }

    // 4. Test Reinstate (L3)
    console.log("\n--- 4. Testing Reinstate (L3) ---");
    const reinstateResult = await faService.reinstateAsset(retirement.id, "system-admin");
    const [abAfterReinstate] = await db.select().from(faAssetBooks).where(eq(faAssetBooks.id, ab.id));

    if (abAfterReinstate.status === "ACTIVE") {
        console.log("✅ Asset Reinstatement successful (Status back to ACTIVE).");
    } else {
        console.error("❌ Asset Reinstatement failed.");
    }

    console.log("\n🚀 Phase 5 Verification Complete!");
}

verifyFaPhase5().catch(console.error).then(() => process.exit(0));
