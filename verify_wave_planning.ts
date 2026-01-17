
import "dotenv/config";
import { db } from "./server/db";
import { wmsWaves, wmsTasks, inventoryOrganizations, omOrderHeaders, omOrderLines } from "./shared/schema/scm";
// Note: omOrderHeaders/Lines might be in a different export if split files. 
// I previously saw them in 'order_management.ts'. 
// I will try to import from there if this fails, or use 'index.ts' if it aggregates.
// But given the tsconfig mapping @shared/schema/* -> ./shared/schema/*, I should import directly.
import { wmsWaveService } from "./server/modules/inventory/wms-wave.service";
import { eq } from "drizzle-orm";

// Fix imports: reusing inspect table logic, I know omOrderHeaders are likely not in SCM export.
// Let's rely on moduleResolution to fail if wrong, but I'll add the specific import to be safe.
// Wait, I can't double import. I'll rely on the previous assumption or user might have index.ts exporting all.
// Actually, earlier I imported from "@shared/schema/order_management" in the service file. I should do the same here.
// But I can't mix imports easily in one Step if I don't know the file content of index.ts.
// I will assume they are available via strict paths.

import { omOrderHeaders as omHeaders, omOrderLines as omLines } from "./shared/schema/order_management";

async function verifyWavePlanning() {
    console.log("🌊 Starting Wave Planning Verification...");

    try {
        // 1. Setup: Ensure Org
        const [org] = await db.insert(inventoryOrganizations)
            .values({ code: "ORG-WAVE-" + Date.now(), name: "Wave Test Org" })
            .onConflictDoUpdate({ target: inventoryOrganizations.code, set: { active: true } }) // simplified upsert
            .returning();
        const warehouseId = org.id; // or org.code? Service uses warehouseId column which I mapped to org.id in my mind, but schema says varchar.

        console.log("   ✅ Org Set:", warehouseId);

        // 2. Setup: Create Eligible Order
        const [order] = await db.insert(omHeaders).values({
            orderNumber: "ORD-WAVE-" + Date.now(),
            orgId: "some-org", // Sales Org
            warehouseId: warehouseId, // Fulfillment Warehouse
            status: "BOOKED",
            customerName: "Test Customer",
            customerId: "CUST-" + Date.now(), // Fake ID
            currency: "USD"
        }).returning();

        const [line] = await db.insert(omLines).values({
            headerId: order.id,
            orgId: "some-org", // Add Org ID
            lineNumber: 1,
            itemId: "ITEM-UUID-placeholder", // We don't check Item FK in Order Lines usually (loose coupling or valid item needed). 
            // If strict FK, we need valid item. wmsTasks needs valid item.
            // Let's create an item too to be safe.
            status: 'AWAITING_FULFILLMENT',
            quantity: "5",
            unitPrice: "10",
            amount: "50",
            orderedQuantity: "5"
        }).returning();

        console.log("   ✅ Order Created:", order.orderNumber);

        // 3. Create Wave
        console.log("3. Generating Wave...");
        const result = await wmsWaveService.createWave({
            warehouseId: warehouseId,
            limit: 10
        });

        console.log("   ✅ Wave Created:", result.wave.waveNumber, "with lines:", result.lineCount);

        if (result.lineCount !== 1) throw new Error("Expected 1 line in wave");

        // 4. Verify Tasks
        console.log("4. Verifying Wave Tasks...");
        const tasks = await db.select().from(wmsTasks)
            .where(eq(wmsTasks.sourceDocId, result.wave.id));

        if (tasks.length === 1 && tasks[0].status === 'PENDING') {
            console.log("   ✅ Task Created and Linked:", tasks[0].taskNumber);
        } else {
            throw new Error("Task creation failed or mismatch");
        }

        // 5. Release Wave
        console.log("5. Releasing Wave...");
        const releasedWave = await wmsWaveService.releaseWave(result.wave.id);
        console.log("   ✅ Wave Status:", releasedWave.status);

        if (releasedWave.status !== 'RELEASED') throw new Error("Wave release failed");

        console.log("✅ Wave Planning Verification PASSED");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyWavePlanning();
