
import { db } from "../db";
import {
    hrmBenPrograms, hrmBenPlans, hrmBenOptions, hrmBenPlanOptions, hrmBenEnrollments
} from "@shared/schema/rewards_benefits";
import { hrmPayElements, hrmPayrollRunResults } from "@shared/schema/rewards_payroll"; // We don't write directly to run results usually, but element entries.
// Wait, we don't have an "Element Entry" table separate from Run Result in V1 schema?
// Checking rewards_payroll.ts... hrmPayrollRunResults is the line item.
// In V1, we likely need a way to store "Recurring Element Entries".
// Ah, `hrmPayElements` defines the element. 
// We might need a `hrmPayElementEntries` table for recurring deductions if we want them to auto-process.
// For V1 Tier-1, sticking to the existing pattern:
// The `PayrollService` usually reads from `hrmWorkerSalaries` (for Salary).
// For Benefits, we should verify if `hrmPayrollRunResults` are created ad-hoc or if we need a persistent entry.
// For now, `submitEnrollment` will just create the Enrollment Record. 
// The "Integration" step later (or verify script) will simulate the Payroll Run picking this up.
// Let's assume for this Phase, we just create the Enrollment.

import { eq, and, gte, lte } from "drizzle-orm";

export class BenefitsService {

    // === CONFIGURATION ===
    static async createProgram(data: any) {
        const [prog] = await db.insert(hrmBenPrograms).values(data).returning();
        return prog;
    }

    static async createPlan(data: any) {
        const [plan] = await db.insert(hrmBenPlans).values(data).returning();
        return plan;
    }

    static async createOption(data: any) {
        const [opt] = await db.insert(hrmBenOptions).values(data).returning();
        return opt;
    }

    static async configurePlanOption(data: any) {
        const [po] = await db.insert(hrmBenPlanOptions).values(data).returning();
        return po;
    }

    // === SELF-SERVICE ===
    static async getOpenEnrollmentPrograms(tenantId: string, date = new Date()) {
        // Find programs where today is within enrollment window
        const d = date.toISOString().split('T')[0];
        return await db.select().from(hrmBenPrograms)
            .where(and(
                eq(hrmBenPrograms.tenantId, tenantId),
                eq(hrmBenPrograms.status, 'ACTIVE'),
                lte(hrmBenPrograms.openEnrollmentStart, d),
                gte(hrmBenPrograms.openEnrollmentEnd, d)
            ));
    }

    static async getAvailablePlans(programId: string) {
        // Join Plans and options
        // Returns hierarchy for UI
        const plans = await db.select().from(hrmBenPlans)
            .where(eq(hrmBenPlans.programId, programId));

        // For each plan, get options
        const results = [];
        for (const p of plans) {
            const options = await db.select({
                optionName: hrmBenOptions.name,
                employeeCost: hrmBenPlanOptions.employeeCost,
                employerCost: hrmBenPlanOptions.employerCost,
                planOptionId: hrmBenPlanOptions.id
            })
                .from(hrmBenPlanOptions)
                .innerJoin(hrmBenOptions, eq(hrmBenPlanOptions.optionId, hrmBenOptions.id))
                .where(eq(hrmBenPlanOptions.planId, p.id));

            results.push({ ...p, options });
        }
        return results;
    }

    // === ENROLLMENT ===
    static async submitEnrollment(data: {
        tenantId: string,
        personId: string,
        planOptionId: string,
        coverageStartDate: string
    }) {
        // 1. Create Enrollment
        const [enrollment] = await db.insert(hrmBenEnrollments).values({
            tenantId: data.tenantId,
            personId: data.personId,
            planOptionId: data.planOptionId,
            coverageStartDate: data.coverageStartDate,
            status: 'ACTIVE'
        }).returning();

        console.log(`[BENEFITS] Enrollment Created: ${enrollment.id} for Person ${data.personId}`);

        // 2. Integration: We would typically create a "Element Entry" here.
        // For Verification, we will query this table to confirm election.

        return enrollment;
    }
}
