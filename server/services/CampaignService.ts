
import { db } from "../db";
import { campaigns, campaignMembers, opportunities, leads, contacts } from "../../shared/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export class CampaignService {

    static async getCampaignStats(campaignId: string) {
        // 1. Fetch Campaign
        const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
        if (!campaign) throw new Error("Campaign not found");

        // 2. Fetch Aggregates
        // Won Opportunities
        const [wonOpps] = await db.select({
            count: sql<number>`count(*)`,
            totalValue: sql<number>`sum(${opportunities.amount})`
        })
            .from(opportunities)
            .where(and(
                eq(opportunities.campaignId, campaignId),
                eq(opportunities.stage, 'Closed Won')
            ));

        // All Opportunities (for Conversion Rate)
        const [allOpps] = await db.select({
            count: sql<number>`count(*)`
        })
            .from(opportunities)
            .where(eq(opportunities.campaignId, campaignId));

        // Leads/Contacts (Members)
        const [members] = await db.select({
            count: sql<number>`count(*)`
        })
            .from(campaignMembers)
            .where(eq(campaignMembers.campaignId, campaignId));

        // 3. Calculate ROI
        // ROI = (Revenue - Cost) / Cost * 100
        const revenue = Number(wonOpps.totalValue || 0);
        const cost = Number(campaign.actualCost || campaign.budgetedCost || 0); // Use Actual, fallback to Budget

        // Protect against divide by zero
        const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;

        // Conversion Rate
        const totalOpps = Number(allOpps.count || 0);
        const wonCount = Number(wonOpps.count || 0);
        const conversionRate = totalOpps > 0 ? (wonCount / totalOpps) * 100 : 0;

        return {
            campaign,
            stats: {
                totalMembers: Number(members.count || 0),
                totalRevenue: revenue,
                totalCost: cost,
                roi: Math.round(roi * 100) / 100, // 2 decimals
                wonDeals: wonCount,
                totalDeals: totalOpps,
                conversionRate: Math.round(conversionRate * 100) / 100
            }
        };
    }

    static async addMember(campaignId: string, memberId: string, type: 'lead' | 'contact') {
        // Check if already exists
        const condition = type === 'lead'
            ? and(eq(campaignMembers.campaignId, campaignId), eq(campaignMembers.leadId, memberId))
            : and(eq(campaignMembers.campaignId, campaignId), eq(campaignMembers.contactId, memberId));

        const [existing] = await db.select().from(campaignMembers).where(condition);
        if (existing) return existing;

        const [newMember] = await db.insert(campaignMembers).values({
            campaignId,
            leadId: type === 'lead' ? memberId : null,
            contactId: type === 'contact' ? memberId : null,
            status: 'Sent'
        }).returning();

        return newMember;
    }
}
