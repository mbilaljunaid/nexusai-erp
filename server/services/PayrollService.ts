import { db } from "../db";
import { hrmPayGroups, hrmPayElements, hrmPayrollRuns, hrmPayrollRunResults } from "@shared/schema/rewards_payroll";
import { hrmWorkerSalaries, hrmSalaryBases } from "@shared/schema/rewards_compensation";
import { hrAssignments, hrPersons } from "@shared/schema/hr_worker";
import { hrmTimeSheets, hrmTimePeriods, hrmRegionalPolicies } from "@shared/schema/time_labor";
import { hrmVoluntaryDeductions } from "@shared/schema/hr_payroll_ext";
import { eq, desc, and, inArray, lt } from "drizzle-orm";
import { CompensationService } from "./CompensationService";
import { TaxService } from "./TaxService";

export class PayrollService {

    // === SETUP ===
    static async getPayGroups(tenantId: string) {
        return await db.select().from(hrmPayGroups).where(eq(hrmPayGroups.tenantId, tenantId));
    }

    static async getElements(tenantId: string) {
        return await db.select().from(hrmPayElements).where(eq(hrmPayElements.tenantId, tenantId));
    }

    static async createElement(data: any) {
        const [el] = await db.insert(hrmPayElements).values(data).returning();
        return el;
    }

    // === RUN MANAGEMENT ===
    static async createRun(data: any) {
        const [run] = await db.insert(hrmPayrollRuns).values({
            ...data,
            status: "OPEN"
        }).returning();
        return run;
    }

    static async getRuns(tenantId: string, entLegalEntityId?: string) {
        return await db.select().from(hrmPayrollRuns)
            .where(and(
                eq(hrmPayrollRuns.tenantId, tenantId),
                entLegalEntityId ? eq(hrmPayrollRuns.entLegalEntityId, entLegalEntityId) : sql`true`
            ))
            .orderBy(desc(hrmPayrollRuns.periodStartDate));
    }

