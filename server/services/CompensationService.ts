import { db } from "../db";
import { hrmSalaryBases, hrmWorkerSalaries, hrmCompensationPlans } from "@shared/schema/rewards_compensation";
import { eq, desc, and, lte, gte, isNull, or, lt } from "drizzle-orm";
import { hrmPayrollRuns, hrmPayrollRunResults, hrmPayElements } from "@shared/schema/rewards_payroll";

export class CompensationService {

    // === SALARY BASIS ===
    static async getSalaryBases(tenantId: string) {
        return await db.select().from(hrmSalaryBases)
            .where(eq(hrmSalaryBases.tenantId, tenantId));
    }

    static async createSalaryBasis(data: any) {
        const [basis] = await db.insert(hrmSalaryBases).values(data).returning();
        return basis;
    }

    // === WORKER SALARY ===
    static async getWorkerSalary(assignmentId: string, effectiveDate: Date = new Date(), options?: { mask?: boolean }) {
        const formattedDate = effectiveDate.toISOString();

        // Oracle Effective Dating Logic:
        // Find row where dateFrom <= effectiveDate AND (dateTo >= effectiveDate OR dateTo is NULL)
        // Sort by dateFrom DESC to get most recent if multiple match
        const [salary] = await db.select().from(hrmWorkerSalaries)
            .where(and(
                eq(hrmWorkerSalaries.assignmentId, assignmentId),
                lte(hrmWorkerSalaries.dateFrom, formattedDate),
                or(gte(hrmWorkerSalaries.dateTo, formattedDate), isNull(hrmWorkerSalaries.dateTo))
            ))
            .orderBy(desc(hrmWorkerSalaries.dateFrom))
            .limit(1);

        if (salary && options?.mask) {
            return { ...salary, amount: "*****" };
        }

        return salary;
    }

    static async getSalaryHistory(assignmentId: string) {
        return await db.select().from(hrmWorkerSalaries)
            .where(eq(hrmWorkerSalaries.assignmentId, assignmentId))
            .orderBy(desc(hrmWorkerSalaries.dateFrom));
    }

    static async assignSalary(data: any) {
        // In full effective dating, we would "Correct" or "Update" existing row.
        // For V1 simple mode: Update previous row to end yesterday, insert new row today.

        // 1. Find Current Active Salary to close it
        const current = await this.getWorkerSalary(data.assignmentId, new Date(data.dateFrom));

        if (current) {
            // Close previous record
            const closeDate = new Date(data.dateFrom);
            closeDate.setDate(closeDate.getDate() - 1); // Yesterday

            await db.update(hrmWorkerSalaries)
                .set({ dateTo: closeDate.toISOString().split('T')[0] })
                .where(eq(hrmWorkerSalaries.id, current.id));
        }

        // 2. Insert New
        // RETRO-PAY DETECTION
        // Check if this new salary is effective in a period that has already been closed/paid
        const effectiveDate = new Date(data.dateFrom);
        const [lastClosedRun] = await db.select().from(hrmPayrollRuns)
            .where(and(
                eq(hrmPayrollRuns.tenantId, data.tenantId),
                eq(hrmPayrollRuns.status, 'COMPLETED')
            ))
            .orderBy(desc(hrmPayrollRuns.periodEndDate))
            .limit(1);

        if (lastClosedRun && effectiveDate < new Date(lastClosedRun.periodEndDate)) {
            console.warn(`[RETRO-PAY DETECTED] New Salary ${data.amount} for Assignment ${data.assignmentId} is effective ${effectiveDate.toISOString()} which is BEFORE closed run ${lastClosedRun.periodName}`);

            // 1. Calculate Retro Amount (Simplified Annual Basis)
            // Assumes annual salary for now. Real world would check salary basis frequency.
            const oldAmount = current ? Number(current.amount) : 0;
            const newAmount = Number(data.amount);
            const deltaAnnual = newAmount - oldAmount;
            const deltaDaily = deltaAnnual / 365;

            // Calculate days overlapped with closed periods
            // Overlap = (ClosedEndDate - EffectiveDate) in days
            // We assume the effective date is the start of the deviation.
            const closedEnd = new Date(lastClosedRun.periodEndDate);
            // Valid overlap: days between effectiveDate and closedEnd
            const daysOverdue = Math.floor((closedEnd.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysOverdue > 0 && deltaDaily !== 0) {
                const retroAmount = deltaDaily * daysOverdue;
                console.log(`[RETRO-ACTION] Calculating: $${deltaDaily.toFixed(2)}/day * ${daysOverdue} days = $${retroAmount.toFixed(2)}`);

                // 2. Find Next OPEN Run to apply adjustment
                const [nextRun] = await db.select().from(hrmPayrollRuns)
                    .where(and(
                        eq(hrmPayrollRuns.tenantId, data.tenantId),
                        eq(hrmPayrollRuns.status, 'OPEN')
                    ))
                    .limit(1);

                if (nextRun) {
                    // 3. Find or Create Retro Element
                    let [retroElement] = await db.select().from(hrmPayElements)
                        .where(and(
                            eq(hrmPayElements.tenantId, data.tenantId),
                            eq(hrmPayElements.name, 'Retroactive Adjustment')
                        )).limit(1);

                    if (!retroElement) {
                        [retroElement] = await db.insert(hrmPayElements).values({
                            tenantId: data.tenantId,
                            name: 'Retroactive Adjustment',
                            classification: 'EARNING', // Assuming positive retro
                            taxable: true
                        }).returning();
                    }

                    // 4. Insert Adjustment
                    await db.insert(hrmPayrollRunResults).values({
                        tenantId: data.tenantId,
                        payrollRunId: nextRun.id,
                        assignmentId: data.assignmentId,
                        elementId: retroElement.id,
                        elementName: 'Retroactive Adjustment',
                        amount: retroAmount.toFixed(2)
                    });
                    console.log(`[RETRO-COMPLETE] Applied $${retroAmount.toFixed(2)} to Run ${nextRun.periodName}`);
                } else {
                    console.warn("[RETRO-WARNING] No OPEN run found to apply adjustment.");
                }
            }
        }

        const payload = data;
        const [salary] = await db.insert(hrmWorkerSalaries).values(payload).returning();
        return salary;
    }
}
