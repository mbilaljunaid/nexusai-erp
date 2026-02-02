import { Injectable } from '@nestjs/common';

export interface Event {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  tenantId: string;
  userId?: string;
  payload: Record<string, any>;
  timestamp: Date;
  version: number;
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: (event: Event) => Promise<void>;
}

@Injectable()
export class EventsService {
  private eventStore: Event[] = [];
  private eventCounter = 1;
  private subscriptions: Map<string, EventSubscription[]> = new Map();

  publishEvent(
    type: string,
    aggregateId: string,
    aggregateType: string,
    tenantId: string,
    payload: Record<string, any>,
    userId?: string,
  ): Event {
    const event: Event = {
      id: `evt_${this.eventCounter++}`,
      type,
      aggregateId,
      aggregateType,
      tenantId,
      userId,
      payload,
      timestamp: new Date(),
      version: 1,
    };

    this.eventStore.push(event);

    // Trigger subscriptions asynchronously
    this.triggerSubscriptions(event);

    return event;
  }

  private triggerSubscriptions(event: Event): void {
    const handlers = this.subscriptions.get(event.type) || [];
    handlers.forEach((sub) => {
      sub.handler(event).catch((err) => console.error(`Event handler error: ${err.message}`));
    });
  }

  subscribe(eventType: string, handler: (event: Event) => Promise<void>): EventSubscription {
    const subscription: EventSubscription = {
      id: `sub_${Date.now()}`,
      eventType,
      handler,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    this.subscriptions.get(eventType)!.push(subscription);
    return subscription;
  }

  unsubscribe(subscriptionId: string): boolean {
    for (const [, handlers] of this.subscriptions) {
      const index = handlers.findIndex((h) => h.id === subscriptionId);
      if (index !== -1) {
        handlers.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  getEventHistory(aggregateId: string, aggregateType: string): Event[] {
    return this.eventStore.filter(
      (evt) => evt.aggregateId === aggregateId && evt.aggregateType === aggregateType,
    );
  }

  getTenantEvents(tenantId: string, startTime?: Date, endTime?: Date): Event[] {
    return this.eventStore.filter((evt) => {
      if (evt.tenantId !== tenantId) return false;
      if (startTime && evt.timestamp < startTime) return false;
      if (endTime && evt.timestamp > endTime) return false;
      return true;
    });
  }

  getEventsByType(type: string): Event[] {
    return this.eventStore.filter((evt) => evt.type === type);
  }

  getAllEvents(): Event[] {
    return [...this.eventStore];
  }

  clearEvents(): void {
    this.eventStore = [];
  }
}
