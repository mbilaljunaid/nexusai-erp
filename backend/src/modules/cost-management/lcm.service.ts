import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../database/drizzle.provider';
import * as schema from '../../../../shared/schema';

@Injectable()
export class LcmService {
    private readonly logger = new Logger(LcmService.name);

    constructor(
        @Inject(DRIZZLE_DB) private db: NodePgDatabase<typeof schema>
    ) { }

    /**
     * Allocates charges from a PO to a Receipt.
     * Returns a list of allocated amounts per Receipt Line.
     */
    async allocateChargesToReceipt(receipt: any): Promise<Map<string, number>> {
        // receipt type is 'Receipt' entity but using any to avoid import cycles for now if complex.
        // Assuming receipt has lines and link to PO.

        if (!receipt.purchaseOrder) {
            this.logger.warn(`Receipt ${receipt.receiptNumber} has no PO link. Skiping LCM.`);
            return new Map();
        }

        const charges = await this.db.select()
            .from(schema.cstLandedCosts)
            .where(eq(schema.cstLandedCosts.purchaseOrderId, receipt.purchaseOrder.id));

        if (charges.length === 0) {
            return new Map();
        }

        const allocationMap = new Map<string, number>(); // LineID -> TotalAllocatedCost

        // Calculate Totals for Basis
        const totalQty = receipt.lines.reduce((sum: number, line: any) => sum + Number(line.quantityShipped), 0);
        const totalValue = receipt.lines.reduce((sum: number, line: any) => sum + (Number(line.quantityShipped) * Number(line.unitPrice)), 0);

        for (const charge of charges) {
            this.logger.log(`Allocating Charge ${charge.chargeType} ($${charge.amount}) via ${charge.allocationBasis}`);

            for (const line of receipt.lines) {
                let ratio = 0;
                if (charge.allocationBasis === 'Quantity') {
                    ratio = totalQty > 0 ? Number(line.quantityShipped) / totalQty : 0;
                } else if (charge.allocationBasis === 'Value') {
                    const lineVal = Number(line.quantityShipped) * Number(line.unitPrice);
                    ratio = totalValue > 0 ? lineVal / totalValue : 0;
                }

                const allocatedAmt = Number(charge.amount) * ratio;

                const current = allocationMap.get(line.id) || 0;
                allocationMap.set(line.id, current + allocatedAmt);
            }
        }

        return allocationMap;
    }
}