    // === CALCULATION ENGINE (THE CORE) ===
    static async calculateRun(runId: string, tenantId: string) {
        // 1. Get Run Info
        const [run] = await db.select().from(hrmPayrollRuns).where(eq(hrmPayrollRuns.id, runId));
        if (!run) throw new Error("Run not found");
        if (run.status === "COMPLETED" || run.status === "PAID") throw new Error("Run already completed");

        // 2. Set status to CALCULATING
        await db.update(hrmPayrollRuns).set({ status: "CALCULATING" }).where(eq(hrmPayrollRuns.id, runId));

        try {
            // 3. Find Eligible Assignments for this Pay Group & Legal Entity
            const activeAssignments = await db.select().from(hrAssignments)
                .where(and(
                    eq(hrAssignments.tenantId, tenantId),
                    eq(hrAssignments.assignmentStatus, "ACTIVE"),
                    run.entLegalEntityId ? eq(hrAssignments.entLegalEntityId, run.entLegalEntityId) : sql`true`
                ));

            // 4. Clean previous results for this run
            await db.delete(hrmPayrollRunResults).where(eq(hrmPayrollRunResults.payrollRunId, runId));

            // PRE-LOAD GLOBAL ELEMENTS (Performance Optimization)
            // In a real engine, these are assigned to the person. For V1, we assume global standard elements apply if they exist.
            const allElements = await db.select().from(hrmPayElements).where(eq(hrmPayElements.tenantId, tenantId));
            const basicElem = allElements.find(e => e.name === "Basic Salary");

            // Mock Deductions (In real app, we check Element Entries for the worker)
            const taxElem = allElements.find(e => e.classification === "TAX" || e.name === "Income Tax");
            const healthElem = allElements.find(e => e.classification === "DEDUCTION" || e.name === "Health Insurance");

            let runTotalGross = 0;
            let runTotalNet = 0;

            // 5. Iterate and Calculate
            for (const assignment of activeAssignments) {
                let workerGross = 0;
                let workerDeductions = 0;

                // A. Get Base Salary (The source of truth for Gross)
                const salary = await CompensationService.getWorkerSalary(assignment.id, new Date(run.periodEndDate));

                if (salary) {
                    // Fetch Basis to check Frequency
                    const [basis] = await db.select().from(hrmSalaryBases).where(eq(hrmSalaryBases.id, salary.salaryBasisId));
                    const frequency = basis?.frequency || "ANNUALLY";

                    if (frequency === "HOURLY") {
                        // --- HOURLY WORKER (WFM INTEGRATION) ---
                        // 1. Fetch Approved Timesheet for this Period
                        // Note: We need to match Run Period to Timesheet Period.
                        // Ideally we lookup hrmTimePeriods by date range match.
                        // For V1, we assume run.periodName matches hrmTimePeriods.name? Or just lookup by Date Range overlap.

                        const startDate = run.periodStartDate;
                        const endDate = run.periodEndDate;

                        // Find timesheet for this person overlapping/matching the run
                        // We'll join hrmTimeSheets with hrmTimePeriods
                        // Simple approach: find sheet where period covers run date or vice versa.
                        // Let's assume strict match on Person and Status=APPROVED.

                        // We need personId from Assignment
                        const personId = assignment.personId;

                        /* 
                           Optimization: We could query all sheets for the period once outside the loop.
                           But for clarity, we query here.
                        */
                        // We need to Find the Period ID first? 
                        // Let's search for the sheet directly via a JOIN or helper.
                        // Actually, let's just find "Any Approved Sheet ending in this payroll period".

                        const timesheets = await db.select({
                            sheet: hrmTimeSheets,
                            period: hrmTimePeriods
                        })
                            .from(hrmTimeSheets)
                            .innerJoin(hrmTimePeriods, eq(hrmTimeSheets.periodId, hrmTimePeriods.id))
                            .where(and(
                                eq(hrmTimeSheets.personId, personId),
                                eq(hrmTimeSheets.status, "APPROVED"),
                                // Overlap check: Period End <= Run End && Period Start >= Run Start
                                // Simplifying: Just match if Period End Date is essentially the Run End Date
                                eq(hrmTimePeriods.endDate, run.periodEndDate)
                            ));

                        const sheet = timesheets[0]?.sheet;

                        if (sheet) {
                            const hourlyRate = Number(salary.amount);
                            const regularHours = Number(sheet.totalHours) - Number(sheet.totalOvertime);
                            const otHours = Number(sheet.totalOvertime);

                            // 1. Regular Pay
                            const regPay = regularHours * hourlyRate;
                            workerGross += regPay;

                            if (regularHours > 0) {
                                await db.insert(hrmPayrollRunResults).values({
                                    tenantId, payrollRunId: runId, assignmentId: assignment.id,
                                    elementId: basicElem?.id || "unknown", elementName: "Regular Wages", // Should map to Element
                                    amount: regPay.toFixed(2), classification: "EARNINGS"
                                });
                            }

                            // 2. OT Pay
                            if (otHours > 0) {
                                // Fetch Multiplier from Regional Policy or Default
                                // We need Country from Person... assignment doesn't have it directly, but hrPersons does.
                                // We'll trust the hrmRegionalPolicies standard of 1.5x if we don't fetch logic here.
                                // Let's explicitly fetch Policy for precision.

                                // Fetch Person
                                const [person] = await db.select().from(hrPersons).where(eq(hrPersons.id, personId));
                                const country = person?.country || "US";
                                const [policy] = await db.select().from(hrmRegionalPolicies).where(eq(hrmRegionalPolicies.countryCode, country));
                                const multiplier = policy ? Number(policy.overtimeMultiplier) : 1.5;

                                const otPay = otHours * hourlyRate * multiplier;
                                workerGross += otPay;

                                await db.insert(hrmPayrollRunResults).values({
                                    tenantId, payrollRunId: runId, assignmentId: assignment.id,
                                    elementId: basicElem?.id || "unknown", elementName: "Overtime Wages",
                                    amount: otPay.toFixed(2), classification: "EARNINGS"
                                });
                            }
                        }

                    } else {
                        // --- SALARIED WORKER (EXISTING LOGIC) ---
                        if (basicElem) {
                            const monthlyGross = Number(salary.amount) / 12; // Simple Annual -> Monthly
                            workerGross += monthlyGross;

                            await db.insert(hrmPayrollRunResults).values({
                                tenantId,
                                payrollRunId: runId,
                                assignmentId: assignment.id,
                                elementId: basicElem.id,
                                elementName: basicElem.name,
                                amount: monthlyGross.toFixed(2),
                                classification: "EARNINGS"
                            });
                        }
                    }

                    // B. Calculate TAX (Progressive Logic) - SHARED
                    if (taxElem) {
                        // Annualize
                        // If Hourly: Annual ~ Gross * 12 (Projection) or YTD? 
                        // Simple V1: Annualize current earnings * 12
                        const annualGross = workerGross * 12;
                        const annualTax = TaxService.calculateFederalTax(annualGross);
                        const monthlyTax = annualTax / 12;

                        workerDeductions += monthlyTax;
                        await db.insert(hrmPayrollRunResults).values({
                            tenantId, payrollRunId: runId, assignmentId: assignment.id,
                            elementId: taxElem.id, elementName: taxElem.name, amount: (-monthlyTax).toFixed(2)
                        });
                    }

                    // C. Calculate DEDUCTION (Fixed $200 Health for V1) - SHARED
                    if (healthElem) {
                        const insuranceCost = 200.00;
                        workerDeductions += insuranceCost;
                        await db.insert(hrmPayrollRunResults).values({
                            tenantId, payrollRunId: runId, assignmentId: assignment.id,
                            elementId: healthElem.id, elementName: healthElem.name, amount: (-insuranceCost).toFixed(2)
                        });
                    }
                }

                // Calc Net
                const workerNet = workerGross - workerDeductions;
                runTotalGross += workerGross;
                runTotalNet += workerNet;
            }

            // 6. Update Run Header
            await db.update(hrmPayrollRuns).set({
                status: "PENDING_APPROVAL", // Workflow Step: Needs Approval
                totalGross: runTotalGross.toFixed(2),
                totalNet: runTotalNet.toFixed(2),
                completedDate: new Date().toISOString()
            }).where(eq(hrmPayrollRuns.id, runId));

            return { success: true, processedCount: activeAssignments.length };

        } catch (err) {
            await db.update(hrmPayrollRuns).set({ status: "ERROR" }).where(eq(hrmPayrollRuns.id, runId));
            throw err;
        }
    }

