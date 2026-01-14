
import { db } from "../db";
import {
    costAnomalies,
    productionOrders,
    productionTransactions,
    bom,
    bomItems,
    standardCosts,
    routingOperations,
    resources
} from "../../shared/schema";
import { eq, and, sql, sum } from "drizzle-orm";

export class CostAnomalyService {

    /**
     * Detect anomalies for a Production Order
     * logic: 
     * 1. Efficiency: Actual Resource Time vs Routing Standard
     * 2. Usage: Actual Material vs BOM Standard
     * 3. Scrap: Scrap quantity exceeds threshold
     */
    async detectProductionAnomalies(orderId: string) {
        const order = await db.query.productionOrders.findFirst({
            where: eq(productionOrders.id, orderId)
        });

        if (!order) return;

        // 1. Efficiency Check (Labor/Machine)
        await this.checkEfficiencyAnomaly(order);

        // 2. Scrap Check
        await this.checkScrapAnomaly(order);
    }

    private async checkEfficiencyAnomaly(order: any) {
        // Fetch actual MOVE/COMPLETE transactions to get yield
        // This is a simplified version for MVP
        const transactions = await db.select().from(productionTransactions)
            .where(and(
                eq(productionTransactions.productionOrderId, order.id),
                eq(productionTransactions.transactionType, "MOVE")
            ));

        // In a real system, we'd compare timestamp deltas or explicit duration fields
        // For now, let's assume we flag if any MOVE quantity is suspiciously low/high per event
    }

    private async checkScrapAnomaly(order: any) {
        const scrapTransactions = await db.select({
            totalScrap: sum(productionTransactions.quantity).mapWith(Number)
        }).from(productionTransactions)
            .where(and(
                eq(productionTransactions.productionOrderId, order.id),
                eq(productionTransactions.transactionType, "SCRAP")
            ));

        const totalScrap = scrapTransactions[0]?.totalScrap || 0;
        const totalProduced = order.quantity || 1;

        if (totalScrap / totalProduced > 0.05) {
            await db.insert(costAnomalies).values({
                targetType: "PRODUCTION_ORDER",
                targetId: order.id,
                anomalyType: "SCRAP_EXCESS",
                severity: "HIGH",
                description: `High scrap rate detected: ${(totalScrap / totalProduced * 100).toFixed(1)}% (Threshold: 5%)`,
                status: "PENDING"
            });
        }
    }

    /**
     * Detect IPV (Invoice Price Variance)
     */
    async detectInvoiceVariances(invoiceId: string, invoiceLines: any[]) {
        for (const line of invoiceLines) {
            // Compare line.unitPrice vs PO line.unitPrice
            const variance = Number(line.priceVariance || 0);
            const standardPrice = Number(line.poUnitPrice || 1);

            if (Math.abs(variance) / standardPrice > 0.10) {
                await db.insert(costAnomalies).values({
                    targetType: "PURCHASE_ORDER",
                    targetId: line.purchaseOrderId || "UNKNOWN",
                    anomalyType: "IPV_VARIANCE",
                    severity: variance > 0 ? "HIGH" : "MEDIUM",
                    description: `Significant IPV detected: ${(Math.abs(variance) / standardPrice * 100).toFixed(1)}% variance.`,
                    status: "PENDING"
                });
            }
        }
    }
}

export const costAnomalyService = new CostAnomalyService();
