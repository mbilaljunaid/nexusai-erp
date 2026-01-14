import { db } from "../db";
import {
    costElements,
    standardCosts,
    overheadRules,
    wipBalances,
    varianceJournals,
    bom,
    bomItems,
    routings,
    routingOperations,
    resources,
    productionOrders,
    productionTransactions
} from "../../shared/schema";
import { eq, and, sum, sql } from "drizzle-orm";

export class ManufacturingCostingService {

    // --- STANDARD COST ENGINE ---

    // Recursively calculate and freeze standard cost for an item
    async calculateStandardCost(productId: string): Promise<number> {
        // 1. Get Material Cost (Recursion Base: Purchased Items have Manual Standard Cost)
        // For this MVP, we assume purchased items already have a 'MATERIAL' cost element entry.
        // If not, we might check a 'lastPurchasePrice' from Inventory, but for Standard Costing, it should be set.

        let totalMaterialCost = 0;

        // Check BOM for components
        const bomRecord = await db.query.bom.findFirst({
            where: eq(bom.productId, productId)
        });

        if (bomRecord) {
            const components = await db.query.bomItems.findMany({
                where: eq(bomItems.bomId, bomRecord.id)
            });

            for (const comp of components) {
                // Recursive call: Ensure component has a cost
                // Optimization: In real world, we'd cache or use a bottom-up approach to avoid N+1 recursion
                const compUnitCost = await this.getLatestStandardCost(comp.productId);
                totalMaterialCost += (Number(compUnitCost) * Number(comp.quantity));
            }
        } else {
            // No BOM -> Purchased Item. Return existing standard cost or 0.
            return await this.getLatestStandardCost(productId);
        }

        // 2. Get Resource Cost (Labor / Machine)
        let totalResourceCost = 0;
        const routingRecord = await db.query.routings.findFirst({
            where: eq(routings.productId, productId)
        });

        if (routingRecord) {
            const operations = await db.query.routingOperations.findMany({
                where: eq(routingOperations.routingId, routingRecord.id)
            });

            for (const op of operations) {
                if (op.resourceId) {
                    const resource = await db.query.resources.findFirst({
                        where: eq(resources.id, op.resourceId)
                    });

                    if (resource && resource.costPerHour) {
                        const setupCost = Number(resource.costPerHour) * (Number(op.setupTime || 0)); // Fixed per batch? Usually spread. Simplifying to unit for now or assuming per-unit run time dominance.
                        // Standard Cost is typically "Per Unit". Setup is usually depreciated over Batch Size.
                        // For MVP: Cost = (Run Time * Rate)
                        const runCost = Number(resource.costPerHour) * Number(op.runTime || 0);
                        totalResourceCost += runCost;
                    }
                }
            }
        }

        // 3. Get Overhead Cost (e.g. 10% of Material or Flat Rate)
        // Fetch rules (Mocking rule application for now)
        const overheadCost = totalMaterialCost * 0.10; // Simplified 10% overhead

        const totalCost = totalMaterialCost + totalResourceCost + overheadCost;

        // Freeze Cost
        // Note: Realistically we save breakdown keys. Here we save specific elements if we had IDs.
        // For level-cutoff, we will just update a "Total" record or assume we break it down.
        // Let's ensure we return the total.

        return totalCost;
    }

    private async getLatestStandardCost(targetId: string): Promise<number> {
        const cost = await db.query.standardCosts.findFirst({
            where: and(
                eq(standardCosts.targetId, targetId),
                eq(standardCosts.isActive, true)
            ),
            orderBy: (sc, { desc }) => [desc(sc.createdAt)]
        });
        return cost ? Number(cost.unitCost) : 0;
    }

    // --- WIP ACCOUNTING ENGINE ---

    async processWipTransaction(
        orderId: string,
        type: "ISSUE" | "COMPLETE" | "SCRAP",
        quantity: number,
        productId: string
    ) {
        // 1. Get Standard Cost of the item involved
        const unitCost = await this.getLatestStandardCost(productId);
        const totalValue = unitCost * quantity;

        if (type === "ISSUE") {
            // Dr WIP (Increase Balance)
            // Cr Inventory (Handled by Inventory Module)
            await this.updateWipBalance(orderId, totalValue, "INCREMENT");
        }
        else if (type === "COMPLETE") {
            // Dr Inventory (FG)
            // Cr WIP (Decrease Balance)
            await this.updateWipBalance(orderId, totalValue, "DECREMENT");
        }
    }

    private async updateWipBalance(orderId: string, amount: number, direction: "INCREMENT" | "DECREMENT") {
        // This relies on a 'General' WIP Cost Element for MVP. In reality, multiple buckets.
        // We find or create a balance record.

        // Find a default Material Cost Element for now
        const costElement = await db.query.costElements.findFirst({
            where: eq(costElements.type, "MATERIAL"),
            orderBy: (ce, { asc }) => [asc(ce.code)]
        });

        if (!costElement) return; // Should allow null?

        const existingBalance = await db.query.wipBalances.findFirst({
            where: and(
                eq(wipBalances.productionOrderId, orderId),
                eq(wipBalances.costElementId, costElement.id)
            )
        });

        const change = direction === "INCREMENT" ? amount : -amount;

        if (existingBalance) {
            await db.update(wipBalances)
                .set({
                    balance: (Number(existingBalance.balance) + change).toString(),
                    lastUpdated: new Date()
                })
                .where(eq(wipBalances.id, existingBalance.id));
        } else {
            await db.insert(wipBalances).values({
                productionOrderId: orderId,
                costElementId: costElement.id,
                balance: change.toString()
            });
        }
    }

    // --- VARIANCE ENGINE ---

    async closeOrderAndCalculateVariance(orderId: string) {
        // 1. Check remaining WIP balance
        const balances = await db.query.wipBalances.findMany({
            where: eq(wipBalances.productionOrderId, orderId)
        });

        for (const bal of balances) {
            const value = Number(bal.balance);
            if (Math.abs(value) > 0.01) {
                // Non-zero balance on close = Variance
                await db.insert(varianceJournals).values({
                    productionOrderId: orderId,
                    varianceType: value > 0 ? "USAGE_VARIANCE" : "YIELD_VARIANCE", // Simplification
                    amount: value.toString(),
                    description: `Closing variance for Order ${orderId}`,
                    glPosted: false
                });

                // Zero out WIP
                await db.update(wipBalances)
                    .set({ balance: "0" })
                    .where(eq(wipBalances.id, bal.id));
            }
        }
    }
}

export const manufacturingCostingService = new ManufacturingCostingService();
