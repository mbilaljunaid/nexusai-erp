import { db } from "../db";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems, ppmCostDistributions, ppmExpenditureTypes,
    ppmBurdenSchedules, ppmBurdenRules,
    ppmProjectAssets, ppmAssetLines,
    ppmPerformanceSnapshots,
    apInvoices, apInvoiceLines,
    type InsertPpmProject, type InsertPpmTask, type InsertPpmExpenditureItem,
    type InsertPpmCostDistribution,
    type InsertPpmBurdenSchedule, type InsertPpmBurdenRule,
    type InsertPpmProjectAsset, type InsertPpmAssetLine,
    type InsertPpmPerformanceSnapshot
} from "@shared/schema";
import { eq, and, isNull, isNotNull, desc, inArray, sql as drizzleSql } from "drizzle-orm";

export class PpmService {
    /**
     * Create a new financial project
     */
    async createProject(data: InsertPpmProject) {
        const [project] = await db.insert(ppmProjects).values(data).returning();
        return project;
    }

    /**
     * Create a financial task (WBS)
     */
    async createTask(data: InsertPpmTask) {
        const [task] = await db.insert(ppmTasks).values(data).returning();
        return task;
    }

    /**
     * Create expenditure classification
     */
    async createExpenditureType(name: string, uom: string, description?: string) {
        const [type] = await db.insert(ppmExpenditureTypes).values({
            name,
            unitOfMeasure: uom,
            description
        }).returning();
        return type;
    }

    /**
     * Create a burden schedule
     */
    async createBurdenSchedule(data: InsertPpmBurdenSchedule) {
        const [schedule] = await db.insert(ppmBurdenSchedules).values(data).returning();
        return schedule;
    }

    /**
     * Add a rule to a burden schedule
     */
    async addBurdenRule(data: InsertPpmBurdenRule) {
        const [rule] = await db.insert(ppmBurdenRules).values(data).returning();
        return rule;
    }

    /**
     * Create a project asset (pre-FA)
     */
    async createProjectAsset(data: InsertPpmProjectAsset) {
        const [asset] = await db.insert(ppmProjectAssets).values(data).returning();
        return asset;
    }

    /**
     * Import expenditure items from various sources (AP, PO, Labor)
     */
    async importExpenditureItems(items: InsertPpmExpenditureItem[]) {
        const results = await db.insert(ppmExpenditureItems).values(items).returning();
        return results;
    }

    /**
     * Collect validated AP invoice lines into PPM Expenditure Items
     */
    async collectFromAP() {
        // Find validated invoice lines with project tags that haven't been collected
        const collectableLines = await db.select({
            line: apInvoiceLines,
            invoice: apInvoices
        })
            .from(apInvoiceLines)
            .innerJoin(apInvoices, eq(apInvoiceLines.invoiceId, apInvoices.id))
            .where(and(
                isNotNull(apInvoiceLines.ppmProjectId),
                isNotNull(apInvoiceLines.ppmTaskId),
                isNull(apInvoiceLines.ppmExpenditureItemId),
                eq(apInvoices.validationStatus, "VALIDATED")
            ));

        if (collectableLines.length === 0) return [];

        const collectedItems = [];

        // Fetch professional services exp type (or default)
        let [expType] = await db.select().from(ppmExpenditureTypes).where(eq(ppmExpenditureTypes.name, "Professional Services")).limit(1);
        if (!expType) {
            [expType] = await db.insert(ppmExpenditureTypes).values({
                name: "Professional Services",
                unitOfMeasure: "Currency",
                description: "Collected from AP"
            }).returning();
        }

        for (const { line, invoice } of collectableLines) {
            // Create Expenditure Item
            const [item] = await db.insert(ppmExpenditureItems).values({
                taskId: line.ppmTaskId!,
                expenditureTypeId: expType.id,
                expenditureItemDate: invoice.invoiceDate,
                quantity: "1.00",
                unitCost: line.amount,
                rawCost: line.amount,
                transactionSource: "AP",
                transactionReference: line.id.toString(),
                denomCurrencyCode: invoice.invoiceCurrencyCode,
                status: "UNCOSTED",
                capitalizationStatus: "NOT_APPLICABLE" // Will be updated by task capitalizable_flag
            }).returning();

            // Link back to AP Line
            await db.update(apInvoiceLines)
                .set({ ppmExpenditureItemId: item.id })
                .where(eq(apInvoiceLines.id, line.id));

            collectedItems.push(item);
        }

        return collectedItems;
    }

