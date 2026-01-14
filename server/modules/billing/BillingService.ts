import { db } from "../../db";
import { billingEvents, billingBatches, billingRules, billingProfiles, billingAnomalies } from "@shared/schema/billing_enterprise";
import { arInvoices, arInvoiceLines, arCustomers } from "@shared/schema/ar";
import { eq, and, isNull, inArray, sql } from "drizzle-orm";

export class BillingService {

    // Ingest a raw event (from API or internal call)
    async processEvent(data: typeof billingEvents.$inferInsert) {
        // Validation logic here (check customer exists, etc.)
        const [event] = await db.insert(billingEvents).values({
            ...data,
            status: "Pending",
        }).returning();
        return event;
    }

    // The "Auto-Invoice" Engine
    async runAutoInvoice(createdByUser: string = "System") {
        // 1. Create a Batch
        const [batch] = await db.insert(billingBatches).values({
            status: "Processing",
            createdBy: createdByUser
        }).returning();

        try {
            // 2. Find eligible events
            const pendingEvents = await db.select()
                .from(billingEvents)
                .where(eq(billingEvents.status, "Pending"));

            if (pendingEvents.length === 0) {
                await db.update(billingBatches)
                    .set({ status: "Completed", errorMessage: "No events to process" })
                    .where(eq(billingBatches.id, batch.id));
                return { batchId: batch.id, count: 0 };
            }

            // 3. Group by Customer (Simple grouping for V1)
            const eventsByCustomer: Record<string, typeof pendingEvents> = {};
            pendingEvents.forEach(e => {
                if (!eventsByCustomer[e.customerId]) eventsByCustomer[e.customerId] = [];
                eventsByCustomer[e.customerId].push(e);
            });

            // 4. Generate Invoices
            let invoiceCount = 0;
            const invoiceIds = [];

            for (const customerId of Object.keys(eventsByCustomer)) {
                const customerEvents = eventsByCustomer[customerId];

                // Calculate Totals
                const totalAmount = customerEvents.reduce((sum, e) => sum + Number(e.amount), 0);

                // Create Header
                const [invoice] = await db.insert(arInvoices).values({
                    customerId,
                    invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Simple logic for V1
                    amount: totalAmount.toString(),
                    totalAmount: totalAmount.toString(),
                    status: "Draft",
                    transactionClass: "INV",
                    description: `Auto-Invoice Batch ${batch.id}`
                }).returning();

                invoiceCount++;
                invoiceIds.push(invoice.id);

                // Create Lines
                let lineNum = 1;
                for (const event of customerEvents) {
                    await db.insert(arInvoiceLines).values({
                        invoiceId: invoice.id,
                        lineNumber: lineNum++,
                        description: event.description,
                        amount: event.amount,
                        quantity: event.quantity,
                        unitPrice: event.unitPrice || event.amount, // Fallback if unit price missing
                        billingEventId: event.id
                    });

                    // Update Event Status
                    await db.update(billingEvents)
                        .set({
                            status: "Invoiced",
                            invoiceId: invoice.id,
                            batchId: batch.id
                        })
                        .where(eq(billingEvents.id, event.id));
                }
            }

            // 5. Complete Batch
            await db.update(billingBatches)
                .set({
                    status: "Completed",
                    totalEventsProcessed: pendingEvents.length,
                    totalInvoicesCreated: invoiceCount
                })
                .where(eq(billingBatches.id, batch.id));

            return { batchId: batch.id, count: invoiceCount, invoiceIds };

        } catch (error: any) {
            await db.update(billingBatches)
                .set({ status: "Failed", errorMessage: error.message })
                .where(eq(billingBatches.id, batch.id));
            throw error;
        }
    }

    async getUnbilledEvents() {
        return await db.select().from(billingEvents).where(eq(billingEvents.status, "Pending"));
    }

    // AI Agent: Anomaly Detection
    async detectAnomalies() {
        // Rule 1: High Value Detection (> $10,000)
        const highValueEvents = await db.select()
            .from(billingEvents)
            .where(
                and(
                    eq(billingEvents.status, "Pending"),
                    sql`${billingEvents.amount} > 10000`
                )
            );

        for (const event of highValueEvents) {
            // Check if already flagged
            const existing = await db.select().from(billingAnomalies).where(eq(billingAnomalies.targetId, event.id));
            if (existing.length === 0) {
                await db.insert(billingAnomalies).values({
                    targetType: "EVENT",
                    targetId: event.id,
                    anomalyType: "HIGH_VALUE",
                    severity: "MEDIUM",
                    confidence: "0.95",
                    description: `Unusually high billing amount: $${event.amount}`
                });
            }
        }

        // Rule 2: Duplicate Suspects (Same Amount + Same Customer + Same Day)
        // Simple heuristic for V1
        const events = await db.select().from(billingEvents).where(eq(billingEvents.status, "Pending"));
        const signatureMap = new Map<string, string>(); // 'cust-amount-date' -> eventId

        for (const event of events) {
            const dateStr = event.eventDate.toISOString().split('T')[0];
            const key = `${event.customerId}-${event.amount}-${dateStr}`;

            if (signatureMap.has(key)) {
                // Found a duplicate
                const originalId = signatureMap.get(key);
                await db.insert(billingAnomalies).values({
                    targetType: "EVENT",
                    targetId: event.id,
                    anomalyType: "DUPLICATE_SUSPECT",
                    severity: "HIGH",
                    confidence: "0.85",
                    description: `Potential duplicate of event ${originalId} (Same Amount & Date)`
                });
            } else {
                signatureMap.set(key, event.id);
            }
        }

        return { scanned: events.length, anomaliesFound: await db.select({ count: sql`count(*)` }).from(billingAnomalies) };
    }

    // ========== RULES ENGINE ==========

    async createRule(rule: typeof billingRules.$inferInsert) {
        const [newRule] = await db.insert(billingRules).values(rule).returning();
        return newRule;
    }

    async getRules() {
        return await db.select().from(billingRules);
    }

    // Engine: Generate Events from Recurring Rules
    // This would typically run nightly via Cron
    async generateRecurringEvents() {
        // 1. Find Active Recurring Rules
        const activeRules = await db.select()
            .from(billingRules)
            .where(and(eq(billingRules.ruleType, "RECURRING"), eq(billingRules.isActive, true)));

        // 2. Find Profiles subscribed to these rules (Mocking this link for V1 - simulating 1:1)
        // In a real system, we'd query billing_profiles linked to rules.
        // For V1, we will generate one event per active rule for a "Test Customer" to demonstrate logic.

        const newEvents = [];
        for (const rule of activeRules) {
            // Check if already ran for this month (Idempotency)
            // Simplified check: Look for event with this rule_id and current month/year
            const startOfMonth = new Date();
            startOfMonth.setDate(1);

            const existing = await db.select().from(billingEvents).where(
                and(
                    eq(billingEvents.ruleId, rule.id),
                    sql`${billingEvents.eventDate} >= ${startOfMonth}`
                )
            );

            if (existing.length === 0) {
                const [event] = await db.insert(billingEvents).values({
                    customerId: "cus_recurring_demo", // Placeholder
                    sourceSystem: "BillingEngine",
                    sourceTransactionId: `REC-${Date.now()}`,
                    eventDate: new Date(),
                    amount: "100.00", // Default or derived from rule
                    description: `${rule.name} - ${new Date().toLocaleString('default', { month: 'long' })}`,
                    ruleId: rule.id,
                    status: "Pending"
                }).returning();
                newEvents.push(event);
            }
        }

        return { processingCount: activeRules.length, eventsGenerated: newEvents.length };
    }
}

export const billingService = new BillingService();
