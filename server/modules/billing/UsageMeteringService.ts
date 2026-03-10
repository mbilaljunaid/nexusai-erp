import { db } from "../../db";
import { usageMeters, usageEvents, usageThresholds, type UsageMeter, type UsageEvent } from "@shared/schema/usage_metering";
import { billingEvents } from "@shared/schema/billing_enterprise";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

/**
 * UsageMeteringService
 * Handles usage tracking, aggregation, and threshold monitoring
 */
export class UsageMeteringService {

    // ========== METER MANAGEMENT ==========

    async createMeter(data: typeof usageMeters.$inferInsert) {
        const [meter] = await db.insert(usageMeters).values(data).returning();
        return meter;
    }

    async getMeters() {
        return await db.select().from(usageMeters).where(eq(usageMeters.isActive, true));
    }

    async getMeter(id: string) {
        const [meter] = await db.select().from(usageMeters).where(eq(usageMeters.id, id));
        return meter;
    }

    async updateMeter(id: string, data: Partial<typeof usageMeters.$inferInsert>) {
        const [updated] = await db.update(usageMeters)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(usageMeters.id, id))
            .returning();
        return updated;
    }

    // ========== USAGE EVENT INGESTION ==========

    async recordUsageEvent(data: typeof usageEvents.$inferInsert) {
        // Insert the event
        const [event] = await db.insert(usageEvents).values(data).returning();

        // Check if threshold is exceeded
        await this.checkThresholds(data.customerId, data.meterId);

        return event;
    }

    async getUsageEvents(filters: {
        customerId?: string;
        meterId?: string;
        startDate?: Date;
        endDate?: Date;
        status?: string;
        limit?: number;
        offset?: number;
    }) {
        const { customerId, meterId, startDate, endDate, status, limit = 100, offset = 0 } = filters;

        let query = db.select().from(usageEvents);

        const conditions = [];
        if (customerId) conditions.push(eq(usageEvents.customerId, customerId));
        if (meterId) conditions.push(eq(usageEvents.meterId, meterId));
        if (startDate) conditions.push(gte(usageEvents.timestamp, startDate));
        if (endDate) conditions.push(lte(usageEvents.timestamp, endDate));
        if (status) conditions.push(eq(usageEvents.status, status));

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        const events = await query.limit(limit).offset(offset).orderBy(desc(usageEvents.timestamp));

        return events;
    }

    // ========== USAGE AGGREGATION ==========

    async getUsageSummary(customerId: string, meterId?: string, period: 'current' | 'last_30_days' = 'current') {
        const now = new Date();
        const startDate = period === 'current' ? startOfMonth(now) : subMonths(now, 1);
        const endDate = period === 'current' ? endOfMonth(now) : now;

        // Build conditions
        const conditions = [
            eq(usageEvents.customerId, customerId),
            gte(usageEvents.timestamp, startDate),
            lte(usageEvents.timestamp, endDate)
        ];

        if (meterId) {
            conditions.push(eq(usageEvents.meterId, meterId));
        }

        // Aggregate total usage
        const result = await db
            .select({
                meterId: usageEvents.meterId,
                totalQuantity: sql<string>`SUM(${usageEvents.quantity})`,
                eventCount: sql<number>`COUNT(*)`,
            })
            .from(usageEvents)
            .where(and(...conditions))
            .groupBy(usageEvents.meterId);

        // Calculate billable amount using pricing tiers
        const summaryWithPricing = await Promise.all(
            result.map(async (r) => {
                const meter = await this.getMeter(r.meterId);
                const billableAmount = this.calculateBillableAmount(
                    parseFloat(r.totalQuantity),
                    meter?.pricingTiers as any
                );

                return {
                    meterId: r.meterId,
                    meterName: meter?.name || 'Unknown',
                    totalQuantity: r.totalQuantity,
                    eventCount: r.eventCount,
                    billableAmount,
                    unit: meter?.unitOfMeasure || 'units',
                };
            })
        );

        return summaryWithPricing;
    }

    private calculateBillableAmount(quantity: number, tiers: Array<{ min: number; max: number | null; price: string }> | null): number {
        if (!tiers || tiers.length === 0) return 0;

        let totalCost = 0;
        let remainingQty = quantity;

        for (const tier of tiers) {
            if (remainingQty <= 0) break;

            const tierMin = tier.min;
            const tierMax = tier.max;
            const tierPrice = parseFloat(tier.price);

            // Calculate quantity in this tier
            let qtyInTier = 0;
            if (tierMax === null) {
                // Unlimited tier
                qtyInTier = remainingQty;
            } else {
                const tierRange = tierMax - tierMin;
                qtyInTier = Math.min(remainingQty, tierRange);
            }

            totalCost += qtyInTier * tierPrice;
            remainingQty -= qtyInTier;
        }

        return parseFloat(totalCost.toFixed(2));
    }

    // ========== THRESHOLD MONITORING ==========

    async createThreshold(data: typeof usageThresholds.$inferInsert) {
        const [threshold] = await db.insert(usageThresholds).values(data).returning();
        return threshold;
    }

    async getThresholds(customerId?: string) {
        if (customerId) {
            return await db.select().from(usageThresholds)
                .where(and(
                    eq(usageThresholds.customerId, customerId),
                    eq(usageThresholds.isActive, true)
                ));
        }
        return await db.select().from(usageThresholds).where(eq(usageThresholds.isActive, true));
    }

    private async checkThresholds(customerId: string, meterId: string) {
        // Get active thresholds for this customer + meter
        const thresholds = await db.select().from(usageThresholds)
            .where(and(
                eq(usageThresholds.customerId, customerId),
                eq(usageThresholds.meterId, meterId),
                eq(usageThresholds.isActive, true)
            ));

        if (thresholds.length === 0) return;

        // Get current period usage
        const summary = await this.getUsageSummary(customerId, meterId, 'current');
        const currentUsage = summary.find(s => s.meterId === meterId);

        if (!currentUsage) return;

        for (const threshold of thresholds) {
            const thresholdValue = parseFloat(threshold.thresholdValue);
            const currentValue = parseFloat(currentUsage.totalQuantity);

            if (currentValue >= thresholdValue) {
                // Threshold exceeded - send notification (simplified for MVP)
                console.log(`⚠️  Usage Threshold Exceeded for Customer ${customerId}, Meter ${meterId}: ${currentValue} >= ${thresholdValue}`);

                // Update last triggered timestamp
                await db.update(usageThresholds)
                    .set({ lastTriggeredAt: new Date() })
                    .where(eq(usageThresholds.id, threshold.id));

                // In production, this would trigger email/webhook notifications
            }
        }
    }

    // ========== BILLING INTEGRATION ==========

    async generateBillingEventsFromUsage(customerId: string, periodStart: Date, periodEnd: Date) {
        // Get all meters
        const meters = await this.getMeters();

        const billingEventsCreated = [];

        for (const meter of meters) {
            // Get usage summary for this meter
            const events = await this.getUsageEvents({
                customerId,
                meterId: meter.id,
                startDate: periodStart,
                endDate: periodEnd,
                status: 'Pending'
            });

            if (events.length === 0) continue;

            // Calculate total quantity
            const totalQuantity = events.reduce((sum, e) => sum + parseFloat(e.quantity), 0);

            // Calculate billable amount
            const billableAmount = this.calculateBillableAmount(totalQuantity, meter.pricingTiers as any);

            if (billableAmount <= 0) continue;

            // Create billing event
            const [billingEvent] = await db.insert(billingEvents).values({
                sourceSystem: "Usage Metering",
                sourceTransactionId: meter.id,
                customerId,
                eventDate: periodEnd,
                amount: billableAmount.toString(),
                currency: "USD",
                description: `Usage: ${meter.name} - ${totalQuantity} ${meter.unitOfMeasure}`,
                quantity: totalQuantity.toString(),
                unitPrice: "0", // Tiered pricing, not simple unit price
                status: "Pending"
            }).returning();

            // Mark usage events as billed
            for (const event of events) {
                await db.update(usageEvents)
                    .set({ status: "Billed", billedAt: new Date() })
                    .where(eq(usageEvents.id, event.id));
            }

            billingEventsCreated.push(billingEvent);
        }

        return {
            message: "Billing events generated from usage",
            count: billingEventsCreated.length,
            events: billingEventsCreated
        };
    }

    // ========== DASHBOARD METRICS ==========

    async getDashboardMetrics(customerId?: string) {
        const now = new Date();
        const monthStart = startOfMonth(now);

        let usageQuery = db.select({
            totalEvents: sql<number>`COUNT(*)`,
            totalQuantity: sql<string>`SUM(${usageEvents.quantity})`
        }).from(usageEvents)
            .where(gte(usageEvents.timestamp, monthStart));

        if (customerId) {
            usageQuery = usageQuery.where(eq(usageEvents.customerId, customerId)) as any;
        }

        const [metrics] = await usageQuery;

        const activeMeters = await db.select({ count: sql<number>`COUNT(*)` })
            .from(usageMeters)
            .where(eq(usageMeters.isActive, true));

        const activeThresholds = await db.select({ count: sql<number>`COUNT(*)` })
            .from(usageThresholds)
            .where(eq(usageThresholds.isActive, true));

        return {
            totalUsageEvents: metrics?.totalEvents || 0,
            totalQuantityConsumed: metrics?.totalQuantity || "0",
            activeMeters: activeMeters[0]?.count || 0,
            activeThresholds: activeThresholds[0]?.count || 0,
            period: "Current Month"
        };
    }
}

export const usageMeteringService = new UsageMeteringService();
