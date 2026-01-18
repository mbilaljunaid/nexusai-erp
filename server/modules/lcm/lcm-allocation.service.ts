
import { db } from "@db";
import { lcmAllocations, lcmCharges, lcmShipmentLines, lcmCostComponents, lcmTradeOperations } from "@shared/schema/lcm";
import { eq, inArray, sql, sum } from "drizzle-orm";

export class LcmAllocationService {

    /**
     * Allocates all charges for a given Trade Operation
     * @param tradeOpId 
     */
    async allocateTradeOperation(tradeOpId: string) {
        return await db.transaction(async (tx) => {
            // 1. Fetch Charges
            const charges = await tx.select().from(lcmCharges).where(eq(lcmCharges.tradeOperationId, tradeOpId));
            if (charges.length === 0) return { allocated: 0, message: "No charges found" };

            // 2. Fetch Shipment Lines
            const lines = await tx.select().from(lcmShipmentLines).where(eq(lcmShipmentLines.tradeOperationId, tradeOpId));
            if (lines.length === 0) throw new Error("No shipment lines to allocate to.");

            // 3. Clear existing allocations for this Trade Op (via charges)
            const chargeIds = charges.map(c => c.id);
            if (chargeIds.length > 0) {
                await tx.delete(lcmAllocations).where(inArray(lcmAllocations.chargeId, chargeIds));
            }

            // 4. Process Each Charge
            const createdAllocations = [];
            for (const charge of charges) {
                const component = await tx.select().from(lcmCostComponents).where(eq(lcmCostComponents.id, charge.costComponentId)).limit(1);
                const allocationBasis = component[0]?.allocationBasis || 'VALUE';

                const result = await this.distributeCharge(tx, charge, lines, allocationBasis);
                createdAllocations.push(...result);
            }

            // 5. Insert ALL allocations in bulk
            if (createdAllocations.length > 0) {
                await tx.insert(lcmAllocations).values(createdAllocations);
            }

            // 6. Update Trade Op Status? Optional.

            return { allocated: createdAllocations.length };
        });
    }

    private async distributeCharge(tx: any, charge: any, lines: any[], basis: string) {
        // Calculate Total Basis
        let totalBasis = 0;
        const lineBasics = lines.map(line => {
            let val = 0;
            if (basis === 'QUANTITY') val = Number(line.quantity) || 0;
            else if (basis === 'WEIGHT') val = Number(line.netWeight) || 0;
            else if (basis === 'VOLUME') val = Number(line.volume) || 0;
            // 'VALUE' basis implies standard cost or PO price. 
            // Since we don't have PO Line Price snapshot in snippet, we assume Qty for now or implement Value logic later.
            // For Phase 34 scope, let's treat VALUE as 1 for simplicity or fallback to Qty.
            // Actually, let's fallback to Qty if Value data missing, but note it.
            else val = Number(line.quantity) || 0;

            totalBasis += val;
            return { ...line, _basis: val };
        });

        if (totalBasis === 0) throw new Error(`Total Basis for ${basis} is 0. Cannot allocate.`);

        // Distribute
        const amount = Number(charge.amount);
        let distributedSoFar = 0;
        const allocations = [];

        for (let i = 0; i < lineBasics.length; i++) {
            const line = lineBasics[i];
            const isLast = i === lineBasics.length - 1;

            let allocatedAmount = 0;
            if (isLast) {
                // Rounding Plug
                allocatedAmount = amount - distributedSoFar;
            } else {
                const ratio = line._basis / totalBasis;
                allocatedAmount = Math.round((amount * ratio) * 100) / 100; // 2 decimal round
                distributedSoFar += allocatedAmount;
            }

            allocations.push({
                chargeId: charge.id,
                shipmentLineId: line.id,
                amount: allocatedAmount.toFixed(2),
                basisValue: line._basis.toString()
            });
        }

        return allocations;
    }

    // List Allocations for viewing
    async listAllocations(tradeOpId: string) {
        // We need to join with Charges and Lines to get readable info
        const results = await db.select({
            allocationId: lcmAllocations.id,
            chargeAmount: lcmCharges.amount,
            allocatedAmount: lcmAllocations.amount,
            basisValue: lcmAllocations.basisValue,
            componentName: lcmCostComponents.name,
            lineQty: lcmShipmentLines.quantity
        })
            .from(lcmAllocations)
            .innerJoin(lcmCharges, eq(lcmAllocations.chargeId, lcmCharges.id))
            .innerJoin(lcmCostComponents, eq(lcmCharges.costComponentId, lcmCostComponents.id))
            .innerJoin(lcmShipmentLines, eq(lcmAllocations.shipmentLineId, lcmShipmentLines.id))
            .where(eq(lcmCharges.tradeOperationId, tradeOpId));

        return results;
    }
}

export const lcmAllocationService = new LcmAllocationService();
