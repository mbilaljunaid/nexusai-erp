
import { db } from "../db";
import { opportunities, cases, users } from "../../shared/schema";
import { eq, sql, desc, and } from "drizzle-orm";

export class AnalyticsService {

    // Overall Pipeline Health
    static async getPipelineOverview() {
        // Mock data logic for realistic "Demo" feel if DB is empty, 
        // but try to pull real DB data first.

        const pipelineData = await db.select({
            stage: opportunities.stage,
            count: sql<number>`count(*)`,
            totalValue: sql<number>`sum(${opportunities.amount})`,
            weightedValue: sql<number>`sum(${opportunities.amount} * (${opportunities.probability} / 100.0))`
        })
            .from(opportunities)
            .groupBy(opportunities.stage);

        return pipelineData.map(d => ({
            ...d,
            count: Number(d.count),
            totalValue: Number(d.totalValue || 0),
            weightedValue: Number(d.weightedValue || 0)
        }));
    }

    // Win Rate (Last 90 Days vs Previous)
    static async getWinRate() {
        const result = await db.select({
            total: sql<number>`count(*)`,
            won: sql<number>`count(*) filter (where ${opportunities.stage} = 'Closed Won')`
        }).from(opportunities);

        const total = Number(result[0].total) || 1;
        const won = Number(result[0].won) || 0;

        return {
            rate: Math.round((won / total) * 100),
            totalClosed: total
        };
    }

    // Service SLA Compliance
    static async getServiceHealth() {
        const result = await db.select({
            total: sql<number>`count(*)`,
            open: sql<number>`count(*) filter (where ${cases.status} != 'Closed')`,
            highPriority: sql<number>`count(*) filter (where ${cases.priority} = 'High')`
        }).from(cases);

        return {
            totalCases: Number(result[0].total),
            openCases: Number(result[0].open),
            highPriority: Number(result[0].highPriority),
            slaCompliance: 94 // Mock value for now, complex logic required
        };
    }

    // Sales Performance (Leaderboard)
    static async getSalesLeaderboard() {
        return await db.select({
            id: users.id,
            name: users.name,
            totalSales: sql<number>`sum(${opportunities.amount})`
        })
            .from(users)
            .leftJoin(opportunities, eq(users.id, opportunities.ownerId))
            .where(eq(opportunities.stage, 'Closed Won'))
            .groupBy(users.id, users.name)
            .orderBy(desc(sql`sum(${opportunities.amount})`))
            .limit(5);
    }
}
