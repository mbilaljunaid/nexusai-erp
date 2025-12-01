/**
 * Webhook Manager - Phase 6
 * Webhook delivery and event handling
 */

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  retryPolicy: { maxRetries: number; backoffMs: number };
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  data: Record<string, any>;
  timestamp: Date;
  deliveryStatus: "pending" | "delivered" | "failed";
  retryCount: number;
  nextRetryAt?: Date;
}

export class WebhookManager {
  private webhooks: Map<string, Webhook> = new Map();
  private events: Map<string, WebhookEvent> = new Map();
  private eventCounter: number = 0;

  /**
   * Register webhook
   */
  registerWebhook(webhook: Webhook): void {
    this.webhooks.set(webhook.id, webhook);
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(event: string, data: any): Promise<WebhookEvent[]> {
    const deliveredEvents: WebhookEvent[] = [];

    for (const webhook of this.webhooks.values()) {
      if (!webhook.active || !webhook.events.includes(event)) {
        continue;
      }

      const webhookEvent: WebhookEvent = {
        id: `WHE-${Date.now()}-${++this.eventCounter}`,
        webhookId: webhook.id,
        event,
        data,
        timestamp: new Date(),
        deliveryStatus: "pending",
        retryCount: 0,
      };

      this.events.set(webhookEvent.id, webhookEvent);

      // Queue for delivery
      await this.deliverEvent(webhook, webhookEvent);
      deliveredEvents.push(webhookEvent);
    }

    return deliveredEvents;
  }

  /**
   * Deliver webhook event
   */
  private async deliverEvent(webhook: Webhook, event: WebhookEvent): Promise<void> {
    try {
      // In production, would make actual HTTP request with retry logic
      const payload = {
        id: event.id,
        event: event.event,
        data: event.data,
        timestamp: event.timestamp,
      };

      // Sign payload if secret exists
      if (webhook.secret) {
        // In production: create HMAC signature
      }

      // Simulate delivery
      event.deliveryStatus = "delivered";
    } catch (error) {
      event.deliveryStatus = "failed";

      // Schedule retry if under max retries
      if (event.retryCount < webhook.retryPolicy.maxRetries) {
        event.retryCount++;
        event.nextRetryAt = new Date(Date.now() + webhook.retryPolicy.backoffMs);
      }
    }
  }

  /**
   * Get webhook
   */
  getWebhook(webhookId: string): Webhook | null {
    return this.webhooks.get(webhookId) || null;
  }

  /**
   * Get all webhooks
   */
  getAllWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get webhook events
   */
  getWebhookEvents(webhookId: string): WebhookEvent[] {
    const events: WebhookEvent[] = [];
    for (const event of this.events.values()) {
      if (event.webhookId === webhookId) {
        events.push(event);
      }
    }
    return events;
  }

  /**
   * Retry failed deliveries
   */
  async retryFailedDeliveries(): Promise<number> {
    let count = 0;
    for (const event of this.events.values()) {
      if (event.deliveryStatus === "failed" && event.nextRetryAt && new Date() >= event.nextRetryAt) {
        const webhook = this.webhooks.get(event.webhookId);
        if (webhook) {
          await this.deliverEvent(webhook, event);
          count++;
        }
      }
    }
    return count;
  }
}

export const webhookManager = new WebhookManager();
