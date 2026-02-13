import { Injectable, NotFoundException } from '@nestjs/common';

interface Affiliate {
    id: string;
    name: string;
    email: string;
    company?: string;
    tier: string;
    status: string;
    commissionRate: number;
    totalReferrals: number;
    totalEarnings: number;
    createdAt: Date;
    updatedAt: Date;
}

interface Referral {
    id: string;
    affiliateId: string;
    tenantId: string;
    status: string;
    commissionAmount?: number;
    createdAt: Date;
    convertedAt?: Date;
}

@Injectable()
export class AffiliatesService {
    private affiliates: Affiliate[] = [
        {
            id: 'aff-1',
            name: 'Sarah Parker',
            email: 'sarah@techblog.com',
            company: 'TechBlog Media',
            tier: 'gold',
            status: 'active',
            commissionRate: 20,
            totalReferrals: 15,
            totalEarnings: 3500,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-02-10'),
        },
        {
            id: 'aff-2',
            name: 'David Chen',
            email: 'david@consultants.io',
            company: 'Enterprise Consultants',
            tier: 'silver',
            status: 'active',
            commissionRate: 15,
            totalReferrals: 8,
            totalEarnings: 1200,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-02-08'),
        },
        {
            id: 'aff-3',
            name: 'Lisa Anderson',
            email: 'lisa@startupguru.com',
            tier: 'bronze',
            status: 'pending',
            commissionRate: 10,
            totalReferrals: 0,
            totalEarnings: 0,
            createdAt: new Date('2024-02-12'),
            updatedAt: new Date('2024-02-12'),
        },
    ];

    private referrals: Referral[] = [
        {
            id: 'ref-1',
            affiliateId: 'aff-1',
            tenantId: 'tenant-101',
            status: 'converted',
            commissionAmount: 250,
            createdAt: new Date('2024-01-20'),
            convertedAt: new Date('2024-01-25'),
        },
        {
            id: 'ref-2',
            affiliateId: 'aff-1',
            tenantId: 'tenant-102',
            status: 'pending',
            createdAt: new Date('2024-02-10'),
        },
    ];

    async findAll(query?: any): Promise<{ data: Affiliate[] }> {
        let filtered = [...this.affiliates];

        if (query?.status) {
            filtered = filtered.filter(a => a.status === query.status);
        }
        if (query?.tier) {
            filtered = filtered.filter(a => a.tier === query.tier);
        }

        return { data: filtered };
    }

    async findById(id: string): Promise<{ data: Affiliate }> {
        const affiliate = this.affiliates.find(a => a.id === id);
        if (!affiliate) {
            throw new NotFoundException(`Affiliate ${id} not found`);
        }
        return { data: affiliate };
    }

    async getReferrals(id: string): Promise<{ data: Referral[] }> {
        const referrals = this.referrals.filter(r => r.affiliateId === id);
        return { data: referrals };
    }

    async create(data: Partial<Affiliate>): Promise<{ data: Affiliate }> {
        const affiliate: Affiliate = {
            id: `aff-${Date.now()}`,
            name: data.name || '',
            email: data.email || '',
            company: data.company,
            tier: data.tier || 'bronze',
            status: 'pending',
            commissionRate: data.commissionRate || 10,
            totalReferrals: 0,
            totalEarnings: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.affiliates.push(affiliate);
        return { data: affiliate };
    }

    async update(id: string, data: Partial<Affiliate>): Promise<{ data: Affiliate }> {
        const index = this.affiliates.findIndex(a => a.id === id);
        if (index === -1) {
            throw new NotFoundException(`Affiliate ${id} not found`);
        }

        this.affiliates[index] = {
            ...this.affiliates[index],
            ...data,
            id,
            updatedAt: new Date(),
        };

        return { data: this.affiliates[index] };
    }

    async updateStatus(id: string, status: string): Promise<{ data: Affiliate }> {
        const index = this.affiliates.findIndex(a => a.id === id);
        if (index === -1) {
            throw new NotFoundException(`Affiliate ${id} not found`);
        }

        this.affiliates[index] = {
            ...this.affiliates[index],
            status,
            updatedAt: new Date(),
        };

        return { data: this.affiliates[index] };
    }

    async createReferral(affiliateId: string, tenantId: string): Promise<{ data: Referral }> {
        const referral: Referral = {
            id: `ref-${Date.now()}`,
            affiliateId,
            tenantId,
            status: 'pending',
            createdAt: new Date(),
        };

        this.referrals.push(referral);

        // Update affiliate's total referrals
        const index = this.affiliates.findIndex(a => a.id === affiliateId);
        if (index !== -1) {
            this.affiliates[index].totalReferrals++;
        }

        return { data: referral };
    }

    async convertReferral(referralId: string, commissionAmount: number): Promise<{ data: Referral }> {
        const index = this.referrals.findIndex(r => r.id === referralId);
        if (index === -1) {
            throw new NotFoundException(`Referral ${referralId} not found`);
        }

        this.referrals[index] = {
            ...this.referrals[index],
            status: 'converted',
            commissionAmount,
            convertedAt: new Date(),
        };

        // Update affiliate's earnings
        const affiliateId = this.referrals[index].affiliateId;
        const affiliateIndex = this.affiliates.findIndex(a => a.id === affiliateId);
        if (affiliateIndex !== -1) {
            this.affiliates[affiliateIndex].totalEarnings += commissionAmount;
        }

        return { data: this.referrals[index] };
    }

    async delete(id: string): Promise<{ data: { success: boolean } }> {
        const index = this.affiliates.findIndex(a => a.id === id);
        if (index === -1) {
            throw new NotFoundException(`Affiliate ${id} not found`);
        }

        this.affiliates.splice(index, 1);
        return { data: { success: true } };
    }
}
