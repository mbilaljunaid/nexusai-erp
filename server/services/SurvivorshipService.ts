
import { db } from "../db";
import { hzSurvivorshipRules, InsertHzSurvivorshipRule } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

export class SurvivorshipService {

    /**
     * Create a new Survivorship Rule
     */
    async createRule(rule: InsertHzSurvivorshipRule) {
        const [newRule] = await db.insert(hzSurvivorshipRules).values(rule).returning();
        return newRule;
    }

    /**
     * Get All Rules
     */
    async getAllRules() {
        return await db.select().from(hzSurvivorshipRules).orderBy(desc(hzSurvivorshipRules.createdAt));
    }

    /**
     * Get Active Rules
     */
    async getActiveRules() {
        return await db.select().from(hzSurvivorshipRules)
            .where(eq(hzSurvivorshipRules.activeFlag, true))
            .orderBy(desc(hzSurvivorshipRules.confidenceScore));
    }

    /**
     * Update Rule
     */
    async updateRule(id: string, updates: Partial<InsertHzSurvivorshipRule>) {
        const [updated] = await db.update(hzSurvivorshipRules)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(hzSurvivorshipRules.id, id))
            .returning();
        return updated;
    }

    /**
     * Determine Best Candidate (Mock Logic based on Source System)
     */
    async determineBestCandidate(candidates: any[]) {
        const rules = await this.getActiveRules();

        // Simple logic: If strict rule exists for a source system, prefer it.
        // Otherwise default to most recent.

        // TODO: Implement actual attribute-level survivorship.
        // For distinct record selection (Golden Record), we pick the one from the highest confidence source.

        if (!candidates || candidates.length === 0) return null;

        // Mock: just return first for now, or sort by some criteria
        return candidates[0];
    }
}

export const survivorshipService = new SurvivorshipService();
