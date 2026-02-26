import "dotenv/config";
import { db } from "./server/db";
import { apSuppliers } from "@shared/schema";
import { purchaseOrders, purchaseOrderLines } from "@shared/schema/scm";

async function run() {
    try {
        const sup = await db.select().from(apSuppliers).limit(1);
        if (sup.length === 0) throw new Error("No suppliers");

        const [po] = await db.insert(purchaseOrders).values({
            supplierId: sup[0].id,
            totalAmount: "1000.00",
            status: "APPROVED",
            buyerId: 1,
            orderNumber: "PO-" + Date.now()
        }).returning();

        await db.insert(purchaseOrderLines).values({
            poHeaderId: po.id,
            lineNumber: 1,
            unitPrice: "100.00",
            quantity: 10,
            amount: "1000.00"
        });

        console.log(`[TEST_HOOK] SEEDED_PO_ID=${po.id}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
