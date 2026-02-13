import { db } from '@/lib/db';
import { demoEnvironments } from '@/lib/db/schema/admin';
import { eq } from 'drizzle-orm';

export interface CreateDemoEnvironmentInput {
    name: string;
    slug: string;
    industry?: string;
    modules?: string[];
    expiresAt: Date;
}

export class DemoEnvironmentService {
    /**
     * Create a new demo environment
     */
    static async create(input: CreateDemoEnvironmentInput) {
        const [demo] = await db.insert(demoEnvironments).values({
            name: input.name,
            slug: input.slug,
            industry: input.industry,
            modules: input.modules || [],
            expiresAt: input.expiresAt,
            status: 'provisioning',
        }).returning();

        // TODO: Trigger provisioning workflow

        return demo;
    }

    /**
     * Get all demo environments
     */
    static async getAll() {
        return db.select().from(demoEnvironments);
    }

    /**
     * Get demo environment by ID
     */
    static async getById(id: string) {
        const [demo] = await db.select()
            .from(demoEnvironments)
            .where(eq(demoEnvironments.id, id));

        return demo;
    }

    /**
     * Update demo environment status
     */
    static async updateStatus(id: string, status: string, accessUrl?: string) {
        const [updated] = await db.update(demoEnvironments)
            .set({
                status,
                accessUrl,
                updatedAt: new Date()
            })
            .where(eq(demoEnvironments.id, id))
            .returning();

        return updated;
    }

    /**
     * Delete demo environment
     */
    static async delete(id: string) {
        await db.delete(demoEnvironments)
            .where(eq(demoEnvironments.id, id));
    }

    /**
     * Get expired demo environments
     */
    static async getExpired() {
        const now = new Date();
        return db.select()
            .from(demoEnvironments)
            .where(eq(demoEnvironments.expiresAt, now));
    }
}
