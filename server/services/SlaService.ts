import { db } from "../db";
import {
    slaAccountingRules, slaEventClasses, slaJournalHeaders, slaJournalLines,
    slaMappingSets, slaMappingSetValues,
    glCodeCombinations, glLedgers
} from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
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

        // 2. Fetch Rules for this Event Class
        const rules = await db.select().from(slaAccountingRules).where(eq(slaAccountingRules.eventClassId, event.eventClass));

        const linesToInsert: any[] = [];
        let lineNumber = 1;

        if (rules.length > 0) {
            // DYNAMIC RULES ENGINE
            console.log(`[SLA] Found ${rules.length} dynamic rules for ${event.eventClass}`);

            for (const rule of rules) {
                // Determine DR or CR side based on rule definition (not yet in schema, assuming standard dual)
                // For MVP, if we don't have explicit side, we might have to infer or update schema.
                // Assuming rule.ruleType implies nature or we act based on accounting class mapping.
                // NOTE: Schema `slaAccountingRules` is sparse. Extended logic needed.

                // For now, let's keep the HARDCODED logic as fallback if no rules exist,
                // BUT if rules exist, use them to OVERRIDE or EXTEND.
                // Actually, strict dynamic engine requires full rule coverage.
                // Level 15 Parity requires us to USE the DB rules.

                const ccid = await this.evaluateRule(rule, event.sourceData, event.ledgerId);

                // Start simplistic: one Debit, one Credit rule?
                // The schema `slaAccountingRules` doesn't strictly say "Debit" or "Credit".
                // We likely need to enhance the schema to include `side` (Dr/Cr) or `accountingClass`.

                // MVP Hybrid: We use "Standard" hardcoded classes but resolve Account via DB Rule.
            }

            // Revert to Hybrid: Use Hardcoded logic for structure, but Dynamic Lookup for CCID
        }

        // --- HYBRID IMPLEMENTATION (Golden Path) ---
        // We stick to the standard flow but call `deriveAccount` which now checks DB.

        if (event.eventClass === "AP_INVOICE_VALIDATED") {
            // Liability (Cr)
            const liabilityCCID = await this.deriveAccount("LIABILITY", event.sourceData, event.ledgerId, event.eventClass);
            linesToInsert.push(this.makeLine(header.id, lineNumber++, "Liability", liabilityCCID, undefined, String(event.amount), event.currency, "Liability Entry"));

            // Expense (Dr)
            const expenseCCID = await this.deriveAccount("EXPENSE", event.sourceData, event.ledgerId, event.eventClass);
            linesToInsert.push(this.makeLine(header.id, lineNumber++, "Expense", expenseCCID, String(event.amount), undefined, event.currency, "Item Expense"));

        } else if (event.eventClass === "AP_PAYMENT_CREATED") {
            // Liability (Dr)
            const liabilityCCID = await this.deriveAccount("AP_LIABILITY", event.sourceData, event.ledgerId, event.eventClass);
            linesToInsert.push(this.makeLine(header.id, lineNumber++, "Liability", liabilityCCID, String(event.amount), undefined, event.currency, "Payment - Liability Clearing"));

            // Cash (Cr)
            const cashCCID = await this.deriveAccount("CASH", event.sourceData, event.ledgerId, event.eventClass);
            linesToInsert.push(this.makeLine(header.id, lineNumber++, "Cash", cashCCID, undefined, String(event.amount), event.currency, "Payment - Cash Outflow"));
        } else if (event.eventClass === "AR_INVOICE_CREATED") {
            // Receivable (Dr)
            const receivableCCID = await this.deriveAccount("RECEIVABLE", event.sourceData, event.ledgerId, event.eventClass);
            linesToInsert.push(this.makeLine(header.id, lineNumber++, "Receivable", receivableCCID, String(event.amount), undefined, event.currency, "Invoice - Receivable Entry"));

            // Revenue (Cr)
            const isDeferred = !!event.sourceData.revenueRuleId;
            const revenueType = isDeferred ? "DEFERRED_REVENUE" : "REVENUE";
            const revenueCCID = await this.deriveAccount(revenueType, event.sourceData, event.ledgerId, event.eventClass);
            linesToInsert.push(this.makeLine(header.id, lineNumber++, isDeferred ? "Deferred Revenue" : "Revenue", revenueCCID, undefined, String(event.amount), event.currency, isDeferred ? "Deferred Revenue" : "Revenue Entry"));
        }
        // ... (Keep other hardcoded flows but use updated deriveAccount) ...

        // 3. Apply Intercompany Balancing
        const balancedLines = await this.balanceBySegment(linesToInsert, event.ledgerId);

        // 4. Batch Insert Lines
        if (linesToInsert.length > 0) {
            await db.insert(slaJournalLines).values(linesToInsert);
            console.log(`[SLA] Created SLA Journal ${header.id} with ${linesToInsert.length} lines.`);
        }

        return header;
    }

    private makeLine(headerId: string, lineNum: number, cls: string, ccid: string, dr: string | undefined, cr: string | undefined, curr: string, desc: string) {
        return {
            headerId,
            lineNumber: lineNum,
            accountingClass: cls,
            codeCombinationId: ccid,
            enteredDr: dr,
            enteredCr: cr,
            accountedDr: dr,
            accountedCr: cr,
            currencyCode: curr,
            description: desc
        };
    }

    // Helper for AR Events
    async processArEvent(eventClass: string, entityId: string, sourceData: any) {
        // Get Primary Ledger
        const [ledger] = await db.select({ id: glLedgers.id }).from(glLedgers).orderBy(glLedgers.createdAt).limit(1);
        const ledgerId = ledger?.id || "PRIMARY";

        return this.createAccounting({
            eventClass,
            entityId,
            entityTable: eventClass.includes("INVOICE") ? "ar_invoices" :
                eventClass.includes("RECEIPT") ? "ar_receipts" :
                    eventClass.includes("ADJUSTMENT") ? "ar_adjustments" : "unknown",
            description: `SLA Journal for ${eventClass}`,
            amount: Math.abs(Number(sourceData.amount || 0)), // Use ABS amount
            currency: sourceData.currency || "USD",
            date: new Date(),
            ledgerId,
            sourceData
        });
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
            // Derive Intercompany Account for this BSV via Rules
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
     * Rule Evaluation Engine (Level 15)
     * Queries `slaCountingRules` to find overrides before falling back to defaults.
     */
    async deriveAccount(ruleCode: string, sourceData: any, ledgerId: string, eventClassAndId?: string): Promise<string> {
        // 1. Check DB for valid Rule
        // We look for a rule with this Code (e.g. "LIABILITY")
        const rules = await db.select().from(slaAccountingRules).where(eq(slaAccountingRules.code, ruleCode));

        if (rules.length > 0) {
            const rule = rules[0];
            return await this.evaluateRule(rule, sourceData, ledgerId);
        }

        // 2. Fallback to Hardcoded Defaults (Legacy Parity)
        const DEFAULT_SEGMENTS = "01-000-00000-000-000-000-000-000-000-000";
        let segmentString = DEFAULT_SEGMENTS;

        if (ruleCode === "LIABILITY" || ruleCode === "AP_LIABILITY") {
            segmentString = "01-000-20000-000-000-000-000-000-000-000";
        } else if (ruleCode === "EXPENSE") {
            segmentString = "01-000-50000-000-000-000-000-000-000-000";
        } else if (ruleCode === "CASH") {
            segmentString = "01-000-11000-000-000-000-000-000-000-000";
        } else if (ruleCode === "RECEIVABLE") {
            segmentString = "01-000-12000-000-000-000-000-000-000-000";
        } else if (ruleCode === "REVENUE") {
            segmentString = "01-000-40000-000-000-000-000-000-000-000";
        } else if (ruleCode === "UNAPPLIED_CASH") {
            segmentString = "01-000-11001-000-000-000-000-000-000-000";
        } else if (ruleCode === "DEFERRED_REVENUE") {
            segmentString = "01-000-24000-000-000-000-000-000-000-000";
        }

        const cc = await financeService.getOrCreateCodeCombination(ledgerId, segmentString);
        return cc.id;
    }

    /**
     * Evaluate a single SLA Rule to determine the Output Account
     */
    async evaluateRule(rule: any, sourceData: any, ledgerId: string): Promise<string> {
        // Option A: Constant Value (Full Segment String)
        if (rule.sourceType === "Constant" && rule.constantValue) {
            // If it looks like a CCID (UUID), return it.
            // If it looks like a Segment String ("01-000..."), resolve it.
            if (rule.constantValue.includes("-")) {
                const cc = await financeService.getOrCreateCodeCombination(ledgerId, rule.constantValue);
                return cc.id;
            }
            return rule.constantValue;
        }

        // Option B: Mapping Set (Source Value -> Output Value)
        if (rule.sourceType === "MappingSet" && rule.mappingSetId && rule.sourceAttribute) {
            const inputValue = sourceData[rule.sourceAttribute]; // e.g. sourceData.vendorType

            const mapping = await db.select().from(slaMappingSetValues).where(and(
                eq(slaMappingSetValues.mappingSetId, rule.mappingSetId),
                eq(slaMappingSetValues.inputValue, String(inputValue))
            )).limit(1);

            if (mapping.length > 0) {
                const output = mapping[0].outputValue;
                // If output is segment string, resolve
                if (output.includes("-")) {
                    const cc = await financeService.getOrCreateCodeCombination(ledgerId, output);
                    return cc.id;
                }
                return output; // Assuming it's a CCID
            }
        }

        // Use default fallback if rule evaluation fails
        console.warn(`[SLA] Rule ${rule.code} evaluation failed or returned no result. Using system default.`);
        return (await financeService.getOrCreateCodeCombination(ledgerId, "01-000-99999-000-000-000-000-000-000-000")).id;
    }

    // Config Methods
    async createSlaRule(data: any) {
        return await db.insert(slaAccountingRules).values(data).returning();
    }

    async listSlaRules() {
        return await db.select().from(slaAccountingRules);
    }
}

export const slaService = new SlaService();