    /**
     * Distribute costs to General Ledger
     * This follows the subledger accounting pattern (Oracle Fusion parity)
     */
    async generateDistributions(expItemId: string, drCcid: string, crCcid: string) {
        const [expItem] = await db.select()
            .from(ppmExpenditureItems)
            .where(eq(ppmExpenditureItems.id, expItemId));

        if (!expItem) throw new Error(`Expenditure Item ${expItemId} not found`);

        // Create the distribution record
        const [dist] = await db.insert(ppmCostDistributions).values({
            expenditureItemId: expItemId,
            drCodeCombinationId: drCcid,
            crCodeCombinationId: crCcid,
            amount: expItem.rawCost,
            status: "POSTED",
            lineType: "RAW"
        }).returning();

        // Update item status
        await db.update(ppmExpenditureItems)
            .set({ status: "DISTRIBUTED" })
            .where(eq(ppmExpenditureItems.id, expItemId));

        return dist;
    }

    /**
     * Apply Burdening multipliers to an expenditure item
     * Implements Schedule Inheritance (Task -> Project -> Default)
     */
    async applyBurdening(expItemId: string) {
        const [expItem] = await db.select()
            .from(ppmExpenditureItems)
            .where(eq(ppmExpenditureItems.id, expItemId));
        if (!expItem) throw new Error("Expenditure Item not found");

        const [task] = await db.select().from(ppmTasks).where(eq(ppmTasks.id, expItem.taskId));
        const [project] = await db.select().from(ppmProjects).where(eq(ppmProjects.id, task.projectId));

        // Determine Effective Burden Schedule (Task override -> Project default)
        const scheduleId = task.burdenScheduleId || project.burdenScheduleId;

        // Set initial capitalization status based on task flag
        const capitalizationStatus = task.capitalizableFlag ? "CIP" : "NOT_APPLICABLE";

        if (!scheduleId) {
            // No burdening applicable, mark as costed with raw = burdened
            const [updated] = await db.update(ppmExpenditureItems)
                .set({
                    burdenedCost: expItem.rawCost,
                    status: "COSTED",
                    capitalizationStatus
                })
                .where(eq(ppmExpenditureItems.id, expItemId))
                .returning();
            return updated;
        }

        // Find applicable rule for this expenditure type
        const [rule] = await db.select()
            .from(ppmBurdenRules)
            .where(and(
                eq(ppmBurdenRules.scheduleId, scheduleId),
                eq(ppmBurdenRules.expenditureTypeId, expItem.expenditureTypeId)
            ))
            .orderBy(desc(ppmBurdenRules.precedence))
            .limit(1);

        const multiplier = rule ? parseFloat(rule.multiplier) : 0;
        const rawCost = parseFloat(expItem.rawCost);
        const burdenedCost = (rawCost * (1 + multiplier)).toFixed(4);

        const [updated] = await db.update(ppmExpenditureItems)
            .set({
                burdenedCost,
                status: "COSTED",
                capitalizationStatus
            })
            .where(eq(ppmExpenditureItems.id, expItemId))
            .returning();

        return updated;
    }

    /**
     * Generate asset lines for CIP accumulation
     * Groups capitalizable expenditure items for a project asset
     */
    async generateAssetLines(projectAssetId: string) {
        const [asset] = await db.select().from(ppmProjectAssets).where(eq(ppmProjectAssets.id, projectAssetId));
        if (!asset) throw new Error("Project Asset not found");

        // Identify all capitalizable tasks for this project
        const tasks = await db.select().from(ppmTasks).where(and(
            eq(ppmTasks.projectId, asset.projectId),
            eq(ppmTasks.capitalizableFlag, true)
        ));

        if (tasks.length === 0) return [];

        const taskIds = tasks.map(t => t.id);

        // Find COSTED expenditure items on these tasks that haven't been assigned to an asset line
        const expItems = await db.select()
            .from(ppmExpenditureItems)
            .where(and(
                inArray(ppmExpenditureItems.taskId, taskIds),
                eq(ppmExpenditureItems.status, "COSTED"),
                eq(ppmExpenditureItems.capitalizationStatus, "CIP")
            ));

        const assetLines = [];
        for (const item of expItems) {
            // Check if already grouped (safety)
            const [existing] = await db.select().from(ppmAssetLines).where(eq(ppmAssetLines.expenditureItemId, item.id));
            if (existing) continue;

            const [line] = await db.insert(ppmAssetLines).values({
                projectAssetId: projectAssetId,
                expenditureItemId: item.id,
                capitalizedAmount: item.burdenedCost || item.rawCost,
                status: "NEW"
            }).returning();

            assetLines.push(line);
        }

        return assetLines;
    }

