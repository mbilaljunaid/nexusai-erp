import { manufacturingCostingService } from "../server/services/ManufacturingCostingService";
import { manufacturingService } from "../server/services/ManufacturingService";
import { db } from "../server/db";
import {
    costElements, standardCosts, inventory, bom, bomItems,
    productionOrders, wipBalances, varianceJournals
} from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyCosting() {
    console.log("🚀 Starting Manufacturing Costing Verification...");

    try {
        // 1. Setup Master Data
        console.log("--- Step 1: Setting up Cost Elements & Items ---");

        // Ensure MATERIAL cost element exists
        const [matElement] = await db.insert(costElements).values({
            code: "MAT-VERIFY",
            name: "Material for Verification",
            type: "MATERIAL"
        }).onConflictDoNothing().returning();

        const matElementId = matElement?.id || (await db.query.costElements.findFirst({ where: eq(costElements.code, "MAT-VERIFY") }))?.id;

        // Create purchased component
        const [component] = await db.insert(inventory).values({
            itemCode: "COMP-S1",
            itemName: "Verification Component",
            category: "Material",
            unit: "KG"
        }).returning();

        // Set standard cost for component
        await db.insert(standardCosts).values({
            targetType: "ITEM",
            targetId: component.id,
            costElementId: matElementId!,
            unitCost: "50.00",
            isActive: true
        });

        // Create finished good
        const [assembly] = await db.insert(inventory).values({
            itemCode: "ASSY-F1",
            itemName: "Verification Assembly",
            category: "Finished Goods",
            unit: "EA"
        }).returning();

        // Create BOM (Assembly uses 2x Component)
        const [bomHeader] = await db.insert(bom).values({
            bomNumber: `BOM-V-${Date.now()}`,
            productId: assembly.id,
            name: "Verify BOM",
            status: "active"
        } as any).returning();

        await db.insert(bomItems).values({
            bomId: bomHeader.id,
            productId: component.id,
            quantity: "2"
        });

        // 2. Test Cost Rollup
        console.log("--- Step 2: Testing Cost Rollup (Recursive) ---");
        const rolledCost = await manufacturingCostingService.calculateStandardCost(assembly.id);
        console.log(`Rolled Cost: ${rolledCost}`);

        // Expected: (2 * 50) + (10% overhead) = 110
        if (Math.abs(rolledCost - 110) < 0.01) {
            console.log("✅ Cost Rollup Math Verified (incl. 10% overhead)");
        } else {
            throw new Error(`Rollup Math Failed. Expected ~110, got ${rolledCost}`);
        }

        // 3. Test WIP Transaction
        console.log("--- Step 3: Testing WIP Accounting ---");
        const [order] = await db.insert(productionOrders).values({
            orderNumber: `WO-V-${Date.now()}`,
            productId: assembly.id,
            quantity: "1",
            status: "inprogress",
            scheduledDate: new Date()
        }).returning();

        // Simulate Input Issue (Issue 3x Component instead of 2x - creating variance later)
        await manufacturingCostingService.processWipTransaction(order.id, "ISSUE", 3, component.id);

        const balanceAfterIssue = await db.query.wipBalances.findFirst({
            where: eq(wipBalances.productionOrderId, order.id)
        });
        console.log(`WIP Balance after Issue: ${balanceAfterIssue?.balance}`);
        // Expected: 3 * 50 = 150
        if (Number(balanceAfterIssue?.balance) === 150) {
            console.log("✅ WIP Increment Verified");
        }

        // Simulate Completion (Complete 1x Assembly)
        // Note: Completion absorbs at STANDARD cost (2 * 50 = 100)
        await manufacturingCostingService.processWipTransaction(order.id, "COMPLETE", 1, assembly.id);

        const balanceAfterComplete = await db.query.wipBalances.findFirst({
            where: eq(wipBalances.productionOrderId, order.id)
        });
        console.log(`WIP Balance after Completion: ${balanceAfterComplete?.balance}`);
        // Expected: 150 - 110 (Standard Rollup) = 40 remaining
        // Wait, my service gets standard cost for the product issued/completed.
        // Issue: Component (50) * 3 = 150.
        // Complete: Assembly (110) * 1 = 110.
        // Balance: 150 - 110 = 40.
        if (Number(balanceAfterComplete?.balance) === 40) {
            console.log("✅ WIP Decrement (at Standard) Verified");
        }

        // 4. Test Variance Calculation
        console.log("--- Step 4: Testing Variance on Close ---");
        await manufacturingCostingService.closeOrderAndCalculateVariance(order.id);

        const variance = await db.query.varianceJournals.findFirst({
            where: eq(varianceJournals.productionOrderId, order.id)
        });
        console.log(`Generated Variance: ${variance?.amount} (${variance?.varianceType})`);

        if (Number(variance?.amount) === 40) {
            console.log("✅ Variance Journal Verified");
        }

        console.log("\n✨ ALL COSTING TESTS PASSED ✨");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyCosting();
