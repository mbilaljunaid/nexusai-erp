import { db } from "../db";
import {
    slaAccountingRules, slaEventClasses, slaJournalHeaders, slaJournalLines,
    slaMappingSets, slaMappingSetValues
} from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { glCodeCombinations } from "@shared/schema";
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

        // 3. Apply Intercompany Balancing
        const balancedLines = await this.balanceBySegment(linesToInsert, event.ledgerId);

        // 4. Insert Lines
        if (balancedLines.length > 0) {
            await db.insert(slaJournalLines).values(balancedLines);
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
     * Balances lines by segment 1 (Legal Entity / Company).
     * If debits != credits for a segment, inserts balancing lines.
     */
    private async balanceBySegment(lines: any[], ledgerId: string): Promise<any[]> {
        if (lines.length === 0) return lines;

        // 1. Fetch CCIDs to get segments
        const ccids = [...new Set(lines.map(l => l.codeCombinationId))];
        const combinations = await db.select().from(glCodeCombinations).where(inArray(glCodeCombinations.id, ccids));
        const ccMap = new Map(combinations.map(c => [c.id, c]));

        // 2. Group net balance by Segment1
        const bsvBalances = new Map<string, number>();
        for (const line of lines) {
            const cc = ccMap.get(line.codeCombinationId);
            const bsv = cc?.segment1 || "01";
            const dr = Number(line.enteredDr || 0);
            const cr = Number(line.enteredCr || 0);
            bsvBalances.set(bsv, (bsvBalances.get(bsv) || 0) + (dr - cr));
        }

        // 3. If all BSVs balance, return original
        const unbalancedBSVs = Array.from(bsvBalances.entries()).filter(([_, bal]) => Math.abs(bal) > 0.01);
        if (unbalancedBSVs.length === 0) return lines;

        console.log(`[SLA] Intercompany imbalance detected in segments: ${unbalancedBSVs.map(x => x[0]).join(", ")}`);

        const newLines = [...lines];
        let nextLineNum = Math.max(...lines.map(l => l.lineNumber)) + 1;

        for (const [bsv, net] of unbalancedBSVs) {
            // If net > 0 (Debit heavy), we need a Credit for this BSV
            // If net < 0 (Credit heavy), we need a Debit for this BSV

            // Derive Intercompany Account for this BSV
            // In a real system, this would use a complex rule matrix.
            // Here we use a stub: BSV-000-11105 (Intercompany Rec/Pay)
            const icSegment = `${bsv}-000-11105-000-000-000-000-000-000-000`;
            const icCC = await financeService.getOrCreateCodeCombination(ledgerId, icSegment);

            newLines.push({
                headerId: lines[0].headerId,
                lineNumber: nextLineNum++,
                accountingClass: net > 0 ? "Intercompany Payable" : "Intercompany Receivable",
                codeCombinationId: icCC.id,
                enteredDr: net < 0 ? Math.abs(net).toString() : "0",
                enteredCr: net > 0 ? net.toString() : "0",
                accountedDr: net < 0 ? Math.abs(net).toString() : "0",
                accountedCr: net > 0 ? net.toString() : "0",
                currencyCode: lines[0].currencyCode,
                description: `Intercompany Balancing for BSV ${bsv}`
            });
        }

        return newLines;
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
