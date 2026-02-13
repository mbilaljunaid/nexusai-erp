import { Injectable, NotFoundException } from '@nestjs/common';

interface DemoEnvironment {
    id: string;
    companyName: string;
    industry: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    accessUrl?: string;
    createdAt: Date;
    expiresAt: Date;
    lastAccessedAt?: Date;
}

@Injectable()
export class DemoEnvironmentsService {
    // In-memory storage with seed data for testing
    private demos: DemoEnvironment[] = [
        {
            id: 'demo-1',
            companyName: 'Acme Corporation',
            industry: 'Technology',
            email: 'admin@acme.com',
            firstName: 'John',
            lastName: 'Smith',
            status: 'active',
            accessUrl: 'https://demo-acme.nexusai.com',
            createdAt: new Date('2024-02-01'),
            expiresAt: new Date('2024-03-01'),
            lastAccessedAt: new Date('2024-02-10'),
        },
        {
            id: 'demo-2',
            companyName: 'TechStart Inc',
            industry: 'SaaS',
            email: 'demo@techstart.io',
            firstName: 'Jane',
            lastName: 'Doe',
            status: 'provisioning',
            createdAt: new Date('2024-02-05'),
            expiresAt: new Date('2024-03-05'),
        },
        {
            id: 'demo-3',
            companyName: 'Global Retail Co',
            industry: 'Retail',
            email: 'test@globalretail.com',
            firstName: 'Mike',
            lastName: 'Johnson',
            status: 'expired',
            accessUrl: 'https://demo-retail.nexusai.com',
            createdAt: new Date('2024-01-15'),
            expiresAt: new Date('2024-02-01'),
            lastAccessedAt: new Date('2024-01-30'),
        },
    ];

    async findAll(query?: any): Promise<{ data: DemoEnvironment[] }> {
        let filtered = [...this.demos];

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
        const demo = this.demos.find(d => d.id === id);
        if (!demo) {
            throw new NotFoundException(`Demo environment ${id} not found`);
        }
        return { data: demo };
    }

    async create(data: Partial<DemoEnvironment>): Promise<{ data: DemoEnvironment }> {
        const demo: DemoEnvironment = {
            id: `demo-${Date.now()}`,
            companyName: data.companyName || '',
            industry: data.industry || '',
            email: data.email || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            status: 'active',
            accessUrl: data.accessUrl,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        this.demos.push(demo);
        return { data: demo };
    }

    async update(id: string, data: Partial<DemoEnvironment>): Promise<{ data: DemoEnvironment }> {
        const index = this.demos.findIndex(d => d.id === id);
        if (index === -1) {
            throw new NotFoundException(`Demo environment ${id} not found`);
        }

        this.demos[index] = {
            ...this.demos[index],
            ...data,
            id, // Ensure ID doesn't change
        };

        return { data: this.demos[index] };
    }

    async updateStatus(id: string, status: string, accessUrl?: string): Promise<{ data: DemoEnvironment }> {
        const index = this.demos.findIndex(d => d.id === id);
        if (index === -1) {
            throw new NotFoundException(`Demo environment ${id} not found`);
        }

        this.demos[index] = {
            ...this.demos[index],
            status,
            ...(accessUrl && { accessUrl }),
        };

        return { data: this.demos[index] };
    }

    async delete(id: string): Promise<{ data: { success: boolean } }> {
        const index = this.demos.findIndex(d => d.id === id);
        if (index === -1) {
            throw new NotFoundException(`Demo environment ${id} not found`);
        }

        this.demos.splice(index, 1);
        return { data: { success: true } };
    }
}
