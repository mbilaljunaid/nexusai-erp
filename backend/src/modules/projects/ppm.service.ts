/**
 * PPM Service — P0.13-P0.15 Remediation
 * Implements the missing portfolio analytics layer:
 *  - checkProjectAlerts: budget overrun + schedule delay detection
 *  - collectFromAP: pulls AP invoices tagged to a project
 *  - generateDistributions: creates cost distribution journals
 *  - interfaceToFA: capitalizes eligible project costs to Fixed Assets
 */
import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../../../shared/schema/index';
import { eq, and, lt } from 'drizzle-orm';

@Injectable()
export class PpmService {
    private readonly logger = new Logger(PpmService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>,
    ) { }

    // ── P0.13: CHECK PROJECT ALERTS ───────────────────────────────────────────
    async checkProjectAlerts(projectId: string): Promise<any> {
        const project: any = await this.db.query.projects2.findFirst({
            where: eq(schema.projects2.id, projectId)
        } as any);
        if (!project) throw new NotFoundException(`Project ${projectId} not found`);

        const alerts: any[] = [];

        // Use ppmTasks for schedule assessment
        const tasks: any[] = await this.db.query.ppmTasks.findMany({
            where: eq(schema.ppmTasks.projectId, projectId)
        } as any).catch(() => []);

        const today = new Date();
        const overdueTasks = tasks.filter((t: any) => {
            const due = t.plannedFinishDate ? new Date(t.plannedFinishDate) : null;
            return due && due < today && t.status !== 'Completed';
        });

        if (overdueTasks.length > 0) {
            alerts.push({
                type: 'SCHEDULE_DELAY',
                severity: overdueTasks.length >= 3 ? 'High' : 'Medium',
                message: `${overdueTasks.length} task(s) are overdue`,
                impactedTasks: overdueTasks.map((t: any) => ({ id: t.id, name: t.taskName, plannedFinish: t.plannedFinishDate })),
            });
        }

        // Check AP invoice lines tagged to project for budget analysis
        const linkedInvoices: any[] = await this.db.query.apInvoiceLines.findMany({
            where: eq(schema.apInvoiceLines.ppmProjectId, projectId)
        } as any).catch(() => []);

        const totalActualCost = linkedInvoices.reduce((sum: number, l: any) => sum + Number(l.amount || 0), 0);
        const budgetedAmount = Number(project.budget || 0);

        if (budgetedAmount > 0 && totalActualCost > budgetedAmount * 0.9) {
            const overrunPct = ((totalActualCost - budgetedAmount) / budgetedAmount * 100).toFixed(1);
            alerts.push({
                type: 'BUDGET_OVERRUN',
                severity: totalActualCost > budgetedAmount ? 'High' : 'Medium',
                message: `Project is at ${totalActualCost > budgetedAmount ? `${overrunPct}% over` : '>90% of'} budget`,
                budgeted: budgetedAmount,
                actual: totalActualCost,
                overrunPercent: overrunPct,
            });
        }

        this.logger.log(`Project ${projectId}: ${alerts.length} alerts found`);
        return { projectId, projectName: project.name, alerts };
    }

    // ── P0.13: COLLECT FROM AP ─────────────────────────────────────────────────
    async collectFromAP(projectId: string): Promise<any> {
        const project: any = await this.db.query.projects2.findFirst({
            where: eq(schema.projects2.id, projectId)
        } as any);
        if (!project) throw new NotFoundException(`Project ${projectId} not found`);

        const invoiceLines: any[] = await this.db.query.apInvoiceLines.findMany({
            where: eq(schema.apInvoiceLines.ppmProjectId, projectId)
        } as any).catch(() => []);

        const totalCollected = invoiceLines.reduce((sum: number, l: any) => sum + Number(l.amount || 0), 0);

        this.logger.log(`Collected ${invoiceLines.length} AP lines for project ${projectId}, total=${totalCollected}`);
        return {
            projectId,
            projectName: project.name,
            invoiceLinesCollected: invoiceLines.length,
            totalCostCollected: totalCollected,
            lines: invoiceLines.map((l: any) => ({
                invoiceLineId: l.id,
                description: l.description,
                amount: Number(l.amount),
            })),
        };
    }

