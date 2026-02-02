
import { db } from "../db";
import { salesQuotas, opportunities } from "../../shared/schema";
import { eq, and, gte, lte, or } from "drizzle-orm";
import { startOfQuarter, endOfQuarter, format } from "date-fns";

export class SalesForecastingService {

    static async getForecastSummary(userId: string, periodName?: string) {
        // 1. Determine Period Dates (Default to Current Quarter if not provided)
        // Note: periodName in Quotas is string-based "Q1-2026".
        // We'll rely on the user passing matching string or default to current.
        const now = new Date();
        const start = startOfQuarter(now);
        const end = endOfQuarter(now);

        const currentPeriodName = `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`;
        const targetPeriod = periodName || currentPeriodName;

        // 2. Fetch Quota
        const [quotaRecord] = await db.select()
            .from(salesQuotas)
            .where(and(
                eq(salesQuotas.userId, userId),
                eq(salesQuotas.periodName, targetPeriod)
            ));

        const quota = Number(quotaRecord?.quotaAmount || 0);

        // 3. Fetch Opportunities in Period
        // Filter: Owner = User AND CloseDate within Start/End of Quarter
        // Note: If targetPeriod is different from current, we'd need logic to parse "Q1-2026" to dates.
        // For MVP, if periodName is provided, we assume checking against quotas table is prioritized,
        // but for Opps, we need actual dates.
        // Let's implement a simple parser for "QX-YYYY".

        let dateRange = { start, end };
        if (periodName) {
            const [q, year] = periodName.split('-'); // "Q1-2026"
            if (q && year) {
                const qIndex = parseInt(q.replace('Q', '')) - 1;
                const y = parseInt(year);
                dateRange.start = new Date(y, qIndex * 3, 1);
                dateRange.end = endOfQuarter(dateRange.start);
            }
        }

        const opps = await db.select()
            .from(opportunities)
            .where(and(
                eq(opportunities.ownerId, userId),
                gte(opportunities.closeDate, dateRange.start),
                lte(opportunities.closeDate, dateRange.end)
            ));

        // 4. Calculate Metrics
        let closedWon = 0;
        let commitForecast = 0;
        let bestCaseForecast = 0;
        let weightedForecast = 0;
        let totalPipeline = 0;

        for (const opp of opps) {
            const amount = Number(opp.amount || 0);
            const prob = Number(opp.probability || 0) / 100;
            const category = opp.forecastCategory || "";
            const stage = opp.stage || "";

            totalPipeline += amount;

            if (stage === "Closed Won") {
                closedWon += amount;
                commitForecast += amount; // Closed is always committed
                bestCaseForecast += amount;
                weightedForecast += amount;
            } else if (stage !== "Closed Lost") {
                // Open Deals
                weightedForecast += (amount * prob);

                if (category === "Commit") {
                    commitForecast += amount;
                    bestCaseForecast += amount;
                } else if (category === "Best Case") {
                    bestCaseForecast += amount;
                }
            }
        }

        return {
            period: targetPeriod,
            quota,
            closedWon,
            commitForecast,
            bestCaseForecast,
            weightedForecast: Math.round(weightedForecast),
            gap: Math.max(0, quota - commitForecast), // Gap to commit usually
            attainment: quota > 0 ? (closedWon / quota) * 100 : 0
        };
    }
}
