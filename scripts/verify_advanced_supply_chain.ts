import "dotenv/config";
import { orderManagementService } from "../server/modules/order/OrderManagementService";
import { dropShipService } from "../server/modules/order/DropShipService";
import { procurementService } from "../server/modules/scm/ProcurementService";
import { fulfillmentService } from "../server/modules/order/FulfillmentService";
import { reservationService } from "../server/modules/order/ReservationService";
import { backToBackService } from "../server/modules/order/BackToBackService";
import { manufacturingService } from "../server/services/ManufacturingService";
import { db } from "../server/db";
import { omOrderHeaders, omOrderLines } from "../shared/schema/order_management";
import { cstTransactions } from "../shared/schema/costing";
import { eq } from "drizzle-orm";


async function verifyDropShip() {
    console.log("\n🚀 1. Verifying Drop Ship Integration...");
    try {
        // ... (existing drop ship logic) ...
        const headerData = {
            customerId: "CUST-DS-001",
            currency: "USD",
            orderType: "DROP_SHIP"
        };
        const linesData = [
            { itemId: "ITEM-DS-A", description: "Drop Ship Item A", orderedQuantity: 5, unitSellingPrice: 100 }
        ];

        const order = await orderManagementService.createOrder({ header: headerData, lines: linesData });
        console.log(`   Order Created: ${order.orderNumber} (${order.orderType})`);

        await orderManagementService.bookOrder(order.id);
        console.log("   Order Booked.");

        const result = await dropShipService.generateDropShipPO(order.id);
        if (!result.success) throw new Error(`Failed to generate PO: ${result.message}`);

        console.log(`   PO Generated: ${result.poNumber}`);

        const [po] = await procurementService.getPurchaseOrder(result.poId);
        if (!po) throw new Error("PO not found in database.");

        console.log(`   ✅ PO Found: ${po.orderNumber}`);
        return true;
    } catch (e) {
        console.error("❌ DROP SHIP FAILED:", e);
        return false;
    }
}

async function verifyCOGS() {
    console.log("\n🚀 2. Verifying COGS Integration...");
    try {
        // 1. Create Standard Order
        const order = await orderManagementService.createOrder({
            header: { customerId: "CUST-COGS-001", orderType: "STANDARD" },
            lines: [{ itemId: "ITEM-COGS-A", orderedQuantity: 10, unitSellingPrice: 50 }]
        });
        console.log(`   Order Created: ${order.orderNumber}`);

        await orderManagementService.bookOrder(order.id);

        // 2. Reserve
        const lines = await db.query.omOrderLines.findMany({ where: eq(omOrderLines.headerId, order.id) });
        const lineIds = lines.map(l => l.id);

        for (const line of lines) {
            await reservationService.reserveInventory(line.id, Number(line.orderedQuantity), 'WH-001');
        }
        console.log("   Inventory Reserved.");

        // 3. Pick & Ship
        await fulfillmentService.pickLines(lineIds);

        await fulfillmentService.shipLines(lineIds);
        console.log("   Order Shipped (Triggering COGS).");

        // 4. Verify COGS Transaction
        const cogs = await db.select().from(cstTransactions)
            .where(eq(cstTransactions.sourceId, order.id))
            .execute();

        if (cogs.length === 0) throw new Error("No COGS transaction found.");
        console.log(`   ✅ COGS Recorded: $${cogs[0].totalCost} for Item ${cogs[0].itemId}`);
        return true;
    } catch (e) {
        console.error("❌ COGS FAILED:", e);
        return false;
    }
}

async function verifyBackToBack() {
    console.log("\n🚀 3. Verifying Back-to-Back (Make Order)...");
    try {
        // 1. Create Make Order
        const order = await orderManagementService.createOrder({
            header: { customerId: "CUST-MTO-001", orderType: "MAKE_TO_ORDER" },
            lines: [{ itemId: "ITEM-MTO-A", orderedQuantity: 20 }]
        });
        console.log(`   Order Created: ${order.orderNumber}`);

        await orderManagementService.bookOrder(order.id);

        // 2. Generate Work Order
        const result = await backToBackService.generateWorkOrders(order.id);
        if (!result.success) throw new Error(`WO Generation Failed: ${result.message}`);

        console.log(`   Work Orders Generated: ${result.workOrders.length}`);

        // 3. Verify WO in DB
        // listWorkOrders in ManufacturingService has a subquery that fails if inventory missing.
        // We verify directly against DB to confirm creation success.

        const { productionOrders } = await import("../shared/schema");
        const wos = await db.select().from(productionOrders)
            .where(eq(productionOrders.orderNumber, result.workOrders[0].orderNumber));

        if (wos.length === 0) throw new Error("WO created but not found in DB?");

        const generatedWo = wos[0];
        console.log(`   ✅ Work Order Created: ${generatedWo.orderNumber}, Status: ${generatedWo.status}`);
        return true;

    } catch (e) {
        console.error("❌ BACK-TO-BACK FAILED:", e);
        return false;
    }
}

async function run() {
    const ds = await verifyDropShip();
    const cogs = await verifyCOGS();
    const b2b = await verifyBackToBack();

    if (ds && cogs && b2b) {
        console.log("\n✅ ALL ADVANCED SUPPLY CHAIN TESTS PASSED");
        process.exit(0);
    } else {
        process.exit(1);
    }
}


run();
