import { db } from "../../db";
import { glPeriods, slaPeriodStatuses, glCloseTasks, glPeriodCloseChecklistTemplates } from "../../../shared/schema";
import { slaJournalHeaders } from "../../../shared/schema/sla";
import { eq, and, ne, lt, lte, gte, sql } from "drizzle-orm";

/**
 * Close Engine: Single Source of Truth for Financial Close
 * Centralizes logic for Opening/Closing periods across GL and Subledgers.
 */
export class CloseEngine {

    /**
     * Helper: Resolve Period Name from ID or Name
     */
    async resolvePeriodName(idOrName: string): Promise<string> {
        // If it looks like a UUID, try to find it
        if (idOrName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            const [period] = await db.select().from(glPeriods).where(eq(glPeriods.id, idOrName));
            if (period) return period.periodName;
        }
        return idOrName;
    }

    /**
     * Open a Period for a specific Application
     * @param ledgerId 
     * @param periodIdOrName 
     * @param applicationId 'GL', 'AP', 'AR', etc.
     */
    async openPeriod(ledgerId: string, periodIdOrName: string, applicationId: string) {
        const periodName = await this.resolvePeriodName(periodIdOrName);
        console.log(`[CloseEngine] Opening Period ${periodName} for ${applicationId} (Ledger: ${ledgerId})`);

        // 1. Verify Period Exists in GL Calendar
        const [period] = await db.select().from(glPeriods)
            .where(and(eq(glPeriods.periodName, periodName), eq(glPeriods.ledgerId, ledgerId)));

        if (!period) throw new Error(`Period ${periodName} not defined in GL Calendar for Ledger ${ledgerId}.`);

        // 2. Insert/Update Subledger Period Status
        // This table `slaPeriodStatuses` tracks status per App per Period.
        await db.insert(slaPeriodStatuses).values({
            ledgerId,
            periodName,
            applicationId,
            status: "Open"
        }).onConflictDoUpdate({
            target: [slaPeriodStatuses.ledgerId, slaPeriodStatuses.periodName, slaPeriodStatuses.applicationId],
            set: { status: "Open", updatedAt: new Date() }
        });

        // 3. If GL, also update the main glPeriods table for backward compatibility
        if (applicationId === 'GL') {
            await db.update(glPeriods)
                .set({ status: "Open" }) //, closingStatus: "Open" if column existed
                .where(eq(glPeriods.periodName, periodName));

            // NEW: Generate Period Close Tasks from Templates
            await this.generateCloseTasks(ledgerId, period);
        }

        return { success: true, message: `Period ${periodName} opened for ${applicationId}` };
    }

    /**
     * Generate Close Tasks from Templates
     */
    async generateCloseTasks(ledgerId: string, period: any) {
        // 1. Get Templates
        const templates = await db.select().from(glPeriodCloseChecklistTemplates)
            .where(eq(glPeriodCloseChecklistTemplates.ledgerId, ledgerId));

        if (templates.length === 0) return;

        // 2. Check Existing Tasks
        const existingTasks = await db.select().from(glCloseTasks)
            .where(and(
                eq(glCloseTasks.ledgerId, ledgerId),
                eq(glCloseTasks.periodId, period.id) // Use Period UUID
            ));

        const existingTaskNames = new Set(existingTasks.map(t => t.taskName));

        // 3. Create Missing Tasks
        for (const template of templates) {
            if (!existingTaskNames.has(template.taskName)) {
                // Calculate Due Date: End Date + dayOffset days
                const dueDate = new Date(period.endDate);
                dueDate.setDate(dueDate.getDate() + (template.dayOffset || 0));

                await db.insert(glCloseTasks).values({
                    ledgerId,
                    periodId: period.id,
                    taskName: template.taskName,
                    description: template.description,
                    dueDate: dueDate,
                    status: "PENDING"
                });
            }
        }
        console.log(`[CloseEngine] Generated tasks for ${period.periodName}`);
    }

