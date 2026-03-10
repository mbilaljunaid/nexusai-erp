import { db } from "../db";
import { eq, and, desc, gte, lte, or, sql, like } from "drizzle-orm";
import { opportunities, type Opportunity, type InsertOpportunity } from "@shared/schema";

export class OpportunityService {

    /**
     * Get all opportunities with optional filters
     */
    async getAll(filters?: {
        tenantId?: string;
        stage?: string;
        owner?: string;
        minAmount?: number;
        maxAmount?: number;
    }): Promise<Opportunity[]> {
        const conditions = [];

        if (filters?.tenantId) {
            conditions.push(eq(opportunities.entBusinessUnitId, filters.tenantId));
        }
        if (filters?.stage) {
            conditions.push(eq(opportunities.stage, filters.stage));
        }
        if (filters?.owner) {
            conditions.push(eq(opportunities.ownerId, filters.owner));
        }
        if (filters?.minAmount) {
            conditions.push(gte(opportunities.amount, filters.minAmount.toString()));
        }
        if (filters?.maxAmount) {
            conditions.push(lte(opportunities.amount, filters.maxAmount.toString()));
        }

        return await db
            .select()
            .from(opportunities)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(opportunities.createdAt));
    }

    /**
     * Get opportunity by ID
     */
    async getById(id: string): Promise<Opportunity | null> {
        const [opportunity] = await db
            .select()
            .from(opportunities)
            .where(eq(opportunities.id, id));

        return opportunity || null;
    }

    /**
     * Create a new opportunity
     */
    async create(data: InsertOpportunity): Promise<Opportunity> {
        const [opportunity] = await db
            .insert(opportunities)
            .values(data)
            .returning();

        return opportunity;
    }

    /**
     * Update existing opportunity
     */
    async update(id: string, data: Partial<InsertOpportunity>): Promise<Opportunity> {
        const [opportunity] = await db
            .update(opportunities)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(opportunities.id, id))
            .returning();

        return opportunity;
    }

    /**
     * Delete opportunity
     */
    async delete(id: string): Promise<boolean> {
        const result = await db
            .delete(opportunities)
            .where(eq(opportunities.id, id));

        return result.rowCount > 0;
    }

    /**
     * Move opportunity to different stage
     */
    async updateStage(id: string, newStage: string, probability?: number, winLossReason?: string): Promise<Opportunity> {
        const updateData: any = {
            stage: newStage,
            updatedAt: new Date()
        };

        if (probability !== undefined) {
            updateData.probability = probability;
        }

        if (winLossReason !== undefined) {
            updateData.winLossReason = winLossReason;
        }

        const [opportunity] = await db
            .update(opportunities)
            .set(updateData)
            .where(eq(opportunities.id, id))
            .returning();

        return opportunity;
    }

    /**
     * Close opportunity as won
     */
    async closeAsWon(id: string, winLossReason?: string): Promise<Opportunity> {
        return this.updateStage(id, 'CLOSED_WON', 100, winLossReason);
    }

    /**
     * Close opportunity as lost
     */
    async closeAsLost(id: string, winLossReason?: string): Promise<Opportunity> {
        return this.updateStage(id, 'CLOSED_LOST', 0, winLossReason);
    }

    /**
     * Get pipeline statistics
     */
    async getPipelineStats(filters?: { tenantId?: string; owner?: string }) {
        const conditions = [];

        if (filters?.tenantId) {
            conditions.push(eq(opportunities.entBusinessUnitId, filters.tenantId));
        }
        if (filters?.owner) {
            conditions.push(eq(opportunities.ownerId, filters.owner));
        }

        const allOpps = await db
            .select()
            .from(opportunities)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        // Group by stage
        const byStage = allOpps.reduce((acc, opp) => {
            const stage = opp.stage || 'UNKNOWN';
            if (!acc[stage]) {
                acc[stage] = { count: 0, total: 0 };
            }
            acc[stage].count++;
            acc[stage].total += Number(opp.amount || 0);
            return acc;
        }, {} as Record<string, { count: number; total: number }>);

        const totalValue = allOpps.reduce((sum, opp) => sum + Number(opp.amount || 0), 0);
        const avgDealSize = allOpps.length > 0 ? totalValue / allOpps.length : 0;
        const wonCount = allOpps.filter(o => o.stage === 'CLOSED_WON').length;
        const lostCount = allOpps.filter(o => o.stage === 'CLOSED_LOST').length;
        const winRate = (wonCount + lostCount) > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0;

        return {
            totalCount: allOpps.length,
            totalValue,
            avgDealSize,
            winRate,
            byStage
        };
    }
}

export const opportunityService = new OpportunityService();
