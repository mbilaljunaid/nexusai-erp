import { db } from "../db";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { auditService } from "./audit_service";
import {
    bom, bomItems, productionOrders, inventory,
    demandForecasts, mrpPlans, mrpRecommendations,
    orders as salesOrders,
    type InsertMrpPlan, type InsertMrpRecommendation,
    type InsertDemandForecast
} from "@shared/schema";

export class ManufacturingPlanningService {
    // ========== FORECASTING & PLANNING ==========

    async getDemandForecasts() {
        return await db.select().from(demandForecasts).orderBy(desc(demandForecasts.forecastDate));
    }

    async createDemandForecast(data: InsertDemandForecast) {
        const [result] = await db.insert(demandForecasts).values(data).returning();
        return result;
    }

    async getMrpPlans() {
        return await db.select().from(mrpPlans).orderBy(desc(mrpPlans.createdAt));
    }

    async createMrpPlan(data: InsertMrpPlan) {
        const [result] = await db.insert(mrpPlans).values(data).returning();
        return result;
    }

    async getRecommendations(planId: string, limit = 50, offset = 0) {
        const items = await db.select().from(mrpRecommendations)
            .where(eq(mrpRecommendations.planId, planId))
            .limit(limit)
            .offset(offset);
        const [countResult] = await db.select({ count: sql<number>`count(*)` })
            .from(mrpRecommendations)
            .where(eq(mrpRecommendations.planId, planId));
        return { items, total: Number(countResult.count) };
    }

    // ========== MRP ENGINE CORE ==========

    async runMRP(planId: string) {
        return await db.transaction(async (tx) => {
            const [plan] = await tx.select().from(mrpPlans).where(eq(mrpPlans.id, planId)).limit(1);
            if (!plan) throw new Error("Plan not found");

            // Audit: Start of Plan
            await auditService.logAction({
                userId: "SYSTEM", // Should be passed from context in real app
                action: "MRP_RUN_START",
                entityType: "MRP_PLAN",
                entityId: planId,
                newValue: { planName: plan.planName, horizonStart: plan.horizonStartDate, horizonEnd: plan.horizonEndDate }
            });

            // 1. Gather Demand
            const forecasts = await tx.select().from(demandForecasts)
                .where(and(
                    eq(demandForecasts.status, "active"),
                    sql`${demandForecasts.forecastDate} >= ${plan.horizonStartDate}`,
                    sql`${demandForecasts.forecastDate} <= ${plan.horizonEndDate}`
                ));

            const activeSalesOrders = await tx.select().from(salesOrders)
                .where(inArray(salesOrders.status, ["Activated", "Draft"])); // Assuming these need fulfillment

            // 2. Gather Supply
            const onHand = await tx.select().from(inventory);
            const openWorkOrders = await tx.select().from(productionOrders)
                .where(inArray(productionOrders.status, ["planned", "released", "in_progress"]));

            // 3. Calculation logic (Netting)
            // For MVP: Recommend based on net deficiency per product
            const requirements = new Map<string, number>();

            // Add Demand
            forecasts.forEach(f => {
                requirements.set(f.productId, (requirements.get(f.productId) || 0) + Number(f.quantity));
            });

            // Subtract Supply
            onHand.forEach(i => {
                if (i.id) {
                    requirements.set(i.id, (requirements.get(i.id) || 0) - (i.quantity || 0));
                }
            });

            openWorkOrders.forEach(wo => {
                if (wo.productId) {
                    requirements.set(wo.productId, (requirements.get(wo.productId) || 0) - (wo.quantity || 0));
                }
            });

            // 4. Generate Recommendations
            const recommendations: InsertMrpRecommendation[] = [];

            for (const [productId, netRequired] of requirements.entries()) {
                if (netRequired > 0) {
                    const [productBom] = await tx.select().from(bom).where(eq(bom.productId, productId)).limit(1);

                    recommendations.push({
                        planId,
                        productId,
                        recommendationType: productBom ? "PLANNED_WO" : "PLANNED_PO",
                        suggestedQuantity: netRequired.toString(),
                        suggestedDate: new Date(), // Should be calculated based on lead time
                        status: "pending"
                    });
                }
            }

            if (recommendations.length > 0) {
                await tx.insert(mrpRecommendations).values(recommendations);
            }

            await tx.update(mrpPlans).set({ status: "completed" }).where(eq(mrpPlans.id, planId));

            // Audit: Completion of Plan
            await auditService.logAction({
                userId: "SYSTEM",
                action: "MRP_RUN_COMPLETE",
                entityType: "MRP_PLAN",
                entityId: planId,
                newValue: { recommendationCount: recommendations.length }
            });

            return recommendations;
        });
    }
}

export const manufacturingPlanningService = new ManufacturingPlanningService();
