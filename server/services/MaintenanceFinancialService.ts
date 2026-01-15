
import { db } from "../db";
import { maintWorkOrders, maintWorkOrderCosts } from "../../shared/schema/index";
import { faAssetBooks, faTransactions } from "../../shared/schema/fixedAssets";
import { eq, sql, sum } from "drizzle-orm";

/**
 * Maintenance Financial Integration Service
 * Handles capitalization of maintenance costs to Fixed Assets.
 */
class MaintenanceFinancialService {

    /**
     * Capitalize Work Order Costs to Asset Book Value
     * Triggered for 'CAPITAL' or 'OVERHAUL' type Work Orders.
     */
    async capitalizeOverhaul(workOrderId: string) {
        // 1. Get WO Header
        const [wo] = await db.select().from(maintWorkOrders).where(eq(maintWorkOrders.id, workOrderId));
        if (!wo) throw new Error("Work Order not found");

        // 2. Calculate Total Costs (Direct)
        const costRes = await db.select({
            total: sum(maintWorkOrderCosts.totalCost)
        })
            .from(maintWorkOrderCosts)
            .where(eq(maintWorkOrderCosts.workOrderId, workOrderId));

        const totalCost = Number(costRes[0]?.total || 0);
        if (totalCost <= 0) return { success: false, message: "No costs to capitalize" };

        // 3. Find Asset Book(s) to update
        // In real ERP, we capitalization to a specific Book. Here we update all books for the asset.
        const books = await db.select().from(faAssetBooks).where(eq(faAssetBooks.assetId, wo.assetId));

        const transactions = [];
        for (const book of books) {
            // 4. Update Book Cost
            const newCost = Number(book.originalCost) + totalCost;
            const newRecoverable = Number(book.recoverableCost) + totalCost;

            await db.update(faAssetBooks)
                .set({
                    originalCost: newCost.toString(),
                    recoverableCost: newRecoverable.toString(),
                    updatedAt: new Date()
                })
                .where(eq(faAssetBooks.id, book.id));

            // 5. Create Transaction Record
            const [tx] = await db.insert(faTransactions).values({
                assetBookId: book.id,
                transactionType: "REVALUATION", // Or "ADJUSTMENT" / "CAPITAL_IMPROVEMENT"
                transactionDate: new Date(),
                amount: totalCost.toString(),
                description: `Overhaul Capitalization: WO ${wo.workOrderNumber}`,
                reference: `WO-${workOrderId}`,
                status: "POSTED"
            }).returning();

            transactions.push(tx);
        }

        return { success: true, totalCapitalized: totalCost, booksUpdated: books.length, transactions };
    }
}

export const maintenanceFinancialService = new MaintenanceFinancialService();
