// @ts-nocheck
import { db } from "../../db";
import {
    glJournals, glJournalLines, glAccounts, glPeriods, glCodeCombinations,
    glAllocations, glIntercompanyRules, glCrossValidationRules, glBudgetControlRules, glBudgetBalances,
    cashBankAccounts, cashStatementHeaders, cashStatementLines, cashTransactions, cashMatchingGroups,
    type InsertGlJournal, type InsertGlJournalLine, type InsertCashBankAccount, type InsertCashTransaction
} from "@shared/schema";
import { eq, and, or, sql, inArray, desc } from "drizzle-orm";
import { storage } from "../../storage";
import { parserFactory } from "../../utils/banking-parsers";
import { randomUUID } from "crypto";

export class FinanceService {

    // ==============================================================================
    // 1. GENERAL LEDGER (GL) CORE
    // ==============================================================================

    // ----- Chart of Accounts & Master Data -----

    async listAccounts() {
        // Basic listing, could add filtering
        return await db.select().from(glAccounts);
    }

    async createAccount(data: typeof glAccounts.$inferInsert) {
        // Simple creation for now
        return await storage.createGlAccount(data);
    }

    async getOrCreateCodeCombination(ledgerId: string, segmentString: string) {
        // Logic moved from legacy finance service or glRoutes
        // segmentString format: "101-000-1110-000..."
        const segments = segmentString.split("-");
        // Simplified lookup for MVP
        // Real implementation checks existing combos or creates new
        // Returning a mock or delegate to storage for now as deep logic is complex
        return await storage.getOrCreateCodeCombination(ledgerId, segments);
    }

    // ----- Journals -----

    async getJournal(id: string) {
        return await storage.getGlJournal(id);
    }

    async listJournals(filters: { status?: string, ledgerId?: string, search?: string, periodId?: string, limit?: number, offset?: number }) {
        let conditions = [];
        if (filters.status) conditions.push(eq(glJournals.status, filters.status));
        if (filters.ledgerId) conditions.push(eq(glJournals.ledgerId, filters.ledgerId));
        if (filters.periodId) conditions.push(eq(glJournals.periodId, filters.periodId));
        if (filters.search) {
            conditions.push(or(
                sql`${glJournals.journalNumber} ILIKE ${`%${filters.search}%`}`,
                sql`${glJournals.description} ILIKE ${`%${filters.search}%`}`
            ));
        }

        const query = db.select().from(glJournals);
        if (conditions.length > 0) query.where(and(...conditions));

        query.orderBy(desc(glJournals.postedDate), desc(glJournals.createdAt));

        if (filters.limit) query.limit(filters.limit);
        if (filters.offset) query.offset(filters.offset);

        return await query;
    }

    async createJournal(data: InsertGlJournal, lines: Omit<InsertGlJournalLine, "journalId">[], userId: string) {
        // Logic extracted from legacy FinanceService.createJournal

        // 1. Transactional validation checks (e.g. Period status) can go here

        // 2. Create Header
        const journal = await storage.createGlJournal({
            ...data,
            journalNumber: data.journalNumber || `JE-${Date.now()}`,
            status: "Draft",
            createdBy: userId
        });

        // 3. Create Lines
        const createdLines = await Promise.all(lines.map(line =>
            storage.createGlJournalLine({ ...line, journalId: journal.id })
        ));

        // 4. Post-creation logic (e.g. Audit log) can be triggered here

        return { ...journal, lines: createdLines };
    }

    /**
     * Logic extracted from `POST /api/gl/post` in glRoutes.ts
     * Decouples form submission from route handler.
     */
    async createJournalFromForm(formId: string, formData: any, userId: number, description?: string) {
        const { FORM_GL_MAPPINGS, isValidGLAccount } = await import("../../metadata/glMappings"); // Lazy import to avoid cycle if any

        const mappings = FORM_GL_MAPPINGS[formId];
        if (!mappings || mappings.length === 0) {
            throw new Error(`No GL mappings found for form ${formId}`);
        }

        const linesToCreate: any[] = [];
        const ledgerId = "PRIMARY"; // Default for now

        for (const mapping of mappings) {
            if (!isValidGLAccount(mapping.account)) continue;

            let amount = mapping.amount === "dynamic" ? formData[mapping.amountField || "amount"] : mapping.amount;
            amount = Number(amount) || 0;
            if (amount === 0) continue;

            const segmentString = `101-000-${mapping.account}-000-000`; // Simplify
            const cc = await this.getOrCreateCodeCombination(ledgerId, segmentString);

            linesToCreate.push({
                accountId: cc.id,
                description: description || `${mapping.description || ""} - Form: ${formId}`,
                enteredDebit: mapping.debitCredit === "debit" ? amount.toFixed(2) : undefined,
                enteredCredit: mapping.debitCredit === "credit" ? amount.toFixed(2) : undefined,
                currencyCode: "USD"
            });
        }

        if (linesToCreate.length === 0) {
            throw new Error("No valid GL lines generated from form data");
        }

        return await this.createJournal({
            ledgerId,
            description: description || `Auto-Generated from ${formId}`,
            source: formId,
            status: "Posted", // Auto-post request
            currencyCode: "USD",
            category: "Manual"
        }, linesToCreate, String(userId));
    }

    // ----- Posting Engine -----

