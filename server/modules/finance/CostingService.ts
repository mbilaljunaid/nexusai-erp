
import { db } from "../../db";
import { cstTransactions } from "../../../shared/schema/costing";
import { eq } from "drizzle-orm";

export class CostingService {

    /**
     * Record COGS for Shipped Line
     */
    async recordCOGS(data: {
        itemId: string,
        quantity: number,
        orgId: string,
        orderId: string,
        lineId: string
    }) {
        // 1. Get Standard Cost (Stubbed: $50 fixed)
        const standardCost = 50.00;
        const totalCost = standardCost * data.quantity;

        // 2. Insert Transaction
        await db.insert(cstTransactions).values({
            transactionType: 'COGS',
            itemId: data.itemId,
            quantity: data.quantity.toString(),
            unitCost: standardCost.toString(),
            totalCost: totalCost.toString(),
            sourceType: 'ORDER',
            sourceId: data.orderId,
            sourceLineId: data.lineId,
            orgId: data.orgId,
            glStatus: 'PENDING'
        });

        console.log(`💰 COGS Recorded: Item ${data.itemId}, Qty ${data.quantity}, Cost $${totalCost}`);
        return { success: true };
    }
}

export const costingService = new CostingService();
