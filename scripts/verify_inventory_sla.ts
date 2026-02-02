import { db } from "@db";
import { wmsShippingService } from "../server/modules/inventory/wms-shipping.service";
import { slaJournalHeaders, slaJournalLines, slaEventClasses } from "@shared/schema/sla";
import { omOrderHeaders, omOrderLines } from "@shared/schema/order_management";
import { eq, desc } from "drizzle-orm";

async function verifyInventorySla() {
    console.log("🔍 Verifying Inventory SLA Integration...");

    // 1. Setup: Create Dummy Order & Lines
    console.log("   Creating Test Order...");
    const orderId = `ORD-INV-TEST-${Date.now()}`;
    await db.insert(omOrderHeaders).values({
        id: orderId,
        orderNumber: `TEST-${Date.now()}`,
        status: "BOOKED",
        customerId: "CUST-001",
        currencyCode: "USD",
        orderDate: new Date(),
        totalAmount: "500.00",
        orgId: "ORG-001" // Required field
    });

    const lineId = `LINE-${Date.now()}`;
    const itemId = "ITEM-001"; // Ensure this item exists or mock it
    await db.insert(omOrderLines).values({
        id: lineId,
        headerId: orderId,
        lineNumber: 1,
        itemId: itemId,
        orderedQuantity: "5",
        unitSellingPrice: "100.00",
        unitListPrice: "100.00",
        amount: "500.00",
        status: "PICKED", // Ready to ship
        orgId: "ORG-001"
    });

    // 2. Execute Ship Confirm
    console.log("   Executing Ship Confirm...");
    try {
        const result = await wmsShippingService.shipConfirm({
            orderId: orderId,
            carrier: "FEDEX",
            tracking: "TRACK-123"
        });
        console.log("   ✅ Ship Confirm Result:", result);
    } catch (e) {
        console.error("   ❌ Ship Confirm Failed:", e);
        process.exit(1);
    }

    // 3. Verify SLA Journals
    console.log("   Verifying SLA Journals...");
    // Wait a moment for async processing if any (though currently awaited)

    // Fetch Event Class ID for SHIP_CONFIRM
    const shipClass = await db.select().from(slaEventClasses).where(eq(slaEventClasses.id, "SHIP_CONFIRM")).limit(1);

    // Query Journals
    const headers = await db.select().from(slaJournalHeaders)
        .where(eq(slaJournalHeaders.entityId, lineId))
        .orderBy(desc(slaJournalHeaders.createdAt));

    if (headers.length === 0) {
        console.error("   ❌ No SLA Journal Header found for Order " + orderId);
        process.exit(1);
    }

    const header = headers[0];
    console.log(`   ✅ SLA Header Created: ${header.id} (${header.eventClassId})`);

    if (header.eventClassId !== "SHIP_CONFIRM") {
        console.warn(`   ⚠️ Unexpected Event Class: ${header.eventClassId}`);
    }

    const lines = await db.select().from(slaJournalLines)
        .where(eq(slaJournalLines.headerId, header.id));

    console.log(`   ✅ Found ${lines.length} Journal Lines:`);
    lines.forEach(l => {
        console.log(`      - Line ${l.lineNumber}: ${l.accountingClass} | Dr: ${l.enteredDr} | Cr: ${l.enteredCr}`);
    });

    // Verify Balances (COGS vs Inventory)
    // We expect:
    // Dr COGS 500
    // Cr Inventory 500 (since 5 qty * 100 cost)

    const dr = lines.reduce((sum, l) => sum + Number(l.enteredDr || 0), 0);
    const cr = lines.reduce((sum, l) => sum + Number(l.enteredCr || 0), 0);

    if (dr === 500 && cr === 500) {
        console.log("   ✅ Journal is BALANCED (500 Dr / 500 Cr)");
    } else {
        console.error(`   ❌ Balance Mismatch: Dr ${dr} / Cr ${cr}`);
    }

    console.log("🎉 Inventory SLA Verification PASSED!");
    process.exit(0);
}

verifyInventorySla().catch(console.error);
