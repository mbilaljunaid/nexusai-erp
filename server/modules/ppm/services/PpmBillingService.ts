
import { db } from "../../../db";
import {
    ppmProjects, ppmTasks, ppmExpenditureItems, ppmBillingEvents,
    ppmProjectInvoices, ppmProjectInvoiceLines,
    ppmBillingRules,
    arInvoices, arInvoiceLines, arCustomers,
    type InsertPpmBillingEvent,
    type InsertPpmProjectInvoice,
    type InsertPpmProjectInvoiceLine,
    revenueSourceEvents
} from "@shared/schema";
import { eq, and, sql, inArray, desc } from "drizzle-orm";
import { eq, and, sql, inArray, desc } from "drizzle-orm";
import { PpmService } from "./PpmService";
import { slaEngine } from "../../sla/sla.service";

export class PpmBillingService {
    private ppmService = new PpmService(); // Reuse existing service methods if needed

    /**
     * Generate Billing Events for a Project
     * Scans for "Billable" expenditure items that haven't been billed.
     * Applies Billing Rules (e.g., T&M Markup) to determine the Bill Amount.
     */
    async generateBillingEvents(projectId: string) {
        // 1. Get Billing Rule for Project
        const [rule] = await db.select().from(ppmBillingRules)
            .where(and(eq(ppmBillingRules.projectId, projectId), eq(ppmBillingRules.activeFlag, true)));

        const [project] = await db.select().from(ppmProjects).where(eq(ppmProjects.id, projectId));

        if (!rule) {
            console.log(`No active billing rule for project ${projectId}. Skipping event generation.`);
            return []; // Or throw error? For auto-gen, return empty is safer.
        }

        // T&M Logic
        if (rule.ruleType === "TM" || rule.ruleType === "COST_PLUS") {
            // Find Unbilled, Costed Expenditure Items (that are Billable)
            // Note: need to join Tasks to check billable flag
            const billableItems = await db.select({
                item: ppmExpenditureItems,
                task: ppmTasks
            })
                .from(ppmExpenditureItems)
                .innerJoin(ppmTasks, eq(ppmExpenditureItems.taskId, ppmTasks.id))
                .leftJoin(ppmBillingEvents, eq(ppmBillingEvents.expenditureItemId, ppmExpenditureItems.id))
                .where(and(
                    eq(ppmTasks.projectId, projectId),
                    eq(ppmTasks.billableFlag, true),
                    eq(ppmExpenditureItems.status, "COSTED"), // Must be costed first
                    sql`${ppmBillingEvents.id} IS NULL` // Not yet successfully turned into an event
                    // Note: Ideally we check `ppmExpenditureItems.provisional_billed_flag` but we are using left join for now
                ));

            const events: any[] = [];
            const markup = rule.markupPercentage ? parseFloat(rule.markupPercentage) : 0; // e.g. 20.00 for 20%

            for (const { item, task } of billableItems) {
                // Calculate Bill Amount
                // Base is Burdened Cost if available, else Raw Cost?
                // Usually T&M is based on Raw Cost * Multiplier OR Burdened Cost * Multiplier depending on contract.
                // Let's assume Cost Plus on Raw Cost for simplicity for now as per our schema simplicity.
                const baseCost = parseFloat(item.rawCost);
                const billAmount = (baseCost * (1 + (markup / 100))).toFixed(2);

                const [event] = await db.insert(ppmBillingEvents).values({
                    projectId: projectId,
                    taskId: task.id,
                    eventType: "TM_ITEM",
                    eventDate: item.expenditureItemDate,
                    amount: billAmount,
                    currency: item.denomCurrencyCode,
                    description: `Billable: ${item.transactionSource} - ${item.quantity} units`, // Generic desc
                    expenditureItemId: item.id,
                    billingRuleId: rule.id,
                    billedFlag: false
                }).returning();

                // SLA Event: Project Revenue Recognition
                if (project) {
                    await slaEngine.createAccounting({
                        eventClassId: "PROJECT_REVENUE",
                        eventTypeId: "PROJ_REV_ACCRUAL",
                        entityId: event.id,
                        entityTable: "ppm_billing_events",
                        ledgerId: project.organizationId || "62ffbe4c-7c87-4d92-9654-2b7e8850b69c",
                        eventDate: event.eventDate,
                        glDate: event.eventDate,
                        currencyCode: event.currency,
                        amount: parseFloat(event.amount),
                        description: `Revenue Accrual: ${project.projectNumber}`,
                        sourceData: {
                            projectNumber: project.projectNumber,
                            taskNumber: task.taskNumber,
                            expenditureType: item.transactionSource,
                            billingRuleType: rule.ruleType,
                            markup: rule.markupPercentage,
                            ...event
                        }
                    });
                }

                events.push(event);
            }
            return events;
        }

        // Fixed Price Logic (Milestones) handled separately/manually usually
        return [];
    }

