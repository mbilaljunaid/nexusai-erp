import { db } from '../db';
import { customerNotifications, insertCustomerNotificationSchema } from '@shared/schema';
import type { InsertCustomerNotification, CustomerNotification } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export class NotificationService {
    /**
     * Create a new notification for a customer
     */
    async createNotification(data: InsertCustomerNotification): Promise<CustomerNotification> {
        const validated = insertCustomerNotificationSchema.parse(data);

        const [notification] = await db.insert(customerNotifications)
            .values(validated)
            .returning();

        return notification;
    }

    /**
     * Get unread notification count for a customer
     */
    async getUnreadCount(customerId: string): Promise<number> {
        const result = await db.select()
            .from(customerNotifications)
            .where(
                and(
                    eq(customerNotifications.customerId, customerId),
                    eq(customerNotifications.read, false)
                )
            );

        return result.length;
    }

    /**
     * Get all notifications for a customer (paginated)
     */
    async getNotifications(customerId: string, limit: number = 50): Promise<CustomerNotification[]> {
        return await db.select()
            .from(customerNotifications)
            .where(eq(customerNotifications.customerId, customerId))
            .orderBy(desc(customerNotifications.createdAt))
            .limit(limit);
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        await db.update(customerNotifications)
            .set({ read: true })
            .where(eq(customerNotifications.id, notificationId));
    }

    /**
     * Mark all notifications as read for a customer
     */
    async markAllAsRead(customerId: string): Promise<void> {
        await db.update(customerNotifications)
            .set({ read: true })
            .where(eq(customerNotifications.customerId, customerId));
    }

    /**
     * Trigger notification on payment received
     */
    async notifyPaymentReceived(customerId: string, amount: number, invoiceNumber: string): Promise<void> {
        await this.createNotification({
            customerId,
            type: 'payment_received',
            title: 'Payment Received',
            message: `Your payment of $${amount.toFixed(2)} for invoice ${invoiceNumber} has been received.`,
            read: false,
        });
    }

    /**
     * Trigger notification on dispute status update
     */
    async notifyDisputeUpdate(customerId: string, disputeId: string, status: string, adminResponse?: string): Promise<void> {
        let message = `Your dispute status has been updated to: ${status}`;
        if (adminResponse) {
            message += `\n\nAdmin Response: ${adminResponse}`;
        }

        await this.createNotification({
            customerId,
            type: 'dispute_update',
            title: 'Dispute Update',
            message,
            read: false,
            referenceId: disputeId,
        });
    }

    /**
     * Trigger notification on new invoice
     */
    async notifyNewInvoice(customerId: string, invoiceNumber: string, amount: number): Promise<void> {
        await this.createNotification({
            customerId,
            type: 'new_invoice',
            title: 'New Invoice',
            message: `A new invoice ${invoiceNumber} for $${amount.toFixed(2)} has been issued to your account.`,
            read: false,
        });
    }
}

export const notificationService = new NotificationService();
