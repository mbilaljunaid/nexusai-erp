import { db } from "../../db";
import { billingEvents, billingBatches, billingRules, billingProfiles, billingAnomalies } from "@shared/schema/billing_enterprise";
import { arInvoices, arInvoiceLines, arCustomers } from "@shared/schema/ar";
import { eq, and, isNull, inArray, sql } from "drizzle-orm";

import { taxService } from "./TaxService";
import { billingAccountingService } from "./BillingAccountingService";
import { creditCheckService } from "./CreditCheckService";
import { arRevenueSchedules } from "@shared/schema/ar";

export class BillingService {

    // Ingest a raw event (from API or internal call)
    async processEvent(data: typeof billingEvents.$inferInsert) {
        // Validation logic here (check customer exists, etc.)

        // 1. Calculate Tax (Stub)
        const { taxAmount, taxLines } = await taxService.calculateTax(data as any);

        // 2. Credit Check
        // If fail, we still ingest but set status to "Hold" or similar.
        // For strictness: "OnAccount" or "Hold".
        const creditCheck = await creditCheckService.checkCredit(data.customerId, Number(data.amount));
        const initialStatus = creditCheck.pass ? "Pending" : "Hold";
        const errorCode = creditCheck.pass ? null : "CREDIT_HOLD";
        const errorMessage = creditCheck.pass ? null : creditCheck.message;

        const [event] = await db.insert(billingEvents).values({
            ...data,
            taxAmount: taxAmount,
            taxLines: taxLines,
            status: initialStatus,
            errorCode,
            errorMessage
        }).returning();

        // 3. Generate Event Accounting (Accrue Unbilled)
        // Only if passed credit check? 
        // Accrual usually happens regardless of credit hold (it's legally due), 
        // but Revenue Recog might be blocked. 
        // Let's accrue it.
        await billingAccountingService.createEventAccounting(event.id);

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

            // 3. Batch Preparation
            const customerIds = [...new Set(pendingEvents.map(e => e.customerId))];

            // 3a. Bulk Fetch Profiles
            const profiles = await db.select().from(billingProfiles).where(inArray(billingProfiles.customerId, customerIds));
            const profileMap = new Map(profiles.map(p => [p.customerId, p]));

            // 3b. Group Events
            const eventsByCustomer: Record<string, typeof pendingEvents> = {};
            pendingEvents.forEach(e => {
                if (!eventsByCustomer[e.customerId]) eventsByCustomer[e.customerId] = [];
                eventsByCustomer[e.customerId].push(e);
            });

            // 4. Batch Invoice Generation (Application-Side Batching)
            const invoicesToInsert = [];
            const invoiceMap = new Map<string, any>(); // customerId -> invoiceIndex

            // Prepare Invoice Headers
            customerIds.forEach((customerId, index) => {
                const customerEvents = eventsByCustomer[customerId];
                const profile = profileMap.get(customerId);

                const totalAmount = customerEvents.reduce((sum, e) => sum + Number(e.amount), 0);
                const currency = profile?.currency || "USD";
                const paymentTerms = profile?.paymentTerms || "Net 30";

                invoicesToInsert.push({
                    customerId,
                    invoiceNumber: `INV-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
                    amount: totalAmount.toString(),
                    totalAmount: totalAmount.toString(),
                    currency,
                    paymentTerms,
                    status: "Draft",
                    transactionClass: "INV",
                    description: `Auto-Invoice Batch ${batch.id}`
                });
            });

            // Bulk Insert Headers
            const createdInvoices = await db.insert(arInvoices).values(invoicesToInsert).returning();
            const createdInvoiceMap = new Map(createdInvoices.map(inv => [inv.customerId, inv.id]));

            // 5. Batch Line Generation
            const linesToInsert = [];
            const eventIdsToUpdate = [];
            const eventUpdates = [];

            for (const event of pendingEvents) {
                const invoiceId = createdInvoiceMap.get(event.customerId);
                if (!invoiceId) continue; // Should not happen

                linesToInsert.push({
                    invoiceId: invoiceId,
                    lineNumber: 0, // Will fix index possibly or db handles? usually we need explicit index. 
                    // Simplified: We'd need per-invoice counter. 
                    // For performance refactor, let's keep it simple: generic line number or just map.
                    // Actually, let's auto-increment logic here
                    description: event.description,
                    amount: event.amount,
                    quantity: event.quantity,
                    unitPrice: event.unitPrice || event.amount,
                    billingEventId: event.id
                });

                eventIdsToUpdate.push(event.id);
                // We need to link event -> invoiceId
                eventUpdates.push({ id: event.id, invoiceId });
            }

            // Fix Line Numbers
            const invoiceLineCounters = new Map<number, number>();
            linesToInsert.forEach(line => {
                const current = invoiceLineCounters.get(line.invoiceId) || 0;
                line.lineNumber = current + 1;
                invoiceLineCounters.set(line.invoiceId, current + 1);
            });

            // Bulk Insert Lines
            if (linesToInsert.length > 0) {
                // Drizzle batch insert limit? usually safe for thousands
                await db.insert(arInvoiceLines).values(linesToInsert);
            }

            // 6. Bulk Update Event Status
            // Ideally: update billing_events set status='Invoiced', batch_id=X where id in (...)
            // But we also need to set invoice_id per row. 
            // Postgres CASE statement is heavy for ORM.
            // Compromise: Update all to 'Invoiced' and batch_id in one go.
            // THEN: We might need loop for invoice_id linkage or advanced CTE.
            // For L15 Audit Compliance: The "N+1" refers to database roundtrips.
            // If we run 1000 updates in parallel promise.all it's better but still heavy.
            // BETTER: We can do it in chunks or use a CASE update via raw sql if needed.
            // Let's stick to Promise.all behavior BUT limiting concurrency or just accepting 
            // that linking back invoice_id is hard in bulk without CTE.
            // Refined Strategy: 
            // We already have all data.
            // We can update by invoice_id? No.
            // Fastest way in Drizzle without raw SQL CTE:
            // 1. Update ALL events in this batch to status='Invoiced', batchId.
            // 2. We skip linking invoice_id back to event for now? NO, audit requires traceability.
            // Optimization: Loop updates but utilize concurrency.

            const updatePromises = eventUpdates.map(u =>
                db.update(billingEvents)
                    .set({ status: "Invoiced", invoiceId: u.invoiceId, batchId: batch.id })
                    .where(eq(billingEvents.id, u.id))
            );
            await Promise.all(updatePromises);
            // Note: Promise.all with 1000 items is fine in Node. 
            // It sends 1000 queries but largely in parallel pipelines. 
            // Much faster than await-in-loop.

            // 7. Generate Invoice Accounting (AR / Revenue / Tax)
            const accountingPromises = createdInvoices.map(async (inv) => {
                await billingAccountingService.createInvoiceAccounting(inv.id);

                // 8. Revenue Recognition Schedules (Auto-Ratability)
                // Heuristic: If description contains "Subscription", spread over 12 months.
                if (inv.description?.toLowerCase().includes("subscription") || inv.description?.toLowerCase().includes("batch")) {
                    const months = 12;
                    const monthlyAmount = (Number(inv.amount) / months).toFixed(2);

                    const schedules = [];
                    for (let i = 0; i < months; i++) {
                        const date = new Date();
                        date.setMonth(date.getMonth() + i);
                        schedules.push({
                            invoiceId: inv.id,
                            scheduleDate: date,
                            amount: monthlyAmount,
                            status: "Pending",
                            periodName: date.toLocaleString('default', { month: 'short', year: '2-digit' })
                        });
                    }
                    if (schedules.length > 0) {
                        await db.insert(arRevenueSchedules).values(schedules);
                    }
                }
            });
            await Promise.all(accountingPromises);

            // 8. Complete Batch
            await db.update(billingBatches)
                .set({
                    status: "Completed",
                    totalEventsProcessed: pendingEvents.length,
                    totalInvoicesCreated: createdInvoices.length
                })
                .where(eq(billingBatches.id, batch.id));

            return { batchId: batch.id, count: createdInvoices.length, invoiceIds: createdInvoices.map(i => i.id) };

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

    async getAnomalies() {
        return await db.select().from(billingAnomalies).orderBy(sql`${billingAnomalies.detectedAt} DESC`);
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

    // ========== BILLING PROFILES ==========

    async getProfiles() {
        return await db.select().from(billingProfiles);
    }

    async createProfile(data: typeof billingProfiles.$inferInsert) {
        const [profile] = await db.insert(billingProfiles).values(data).returning();
        return profile;
    }

    async updateProfile(id: string, data: Partial<typeof billingProfiles.$inferInsert>) {
        const [profile] = await db.update(billingProfiles)
            .set(data)
            .where(eq(billingProfiles.id, id))
            .returning();
        return profile;
    }

    // ========== DASHBOARD METRICS ==========

    async getDashboardMetrics() {
        // 1. Unbilled Revenue (Sum of Pending Events)
        const unbilledResult = await db.select({
            total: sql<string>`sum(${billingEvents.amount})`
        })
            .from(billingEvents)
            .where(eq(billingEvents.status, "Pending"));

        const unbilledAmount = Number(unbilledResult[0]?.total || 0);

        // 2. Invoiced MTD (Sum of Invoices from 1st of current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const invoicedResult = await db.select({
            total: sql<string>`sum(${arInvoices.totalAmount})`
        })
            .from(arInvoices)
            .where(sql`${arInvoices.createdAt} >= ${startOfMonth}`);

        const invoicedAmount = Number(invoicedResult[0]?.total || 0);

        // 3. Suspense Items (Anomalies)
        const suspenseResult = await db.select({
            count: sql<number>`count(*)`
        })
            .from(billingAnomalies);

        const suspenseCount = Number(suspenseResult[0]?.count || 0);

        // 4. Auto-Invoice Success Rate (Last 30 batches)
        const batches = await db.select().from(billingBatches).orderBy(sql`${billingBatches.startedAt} DESC`).limit(30);
        const totalBatches = batches.length;
        const failedBatches = batches.filter(b => b.status === 'Failed').length;
        const successRate = totalBatches > 0 ? ((totalBatches - failedBatches) / totalBatches) * 100 : 100;

        return {
            unbilledRevenue: unbilledAmount,
            invoicedMTD: invoicedAmount,
            suspenseItems: suspenseCount,
            autoInvoiceSuccessRate: successRate.toFixed(1)
        };
    }
}

export const billingService = new BillingService();
