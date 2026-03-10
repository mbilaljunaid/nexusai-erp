
import { maintenanceService } from "../server/modules/maintenance/services/MaintenanceService";
import { faService } from "../server/services/fixedAssets";
import { db } from "../server/db";
import { faAssets, faCategories, faBooks, faAssetBooks, maintAssetsExtension, faTransactions, maintWorkOrders, maintWorkOrderOperations } from "../shared/schema";
import { eq } from "drizzle-orm";



async function verifyMaintenanceFoundation() {
    console.log("🛠️ Verifying Maintenance Foundation...");

    // 1. Setup Mock Asset (if not exists)
    const categoryId = "CAT-MAINT-TEST";
    const bookId = "BOOK-MAINT-TEST";

    // Clean previous run
    const existingAsset = await db.query.faAssets.findFirst({
        where: eq(faAssets.assetNumber, "ASSET-MAINT-001")
    });

    if (existingAsset) {
        console.log(`Cleaning up asset ${existingAsset.id}...`);
        // Delete extensions
        await db.delete(maintAssetsExtension).where(eq(maintAssetsExtension.assetId, existingAsset.id));

        // Delete Work Orders and Operations
        const wos = await db.select().from(maintWorkOrders).where(eq(maintWorkOrders.assetId, existingAsset.id));
        for (const wo of wos) {
            await db.delete(maintWorkOrderOperations).where(eq(maintWorkOrderOperations.workOrderId, wo.id));
            await db.delete(maintWorkOrders).where(eq(maintWorkOrders.id, wo.id));
        }

        // Delete dependent transactions first (Resolve Book IDs)
        const books = await db.select().from(faAssetBooks).where(eq(faAssetBooks.assetId, existingAsset.id));
        for (const book of books) {
            await db.delete(faTransactions).where(eq(faTransactions.assetBookId, book.id));
        }

        // Delete Asset Books
        await db.delete(faAssetBooks).where(eq(faAssetBooks.assetId, existingAsset.id));

        // Finally delete Asset
        await db.delete(faAssets).where(eq(faAssets.id, existingAsset.id));
    }


    // Create Category stub
    // (Assuming category exists or just ignore FK for verify if schema allows, 
    // but schema likely enforces FK. For simplicity, we might reuse an existing asset if possible, 
    // or create full chain. Let's create a minimal full chain.)

    // To avoid heavy setup, let's just use the service to create an asset 
    // FA Service createAsset requires categoryId.
    // We will assume "CORP-BOOK-1" and "CAT-FURNITURE" or similar exist from seed data?
    // Let's create our own unique ones to be safe

    // Create Book
    try {
        await db.insert(faBooks).values({
            id: bookId,
            bookCode: "MAINT_TEST_BOOK",
            description: "Maintenance Test Book",
            ledgerId: "L1",
            depreciationCalendar: "MONTHLY"
        }).onConflictDoNothing();

        // Create Category
        await db.insert(faCategories).values({
            id: categoryId,
            bookId: bookId,
            majorCategory: "MACHINERY",
            minorCategory: "HEAVY",
            defaultLifeYears: 10,
            assetCostAccountCcid: "123",
            deprExpenseAccountCcid: "456",
            accumDeprAccountCcid: "789"
        }).onConflictDoNothing();

        console.log("✅ Master Data Stubbed");

        const asset = await faService.createAsset({
            assetNumber: "ASSET-MAINT-001",
            description: "Drill Press 3000",
            categoryId: categoryId,
            bookId: bookId,
            datePlacedInService: new Date(),
            originalCost: "10000",
            recoverableCost: "10000",
            lifeYears: 10,
            method: "STL",
            periodName: "Jan-26"
        });

        console.log(`✅ Created Asset: ${asset.id}`);

        // 2. Create Work Order
        const wo = await maintenanceService.createWorkOrder({
            assetId: asset.id,
            description: "Replace Drill Bit and Lubricate",
            type: "PREVENTIVE",
            priority: "NORMAL",
            status: "DRAFT"
        });

        console.log(`✅ Created Work Order: ${wo.workOrderNumber} (${wo.status})`);

        // 3. Verify List
        const list = await maintenanceService.listWorkOrders();
        const found = list.data.find(w => w.id === wo.id);
        if (found) {
            console.log("✅ Verify List: Success");
        } else {
            console.error("❌ Verify List: Failed");
            process.exit(1);
        }

        // 4. Update Status
        const updated = await maintenanceService.updateWorkOrderStatus(wo.id, "RELEASED");
        if (updated.status === "RELEASED") {
            console.log("✅ Status Update: Success");
        } else {
            console.error("❌ Status Update: Failed");
            process.exit(1);
        }

        // 5. Asset Extension
        const ext = await maintenanceService.upsertAssetExtension({
            assetId: asset.id,
            criticality: "HIGH",
            maintainable: true,
            locationId: "LOC-A1"
        });

        if (ext[0].criticality === "HIGH") {
            console.log("✅ Asset Extension: Success");
        } else {
            console.error("❌ Asset Extension: Failed");
            process.exit(1);
        }

    } catch (e) {
        console.error("❌ Verification Failed:", e);
        process.exit(1);
    }
}

verifyMaintenanceFoundation()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
