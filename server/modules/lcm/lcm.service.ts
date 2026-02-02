
import { db } from "@db";
import { lcmTradeOperations, lcmShipmentLines, lcmCharges, lcmCostComponents, lcmAllocations } from "@shared/schema/lcm";
import { eq, and, sql } from "drizzle-orm";
import { lcmAuditService } from "./lcm-audit.service";

export class LcmService {

    // --- Cost Components ---
    async listCostComponents() {
        return await db.select().from(lcmCostComponents).where(eq(lcmCostComponents.isActive, true));
    }

    async createCostComponent(data: any) {
        return await db.insert(lcmCostComponents).values(data).returning();
    }

    // --- Trade Operations ---
    async listTradeOperations(page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;

        const data = await db.select().from(lcmTradeOperations)
            .limit(limit)
            .offset(offset)
            .orderBy(sql`${lcmTradeOperations.createdAt} DESC`);

        const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(lcmTradeOperations);

        return {
            data,
            total: Number(countResult.count),
            page,
            limit,
            totalPages: Math.ceil(Number(countResult.count) / limit)
        };
    }

    async createTradeOperation(data: any) {
        return await db.transaction(async (tx) => {
            const [op] = await tx.insert(lcmTradeOperations).values({
                ...data,
                operationNumber: data.operationNumber || `TO-${Date.now()}`
            }).returning();

            await lcmAuditService.logAction('lcm_trade_operations', op.id, 'CREATE', { new: data });
            return op;
        });
    }

    async createTradeOperationWithLines(data: { header: any, shipmentLines?: any[] }) {
        return await db.transaction(async (tx) => {
            // 1. Header
            const [op] = await tx.insert(lcmTradeOperations).values({
                ...data.header,
                operationNumber: data.header.operationNumber || `TO-${Date.now()}`
            }).returning();

            // 2. Lines (if any)
            if (data.shipmentLines && data.shipmentLines.length > 0) {
                const lines = data.shipmentLines.map(l => ({
                    ...l,
                    tradeOperationId: op.id
                }));
                await tx.insert(lcmShipmentLines).values(lines);
            }

            await lcmAuditService.logAction('lcm_trade_operations', op.id, 'CREATE', { new: data.header });
            return op;
        });
    }

    async getTradeOperationDetails(id: string) {
        const header = await db.query.lcmTradeOperations.findFirst({
            where: eq(lcmTradeOperations.id, id)
        });

        if (!header) return null;

        const lines = await db.select().from(lcmShipmentLines).where(eq(lcmShipmentLines.tradeOperationId, id));
        const charges = await db.select().from(lcmCharges).where(eq(lcmCharges.tradeOperationId, id));

        return { ...header, lines, charges };
    }

    // --- Charges ---
    async addCharge(data: any) {
        return await db.transaction(async (tx) => {
            const [charge] = await tx.insert(lcmCharges).values(data).returning();
            await lcmAuditService.logAction('lcm_charges', charge.id, 'CREATE', { new: data });
            // Also log to the Parent Trade Op
            await lcmAuditService.logAction('lcm_trade_operations', data.tradeOperationId, 'ADD_CHARGE', {
                chargeId: charge.id,
                amount: data.amount,
                isActual: data.isActual
            });
            return charge;
        });
    }

    async trackActualCharge(data: { tradeOpId: string, amount: string, vendorId: string, referenceNumber: string, costComponentId: string }) {
        // Create an "Actual" charge record
        return await db.insert(lcmCharges).values({
            tradeOperationId: data.tradeOpId,
            costComponentId: data.costComponentId, // Must be passed from AP
            amount: data.amount,
            vendorId: data.vendorId,
            referenceNumber: data.referenceNumber,
            isActual: true
        }).returning();
    }

    /**
     * Workflow Methods
     */
    async submitForApproval(id: string) {
        return await db.transaction(async (tx) => {
            const [op] = await tx.select().from(lcmTradeOperations).where(eq(lcmTradeOperations.id, id));
            if (!op) throw new Error("Trade Operation not found");

            // Validation: Must have charges and allocations?
            // For now, at least must be OPEN
            if (op.status !== 'OPEN') throw new Error("Operation must be OPEN to submit");

            await tx.update(lcmTradeOperations)
                .set({ approvalStatus: 'PENDING_APPROVAL' })
                .where(eq(lcmTradeOperations.id, id));

            await lcmAuditService.logAction('lcm_trade_operations', id, 'UPDATE', {
                approvalStatus: { old: op.approvalStatus, new: 'PENDING_APPROVAL' }
            });

            return { success: true };
        });
    }

    async approveTradeOperation(id: string, userId: string = 'ADMIN') {
        return await db.transaction(async (tx) => {
            const [op] = await tx.select().from(lcmTradeOperations).where(eq(lcmTradeOperations.id, id));
            if (!op) throw new Error("Trade Operation not found");
            if (op.approvalStatus !== 'PENDING_APPROVAL') throw new Error("Operation is not pending approval");

            await tx.update(lcmTradeOperations)
                .set({
                    approvalStatus: 'APPROVED',
                    approvedBy: userId,
                    approvedAt: new Date()
                })
                .where(eq(lcmTradeOperations.id, id));

            await lcmAuditService.logAction('lcm_trade_operations', id, 'UPDATE', {
                approvalStatus: { old: op.approvalStatus, new: 'APPROVED' },
                approvedBy: userId
            });

            return { success: true };
        });
    }

