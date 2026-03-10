import { db } from '@/lib/db';
import { supportRequests } from '@/lib/db/schema/admin';
import { eq, desc } from 'drizzle-orm';

export interface CreateSupportRequestInput {
    type: 'feature' | 'bug' | 'support' | 'question';
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    submittedBy?: string;
    tenantId?: string;
}

export class SupportRequestService {
    /**
     * Create a new support request
     */
    static async create(input: CreateSupportRequestInput) {
        const [request] = await db.insert(supportRequests).values({
            type: input.type,
            title: input.title,
            description: input.description,
            priority: input.priority || 'medium',
            submittedBy: input.submittedBy,
            tenantId: input.tenantId,
            status: 'open',
        }).returning();

        return request;
    }

    /**
     * Get all support requests
     */
    static async getAll(filters?: {
        status?: string;
        type?: string;
        priority?: string;
        tenantId?: string;
    }) {
        let query = db.select().from(supportRequests);

        if (filters?.status) {
            query = query.where(eq(supportRequests.status, filters.status));
        }
        if (filters?.type) {
            query = query.where(eq(supportRequests.type, filters.type));
        }
        if (filters?.priority) {
            query = query.where(eq(supportRequests.priority, filters.priority));
        }
        if (filters?.tenantId) {
            query = query.where(eq(supportRequests.tenantId, filters.tenantId));
        }

        return query.orderBy(desc(supportRequests.createdAt));
    }

    /**
     * Get support request by ID
     */
    static async getById(id: string) {
        const [request] = await db.select()
            .from(supportRequests)
            .where(eq(supportRequests.id, id));

        return request;
    }

    /**
     * Update support request
     */
    static async update(id: string, data: {
        status?: string;
        priority?: string;
        assignedTo?: string;
    }) {
        const [updated] = await db.update(supportRequests)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(supportRequests.id, id))
            .returning();

        return updated;
    }

    /**
     * Assign request to user
     */
    static async assign(id: string, userId: string) {
        return this.update(id, { assignedTo: userId });
    }

    /**
     * Close support request
     */
    static async close(id: string) {
        return this.update(id, { status: 'closed' });
    }

    /**
     * Delete support request
     */
    static async delete(id: string) {
        await db.delete(supportRequests)
            .where(eq(supportRequests.id, id));
    }
}
