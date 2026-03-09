
import { db } from "../../../db";
import {
    ppmBudgetVersions, ppmBudgetLines, ppmControlRules,
    ppmExpenditureItems, ppmTasks
} from "@shared/schema";
import { eq, and, sum, sql, desc } from "drizzle-orm";

type ValidationResult = {
    status: "PASS" | "FAIL" | "ADVISORY";
    message: string;
    budget: number;
    consumed: number;
    requested: number;
    available: number;
};

export class PpmPlanningService {

    // 1. Budget Management
    async createBudgetVersion(projectId: string, name: string, description?: string) {
        const [version] = await db.insert(ppmBudgetVersions).values({
            projectId,
            versionName: name,
            description,
            status: "DRAFT",
            versionType: "COST"
        }).returning();
        return version;
    }

    async addBudgetLines(versionId: string, lines: { taskId?: string, periodName: string, amount: string }[]) {
        return await db.insert(ppmBudgetLines).values(lines.map(l => ({
            versionId,
            taskId: l.taskId,
            periodName: l.periodName,
            amount: l.amount
        }))).returning();
    }

    async getBudgetLines(versionId: string) {
        const lines = await db.select({
            id: ppmBudgetLines.id,
            versionId: ppmBudgetLines.versionId,
            taskId: ppmBudgetLines.taskId,
            taskName: ppmTasks.name,
            periodName: ppmBudgetLines.periodName,
            amount: ppmBudgetLines.amount,
            quantity: ppmBudgetLines.quantity
        }).from(ppmBudgetLines)
            .leftJoin(ppmTasks, eq(ppmBudgetLines.taskId, ppmTasks.id))
            .where(eq(ppmBudgetLines.versionId, versionId));

        return lines.map(l => ({
            ...l,
            amount: Number(l.amount || 0),
            quantity: Number(l.quantity || 0)
        }));
    }

    async baselineBudget(versionId: string) {
        // 1. Get the project ID
        const version = await db.query.ppmBudgetVersions.findFirst({
            where: eq(ppmBudgetVersions.id, versionId)
        });
        if (!version) throw new Error("Version not found");

        // 2. Unflag previous current versions
        await db.update(ppmBudgetVersions)
            .set({ currentFlag: false })
            .where(and(
                eq(ppmBudgetVersions.projectId, version.projectId),
                eq(ppmBudgetVersions.versionType, version.versionType),
                eq(ppmBudgetVersions.currentFlag, true)
            ));

        // 3. Set this one as current & baselined
        const [updated] = await db.update(ppmBudgetVersions)
            .set({
                currentFlag: true,
                status: "BASELINED",
                baselineDate: new Date()
            })
            .where(eq(ppmBudgetVersions.id, versionId))
            .returning();

        return updated;
    }

    // 2. Control Rules
    async setControlRule(projectId: string, type: "ABSOLUTE" | "ADVISORY" | "TRACKING", level: "PROJECT" | "TASK" = "PROJECT") {
        const existing = await db.query.ppmControlRules.findFirst({ where: eq(ppmControlRules.projectId, projectId) });
        if (existing) {
            return await db.update(ppmControlRules)
                .set({ controlType: type, controlLevel: level })
                .where(eq(ppmControlRules.id, existing.id)).returning();
        } else {
            return await db.insert(ppmControlRules).values({
                projectId,
                controlType: type,
                controlLevel: level
            }).returning();
        }
    }

    // 3. Funds Check Engine
    async checkFunds(projectId: string, amount: number, taskId?: string): Promise<ValidationResult> {
        // A. Get Control Rule
        const rule = await db.query.ppmControlRules.findFirst({
            where: eq(ppmControlRules.projectId, projectId)
        });

        const controlType = rule?.controlType || "ADVISORY";
        const controlLevel = rule?.controlLevel || "PROJECT";

        // B. Get Current Budget
        const currentBudget = await db.query.ppmBudgetVersions.findFirst({
            where: and(
                eq(ppmBudgetVersions.projectId, projectId),
                eq(ppmBudgetVersions.currentFlag, true),
                eq(ppmBudgetVersions.versionType, "COST")
            )
        });

        if (!currentBudget) {
            if (controlType === "ABSOLUTE") {
                return {
                    status: "FAIL",
                    message: "No Baseline Budget exists for this Project.",
                    budget: 0, consumed: 0, requested: amount, available: 0
                };
            }
            return {
                status: "ADVISORY",
                message: "No Budget (Advisory Only)",
                budget: 0, consumed: 0, requested: amount, available: 0
            };
        }

        let budgetTotal = 0;
        let actualsTotal = 0;

        // C. Calculate Totals (Join Tasks for Project ID Filter on Actuals)
        if (controlLevel === "TASK" && taskId) {
            // Task Level Budget
            const budgetRes = await db.select({ total: sum(ppmBudgetLines.amount) })
                .from(ppmBudgetLines)
                .where(and(
                    eq(ppmBudgetLines.versionId, currentBudget.id),
                    eq(ppmBudgetLines.taskId, taskId)
                ));

            // Task Level Actuals (Can filter by taskId directly on Items)
            const actualsRes = await db.select({ total: sum(ppmExpenditureItems.burdenedCost) })
                .from(ppmExpenditureItems)
                .where(eq(ppmExpenditureItems.taskId, taskId));

            budgetTotal = Number(budgetRes[0]?.total || 0);
            actualsTotal = Number(actualsRes[0]?.total || 0);
        } else {
            // Project Level Budget
            const budgetRes = await db.select({ total: sum(ppmBudgetLines.amount) })
                .from(ppmBudgetLines)
                .where(eq(ppmBudgetLines.versionId, currentBudget.id));

            // Project Level Actuals (Must Join Tasks)
            const actualsRes = await db.select({ total: sum(ppmExpenditureItems.burdenedCost) })
                .from(ppmExpenditureItems)
                .innerJoin(ppmTasks, eq(ppmExpenditureItems.taskId, ppmTasks.id))
                .where(eq(ppmTasks.projectId, projectId));

            budgetTotal = Number(budgetRes[0]?.total || 0);
            actualsTotal = Number(actualsRes[0]?.total || 0);
        }

        const available = budgetTotal - actualsTotal;
        const remaining = available - amount;

        // D. Evaluate
        if (remaining < 0) {
            if (controlType === "ABSOLUTE") {
                return {
                    status: "FAIL",
                    message: `Funds Check Failed. Request: ${amount}, Available: ${available}`,
                    budget: budgetTotal,
                    consumed: actualsTotal,
                    requested: amount,
                    available
                };
            } else {
                return {
                    status: "ADVISORY",
                    message: `Budget Exceeded (Advisory). Request: ${amount}, Available: ${available}`,
                    budget: budgetTotal,
                    consumed: actualsTotal,
                    requested: amount,
                    available
                };
            }
        }

        return {
            status: "PASS",
            message: "Funds Check Passed",
            budget: budgetTotal,
            consumed: actualsTotal,
            requested: amount,
            available
        };
    }

    // Get Summaries for UI
    async getBudgetSummary(projectId: string) {
        const versions = await db.query.ppmBudgetVersions.findMany({
            where: eq(ppmBudgetVersions.projectId, projectId),
            orderBy: desc(ppmBudgetVersions.createdAt)
        });
        return versions;
    }
}
