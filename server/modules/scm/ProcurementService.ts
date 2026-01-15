
import { db } from "../../db";
import { purchaseOrders, purchaseOrderLines, type InsertPurchaseOrder, type InsertPurchaseOrderLine } from "../../../shared/schema/scm";
import { eq } from "drizzle-orm";

export class ProcurementService {

    /**
     * Create a Purchase Order
     */
    async createPurchaseOrder(data: { header: InsertPurchaseOrder, lines: InsertPurchaseOrderLine[] }) {
        return await db.transaction(async (tx) => {
            // 1. Create Header
            const [header] = await tx.insert(purchaseOrders).values({
                ...data.header,
                orderNumber: data.header.orderNumber || `PO-${Date.now()}`,
                status: 'DRAFT'
            }).returning();

            // 2. Create Lines
            if (data.lines && data.lines.length > 0) {
                await tx.insert(purchaseOrderLines).values(data.lines.map((line, index) => ({
                    ...line,
                    poHeaderId: header.id,
                    lineNumber: index + 1
                })));
            }

            return header;
        });
    }

    /**
     * Get PO by ID
     */
    async getPurchaseOrder(id: string) {
        return await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).execute();
    }
}

export const procurementService = new ProcurementService();
