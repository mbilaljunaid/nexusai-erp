
import { db } from "../db";
import { hzParties, hzDupSets, egpSystemItems } from "../../shared/schema";
import { sql, eq, count } from "drizzle-orm";

export class DataQualityService {

    /**
     * Aggregate Dashboard Metrics
     */
    async getDashboardMetrics() {
        // 1. Total Parties
        const [partiesCount] = await db.select({ count: count() }).from(hzParties);

        // 2. Total Items
        const [itemsCount] = await db.select({ count: count() }).from(egpSystemItems);

        // 3. Duplicate Sets (Open vs Resolved)
        const [openDups] = await db
            .select({ count: count() })
            .from(hzDupSets)
            .where(eq(hzDupSets.status, "OPEN"));

        const [resolvedDups] = await db
            .select({ count: count() })
            .from(hzDupSets)
            .where(eq(hzDupSets.status, "RESOLVED"));

        // 4. Calculate Data Health Score (Mock logic for now: 100 - (dups / total * 100))
        const total = partiesCount.count + itemsCount.count;
        const duplicateImpact = openDups.count * 5; // Penalty per duplicate set
        let healthScore = 100;

        if (total > 0) {
            healthScore = Math.max(0, 100 - (duplicateImpact / total * 100));
        }

        return {
            totalParties: partiesCount.count,
            totalItems: itemsCount.count,
            openDuplicateSets: openDups.count,
            resolvedDuplicateSets: resolvedDups.count,
            dataHealthScore: Math.round(healthScore),
            lastRefresh: new Date()
        };
    }
}

export const dataQualityService = new DataQualityService();
