
import { db } from "../db";
import { hzMatchRules, InsertHzMatchRule } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

export class MatchRuleService {

    /**
     * Create a new Match Rule
     */
    async createRule(rule: InsertHzMatchRule) {
        const [newRule] = await db.insert(hzMatchRules).values(rule).returning();
        return newRule;
    }

    /**
     * Get All Rules
     */
    async getAllRules() {
        return await db.select().from(hzMatchRules).orderBy(desc(hzMatchRules.createdAt));
    }

    /**
     * Get Active Rules
     */
    async getActiveRules() {
        return await db.select().from(hzMatchRules)
            .where(eq(hzMatchRules.activeFlag, true))
            .orderBy(desc(hzMatchRules.createdAt));
    }

    /**
     * Get Rule by ID
     */
    async getRuleById(id: string) {
        return await db.query.hzMatchRules.findFirst({
            where: eq(hzMatchRules.id, id)
        });
    }

    /**
     * Update Rule
     */
    async updateRule(id: string, updates: Partial<InsertHzMatchRule>) {
        const [updated] = await db.update(hzMatchRules)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(hzMatchRules.id, id))
            .returning();
        return updated;
    }

    /**
     * Delete Rule (Hard Delete for now, or Soft Delete via update)
     */
    async deleteRule(id: string) {
        return await db.delete(hzMatchRules).where(eq(hzMatchRules.id, id)).returning();
    }
}

export const matchRuleService = new MatchRuleService();
