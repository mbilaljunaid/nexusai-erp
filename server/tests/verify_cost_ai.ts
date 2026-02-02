
import { costAnomalyService } from "../services/CostAnomalyService";
import { db } from "../db";
import { productionOrders, costAnomalies, productionTransactions } from "../../shared/schema";
import { eq } from "drizzle-orm";

async function verifyCostAi() {
    console.log("🚀 Starting Cost AI Verification...");

    try {
        // 1. Setup Mock Production Order with high scrap
        const [order] = await db.insert(productionOrders).values({
            orderNumber: `TEST-WO-AI-${Date.now()}`,
            quantity: 100,
            status: "in_progress"
        }).returning();

        console.log(`✅ Created test order: ${order.orderNumber}`);

        // Record high scrap (10% which is > 5% threshold)
        await db.insert(productionTransactions).values({
            productionOrderId: order.id,
            transactionType: "SCRAP",
            quantity: "11",
            productId: "test-product-id"
        });

        console.log("✅ Recorded excessive scrap transaction (11%).");

        // 2. Trigger Detection
        await costAnomalyService.detectProductionAnomalies(order.id);
        console.log("✅ Detection engine triggered.");

        // 3. Verify Anomaly Record
        const detected = await db.query.costAnomalies.findFirst({
            where: eq(costAnomalies.targetId, order.id)
        });

        if (detected && detected.anomalyType === "SCRAP_EXCESS" && detected.severity === "HIGH") {
            console.log("🎊 SUCCESS: Cost Anomaly correctly detected and logged!");
            console.log(`   Type: ${detected.anomalyType}`);
            console.log(`   Description: ${detected.description}`);
        } else {
            console.error("❌ FAILED: Anomaly was not detected or the type/severity is wrong.");
        }

        // 4. Verify IPV rule
        console.log("Testing IPV rule...");
        await costAnomalyService.detectInvoiceVariances("mock-inv-id", [
            { purchaseOrderId: "PO-123", poUnitPrice: 100, priceVariance: 25 } // 25% IPV
        ]);

        const ipvDetected = await db.query.costAnomalies.findFirst({
            where: eq(costAnomalies.anomalyType, "IPV_VARIANCE")
        });

        if (ipvDetected) {
            console.log("🎊 SUCCESS: IPV Variance correctly detected!");
        } else {
            console.error("❌ FAILED: IPV Variance not detected.");
        }

    } catch (e) {
        console.error("❌ Verification failed with error:", e);
    } finally {
        process.exit(0);
    }
}

verifyCostAi();
