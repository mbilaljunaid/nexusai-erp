
import { itemService } from "../server/services/ItemService";
import { procurementService } from "../server/modules/scm/services/ProcurementService";
import { orderManagementService } from "../server/modules/order/OrderManagementService";
import { db } from "../server/db";
import { egpSystemItems } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting MDM Phase 15 (PIM Integration) Verification...");

    // 1. Setup: Create a Test Item
    console.log("\n[1] Creating Test Item in PIM...");
    const itemNumber = `INT-TEST-${Date.now()}`;
    const newItem = await itemService.createItem({
        itemNumber: itemNumber,
        itemName: "Integration Test Widget " + itemNumber,
        description: "A widget for testing OM/PO integration",
        primaryUomCode: "EA",
        itemType: "GOODS",
        itemStatus: "ACTIVE",
        organizationId: "GLOBAL",
        revision: "A"
    } as any);

    if (!newItem) throw new Error("Failed to create item");
    console.log(`   ✅ Item Created: ${newItem.itemNumber} (ID: ${newItem.id})`);

    // 2. Test Procurement Integration
    console.log("\n[2] Testing PO Creation with PIM Item...");
    const po = await procurementService.createPurchaseOrder({
        header: {
            orderNumber: `PO-${Date.now()}`,
            supplierId: "SUP-001" // Mock
        },
        lines: [
            {
                itemId: newItem.id,
                quantity: 100,
                unitPrice: 10.50,
                amount: 1050,
                // description: purposefully omitted to test auto-population
            } as any
        ]
    });

    // Fetch lines to verify description
    const poLines = await db.query.purchaseOrderLines.findMany({
        where: (lines, { eq }) => eq(lines.poHeaderId, po.id)
    });

    if (poLines[0].description === newItem.itemName) {
        console.log("   ✅ PO Line Description auto-populated from PIM.");
    } else {
        console.error(`   ❌ PO Line Description mismatch. Expected '${newItem.itemName}', got '${poLines[0].description}'`);
        process.exit(1);
    }

    // 3. Test Order Management Integration
    console.log("\n[3] Testing Sales Order Creation with PIM Item...");
    try {
        const order = await orderManagementService.createOrder({
            header: {
                customerId: "CUST-001", // Mock
                orderType: "STANDARD"
            },
            lines: [
                {
                    itemId: newItem.id,
                    orderedQuantity: 5,
                    unitSellingPrice: 50.00
                    // uom: omitted to test auto-population
                }
            ]
        });

        const orderLines = await db.query.omOrderLines.findMany({
            where: (lines, { eq }) => eq(lines.headerId, order.id)
        });

        if (orderLines[0].uom === "EA") {
            console.log("   ✅ Order Line UOM auto-populated from PIM.");
        } else {
            console.error(`   ❌ Order Line UOM mismatch. Expected 'EA', got '${orderLines[0].uom}'`);
        }

        console.log("   ✅ Sales Order created successfully.");

    } catch (e: any) {
        console.error("   ❌ Failed to create Sales Order:", e.message);
        process.exit(1);
    }

    // 4. Test Invalid Item
    console.log("\n[4] Testing Validation (Invalid Item)...");
    try {
        await orderManagementService.createOrder({
            header: { customerId: "CUST-001" },
            lines: [{ itemId: "INVALID-UUID-123", orderedQuantity: 1, unitSellingPrice: 10 }]
        });
        console.error("   ❌ Expected validation error for invalid item, but got success.");
        process.exit(1);
    } catch (e: any) {
        if (e.message.includes("not found")) {
            console.log("   ✅ Caught invalid item error correctly.");
        } else {
            console.error("   ❌ Unexpected error message:", e.message);
        }
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

main().catch(console.error);