    /**
     * Interface project assets to Fixed Assets module (Capitalization)
     */
    async interfaceToFA(projectAssetId: string) {
        const [asset] = await db.select().from(ppmProjectAssets).where(eq(ppmProjectAssets.id, projectAssetId));
        if (!asset) throw new Error("Project Asset not found");

        const lines = await db.select().from(ppmAssetLines).where(and(
            eq(ppmAssetLines.projectAssetId, projectAssetId),
            eq(ppmAssetLines.status, "NEW")
        ));

        if (lines.length === 0) throw new Error("No asset lines to interface");

        const totalCost = lines.reduce((sum, l) => sum + parseFloat(l.capitalizedAmount), 0);

        // --- Integration Placeholder for FA Module ---
        const mockFaAssetId = `FA-${Date.now()}`;
        const mockAssetNumber = `ASN-${Math.floor(Math.random() * 10000)}`;

        // Update Project Asset Status
        await db.update(ppmProjectAssets)
            .set({
                status: "INTERFACED",
                faAssetId: mockFaAssetId,
                assetNumber: mockAssetNumber
            })
            .where(eq(ppmProjectAssets.id, projectAssetId));

        // Update Asset Lines Status
        await db.update(ppmAssetLines)
            .set({ status: "INTERFACED" })
            .where(eq(ppmAssetLines.projectAssetId, projectAssetId));

        // Update Expenditure Items to CAPITALIZED
        const expItemIds = lines.map(l => l.expenditureItemId);
        await db.update(ppmExpenditureItems)
            .set({ capitalizationStatus: "CAPITALIZED" })
            .where(inArray(ppmExpenditureItems.id, expItemIds));

        return {
            faAssetId: mockFaAssetId,
            assetNumber: mockAssetNumber,
            capitalizedAmount: totalCost
        };
    }

    /**
     * Calculate Project Performance Metrics (Earned Value Management)
     * Parity with Oracle Fusion EVM engine
     */
    async getProjectPerformance(projectId: string) {
        const [project] = await db.select().from(ppmProjects).where(eq(ppmProjects.id, projectId));
        if (!project) throw new Error("Project not found");

        // 1. Actual Cost (AC) - Sum of all burdened costs for the project's tasks
        const tasks = await db.select().from(ppmTasks).where(eq(ppmTasks.projectId, projectId));
        const taskIds = tasks.map(t => t.id);

        let actualCost = 0;
        if (taskIds.length > 0) {
            const results = await db.select({
                total: drizzleSql<string>`sum(COALESCE(burdened_cost, raw_cost))`
            })
                .from(ppmExpenditureItems)
                .where(inArray(ppmExpenditureItems.taskId, taskIds));

            actualCost = results[0]?.total ? parseFloat(results[0].total) : 0;
        }

        // 2. Planned Value (PV)
        // Simplified: PV = Budget * (Time Elapsed % or Manual Target)
        // For now, we'll assume linear PV across project duration for simplicity
        const now = new Date();
        const start = project.startDate;
        const end = project.endDate || new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year default
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = Math.min(Math.max(now.getTime() - start.getTime(), 0), totalDuration);
        const timeProgress = totalDuration > 0 ? elapsed / totalDuration : 0;

        const budget = parseFloat(project.budget || "0");
        const plannedValue = budget * timeProgress;

        // 3. Earned Value (EV)
        // EV = Budget * Percent Complete
        const progressPercent = parseFloat(project.percentComplete || "0") / 100;
        const earnedValue = budget * progressPercent;

        // 4. Variance & Indices
        const costVariance = earnedValue - actualCost;
        const scheduleVariance = earnedValue - plannedValue;
        const cpi = actualCost > 0 ? earnedValue / actualCost : 1;
        const spi = plannedValue > 0 ? earnedValue / plannedValue : 1;

        // 5. Forecasts
        // EAC = BAC / CPI
        const eac = cpi > 0 ? budget / cpi : budget;
        const etc = eac - actualCost;

        // 6. Save Snapshot
        const snapshot: InsertPpmPerformanceSnapshot = {
            projectId: projectId,
            plannedValue: plannedValue.toString(),
            actualCost: actualCost.toString(),
            earnedValue: earnedValue.toString(),
            cpi: cpi.toString(),
            spi: spi.toString(),
            etc: etc.toFixed(2),
            eac: eac.toFixed(2),
            snapshotDate: new Date()
        };

        const [savedSnapshot] = await db.insert(ppmPerformanceSnapshots).values(snapshot).returning();

        return {
            projectId,
            metrics: {
                budget,
                actualCost,
                plannedValue,
                earnedValue,
                costVariance,
                scheduleVariance,
                cpi,
                spi,
                etc,
                eac
            },
            snapshot: savedSnapshot
        };
    }

    /**
     * @deprecated Use applyBurdening() instead
     */
    async calculateBurden(expItemId: string, multiplier: number) {
        return this.applyBurdening(expItemId);
    }
}

export const ppmService = new PpmService();
