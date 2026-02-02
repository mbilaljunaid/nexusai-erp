
import { db } from "../../db";
import {
    subscriptionContracts, subscriptionProducts, subscriptionActions,
    billingEvents
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { addMonths, addYears } from "date-fns";

export class SubscriptionService {

    // Create new subscription
    async createSubscription(data: any) {
        // 1. Create Header
        const [contract] = await db.insert(subscriptionContracts).values({
            contractNumber: data.contractNumber,
            customerId: data.customerId,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : addYears(new Date(data.startDate), 1),
            status: "Active",
            totalTcv: data.totalTcv,
            totalMrr: data.totalMrr,
            billingFrequency: data.billingFrequency || "Monthly"
        }).returning();

        // 2. Create Lines
        if (data.products && data.products.length > 0) {
            for (const p of data.products) {
                await db.insert(subscriptionProducts).values({
                    subscriptionId: contract.id,
                    itemId: p.itemId,
                    itemName: p.itemName,
                    quantity: p.quantity,
                    unitPrice: p.unitPrice,
                    amount: p.amount,
                    billingType: p.billingType || "Recurring",
                    status: "Active"
                });
            }
        }

        // 3. Log Action
        await this.logAction(contract.id, "New", "Initial Creation", { data });

        return this.getSubscription(contract.id);
    }

    // Get Subscription with Products
    async getSubscription(id: string) {
        const contract = await db.query.subscriptionContracts.findFirst({
            where: eq(subscriptionContracts.id, id),
            with: {
                products: true,
                actions: {
                    orderBy: [desc(subscriptionActions.actionDate)]
                }
            }
        });
        return contract;
    }

    // Amend Subscription (Upsell / Downsell)
    async amendSubscription(id: string, amendment: any) {
        const contract = await this.getSubscription(id);
        if (!contract) throw new Error("Subscription not found");

        const changes: any = {};

        // Update Products
        for (const p of amendment.products) {
            if (p.id) {
                // Update existing
                await db.update(subscriptionProducts)
                    .set({ quantity: p.quantity, amount: p.amount })
                    .where(eq(subscriptionProducts.id, p.id));
                changes[`product_${p.id}`] = { newQty: p.quantity };
            } else {
                // Add new
                await db.insert(subscriptionProducts).values({
                    subscriptionId: id,
                    ...p,
                    status: "Active"
                });
                changes[`new_product`] = p.itemName;
            }
        }

        // Recalculate Totals (simplified)
        const newMrr = (parseFloat(contract.totalMrr || "0") + (amendment.mrrDelta || 0)).toString();
        await db.update(subscriptionContracts)
            .set({ totalMrr: newMrr, updatedAt: new Date() })
            .where(eq(subscriptionContracts.id, id));

        await this.logAction(id, "Amend", amendment.reason || "Amendment", changes);

        return this.getSubscription(id);
    }

    // Renew Subscription
    async renewSubscription(id: string) {
        const contract = await this.getSubscription(id);
        if (!contract) throw new Error("Subscription not found");

        const oldEndDate = contract.endDate || new Date();
        const newEndDate = addYears(new Date(oldEndDate), 1);

        await db.update(subscriptionContracts)
            .set({ endDate: newEndDate, renewalType: "Manual" })
            .where(eq(subscriptionContracts.id, id));

        await this.logAction(id, "Renew", "Manual Renewal via Workbench", { oldEndDate, newEndDate });
        return this.getSubscription(id);
    }

    // Terminate
    async terminateSubscription(id: string, reason: string) {
        await db.update(subscriptionContracts)
            .set({ status: "Cancelled", endDate: new Date() })
            .where(eq(subscriptionContracts.id, id));

        // Cancel all lines
        await db.update(subscriptionProducts)
            .set({ status: "Cancelled", endDate: new Date() })
            .where(eq(subscriptionProducts.subscriptionId, id));

        await this.logAction(id, "Terminate", reason, {});
        return { message: "Subscription Terminated" };
    }

    // Helper: Log Action
    private async logAction(subId: string, type: string, reason: string, changes: any) {
        await db.insert(subscriptionActions).values({
            subscriptionId: subId,
            actionType: type,
            reason: reason,
            changes: changes,
            performedBy: "System" // Mock user
        });
    }

    // Integration: Generate Billing Events from Active Subscriptions
    // (This would be called by a scheduler)
    async generateBillingEvents(targetDate: Date = new Date()) {
        // 1. Find active subscriptions
        const activeSubs = await db.query.subscriptionContracts.findMany({
            where: eq(subscriptionContracts.status, "Active"),
            with: { products: true }
        });

        const events = [];

        // 2. Iterate and create events
        // Simplification: We assume Monthly billing and billing date = current date for MVP
        // In production, we'd check last_billed_date vs next_billing_date
        for (const sub of activeSubs) {
            for (const product of sub.products) {
                if (product.status !== 'Active') continue;

                const event = await db.insert(billingEvents).values({
                    sourceSystem: "Contracts",
                    sourceTransactionId: product.id, // Linking back to Subscription Product Line
                    customerId: sub.customerId!,
                    eventDate: targetDate,
                    amount: product.amount,
                    currency: sub.currency,
                    description: `Subscription Charge: ${sub.contractNumber} - ${product.itemName}`,
                    quantity: product.quantity,
                    unitPrice: product.unitPrice,
                    status: "Pending" // Ready for Auto-Invoice
                }).returning();

                events.push(event[0]);
            }
        }

        return {
            message: "Billing Events Generated",
            count: events.length,
            events: events
        };
    }
}

export const subscriptionService = new SubscriptionService();