    /**
     * Generate Draft Invoice
     * Groups unbilled Billing Events into a Draft Invoice Header & Lines.
     */
    async generateDraftInvoice(projectId: string) {
        // 1. Find Unbilled Events
        const events = await db.select().from(ppmBillingEvents)
            .where(and(
                eq(ppmBillingEvents.projectId, projectId),
                eq(ppmBillingEvents.billedFlag, false)
            ));

        if (events.length === 0) return null;

        // 2. Create Invoice Header
        // Need next invoice number. Simple sequence simulation.
        const invoiceNum = `DRAFT-${Date.now()}`;
        const totalAmount = events.reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2);

        const [invoice] = await db.insert(ppmProjectInvoices).values({
            invoiceNumber: invoiceNum,
            projectId: projectId,
            invoiceDate: new Date(),
            status: "DRAFT",
            amount: totalAmount,
            currency: events[0].currency // Assume all same currency for now
        }).returning();

        // 3. Create Invoice Lines & Link Events
        let lineNum = 1;
        const invoiceLines = [];
        for (const event of events) {
            const [line] = await db.insert(ppmProjectInvoiceLines).values({
                invoiceId: invoice.id,
                lineNumber: lineNum++,
                eventId: event.id,
                amount: event.amount,
                description: event.description || "Project Service"
            }).returning();

            invoiceLines.push(line);

            // Mark Event as Billed
            await db.update(ppmBillingEvents)
                .set({ billedFlag: true, invoiceId: invoice.id })
                .where(eq(ppmBillingEvents.id, event.id));
        }

