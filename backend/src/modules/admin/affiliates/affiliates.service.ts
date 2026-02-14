import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { affiliates, affiliateReferrals } from '@shared/schema/admin';
import type { Affiliate, InsertAffiliate, AffiliateReferral, InsertAffiliateReferral } from '@shared/schema/admin';

@Injectable()
export class AffiliatesService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<Record<string, unknown>>,
    ) { }

    async findAll(query?: any): Promise<{ data: Affiliate[] }> {
        const allAffiliates = await this.db.select().from(affiliates);

        let filtered = allAffiliates;

        if (query?.status) {
            filtered = filtered.filter(a => a.status === query.status);
        }
        if (query?.tier) {
            filtered = filtered.filter(a => a.tier === query.tier);
        }

        return { data: filtered };
    }

    async findById(id: string): Promise<{ data: Affiliate }> {
        const [affiliate] = await this.db
            .select()
            .from(affiliates)
            .where(eq(affiliates.id, id))
            .limit(1);

        if (!affiliate) {
            throw new NotFoundException(`Affiliate ${id} not found`);
        }

        return { data: affiliate };
    }

    async create(data: Partial<InsertAffiliate>): Promise<{ data: Affiliate }> {
        const [newAffiliate] = await this.db
            .insert(affiliates)
            .values({
                name: data.name || '',
                email: data.email || '',
                company: data.company,
                tier: data.tier || 'bronze',
                status: data.status || 'pending',
                commissionRate: data.commissionRate || '10',
                totalReferrals: 0,
                totalEarnings: '0',
            })
            .returning();

        return { data: newAffiliate };
    }

    async update(id: string, data: Partial<InsertAffiliate>): Promise<{ data: Affiliate }> {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.company !== undefined) updateData.company = data.company;
        if (data.tier) updateData.tier = data.tier;
        if (data.status) updateData.status = data.status;
        if (data.commissionRate) updateData.commissionRate = data.commissionRate;

        updateData.updatedAt = new Date();

        const [updatedAffiliate] = await this.db
            .update(affiliates)
            .set(updateData)
            .where(eq(affiliates.id, id))
            .returning();

        if (!updatedAffiliate) {
            throw new NotFoundException(`Affiliate ${id} not found`);
        }

        return { data: updatedAffiliate };
    }

    async delete(id: string): Promise<{ data: { success: boolean } }> {
        const [deletedAffiliate] = await this.db
            .delete(affiliates)
            .where(eq(affiliates.id, id))
            .returning();

        if (!deletedAffiliate) {
            throw new NotFoundException(`Affiliate ${id} not found`);
        }

        return { data: { success: true } };
    }

    // Referral management
    async getReferrals(affiliateId: string): Promise<{ data: AffiliateReferral[] }> {
        const referrals = await this.db
            .select()
            .from(affiliateReferrals)
            .where(eq(affiliateReferrals.affiliateId, affiliateId));

        return { data: referrals };
    }

    async createReferral(data: Partial<InsertAffiliateReferral>): Promise<{ data: AffiliateReferral }> {
        const [newReferral] = await this.db
            .insert(affiliateReferrals)
            .values({
                affiliateId: data.affiliateId || '',
                tenantId: data.tenantId || '',
                status: 'pending',
            })
            .returning();

        return { data: newReferral };
    }

    async convertReferral(referralId: string, commissionAmount: string): Promise<{ data: AffiliateReferral }> {
        const [updatedReferral] = await this.db
            .update(affiliateReferrals)
            .set({
                status: 'converted',
                commissionAmount,
                convertedAt: new Date(),
            })
            .where(eq(affiliateReferrals.id, referralId))
            .returning();

        if (!updatedReferral) {
            throw new NotFoundException(`Referral ${referralId} not found`);
        }

        // Update affiliate totals
        const [affiliate] = await this.db
            .select()
            .from(affiliates)
            .where(eq(affiliates.id, updatedReferral.affiliateId))
            .limit(1);

        if (affiliate) {
            await this.db
                .update(affiliates)
                .set({
                    totalReferrals: (affiliate.totalReferrals || 0) + 1,
                    totalEarnings: String(parseFloat(affiliate.totalEarnings || '0') + parseFloat(commissionAmount)),
                    updatedAt: new Date(),
                })
                .where(eq(affiliates.id, updatedReferral.affiliateId));
        }

        return { data: updatedReferral };
    }
}
