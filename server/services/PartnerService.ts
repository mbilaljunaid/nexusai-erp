
import { db } from "../db";
import { partners, dealRegistrations } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";
import { auditService } from "./audit_service";

export class PartnerService {

    // Register a new deal
    static async registerDeal(data: any) {
        const [deal] = await db.insert(dealRegistrations).values({
            ...data,
            stage: "Prospecting",
            status: "Pending"
        }).returning();

        await auditService.logAction({
            userId: 'partner-portal',
            action: 'REGISTER_DEAL',
            entityType: 'deal_registration',
            entityId: deal.id,
            details: { partnerId: data.partnerId, dealName: data.dealName }
        });
        return deal;
    }

    // Get deals for a specific partner
    static async getPartnerDeals(partnerId: string) {
        return await db.select()
            .from(dealRegistrations)
            .where(eq(dealRegistrations.partnerId, partnerId))
            .orderBy(desc(dealRegistrations.createdAt));
    }

    // Get all deals (for internal review)
    static async getAllDeals(page = 1, limit = 50) {
        const offset = (page - 1) * limit;

        const data = await db.select()
            .from(dealRegistrations)
            .orderBy(desc(dealRegistrations.createdAt))
            .limit(limit)
            .offset(offset);

        const total = (await db.select().from(dealRegistrations)).length;

        return { data, total, page, limit };
    }

    // Update deal status (Approve/Reject)
    static async updateDealStatus(id: string, status: string, notes?: string) {
        const [deal] = await db.update(dealRegistrations)
            .set({ status, notes })
            .where(eq(dealRegistrations.id, id))
            .returning();

        // In a real system, if Approved, this would create a CRM Opportunity here

        return deal;
    }

    // Ensure partner exists (helper for verification)
    static async ensurePartner(name: string, email: string) {
        const existing = await db.select().from(partners).where(eq(partners.email, email));
        if (existing.length > 0) return existing[0];

        const [partner] = await db.insert(partners).values({
            name,
            company: name + " Corp",
            email,
            type: "partner",
            tier: "silver",
            isApproved: true
        }).returning();
        return partner;
    }
}
