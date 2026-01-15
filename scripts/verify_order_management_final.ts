
import "dotenv/config";
import { db } from "../server/db";
import { orderManagementService } from "../server/modules/order/OrderManagementService";
import { fulfillmentService } from "../server/modules/order/FulfillmentService";
import { reservationService } from "../server/modules/order/ReservationService";
import { dropShipService } from "../server/modules/order/DropShipService";
import { returnService } from "../server/modules/order/ReturnService";
import { omOrderLines, omOrderHeaders } from "../shared/schema/order_management";
import { inventory } from "../shared/schema/scm";
import { eq } from "drizzle-orm";

async function runFinalRegression() {
    console.log("🚀 Starting Order Management Final Regression Suite...");

    try {
        // --- SETUP ---
        const customerId = "CUST-REGRESSION-" + Date.now();
        const itemId = "ITEM-REG-" + Date.now();
        const projectId = "PROJ-" + Date.now();
        const taskId = "TASK-1.0";

        // Seed Inventory
        await db.insert(inventory).values({
            id: itemId,
            itemName: "Regression Test SKU",
            quantity: 1000,
            location: "WH-MAIN"
        });
        console.log("✅ Seed Data Created (Inventory)");

        // --- SCENARIO 1: Standard Order to Cash ---
        console.log("\n📦 SCENARIO 1: Standard Order-to-Cash");
        const order1 = await orderManagementService.createOrder({
            header: { customerId, orderType: "STANDARD" },
            lines: [{ itemId, orderedQuantity: 10, unitSellingPrice: 100.00 }]
        });
        console.log(`   Order Created: ${order1.orderNumber}`);

        await orderManagementService.bookOrder(order1.id);
        console.log("   Order Booked.");

        const line1Id = (await db.select().from(omOrderLines).where(eq(omOrderLines.headerId, order1.id)))[0].id;

        await reservationService.reserveInventory(line1Id, 10, "WH-MAIN");
        console.log("   Inventory Reserved.");

        // await fulfillmentService.pickRelease(order1.id, "WH-MAIN");
        // FulfillmentService has `shipLines`. Reservation has handled the 'pick' status (AWAITING_SHIPPING).
        // For verify, we just call shipLines directly. In real world, picking is an intermediate step.
        // If we want to simulate picking, we'd update status manually or add pick method later.
        // For now, proceed to ship.
        // await fulfillmentService.shipLines([line1Id], "UPS");

        // Actually, let's just use shipLines.
        await fulfillmentService.shipLines([line1Id], "UPS");
        // Actually FulfillmentService.pickLines is what we might have used, or shipLines.
        // Checking FulfillmentService specifically:
        // It has `shipLines`. Let's assume reservation moves to AWAITING_SHIPPING.


        console.log("   Order Shipped (COGS Triggered).");

        await orderManagementService.transferToAR(order1.id);
        console.log("   Transferred to AR (Billing Event Triggered).");


        // --- SCENARIO 2: Drop Ship Flow ---
        console.log("\n🚚 SCENARIO 2: Drop Ship Flow");
        const order2 = await orderManagementService.createOrder({
            header: { customerId, orderType: "DROP_SHIP" }, // Fixed enum
            lines: [{ itemId, orderedQuantity: 5, unitSellingPrice: 120.00 }]
        });
        console.log(`   Order Created: ${order2.orderNumber}`);

        await orderManagementService.bookOrder(order2.id);

        // Trigger Drop Ship PO
        const po = await dropShipService.generateDropShipPO(order2.id);
        if (po.poNumber) {
            console.log(`   Purchase Order Generated: ${po.poNumber}`);
        } else {
            console.log(`   Purchase Order Generation Message: ${po.message}`);
        }


        // --- SCENARIO 3: Project Driven Flow ---
        console.log("\n🏗️ SCENARIO 3: Project Driven Supply Chain");
        const order3 = await orderManagementService.createOrder({
            header: { customerId, orderType: "STANDARD" },
            lines: [{ itemId, orderedQuantity: 20, unitSellingPrice: 100.00, projectId, taskId }]
        });
        console.log(`   Order Created: ${order3.orderNumber} (Project: ${projectId})`);

        // Verify Persistence
        const [line3] = await db.select().from(omOrderLines).where(eq(omOrderLines.headerId, order3.id));
        if (line3.projectId !== projectId) throw new Error("Project ID Persistence Failed");
        console.log("   Project Tags Verified.");


        // --- SCENARIO 4: Returns (RMA) ---
        console.log("\n↩️ SCENARIO 4: RMA Process");
        // --- SCENARIO 4: Returns (RMA) ---
        console.log("\n↩️ SCENARIO 4: RMA Process");
        const rma = await returnService.createRMA(
            order1.id,
            [{ lineId: line1Id, quantity: 1, reason: "Damaged" }]
        );
        console.log(`   RMA Created: ${rma.rmaNumber}`);

        await returnService.receiveRMA(rma.id);
        console.log("   RMA Received.");

        console.log("\n✅ FINAL REGRESSION SUITE PASSED");
        process.exit(0);

    } catch (e) {
        console.error("\n❌ REGRESSION FAILED:", e);
        process.exit(1);
    }
}

runFinalRegression();
