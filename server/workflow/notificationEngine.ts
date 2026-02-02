/**
 * Notification Engine - Phase 4
 * Sends notifications for workflow events
 */

export interface Notification {
  id: string;
  userId: string;
  type: "form_submitted" | "approval_requested" | "form_approved" | "form_rejected" | "status_changed";
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface NotificationTemplate {
  type: string;
  title: string;
  messageTemplate: string;
}

export class NotificationEngine {
  private notifications: Map<string, Notification[]> = new Map();
  private notificationCounter: number = 0;

  private templates: Record<string, NotificationTemplate> = {
    form_submitted: {
      type: "form_submitted",
      title: "Form Submitted",
      messageTemplate: "{submitterName} submitted {formName} #{recordId}",
    },
    approval_requested: {
      type: "approval_requested",
      title: "Approval Needed",
      messageTemplate: "{requesterName} requested approval for {formName} #{recordId}",
    },
    form_approved: {
      type: "form_approved",
      title: "Form Approved",
      messageTemplate: "{approverName} approved {formName} #{recordId}",
    },
    form_rejected: {
      type: "form_rejected",
      title: "Form Rejected",
      messageTemplate: "{approverName} rejected {formName} #{recordId}: {reason}",
    },
    status_changed: {
      type: "status_changed",
      title: "Status Changed",
      messageTemplate: "{formName} #{recordId} status changed to {newStatus}",
    },
  };

  /**
   * Send notification
   */
  sendNotification(
    userId: string,
    type: string,
    data: Record<string, any>,
    recipientList?: string[]
  ): Notification[] {
    const template = this.templates[type];
    if (!template) {
      return [];
    }

    const recipients = recipientList || [userId];
    const notifications: Notification[] = [];

    for (const recipientId of recipients) {
      const notification: Notification = {
        id: `NOTIF-${Date.now()}-${++this.notificationCounter}`,
        userId: recipientId,
        type: type as any,
        title: template.title,
        message: this.renderTemplate(template.messageTemplate, data),
        data,
        read: false,
        createdAt: new Date(),
      };

      if (!this.notifications.has(recipientId)) {
        this.notifications.set(recipientId, []);
      }
      this.notifications.get(recipientId)!.push(notification);
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Get notifications for user
   */
  getNotificationsForUser(userId: string, unreadOnly: boolean = false): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];
    return unreadOnly ? userNotifications.filter((n) => !n.read) : userNotifications;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    for (const notifications of this.notifications.values()) {
      const notif = notifications.find((n) => n.id === notificationId);
      if (notif) {
        notif.read = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Mark all notifications as read for user
   */
  markAllAsRead(userId: string): number {
    const userNotifications = this.notifications.get(userId) || [];
    let count = 0;
    for (const notif of userNotifications) {
      if (!notif.read) {
        notif.read = true;
        count++;
      }
    }
    return count;
  }

  /**
   * Render template with data
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    let message = template;
    for (const [key, value] of Object.entries(data)) {
      message = message.replace(`{${key}}`, String(value));
    }
    return message;
  }

  /**
   * Get unread count for user
   */
  getUnreadCount(userId: string): number {
    return this.getNotificationsForUser(userId, true).length;
  }
}

export const notificationEngine = new NotificationEngine();
