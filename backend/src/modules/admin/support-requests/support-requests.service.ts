import { Injectable, NotFoundException } from '@nestjs/common';

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
    private requests: SupportRequest[] = [
        {
            id: 'req-1',
            subject: 'Cannot access dashboard',
            type: 'bug',
            priority: 'high',
            description: 'Getting 404 error when trying to access the main dashboard',
            email: 'user1@company.com',
            status: 'open',
            createdAt: new Date('2024-02-13T10:00:00'),
            updatedAt: new Date('2024-02-13T10:00:00'),
        },
        {
            id: 'req-2',
            subject: 'Feature request: Dark mode',
            type: 'feature',
            priority: 'low',
            description: 'Would love to have a dark mode option for the interface',
            email: 'user2@company.com',
            status: 'open',
            assignedTo: 'admin-1',
            createdAt: new Date('2024-02-12T14:30:00'),
            updatedAt: new Date('2024-02-12T15:00:00'),
        },
        {
            id: 'req-3',
            subject: 'Data export not working',
            type: 'support',
            priority: 'medium',
            description: 'CSV export button returns empty file',
            email: 'user3@company.com',
            status: 'closed',
            assignedTo: 'admin-2',
            createdAt: new Date('2024-02-10T09:00:00'),
            updatedAt: new Date('2024-02-11T16:00:00'),
        },
    ];

    async findAll(query?: any): Promise<{ data: SupportRequest[] }> {
        let filtered = [...this.requests];

        if (query?.status) {
            filtered = filtered.filter(r => r.status === query.status);
        }
        if (query?.type) {
            filtered = filtered.filter(r => r.type === query.type);
        }
        if (query?.priority) {
            filtered = filtered.filter(r => r.priority === query.priority);
        }

        return { data: filtered };
    }

    async findById(id: string): Promise<{ data: SupportRequest }> {
        const request = this.requests.find(r => r.id === id);
        if (!request) {
            throw new NotFoundException(`Support request ${id} not found`);
        }
        return { data: request };
    }

    async create(data: Partial<SupportRequest>): Promise<{ data: SupportRequest }> {
        const request: SupportRequest = {
            id: `req-${Date.now()}`,
            subject: data.subject || '',
            type: data.type || 'support',
            priority: data.priority || 'medium',
            description: data.description || '',
            email: data.email || '',
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.requests.push(request);
        return { data: request };
    }

    async update(id: string, data: Partial<SupportRequest>): Promise<{ data: SupportRequest }> {
        const index = this.requests.findIndex(r => r.id === id);
        if (index === -1) {
            throw new NotFoundException(`Support request ${id} not found`);
        }

        this.requests[index] = {
            ...this.requests[index],
            ...data,
            id,
            updatedAt: new Date(),
        };

        return { data: this.requests[index] };
    }

    async assign(id: string, userId: string): Promise<{ data: SupportRequest }> {
        const index = this.requests.findIndex(r => r.id === id);
        if (index === -1) {
            throw new NotFoundException(`Support request ${id} not found`);
        }

        this.requests[index] = {
            ...this.requests[index],
            assignedTo: userId,
            updatedAt: new Date(),
        };

        return { data: this.requests[index] };
    }

    async close(id: string): Promise<{ data: SupportRequest }> {
        const index = this.requests.findIndex(r => r.id === id);
        if (index === -1) {
            throw new NotFoundException(`Support request ${id} not found`);
        }

        this.requests[index] = {
            ...this.requests[index],
            status: 'closed',
            updatedAt: new Date(),
        };

        return { data: this.requests[index] };
    }

    async delete(id: string): Promise<{ data: { success: boolean } }> {
        const index = this.requests.findIndex(r => r.id === id);
        if (index === -1) {
            throw new NotFoundException(`Support request ${id} not found`);
        }

        this.requests.splice(index, 1);
        return { data: { success: true } };
    }
}
