import { Injectable, NotFoundException } from '@nestjs/common';

interface SystemModule {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    enabled: boolean;
    version: string;
    dependencies: string[];
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class ModulesService {
    // In-memory storage with system modules
    // These represent the available modules in the system
    private modules: SystemModule[] = [
        {
            id: 'mod-1',
            name: 'Finance & Accounting',
            slug: 'finance',
            description: 'General Ledger, AP, AR, Cash Management, Fixed Assets',
            category: 'core',
            enabled: true,
            version: '1.0.0',
            dependencies: [],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-02-01'),
        },
        {
            id: 'mod-2',
            name: 'Human Capital Management',
            slug: 'hcm',
            description: 'Core HR, Payroll, Benefits, Talent Management',
            category: 'core',
            enabled: true,
            version: '1.0.0',
            dependencies: [],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-02-01'),
        },
        {
            id: 'mod-3',
            name: 'Supply Chain Management',
            slug: 'scm',
            description: 'Procurement, Inventory, Order Management, Logistics',
            category: 'core',
            enabled: true,
            version: '1.0.0',
            dependencies: [],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-02-01'),
        },
        {
            id: 'mod-4',
            name: 'CRM & Sales',
            slug: 'crm',
            description: 'Opportunity Management, Contacts, Pipeline, Forecasting',
            category: 'business',
            enabled: false,
            version: '0.9.0',
            dependencies: [],
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-02-05'),
        },
        {
            id: 'mod-5',
            name: 'Project Management',
            slug: 'pm',
            description: 'Projects, Tasks, Resource Allocation, Time Tracking',
            category: 'business',
            enabled: true,
            version: '1.0.0',
            dependencies: [],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-02-01'),
        },
        {
            id: 'mod-6',
            name: 'Analytics & BI',
            slug: 'analytics',
            description: 'Dashboards, Reports, Data Visualization, Insights',
            category: 'platform',
            enabled: true,
            version: '1.1.0',
            dependencies: [],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-02-10'),
        },
    ];

    async findAll(query?: any): Promise<{ data: SystemModule[] }> {
        let filtered = [...this.modules];

        if (query?.category) {
            filtered = filtered.filter(m => m.category === query.category);
        }
        if (query?.enabled !== undefined) {
            const enabledValue = query.enabled === 'true' || query.enabled === true;
            filtered = filtered.filter(m => m.enabled === enabledValue);
        }

        return { data: filtered };
    }

    async findById(id: string): Promise<{ data: SystemModule }> {
        const module = this.modules.find(m => m.id === id);
        if (!module) {
            throw new NotFoundException(`Module ${id} not found`);
        }
        return { data: module };
    }

    async create(data: Partial<SystemModule>): Promise<{ data: SystemModule }> {
        const module: SystemModule = {
            id: `mod-${Date.now()}`,
            name: data.name || '',
            slug: data.slug || '',
            description: data.description || '',
            category: data.category || 'business',
            enabled: data.enabled !== undefined ? data.enabled : false,
            version: data.version || '0.1.0',
            dependencies: data.dependencies || [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.modules.push(module);
        return { data: module };
    }

    async update(id: string, data: Partial<SystemModule>): Promise<{ data: SystemModule }> {
        const index = this.modules.findIndex(m => m.id === id);
        if (index === -1) {
            throw new NotFoundException(`Module ${id} not found`);
        }

        this.modules[index] = {
            ...this.modules[index],
            ...data,
            id,
            updatedAt: new Date(),
        };

        return { data: this.modules[index] };
    }

    async toggle(id: string): Promise<{ data: SystemModule }> {
        const index = this.modules.findIndex(m => m.id === id);
        if (index === -1) {
            throw new NotFoundException(`Module ${id} not found`);
        }

        this.modules[index] = {
            ...this.modules[index],
            enabled: !this.modules[index].enabled,
            updatedAt: new Date(),
        };

        return { data: this.modules[index] };
    }

    async delete(id: string): Promise<{ data: { success: boolean } }> {
        const index = this.modules.findIndex(m => m.id === id);
        if (index === -1) {
            throw new NotFoundException(`Module ${id} not found`);
        }

        this.modules.splice(index, 1);
        return { data: { success: true } };
    }
}