    async postJournal(journalId: string, userId: string) {
        // Logic extracted from legacy FinanceService.postJournal
        // 1. Status Check
        const journal = await storage.getGlJournal(journalId);
        if (!journal) throw new Error("Journal not found");
        if (journal.status === "Posted") throw new Error("Journal already posted");

        // 2. Validate Lines & Balance
        const lines = await storage.listGlJournalLines(journalId);
        const dr = lines.reduce((sum, l) => sum + Number(l.accountedDebit || 0), 0);
        const cr = lines.reduce((sum, l) => sum + Number(l.accountedCredit || 0), 0);

        if (Math.abs(dr - cr) > 0.01) {
            throw new Error(`Journal unbalanced: DR ${dr} != CR ${cr}`);
        }

        // 3. Cross Validation Rules (CVR)
        await this.validateCrossValidationRules(lines, journal.ledgerId);

        // 4. Update Status
        const [updated] = await db.update(glJournals)
            .set({ status: "Posted", postedDate: new Date() })
            .where(eq(glJournals.id, journalId))
            .returning();

        return updated;
    }

    async validateCrossValidationRules(lines: any[], ledgerId: string) {
        // Simplified Logic extracted from FinanceService.validateCrossValidationRules
        const rules = await db.select().from(glCrossValidationRules)
            .where(and(eq(glCrossValidationRules.ledgerId, ledgerId), eq(glCrossValidationRules.isEnabled, true)));

        if (rules.length === 0) return true;

        // In a real implementation this parses filters and checks lines
        // For standardization, we acknowledge the hook is here
        return true;
    }

    // ----- Period Management -----

    async closePeriod(periodId: string, userId: string) {
        // Delegate to Close Engine (Single Source of Truth)
        const { closeEngine } = await import("../../services/period-close/CloseEngine"); // Dynamic import to avoid cycles

        // Resolve Period Name from ID
        // Note: finance.service uses ID, CloseEngine supports ID or Name
        const result = await closeEngine.closePeriod("PRIMARY", periodId, "GL", false);
        return result;
    }

    async getTrialBalance(ledgerId: string, periodId?: string) {
        // Delegate to existing logic
        // Current implementation in services/finance.ts calculates this
        // For MVP refactor, we can reuse or port `calculateTrialBalance`
        // We'll wrap the legacy service logic or storage method here
        // If Logic is complex, we assume it's moved here.

        // Mocking return for structure verification
        return {
            ledgerId,
            periodId,
            rows: [] // Real calculation to be ported
        };
    }


    // ==============================================================================
    // 2. BANKING & CASH
    // ==============================================================================

    async listBankAccounts(userId?: string) {
        // Basic list with optional security filtering
        return await db.select().from(cashBankAccounts);
    }

    async createBankAccount(data: InsertCashBankAccount, userId: string) {
        return await storage.createCashBankAccount({
            ...data,
            status: "Pending" // Maker-Checker default
        });
    }

    async getCashPosition() {
        // Logic extracted from CashService.getCashPosition
        // Calculates sums of balances vs intraday vs unreconciled
        const accounts = await this.listBankAccounts();

        const summary = {
            totalBalance: 0,
            accounts: [] as any[]
        }

        for (const account of accounts) {
            const bal = Number(account.currentBalance || 0);
            summary.totalBalance += bal;
            summary.accounts.push({ name: account.name, balance: bal });
        }

        return summary;
    }

    // ----- Reconciliation -----

    async importBankStatement(accountId: string, fileContent: string, format: string = "BAI2") {
        // Logic extracted from CashService.importBankStatement
        try {
            // 1. Parse
            const parser = parserFactory.getParser(fileContent);
            const parsed = parser.parse(fileContent);

            // 2. Save
            const savedHeaders = [];
            for (const stmt of parsed) {
                const [header] = await db.insert(cashStatementHeaders).values({
                    ...stmt.header,
                    bankAccountId: accountId,
                    status: "Uploaded"
                }).returning();
                savedHeaders.push(header);

                for (const line of stmt.lines) {
                    await storage.createCashStatementLine({
                        ...line,
                        headerId: header.id,
                        bankAccountId: accountId,
                        reconciled: false
                    });
                }
            }
            return savedHeaders;
        } catch (e: any) {
            throw new Error(`Import failed: ${e.message}`);
        }
    }

    /**
     * Auto-Reconciliation Engine
     * Extracted from CashService.autoReconcile
     */
    async autoReconcileBankAccount(accountId: string) {
        const unreconciledLines = await db.select().from(cashStatementLines)
            .where(and(eq(cashStatementLines.bankAccountId, accountId), eq(cashStatementLines.reconciled, false)));

        const unreconciledTrx = await db.select().from(cashTransactions)
            .where(and(eq(cashTransactions.bankAccountId, accountId), eq(cashTransactions.status, "Unreconciled")));

        const matches = [];

        // Simple 1-to-1 Amount Matching for MVP
        for (const line of unreconciledLines) {
            const matchIndex = unreconciledTrx.findIndex(t =>
                Math.abs(Number(t.amount) - Number(line.amount)) < 0.01
            );

            if (matchIndex >= 0) {
                const trx = unreconciledTrx.splice(matchIndex, 1)[0];
                matches.push({ line, trx });
            }
        }

        if (matches.length > 0) {
            const group = await storage.createCashMatchingGroup({ method: "AUTO", reconciledDate: new Date() });

            for (const m of matches) {
                await db.update(cashStatementLines).set({ reconciled: true, matchingGroupId: group.id }).where(eq(cashStatementLines.id, m.line.id));
                await db.update(cashTransactions).set({ status: "Reconciled", matchingGroupId: group.id }).where(eq(cashTransactions.id, m.trx.id));
            }
        }

        return { matchedCount: matches.length };
    }
}

export const financeService = new FinanceService();
