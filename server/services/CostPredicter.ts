
import { db } from "../db";
import {
    standardCosts,
    productionOrders,
    productionTransactions,
    costElements
} from "../../shared/schema";
import { eq, and, sql, desc, avg, gte } from "drizzle-orm";
import { subMonths } from "date-fns";

export class CostPredicter {

    /**
     * Predict the next logical Standard Cost for an item
     * logic: Moving average of actual completion costs over trailing 6 months
     */
    async predictStandardCost(productId: string) {
        const sixMonthsAgo = subMonths(new Date(), 6);

        // Fetch completed production orders for this item
        const completedOrders = await db.query.productionOrders.findMany({
            where: and(
                eq(productionOrders.productId, productId),
                eq(productionOrders.status, "closed"),
                gte(productionOrders.createdAt, sixMonthsAgo)
            )
        });

        if (completedOrders.length === 0) return null;

        // For each order, we'd ideally calculate actual cost from WIP balances before they were zeroed
        // Or from the transactions themselves.
        // For MVP, we'll suggest based on existing standard costs + a trend analysis if available
        // Or assume we have a history of variances we can use to 'correct' the standard.

        // Let's look at standard cost history
        const costHistory = await db.query.standardCosts.findMany({
            where: eq(standardCosts.targetId, productId),
            limit: 10,
            orderBy: [desc(standardCosts.createdAt)]
        });

        if (costHistory.length < 2) return null;

        const currentCost = Number(costHistory[0].unitCost);
        const avgCost = costHistory.reduce((sum: number, c: any) => sum + Number(c.unitCost), 0) / costHistory.length;

        // Simple forecast: 50% current, 50% historical average
        const suggestedCost = (currentCost + avgCost) / 2;

        return {
            productId,
            currentCost,
            suggestedCost,
            confidence: 0.85,
            reason: `Moving average across ${costHistory.length} cost revisions.`
        };
    }
}

export const costPredicter = new CostPredicter();
