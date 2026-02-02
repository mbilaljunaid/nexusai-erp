
import "dotenv/config";
import { db } from "../server/db";
import { WmsService } from "../server/services/WmsService";
import { omOrderHeaders, omOrderLines } from "../shared/schema/order_management";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting WMS Verification...");

    // 1. Create a Mock Order
    console.log("1. Creating Mock Order...");
    const [order] = await db.insert(omOrderHeaders).values({
        orderNumber: `ORD-${Date.now()}`,
        status: 'AWAITING_FULFILLMENT',
        customerId: 'CUST-001', // Mock
        orgId: 'ORG-001',
        currency: 'USD',
        totalAmount: "100.00",
        orderedDate: new Date()
    }).returning();

    const [line] = await db.insert(omOrderLines).values({
        headerId: order.id,
        lineNumber: 1,
        itemId: 'ITEM-001', // Mock
        orderedQuantity: "10",
        unitSellingPrice: "10.00",
        amount: "100.00",
        uom: 'EA',
        status: 'AWAITING_FULFILLMENT',
        orgId: 'ORG-001'
    }).returning();
    console.log(`   Order Created: ${order.orderNumber}`);

    // 2. Create Wave & Release
    console.log("2. Creating & Releasing Wave...");
    const wave = await WmsService.createWave({
        warehouseId: 'ORG-001',
        orderIds: [order.id]
    });
    console.log(`   Wave Created: ${wave.waveNumber}`);

    const tasks = await WmsService.releaseWave(wave.id, [order.id]);
    console.log(`   Tasks Generated: ${tasks.length}`);
    if (tasks.length === 0) throw new Error("No tasks generated!");

    // 3. Confirm Pick
    console.log("3. Confirming Pick...");
    const task = tasks[0];
    await WmsService.confirmPick(task.id, "USER-TEST", 10);
    console.log("   Pick Confirmed.");

    // 4. Verify Line Status
    const [updatedLine] = await db.select().from(omOrderLines).where(eq(omOrderLines.id, line.id));
    console.log(`   Line Status: ${updatedLine.status}`);
    if (updatedLine.status !== 'PICKED') throw new Error(`Line status expected PICKED, got ${updatedLine.status}`);

    // 5. Ship Order
    console.log("5. Shipping Order...");
    await WmsService.shipOrder(order.id);

    // 6. Verify Order Status
    const [updatedOrder] = await db.select().from(omOrderHeaders).where(eq(omOrderHeaders.id, order.id));
    console.log(`   Order Status: ${updatedOrder.status}`);
    if (updatedOrder.status !== 'SHIPPED') throw new Error(`Order status expected SHIPPED, got ${updatedOrder.status}`);

    console.log("SUCCESS: WMS Flow Verified.");
    process.exit(0);
}

main().catch(err => {
    console.error("FAILED:", err);
    process.exit(1);
});
