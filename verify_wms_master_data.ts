
import "dotenv/config";
import { db } from "./server/db";
import { wmsZones, inventoryOrganizations } from "./shared/schema/scm";
import { wmsMasterDataService } from "./server/modules/inventory/wms-master-data.service";
import { eq } from "drizzle-orm";

async function verifyMasterData() {
    console.log("🧠 Verifying WMS Master Data Services...");

    try {
        // 1. Setup Org
        const [org] = await db.insert(inventoryOrganizations)
            .values({ code: "ORG-MD-" + Date.now(), name: "Master Data Test Org" })
            .returning();
        const warehouseId = org.id;

        // 2. Create Zone (Service Level)
        console.log("   Creating Zone...");
        const newZone = await wmsMasterDataService.createZone({
            warehouseId,
            zoneCode: "MD-TEST-Z1",
            zoneName: "Test Zone",
            zoneType: "STORAGE",
            priority: 1
        });
        console.log("   ✅ Created Zone: " + newZone.zoneCode);

        // 3. List Zones
        const zones = await wmsMasterDataService.listZones(warehouseId);
        if (zones.length !== 1) throw new Error("List failed");
        console.log("   ✅ List Zones: Found " + zones.length);

        // 4. Update Zone
        const updated = await wmsMasterDataService.updateZone(newZone.id, { zoneName: "Updated Name" });
        if (updated.zoneName !== "Updated Name") throw new Error("Update failed");
        console.log("   ✅ Update Zone: Name changed");

        // 5. Delete Zone
        await wmsMasterDataService.deleteZone(newZone.id);
        const check = await wmsMasterDataService.listZones(warehouseId);
        if (check.length !== 0) throw new Error("Delete failed");
        console.log("   ✅ Delete Zone: Confirmed empty");

        console.log("🎉 Master Data Verification SUCCESSFUL");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyMasterData();
