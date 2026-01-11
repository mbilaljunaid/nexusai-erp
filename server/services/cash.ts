import { randomUUID } from "crypto";
import { db } from "../db";
import { eq, inArray } from "drizzle-orm";
import { storage } from "../storage";
import { InsertCashBankAccount, InsertCashStatementLine, InsertCashTransaction, cashStatementLines, cashTransactions, cashStatementHeaders, cashBankAccounts, glDataAccessSets, glDataAccessSetAssignments } from "@shared/schema";
import { cashAccountingService } from "./cash-accounting.service";
import { cashAuditService } from "./cash-audit.service";
import { parserFactory } from "../utils/banking-parsers";

export class CashService {

    async createBankAccount(data: InsertCashBankAccount) {
        return await storage.createCashBankAccount(data);
    }

    async listBankAccounts(userId?: string) {
        if (!userId) {
            return await storage.listCashBankAccounts();
        }

        // Security: Filter by Data Access Set
        const userAssignments = await db
            .select({ ledgerId: glDataAccessSets.ledgerId })
            .from(glDataAccessSetAssignments)
            .innerJoin(glDataAccessSets, eq(glDataAccessSetAssignments.dataAccessSetId, glDataAccessSets.id))
            .where(eq(glDataAccessSetAssignments.userId, userId));

        const allowedLedgers = userAssignments.map(a => a.ledgerId);

        if (allowedLedgers.length === 0) {
            // User has no assignments -> Return empty or throw? 
            // Return empty list is safer
            return [];
        }

        return await db
            .select()
            .from(cashBankAccounts)
            .where(inArray(cashBankAccounts.ledgerId, allowedLedgers));
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

    async importBankStatement(accountId: string, fileContent: string, userId: string = "system") {
        try {
            // 1. Try to parse using Factory (MT940, BAI2)
            const parser = parserFactory.getParser(fileContent);
            const parsedStatements = parser.parse(fileContent);

            const results = [];
            for (const stmt of parsedStatements) {
                // Ensure Account Matches (Security Check)
                // In real world, we might lookup account by IBAN in file vs accountId

                // create header
                const [header] = await db.insert(cashStatementHeaders).values({
                    ...stmt.header,
                    bankAccountId: accountId, // Force logical link
                    status: "Uploaded"
                }).returning();

                // create lines
                for (const line of stmt.lines) {
                    await storage.createCashStatementLine({
                        ...line,
                        headerId: header.id,
                        bankAccountId: accountId,
                        reconciled: false
                    });
                }
                results.push(header);

                // Audit: Statement Import
                await cashAuditService.logAction({
                    action: "IMPORT_STATEMENT",
                    entity: "CashStatementHeader",
                    entityId: header.id,
                    userId,
                    details: { lines: stmt.lines.length, format: stmt.header.statementNumber }
                });
            }
            return results;

        } catch (e) {
            // Fallback to legacy CSV array import if passed as JSON/Object (Old UI)
            // But if string, assume it's file content. 
            // For now, if parser fails, maybe it's CSV? 
            // We'll throw for now to enforce standard formats or implement CSVParser later.
            console.error("Statement Parse Error", e);
            throw new Error("Could not parse statement file. Ensure format is MT940 or BAI2.");
        }
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

        // Trigger SLA Accounting
        try {
            await cashAccountingService.createAccounting({
                eventId: randomUUID(),
                eventType: "MANUAL_ADJUSTMENT",
                ledgerId: "PRIMARY",
                description: trx.description || `Manual Transaction ${trx.reference}`,
                amount: Number(trx.amount),
                currency: "USD", // Should fetch from Bank Account
                date: new Date(trx.transactionDate!),
                sourceId: bankAccountId,
                referenceId: trx.id,
            });
        } catch (e) {
            console.error("Failed to create accounting for manual transaction", e);
        }

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

                    // Regex Match (Advanced)
                    if (isMatch && criteria.refRegex) {
                        try {
                            const regex = new RegExp(criteria.refRegex, 'i');
                            const lineDesc = line.description || "";
                            const trxRef = trx.reference || "";
                            if (!regex.test(lineDesc) && !regex.test(trxRef)) isMatch = false;
                        } catch (e) {
                            console.error(`[CASH] Invalid regex in rule ${rule.ruleName}: ${criteria.refRegex}`);
                        }
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

                        // Trigger Accounting if needed (e.g. if the rule implies specific accounting)
                        // For basic clearing, we might assume accounting happened at Transaction Creation.
                        // But if this is "Statement Reconciled", we might move from Cash Clearing to Cash.
                        break;
                    }
                }

                if (matches.find(m => m.line.id === line.id)) break;
            }
        }

        // Audit: Auto-Reconciliation
        await cashAuditService.logAction({
            action: "AUTO_RECONCILE",
            entity: "CashMatchingGroup",
            entityId: group.id,
            userId,
            details: { matched: matches.length, processed: unreconciledLines.length }
        });

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
            description: data.description,
            status: data.status || "Unreconciled" as any
        });
    }

    async manualReconcile(bankAccountId: string, lineIds: string[], transactionIds: string[], userId: string = "system") {
        const allLines = await storage.listCashStatementLines(bankAccountId);
        const allTrx = await storage.listCashTransactions(bankAccountId);

        const lines = allLines.filter(l => lineIds.includes(String(l.id)));
        const trxs = allTrx.filter(t => transactionIds.includes(String(t.id)));

        if (lines.length !== lineIds.length || trxs.length !== transactionIds.length) {
            throw new Error("One or more selected items not found");
        }

        const totalLines = lines.reduce((sum, l) => sum + Number(l.amount), 0);
        const totalTrx = trxs.reduce((sum, t) => sum + Number(t.amount), 0);

        if (Math.abs(totalLines - totalTrx) > 0.01) {
            throw new Error(`Amount mismatch: Lines=${totalLines}, Trx=${totalTrx}`);
        }

        const group = await storage.createCashMatchingGroup({
            userId,
            method: "MANUAL",
            reconciledDate: new Date(),
        });

        for (const line of lines) {
            await db.update(cashStatementLines)
                .set({ reconciled: true, matchingGroupId: group.id })
                .where(eq(cashStatementLines.id, line.id));
        }

        for (const trx of trxs) {
            // Use DB update because storage update might not return Promise<void> or similar
            // Actually storage.updateCashTransaction is fine but direct DB is consistent with lines up there
            await db.update(cashTransactions)
                .set({ status: "Reconciled", matchingGroupId: group.id })
                .where(eq(cashTransactions.id, trx.id));
        }

        // Audit: Manual Reconciliation
        await cashAuditService.logAction({
            action: "MANUAL_RECONCILE",
            entity: "CashMatchingGroup",
            entityId: group.id,
            userId,
            details: { lineIds, transactionIds }
        });

        return group;
    }

    async unmatchGroup(matchingGroupId: string) {
        // Reset Lines
        await db.update(cashStatementLines)
            .set({ reconciled: false, matchingGroupId: null })
            .where(eq(cashStatementLines.matchingGroupId, matchingGroupId));

        // Reset Transactions
        await db.update(cashTransactions)
            .set({ status: "Unreconciled", matchingGroupId: null })
            .where(eq(cashTransactions.matchingGroupId, matchingGroupId));

        // Note: We keep the group record for audit, or delete it? 
        // Typically keep it but maybe mark inactive. For now just leaving it orphan is okay or delete it.
    }

    async createReconciliationRule(data: any) {
        return await storage.createCashReconciliationRule({
            ...data,
            ledgerId: data.ledgerId || "PRIMARY",
            active: data.active ?? true,
            createdAt: new Date()
        });
    }

    async listReconciliationRules(ledgerId: string) {
        return await storage.listCashReconciliationRules(ledgerId);
    }

    async updateReconciliationRule(id: string, data: any) {
        return await storage.updateCashReconciliationRule(id, data);
    }

    async deleteReconciliationRule(id: string) {
        return await storage.deleteCashReconciliationRule(id);
    }

    async getReconciliationSummary(ledgerId: string = "PRIMARY") {
        const accounts = await storage.listCashBankAccounts();
        const summary = [];

        for (const account of accounts) {
            // Filter by ledger if needed, but for now let's just return all
            // if (account.ledgerId !== ledgerId) continue;

            const statementLines = await storage.listCashStatementLines(account.id);
            const unreconciledCount = statementLines.filter(l => !l.reconciled).length;
            const totalCount = statementLines.length;

            summary.push({
                accountId: account.id,
                accountName: account.name,
                bankName: account.bankName,
                currency: account.currency,
                totalLines: totalCount,
                unreconciledLines: unreconciledCount,
                percentComplete: totalCount > 0 ? ((totalCount - unreconciledCount) / totalCount) * 100 : 100,
                status: unreconciledCount === 0 ? "Complete" : "In Progress"
            });
        }

        return summary;
    }

    async getReconciliationReport(bankAccountId: string) {
        const account = await storage.getCashBankAccount(bankAccountId);
        if (!account) throw new Error("Bank account not found");

        const statementLines = await storage.listCashStatementLines(bankAccountId);
        const transactions = await storage.listCashTransactions(bankAccountId);

        const reconciledLines = statementLines.filter(l => l.reconciled);
        const unreconciledLines = statementLines.filter(l => !l.reconciled);
        const clearedTrx = transactions.filter(t => t.status === "Cleared");
        const unclearedTrx = transactions.filter(t => t.status === "Unreconciled");

        // Simple Balance Calculation for Report
        const ledgerBalance = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
        const statementBalance = statementLines.reduce((acc, l) => acc + Number(l.amount), 0); // Simplified

        return {
            account: {
                name: account.name,
                accountNumber: account.accountNumber,
                bankName: account.bankName,
                currency: account.currency
            },
            summary: {
                ledgerBalance,
                statementBalance,
                variance: statementBalance - ledgerBalance,
                reconciledCount: reconciledLines.length,
                unreconciledCount: unreconciledLines.length
            },
            details: {
                unreconciledLines: unreconciledLines.map(l => ({
                    date: l.transactionDate,
                    description: l.description,
                    amount: l.amount,
                    ref: l.referenceNumber
                })),
                unclearedTransactions: unclearedTrx.map(t => ({
                    date: t.transactionDate,
                    description: t.description,
                    amount: t.amount,
                    ref: t.reference
                }))
            }
        };
    }
}

export const cashService = new CashService();
