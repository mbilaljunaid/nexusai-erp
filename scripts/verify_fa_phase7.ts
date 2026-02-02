
import { faService } from "../server/services/fixedAssets";
import { db } from "../server/db";
import { faAssets, faAssetBooks, faCategories, faPhysicalInventory, faInventoryScans } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyFaPhase7() {
    console.log("🚀 Starting Fixed Assets Phase 7 Verification...");

    // 1. Setup Test Asset with Location
    const [cat] = await db.select().from(faCategories).limit(1);
    const bookId = cat.bookId;

    const asset = await faService.createAsset({
        assetNumber: `SCAN-TEST-${Date.now()}`,
        description: "Physical Scan Test",
        categoryId: cat.id,
        bookId: bookId,
        originalCost: "1000.00",
        recoverableCost: "1000.00",
        datePlacedInService: new Date()
    });

    const [ab] = await db.select().from(faAssetBooks).where(eq(faAssetBooks.assetId, asset.id));
    await db.update(faAssetBooks).set({ locationId: "BLDG-A" }).where(eq(faAssetBooks.id, ab.id));

    // 2. Start Inventory Cycle (L3)
    console.log("\n--- 1. Starting Physical Inventory Cycle ---");
    const inventory = await faService.createPhysicalInventory({
        inventoryName: "2026 Q1 Physical Audit",
        description: "Standard quarterly audit",
        createdBy: "audit-user"
    });
    console.log(`Created Inventory Cycle: ${inventory.inventoryName}`);

    // 3. Record Scans (L3)
    console.log("\n--- 2. Recording Asset Scans ---");

    // Scan A: Match
    console.log("Recording Scan A (Match)...");
    const scanA = await faService.recordAssetScan(inventory.id, asset.id, {
        scannedLocationId: "BLDG-A",
        condition: "GOOD",
        scannedBy: "tech-scout"
    });
    console.log(`Scan A Status: ${scanA.reconciliationStatus}`);

    // Scan B: Mismatch
    console.log("Recording Scan B (Mismatch)...");
    const scanB = await faService.recordAssetScan(inventory.id, asset.id, {
        scannedLocationId: "BLDG-B", // Different from BLDG-A
        condition: "DAMAGED",
        scannedBy: "tech-scout"
    });
    console.log(`Scan B Status: ${scanB.reconciliationStatus}`);

    // 4. Reconcile Cycle (L3)
    console.log("\n--- 3. Reconciling Inventory Cycle ---");
    await faService.reconcileInventory(inventory.id);
    const [finalInv] = await db.select().from(faPhysicalInventory).where(eq(faPhysicalInventory.id, inventory.id));
    console.log(`Final Inventory Status: ${finalInv.status}`);

    if (finalInv.status === "RECONCILED") {
        console.log("✅ Physical Inventory Reconciliation successful.");
    }

    console.log("\n🚀 Phase 7 Verification Complete!");
}

verifyFaPhase7().catch(console.error).then(() => process.exit(0));
