import { db } from "../../db";
import { sql } from "drizzle-orm";

/** LotGenealogyService — MFG-OG-05 */
export class LotGenealogyService {
    async createLot(params: {
        tenantId: string; lotNumber: string; itemNumber: string; itemDescription?: string;
        lotType?: string; quantity: number; unitOfMeasure?: string; expiryDate?: string;
        supplierLot?: string; workOrderId?: string; parentLots?: any[];
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO lot_genealogy (tenant_id, lot_number, item_number, item_description, lot_type, quantity, unit_of_measure, expiry_date, supplier_lot, work_order_id, parent_lots)
            VALUES (${params.tenantId}, ${params.lotNumber}, ${params.itemNumber}, ${params.itemDescription ?? null},
                ${params.lotType ?? 'PRODUCTION'}, ${params.quantity}, ${params.unitOfMeasure ?? 'EA'},
                ${params.expiryDate ?? null}, ${params.supplierLot ?? null}, ${params.workOrderId ?? null},
                ${JSON.stringify(params.parentLots ?? [])}::jsonb)
            ON CONFLICT DO NOTHING RETURNING *
        `)) as any;
        return r ?? { message: 'Lot already exists' };
    }

    async addTraceEvent(lotNumber: string, tenantId: string, event: { event: string; qty: number; location?: string; by?: string }) {
        await db.execute(sql`
            UPDATE lot_genealogy
            SET trace_events = trace_events || ${JSON.stringify([{ ...event, at: new Date().toISOString() }])}::jsonb
            WHERE lot_number = ${lotNumber} AND tenant_id = ${tenantId}
        `);
        return { lotNumber, event };
    }

    async updateStatus(lotNumber: string, tenantId: string, status: string) {
        await db.execute(sql`UPDATE lot_genealogy SET status = ${status} WHERE lot_number = ${lotNumber} AND tenant_id = ${tenantId}`);
        return { lotNumber, status };
    }

    async getLot(lotNumber: string, tenantId: string) {
        return (await db.execute(sql`SELECT * FROM lot_genealogy WHERE lot_number = ${lotNumber} AND tenant_id = ${tenantId}`) as any).rows?.[0];
    }

    async traceUp(lotNumber: string, tenantId: string): Promise<any[]> {
        // Returns all ancestor lots (parent chain)
        const lot = await this.getLot(lotNumber, tenantId);
        if (!lot || !lot.parent_lots?.length) return [lot];
        const parents = await Promise.all(lot.parent_lots.map((p: any) => this.traceUp(p.lotNumber, tenantId)));
        return [lot, ...parents.flat()];
    }

    async traceDown(lotNumber: string, tenantId: string) {
        const descendants = await db.execute(sql`
            SELECT * FROM lot_genealogy WHERE tenant_id = ${tenantId}
            AND parent_lots @> ${JSON.stringify([{ lotNumber }])}::jsonb
        `);
        return (descendants as any).rows;
    }

    async list(tenantId: string, itemNumber?: string, status?: string, lotType?: string) {
        let q = sql`SELECT * FROM lot_genealogy WHERE tenant_id = ${tenantId}`;
        if (itemNumber) q = sql`${q} AND item_number = ${itemNumber}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (lotType) q = sql`${q} AND lot_type = ${lotType}`;
        return (await db.execute(sql`${q} ORDER BY created_at DESC LIMIT 300`) as any).rows;
    }

    async getExpiringLots(tenantId: string, daysAhead = 30) {
        return (await db.execute(sql`
            SELECT * FROM lot_genealogy WHERE tenant_id = ${tenantId} AND status = 'Active'
            AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ${daysAhead}::int
            ORDER BY expiry_date ASC
        `) as any).rows;
    }
}

/** QualityHoldService — MFG-OG-06 */
export class QualityHoldService {
    async initiateHold(params: {
        tenantId: string; holdType?: string; severity?: string; initiatedBy: string;
        affectedItems?: any[]; notes?: string;
    }) {
        const holdNumber = `QH-${Date.now().toString(36).toUpperCase()}`;
        const [r] = (await db.execute(sql`
            INSERT INTO quality_holds (tenant_id, hold_number, hold_type, severity, initiated_by, affected_items, notes)
            VALUES (${params.tenantId}, ${holdNumber}, ${params.holdType ?? 'MATERIAL'}, ${params.severity ?? 'MINOR'},
                ${params.initiatedBy}, ${JSON.stringify(params.affectedItems ?? [])}::jsonb, ${params.notes ?? null})
            RETURNING *
        `)) as any;
        // Auto-quarantine affected lots
        for (const item of (params.affectedItems ?? [])) {
            if (item.lot) {
                await db.execute(sql`UPDATE lot_genealogy SET status = 'Quarantine' WHERE lot_number = ${item.lot} AND tenant_id = ${params.tenantId}`);
            }
        }
        return r;
    }

