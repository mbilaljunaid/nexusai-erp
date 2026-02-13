import { db } from '@/lib/db';
import { affiliates, affiliateReferrals } from '@/lib/db/schema/admin';
import { eq } from 'drizzle-orm';

export interface CreateAffiliateInput {
    name: string;
    email: string;
    referralCode: string;
    tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
    commissionRate?: number;
}

export class AffiliateService {
    /**
     * Create a new affiliate
     */
    static async create(input: CreateAffiliateInput) {
        const [affiliate] = await db.insert(affiliates).values({
            name: input.name,
            email: input.email,
            referralCode: input.referralCode,
            tier: input.tier || 'bronze',
            commissionRate: input.commissionRate || 10,
            status: 'pending',
        }).returning();

        return affiliate;
    }

    /**
     * Get all affiliates
     */
    static async getAll() {
        return db.select().from(affiliates);
    }

    /**
     * Get affiliate by ID
     */
    static async getById(id: string) {
        const [affiliate] = await db.select()
            .from(affiliates)
            .where(eq(affiliates.id, id));

        return affiliate;
    }

    /**
     * Get affiliate by referral code
     */
    static async getByReferralCode(code: string) {
        const [affiliate] = await db.select()
            .from(affiliates)
            .where(eq(affiliates.referralCode, code));

        return affiliate;
    }

    /**
     * Update affiliate status
     */
    static async updateStatus(id: string, status: string) {
        const [updated] = await db.update(affiliates)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(eq(affiliates.id, id))
            .returning();

        return updated;
    }

    /**
     * Create referral
     */
    static async createReferral(affiliateId: string, tenantId: string) {
        const [referral] = await db.insert(affiliateReferrals).values({
            affiliateId,
            tenantId,
            converted: false,
        }).returning();

        // Increment total referrals
        await db.update(affiliates)
            .set({
                totalReferrals: db.raw('total_referrals + 1'),
            })
            .where(eq(affiliates.id, affiliateId));

        return referral;
    }

    /**
     * Mark referral as converted
     */
    static async convertReferral(referralId: string, commissionAmount: number) {
        const [referral] = await db.update(affiliateReferrals)
            .set({
                converted: true,
                commissionAmount
            })
            .where(eq(affiliateReferrals.id, referralId))
            .returning();

        // Update affiliate stats
        const affiliate = await db.select()
            .from(affiliateReferrals)
            .where(eq(affiliateReferrals.id, referralId));

        if (affiliate[0]) {
            await db.update(affiliates)
                .set({
                    totalConversions: db.raw('total_conversions + 1'),
                    totalCommission: db.raw(`total_commission + ${commissionAmount}`),
                })
                .where(eq(affiliates.id, affiliate[0].affiliateId));
        }

        return referral;
    }

    /**
     * Get affiliate referrals
     */
    static async getReferrals(affiliateId: string) {
        return db.select()
            .from(affiliateReferrals)
            .where(eq(affiliateReferrals.affiliateId, affiliateId));
    }
}
