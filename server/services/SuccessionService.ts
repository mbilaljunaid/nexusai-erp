import { db } from "../db";
import { hrmSuccessionPlans, hrmSuccessionCandidates, hrmTalentPools, hrmReadinessAssessments, hrmPositionHistory } from "../../shared/schema/talent_succession";
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

    // CANDIDATES
    static async getCandidates(planId: string) {
        return await db.select().from(hrmSuccessionCandidates)
            .where(eq(hrmSuccessionCandidates.planId, planId))
            .orderBy(desc(hrmSuccessionCandidates.createdAt));
    }

    static async addCandidate(data: any) {
        const [candidate] = await db.insert(hrmSuccessionCandidates).values(data).returning();
        return candidate;
    }

    static async removeCandidate(candidateId: string) {
        const [deleted] = await db.delete(hrmSuccessionCandidates)
            .where(eq(hrmSuccessionCandidates.id, candidateId))
            .returning();
        return deleted;
    }

    // READINESS ASSESSMENTS
    static async assessCandidateReadiness(data: any) {
        // Calculate overall score
        const overallScore = Math.round(
            (data.technicalCompetence * 0.35 +
                data.leadershipCapability * 0.40 +
                data.culturalFit * 0.25) / 5 * 100
        );

        const [assessment] = await db.insert(hrmReadinessAssessments).values({
            ...data,
            overallScore
        }).returning();

        return assessment;
    }

    static async getAssessmentHistory(candidateId: string) {
        return await db.select().from(hrmReadinessAssessments)
            .where(eq(hrmReadinessAssessments.candidateId, candidateId))
            .orderBy(desc(hrmReadinessAssessments.createdAt));
    }

    // Update 9-box position with history tracking
    static async updateCandidatePosition(candidateId: string, nineBoxPosition: string, changedBy?: string) {
        // Get current position for history
        const [current] = await db.select()
            .from(hrmSuccessionCandidates)
            .where(eq(hrmSuccessionCandidates.id, candidateId));

        // Update position
        const [updated] = await db.update(hrmSuccessionCandidates)
            .set({ nineBoxPosition, updatedAt: sql`now()` })
            .where(eq(hrmSuccessionCandidates.id, candidateId))
            .returning();

        // Record history if position changed
        if (current && current.nineBoxPosition !== nineBoxPosition) {
            await db.insert(hrmPositionHistory).values({
                candidateId,
                tenantId: current.tenantId,
                previousPosition: current.nineBoxPosition,
                newPosition: nineBoxPosition,
                changedBy: changedBy || "user"
            });
        }

        return updated;
    }

    // Auto-position based on assessment scores
    static async autoPositionCandidate(candidateId: string) {
        // Get latest assessment
        const [assessment] = await db.select()
            .from(hrmReadinessAssessments)
            .where(eq(hrmReadinessAssessments.candidateId, candidateId))
            .orderBy(desc(hrmReadinessAssessments.createdAt))
            .limit(1);

        if (!assessment) {
            throw new Error("No assessment found for candidate");
        }

        // Calculate performance and potential (1-3 scale)
        // Leadership capability maps to performance
        const performance = Math.ceil(assessment.leadershipCapability / 1.67); // 5-scale to 3-scale

        // Average of technical and cultural fit maps to potential
        const potentialScore = (assessment.technicalCompetence + assessment.culturalFit) / 2;
        const potential = Math.ceil(potentialScore / 1.67);

        // Map to 9-box position
        const positionMap: Record<string, string> = {
            "3-3": "HIGH_PERF_HIGH_POT",
            "3-2": "HIGH_PERF_MED_POT",
            "3-1": "HIGH_PERF_LOW_POT",
            "2-3": "MED_PERF_HIGH_POT",
            "2-2": "MED_PERF_MED_POT",
            "2-1": "MED_PERF_LOW_POT",
            "1-3": "LOW_PERF_HIGH_POT",
            "1-2": "LOW_PERF_MED_POT",
            "1-1": "LOW_PERF_LOW_POT",
        };

        const position = positionMap[`${performance}-${potential}`];

        return await this.updateCandidatePosition(candidateId, position, "system_auto");
    }

    // Get position history for candidate
    static async getPositionHistory(candidateId: string) {
        return await db.select()
            .from(hrmPositionHistory)
            .where(eq(hrmPositionHistory.candidateId, candidateId))
            .orderBy(desc(hrmPositionHistory.createdAt));
    }

    // TALENT POOLS
    static async getPools(tenantId: string) {
        return await db.select().from(hrmTalentPools)
            .where(eq(hrmTalentPools.tenantId, tenantId))
            .orderBy(desc(hrmTalentPools.createdAt));
    }

    static async createPool(data: any) {
        const [pool] = await db.insert(hrmTalentPools).values(data).returning();
        return pool;
    }
}
