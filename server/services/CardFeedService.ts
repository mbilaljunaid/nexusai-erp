import { storage } from "../storage";
import { InsertCorporateCardTransaction, CorporateCardTransaction } from "@shared/schema";

export class CardFeedService {
    /**
     * Simulates importing a bank feed (OFX/CSV) for corporate card transactions.
     */
    async importBankFeed(tenantId: string, employeeId: string): Promise<CorporateCardTransaction[]> {
        console.log(`[CardFeed] Importing transactions for employee ${employeeId}...`);

        const mockTransactions: InsertCorporateCardTransaction[] = [
            {
                tenantId,
                employeeId,
                cardId: "VISA-9988",
                transactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                merchant: "Delta Airlines",
                amount: "450.00",
                currency: "USD",
                status: "UNRECONCILED",
                externalReference: "DELTA-TX-123456"
            },
            {
                tenantId,
                employeeId,
                cardId: "VISA-9988",
                transactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                merchant: "Marriott International",
                amount: "185.20",
                currency: "USD",
                status: "UNRECONCILED",
                externalReference: "MARRIOTT-REF-7788"
            }
        ];

        const results: CorporateCardTransaction[] = [];
        for (const data of mockTransactions) {
            const created = await storage.createCorporateCardTransaction(data);
            results.push(created);
        }

        return results;
    }

    /**
     * Heuristic matching between card transactions and manually entered expense lines.
     */
    async autoReconcile(tenantId: string, employeeId: string) {
        console.log(`[CardFeed] Running auto-reconciliation for ${employeeId}...`);

        const unreconciled = (await storage.listCorporateCardTransactions(tenantId, employeeId))
            .filter(t => t.status === "UNRECONCILED");

        // In a real Tier-1 ERP, this would match based on merchant fuzzy-match and amount within 1-2 day window
        // We simulate the logic here
        console.log(`[CardFeed] Analyzed ${unreconciled.length} transactions for matching.`);
    }
}

export const cardFeedService = new CardFeedService();
