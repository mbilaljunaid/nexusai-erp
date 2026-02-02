
import { db } from "../db";
import {
    slaJournalHeaders,
    slaJournalLines,
    cashBankAccounts,
    glCodeCombinations,
    slaEventClasses
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface AccountingEvent {
    eventId?: string;
    eventType: "CASH_RECONCILED" | "MANUAL_ADJUSTMENT" | "BANK_TRANSFER" | "REVALUATION";
    ledgerId: string;
    description: string;
    amount: number;
    currency: string;
    date: Date;
    sourceId: string; // The Bank Account ID
    referenceId: string; // The Transaction or Statement Line ID
}

export class CashAccountingService {

    /**
     * Creates SLA journal entries for a given cash event.
     * Uses a simplified "Standard Accrual" logic:
     * - Inflow: DR Cash, CR Revenue/Clearing
     * - Outflow: DR Expense/Liability, CR Cash
     * 
     * In a real Oracle Fusion setup, this would use the configured 'slaAccountingRules'.
     */
    async createAccounting(event: AccountingEvent) {
        console.log(`[SLA] Processing Event: ${event.eventType} for Ref: ${event.referenceId}`);

        // 1. Fetch Bank Account to get Default CCIDs and Secondary Ledger
        const [bankAccount] = await db
            .select()
            .from(cashBankAccounts)
            .where(eq(cashBankAccounts.id, event.sourceId));

        if (!bankAccount) {
            throw new Error(`Bank Account ${event.sourceId} not found for accounting.`);
        }

        const cashCCID = bankAccount.cashAccountCCID;
        const clearingCCID = bankAccount.cashClearingCCID;

        if (!cashCCID || !clearingCCID) {
            console.warn(`[SLA] Missing CCIDs for Bank Account ${bankAccount.name}. Accounting skipped.`);
            return;
        }

        // Determine target ledgers
        const ledgers = [event.ledgerId];
        if (bankAccount.secondaryLedgerId) {
            ledgers.push(bankAccount.secondaryLedgerId);
        }

        const createdHeaders: string[] = [];

        for (const targetLedgerId of ledgers) {
            console.log(`[SLA] Creating Journal for Ledger: ${targetLedgerId}`);

            // 2. Create Header
            const headerId = randomUUID();
            await db.insert(slaJournalHeaders).values({
                id: headerId,
                ledgerId: targetLedgerId,
                eventClassId: event.eventType,
                entityId: event.referenceId,
                entityTable: "cash_transactions",
                eventDate: event.date,
                glDate: event.date,
                currencyCode: event.currency,
                status: "Final",
                description: event.description,
                completedFlag: true,
                createdAt: new Date(),
            });

            // 3. Create Lines (Double Entry)
            const isDebitCash = event.amount >= 0;
            const absAmount = Math.abs(event.amount).toFixed(2);

            // Line 1: Cash Account
            await db.insert(slaJournalLines).values({
                id: randomUUID(),
                headerId: headerId,
                lineNumber: 1,
                accountingClass: "CASH",
                codeCombinationId: String(cashCCID),
                currencyCode: event.currency,
                enteredDr: isDebitCash ? absAmount : null,
                enteredCr: !isDebitCash ? absAmount : null,
                accountedDr: isDebitCash ? absAmount : null,
                accountedCr: !isDebitCash ? absAmount : null,
                description: `Cash Impact - ${event.description}`
            });

            // Line 2: Clearing / Offset Account
            const isRevaluation = event.eventType === "REVALUATION";
            const offsetCCID = isRevaluation ? 9999 : clearingCCID;

            await db.insert(slaJournalLines).values({
                id: randomUUID(),
                headerId: headerId,
                lineNumber: 2,
                accountingClass: isRevaluation ? "FX_GAIN_LOSS" : "CLEARING",
                codeCombinationId: String(offsetCCID),
                currencyCode: event.currency,
                enteredDr: !isDebitCash ? absAmount : null,
                enteredCr: isDebitCash ? absAmount : null,
                accountedDr: !isDebitCash ? absAmount : null,
                accountedCr: isDebitCash ? absAmount : null,
                description: `${isRevaluation ? 'FX Unrealized Gain/Loss' : 'Offset'} - ${event.description}`
            });

            createdHeaders.push(headerId);
        }

        return createdHeaders[0]; // Return primary header ID for compatibility
    }
}

export const cashAccountingService = new CashAccountingService();
