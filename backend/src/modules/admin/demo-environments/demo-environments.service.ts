import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { demos } from '@shared/schema/common';
import type { Demo, InsertDemo } from '@shared/schema/common';

interface DemoEnvironment {
    id: string;
    companyName: string;
    industry: string;
    email: string;
    firstName?: string;
    lastName?: string;
    status: string;
    accessUrl?: string;
    createdAt: Date;
    expiresAt: Date;
    lastAccessedAt?: Date;
}

@Injectable()
export class DemoEnvironmentsService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
    ) { }

    async findAll(query?: any): Promise<{ data: DemoEnvironment[] }> {
        const allDemos = await this.db.select().from(demos);

        // Map database records to expected format
        let filtered = allDemos.map(d => ({
            id: d.id,
            companyName: d.company,
            industry: d.industry,
            email: d.email,
            status: d.status || 'active',
            accessUrl: d.demoToken ? `https://demo.nexusai.com/${d.demoToken}` : undefined,
            createdAt: d.createdAt || new Date(),
            expiresAt: d.expiresAt || new Date(),
            firstName: '',
            lastName: '',
        }));

        // Apply filters if provided
        if (query?.status) {
            filtered = filtered.filter(d => d.status === query.status);
        }
        if (query?.industry) {
            filtered = filtered.filter(d => d.industry === query.industry);
        }

        return { data: filtered };
    }

    async findById(id: string): Promise<{ data: DemoEnvironment }> {
        const [demo] = await this.db
            .select()
            .from(demos)
            .where(eq(demos.id, id))
            .limit(1);

        if (!demo) {
            throw new NotFoundException(`Demo environment ${id} not found`);
        }

        return {
            data: {
                id: demo.id,
                companyName: demo.company,
                industry: demo.industry,
                email: demo.email,
                status: demo.status || 'active',
                accessUrl: demo.demoToken ? `https://demo.nexusai.com/${demo.demoToken}` : undefined,
                createdAt: demo.createdAt || new Date(),
                expiresAt: demo.expiresAt || new Date(),
                firstName: '',
                lastName: '',
            },
        };
    }

    async create(data: Partial<DemoEnvironment>): Promise<{ data: DemoEnvironment }> {
        const [newDemo] = await this.db
            .insert(demos)
            .values({
                email: data.email || '',
                company: data.companyName || '',
                industry: data.industry || '',
                status: 'active',
                demoToken: `token-${Date.now()}`,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            })
            .returning();

        return {
            data: {
                id: newDemo.id,
                companyName: newDemo.company,
                industry: newDemo.industry,
                email: newDemo.email,
                firstName: data.firstName,
                lastName: data.lastName,
                status: newDemo.status || 'active',
                accessUrl: `https://demo.nexusai.com/${newDemo.demoToken}`,
                createdAt: newDemo.createdAt || new Date(),
                expiresAt: newDemo.expiresAt || new Date(),
            },
        };
    }

    async update(id: string, data: Partial<DemoEnvironment>): Promise<{ data: DemoEnvironment }> {
        const updateData: any = {};
        if (data.companyName) updateData.company = data.companyName;
        if (data.industry) updateData.industry = data.industry;
        if (data.email) updateData.email = data.email;
        if (data.status) updateData.status = data.status;

        const [updatedDemo] = await this.db
            .update(demos)
            .set(updateData)
            .where(eq(demos.id, id))
            .returning();

        if (!updatedDemo) {
            throw new NotFoundException(`Demo environment ${id} not found`);
        }

        return {
            data: {
                id: updatedDemo.id,
                companyName: updatedDemo.company,
                industry: updatedDemo.industry,
                email: updatedDemo.email,
                firstName: data.firstName,
                lastName: data.lastName,
                status: updatedDemo.status || 'active',
                accessUrl: updatedDemo.demoToken ? `https://demo.nexusai.com/${updatedDemo.demoToken}` : undefined,
                createdAt: updatedDemo.createdAt || new Date(),
                expiresAt: updatedDemo.expiresAt || new Date(),
            },
        };
    }

    async updateStatus(id: string, status: string, accessUrl?: string): Promise<{ data: DemoEnvironment }> {
        const [updatedDemo] = await this.db
            .update(demos)
            .set({ status })
            .where(eq(demos.id, id))
            .returning();

        if (!updatedDemo) {
            throw new NotFoundException(`Demo environment ${id} not found`);
        }

        return {
            data: {
                id: updatedDemo.id,
                companyName: updatedDemo.company,
                industry: updatedDemo.industry,
                email: updatedDemo.email,
                status: updatedDemo.status || 'active',
                accessUrl: accessUrl || (updatedDemo.demoToken ? `https://demo.nexusai.com/${updatedDemo.demoToken}` : undefined),
                createdAt: updatedDemo.createdAt || new Date(),
                expiresAt: updatedDemo.expiresAt || new Date(),
                firstName: '',
                lastName: '',
            },
        };
    }

    async delete(id: string): Promise<{ data: { success: boolean } }> {
        const [deletedDemo] = await this.db
            .delete(demos)
            .where(eq(demos.id, id))
            .returning();

        if (!deletedDemo) {
            throw new NotFoundException(`Demo environment ${id} not found`);
        }

        return { data: { success: true } };
    }
}