        return { invoice, lines: invoiceLines };
    }

    /**
     * Approve Draft Invoice
     * Validates and moves status to APPROVED.
     */
    async approveInvoice(invoiceId: string) {
        const [invoice] = await db.select().from(ppmProjectInvoices).where(eq(ppmProjectInvoices.id, invoiceId));
        if (!invoice) throw new Error("Invoice not found");
        if (invoice.status !== "DRAFT") throw new Error("Only Draft invoices can be approved");

        const [updated] = await db.update(ppmProjectInvoices)
            .set({ status: "APPROVED" })
            .where(eq(ppmProjectInvoices.id, invoiceId))
            .returning();

        return updated;
    }

    /**
     * Interface to Accounts Receivable (AR)
     * Push Approved Invoice to AR Tables.
     */
    async interfaceToAR(invoiceId: string) {
        const [invoice] = await db.select().from(ppmProjectInvoices).where(eq(ppmProjectInvoices.id, invoiceId));
        if (!invoice) throw new Error("Invoice not found");
        if (invoice.status !== "APPROVED") throw new Error("Invoice must be APPROVED before interfacing");

        // Fetch Lines
        const lines = await db.select().from(ppmProjectInvoiceLines)
            .where(eq(ppmProjectInvoiceLines.invoiceId, invoiceId));

        // Create AR Invoice Header
        // Note: We need a Customer ID. If project doesn't have one, this fails. 
        // For Verification, we should ensure Project has metadata or we pass it / default it.
        // Assuming we mock or have customerId.
        const arInvoiceNum = `AR-${invoice.invoiceNumber}`;

        // Mock AR Insert (since AR schema might be complex to fully satisfy blindly)
        // Ideally: Insert into ar_invoices
        const [arInv] = await db.insert(arInvoices).values({
            invoiceNumber: arInvoiceNum,
            customerId: invoice.customerId || "CUST-DEFAULT", // Fallback
            transactionDate: invoice.invoiceDate,
            amount: invoice.amount,
            taxAmount: "0",
            totalAmount: invoice.amount,
            currency: invoice.currency,
            status: "Draft",
            glStatus: "Pending",
            transactionClass: "INV"
        } as any).returning();

        // Insert AR Lines (Simplified)
        for (const line of lines) {
            await db.insert(arInvoiceLines).values({
                invoiceId: arInv.id,
                lineNumber: line.lineNumber,
                description: line.description,
                amount: line.amount,
                quantity: "1", // Simplified
                unitPrice: line.amount
            } as any);
        }

        // Update Project Invoice Status
        const [final] = await db.update(ppmProjectInvoices)
            .set({
                status: "TRANSFERRED",
                transferStatus: "TRANSFERRED",
                transferDate: new Date(),
                arInvoiceId: arInv.id
            })
            .where(eq(ppmProjectInvoices.id, invoiceId))
            .returning();

        return final;
    }

    /**
     * Get Unbilled Events
     */
    async getUnbilledEvents(projectId: string) {
        return await db.select().from(ppmBillingEvents)
            .where(and(
                eq(ppmBillingEvents.projectId, projectId),
                eq(ppmBillingEvents.billedFlag, false)
            ))
            .orderBy(desc(ppmBillingEvents.eventDate));
    }

    /**
     * Get Project Invoices
     */
    async getProjectInvoices(projectId: string) {
        return await db.select().from(ppmProjectInvoices)
            .where(eq(ppmProjectInvoices.projectId, projectId))
            .orderBy(desc(ppmProjectInvoices.invoiceDate));
    }

    /**
     * Get Billing Summary (Projects with Unbilled Events)
     */
    async getBillingSummary() {
        const events = await db.select({
            projectId: ppmProjects.id,
            projectNum: ppmProjects.projectNumber,
            projectName: ppmProjects.name,
            totalUnbilled: sql<string>`sum(${ppmBillingEvents.amount})`,
            eventCount: sql<number>`count(${ppmBillingEvents.id})`,
            currency: ppmProjects.currencyCode,
        })
            .from(ppmBillingEvents)
            .innerJoin(ppmProjects, eq(ppmBillingEvents.projectId, ppmProjects.id))
            .where(eq(ppmBillingEvents.billedFlag, false))
            .groupBy(ppmProjects.id, ppmProjects.projectNumber, ppmProjects.name, ppmProjects.currencyCode);

        return events.map((e: any) => ({
            id: e.projectId,
            projectNum: e.projectNum,
            projectName: e.projectName,
            billingAction: e.eventCount > 0 ? "Time and Materials" : "Fixed Price",
            unbilledExpenses: 0, // Simplified for now
            unbilledLabor: parseFloat(e.totalUnbilled || "0"),
            totalUnbilled: parseFloat(e.totalUnbilled || "0"),
            invoiceTo: "Meridian Holdings Ltd", // In real scenario, link to AR Customer
            currency: e.currency,
            billingCycle: "Monthly",
            lastInvoice: "2026-02-28",
            status: "Ready to Bill"
        }));
    }

    /**
     * Interface to Revenue Management (RMCS)
     * Push Billing Events as "Revenue Source Events"
     */
    async interfaceToRevenue(invoiceId: string) {
        // Logic to push lines to revenue_source_events
        // This creates compliance with ASC 606 by notifying the Revenue Engine about "Billed" amounts.
        const lines = await db.select().from(ppmProjectInvoiceLines)
            .where(eq(ppmProjectInvoiceLines.invoiceId, invoiceId));

        for (const line of lines) {
            await db.insert(revenueSourceEvents).values({
                sourceSystem: "PPM",
                sourceId: line.id,
                eventType: "INVOICE",
                eventDate: new Date(),
                amount: line.amount,
                currency: "USD",
                referenceNumber: invoiceId,
                processingStatus: "Pending"
            });
        }
        return { success: true };
    }
}
