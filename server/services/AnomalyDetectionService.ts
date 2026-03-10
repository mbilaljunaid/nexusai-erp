
import { db } from "../db";
import { purchaseOrderLines } from "../../shared/schema/scm";
import { egpSystemItems } from "../../shared/schema/pim";
import { eq, sql, desc, avg, stddev } from "drizzle-orm";

export interface AnomalyResult {
    entityId: string;
    entityType: "PO_LINE" | "INVENTORY";
    field: "UNIT_PRICE" | "QUANTITY";
    value: number;
    score: number; // Z-Score
    mean: number;
    message: string;
}

export class AnomalyDetectionService {

    /**
     * Calculate Standard Deviation and Mean for a dataset, then find outliers.
     * Z = (X - Mean) / StdDev
     */
    detectOutliers(data: { id: string, value: number }[], threshold = 3): AnomalyResult[] {
        if (data.length < 5) return []; // Not enough data for stats

        const values = data.map(d => d.value);
        const n = values.length;
        const mean = values.reduce((a, b) => a + b, 0) / n;
        const variance = values.reduce((total, num) => total + Math.pow(num - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) return []; // No variance

        const anomalies: AnomalyResult[] = [];

        for (const item of data) {
            const zScore = (item.value - mean) / stdDev;
            if (Math.abs(zScore) > threshold) {
                anomalies.push({
                    entityId: item.id,
                    entityType: "PO_LINE", // Defaulting for this helper
                    field: "UNIT_PRICE", // Defaulting
                    value: item.value,
                    score: parseFloat(zScore.toFixed(2)),
                    mean: parseFloat(mean.toFixed(2)),
                    message: `Value ${item.value} is an anomaly (Z-Score: ${zScore.toFixed(2)}). Mean: ${mean.toFixed(2)}`
                });
            }
        }

        return anomalies;
    }

    /**
     * Analyze Purchase Order Unit Prices per Item
     * Returns list of outlier PO Lines.
     */
    async analyzeProcurementPricing(itemId?: string): Promise<AnomalyResult[]> {
        // Get all PO lines with price
        // Group by Item ID to calculating stats per item is more accurate, 
        // but for global "weirdness" we might check global deviation? 
        // No, price depends heavily on item.

        // Approach: 
        // 1. Fetch all items (or specific item if provided)
        // 2. For each item, fetch last 100 PO lines.
        // 3. Run Z-Score.

        const results: AnomalyResult[] = [];

        let itemsQuery = db.select({ id: egpSystemItems.id, itemNumber: egpSystemItems.itemNumber }).from(egpSystemItems);
        if (itemId) {
            itemsQuery.where(eq(egpSystemItems.id, itemId));
        }

        const items = await itemsQuery;

        for (const item of items) {
            const lines = await db.select({
                id: purchaseOrderLines.id,
                unitPrice: purchaseOrderLines.unitPrice
            })
                .from(purchaseOrderLines)
                .where(eq(purchaseOrderLines.itemId, item.id))
                .orderBy(desc(purchaseOrderLines.createdAt)) // Recent
                .limit(100);

            // Convert decimal string to number
            const data = lines.map(l => ({
                id: l.id,
                value: parseFloat(l.unitPrice as string || "0")
            }));

            // Filter out 0 or nulls if valid? Assuming price > 0
            const validData = data.filter(d => d.value > 0);

            const outliers = this.detectOutliers(validData);

            // Map types correctly
            outliers.forEach(o => {
                o.entityType = "PO_LINE";
                o.field = "UNIT_PRICE";
                o.message = `Item ${item.itemNumber}: ${o.message}`;
            });

            results.push(...outliers);
        }

        return results;
    }
}

export const anomalyDetectionService = new AnomalyDetectionService();
