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

        // 1. Validate Event Class (Ideally cache this or ensure it exists)
        // For MVP we skip strict DB check on Every call if we blindly trust "AP_INVOICE_VALIDATED" exists in seed.
        // But let's be safe.
        // const [eventClassDef] = await db.select().from(slaEventClasses).where(eq(slaEventClasses.id, event.eventClass));

        // 2. Generate Header
        const [header] = await db.insert(slaJournalHeaders).values({
            ledgerId: event.ledgerId,
            eventClassId: event.eventClass,
            entityId: event.entityId,
            entityTable: event.entityTable,
            eventDate: event.date,
            glDate: event.date, // Default to event date
            currencyCode: event.currency,
            description: event.description || `SLA Journal for ${event.eventClass}`,
            status: "Draft",
            completedFlag: false
        }).returning();

        // 3. Process Rules to Limit Lines
        // This is a simplified engine. Real SLA process is much more complex.
        const linesToInsert: any[] = [];
        let lineNumber = 1;

        // Mock Rule Logic for MVP (Hardcoded Rules Engine)
        // In full implementation, we would query `slaAccountingRules` joined with definitions.

        if (event.eventClass === "AP_INVOICE_VALIDATED") {
            // 3a. Derive Liability (Credit)
            const liabilityCCID = await this.deriveAccount("LIABILITY", event.sourceData, event.ledgerId);
            linesToInsert.push({
                headerId: header.id,
                lineNumber: lineNumber++,
                accountingClass: "Liability",
                codeCombinationId: liabilityCCID,
                enteredCr: String(event.amount),
                accountedCr: String(event.amount), // Assuming functional currency for now
                currencyCode: event.currency,
                description: "Liability Entry"
            });

            // 3b. Derive Expense (Debit)
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
        });
    } else if(event.eventClass === "AP_PAYMENT_CREATED") {
    // 3c. Debit Liability (Undo credit from invoice)
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

    // 3d. Credit Cash (The actual cash outflow)
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
    // 3c. Derive Receivable (Debit)
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

    // 3d. Derive Revenue (Credit)
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
// Add more event classes here (AR_INVOICE, PAYMENT, etc.)

// 4. Insert Lines
if (linesToInsert.length > 0) {
    await db.insert(slaJournalLines).values(linesToInsert);
}

console.log(`[SLA] Created SLA Journal ${header.id} with ${linesToInsert.length} lines.`);
return header;
    }

    /**
     * Post the SLA Journal to GL.
     * This turns the Draft SLA entry into a Real GL Journal.
     */
    async postToGL(slaHeaderId: string, userId: string) {
    const [header] = await db.select().from(slaJournalHeaders).where(eq(slaJournalHeaders.id, slaHeaderId));
    if (!header) throw new Error("SLA Header not found");
    if (header.transferStatus === "Transferred") throw new Error("Already transferred to GL");

    const lines = await db.select().from(slaJournalLines).where(eq(slaJournalLines.headerId, slaHeaderId));

    // Create GL Journal
    // We need to map SLA lines to GL Lines
    // Note: SLA lines might be detailed, GL might summarize. For now, 1:1.

    // Call FinanceService to create journal
    // We construct the "Input" for createJournal
    const journal = await financeService.createJournal({
        ledgerId: header.ledgerId,
        periodName: "Jan-26", // TODO: Derive period from date
        source: "SLA",
        category: header.eventClassId || "Manual",
        currencyCode: header.currencyCode,
        description: header.description || "SLA Import",
        lines: lines.map(l => ({
            accountId: l.codeCombinationId!, // Non-null assertion for MVP
            enteredDr: l.enteredDr ? Number(l.enteredDr) : 0,
            enteredCr: l.enteredCr ? Number(l.enteredCr) : 0,
            description: l.description || ""
        }))
    }, userId);

    // Update SLA status
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
    async deriveAccount(ruleType: string, sourceData: any, ledgerId: string): Promise < string > {
    // Real implementation would look up `slaAccountingRules`
    // For now, hardcode to ensure we use valid 10-segment codes.

    const DEFAULT_SEGMENTS = "01-000-00000-000-000-000-000-000-000-000"; // 10 segments
    let segmentString = DEFAULT_SEGMENTS;

    if(ruleType === "LIABILITY" || ruleType === "AP_LIABILITY") {
    // 01-000-20000-...
    segmentString = "01-000-20000-000-000-000-000-000-000-000";
} else if (ruleType === "EXPENSE") {
    // 01-000-50000-...
    segmentString = "01-000-50000-000-000-000-000-000-000-000";
} else if (ruleType === "CASH") {
    // 01-000-11000-...
    segmentString = "01-000-11000-000-000-000-000-000-000-000";
} else if (ruleType === "RECEIVABLE") {
    // 01-000-12000-...
    segmentString = "01-000-12000-000-000-000-000-000-000-000";
} else if (ruleType === "REVENUE") {
    // 01-000-40000-...
    segmentString = "01-000-40000-000-000-000-000-000-000-000";
}

// Ensure this combination exists in GL
const cc = await financeService.getOrCreateCodeCombination(ledgerId, segmentString);
return cc.id;
    }
}

export const slaService = new SlaService();