    static async approveRun(runId: string, actorId: string) {
        const [run] = await db.select().from(hrmPayrollRuns).where(eq(hrmPayrollRuns.id, runId));
        if (!run) throw new Error("Run not found");

        if (run.status !== "PENDING_APPROVAL") throw new Error("Run must be in PENDING_APPROVAL state to approve.");

        // In a real system, we'd add an entry to hrm_action_history or similar
        console.log(`[AUDIT] Run ${runId} approved by ${actorId}`);

        const [updated] = await db.update(hrmPayrollRuns)
            .set({ status: "COMPLETED" })
            .where(eq(hrmPayrollRuns.id, runId))
            .returning();

        return updated;
    }

    static async getRunResults(runId: string) {
        return await db.select().from(hrmPayrollRunResults)
            .where(eq(hrmPayrollRunResults.payrollRunId, runId));
    }

    // === SELF-SERVICE EXTENSIONS ===

    static async getVoluntaryDeductions(assignmentId: string, tenantId: string) {
        return await db.select().from(hrmVoluntaryDeductions)
            .where(and(
                eq(hrmVoluntaryDeductions.assignmentId, assignmentId),
                eq(hrmVoluntaryDeductions.tenantId, tenantId),
                eq(hrmVoluntaryDeductions.status, "ACTIVE")
            ));
    }

    static async createVoluntaryDeduction(data: any) {
        const [deduction] = await db.insert(hrmVoluntaryDeductions).values(data).returning();
        return deduction;
    }

    static async deleteVoluntaryDeduction(id: string) {
        const [deduction] = await db.update(hrmVoluntaryDeductions)
            .set({ status: "INACTIVE", endDate: new Date() })
            .where(eq(hrmVoluntaryDeductions.id, id))
            .returning();
        return deduction;
    }

    static async getRetroPayHistory(assignmentId: string, tenantId: string) {
        // Retro pay history is essentially looking for results that were calculated 
        // in a previous run but for an earlier period, OR just identifying adjustments.
        // For simplicity in ESS, we'll return any "Retro" classified results.
        return await db.select().from(hrmPayrollRunResults)
            .where(and(
                eq(hrmPayrollRunResults.assignmentId, assignmentId),
                eq(hrmPayrollRunResults.tenantId, tenantId),
                sql`${hrmPayrollRunResults.elementName} LIKE '%Retro%'`
            ))
            .orderBy(desc(hrmPayrollRunResults.createdAt));
    }
}
