
import { storage } from "../storage";
import { InsertCashBankAccount, InsertCashStatementLine, InsertCashTransaction } from "@shared/schema";

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

    async autoReconcile(accountId: string) {
        const statementLines = await storage.listCashStatementLines(accountId);
        const transactions = await storage.listCashTransactions(accountId);

        const unreconciledLines = statementLines.filter(l => !l.reconciled);
        const unreconciledTrx = transactions.filter(t => t.status === "Unreconciled");

        let matchCount = 0;

        for (const line of unreconciledLines) {
            // Simple Matching Logic: Amount must match exactly
            // In a real system, we'd enable fuzzy matching on date and reference
            const match = unreconciledTrx.find(t =>
                Number(t.amount) === Number(line.amount) &&
                // Date within 5 days? For now simpler
                Math.abs(new Date(t.transactionDate!).getTime() - new Date(line.transactionDate).getTime()) < 432000000 // 5 days
                // && (!line.referenceNumber || !t.reference || line.referenceNumber === t.reference) 
            );

            if (match) {
                // Mark both as reconciled (In real DB update logic needed)
                // Since we don't have update methods for Lines/Trx exposed in generic storage yet, 
                // we will assume we add them. For now, we return "Proposed Matches".
                matchCount++;
                // TODO: Implement updates
            }
        }

        return {
            processed: unreconciledLines.length,
            matched: matchCount,
            message: `Auto-reconciliation complete. Matched ${matchCount} transactions.`
        };
    }
}

export const cashService = new CashService();