    /**
     * Close a Period
     * Validates that all events are accounted (Final) before closing.
     */
    async closePeriod(ledgerId: string, periodIdOrName: string, applicationId: string, force: boolean = false) {
        const periodName = await this.resolvePeriodName(periodIdOrName);
        console.log(`[CloseEngine] Closing Period ${periodName} for ${applicationId} (Ledger: ${ledgerId})`);

        // 1. Check for Unaccounted Events (Draft/Pending)
        // If force=true, we might skip this (Soft Close), but for Hard Close we must validate.
        if (!force) {
            await this.validatePeriodReadiness(ledgerId, periodName, applicationId);
        }

        // 2. Close Subledger Period
        await db.insert(slaPeriodStatuses).values({
            ledgerId,
            periodName,
            applicationId,
            status: "Closed"
        }).onConflictDoUpdate({
            target: [slaPeriodStatuses.ledgerId, slaPeriodStatuses.periodName, slaPeriodStatuses.applicationId],
            set: { status: "Closed", updatedAt: new Date() }
        });

        // 3. If GL, close GL Period
        if (applicationId === 'GL') {
            await db.update(glPeriods)
                .set({ status: "Closed" })
                .where(eq(glPeriods.periodName, periodName));
        }

        return { success: true, message: `Period ${periodName} closed for ${applicationId}` };
    }

    /**
     * Check if a period is safe to close (No unaccounted events)
     */
    async validatePeriodReadiness(ledgerId: string, periodName: string, applicationId: string) {
        // Fetch Period Dates
        const [period] = await db.select().from(glPeriods)
            .where(and(eq(glPeriods.periodName, periodName), eq(glPeriods.ledgerId, ledgerId)));

        if (!period) throw new Error("Period not found in calendar");

        // 1. Check pending SLA events
        const conditions = [
            eq(slaJournalHeaders.ledgerId, ledgerId),
            ne(slaJournalHeaders.status, "Final"), // Not accounted
            ne(slaJournalHeaders.status, "Posted"), // Posted is also fine
            gte(slaJournalHeaders.glDate, new Date(period.startDate)),
            lt(slaJournalHeaders.glDate, new Date(period.endDate))
        ];

        const pendingEvents = await db.select().from(slaJournalHeaders).where(and(...conditions));

        if (pendingEvents.length > 0) {
            throw new Error(`Cannot close period ${periodName}. Found ${pendingEvents.length} unaccounted events.`);
        }

        // 2. Enterprise Parity: Deep Subledger Validation Checks
        if (applicationId === 'GL' || applicationId === 'AP') {
            const { apInvoices } = await import("../../../shared/schema/ap");
            const pendingAp = await db.select({ id: apInvoices.id }).from(apInvoices).where(and(
                ne(apInvoices.accountingStatus, "ACCOUNTED"),
                gte(apInvoices.glDate, new Date(period.startDate)),
                lt(apInvoices.glDate, new Date(period.endDate))
            ));
            if (pendingAp.length > 0) {
                throw new Error(`Cannot close period ${periodName}. Found ${pendingAp.length} unaccounted AP Invoices preventing GL close.`);
            }
        }

        if (applicationId === 'GL' || applicationId === 'AR') {
            const { arInvoices } = await import("../../../shared/schema/ar");
            const pendingAr = await db.select({ id: arInvoices.id }).from(arInvoices).where(and(
                ne(arInvoices.glStatus, "Posted"),
                ne(arInvoices.glStatus, "Created"), // Some implementations use Created vs Posted
                gte(arInvoices.glDate, new Date(period.startDate)),
                lt(arInvoices.glDate, new Date(period.endDate))
            ));
            if (pendingAr.length > 0) {
                throw new Error(`Cannot close period ${periodName}. Found ${pendingAr.length} unaccounted AR Invoices preventing GL close.`);
            }
        }

        return true;
    }

    /**
     * Check if a specific date falls in an Open Period for an App
     */
    async isPeriodOpen(ledgerId: string, applicationId: string, date: Date): Promise<boolean> {
        // 1. Find Period Name for this Date
        const [period] = await db.select().from(glPeriods)
            .where(and(
                eq(glPeriods.ledgerId, ledgerId),
                gte(glPeriods.endDate, date),
                lte(glPeriods.startDate, date) // Adjust logic if inclusive
            ));

        // Fix date query logic: startDate <= date < endDate
        // Drizzle might need clearer comparison or SQL raw
        // Let's rely on finding *any* period that covers this date

        if (!period) {
            // Check if we can find it strictly
            // If no period definition, it's not open.
            return false;
        }

        // 2. Check Status in slaPeriodStatuses
        const [status] = await db.select().from(slaPeriodStatuses)
            .where(and(
                eq(slaPeriodStatuses.ledgerId, ledgerId),
                eq(slaPeriodStatuses.periodName, period.periodName),
                eq(slaPeriodStatuses.applicationId, applicationId)
            ));

        return status?.status === "Open";
    }

