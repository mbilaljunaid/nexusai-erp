
import { db } from "../db";
import { commissionPlans, commissionAssignments, commissions, opportunities } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";

export class CommissionService {

    static async calculateCommission(opportunityId: string) {
        // 1. Fetch Opportunity
        const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, opportunityId));
        if (!opportunity) throw new Error("Opportunity not found");
        if (!opportunity.ownerId) throw new Error("Opportunity has no owner");

        // 2. Fetch User's Commission Plan (Manual Join)
        // We use explicit join to guarantee data availability without requiring schema relations
        const result = await db.select({
            plan: commissionPlans
        })
            .from(commissionAssignments)
            .innerJoin(commissionPlans, eq(commissionPlans.id, commissionAssignments.planId))
            .where(eq(commissionAssignments.userId, opportunity.ownerId))
            .limit(1);

        const plan = result[0]?.plan;

        if (!plan) {
            console.warn(`No commission plan found for user ${opportunity.ownerId}`);
            return null; // No commission
        }

        // 3. Calculate Amount
        const dealValue = Number(opportunity.amount || 0);
        const rate = Number(plan.rate);
        let commissionAmount = 0;

        if (plan.type === "percentage_deal_value") {
            commissionAmount = (dealValue * rate) / 100;
        } else if (plan.type === "flat_rate") {
            commissionAmount = rate;
        }

        if (commissionAmount <= 0) return null;

        // 4. Create Record
        const [record] = await db.insert(commissions).values({
            opportunityId: opportunity.id,
            userId: opportunity.ownerId,
            planId: plan.id,
            baseAmount: String(dealValue),
            commissionAmount: String(commissionAmount),
            status: "pending",
        }).returning();

        return record;
    }
}
