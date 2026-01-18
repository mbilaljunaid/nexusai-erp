
import { db } from "@db";
import { lcmCharges, lcmShipmentLines, lcmTradeOperations, lcmCostComponents } from "@shared/schema/lcm";
import { eq, and, sql, desc } from "drizzle-orm";

export class LcmAiService {

    /**
     * Predicts Landed Costs for a target Trade Operation based on historical averages.
     * Simple V1 Algorithm: Weighted Average of Cost-Per-Weight or Cost-Per-Qty.
     */
    async predictCosts(tradeOpId: string) {
        // 1. Get Target Trade Op Details (Need Total Weight/Qty)
        const targetLines = await db.select().from(lcmShipmentLines).where(eq(lcmShipmentLines.tradeOperationId, tradeOpId));
        if (targetLines.length === 0) throw new Error("No lines in this Trade Op to predict for.");

        const totalWeight = targetLines.reduce((sum, line) => sum + (Number(line.netWeight) || 0), 0);
        const totalQty = targetLines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);

        // 2. Fetch Historical ACTUAL Charges from CLOSED Operations
        // For V1, we just look at ALL Trade Ops that have Actual charges.
        // Enhance V2: Filter by Route or Carrier.

        const history = await db.select({
            componentId: lcmCharges.costComponentId,
            basis: lcmCostComponents.allocationBasis,
            amount: lcmCharges.amount,
            opId: lcmCharges.tradeOperationId
        })
            .from(lcmCharges)
            .innerJoin(lcmCostComponents, eq(lcmCharges.costComponentId, lcmCostComponents.id))
            .where(eq(lcmCharges.isActual, true)); // Only learn from actuals

        if (history.length < 1) return { predictions: [], message: "Not enough historical data." };

        // 3. Calculate Rate per Component (e.g. Freight = $0.50 / KG)
        const rateMap = new Map<string, { totalRate: number, count: number }>();

        // We need to fetch the totals for the historical Ops to calculate the rate
        // Optimization: Pre-fetch line totals for all relevant Ops in one query or loop. 
        // For V1 simplicity: Loop (beware N+1, but low volume for MVP).

        for (const record of history) {
            // Get Op totals
            const opLines = await db.select().from(lcmShipmentLines).where(eq(lcmShipmentLines.tradeOperationId, record.opId));
            const opWeight = opLines.reduce((sum, line) => sum + (Number(line.netWeight) || 0), 0);
            const opQty = opLines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);

            let rate = 0;
            if (record.basis === 'WEIGHT' && opWeight > 0) rate = Number(record.amount) / opWeight;
            else if (record.basis === 'QUANTITY' && opQty > 0) rate = Number(record.amount) / opQty;
            else if (record.basis === 'VALUE') rate = 0; // Value basis prediction harder without PO price, skip for now

            if (rate > 0) {
                const current = rateMap.get(record.componentId) || { totalRate: 0, count: 0 };
                rateMap.set(record.componentId, { totalRate: current.totalRate + rate, count: current.count + 1 });
            }
        }

        // 4. Transform Rates to Predictions for Target Op
        const predictions = [];
        for (const [compId, stats] of rateMap.entries()) {
            const avgRate = stats.totalRate / stats.count;

            // Get component details to know basis again
            const comp = await db.select().from(lcmCostComponents).where(eq(lcmCostComponents.id, compId)).limit(1);
            if (!comp[0]) continue;

            let predictedAmount = 0;
            if (comp[0].allocationBasis === 'WEIGHT') predictedAmount = avgRate * totalWeight;
            else if (comp[0].allocationBasis === 'QUANTITY') predictedAmount = avgRate * totalQty;

            if (predictedAmount > 0) {
                predictions.push({
                    costComponentId: compId,
                    componentName: comp[0].name,
                    predictedAmount: predictedAmount.toFixed(2),
                    confidence: "High", // Placeholder
                    basisUsed: comp[0].allocationBasis,
                    avgRate: avgRate.toFixed(4)
                });
            }
        }

        return { predictions };
    }
}

export const lcmAiService = new LcmAiService();
