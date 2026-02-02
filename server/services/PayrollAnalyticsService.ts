
import { db } from "../db";
import { hrmPayrollRuns, hrmPayrollRunResults } from "@shared/schema/rewards_payroll";
import { eq, desc, and, ne, lt } from "drizzle-orm";

export interface Anomaly {
    type: "HIGH_VARIANCE" | "ZERO_PAY" | "NEW_JOINER";
    severity: "HIGH" | "MEDIUM" | "LOW";
    assignmentId: string;
    description: string;
    currentNet: number;
    previousNet?: number;
    variancePercent?: number;
}

export class PayrollAnalyticsService {

    static async detectAnomalies(runId: string): Promise<Anomaly[]> {
        const anomalies: Anomaly[] = [];

        // 1. Get Current Run and Results
        const [currentRun] = await db.select().from(hrmPayrollRuns).where(eq(hrmPayrollRuns.id, runId));
        if (!currentRun) throw new Error("Run not found");

        const currentResults = await db.select().from(hrmPayrollRunResults).where(eq(hrmPayrollRunResults.payrollRunId, runId));

        // Helper to calculate Net for a set of results
        const calculateNet = (results: typeof currentResults) => {
            const earnings = results.filter(r => !r.elementName?.includes("Tax") && !r.elementName?.includes("Insurance"));
            const deductions = results.filter(r => r.elementName?.includes("Tax") || r.elementName?.includes("Insurance"));
            const totalE = earnings.reduce((sum, r) => sum + Number(r.amount), 0);
            const totalD = deductions.reduce((sum, r) => sum + Math.abs(Number(r.amount)), 0);
            return totalE - totalD;
        };

        // Group by Assignment
        const currentByAssignment = new Map<string, number>();
        const assignmentRecs = new Map<string, any[]>();

        currentResults.forEach(r => {
            if (!assignmentRecs.has(r.assignmentId)) assignmentRecs.set(r.assignmentId, []);
            assignmentRecs.get(r.assignmentId)?.push(r);
        });

        assignmentRecs.forEach((recs, assignmentId) => {
            currentByAssignment.set(assignmentId, calculateNet(recs));
        });

        // 2. Find Previous Run
        const [previousRun] = await db.select().from(hrmPayrollRuns)
            .where(and(
                eq(hrmPayrollRuns.payGroupId, currentRun.payGroupId),
                eq(hrmPayrollRuns.status, 'COMPLETED'),
                ne(hrmPayrollRuns.id, runId), // Exclude self
                lt(hrmPayrollRuns.periodEndDate, currentRun.periodStartDate) // Explicitly older
            ))
            .orderBy(desc(hrmPayrollRuns.periodEndDate))
            .limit(1);

        const prevByAssignment = new Map<string, number>();

        if (previousRun) {
            const prevResults = await db.select().from(hrmPayrollRunResults).where(eq(hrmPayrollRunResults.payrollRunId, previousRun.id));
            // Group Previous
            const prevAssignmentRecs = new Map<string, any[]>();
            prevResults.forEach(r => {
                if (!prevAssignmentRecs.has(r.assignmentId)) prevAssignmentRecs.set(r.assignmentId, []);
                prevAssignmentRecs.get(r.assignmentId)?.push(r);
            });

            prevAssignmentRecs.forEach((recs, assignmentId) => {
                prevByAssignment.set(assignmentId, calculateNet(recs));
            });
        }

        // 3. Analyze
        console.log(`[DEBUG] Analyzing Run ${currentRun.periodName}. Previous Run: ${previousRun?.periodName || 'NONE'}`);
        currentByAssignment.forEach((currentNet, assignmentId) => {
            // Check Zero Pay
            if (currentNet <= 0) {
                anomalies.push({
                    type: "ZERO_PAY",
                    severity: "HIGH",
                    assignmentId,
                    description: "Employee has Zero or Negative Net Pay.",
                    currentNet
                });
                return;
            }

            // Check Variance
            if (previousRun) {
                if (!prevByAssignment.has(assignmentId)) {
                    anomalies.push({
                        type: "NEW_JOINER",
                        severity: "LOW",
                        assignmentId,
                        description: "First payroll run for this employee.",
                        currentNet
                    });
                } else {
                    const prevNet = prevByAssignment.get(assignmentId) || 0;
                    console.log(`[DEBUG] Assignment ${assignmentId}: Curr=${currentNet}, Prev=${prevNet}`);

                    if (prevNet > 0) {
                        const variance = ((currentNet - prevNet) / prevNet) * 100;
                        console.log(`[DEBUG] Variance: ${variance.toFixed(2)}%`);

                        if (Math.abs(variance) > 15) {
                            anomalies.push({
                                type: "HIGH_VARIANCE",
                                severity: "MEDIUM",
                                assignmentId,
                                description: `Net Pay changed by ${variance.toFixed(1)}% vs previous run.`,
                                currentNet,
                                previousNet: prevNet,
                                variancePercent: variance
                            });
                        }
                    }
                }
            }
        });

        return anomalies;
    }
}