    // ── P0.14: GENERATE DISTRIBUTIONS ─────────────────────────────────────────
    async generateDistributions(projectId: string): Promise<any> {
        const project: any = await this.db.query.projects2.findFirst({
            where: eq(schema.projects2.id, projectId)
        } as any);
        if (!project) throw new NotFoundException(`Project ${projectId} not found`);

        const invoiceLines: any[] = await this.db.query.apInvoiceLines.findMany({
            where: eq(schema.apInvoiceLines.ppmProjectId, projectId)
        } as any).catch(() => []);

        const totalAmount = invoiceLines.reduce((sum: number, l: any) => sum + Number(l.amount || 0), 0);

        if (totalAmount === 0) {
            return { projectId, message: 'No costs to distribute', journalsCreated: 0 };
        }

        // Create distribution journal header
        const [journal] = await this.db.insert(schema.glJournals).values({
            journalNumber: `PPM-DIST-${Date.now()}`,
            ledgerId: 'PRIMARY',
            source: 'Project Costs',
            status: 'Posted',
            description: `Cost Distribution for Project ${project.name}`,
            currencyCode: 'USD',
            createdBy: 'system-ppm',
        } as any).returning();

        // Journal lines
        await this.db.insert(schema.glJournalLines).values([
            {
                journalId: journal.id,
                accountId: '1600-Project-WIP',
                currencyCode: 'USD',
                enteredDebit: totalAmount.toString(),
                enteredCredit: '0',
                debit: totalAmount.toString(),
                credit: '0',
                description: `Project WIP: ${project.name}`,
            } as any,
            {
                journalId: journal.id,
                accountId: '2000-AP-Liability',
                currencyCode: 'USD',
                enteredDebit: '0',
                enteredCredit: totalAmount.toString(),
                debit: '0',
                credit: totalAmount.toString(),
                description: `AP Offset: ${project.name}`,
            } as any,
        ]);

        this.logger.log(`Distribution journal created for project ${projectId}: ${totalAmount}`);
        return {
            projectId,
            projectName: project.name,
            journalsCreated: 1,
            totalDistributed: totalAmount,
            period: this._getCurrentPeriod(),
        };
    }

    // ── P0.15: INTERFACE TO FA ─────────────────────────────────────────────────
    async interfaceToFA(projectId: string): Promise<any> {
        const project: any = await this.db.query.projects2.findFirst({
            where: eq(schema.projects2.id, projectId)
        } as any);
        if (!project) throw new NotFoundException(`Project ${projectId} not found`);

        const invoiceLines: any[] = await this.db.query.apInvoiceLines.findMany({
            where: and(
                eq(schema.apInvoiceLines.ppmProjectId, projectId),
                eq(schema.apInvoiceLines.lineType, 'ITEM'),
            )
        } as any).catch(() => []);

        const totalToCapitalize = invoiceLines.reduce((sum: number, l: any) => sum + Number(l.amount || 0), 0);

        if (totalToCapitalize === 0) {
            return { projectId, message: 'No capital expenditure lines found for FA interface', assetDraftsCreated: 0 };
        }

        // Use faMassAdditions (Oracle FA parity — project costs stage through mass additions)
        await this.db.insert(schema.faMassAdditions).values({
            description: `Project Capitalization: ${project.name}`,
            bookTypeCode: 'CORP',
            cost: totalToCapitalize.toString(),
            dateEffective: new Date(),
            postingStatus: 'POST',
            unitOfMeasure: 'EA',
            units: 1,
        } as any);

        this.logger.log(`FA Interface: Mass Addition created for project ${projectId}, amount=${totalToCapitalize}`);
        return {
            projectId,
            projectName: project.name,
            assetDraftsCreated: 1,
            totalCapitalized: totalToCapitalize,
            message: 'Mass Addition created. Review and post in Fixed Assets module.',
        };
    }

    private _getCurrentPeriod(): string {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'short' });
        return `${month}-${now.getFullYear().toString().slice(2)}`;
    }
}
