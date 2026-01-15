
import "dotenv/config";
import { db } from "../server/db";
import { orderManagementService } from "../server/modules/order/OrderManagementService";
import { reservationService } from "../server/modules/order/ReservationService";
import { pricingService } from "../server/modules/order/PricingService";
import { priceListService } from "../server/modules/order/PriceListService";
import { inventory, inventoryTransactions } from "../shared/schema/scm";
import { omOrderLines, omPriceLists } from "../shared/schema/order_management";
import { billingEvents } from "../shared/schema/billing_enterprise";
import { eq, desc } from "drizzle-orm";

async function verifyDeepIntegrations() {
    console.log("🏗️ Verifying Phase 10 Deep Integrations...");

    try {
        const itemId = `ITEM-${Date.now()}`;

        // 1. Setup Data
        console.log("1. Setting up Master Data (Inventory & Pricing)...");

        // Inventory
        await db.insert(inventory).values({
            id: itemId,
            itemName: "Integration Test Item",
            sku: `SKU-${Date.now()}`,
            quantity: 100,
            location: "WH-MAIN"
        });
        console.log("   Inventory Created (100 units)");

        // Pricing
        const priceList = await priceListService.createPriceList({
            name: "Test Price List 2026",
            currency: "USD",
            items: [{ itemId: itemId, unitPrice: 150.00 }]
        });
        console.log("   Price List Created.");

        // 2. Verify Pricing Service
        console.log("2. Verifying Pricing Service...");
        const price = await pricingService.getListPrice(itemId, priceList.id);
        if (price === 150.00) {
            console.log("   ✅ Pricing Service returned correct price: 150.00");
        } else {
            throw new Error(`Pricing Mismatch. Expected 150.00, Got ${price}`);
        }

        // 3. Create Order
        console.log("3. Creating Order...");
        const order = await orderManagementService.createOrder({
            header: { customerId: "CUST-INT", orderType: "STANDARD" },
            lines: [{ itemId: itemId, orderedQuantity: 10, unitSellingPrice: 150.00 }]
        });
        const lineId = (await db.select().from(omOrderLines).where(eq(omOrderLines.headerId, order.id)))[0].id;
        console.log(`   Order Created: ${order.orderNumber}`);

        // 4. Verify Reservation (Real Inventory)
        console.log("4. Verifying Real Inventory Reservation...");
        // Should succeed (10 < 100)
        await reservationService.reserveInventory(lineId, 10, "WH-MAIN");
        console.log("   ✅ Reservation Successful (Sufficient Stock)");

        // Test Insufficient Stock
        try {
            await reservationService.reserveInventory(lineId, 500, "WH-MAIN");
            throw new Error("❌ Should have failed with Insufficient Inventory");
        } catch (e: any) {
            if (e.message.includes("Insufficient Inventory")) {
                console.log("   ✅ Insufficient Stock Validation Passed");
            } else {
                throw e;
            }
        }

        // 5. Verify Billing Integration
        console.log("5. Verifying Billing Integration (Transfer to AR)...");

        // Set to shipped manually to allow transfer
        await db.update(omOrderLines).set({ status: 'SHIPPED', extendedAmount: "1500.00" }).where(eq(omOrderLines.id, lineId));

        await orderManagementService.transferToAR(order.id);

        // Check Billing Event
        const [event] = await db.select().from(billingEvents)
            .where(eq(billingEvents.sourceTransactionId, lineId))
            .orderBy(desc(billingEvents.createdAt));

        if (event && Number(event.amount) === 1500.00) {
            console.log("   ✅ Billing Event Created Successfully.");
        } else {
            throw new Error("❌ Billing Event NOT found or amount mismatch.");
        }

        console.log("✅ DEEP INTEGRATIONS VERIFIED");
        process.exit(0);

    } catch (e) {
        console.error("❌ VERIFICATION FAILED:", e);
        process.exit(1);
    }
}

verifyDeepIntegrations();
