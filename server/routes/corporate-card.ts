import { Router } from "express";
import type { Request, Response } from "express";
import * as storage from "../storage";

const router = Router();

/**
 * POST /api/expenses/corporate-card/import
 * Import corporate card transactions from CSV
 */
router.post("/corporate-card/import", async (req: Request, res: Response) => {
    try {
        const { transactions } = req.body;
        const tenantId = (req as any).auth?.tenantId;
        const userId = (req as any).auth?.userId;

        if (!tenantId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!transactions || !Array.isArray(transactions)) {
            return res.status(400).json({ error: "Invalid transactions data" });
        }

        // Process each transaction
        const imported: any[] = [];
        const matched: any[] = [];
        const unmatched: any[] = [];

        const expenseReports = await storage.listExpenseReports();
        const tenantReports = expenseReports.filter((r: any) => r.tenantId === tenantId);

        for (const txn of transactions) {
            const transaction = {
                id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                cardNumber: txn.cardNumber,
                transactionDate: txn.date,
                merchant: txn.merchant,
                amount: parseFloat(txn.amount),
                currency: txn.currency || "USD",
                category: txn.category,
                description: txn.description,
                tenantId,
                importedBy: userId,
                importedAt: new Date().toISOString(),
                matchedExpenseId: null,
                matchedLineId: null,
                status: "PENDING" as const
            };

            // Auto-matching logic: Find expense lines with similar amount and date
            let bestMatch = null;
            let bestScore = 0;

            for (const report of tenantReports) {
                for (const line of report.lines || []) {
                    let score = 0;

                    // Amount match (exact or within 5%)
                    const amountDiff = Math.abs(line.amount - transaction.amount);
                    if (amountDiff === 0) score += 50;
                    else if (amountDiff / transaction.amount < 0.05) score += 30;

                    // Date match (same day or within 3 days)
                    if (line.expenseDate) {
                        const lineDateMs = new Date(line.expenseDate).getTime();
                        const txnDateMs = new Date(transaction.transactionDate).getTime();
                        const daysDiff = Math.abs((lineDateMs - txnDateMs) / (1000 * 60 * 60 * 24));
                        if (daysDiff === 0) score += 40;
                        else if (daysDiff <= 3) score += 20;
                    }

                    // Category match
                    if (line.category === transaction.category) score += 10;

                    if (score > bestScore && score >= 60) {
                        bestScore = score;
                        bestMatch = {
                            reportId: report.id,
                            lineId: line.id,
                            confidence: score / 100
                        };
                    }
                }
            }

            if (bestMatch) {
                transaction.matchedExpenseId = bestMatch.reportId;
                transaction.matchedLineId = bestMatch.lineId;
                transaction.status = "MATCHED" as const;
                matched.push({
                    ...transaction,
                    matchConfidence: bestMatch.confidence
                });
            } else {
                unmatched.push(transaction);
            }

            imported.push(transaction);
        }

        res.status(200).json({
            success: true,
            summary: {
                total: imported.length,
                matched: matched.length,
                unmatched: unmatched.length,
                matchRate: ((matched.length / imported.length) * 100).toFixed(1) + "%"
            },
            transactions: {
                all: imported,
                matched,
                unmatched
            }
        });
    } catch (error: any) {
        console.error("Corporate card import error:", error);
        res.status(500).json({ error: "Failed to import transactions", details: error.message });
    }
});

/**
 * GET /api/expenses/corporate-card/transactions
 * Get all imported card transactions with match status
 */
router.get("/corporate-card/transactions", async (req: Request, res: Response) => {
    try {
        const tenantId = (req as any).auth?.tenantId;
        const { status } = req.query;

        if (!tenantId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // In a real implementation, this would fetch from a dedicated card_transactions table
        // For now, returning a simulated response
        const transactions = [
            // Would be fetched from storage
        ];

        const filtered = status
            ? transactions.filter((t: any) => t.status === status)
            : transactions;

        res.status(200).json({
            count: filtered.length,
            transactions: filtered,
            summary: {
                pending: transactions.filter((t: any) => t.status === "PENDING").length,
                matched: transactions.filter((t: any) => t.status === "MATCHED").length,
                reconciled: transactions.filter((t: any) => t.status === "RECONCILED").length
            }
        });
    } catch (error: any) {
        console.error("Fetch transactions error:", error);
        res.status(500).json({ error: "Failed to fetch transactions", details: error.message });
    }
});

/**
 * POST /api/expenses/corporate-card/transactions/:txnId/match
 * Manually match a transaction to an expense line
 */
router.post("/corporate-card/transactions/:txnId/match", async (req: Request, res: Response) => {
    try {
        const { txnId } = req.params;
        const { reportId, lineId } = req.body;
        const tenantId = (req as any).auth?.tenantId;

        if (!tenantId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // In a real implementation, update the transaction record
        const updatedTransaction = {
            id: txnId,
            matchedExpenseId: reportId,
            matchedLineId: lineId,
            status: "MATCHED" as const,
            matchedAt: new Date().toISOString(),
            matchMethod: "MANUAL"
        };

        res.status(200).json({
            success: true,
            transaction: updatedTransaction
        });
    } catch (error: any) {
        console.error("Manual match error:", error);
        res.status(500).json({ error: "Failed to match transaction", details: error.message });
    }
});

/**
 * DELETE /api/expenses/corporate-card/transactions/:txnId/match
 * Unmatch a transaction from an expense line
 */
router.delete("/corporate-card/transactions/:txnId/match", async (req: Request, res: Response) => {
    try {
        const { txnId } = req.params;
        const tenantId = (req as any).auth?.tenantId;

        if (!tenantId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const updatedTransaction = {
            id: txnId,
            matchedExpenseId: null,
            matchedLineId: null,
            status: "PENDING" as const,
            unmatchedAt: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            transaction: updatedTransaction
        });
    } catch (error: any) {
        console.error("Unmatch error:", error);
        res.status(500).json({ error: "Failed to unmatch transaction", details: error.message });
    }
});

export default router;
