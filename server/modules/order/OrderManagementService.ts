
import { db } from "../../db";
import { omOrderHeaders, omOrderLines, omHolds } from "../../../shared/schema/order_management";
import { arCustomers } from "../../../shared/schema/ar";
import { eq, sql, and, desc } from "drizzle-orm";
import { billingService } from "../billing/BillingService";

export class OrderManagementService {

    /**
     * Create a Draft Order (Header + Optional Lines)
     */
    async createOrder(data: any) {
        return await db.transaction(async (tx) => {
            const [header] = await tx.insert(omOrderHeaders).values({
                orderNumber: `ORD-${Date.now()}`,
                customerId: data.header.customerId,
                orderCurrency: data.header.currency || 'USD',
                orderType: data.header.orderType || 'STANDARD',
                status: 'DRAFT',
                orderedDate: new Date(),
                orgId: 'ORG-001' // Default for now

            }).returning();

            if (data.lines && data.lines.length > 0) {
                await tx.insert(omOrderLines).values(data.lines.map((line: any, index: number) => ({
                    headerId: header.id,
                    lineNumber: index + 1,
                    itemId: line.itemId,
                    orderedQuantity: line.orderedQuantity || line.quantity,
                    unitSellingPrice: line.unitSellingPrice || line.unitPrice,
                    status: 'AWAITING_FULFILLMENT',
                    orgId: 'ORG-001',
                    projectId: line.projectId,
                    taskId: line.taskId
                })));
            }

            return header;
        });
    }

    async findAll() {
        return await db.select({
            id: omOrderHeaders.id,
            orderNumber: omOrderHeaders.orderNumber,
            customerId: omOrderHeaders.customerId,
            customerName: arCustomers.name,
            totalAmount: omOrderHeaders.totalAmount,
            status: omOrderHeaders.status,
            orderedDate: omOrderHeaders.orderedDate,
            currency: omOrderHeaders.orderCurrency
        })
            .from(omOrderHeaders)
            .leftJoin(arCustomers, eq(omOrderHeaders.customerId, arCustomers.id))
            .orderBy(desc(omOrderHeaders.orderedDate));
    }

    async findById(id: string) {
        return await db.query.omOrderHeaders.findFirst({
            where: eq(omOrderHeaders.id, id),
            with: { lines: true }
        });
    }


    /**
     * Book Order: Transition from Draft to Booked.
     * Triggers: Credit Check, Inventory Reservation (Stubs for now).
     */
    async bookOrder(orderId: string) {
        // 1. Validate
        const order = await db.query.omOrderHeaders.findFirst({
            where: eq(omOrderHeaders.id, orderId)
        });

        // Fetch lines manually to check validity if needed, though for status update we might not need them yet
        // const lines = await db.select().from(omOrderLines).where(eq(omOrderLines.headerId, orderId));

        if (!order) throw new Error("Order not found");
        if (order.status !== 'DRAFT') throw new Error("Only Draft orders can be committed");

        // 2. Credit Check (Integrated Stub)
        // const creditCheck = await creditCheckService.checkCredit(order.customerId, Number(order.totalAmount));
        // if (!creditCheck.pass) ...
        const creditCheckPassed = true;

        if (!creditCheckPassed) {
            await db.insert(omHolds).values({
                headerId: orderId,
                holdName: "CREDIT_HOLD",
                holdReason: "Credit Limit Exceeded"
            });
            return { status: "HOLD", message: "Order placed on Credit Hold" };
        }

        // 3. Update Status
        const [updated] = await db.update(omOrderHeaders)
            .set({ status: "BOOKED", orderedDate: new Date() })
            .where(eq(omOrderHeaders.id, orderId))
            .returning();

        return updated;
    }

    /**
     * Transfer Order to Accounts Receivable (Invoice Generation)
     * Called after Shipping.
     */
    async transferToAR(orderId: string) {
        // 1. Get Shipped Lines
        const lines = await db.select().from(omOrderLines)
            .where(and(eq(omOrderLines.headerId, orderId), eq(omOrderLines.status, "SHIPPED")))
            .execute();

        if (lines.length === 0) throw new Error("No shipped lines to invoice.");

        // 2. Call BillingService
        for (const line of lines) {
            await billingService.processEvent({
                customerId: (await this.findById(orderId))?.customerId || "Unknown",
                sourceSystem: "OrderManagement",
                sourceTransactionId: line.id,
                eventDate: new Date(),
                amount: line.extendedAmount || "0",
                description: `Order ${orderId} Line ${line.lineNumber}: ${line.description}`,
                ruleId: undefined, // One-off
                status: "Pending"
            } as any);
        }

        // 3. Update Order Status to CLOSED or INVOICED
        await db.update(omOrderHeaders)
            .set({ status: "CLOSED" })
            .where(eq(omOrderHeaders.id, orderId));

        return { success: true, message: "Transferred to AR and Billing Events Created" };
    }

    /**
     * Cancel Order
     */
    async cancelOrder(orderId: string, reason: string) {
        // Logic to reverse reservations would go here.
        const [updated] = await db.update(omOrderHeaders)
            .set({ status: "CANCELLED" })
            .where(eq(omOrderHeaders.id, orderId))
            .returning();
        return updated;
    }
}

export const orderManagementService = new OrderManagementService();
