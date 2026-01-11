import { db } from "../db";
import {
    slaAccountingRules, slaEventClasses, slaJournalHeaders, slaJournalLines,
    slaMappingSets, slaMappingSetValues
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
// Use dynamic import or careful structure to avoid circular deps if FinanceService imports this.
// For now assuming Uni-directional: Sla -> Finance
import { financeService } from "./finance";

export interface SlaEvent {
    eventClass: string; // e.g. "AP_INVOICE_VALIDATED"
    entityId: string;
    entityTable: string;
    description: string;
    amount: number;
    currency: string;
    date: Date;
    ledgerId: string;
    sourceData: any; // arbitrary data for rules
}

export class SlaService {

    /**
     * The main entry point for Subledger Accounting.
     * Takes a raw event and generates accounting entries based on defined rules.
     */
    async createAccounting(event: SlaEvent) {
        console.log(`[SLA] Processing event ${event.eventClass} for entity ${event.entityId}...`);

        // 1. Generate Header
        const [header] = await db.insert(slaJournalHeaders).values({
            ledgerId: event.ledgerId,
            eventClassId: event.eventClass,
            entityId: event.entityId,
            entityTable: event.entityTable,
            eventDate: event.date,
            glDate: event.date,
            currencyCode: event.currency,
            description: event.description || `SLA Journal for ${event.eventClass}`,
            status: "Draft",
            completedFlag: false
        }).returning();

        // 2. Process Rules to Limit Lines
        const linesToInsert: any[] = [];
        let lineNumber = 1;

        if (event.eventClass === "AP_INVOICE_VALIDATED") {
            // Derive Liability (Credit)
            const liabilityCCID = await this.deriveAccount("LIABILITY", event.sourceData, event.ledgerId);
            linesToInsert.push({
                headerId: header.id,
                lineNumber: lineNumber++,
                accountingClass: "Liability",
                codeCombinationId: liabilityCCID,
                enteredCr: String(event.amount),
                accountedCr: String(event.amount),
                currencyCode: event.currency,
                description: "Liability Entry"
            });

            // Derive Expense (Debit)
            const expenseCCID = await this.deriveAccount("EXPENSE", event.sourceData, event.ledgerId);
            linesToInsert.push({
                headerId: header.id,
                lineNumber: lineNumber++,
                accountingClass: "Expense",
                codeCombinationId: expenseCCID,
                enteredDr: String(event.amount),
                accountedDr: String(event.amount),
                currencyCode: event.currency,
                description: "Item Expense"
            });
        } else if (event.eventClass === "AP_PAYMENT_CREATED") {
            // Debit Liability (Undo credit from invoice)
            const liabilityCCID = await this.deriveAccount("AP_LIABILITY", event.sourceData, event.ledgerId);
            linesToInsert.push({
                headerId: header.id,
                lineNumber: lineNumber++,
                accountingClass: "Liability",
                codeCombinationId: liabilityCCID,
                enteredDr: String(event.amount),
                accountedDr: String(event.amount),
                currencyCode: event.currency,
                description: "Payment - Liability Clearing"
            });

            // Credit Cash (The actual cash outflow)
            const cashCCID = await this.deriveAccount("CASH", event.sourceData, event.ledgerId);
            linesToInsert.push({
                headerId: header.id,
                lineNumber: lineNumber++,
                accountingClass: "Cash",
                codeCombinationId: cashCCID,
                enteredCr: String(event.amount),
                accountedCr: String(event.amount),
                currencyCode: event.currency,
                description: "Payment - Cash Outflow"
            });
        } else if (event.eventClass === "AR_INVOICE_COMPLETE") {
            const receivableCCID = await this.deriveAccount("RECEIVABLE", event.sourceData, event.ledgerId);
            linesToInsert.push({
                headerId: header.id,
                lineNumber: lineNumber++,
                accountingClass: "Receivable",
                codeCombinationId: receivableCCID,
                enteredDr: String(event.amount),
                accountedDr: String(event.amount),
                currencyCode: event.currency,
                description: "Receivable Entry"
            });

            const revenueCCID = await this.deriveAccount("REVENUE", event.sourceData, event.ledgerId);
            linesToInsert.push({
                headerId: header.id,
                lineNumber: lineNumber++,
                accountingClass: "Revenue",
                codeCombinationId: revenueCCID,
                enteredCr: String(event.amount),
                accountedCr: String(event.amount),
                currencyCode: event.currency,
                description: "Revenue Entry"
            });
        }

        // 3. Insert Lines
        if (linesToInsert.length > 0) {
            await db.insert(slaJournalLines).values(linesToInsert);
        }

        console.log(`[SLA] Created SLA Journal ${header.id} with ${linesToInsert.length} lines.`);
        return header;
    }

    /**
     * Post the SLA Journal to GL.
     */
    async postToGL(slaHeaderId: string, userId: string) {
        const [header] = await db.select().from(slaJournalHeaders).where(eq(slaJournalHeaders.id, slaHeaderId));
        if (!header) throw new Error("SLA Header not found");
        if (header.transferStatus === "Transferred") throw new Error("Already transferred to GL");

        const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, slaHeaderId));

        const journal = await financeService.createJournal({
            ledgerId: header.ledgerId,
            periodName: "Jan-26",
            source: "SLA",
            category: header.eventClassId || "Manual",
            currencyCode: header.currencyCode,
            description: header.description || "SLA Import",
            lines: lines.map(l => ({
                accountId: l.codeCombinationId!,
                enteredDr: l.enteredDr ? Number(l.enteredDr) : 0,
                enteredCr: l.enteredCr ? Number(l.enteredCr) : 0,
                description: l.description || ""
            }))
        }, userId);

        await db.update(slaJournalHeaders).set({
            transferStatus: "Transferred",
            glJournalId: journal.id,
            completedFlag: true,
            status: "Final"
        }).where(eq(slaJournalHeaders.id, slaHeaderId));

        return journal;
    }

    /**
     * Rule Evaluation Engine
     */
    async deriveAccount(ruleType: string, sourceData: any, ledgerId: string): Promise<string> {
        const DEFAULT_SEGMENTS = "01-000-00000-000-000-000-000-000-000-000";
        let segmentString = DEFAULT_SEGMENTS;

        if (ruleType === "LIABILITY" || ruleType === "AP_LIABILITY") {
            segmentString = "01-000-20000-000-000-000-000-000-000-000";
        } else if (ruleType === "EXPENSE") {
            segmentString = "01-000-50000-000-000-000-000-000-000-000";
        } else if (ruleType === "CASH") {
            segmentString = "01-000-11000-000-000-000-000-000-000-000";
        } else if (ruleType === "RECEIVABLE") {
            segmentString = "01-000-12000-000-000-000-000-000-000-000";
        } else if (ruleType === "REVENUE") {
            segmentString = "01-000-40000-000-000-000-000-000-000-000";
        }

        const cc = await financeService.getOrCreateCodeCombination(ledgerId, segmentString);
        return cc.id;
    }
}

export const slaService = new SlaService();
