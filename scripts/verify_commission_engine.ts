
import "dotenv/config";
import { db } from "../server/db";
import { commissionPlans, commissionAssignments, commissions, opportunities, users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { CommissionService } from "../server/services/CommissionService";

async function verifyCommissionEngine() {
    console.log("🚀 Starting verification for Incentive Compensation (Phase 22)...");

    let userId: string = "";
    let planId: string = "";
    let oppId: string = "";

    try {
        // 1. Create Mock User (or finding existing one, but creating is safer)
        console.log("\n--- Creating Sales Rep ---");
        const [user] = await db.insert(users).values({
            email: `salesrep_${Date.now()}@nexus.ai`,
            name: "Best Sales Rep",
            role: "user"
        }).returning();
        userId = user.id;
        console.log("✅ Created User:", userId);

        // 2. Create Commission Plan
        console.log("\n--- Creating Commission Plan ---");
        const [plan] = await db.insert(commissionPlans).values({
            name: "Standard 10% Plan",
            type: "percentage_deal_value",
            rate: "10", // 10%
        }).returning();
        planId = plan.id;
        console.log("✅ Created Plan:", planId, "(10% of Deal Value)");

        // 3. Assign Plan
        console.log("\n--- Assigning Plan to User ---");
        await db.insert(commissionAssignments).values({
            userId: userId,
            planId: planId
        });
        console.log("✅ Assigned Plan");

        // 4. Create Opportunity
        console.log("\n--- Creating Opportunity ---");
        const [opp] = await db.insert(opportunities).values({
            name: "Big Software Deal",
            ownerId: userId,
            amount: "10000",
            stage: "Closed Won",
            closeDate: new Date()
        }).returning();
        oppId = opp.id;
        console.log("✅ Created Opportunity:", oppId, "Value: $10,000");

        // 5. Trigger Commission Calculation
        console.log("\n--- Triggering Commission Calculation ---");
        const commission = await CommissionService.calculateCommission(oppId);

        if (!commission) throw new Error("Commission not generated!");

        console.log(`✅ Generated Commission Record: ID ${commission.id}`);
        console.log(`💰 Base Amount: $${commission.baseAmount}`);
        console.log(`💵 Commission Amount: $${commission.commissionAmount}`);

        // 6. Verify Amount
        if (Number(commission.commissionAmount) !== 1000) {
            throw new Error(`Incorrect Amount! Expected 1000, got ${commission.commissionAmount}`);
        }
        console.log("✅ Calculation Verified! (10% of 10,000 = 1,000)");

        // Cleanup
        console.log("\n--- Cleanup ---");
        await db.delete(commissions).where(eq(commissions.id, commission.id));
        await db.delete(opportunities).where(eq(opportunities.id, oppId));
        await db.delete(commissionAssignments).where(eq(commissionAssignments.userId, userId));
        await db.delete(commissionPlans).where(eq(commissionPlans.id, planId));
        await db.delete(users).where(eq(users.id, userId));
        console.log("✅ Cleanup complete");

        console.log("\n🎉 Verification SUCCESS!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ Verification FAILED:", error);
        // Attempt cleanup on fail
        try {
            if (oppId) await db.delete(opportunities).where(eq(opportunities.id, oppId));
            if (userId) await db.delete(users).where(eq(users.id, userId));
            if (planId) await db.delete(commissionPlans).where(eq(commissionPlans.id, planId));
        } catch (e) { /* ignore */ }
        process.exit(1);
    }
}

verifyCommissionEngine();