    /**
     * Sweep Unaccounted Events to Next Open Period
     */
    async sweepEvents(ledgerId: string, fromPeriodName: string, toPeriodName: string) {
        const [fromPeriod] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, fromPeriodName));
        const [toPeriod] = await db.select().from(glPeriods).where(eq(glPeriods.periodName, toPeriodName));

        if (!fromPeriod || !toPeriod) throw new Error("Invalid Periods");

        // 1. Find Unaccounted Events
        const eventsToSweep = await db.select().from(slaJournalHeaders)
            .where(and(
                eq(slaJournalHeaders.ledgerId, ledgerId),
                ne(slaJournalHeaders.status, "Final"),
                gte(slaJournalHeaders.glDate, fromPeriod.startDate),
                lt(slaJournalHeaders.glDate, fromPeriod.endDate)
            ));

        if (eventsToSweep.length === 0) return { count: 0 };

        // 2. Update Date
        const newDate = new Date(toPeriod.startDate);
        for (const event of eventsToSweep) {
            await db.update(slaJournalHeaders)
                .set({ glDate: newDate })
                .where(eq(slaJournalHeaders.id, event.id));
        }

        return { count: eventsToSweep.length };
    }

    /**
     * Get Dashboard Status
     */
    async getCloseStatus(ledgerId: string) {
        return await db.select().from(slaPeriodStatuses)
            .where(eq(slaPeriodStatuses.ledgerId, ledgerId));
    }
    /**
     * AI Close Prediction (Heuristic)
     * Predicts if the close is at risk based on:
     * 1. Overdue Tasks
     * 2. Unaccounted Volume vs Time Remaining
     */
    async predictCloseDelays(ledgerId: string, periodIdOrName: string) {
        const periodName = await this.resolvePeriodName(periodIdOrName);

        // 1. Get Period Info
        const [period] = await db.select().from(glPeriods)
            .where(and(eq(glPeriods.periodName, periodName), eq(glPeriods.ledgerId, ledgerId)));

        if (!period) throw new Error("Period not found");

        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((new Date(period.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        // 2. Check Overdue Tasks
        const overdueTasks = await db.select().from(glCloseTasks)
            .where(and(
                eq(glCloseTasks.ledgerId, ledgerId),
                eq(glCloseTasks.periodId, period.id),
                ne(glCloseTasks.status, "COMPLETED"),
                lt(glCloseTasks.dueDate, now) // Overdue
            ));

        // 3. Check Unaccounted Events (Volume)
        const unaccountedEvents = await db.select({ count: sql<number>`count(*)` }).from(slaJournalHeaders)
            .where(and(
                eq(slaJournalHeaders.ledgerId, ledgerId),
                ne(slaJournalHeaders.status, "Final"),
                gte(slaJournalHeaders.glDate, period.startDate),
                lt(slaJournalHeaders.glDate, period.endDate)
            ));

        const unaccountedCount = Number(unaccountedEvents[0]?.count || 0);

        // 4. Determine Risk
        let riskLevel = "Low";
        let message = "Close is on track.";

        if (overdueTasks.length > 5 || (daysRemaining < 2 && unaccountedCount > 100)) {
            riskLevel = "High";
            message = `High Risk: ${overdueTasks.length} overdue tasks and ${unaccountedCount} unposted journals with ${daysRemaining} days left.`;
        } else if (overdueTasks.length > 0 || (daysRemaining < 5 && unaccountedCount > 200)) {
            riskLevel = "Medium";
            message = `Medium Risk: ${overdueTasks.length} overdue tasks. ${unaccountedCount} unposted journals remaining.`;
        }

        return {
            periodName,
            daysRemaining,
            overdueTaskCount: overdueTasks.length,
            unaccountedJournalCount: unaccountedCount,
            riskLevel,
            predictionMessage: message
        };
    }
}

export const closeEngine = new CloseEngine();
