
import { db } from "../db";
import { revenueRecognitions } from "../../shared/schema/revenue";
import { sql, and, gte, lte, eq } from "drizzle-orm";
import { subMonths, addMonths, startOfMonth, format } from "date-fns";

export class RevenueForecastingService {

    /**
     * Generate 6-month Revenue Forecast using Linear Regression
     */
    async generateForecast(monthsToProject: number = 6, contractId?: string) {
        // 1. Fetch Historical Data (Last 12 Months)
        const endDate = new Date();
        const startDate = subMonths(endDate, 12);

        const conditions = [
            eq(revenueRecognitions.accountType, "Revenue"),
            gte(revenueRecognitions.scheduleDate, startDate),
            lte(revenueRecognitions.scheduleDate, endDate)
        ];

        if (contractId) {
            conditions.push(eq(revenueRecognitions.contractId, contractId));
        }

        const history = await db.select({
            period: revenueRecognitions.periodName,
            amount: sql<number>`sum(${revenueRecognitions.amount})`
        })
            .from(revenueRecognitions)
            .where(and(...conditions))
            .groupBy(revenueRecognitions.periodName, revenueRecognitions.scheduleDate)
            .orderBy(revenueRecognitions.scheduleDate);

        // Transform for Regression: x = month index (0-11), y = amount
        const dataPoints = history.map((h, index) => ({
            x: index,
            y: parseFloat(h.amount as any || 0),
            period: h.period
        }));

        // 2. Train Model (Simple Linear Regression: y = mx + c)
        const n = dataPoints.length;
        if (n < 2) return { history: dataPoints, forecast: [] }; // Not enough data

        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (const p of dataPoints) {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumXX += p.x * p.x;
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // 3. Project Future
        const forecast = [];
        for (let i = 1; i <= monthsToProject; i++) {
            const nextIndex = n - 1 + i;
            const projectedAmount = slope * nextIndex + intercept;
            const nextDate = addMonths(new Date(), i);

            forecast.push({
                period: format(nextDate, "MMM-yy"),
                amount: Math.max(0, projectedAmount), // No negative revenue forecast
                type: "Forecast"
            });
        }

        return {
            history,
            forecast,
            model: { slope, intercept }
        };
    }
}

export const revenueForecastingService = new RevenueForecastingService();
