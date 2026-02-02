import { EventsService, Event } from './events.service';
import { BillingService } from '../billing/billing.service';
import { TenantsService } from '../tenants/tenants.service';

export function setupEventHandlers(eventsService: EventsService, billingService: BillingService, tenantsService: TenantsService) {
  // Handle subscription created
  eventsService.subscribe('subscription.created', async (event: Event) => {
    console.log(`[Event] Subscription created for tenant: ${event.tenantId}`);
    // Could trigger welcome email, analytics, etc.
  });

  // Handle subscription upgraded
  eventsService.subscribe('subscription.upgraded', async (event: Event) => {
    console.log(`[Event] Subscription upgraded: ${event.payload.oldPlan} -> ${event.payload.newPlan}`);
    // Trigger feature enablement, email notification
  });

  // Handle invoice paid
  eventsService.subscribe('invoice.paid', async (event: Event) => {
    console.log(`[Event] Invoice paid: ${event.payload.invoiceId}`);
    // Update subscription status, send receipt
  });

  // Handle usage quota exceeded
  eventsService.subscribe('quota.exceeded', async (event: Event) => {
    console.log(`[Event] Quota exceeded: ${event.payload.quotaType}`);
    // Send alert, offer upgrade, soft-limit enforcement
  });

  // Handle tenant suspended
  eventsService.subscribe('tenant.suspended', async (event: Event) => {
    console.log(`[Event] Tenant suspended: ${event.tenantId}`);
    // Revoke API keys, notify users, disable access
  });

  // Handle user created
  eventsService.subscribe('user.created', async (event: Event) => {
    console.log(`[Event] User created: ${event.payload.email}`);
    // Send welcome email, initialize user settings
  });

  // Handle organization settings changed
  eventsService.subscribe('tenant.settings.changed', async (event: Event) => {
    console.log(`[Event] Tenant settings changed: ${event.tenantId}`);
    // Update feature flags, propagate configs
  });
}
