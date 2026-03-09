import { db } from "../../../db";
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
    type InsertPpmPerformanceSnapshot,
    inventoryTransactions, type InventoryTransaction,
    timeEntries, type TimeEntry,
    ppmProjectTemplates, ppmBillRateSchedules, ppmBillRates,
    ppmBillingRules, type InsertPpmBillingRule,
    connectors, webhookEvents
} from "@shared/schema";
import { eq, and, isNull, isNotNull, desc, inArray, sql, aliasedTable } from "drizzle-orm";
import { slaEngine } from "../../sla/sla.service";

export class PpmService {
    /**
     * Create a new financial project
     */
    async createProject(data: InsertPpmProject) {
        const [project] = await db.insert(ppmProjects).values(data).returning();
        return project;
    }

    /**
     * List all projects, optionally filtered by Business Unit
     */
    async getProjects(buId?: string) {
        const rows = await db
            .select()
            .from(ppmProjects)
            .where(buId ? eq(ppmProjects.entBusinessUnitId, buId) : undefined)
            .orderBy(desc(ppmProjects.createdAt));
        return rows;
    }

    /**
     * Get a single project by ID, with optional BU guard
     */
    async getProjectById(projectId: string, buId?: string) {
        const conditions = [eq(ppmProjects.id, projectId)];
        if (buId) conditions.push(eq(ppmProjects.entBusinessUnitId, buId));
        const [project] = await db
            .select()
            .from(ppmProjects)
            .where(and(...conditions));
        return project ?? null;
    }

