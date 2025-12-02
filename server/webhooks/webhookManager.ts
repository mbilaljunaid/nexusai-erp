/**
 * Webhook Manager - Phase 6
 * Webhook delivery and event handling
 */

import crypto from "crypto";

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
    if (!webhook.id || !webhook.url) {
      throw new Error("Webhook must have id and url");
    }
    this.webhooks.set(webhook.id, webhook);
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(event: string, data: any): Promise<WebhookEvent[]> {
    if (!event || !data) {
      throw new Error("Event and data are required");
    }

    const deliveredEvents: WebhookEvent[] = [];

    const webhooks = Array.from(this.webhooks.values());
    for (const webhook of webhooks) {
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
      try {
        await this.deliverEvent(webhook, webhookEvent);
      } catch (error) {
        // Error already handled in deliverEvent
      }
      deliveredEvents.push(webhookEvent);
    }

    return deliveredEvents;
  }

  /**
   * Deliver webhook event
   */
  private async deliverEvent(webhook: Webhook, event: WebhookEvent): Promise<void> {
    try {
      const payload = {
        id: event.id,
        event: event.event,
        data: event.data,
        timestamp: event.timestamp.toISOString(),
      };

      // Sign payload if secret exists
      let signature: string | undefined;
      if (webhook.secret) {
        signature = crypto
          .createHmac("sha256", webhook.secret)
          .update(JSON.stringify(payload))
          .digest("hex");
      }

      // In production: make actual HTTP request
      // For now, simulate successful delivery
      event.deliveryStatus = "delivered";
    } catch (error: any) {
      event.deliveryStatus = "failed";

      // Schedule retry if under max retries
      if (event.retryCount < webhook.retryPolicy.maxRetries) {
        event.retryCount++;
        event.nextRetryAt = new Date(Date.now() + webhook.retryPolicy.backoffMs);
      }

      throw error;
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
    const allEvents = Array.from(this.events.values());
    for (const event of allEvents) {
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
    const now = new Date();

    const events = Array.from(this.events.values());
    for (const event of events) {
      if (event.deliveryStatus === "failed" && event.nextRetryAt && now >= event.nextRetryAt) {
        const webhook = this.webhooks.get(event.webhookId);
        if (webhook) {
          try {
            await this.deliverEvent(webhook, event);
            count++;
          } catch (error) {
            // Continue with next event
          }
        }
      }
    }
    return count;
  }

  /**
   * Delete webhook
   */
  deleteWebhook(webhookId: string): boolean {
    return this.webhooks.delete(webhookId);
  }

  /**
   * Update webhook
   */
  updateWebhook(webhookId: string, updates: Partial<Webhook>): Webhook | null {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return null;

    Object.assign(webhook, updates);
    return webhook;
  }
}

export const webhookManager = new WebhookManager();
