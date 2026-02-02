import { Injectable } from '@nestjs/common';

export type PlanTier = 'freemium' | 'starter' | 'professional' | 'enterprise';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  basePrice: number;
  monthlySeats: number;
  modules: string[];
  apiCallsPerMonth: number;
  aiCreditsPerMonth: number;
  storageGB: number;
  features: Record<string, boolean>;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'trial' | 'active' | 'past_due' | 'suspended' | 'cancelled';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  stripeSubscriptionId?: string;
  autoRenew: boolean;
  seats: number;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  tenantId: string;
  status: 'draft' | 'sent' | 'paid' | 'past_due' | 'void';
  amount: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  lineItems: LineItem[];
  stripeInvoiceId?: string;
  pdfUrl?: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  metadata?: Record<string, any>;
}

export interface UsageEvent {
  id: string;
  tenantId: string;
  subscriptionId: string;
  eventType: 'api_call' | 'ai_token' | 'storage_gb' | 'report_export' | 'model_inference';
  quantity: number;
  cost: number;
  timestamp: Date;
}

export interface Entitlements {
  tenantId: string;
  planTier: PlanTier;
  apiCallsRemaining: number;
  aiCreditsRemaining: number;
  storageRemaining: number;
  seatsUsed: number;
  seatsAvailable: number;
  features: Record<string, boolean>;
}

@Injectable()
export class BillingService {
  private plans: Map<string, Plan> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private usageEvents: UsageEvent[] = [];

  constructor() {
    this.initializePlans();
  }

  private initializePlans(): void {
    const plans: Plan[] = [
      {
        id: 'plan_freemium',
        name: 'Freemium',
        tier: 'freemium',
        basePrice: 0,
        monthlySeats: 3,
        modules: ['dashboard', 'crm', 'projects'],
        apiCallsPerMonth: 10000,
        aiCreditsPerMonth: 100,
        storageGB: 1,
        features: {
          sso: false,
          webhooks: false,
          customIntegrations: false,
          advancedAnalytics: false,
          supportEmail: true,
        },
      },
      {
        id: 'plan_starter',
        name: 'Starter',
        tier: 'starter',
        basePrice: 299,
        monthlySeats: 10,
        modules: ['erp', 'crm', 'projects', 'finance', 'hr'],
        apiCallsPerMonth: 100000,
        aiCreditsPerMonth: 5000,
        storageGB: 50,
        features: {
          sso: true,
          webhooks: true,
          customIntegrations: false,
          advancedAnalytics: true,
          supportEmail: true,
          supportPhone: false,
        },
      },
      {
        id: 'plan_professional',
        name: 'Professional',
        tier: 'professional',
        basePrice: 999,
        monthlySeats: 50,
        modules: ['erp', 'crm', 'projects', 'finance', 'hr', 'service', 'marketing', 'analytics'],
        apiCallsPerMonth: 1000000,
        aiCreditsPerMonth: 50000,
        storageGB: 500,
        features: {
          sso: true,
          webhooks: true,
          customIntegrations: true,
          advancedAnalytics: true,
          supportEmail: true,
          supportPhone: true,
          dedicatedAccountManager: false,
        },
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise',
        tier: 'enterprise',
        basePrice: 0,
        monthlySeats: 999,
        modules: [
          'erp',
          'crm',
          'projects',
          'finance',
          'hr',
          'service',
          'marketing',
          'analytics',
          'integration',
          'bpm',
          'compliance',
          'uat',
        ],
        apiCallsPerMonth: 10000000,
        aiCreditsPerMonth: 500000,
        storageGB: 5000,
        features: {
          sso: true,
          webhooks: true,
          customIntegrations: true,
          advancedAnalytics: true,
          supportEmail: true,
          supportPhone: true,
          dedicatedAccountManager: true,
          customSLA: true,
          onPremises: true,
        },
      },
    ];

    plans.forEach((plan) => this.plans.set(plan.id, plan));
  }