    async review(holdId: string, reviewedBy: string, rootCause: string) {
        await db.execute(sql`
            UPDATE quality_holds SET status = 'Under_Disposition', reviewed_by = ${reviewedBy},
                root_cause = ${rootCause}, reviewed_at = NOW() WHERE id = ${holdId}
        `);
        return { holdId, status: 'Under_Disposition' };
    }

    async dispose(holdId: string, approvedBy: string, disposition: string, notes?: string) {
        await db.execute(sql`
            UPDATE quality_holds SET status = ${disposition === 'SCRAP' ? 'Scrapped' : disposition === 'REWORK' ? 'Rework' : 'Released'},
                disposition = ${disposition}, approved_by = ${approvedBy},
                disposition_at = NOW(), notes = COALESCE(${notes ?? null}, notes)
            WHERE id = ${holdId}
        `);
        return { holdId, disposition };
    }

    async list(tenantId: string, status?: string, severity?: string) {
        let q = sql`SELECT * FROM quality_holds WHERE tenant_id = ${tenantId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (severity) q = sql`${q} AND severity = ${severity}`;
        return (await db.execute(sql`${q} ORDER BY initiated_at DESC LIMIT 200`) as any).rows;
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT status, severity, COUNT(*) AS count FROM quality_holds WHERE tenant_id = ${tenantId}
            GROUP BY status, severity ORDER BY status, MIN(initiated_at) DESC
        `) as any).rows;
    }
}

