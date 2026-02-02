
import { db } from "../db";
import { hrmBenPrograms, hrmBenPlans, hrmBenOptions, hrmBenPlanOptions, hrmBenEnrollments } from "@shared/schema/rewards_benefits";
import { eq, and, lte, gte, sql } from "drizzle-orm";

export class BenefitsService {
    static async getActiveEnrollments(personId: string, tenantId: string) {
        return await db.select({
            enrollmentId: hrmBenEnrollments.id,
            planName: hrmBenPlans.name,
            optionName: hrmBenOptions.name,
            employeeCost: hrmBenPlanOptions.employeeCost,
            employerCost: hrmBenPlanOptions.employerCost,
            coverageStartDate: hrmBenEnrollments.coverageStartDate,
            status: hrmBenEnrollments.status,
            planType: hrmBenPlans.planType
        })
            .from(hrmBenEnrollments)
            .innerJoin(hrmBenPlanOptions, eq(hrmBenEnrollments.planOptionId, hrmBenPlanOptions.id))
            .innerJoin(hrmBenPlans, eq(hrmBenPlanOptions.planId, hrmBenPlans.id))
            .innerJoin(hrmBenOptions, eq(hrmBenPlanOptions.optionId, hrmBenOptions.id))
            .where(
                and(
                    eq(hrmBenEnrollments.personId, personId),
                    eq(hrmBenEnrollments.tenantId, tenantId)
                )
            );
    }

    static async getOpenPrograms(tenantId: string, legislationCode: string = "US") {
        const today = new Date().toISOString().split('T')[0];
        return await db.select()
            .from(hrmBenPrograms)
            .where(
                and(
                    eq(hrmBenPrograms.tenantId, tenantId),
                    eq(hrmBenPrograms.status, "ACTIVE"),
                    eq(hrmBenPrograms.legislationCode, legislationCode),
                    lte(hrmBenPrograms.openEnrollmentStart, today),
                    gte(hrmBenPrograms.openEnrollmentEnd, today)
                )
            );
    }

    static async getProgramPlans(programId: string, tenantId: string) {
        return await db.select({
            planId: hrmBenPlans.id,
            planName: hrmBenPlans.name,
            planType: hrmBenPlans.planType,
            options: sql`json_agg(json_build_object(
                'optionId', ${hrmBenOptions.id},
                'optionName', ${hrmBenOptions.name},
                'employeeCost', ${hrmBenPlanOptions.employeeCost},
                'planOptionId', ${hrmBenPlanOptions.id}
            ))`
        })
            .from(hrmBenPlans)
            .innerJoin(hrmBenPlanOptions, eq(hrmBenPlanOptions.planId, hrmBenPlans.id))
            .innerJoin(hrmBenOptions, eq(hrmBenPlanOptions.optionId, hrmBenOptions.id))
            .where(
                and(
                    eq(hrmBenPlans.programId, programId),
                    eq(hrmBenPlans.tenantId, tenantId)
                )
            )
            .groupBy(hrmBenPlans.id, hrmBenPlans.name, hrmBenPlans.planType);
    }

    static async processEnrollment(personId: string, tenantId: string, planOptionId: string, startDate: string) {
        // Simple implementation: insert election
        return await db.insert(hrmBenEnrollments).values({
            tenantId,
            personId,
            planOptionId,
            coverageStartDate: startDate,
            status: "ACTIVE"
        }).returning();
    }
}