  createSubscription(tenantId: string, planId: string, seats: number = 1): Subscription {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 day trial

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      tenantId,
      planId,
      status: 'trial',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      trialEndsAt,
      autoRenew: true,
      seats,
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  upgradeSubscription(subscriptionId: string, newPlanId: string): Subscription | undefined {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return undefined;

    const newPlan = this.plans.get(newPlanId);
    if (!newPlan) return undefined;

    subscription.planId = newPlanId;
    subscription.status = 'active';
    return subscription;
  }

  cancelSubscription(subscriptionId: string): Subscription | undefined {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return undefined;

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    return subscription;
  }

  getPlan(planId: string): Plan | undefined {
    return this.plans.get(planId);
  }

  getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  createInvoice(subscriptionId: string, amount: number, lineItems: LineItem[]): Invoice {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) throw new Error('Subscription not found');

    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      subscriptionId,
      tenantId: subscription.tenantId,
      status: 'sent',
      amount,
      currency: 'USD',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lineItems,
    };

    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  getInvoice(invoiceId: string): Invoice | undefined {
    return this.invoices.get(invoiceId);
  }

  getTenantInvoices(tenantId: string): Invoice[] {
    return Array.from(this.invoices.values()).filter((inv) => inv.tenantId === tenantId);
  }

  markInvoiceAsPaid(invoiceId: string): Invoice | undefined {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return undefined;

    invoice.status = 'paid';
    invoice.paidDate = new Date();
    return invoice;
  }

  recordUsageEvent(
    tenantId: string,
    subscriptionId: string,
    eventType: UsageEvent['eventType'],
    quantity: number,
  ): UsageEvent {
    const costMap: Record<UsageEvent['eventType'], number> = {
      api_call: 0.0001,
      ai_token: 0.00001,
      storage_gb: 10,
      report_export: 0.5,
      model_inference: 0.01,
    };

    const event: UsageEvent = {
      id: `evt_${Date.now()}`,
      tenantId,
      subscriptionId,
      eventType,
      quantity,
      cost: costMap[eventType] * quantity,
      timestamp: new Date(),
    };

    this.usageEvents.push(event);
    return event;
  }

  getTenantUsage(tenantId: string, monthOffset: number = 0): Record<string, number> {
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1);

    const monthEvents = this.usageEvents.filter(
      (evt) =>
        evt.tenantId === tenantId &&
        evt.timestamp >= targetMonth &&
        evt.timestamp < nextMonth,
    );

    return {
      api_calls: monthEvents.filter((e) => e.eventType === 'api_call').reduce((sum, e) => sum + e.quantity, 0),
      ai_tokens: monthEvents.filter((e) => e.eventType === 'ai_token').reduce((sum, e) => sum + e.quantity, 0),
      storage_gb: monthEvents.filter((e) => e.eventType === 'storage_gb').reduce((sum, e) => sum + e.quantity, 0),
      reports_exported: monthEvents.filter((e) => e.eventType === 'report_export').reduce((sum, e) => sum + e.quantity, 0),
      total_cost: monthEvents.reduce((sum, e) => sum + e.cost, 0),
    };
  }

  getEntitlements(tenantId: string): Entitlements {
    const subscriptions = Array.from(this.subscriptions.values()).filter(
      (sub) => sub.tenantId === tenantId && sub.status !== 'cancelled',
    );

    if (subscriptions.length === 0) {
      return {
        tenantId,
        planTier: 'freemium',
        apiCallsRemaining: 10000,
        aiCreditsRemaining: 100,
        storageRemaining: 1,
        seatsUsed: 0,
        seatsAvailable: 3,
        features: {},
      };
    }

    const subscription = subscriptions[0];
    const plan = this.plans.get(subscription.planId);
    if (!plan) throw new Error('Plan not found');

    const monthlyUsage = this.getTenantUsage(tenantId, 0);

    return {
      tenantId,
      planTier: plan.tier,
      apiCallsRemaining: Math.max(0, plan.apiCallsPerMonth - (monthlyUsage.api_calls || 0)),
      aiCreditsRemaining: Math.max(0, plan.aiCreditsPerMonth - (monthlyUsage.ai_tokens || 0)),
      storageRemaining: Math.max(0, plan.storageGB - (monthlyUsage.storage_gb || 0)),
      seatsUsed: subscription.seats,
      seatsAvailable: plan.monthlySeats - subscription.seats,
      features: plan.features,
    };
  }

  validateQuota(tenantId: string, quotaType: string, amount: number = 1): boolean {
    const entitlements = this.getEntitlements(tenantId);

    const quotaMap: Record<string, number> = {
      api_call: entitlements.apiCallsRemaining,
      ai_token: entitlements.aiCreditsRemaining,
      storage_gb: entitlements.storageRemaining,
    };

    return (quotaMap[quotaType] || 0) >= amount;
  }
}