/** PhysicalInventoryService — MFG-OG-07 */
export class PhysicalInventoryService {
    async createCycle(params: {
        tenantId: string; cycleName: string; cycleType?: string; countDate: string;
        locationFilter?: string; itemFilter?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO physical_inventory_cycles (tenant_id, cycle_name, cycle_type, count_date, location_filter, item_filter)
            VALUES (${params.tenantId}, ${params.cycleName}, ${params.cycleType ?? 'CYCLE_COUNT'},
                ${params.countDate}, ${params.locationFilter ?? null}, ${params.itemFilter ?? null})
            RETURNING *
        `)) as any;
        return r;
    }

    async addLines(cycleId: string, tenantId: string, lines: Array<{ itemNumber: string; location?: string; lotNumber?: string; bookQuantity: number; unitCost?: number }>) {
        for (const l of lines) {
            await db.execute(sql`
                INSERT INTO physical_inventory_lines (cycle_id, tenant_id, item_number, location, lot_number, book_quantity, unit_cost)
                VALUES (${cycleId}, ${tenantId}, ${l.itemNumber}, ${l.location ?? null}, ${l.lotNumber ?? null}, ${l.bookQuantity}, ${l.unitCost ?? null})
                ON CONFLICT DO NOTHING
            `);
        }
        return { cycleId, linesAdded: lines.length };
    }

    async recordCount(lineId: string, countQuantity: number, countedBy: string) {
        const varVal = await db.execute(sql`SELECT book_quantity, unit_cost FROM physical_inventory_lines WHERE id = ${lineId}`);
        const line = (varVal as any).rows?.[0];
        const variance_value = line ? (countQuantity - Number(line.book_quantity)) * Number(line.unit_cost ?? 0) : null;
        await db.execute(sql`
            UPDATE physical_inventory_lines SET count_quantity = ${countQuantity}, counted_by = ${countedBy},
                counted_at = NOW(), count_status = 'Counted',
                variance_value = ${variance_value}
            WHERE id = ${lineId}
        `);
        return { lineId, countQuantity, countedBy };
    }

    async approveCycle(cycleId: string, approvedBy: string) {
        await db.execute(sql`UPDATE physical_inventory_cycles SET status = 'Approved', approved_by = ${approvedBy}, approved_at = NOW() WHERE id = ${cycleId}`);
        return { cycleId, status: 'Approved' };
    }

    async getVarianceSummary(cycleId: string) {
        return (await db.execute(sql`
            SELECT item_number, location, lot_number, book_quantity, count_quantity,
                count_quantity - book_quantity AS variance_qty, variance_value, count_status
            FROM physical_inventory_lines WHERE cycle_id = ${cycleId}
            ORDER BY ABS(variance_value) DESC NULLS LAST LIMIT 200
        `) as any).rows;
    }

    async listCycles(tenantId: string, status?: string) {
        let q = sql`SELECT c.*, COUNT(l.id) AS line_count, COUNT(l.id) FILTER (WHERE l.count_status = 'Counted') AS counted_lines FROM physical_inventory_cycles c LEFT JOIN physical_inventory_lines l ON l.cycle_id = c.id WHERE c.tenant_id = ${tenantId}`;
        if (status) q = sql`${q} AND c.status = ${status}`;
        return (await db.execute(sql`${q} GROUP BY c.id ORDER BY c.count_date DESC`) as any).rows;
    }
}

/** ConsignmentService — MFG-OG-08 */
export class ConsignmentService {
    async upsertRecord(params: {
        tenantId: string; consignmentType?: string; partnerId: string; partnerName?: string;
        itemNumber: string; itemDescription?: string; location?: string;
        consignedQty: number; unitCost?: number; replenishmentPoint?: number; maxQty?: number;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO consignment_records (tenant_id, consignment_type, partner_id, partner_name, item_number, item_description, location, consigned_qty, unit_cost, replenishment_point, max_qty)
            VALUES (${params.tenantId}, ${params.consignmentType ?? 'CUSTOMER'}, ${params.partnerId}, ${params.partnerName ?? null},
                ${params.itemNumber}, ${params.itemDescription ?? null}, ${params.location ?? null},
                ${params.consignedQty}, ${params.unitCost ?? null}, ${params.replenishmentPoint ?? null}, ${params.maxQty ?? null})
            ON CONFLICT DO NOTHING RETURNING *
        `)) as any;
        return r;
    }

    async recordConsumption(recordId: string, qtyConsumed: number) {
        await db.execute(sql`
            UPDATE consignment_records SET consumed_qty = consumed_qty + ${qtyConsumed}, last_activity_at = NOW() WHERE id = ${recordId}
        `);
        // Flag replenishment needed
        await db.execute(sql`
            UPDATE consignment_records SET status = 'Replenishment_Needed'
            WHERE id = ${recordId} AND replenishment_point IS NOT NULL AND (consigned_qty - consumed_qty) <= replenishment_point
        `);
        return { recordId, qtyConsumed };
    }

    async replenish(recordId: string, qtyAdded: number) {
        await db.execute(sql`
            UPDATE consignment_records SET consigned_qty = consigned_qty + ${qtyAdded}, status = 'Active', last_activity_at = NOW() WHERE id = ${recordId}
        `);
        return { recordId, qtyAdded };
    }

    async list(tenantId: string, consignmentType?: string, status?: string) {
        let q = sql`SELECT * FROM consignment_records WHERE tenant_id = ${tenantId}`;
        if (consignmentType) q = sql`${q} AND consignment_type = ${consignmentType}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY partner_name, item_number`) as any).rows;
    }

    async getReplenishmentAlerts(tenantId: string) {
        return (await db.execute(sql`
            SELECT * FROM consignment_records WHERE tenant_id = ${tenantId} AND status = 'Replenishment_Needed'
            ORDER BY (consigned_qty - consumed_qty) ASC
        `) as any).rows;
    }

    async getConsumptionSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT partner_name, consignment_type, COUNT(*) AS items,
                SUM(consumed_qty * unit_cost) AS consumed_value,
                SUM((consigned_qty - consumed_qty) * unit_cost) AS on_hand_value
            FROM consignment_records WHERE tenant_id = ${tenantId}
            GROUP BY partner_name, consignment_type ORDER BY consumed_value DESC
        `) as any).rows;
    }
}

export const lotGenealogyService = new LotGenealogyService();
export const qualityHoldService = new QualityHoldService();
export const physicalInventoryService = new PhysicalInventoryService();
export const consignmentService = new ConsignmentService();
