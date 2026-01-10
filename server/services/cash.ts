
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
            bankAccountId: Number(bankAccountId),
            sourceModule: "GL",
            sourceId: 0,
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

    async autoReconcile(accountId: string) {
        const statementLines = await storage.listCashStatementLines(accountId);
        const transactions = await storage.listCashTransactions(accountId);

        const unreconciledLines = statementLines.filter(l => !l.reconciled);
        const unreconciledTrx = transactions.filter(t => t.status === "Unreconciled");

        let matchCount = 0;
        const proposedMatches: any[] = [];

        for (const line of unreconciledLines) {
            // Fuzzy Matching Logic
            // 1. Amount Match (High Weight)
            const amountMatches = unreconciledTrx.filter(t => Number(t.amount) === Number(line.amount));

            for (const t of amountMatches) {
                let score = 50; // Base score for exact amount match

                // 2. Date Proximity (Up to 30 points)
                const txDate = t.transactionDate ? new Date(t.transactionDate).getTime() : 0;
                const lineDate = new Date(line.transactionDate).getTime();
                const daysDiff = Math.abs(txDate - lineDate) / (1000 * 60 * 60 * 24);

                if (daysDiff === 0) score += 30;
                else if (daysDiff <= 2) score += 20;
                else if (daysDiff <= 5) score += 10;

                // 3. Description/Ref Fuzzy (Up to 20 points)
                const lineDesc = (line.description || "").toLowerCase();
                const trxDesc = (t.reference || "").toLowerCase();

                // Token Matching (Tokens > 2 chars, keyword match)
                const lineTokens = lineDesc.split(/\s+/).filter(tok => tok.length > 2);
                const trxTokens = trxDesc.split(/\s+/).filter(tok => tok.length > 2);

                const hasKeywordMatch = lineTokens.some(token => trxDesc.includes(token)) ||
                    trxTokens.some(token => lineDesc.includes(token));

                if (hasKeywordMatch) score += 20;

                // Match if Score >= 70
                if (score >= 70) {
                    matchCount++;
                    proposedMatches.push({ line, transaction: t, confidence: score, type: "AI_MATCH" });
                    break;
                }
            }
        }

        return {
            processed: unreconciledLines.length,
            matched: matchCount,
            proposedMatches,
            message: `Auto-reconciliation complete. Found ${matchCount} high-confidence matches.`
        };
    }

    async createTransaction(data: any) {
        return await storage.createCashTransaction({
            bankAccountId: Number(data.bankAccountId),
            sourceModule: data.sourceModule || 'GL',
            sourceId: Number(data.sourceId || 0),
            amount: String(data.amount),
            transactionDate: data.date || new Date(),
            reference: data.reference || `TXN-${Date.now()}`,
            status: data.status || "Unreconciled" as any
        });
    }
}

export const cashService = new CashService();
