
import { db } from "../server/db";
import { maintWorkOrders, maintWorkOrderCosts, faAssets, faBooks, faAssetBooks, faTransactions } from "../shared/schema/index";
import { eq, and } from "drizzle-orm";

async function verify() {
    console.log("🔍 Verifying Overhaul Capitalization Phase F...");

    // 1. Ensure Asset and Book exist
    let [asset] = await db.select().from(faAssets).limit(1);
    if (!asset) {
        console.error("❌ No assets found.");
        process.exit(1);
    }

    let [book] = await db.select().from(faBooks).limit(1);
    if (!book) {
        console.log("🌱 Creating seed book...");
        [book] = await db.insert(faBooks).values({
            bookCode: "CORP_VERIFY",
            description: "Verification Corporate Book",
            ledgerId: "USD-1",
            depreciationCalendar: "MONTHLY"
        }).returning();
    }

    // 2. Ensure Asset Book Record
    let [assetBook] = await db.select().from(faAssetBooks).where(and(eq(faAssetBooks.assetId, asset.id), eq(faAssetBooks.bookId, book.id))).limit(1);
    if (!assetBook) {
        console.log("🌱 Creating asset book entry...");
        [assetBook] = await db.insert(faAssetBooks).values({
            assetId: asset.id,
            bookId: book.id,
            datePlacedInService: new Date(),
            originalCost: "10000.00",
            recoverableCost: "10000.00",
            lifeYears: 5,
            method: "STL"
        }).returning();
    }

    const initialCost = Number(assetBook.originalCost);
    console.log(`💰 Initial Asset Cost: ${initialCost}`);

    // 3. Create CAPITAL Work Order
    console.log("🏗️ Creating CAPITAL Overhaul Work Order...");
    const [wo] = await db.insert(maintWorkOrders).values({
        workOrderNumber: `CV-CAP-OVERHAUL-${Date.now()}`,
        description: "Full Engine Overhaul",
        assetId: asset.id,
        type: "CAPITAL",
        status: "DRAFT"
    }).returning();

    // 4. Add Costs
    await db.insert(maintWorkOrderCosts).values({
        workOrderId: wo.id,
        costType: "MATERIAL",
        description: "Rebuild Kit",
        totalCost: "2500.00"
    });

    await db.insert(maintWorkOrderCosts).values({
        workOrderId: wo.id,
        costType: "LABOR",
        description: "Expert Technician Hours",
        totalCost: "1500.00"
    });

    console.log("✅ Costs added: $4,000.00 total.");

    // 5. Complete Work Order (Triggers Capitalization)
    console.log("🏁 Completing Work Order...");
    const { maintenanceService } = await import("../server/services/MaintenanceService");
    await maintenanceService.updateWorkOrderStatus(wo.id, "COMPLETED");

    // 6. Verify Book Value Update
    const [updatedBook] = await db.select().from(faAssetBooks).where(eq(faAssetBooks.id, assetBook.id));
    const finalCost = Number(updatedBook.originalCost);
    console.log(`💰 Updated Asset Cost: ${finalCost}`);

    if (finalCost === initialCost + 4000) {
        console.log("✨ Verification Successful: Asset Book Value increased by $4,000.");
    } else {
        console.error(`❌ Verification Failed: Cost mismatch. Expected ${initialCost + 4000}, got ${finalCost}`);
        process.exit(1);
    }

    // 7. Verify Transaction Record
    const [tx] = await db.select().from(faTransactions).where(eq(faTransactions.reference, `WO-${wo.id}`));
    if (tx && Number(tx.amount) === 4000) {
        console.log(`✨ Verification Successful: Transaction ${tx.transactionType} recorded for $${tx.amount}.`);
    } else {
        console.error("❌ Verification Failed: Transaction record missing or incorrect.");
        process.exit(1);
    }

    process.exit(0);
}

verify();
