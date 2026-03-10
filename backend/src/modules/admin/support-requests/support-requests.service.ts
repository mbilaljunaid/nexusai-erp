import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { contactSubmissions } from '@shared/schema/common';
import type { ContactSubmission, InsertContactSubmission } from '@shared/schema/common';

interface SupportRequest {
    id: string;
    subject: string;
    type: string;
    priority: string;
    description: string;
    email: string;
    status: string;
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class SupportRequestsService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
    ) { }

    async findAll(query?: any): Promise<{ data: SupportRequest[] }> {
        const allSubmissions = await this.db.select().from(contactSubmissions);

        // Map database records to expected format
        let filtered = allSubmissions.map(s => ({
            id: s.id,
            subject: s.subject,
            type: 'support', // contact_submissions doesn't have type, defaulting
            priority: 'medium', // contact_submissions doesn't have priority, defaulting
            description: s.message,
            email: s.email,
            status: s.status || 'new',
            assignedTo: undefined,
            createdAt: s.createdAt || new Date(),
            updatedAt: s.createdAt || new Date(),
        }));

        if (query?.status) {
            filtered = filtered.filter(r => r.status === query.status);
        }

        return { data: filtered };
    }

    async findById(id: string): Promise<{ data: SupportRequest }> {
        const [submission] = await this.db
            .select()
            .from(contactSubmissions)
            .where(eq(contactSubmissions.id, id))
            .limit(1);

        if (!submission) {
            throw new NotFoundException(`Support request ${id} not found`);
        }

        return {
            data: {
                id: submission.id,
                subject: submission.subject,
                type: 'support',
                priority: 'medium',
                description: submission.message,
                email: submission.email,
                status: submission.status || 'new',
                createdAt: submission.createdAt || new Date(),
                updatedAt: submission.createdAt || new Date(),
            },
        };
    }

    async create(data: Partial<SupportRequest>): Promise<{ data: SupportRequest }> {
        const [newSubmission] = await this.db
            .insert(contactSubmissions)
            .values({
                name: data.email || 'Unknown',
                email: data.email || '',
                company: '',
                subject: data.subject || '',
                message: data.description || '',
                status: 'new',
            })
            .returning();

        return {
            data: {
                id: newSubmission.id,
                subject: newSubmission.subject,
                type: data.type || 'support',
                priority: data.priority || 'medium',
                description: newSubmission.message,
                email: newSubmission.email,
                status: newSubmission.status || 'new',
                createdAt: newSubmission.createdAt || new Date(),
                updatedAt: newSubmission.createdAt || new Date(),
            },
        };
    }

    async update(id: string, data: Partial<SupportRequest>): Promise<{ data: SupportRequest }> {
        const updateData: any = {};
        if (data.subject) updateData.subject = data.subject;
        if (data.description) updateData.message = data.description;
        if (data.status) updateData.status = data.status;

        const [updatedSubmission] = await this.db
            .update(contactSubmissions)
            .set(updateData)
            .where(eq(contactSubmissions.id, id))
            .returning();

        if (!updatedSubmission) {
            throw new NotFoundException(`Support request ${id} not found`);
        }

        return {
            data: {
                id: updatedSubmission.id,
                subject: updatedSubmission.subject,
                type: data.type || 'support',
                priority: data.priority || 'medium',
                description: updatedSubmission.message,
                email: updatedSubmission.email,
                status: updatedSubmission.status || 'new',
                assignedTo: data.assignedTo,
                createdAt: updatedSubmission.createdAt || new Date(),
                updatedAt: updatedSubmission.createdAt || new Date(),
            },
        };
    }

    async assign(id: string, userId: string): Promise<{ data: SupportRequest }> {
        // contact_submissions doesn't have assignedTo field, so we just update status
        const [updatedSubmission] = await this.db
            .update(contactSubmissions)
            .set({ status: 'read' })
            .where(eq(contactSubmissions.id, id))
            .returning();

        if (!updatedSubmission) {
            throw new NotFoundException(`Support request ${id} not found`);
        }

        return {
            data: {
                id: updatedSubmission.id,
                subject: updatedSubmission.subject,
                type: 'support',
                priority: 'medium',
                description: updatedSubmission.message,
                email: updatedSubmission.email,
                status: updatedSubmission.status || 'read',
                assignedTo: userId,
                createdAt: updatedSubmission.createdAt || new Date(),
                updatedAt: updatedSubmission.createdAt || new Date(),
            },
        };
    }

    async close(id: string): Promise<{ data: SupportRequest }> {
        const [updatedSubmission] = await this.db
            .update(contactSubmissions)
            .set({ status: 'closed' })
            .where(eq(contactSubmissions.id, id))
            .returning();

        if (!updatedSubmission) {
            throw new NotFoundException(`Support request ${id} not found`);
        }

        return {
            data: {
                id: updatedSubmission.id,
                subject: updatedSubmission.subject,
                type: 'support',
                priority: 'medium',
                description: updatedSubmission.message,
                email: updatedSubmission.email,
                status: 'closed',
                createdAt: updatedSubmission.createdAt || new Date(),
                updatedAt: updatedSubmission.createdAt || new Date(),
            },
        };
    }

    async delete(id: string): Promise<{ data: { success: boolean } }> {
        const [deletedSubmission] = await this.db
            .delete(contactSubmissions)
            .where(eq(contactSubmissions.id, id))
            .returning();

        if (!deletedSubmission) {
            throw new NotFoundException(`Support request ${id} not found`);
        }

        return { data: { success: true } };
    }
}