    /**
     * Portfolio-level summary, filtered by BU
     */
    async getPortfolioSummary(buId?: string) {
        const whereClause = buId ? eq(ppmProjects.entBusinessUnitId, buId) : undefined;

        const rows = await db
            .select()
            .from(ppmProjects)
            .where(whereClause);

        const total = rows.length;
        const active = rows.filter(r => r.status === "ACTIVE").length;
        const draft = rows.filter(r => r.status === "DRAFT").length;
        const closed = rows.filter(r => r.status === "CLOSED").length;
        const totalBudget = rows.reduce((sum, r) => sum + Number(r.budget ?? 0), 0);
        const avgComplete = total > 0
            ? rows.reduce((sum, r) => sum + Number(r.percentComplete ?? 0), 0) / total
            : 0;

        return {
            totalProjects: total,
            activeProjects: active,
            draftProjects: draft,
            closedProjects: closed,
            totalBudget,
            avgPercentComplete: Math.round(avgComplete * 100) / 100,
            projectHealth: active > 0 ? (avgComplete > 75 ? "Good" : avgComplete > 40 ? "Fair" : "At Risk") : "No Active Projects",
        };
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
     * Get all expenditure types
     */
    async getExpenditureTypes() {
        return await db.select().from(ppmExpenditureTypes).orderBy(ppmExpenditureTypes.name);
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
     * Update all rules for a burden schedule (bulk replace)
     */
    async updateBurdenRules(scheduleId: string, rulesData: any[]) {
        // First delete existing rules for this schedule
        await db.delete(ppmBurdenRules).where(eq(ppmBurdenRules.scheduleId, scheduleId));

        if (rulesData.length === 0) return [];

        // Assuming rulesData maps correctly or finding expenditure types if names are provided instead
        // For simplicity, if it's a name we either create or find the exp type.
        const createdRules = [];
        for (const r of rulesData) {
            // Very simplified: assuming expenditureTypeId or name. If name is used, fetch ID.
            let expTypeId = r.expenditureTypeId;
            if (!expTypeId && r.name) {
                let [expType] = await db.select().from(ppmExpenditureTypes).where(eq(ppmExpenditureTypes.name, r.name)).limit(1);
                if (!expType) {
                    [expType] = await db.insert(ppmExpenditureTypes).values({
                        name: r.name,
                        unitOfMeasure: r.rateType === "FIXED" ? "Currency" : "Percentage"
                    }).returning();
                }
                expTypeId = expType.id;
            }

            const multiplier = r.rateType === "PERCENTAGE" ? (r.rate / 100).toFixed(4) : r.rate.toString();

            const [rule] = await db.insert(ppmBurdenRules).values({
                scheduleId,
                expenditureTypeId: expTypeId || "1", // Fallback
                multiplier: multiplier,
                precedence: Number(r.order) || 1,
                description: r.name
            }).returning();
            createdRules.push(rule);
        }
        return createdRules;
    }

    /**
     * Simulate a burden schedule against expenditure items
     */
    async simulateBurdenSchedule(scheduleId: string) {
        // Just return mock impact statistics for demo
        return {
            simulatedItems: 1204,
            rawCostTotal: 450000,
            simulatedBurdenCostTotal: 580000,
            effectiveMultiplier: "1.288"
        };
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
     * Collect Inventory Issue costs into PPM (Inventory -> Project)
     */
    async collectFromInventory() {
        // Find Inventory transactions of type 'ISSUE' linked to a project that haven't been collected yet.
        // There isn't a dedicated link table in this schema version, so we'll query inventoryTransactions
        // and check against a tracking mechanism (or for now, assume we collect all recent ones not yet costed
        // - but to be safe and avoiding dupes without a status flag on inventoryTransactions,
        // we'll rely on a "last run" timestamp or add a status column to inventoryTransactions in a real scenario.
        // For this implementation, we will fetch transactions where we can join to an existing expenditure item?
        // No, we need to create them. We will add a simple check: if an exp item exists with trx_ref = inv_trx_id.

        const transactions = await db.select()
            .from(inventoryTransactions)
            .where(and(
                eq(inventoryTransactions.transactionType, "ISSUE"),
                isNotNull(inventoryTransactions.projectId),
                isNotNull(inventoryTransactions.taskId)
            ));

        const collectedItems = [];

        // Fetch or create "Material" expenditure type
        let [expType] = await db.select().from(ppmExpenditureTypes).where(eq(ppmExpenditureTypes.name, "Material")).limit(1);
        if (!expType) {
            [expType] = await db.insert(ppmExpenditureTypes).values({
                name: "Material",
                unitOfMeasure: "Each",
                description: "Inventory Material Issue"
            }).returning();
        }

        for (const trx of transactions) {
            // Check deduplication
            const [existing] = await db.select().from(ppmExpenditureItems)
                .where(and(
                    eq(ppmExpenditureItems.transactionSource, "INVENTORY"),
                    eq(ppmExpenditureItems.transactionReference, trx.id)
                ));

            if (existing) continue;

            // Cost calculation (Quantity * Unit Cost from transaction)
            const quantity = trx.quantity.toString();
            const unitCost = trx.cost ? trx.cost.toString() : "0";
            const rawCost = (parseFloat(quantity) * parseFloat(unitCost)).toFixed(2);

            const [item] = await db.insert(ppmExpenditureItems).values({
                taskId: trx.taskId!,
                expenditureTypeId: expType.id,
                expenditureItemDate: trx.transactionDate || new Date(),
                quantity: quantity,
                unitCost: unitCost,
                rawCost: rawCost,
                transactionSource: "INVENTORY",
                transactionReference: trx.id,
                denomCurrencyCode: "USD", // Default
                status: "UNCOSTED",
                capitalizationStatus: "NOT_APPLICABLE"
            }).returning();

            collectedItems.push(item);
        }

        return collectedItems;
    }

    /**
     * Collect Labor costs into PPM (Time -> Project)
     */
    async collectFromLabor() {
        // Fetch APPROVED time entries not yet collected (using check against exp items similar to Inventory)
        // Ideally timeEntries would have a `ppm_expenditure_item_id` but for now we'll do soft check/create.
        // We will assume status='APPROVED' is the criteria.

        const entries = await db.select()
            .from(timeEntries)
            .where(eq(timeEntries.status, "APPROVED"));

        const collectedItems = [];

        // Fetch or create "Labor" expenditure type
        let [expType] = await db.select().from(ppmExpenditureTypes).where(eq(ppmExpenditureTypes.name, "Labor")).limit(1);
        if (!expType) {
            [expType] = await db.insert(ppmExpenditureTypes).values({
                name: "Labor",
                unitOfMeasure: "Hours",
                description: "Professional Labor Hours"
            }).returning();
        }

        for (const entry of entries) {
            // Check deduplication
            const [existing] = await db.select().from(ppmExpenditureItems)
                .where(and(
                    eq(ppmExpenditureItems.transactionSource, "LABOR"),
                    eq(ppmExpenditureItems.transactionReference, entry.id)
                ));

            if (existing) continue;

            // Cost calculation (Hours * Cost Rate)
            const hours = entry.hours.toString();
            const rate = entry.costRate ? entry.costRate.toString() : "0";
            const rawCost = (parseFloat(hours) * parseFloat(rate)).toFixed(2);

            const [item] = await db.insert(ppmExpenditureItems).values({
                taskId: entry.taskId!,
                expenditureTypeId: expType.id,
                expenditureItemDate: entry.date,
                quantity: hours,
                unitCost: rate,
                rawCost: rawCost,
                transactionSource: "LABOR",
                transactionReference: entry.id,
                denomCurrencyCode: "USD",
                status: "UNCOSTED",
                capitalizationStatus: "NOT_APPLICABLE" // Logic could refine this
            }).returning();

            collectedItems.push(item);
        }

        return collectedItems;
    }

    /**
     * Create Inter-Project Cross Charge (Borrow/Lend)
     * Creates a new Expenditure Item on the Receiver Project, linked to the original Source Item.
     */
    async createCrossCharge(sourceExpItemId: string, receiverTaskId: string) {
        const [sourceItem] = await db.select()
            .from(ppmExpenditureItems)
            .where(eq(ppmExpenditureItems.id, sourceExpItemId));

        if (!sourceItem) throw new Error("Source Expenditure Item not found");

        // Validate Receiver Task
        const [rxTask] = await db.select().from(ppmTasks).where(eq(ppmTasks.id, receiverTaskId));
        if (!rxTask) throw new Error("Receiver Task not found");

        const [sourceTask] = await db.select().from(ppmTasks).where(eq(ppmTasks.id, sourceItem.taskId));
        const [sourceProject] = await db.select().from(ppmProjects).where(eq(ppmProjects.id, sourceTask.projectId));
        const [rxProject] = await db.select().from(ppmProjects).where(eq(ppmProjects.id, rxTask.projectId));

        // Fetch or create "Cross Charge" expenditure type
        let [expType] = await db.select().from(ppmExpenditureTypes).where(eq(ppmExpenditureTypes.name, "Inter-Project Cross Charge")).limit(1);
        if (!expType) {
            [expType] = await db.insert(ppmExpenditureTypes).values({
                name: "Inter-Project Cross Charge",
                unitOfMeasure: "Currency",
                description: "Allocated cost from another project"
            }).returning();
        }

        // Calculate Transfer Price using DB Transfer Pricing Formulas
        let markupPercentage = 0;

        // Dynamic import to avoid circular dependency if costing isn't fully initialized here, or just inline query
        const { cstTransferPricingPolicies } = await import("../../../../shared/schema/costing.js");

        if (sourceProject.entBusinessUnitId && rxProject.entBusinessUnitId) {
            const [policy] = await db.select().from(cstTransferPricingPolicies)
                .where(and(
                    eq(cstTransferPricingPolicies.entityFrom, sourceProject.entBusinessUnitId),
                    eq(cstTransferPricingPolicies.entityTo, rxProject.entBusinessUnitId),
                    eq(cstTransferPricingPolicies.status, "Active")
                )).limit(1);

            if (policy && policy.method === "Cost Plus Markup") {
                markupPercentage = parseFloat(policy.markupPercent || "0") / 100;
            }
        }

        const transferCost = (parseFloat(sourceItem.burdenedCost || sourceItem.rawCost) * (1 + markupPercentage)).toFixed(2);

        // Create the Receiver Expenditure Item
        const [rxItem] = await db.insert(ppmExpenditureItems).values({
            taskId: receiverTaskId,
            expenditureTypeId: expType.id,
            expenditureItemDate: sourceItem.expenditureItemDate,
            quantity: sourceItem.quantity,
            unitCost: transferCost, // Total cost becomes unit cost for the receiver? Or keep structure?
            // Usually Cross Charge is a lump sum. Let's treat it as Quantity=1, UnitCost=TransferCost for simplicity unless uom matches.
            // If source is Labor (hours), we might keep hours?
            // For now, let's strictly do Financial Transfer (Currency)
            rawCost: transferCost,
            transactionSource: "PPM_INTER_PROJECT",
            transactionReference: sourceItem.id, // Link back to source item ID
            denomCurrencyCode: sourceItem.denomCurrencyCode,
            status: "UNCOSTED",
            capitalizationStatus: rxTask.capitalizableFlag ? "CIP" : "NOT_APPLICABLE"
        }).returning();

        return rxItem;
    }

    /**
     * Distribute costs to General Ledger
     * This follows the subledger accounting pattern (Oracle Fusion parity)
     */
    /**
     * Distribute costs to General Ledger
     * This follows the subledger accounting pattern (Oracle Fusion parity)
     * Now uses Central SLA Engine for Accounting Generation
     */
    async generateDistributions(expItemId: string) {
        const result = await db.select({
            item: ppmExpenditureItems,
            type: ppmExpenditureTypes,
            task: ppmTasks,
            project: ppmProjects
        })
            .from(ppmExpenditureItems)
            .innerJoin(ppmExpenditureTypes, eq(ppmExpenditureItems.expenditureTypeId, ppmExpenditureTypes.id))
            .innerJoin(ppmTasks, eq(ppmExpenditureItems.taskId, ppmTasks.id))
            .innerJoin(ppmProjects, eq(ppmTasks.projectId, ppmProjects.id))
            .where(eq(ppmExpenditureItems.id, expItemId));

        if (result.length === 0) throw new Error(`Expenditure Item ${expItemId} not found`);
        const { item, type, task, project } = result[0];

        // Determine Event
        let eventClassId = "PROJECT_COST";
        let eventTypeId = "PROJ_COST_USAGE";

        // Logic: CIP vs Expense
        // Note: CIP classification typically happens at capitalization, but costs can be flagged as CIP immediately.
        if (item.capitalizationStatus === "CIP" || task.capitalizableFlag) {
            eventClassId = "PROJECT_CIP";
            eventTypeId = "PROJ_CIP_ASSET";
        } else {
            if (type.name === "Labor") eventTypeId = "PROJ_COST_LABOR";
            else if (type.name.includes("Burden")) eventTypeId = "PROJ_COST_BURDEN";
            // Usage default
        }

        // Create Accounting
        const payload = {
            eventClassId,
            eventTypeId,
            entityId: item.id,
            entityTable: "ppm_expenditure_items",
            ledgerId: project.organizationId || "62ffbe4c-7c87-4d92-9654-2b7e8850b69c", // Default Ledger
            eventDate: item.expenditureItemDate,
            glDate: item.expenditureItemDate, // Should be derived from period
            currencyCode: item.denomCurrencyCode,
            amount: parseFloat(item.burdenedCost || item.rawCost),
            description: `Project Cost: ${project.projectNumber}`,
            sourceData: {
                projectNumber: project.projectNumber,
                taskNumber: task.taskNumber,
                transactionSource: item.transactionSource,
                expenditureType: type.name,
                ...item
            }
        };

        const header = await slaEngine.createAccounting(payload);

        // Update item status
        await db.update(ppmExpenditureItems)
            .set({ status: "DISTRIBUTED" })
            .where(eq(ppmExpenditureItems.id, expItemId));

        return header;
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
     * Get Assets for a Project
     */
    async getProjectAssets(projectId: string) {
        // Fetch Assets with optional line aggregation details
        const assets = await db.select().from(ppmProjectAssets).where(eq(ppmProjectAssets.projectId, projectId));

        if (!assets.length) return [];

        const assetsWithDetails = await Promise.all(assets.map(async (asset) => {
            const [stats] = await db.select({
                count: sql<number>`count(*)`,
                total: sql<string>`sum(${ppmAssetLines.capitalizedAmount})`
            }).from(ppmAssetLines)
                .where(eq(ppmAssetLines.projectAssetId, asset.id));

            return {
                ...asset,
                lineCount: Number(stats?.count || 0),
                totalCapitalized: Number(stats?.total || 0)
            };
        }));

        return assetsWithDetails;
    }

    /**
     * Get Portfolio Assets (All Projects) with resolved line aggregations
     */
    async getPortfolioAssets(buId?: string) {
        let baseQuery = db.select({
            asset: ppmProjectAssets,
            project: ppmProjects
        }).from(ppmProjectAssets)
            .innerJoin(ppmProjects, eq(ppmProjectAssets.projectId, ppmProjects.id));

        if (buId) {
            baseQuery = baseQuery.where(eq(ppmProjects.entBusinessUnitId, buId)) as any;
        }

        const assets = await baseQuery;
        if (!assets.length) return [];

        const assetsWithDetails = await Promise.all(assets.map(async ({ asset, project }) => {
            const [stats] = await db.select({
                count: sql<number>`count(*)`,
                total: sql<string>`sum(${ppmAssetLines.capitalizedAmount})`
            }).from(ppmAssetLines)
                .where(eq(ppmAssetLines.projectAssetId, asset.id));

            return {
                id: asset.id,
                projectId: project.id,
                projectName: project.name,
                assetName: asset.assetName,
                assetType: asset.assetType || "CIP",
                status: asset.status,
                totalCost: Number(stats?.total || 0),
                lineCount: Number(stats?.count || 0)
            };
        }));
        return assetsWithDetails;
    }

    /**
     * Consolidate CIP Assets Batch
     */
    async consolidateAssets(assetIds: string[]) {
        if (!assetIds.length) throw new Error("No assets provided");
        // For each asset, run grouping and FA interface
        const results = [];
        for (const id of assetIds) {
            await this.generateAssetLines(id);
            const res = await this.interfaceToFA(id);
            results.push(res);
        }
        return {
            batchName: `Batch-${Date.now()}`,
            assetCount: assetIds.length,
            results
        };
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
                total: sql<string>`sum(COALESCE(burdened_cost, raw_cost))`
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

        // Retrieve historical snapshots for trend charts
        const snapshotHistory = await db.select().from(ppmPerformanceSnapshots)
            .where(eq(ppmPerformanceSnapshots.projectId, projectId))
            .orderBy(ppmPerformanceSnapshots.snapshotDate);

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
            snapshot: savedSnapshot,
            history: snapshotHistory
        };
    }

    /**
     * @deprecated Use applyBurdening() instead
     */
    async calculateBurden(expItemId: string, multiplier: number) {
        return this.applyBurdening(expItemId);
    }

    /**
     * Workflow: Transition Project Status with Validations
     */
    async transitionProjectStatus(projectId: string, newStatus: "ACTIVE" | "CLOSED" | "ON_HOLD") {
        const [project] = await db.select().from(ppmProjects).where(eq(ppmProjects.id, projectId));
        if (!project) throw new Error("Project not found");

        if (project.status === newStatus) return project;

        // Validation Rules
        if (newStatus === "CLOSED") {
            // Check for uncosted items
            const uncostedItems = await db.select({ count: sql<number>`count(*)` })
                .from(ppmExpenditureItems)
                .where(and(
                    inArray(ppmExpenditureItems.taskId, db.select({ id: ppmTasks.id }).from(ppmTasks).where(eq(ppmTasks.projectId, projectId))),
                    eq(ppmExpenditureItems.status, "UNCOSTED")
                ));

            if (Number(uncostedItems[0].count) > 0) {
                throw new Error(`Cannot close project: ${uncostedItems[0].count} uncosted expenditure items remain.`);
            }

            // Check for CIP assets not interfaced (optional strict rule)
            const pendingAssets = await db.select({ count: sql<number>`count(*)` })
                .from(ppmAssetLines)
                .where(and(
                    eq(ppmAssetLines.status, "NEW"),
                    inArray(ppmAssetLines.projectAssetId, db.select({ id: ppmProjectAssets.id }).from(ppmProjectAssets).where(eq(ppmProjectAssets.projectId, projectId)))
                ));

            if (Number(pendingAssets[0].count) > 0) {
                throw new Error(`Cannot close project: ${pendingAssets[0].count} pending asset lines not interfaced to FA.`);
            }
        }

        const [updated] = await db.update(ppmProjects)
            .set({ status: newStatus })
            .where(eq(ppmProjects.id, projectId))
            .returning();

        return updated;
    }

    /**
     * Intelligence: Check for Project Health Alerts
     */
    async checkProjectAlerts(projectId: string) {
        const performance = await this.getProjectPerformance(projectId);
        const alerts: string[] = [];
        const metrics = performance.metrics;

        // CPI Threshold (Cost Efficiency)
        if (metrics.cpi < 0.85) {
            alerts.push(`CRITICAL: cost efficiency is low (CPI: ${metrics.cpi.toFixed(2)}). Project is over budget for work performed.`);
        } else if (metrics.cpi < 0.95) {
            alerts.push(`WARNING: cost efficiency is degrading (CPI: ${metrics.cpi.toFixed(2)}).`);
        }

        // SPI Threshold (Schedule Efficiency)
        if (metrics.spi < 0.85) {
            alerts.push(`CRITICAL: schedule is slipping (SPI: ${metrics.spi.toFixed(2)}). Work is behind schedule.`);
        }

        // Budget Consumption
        const burnRate = metrics.actualCost / metrics.budget;
        if (burnRate > 0.90 && metrics.earnedValue < metrics.plannedValue) {
            alerts.push(`RISK: 90% budget consumed but PV not met.`);
        }

        return {
            projectId,
            status: alerts.length > 0 ? "AT_RISK" : "HEALTHY",
            alerts
        };
    }

    /**
     * Configuration (L8): Create Project From Template
     */
    async createProjectFromTemplate(templateId: string, overrides: { name: string, projectNumber: string, startDate: Date }) {
        const [template] = await db.select().from(ppmProjectTemplates).where(eq(ppmProjectTemplates.id, templateId));
        if (!template) throw new Error("Template not found");

        // Clone project header
        const project = await this.createProject({
            name: overrides.name,
            projectNumber: overrides.projectNumber,
            projectType: template.projectType as any,
            startDate: overrides.startDate,
            description: template.description || undefined,
            //@ts-ignore - burdenScheduleId is valid in insert schema but might be missing in type inference if not updated
            burdenScheduleId: template.defaultBurdenScheduleId,
            status: "DRAFT"
        });

        // Future: Clone standard WBS tasks from template if tasks were associated with templates

        return project;
    }

    /**
     * Master Data (L9): Get Bill Rate
     * Hierarchy: Person Specific -> Job Title -> Expenditure Type -> Default 0
     */
    async getBillRate(scheduleId: string, personId?: string, jobTitle?: string, expTypeId?: string): Promise<string> {
        // 1. Person Specific
        if (personId) {
            const [rate] = await db.select().from(ppmBillRates)
                .where(and(eq(ppmBillRates.scheduleId, scheduleId), eq(ppmBillRates.personId, personId), isNull(ppmBillRates.endDate)));
            if (rate) return rate.rate;
        }

        // 2. Job Title
        if (jobTitle) {
            const [rate] = await db.select().from(ppmBillRates)
                .where(and(eq(ppmBillRates.scheduleId, scheduleId), eq(ppmBillRates.jobTitle, jobTitle), isNull(ppmBillRates.endDate)));
            if (rate) return rate.rate;
        }

        // 3. Expenditure Type (Non-Labor)
        if (expTypeId) {
            const [rate] = await db.select().from(ppmBillRates)
                .where(and(eq(ppmBillRates.scheduleId, scheduleId), eq(ppmBillRates.expenditureTypeId, expTypeId), isNull(ppmBillRates.endDate)));
            if (rate) return rate.rate;
        }

        return "0.00";
    }

    /**
     * Get paginated expenditure items for inquiry
     */
    async getExpenditureItems(page: number = 1, pageSize: number = 20, projectId?: string) {
        const offset = (page - 1) * pageSize;

        // Build where clause
        let whereClause = undefined;
        if (projectId) {
            // Need to join to tasks to filter by project
            // This is complex with simple drizzle query builder, might need raw sql or detailed join
            // For now, let's just return all items if no project specified, or filter in memory (not scalable)
            // Better: Step 1 - Get Task IDs for project. Step 2 - generic specific query.
            const tasks = await db.select({ id: ppmTasks.id }).from(ppmTasks).where(eq(ppmTasks.projectId, projectId));
            const taskIds = tasks.map(t => t.id);
            if (taskIds.length > 0) {
                whereClause = inArray(ppmExpenditureItems.taskId, taskIds);
            } else {
                return { items: [], total: 0 };
            }
        }

        const items = await db.select({
            id: ppmExpenditureItems.id,
            taskId: ppmExpenditureItems.taskId,
            taskNumber: ppmTasks.taskNumber,
            taskName: ppmTasks.name,
            projectName: ppmProjects.name,
            projectNumber: ppmProjects.projectNumber,
            expenditureType: ppmExpenditureTypes.name,
            date: ppmExpenditureItems.expenditureItemDate,
            quantity: ppmExpenditureItems.quantity,
            rawCost: ppmExpenditureItems.rawCost,
            burdenedCost: ppmExpenditureItems.burdenedCost,
            status: ppmExpenditureItems.status,
            source: ppmExpenditureItems.transactionSource
        })
            .from(ppmExpenditureItems)
            .leftJoin(ppmTasks, eq(ppmExpenditureItems.taskId, ppmTasks.id))
            .leftJoin(ppmProjects, eq(ppmTasks.projectId, ppmProjects.id))
            .leftJoin(ppmExpenditureTypes, eq(ppmExpenditureItems.expenditureTypeId, ppmExpenditureTypes.id))
            .where(whereClause)
            .limit(pageSize)
            .offset(offset)
            .orderBy(desc(ppmExpenditureItems.expenditureItemDate));

        const totalResult = await db.select({ count: sql<number>`count(*)` })
            .from(ppmExpenditureItems)
            .where(whereClause);

        return {
            items,
            total: Number(totalResult[0]?.count || 0)
        };
    }

    /**
     * Get list of burden schedules with rules
     */
    async getBurdenSchedules() {
        const schedules = await db.select().from(ppmBurdenSchedules).orderBy(desc(ppmBurdenSchedules.createdAt));

        // Fetch rules for each schedule
        const schedulesWithRules = await Promise.all(schedules.map(async (sch) => {
            const rules = await db.select({
                id: ppmBurdenRules.id,
                expenditureType: ppmExpenditureTypes.name,
                multiplier: ppmBurdenRules.multiplier,
                precedence: ppmBurdenRules.precedence
            })
                .from(ppmBurdenRules)
                .leftJoin(ppmExpenditureTypes, eq(ppmBurdenRules.expenditureTypeId, ppmExpenditureTypes.id))
                .where(eq(ppmBurdenRules.scheduleId, sch.id))
                .orderBy(desc(ppmBurdenRules.precedence));

            return { ...sch, rules };
        }));

        return schedulesWithRules;
    }

    /**
     * Get Assets for a project or all assets
     */
    async getProjectAssetsPaginated(projectId?: string, limit: number = 20, offset: number = 0) {
        let baseQuery = db.select().from(ppmProjectAssets);
        let countQuery = db.select({ count: sql<number>`count(*)` }).from(ppmProjectAssets);

        if (projectId) {
            baseQuery = baseQuery.where(eq(ppmProjectAssets.projectId, projectId));
            countQuery = countQuery.where(eq(ppmProjectAssets.projectId, projectId));
        }

        const assets = await baseQuery
            .limit(limit)
            .offset(offset)
            .orderBy(desc(ppmProjectAssets.createdAt));

        const [totalCount] = await countQuery;

        return {
            items: assets,
            total: Number(totalCount.count)
        };
    }

    /**
     * Get Cost Distributions (SLA Events)
     */
    async getCostDistributions(projectId?: string, expenditureItemId?: string, limit: number = 20, offset: number = 0) {
        // Aliases for joining glCodeCombinations twice (Debit and Credit)
        const drCc = aliasedTable(glCodeCombinations, "dr_cc");
        const crCc = aliasedTable(glCodeCombinations, "cr_cc");

        const baseQuery = db.select({
            id: ppmCostDistributions.id,
            amount: ppmCostDistributions.amount,
            drAccount: drCc.code, // Joined Segment Labels (AUDIT-FIN-004)
            crAccount: crCc.code, // Joined Segment Labels (AUDIT-FIN-004)
            status: ppmCostDistributions.status,
            lineType: ppmCostDistributions.lineType,
            accountingDate: ppmCostDistributions.createdAt,
            expenditureItemDate: ppmExpenditureItems.expenditureItemDate,
            projectName: ppmProjects.name,
            taskNumber: ppmTasks.taskNumber
        })
            .from(ppmCostDistributions)
            .innerJoin(ppmExpenditureItems, eq(ppmCostDistributions.expenditureItemId, ppmExpenditureItems.id))
            .innerJoin(ppmTasks, eq(ppmExpenditureItems.taskId, ppmTasks.id))
            .innerJoin(ppmProjects, eq(ppmTasks.projectId, ppmProjects.id))
            .leftJoin(drCc, eq(ppmCostDistributions.drCodeCombinationId, drCc.id))
            .leftJoin(crCc, eq(ppmCostDistributions.crCodeCombinationId, crCc.id));

        let finalQuery = baseQuery;

        // Count Query for Pagination (AUDIT-FIN-002)
        const countQuery = db.select({ count: sql<number>`count(*)` })
            .from(ppmCostDistributions)
            .innerJoin(ppmExpenditureItems, eq(ppmCostDistributions.expenditureItemId, ppmExpenditureItems.id))
            .innerJoin(ppmTasks, eq(ppmExpenditureItems.taskId, ppmTasks.id))
            .innerJoin(ppmProjects, eq(ppmTasks.projectId, ppmProjects.id));

        if (expenditureItemId) {
            finalQuery = finalQuery.where(eq(ppmCostDistributions.expenditureItemId, expenditureItemId));
        } else if (projectId) {
            finalQuery = finalQuery.where(eq(ppmProjects.id, projectId));
        }

        const items = await finalQuery
            .limit(limit)
            .offset(offset)
            .orderBy(desc(ppmCostDistributions.createdAt));

        const [totalCount] = await countQuery;

        return {
            items,
            total: Number(totalCount.count)
        };
    }

    /**
     * Get all bill rate schedules
     */
    async getBillRateSchedules() {
        return await db.select().from(ppmBillRateSchedules).orderBy(desc(ppmBillRateSchedules.createdAt));
    }

    /**
     * Create a new bill rate schedule
     */
    async createBillRateSchedule(data: any) {
        const [schedule] = await db.insert(ppmBillRateSchedules).values(data).returning();
        return schedule;
    }

    /**
     * Get rates for a specific schedule
     */
    async getBillRates(scheduleId: string) {
        return await db.select({
            id: ppmBillRates.id,
            scheduleId: ppmBillRates.scheduleId,
            personId: ppmBillRates.personId,
            jobTitle: ppmBillRates.jobTitle,
            expenditureType: ppmExpenditureTypes.name,
            expenditureTypeId: ppmBillRates.expenditureTypeId,
            rate: ppmBillRates.rate,
            startDate: ppmBillRates.startDate,
            endDate: ppmBillRates.endDate
        })
            .from(ppmBillRates)
            .leftJoin(ppmExpenditureTypes, eq(ppmBillRates.expenditureTypeId, ppmExpenditureTypes.id))
            .where(eq(ppmBillRates.scheduleId, scheduleId))
            .orderBy(desc(ppmBillRates.createdAt));
    }

    /**
     * Add a rate to a schedule
     */
    async addBillRate(data: any) {
        const [rate] = await db.insert(ppmBillRates).values(data).returning();
        return rate;
    }

    /**
     * Get all project templates
     */
    async getProjectTemplates() {
        return await db.select().from(ppmProjectTemplates).orderBy(desc(ppmProjectTemplates.createdAt));
    }

    /**
     * Create a new project template
     */
    async createProjectTemplate(data: any) {
        const [template] = await db.insert(ppmProjectTemplates).values(data).returning();
        return template;
    }

    /**
     * Get Pending Transactions (AP, Inventory, etc. ready for import)
     */
    async getPendingTransactions() {
        // 1. AP Invoice Lines
        const apLines = await db.select({
            id: apInvoiceLines.id,
            source: sql<string>`'AP'`,
            date: apInvoices.invoiceDate,
            description: apInvoiceLines.description,
            amount: apInvoiceLines.amount,
            currency: apInvoices.invoiceCurrencyCode,
            projectName: ppmProjects.name,
            taskNumber: ppmTasks.taskNumber
        })
            .from(apInvoiceLines)
            .innerJoin(apInvoices, eq(apInvoiceLines.invoiceId, apInvoices.id))
            .leftJoin(ppmProjects, eq(apInvoiceLines.ppmProjectId, ppmProjects.id))
            .leftJoin(ppmTasks, eq(apInvoiceLines.ppmTaskId, ppmTasks.id))
            .where(and(
                isNotNull(apInvoiceLines.ppmProjectId),
                isNotNull(apInvoiceLines.ppmTaskId),
                isNull(apInvoiceLines.ppmExpenditureItemId),
                eq(apInvoices.validationStatus, "VALIDATED")
            ));

        // 2. Inventory Material Issues (ISSUE type, linked to project, not yet costed)
        const invLines = await db.select({
            id: inventoryTransactions.id,
            source: sql<string>`'INVENTORY'`,
            date: inventoryTransactions.transactionDate,
            description: inventoryTransactions.referenceNumber,
            amount: sql<string>`(${inventoryTransactions.quantity} * ${inventoryTransactions.cost})::numeric`,
            currency: sql<string>`'USD'`,
            projectName: ppmProjects.name,
            taskNumber: ppmTasks.taskNumber
        })
            .from(inventoryTransactions)
            .innerJoin(ppmProjects, eq(inventoryTransactions.projectId, ppmProjects.id))
            .innerJoin(ppmTasks, eq(inventoryTransactions.taskId, ppmTasks.id))
            .leftJoin(ppmExpenditureItems, and(
                eq(ppmExpenditureItems.transactionSource, "INVENTORY"),
                eq(ppmExpenditureItems.transactionReference, inventoryTransactions.id)
            ))
            .where(and(
                eq(inventoryTransactions.transactionType, "ISSUE"),
                isNull(ppmExpenditureItems.id)
            ));

        // 3. Labor / Time Entries (APPROVED status, linked to project, not yet costed)
        const laborLines = await db.select({
            id: timeEntries.id,
            source: sql<string>`'LABOR'`,
            date: timeEntries.date,
            description: timeEntries.description,
            amount: sql<string>`(${timeEntries.hours} * ${timeEntries.costRate})::numeric`,
            currency: sql<string>`'USD'`,
            projectName: ppmProjects.name,
            taskNumber: ppmTasks.taskNumber
        })
            .from(timeEntries)
            .innerJoin(ppmProjects, eq(timeEntries.projectId, ppmProjects.id))
            .innerJoin(ppmTasks, eq(timeEntries.taskId, ppmTasks.id))
            .leftJoin(ppmExpenditureItems, and(
                eq(ppmExpenditureItems.transactionSource, "LABOR"),
                eq(ppmExpenditureItems.transactionReference, timeEntries.id)
            ))
            .where(and(
                eq(timeEntries.status, "APPROVED"),
                isNull(ppmExpenditureItems.id)
            ));

        return [...apLines, ...invLines, ...laborLines];
    }

    /**
     * Get Billing Rules for a project
     */
    async getBillingRules(projectId: string) {
        return await db.select().from(ppmBillingRules).where(eq(ppmBillingRules.projectId, projectId)).orderBy(desc(ppmBillingRules.createdAt));
    }

    /**
     * Create a Billing Rule
     */
    async createBillingRule(data: InsertPpmBillingRule) {
        const [rule] = await db.insert(ppmBillingRules).values(data).returning();
        return rule;
    }

    /**
     * Delete a Billing Rule
     */
    async deleteBillingRule(id: string) {
        return await db.delete(ppmBillingRules).where(eq(ppmBillingRules.id, id));
    }

    // ----------------------------------------------------
    // INTEGRATIONS (ERP & WEBHOOKS)
    // ----------------------------------------------------

    async getConnections() {
        return await db.select().from(connectors).where(eq(connectors.type, "erp")).orderBy(desc(connectors.createdAt));
    }

    async configureConnection(data: any) {
        const [conn] = await db.insert(connectors).values({
            name: data.name,
            type: "erp",
            config: {
                system: data.system,
                endpoint: data.endpoint,
                apiKey: data.apiKey
            },
            status: "CONNECTED"
        }).returning();
        return conn;
    }

    async getIntegrationHistory() {
        // We'll mock connectionId since webhookEvents uses connectorInstanceId
        const events = await db.select().from(webhookEvents).orderBy(desc(webhookEvents.createdAt)).limit(50);
        return events.map(e => ({
            id: e.id,
            connectionId: e.connectorInstanceId,
            startTime: e.createdAt,
            endTime: e.processedAt,
            status: e.status === "processed" ? "SUCCESS" : e.status === "failed" ? "FAILED" : "RUNNING",
            recordsProcessed: (e.payload as any)?.processedCount || 0,
            recordsFailed: (e.payload as any)?.errorCount || 0,
            errorMessage: (e.payload as any)?.errorMessage || ""
        }));
    }

    async syncConnection(connectionId: string) {
        // Mock a webhook event for syncing
        const [event] = await db.insert(webhookEvents).values({
            connectorInstanceId: connectionId,
            eventType: "erp.sync.start",
            status: "pending",
            payload: {
                processedCount: 0,
                errorCount: 0
            }
        }).returning();
        return event;
    }
}

export const ppmService = new PpmService();
