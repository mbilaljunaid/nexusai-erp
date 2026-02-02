import { db } from "../../../db";
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
    productionTransactions,
    ppmExpenditureItems,
    ppmExpenditureTypes,
    type InsertPpmExpenditureItem
} from "@shared/schema";
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
        quantity: number
    ) {
        // 1. Fetch WO to get Product ID
        const wo = await db.query.productionOrders.findFirst({
            columns: { productId: true }, // Optimized fetch
            where: eq(productionOrders.id, orderId)
        });

        if (!wo || !wo.productId) {
            console.error(`[MfgCosting] Work Order ${orderId} has no product. Wip skipped.`);
            return;
        }

        const productId = wo.productId;

        // 2. Get Standard Cost of the item involved
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

    // --- PJM INTEGRATION ---

    async processProjectCosting(transactionId: string) {
        const [trx] = await db.select({
            id: productionTransactions.id,
            type: productionTransactions.transactionType,
            date: productionTransactions.transactionDate,
            quantity: productionTransactions.quantity,
            cost: productionTransactions.actualCost,
            resourceId: productionTransactions.resourceId,
            woId: productionTransactions.productionOrderId,
            projectId: productionOrders.projectId,
            taskId: productionOrders.taskId
        })
            .from(productionTransactions)
            .innerJoin(productionOrders, eq(productionOrders.id, productionTransactions.productionOrderId))
            .where(eq(productionTransactions.id, transactionId));

        if (!trx || !trx.projectId || !trx.taskId) return;

        // Determine Expenditure Type
        let expTypeName = "Material";
        if (trx.type === "RESOURCE_CHARGING" || trx.resourceId) {
            expTypeName = "Manufacturing Labor";
        } else if (trx.type === "MATERIAL_ISSUE") {
            expTypeName = "Manufacturing Material";
        } else if (trx.type === "OVERHEAD") {
            expTypeName = "Manufacturing Overhead";
        }

        // Fetch or Create Exp Type
        let [expType] = await db.select().from(ppmExpenditureTypes).where(eq(ppmExpenditureTypes.name, expTypeName)).limit(1);
        if (!expType) {
            [expType] = await db.insert(ppmExpenditureTypes).values({
                name: expTypeName,
                unitOfMeasure: "Currency",
                description: "Generated from Manufacturing"
            }).returning();
        }

        // Calculate Cost (Fail safe 0 if missing)
        const costAmount = trx.cost ? trx.cost.toString() : "0";
        if (parseFloat(costAmount) === 0) return;

        // Create PPM Expenditure Item
        await db.insert(ppmExpenditureItems).values({
            taskId: trx.taskId,
            expenditureTypeId: expType.id,
            expenditureItemDate: trx.date || new Date(),
            quantity: trx.quantity.toString(),
            unitCost: (parseFloat(costAmount) / trx.quantity).toFixed(4),
            rawCost: costAmount,
            burdenedCost: costAmount,
            transactionSource: "MANUFACTURING",
            transactionReference: trx.id,
            denomCurrencyCode: "USD",
            status: "UNCOSTED",
            capitalizationStatus: "NOT_APPLICABLE"
        });
    }
}

export const manufacturingCostingService = new ManufacturingCostingService();
