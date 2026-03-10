
import { anomalyDetectionService } from "../server/services/AnomalyDetectionService";
import { itemService } from "../server/services/ItemService";
import { procurementService } from "../server/modules/scm/services/ProcurementService";
import { db } from "../server/db";
import { purchaseOrders, purchaseOrderLines } from "../shared/schema";

async function main() {
    console.log("Starting MDM Phase 16 (AI Anomaly Detection) Verification...");

    // 1. Setup: Create Test Item
    console.log("\n[1] Creating Test Item...");
    const itemNumber = `ANOM-TEST-${Date.now()}`;
    const item = await itemService.createItem({
        itemNumber: itemNumber,
        itemName: "Anomaly Test Item " + itemNumber,
        itemStatus: "ACTIVE",
        primaryUomCode: "EA",
        // revision: "A" // Optional
        organizationId: "GLOBAL" // String
    } as any);

    if (!item) throw new Error("Failed to create item");

    // 2. Seed Normal Data (50 POs @ $10.00)
    console.log("\n[2] Seeding Normal Data (50 POs @ $10.00)...");
    const normalLines = Array.from({ length: 50 }).map((_, i) => ({
        itemId: item.id,
        quantity: 10,
        unitPrice: 10.00 + (Math.random() * 0.5), // Metric variation
        amount: 100
    }));

    const normalHeader = await procurementService.createPurchaseOrder({
        header: { orderNumber: `PO-NORM-${Date.now()}`, supplierId: "SUP-001" },
        lines: normalLines as any
    });

    // 3. Seed Anomaly (Price $100)
    console.log("\n[3] Seeding Anomaly (1 PO @ $100.00)...");
    const anomalyHeader = await procurementService.createPurchaseOrder({
        header: { orderNumber: `PO-ANOM-${Date.now()}`, supplierId: "SUP-001" },
        lines: [
            { itemId: item.id, quantity: 1, unitPrice: 100.00, amount: 100 }
        ]
    });

    // 4. Run Detection
    console.log("\n[4] Running Detection Service...");
    const anomalies = await anomalyDetectionService.analyzeProcurementPricing(item.id);

    console.log(`   Found ${anomalies.length} anomalies.`);

    // 5. Verify
    const specificAnomaly = anomalies.find(a => a.value === 100);

    if (specificAnomaly) {
        console.log(`   ✅ Successfully detected outlier value: ${specificAnomaly.value}`);
        console.log(`   📊 Z-Score: ${specificAnomaly.score} (Mean: ${specificAnomaly.mean})`);

        if (Math.abs(specificAnomaly.score) > 3) {
            console.log("   ✅ Z-Score > 3 confirmed.");
        } else {
            console.error("   ❌ Z-Score calculation suspicious (should be high).");
        }

    } else {
        console.error("   ❌ Failed to detect the $100.00 outlier.");
        console.log("Dump:", anomalies);
        process.exit(1);
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

main().catch(console.error);
