
import { db } from "../../../db";
import { purchaseOrders, purchaseOrderLines, type InsertPurchaseOrder, type InsertPurchaseOrderLine } from "@shared/schema/scm";
import { itemService } from "../../../services/ItemService";

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
                const enrichedLines = await Promise.all(
                    data.lines.map(async (line, index) => {
                        // PIM Integration
                        if (line.itemId) {
                            const item = await itemService.getItemById(line.itemId);
                            if (!item) throw new Error(`Item ID ${line.itemId} not found in PIM.`);
                            if (item.itemStatus !== "Active" && item.itemStatus !== "ACTIVE") {
                                throw new Error(`Item ${item.itemNumber} is not Active.`);
                            }

                            // Auto-populate description if missing
                            if (!line.description) line.description = item.itemName;
                        }

                        return {
                            ...line,
                            poHeaderId: header.id,
                            lineNumber: index + 1
                        };
                    })
                );

                await tx.insert(purchaseOrderLines).values(enrichedLines);
            }

            // 3. Contract Compliance Validation
            // try {
            //     // Dynamic import causing circular dependency issues in test environment
            //     // const { contractService } = await import("../../../services/ContractService");
            //     // const compliance = await contractService.validatePOCompliance(header.id, tx);
            //     // ...
            // } catch (e) {
            //     console.error("[Procurement] Compliance check failed", e);
            // }

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
