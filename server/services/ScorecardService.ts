import { db } from "../db";
import { supplierScorecards, supplierQualityEvents, asnHeaders, asnLines, purchaseOrders } from "../../shared/schema/scm";
import { eq, and, desc, sql } from "drizzle-orm";

export class ScorecardService {
    /**
     * Calculate and Upsert Scorecard for a specific period (e.g., Current Quarter)
     */
    async calculateScorecard(supplierId: string, period: string) {
        console.log(`[Scorecard] Calculating for Supplier ${supplierId}, Period ${period}`);

        // 1. Delivery Score: Based on ASNs vs Expected Date
        // Formula: (OnTime / Total) * 100
        const asns = await db.select().from(asnHeaders)
            .where(eq(asnHeaders.supplierId, supplierId));

        // Filter by period (naive implementation: check all for MVP or filter by date range if we had helpers)
        // For MVP, we'll calculate "Life to Date" as the current period or just assume all recent data applies.

        let onTime = 0;
        let totalShipments = asns.length;

        for (const asn of asns) {
            if (asn.shippedDate && asn.expectedArrivalDate) {
                if (new Date(asn.shippedDate) <= new Date(asn.expectedArrivalDate)) {
                    onTime++;
                }
            }
        }

        const deliveryScore = totalShipments > 0 ? Math.round((onTime / totalShipments) * 100) : 100;

        // 2. Quality Score: Based on Quality Events
        // Formula: 100 - (Events * 10) (Simple penalty model)
        const events = await db.select().from(supplierQualityEvents)
            .where(eq(supplierQualityEvents.supplierId, supplierId));

        // Calculate penalty
        const qualityPenalty = events.reduce((acc, ev) => {
            if (ev.severity === 'CRITICAL') return acc + 20;
            if (ev.severity === 'MEDIUM') return acc + 10;
            return acc + 5;
        }, 0);

        const qualityScore = Math.max(0, 100 - qualityPenalty);

        // 3. Responsiveness Score (Mock logic for now, or based on PO Ack time)
        // Let's assume 90 for now as we don't track Ack timestamps yet.
        const responsivenessScore = 90;

        // 4. Overall Score
        const overallScore = Math.round((deliveryScore * 0.4) + (qualityScore * 0.4) + (responsivenessScore * 0.2));

        // 5. Upsert into DB
        // Check if exists
        const [existing] = await db.select().from(supplierScorecards)
            .where(and(
                eq(supplierScorecards.supplierId, supplierId),
                eq(supplierScorecards.period, period)
            ));

        if (existing) {
            await db.update(supplierScorecards)
                .set({
                    overallScore,
                    deliveryScore,
                    qualityScore,
                    responsivenessScore,
                    generatedAt: new Date()
                })
                .where(eq(supplierScorecards.id, existing.id));
            return { ...existing, overallScore, deliveryScore, qualityScore, responsivenessScore };
        } else {
            const [created] = await db.insert(supplierScorecards).values({
                supplierId,
                period,
                overallScore,
                deliveryScore,
                qualityScore,
                responsivenessScore
            }).returning();
            return created;
        }
    }

    /**
     * Get latest scorecard
     */
    async getLatestScorecard(supplierId: string) {
        // Define current period (e.g., "2025-Q1")
        const currentPeriod = "Current"; // Simplified for MVP

        let [scorecard] = await db.select().from(supplierScorecards)
            .where(and(
                eq(supplierScorecards.supplierId, supplierId),
                eq(supplierScorecards.period, currentPeriod)
            ));

        if (!scorecard) {
            // Calculate on the fly if missing
            scorecard = await this.calculateScorecard(supplierId, currentPeriod);
        }

        return scorecard;
    }
}

export const scorecardService = new ScorecardService();