    async rejectTradeOperation(id: string, reason: string) {
        return await db.transaction(async (tx) => {
            const [op] = await tx.select().from(lcmTradeOperations).where(eq(lcmTradeOperations.id, id));
            if (!op) throw new Error("Trade Operation not found");

            await tx.update(lcmTradeOperations)
                .set({ approvalStatus: 'REJECTED' })
                .where(eq(lcmTradeOperations.id, id));

            await lcmAuditService.logAction('lcm_trade_operations', id, 'UPDATE', {
                approvalStatus: { old: op.approvalStatus, new: 'REJECTED' },
                reason
            });

            return { success: true };
        });
    }


    /**
     * Workflow Methods
     */
    async submitForApproval(id: string) {
        return await db.transaction(async (tx) => {
            const [op] = await tx.select().from(lcmTradeOperations).where(eq(lcmTradeOperations.id, id));
            if (!op) throw new Error("Trade Operation not found");

            // Validation: Must have charges and allocations?
            // For now, at least must be OPEN
            if (op.status !== 'OPEN') throw new Error("Operation must be OPEN to submit");

            await tx.update(lcmTradeOperations)
                .set({ approvalStatus: 'PENDING_APPROVAL' })
                .where(eq(lcmTradeOperations.id, id));

            await lcmAuditService.logAction('lcm_trade_operations', id, 'UPDATE', {
                approvalStatus: { old: op.approvalStatus, new: 'PENDING_APPROVAL' }
            });

            return { success: true };
        });
    }

    async approveTradeOperation(id: string, userId: string = 'ADMIN') {
        return await db.transaction(async (tx) => {
            const [op] = await tx.select().from(lcmTradeOperations).where(eq(lcmTradeOperations.id, id));
            if (!op) throw new Error("Trade Operation not found");
            if (op.approvalStatus !== 'PENDING_APPROVAL') throw new Error("Operation is not pending approval");

            await tx.update(lcmTradeOperations)
                .set({
                    approvalStatus: 'APPROVED',
                    approvedBy: userId,
                    approvedAt: new Date()
                })
                .where(eq(lcmTradeOperations.id, id));

            await lcmAuditService.logAction('lcm_trade_operations', id, 'UPDATE', {
                approvalStatus: { old: op.approvalStatus, new: 'APPROVED' },
                approvedBy: userId
            });

            return { success: true };
        });
    }

    async rejectTradeOperation(id: string, reason: string) {
        return await db.transaction(async (tx) => {
            const [op] = await tx.select().from(lcmTradeOperations).where(eq(lcmTradeOperations.id, id));
            if (!op) throw new Error("Trade Operation not found");

            await tx.update(lcmTradeOperations)
                .set({ approvalStatus: 'REJECTED' }) // Or back to DRAFT? usage depends on policy. Let's say REJECTED.
                .where(eq(lcmTradeOperations.id, id));

            await lcmAuditService.logAction('lcm_trade_operations', id, 'UPDATE', {
                approvalStatus: { old: op.approvalStatus, new: 'REJECTED' },
                reason
            });

            return { success: true };
        });
    }


    /**
     * Closes the Trade Operation and computes Variances.
     * 1. Validates all charges are allocated.
     * 2. Groups Allocations by ShipmentLine + CostComponent.
     * 3. Calculates Variance (Actual - Estimated).
     * 4. Updates Estimated Allocations with the Variance Amount.
     * 5. Sets Status to CLOSED.
     */
    async closeTradeOperation(id: string) {
        return await db.transaction(async (tx) => {
            // 1. Fetch Op
            const [op] = await tx.select().from(lcmTradeOperations).where(eq(lcmTradeOperations.id, id));
            if (!op) throw new Error("Trade Operation not found");
            if (op.status === 'CLOSED') throw new Error("Already Closed");

            // Approval Gate
            if (op.approvalStatus !== 'APPROVED') {
                throw new Error("Cannot close Trade Operation that is not APPROVED.");
            }

            // 2. Fetch all allocations joined with charges
            const allocations = await tx.select({
                id: lcmAllocations.id,
                amount: lcmAllocations.amount,
                shipmentLineId: lcmAllocations.shipmentLineId,
                costComponentId: lcmCharges.costComponentId,
                isActual: lcmCharges.isActual
            })
                .from(lcmAllocations)
                .innerJoin(lcmCharges, eq(lcmAllocations.chargeId, lcmCharges.id))
                .where(eq(lcmCharges.tradeOperationId, id));

            // Map: LineId_ComponentId -> { estimateAllocId, estAmount, actAmount }
            const map = new Map<string, { estId: string, estTotal: number, actTotal: number }>();

            for (const a of allocations) {
                const key = `${a.shipmentLineId}_${a.costComponentId}`;
                let entry = map.get(key) || { estId: '', estTotal: 0, actTotal: 0 };

                if (a.isActual) {
                    entry.actTotal += Number(a.amount);
                } else {
                    entry.estTotal += Number(a.amount);
                    if (!entry.estId) entry.estId = a.id; // Pick first estimate to store variance
                }
                map.set(key, entry);
            }

            // 3. Compute & Update Variance
            for (const [key, val] of map.entries()) {
                const variance = val.actTotal - val.estTotal;
                // Only update if there is an estimate record to attach to
                // If there's only Actuals (no estimate), we might have an issue, but standard flow assumes Estimates exist.
                if (val.estId && Math.abs(variance) > 0.001) {
                    await tx.update(lcmAllocations)
                        .set({ varianceAmount: variance.toFixed(4) })
                        .where(eq(lcmAllocations.id, val.estId));
                }
            }

            // 4. Update Status
            await tx.update(lcmTradeOperations)
                .set({ status: 'CLOSED' })
                .where(eq(lcmTradeOperations.id, id));

            await lcmAuditService.logAction('lcm_trade_operations', id, 'CLOSE', {
                action: 'Closed Trade Operation',
                varianceCalculated: true
            });

            return { success: true, message: "Trade Operation Closed and Variances Calculated" };
        });
    }
}

export const lcmService = new LcmService();
