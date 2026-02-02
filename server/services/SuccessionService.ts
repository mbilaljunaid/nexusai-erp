import { db } from "../db";
import { hrmSuccessionPlans, hrmSuccessionCandidates, hrmTalentPools } from "@shared/schema/talent_succession";
import { eq, desc, sql } from "drizzle-orm";

export class SuccessionService {

    // PLANS
    static async getPlans(tenantId: string) {
        return await db.select().from(hrmSuccessionPlans)
            .where(eq(hrmSuccessionPlans.tenantId, tenantId))
            .orderBy(desc(hrmSuccessionPlans.createdAt));
    }

    static async createPlan(data: any) {
        const [plan] = await db.insert(hrmSuccessionPlans).values(data).returning();
        return plan;
    }

    static async getPlanById(planId: string) {
        const [plan] = await db.select().from(hrmSuccessionPlans).where(eq(hrmSuccessionPlans.id, planId));
        return plan;
    }

    // CANDIDATES
    static async addCandidate(data: any) {
        const [candidate] = await db.insert(hrmSuccessionCandidates).values(data).returning();
        return candidate;
    }

    static async getCandidates(planId: string) {
        return await db.select().from(hrmSuccessionCandidates)
            .where(eq(hrmSuccessionCandidates.planId, planId))
            .orderBy(desc(hrmSuccessionCandidates.readiness));
    }

    // TALENT POOLS
    static async getPools(tenantId: string) {
        return await db.select().from(hrmTalentPools)
            .where(eq(hrmTalentPools.tenantId, tenantId));
    }

    static async createPool(data: any) {
        const [pool] = await db.insert(hrmTalentPools).values(data).returning();
        return pool;
    }
}
