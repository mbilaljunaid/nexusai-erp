import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { cases, caseComments, type Case, type InsertCase } from "@shared/schema";

export class CaseManagementService {

    /**
     * Get all cases with optional filters
     */
    async getAll(filters?: {
        tenantId?: string;
        status?: string;
        priority?: string;
        assignedTo?: string;
        slaStatus?: string;
    }): Promise<Case[]> {
        const conditions = [];

        if (filters?.tenantId) {
            conditions.push(eq(cases.tenantId, filters.tenantId));
        }
        if (filters?.status) {
            conditions.push(eq(cases.status, filters.status));
        }
        if (filters?.priority) {
            conditions.push(eq(cases.priority, filters.priority));
        }
        if (filters?.assignedTo) {
            conditions.push(eq(cases.assignedTo, filters.assignedTo));
        }
        if (filters?.slaStatus) {
            conditions.push(eq(cases.slaStatus, filters.slaStatus));
        }

        return await db
            .select()
            .from(cases)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(cases.createdAt));
    }

    /**
     * Get case by ID with comments
     */
    async getById(id: string): Promise<{ case: Case; comments: any[] } | null> {
        const [caseRecord] = await db
            .select()
            .from(cases)
            .where(eq(cases.id, id));

        if (!caseRecord) return null;

        const comments = await db
            .select()
            .from(caseComments)
            .where(eq(caseComments.caseId, id))
            .orderBy(desc(caseComments.createdAt));

        return { case: caseRecord, comments };
    }

    /**
     * Create new case
     */
    async create(data: InsertCase): Promise<Case> {
        // Calculate SLA deadline based on priority
        const slaHours = this.getSlaHours(data.priority || 'MEDIUM');
        const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

        const [caseRecord] = await db
            .insert(cases)
            .values({
                ...data,
                slaDeadline,
                slaStatus: 'ON_TIME'
            })
            .returning();

        return caseRecord;
    }

    /**
     * Update case
     */
    async update(id: string, data: Partial<InsertCase>): Promise<Case> {
        const [caseRecord] = await db
            .update(cases)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(cases.id, id))
            .returning();

        // Check SLA status
        await this.checkSlaStatus(id);

        return caseRecord;
    }

    /**
     * Resolve case
     */
    async resolve(id: string): Promise<Case> {
        const [caseRecord] = await db
            .update(cases)
            .set({
                status: 'RESOLVED',
                resolvedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(cases.id, id))
            .returning();

        return caseRecord;
    }

    /**
     * Escalate case
     */
    async escalate(id: string): Promise<Case> {
        const [caseRecord] = await db
            .update(cases)
            .set({
                status: 'ESCALATED',
                priority: 'CRITICAL',
                slaStatus: 'BREACHED',
                updatedAt: new Date()
            })
            .where(eq(cases.id, id))
            .returning();

        return caseRecord;
    }

    /**
     * Check and update SLA status
     */
    private async checkSlaStatus(caseId: string): Promise<void> {
        const [caseRecord] = await db
            .select()
            .from(cases)
            .where(eq(cases.id, caseId));

        if (!caseRecord || !caseRecord.slaDeadline) return;

        const now = new Date();
        const deadline = new Date(caseRecord.slaDeadline);
        const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

        let slaStatus = 'ON_TIME';
        if (now > deadline) {
            slaStatus = 'BREACHED';
        } else if (hoursRemaining < 2) {
            slaStatus = 'AT_RISK';
        }

        if (slaStatus !== caseRecord.slaStatus) {
            await db
                .update(cases)
                .set({ slaStatus })
                .where(eq(cases.id, caseId));
        }
    }

    /**
     * Get SLA hours based on priority
     */
    private getSlaHours(priority: string): number {
        switch (priority) {
            case 'CRITICAL': return 4;
            case 'HIGH': return 24;
            case 'MEDIUM': return 72;
            case 'LOW': return 168;
            default: return 72;
        }
    }
}

export const caseManagementService = new CaseManagementService();
