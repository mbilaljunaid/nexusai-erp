
import { db } from "../db";
import { eq } from "drizzle-orm";
import { storage } from "../storage";
import { InsertCashBankAccount, InsertCashStatementLine, InsertCashTransaction, cashStatementLines } from "@shared/schema";

export class CashService {

    async createBankAccount(data: InsertCashBankAccount) {
        return await storage.createCashBankAccount(data);
    }

    async listBankAccounts() {
        return await storage.listCashBankAccounts();
    }

    async getBankAccount(id: string) {
        return await storage.getCashBankAccount(id);
    }

    async listStatementLines(accountId: string) {
        return await storage.listCashStatementLines(accountId);
    }

    async listTransactions(accountId: string) {
        return await storage.listCashTransactions(accountId);
    }

    async importBankStatement(accountId: string, lines: InsertCashStatementLine[]) {
        const results = [];
        for (const line of lines) {
            // Ensure we are importing for the correct account
            if (String(line.bankAccountId) !== String(accountId)) continue;
            results.push(await storage.createCashStatementLine(line));
        }
        return results;
    }

    async getCashPosition() {
        const accounts = await this.listBankAccounts();
        const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);

        // Simple forecast by summing basic balances for now
        // Future: Add pending AP payments and AR receipts to forecast
        return {
            totalBalance,
            accounts: accounts.map(a => ({
                name: a.name,
                balance: Number(a.currentBalance),
                currency: a.currency
            }))
        };
    }

    async createTransactionFromLine(
        lineId: string,
        transactionType: string,
        glAccountId: number,
        userId: string = "system"
    ) {
        // Placeholder implementation
        return null;
    }

    // Updated signature to support creating transaction
    async createTransactionFromUnmatched(
        bankAccountId: string,
        lineId: string,
        data: { type: string; glAccountId: number; description?: string }
    ) {
        const lines = await storage.listCashStatementLines(bankAccountId);
        const line = lines.find(l => String(l.id) === lineId);
        if (!line) throw new Error("Statement line not found");

        const trx = await storage.createCashTransaction({
            bankAccountId: String(bankAccountId),
            sourceModule: "GL",
            sourceId: "MANUAL",
            amount: String(line.amount),
            transactionDate: new Date(line.transactionDate),
            reference: line.referenceNumber || `STMT-${lineId}`,
            status: "Reconciled", // Created and reconciled immediately
        });

        // Mock GL Posting
        await this.postReconciliationToGL(trx, data.glAccountId);

        return trx;
    }

    async postReconciliationToGL(trx: any, contraAccountId: number) {
        // This would create a GlJournal entry.
        console.log(`[GL INTEGRATION] Posting Journal for Transaction ${trx.id}:`);
        console.log(`  DR Expense/Asset Account ${contraAccountId}: ${trx.amount}`);
        console.log(`  CR Bank Account: ${trx.amount}`);
    }

    async autoReconcile(bankAccountId: string, userId: string = "system") {
        const account = await storage.getCashBankAccount(bankAccountId);
        if (!account) throw new Error("Bank account not found");

        const statementLines = await storage.listCashStatementLines(bankAccountId);
        const transactions = await storage.listCashTransactions(bankAccountId);
        const rules = await storage.listCashReconciliationRules(account.ledgerId || "PRIMARY");

        const unreconciledLines = statementLines.filter(l => !l.reconciled);
        const unreconciledTrx = transactions.filter(t => t.status === "Unreconciled");

        console.log(`[CASH] Starting Auto-Reconcile for ${account.name}. Rules found: ${rules.length}`);

        const matches: any[] = [];
        const group = await storage.createCashMatchingGroup({
            userId,
            method: "AUTO",
            reconciledDate: new Date(),
        });

        for (const line of unreconciledLines) {
            for (const rule of rules.sort((a, b) => (a.priority || 0) - (b.priority || 0))) {
                const criteria = rule.matchingCriteria as any;

                // 1. Amount Match (Usually required)
                const candidates = unreconciledTrx.filter(t =>
                    Math.abs(Number(t.amount) - Number(line.amount)) < 0.01 &&
                    !matches.find(m => m.transaction.id === t.id)
                );

                if (candidates.length === 0) continue;

                // 2. Ref/Date/Fuzzy logic per rule
                for (const trx of candidates) {
                    let isMatch = true;

                    // Date Tolerance
                    if (criteria.dateToleranceDays) {
                        const txDate = new Date(trx.transactionDate || "").getTime();
                        const lineDate = new Date(line.transactionDate).getTime();
                        const daysDiff = Math.abs(txDate - lineDate) / (1000 * 60 * 60 * 24);
                        if (daysDiff > criteria.dateToleranceDays) isMatch = false;
                    }

                    // Reference Match
                    if (isMatch && criteria.requireRefMatch) {
                        const lineRef = (line.referenceNumber || "").toLowerCase();
                        const trxRef = (trx.reference || "").toLowerCase();
                        if (!lineRef.includes(trxRef) && !trxRef.includes(lineRef)) isMatch = false;
                    }

                    if (isMatch) {
                        matches.push({ line, transaction: trx, rule: rule.ruleName });

                        // Update DB Status
                        await storage.updateCashTransaction(trx.id, {
                            status: "Cleared",
                            matchingGroupId: group.id
                        });

                        // Also update the Statement Line status
                        // (Assuming we need to mark it as reconciled in DB too)
                        await db.update(cashStatementLines).set({
                            reconciled: true,
                            matchingGroupId: group.id
                        }).where(eq(cashStatementLines.id, line.id));

                        // Mark line as reconciled
                        // This would ideally be a bulk update or specialized storage method
                        // For now we use the storage interface
                        console.log(`[CASH] Matched: ${line.id} <-> ${trx.id} via rule ${rule.ruleName}`);
                        break;
                    }
                }

                if (matches.find(m => m.line.id === line.id)) break;
            }
        }

        return {
            processed: unreconciledLines.length,
            matched: matches.length,
            matchingGroupId: group.id,
            message: `Auto-reconciliation complete. Found ${matches.length} matches.`
        };
    }

    async createTransaction(data: any) {
        return await storage.createCashTransaction({
            bankAccountId: String(data.bankAccountId),
            sourceModule: data.sourceModule || 'GL',
            sourceId: String(data.sourceId || "MANUAL"),
            amount: String(data.amount),
            transactionDate: data.date || new Date(),
            reference: data.reference || `TXN-${Date.now()}`,
            status: data.status || "Unreconciled" as any
        });
    }

    async createReconciliationRule(data: any) {
        return await storage.createCashReconciliationRule(data);
    }
}

export const cashService = new CashService();
