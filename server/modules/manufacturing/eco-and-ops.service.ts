import { db } from "../../db";
import { sql } from "drizzle-orm";

/** ECOService — MFG-OG-01: Engineering Change Order lifecycle */
export class ECOService {
    private nextEcoNumber(tenantId: string) { return `ECO-${Date.now().toString(36).toUpperCase()}`; }

    async createECO(params: {
        tenantId: string; title: string; description?: string; changeType?: string;
        priority?: string; requestedBy?: string; affectedItems?: any[]; affectedBoms?: any[];
    }) {
        const eco_number = this.nextEcoNumber(params.tenantId);
        const [r] = (await db.execute(sql`
            INSERT INTO eco_orders (tenant_id, eco_number, title, description, change_type, priority, requested_by, affected_items, affected_boms)
            VALUES (${params.tenantId}, ${eco_number}, ${params.title}, ${params.description ?? null},
                ${params.changeType ?? 'DESIGN'}, ${params.priority ?? 'MEDIUM'}, ${params.requestedBy ?? null},
                ${JSON.stringify(params.affectedItems ?? [])}::jsonb, ${JSON.stringify(params.affectedBoms ?? [])}::jsonb)
            RETURNING *
        `)) as any;
        return r;
    }

    async advance(ecoId: string, action: 'submit' | 'approve' | 'release' | 'implement' | 'cancel', actor: string, comments?: string) {
        const transitions: Record<string, { from: string; to: string; field: string }> = {
            submit: { from: 'Draft', to: 'Under_Review', field: 'requested_by' },
            approve: { from: 'Under_Review', to: 'Approved', field: 'approved_by' },
            release: { from: 'Approved', to: 'Released', field: 'released_by' },
            implement: { from: 'Released', to: 'Implemented', field: 'released_by' },
            cancel: { from: '%', to: 'Cancelled', field: 'reviewed_by' },
        };
        const t = transitions[action];
        if (!t) throw new Error(`Unknown action: ${action}`);
        await db.execute(sql`
            UPDATE eco_orders SET status = ${t.to}, approval_comments = COALESCE(${comments ?? null}, approval_comments)
            WHERE id = ${ecoId}
        `);
        return { ecoId, newStatus: t.to, actor };
    }

    async list(tenantId: string, status?: string, priority?: string) {
        let q = sql`SELECT * FROM eco_orders WHERE tenant_id = ${tenantId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (priority) q = sql`${q} AND priority = ${priority}`;
        return (await db.execute(sql`${q} ORDER BY created_at DESC LIMIT 200`) as any).rows;
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT status, priority, COUNT(*) AS count FROM eco_orders WHERE tenant_id = ${tenantId}
            GROUP BY status, priority ORDER BY status, priority
        `) as any).rows;
    }
}

/** OutsideProcessingService — MFG-OG-02 */
export class OutsideProcessingService {
    async createOp(params: {
        tenantId: string; workOrderId: string; operationName: string;
        supplierId?: string; supplierName?: string; serviceType?: string;
        qtySent: number; plannedCost?: number; sentDate?: string; expectedReturn?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO outside_processing_ops (tenant_id, work_order_id, operation_name, supplier_id, supplier_name, service_type, qty_sent, planned_cost, sent_date, expected_return, status)
            VALUES (${params.tenantId}, ${params.workOrderId}, ${params.operationName}, ${params.supplierId ?? null}, ${params.supplierName ?? null},
                ${params.serviceType ?? null}, ${params.qtySent}, ${params.plannedCost ?? null},
                ${params.sentDate ?? null}, ${params.expectedReturn ?? null}, 'Sent')
            RETURNING *
        `)) as any;
        return r;
    }

    async receiveBack(opId: string, qtyReceived: number, actualCost: number, qualityResult: string, notes?: string) {
        await db.execute(sql`
            UPDATE outside_processing_ops SET qty_received = ${qtyReceived}, actual_cost = ${actualCost},
                actual_return = CURRENT_DATE, quality_result = ${qualityResult},
                status = ${qualityResult === 'Fail' ? 'Inspected' : 'Returned'}, notes = ${notes ?? null}
            WHERE id = ${opId}
        `);
        return { opId, qtyReceived, qualityResult };
    }

    async list(tenantId: string, workOrderId?: string, status?: string) {
        let q = sql`SELECT * FROM outside_processing_ops WHERE tenant_id = ${tenantId}`;
        if (workOrderId) q = sql`${q} AND work_order_id = ${workOrderId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY created_at DESC LIMIT 200`) as any).rows;
    }

    async getVarianceReport(tenantId: string) {
        return (await db.execute(sql`
            SELECT supplier_name, service_type, COUNT(*) AS ops,
                SUM(planned_cost) AS planned, SUM(actual_cost) AS actual,
                SUM(actual_cost - planned_cost) AS variance,
                ROUND(AVG((actual_cost - planned_cost) / NULLIF(planned_cost, 0) * 100)::numeric, 1) AS variance_pct
            FROM outside_processing_ops WHERE tenant_id = ${tenantId} AND actual_cost IS NOT NULL
            GROUP BY supplier_name, service_type ORDER BY variance DESC
        `) as any).rows;
    }
}

/** CapacityPlanningService — MFG-OG-03 */
export class CapacityPlanningService {
    async upsertCapacity(params: {
        tenantId: string; workCenterId: string; workCenterName?: string;
        capacityDate: string; shift?: string; availableHours: number;
        plannedHours?: number; actualHours?: number; efficiencyPct?: number;
    }) {
        await db.execute(sql`
            INSERT INTO work_center_capacity (tenant_id, work_center_id, work_center_name, capacity_date, shift, available_hours, planned_hours, actual_hours, efficiency_pct)
            VALUES (${params.tenantId}, ${params.workCenterId}, ${params.workCenterName ?? null}, ${params.capacityDate},
                ${params.shift ?? 'DAY'}, ${params.availableHours}, ${params.plannedHours ?? 0}, ${params.actualHours ?? 0}, ${params.efficiencyPct ?? 100})
            ON CONFLICT (tenant_id, work_center_id, capacity_date, shift)
            DO UPDATE SET planned_hours = EXCLUDED.planned_hours, actual_hours = EXCLUDED.actual_hours, efficiency_pct = EXCLUDED.efficiency_pct
        `);
        return { workCenterId: params.workCenterId, date: params.capacityDate };
    }

    async getUtilization(tenantId: string, fromDate: string, toDate: string, workCenterId?: string) {
        let q = sql`
            SELECT work_center_id, work_center_name, capacity_date,
                SUM(available_hours) AS available, SUM(planned_hours) AS planned, SUM(actual_hours) AS actual,
                ROUND(SUM(actual_hours) / NULLIF(SUM(available_hours), 0) * 100, 1) AS utilization_pct,
                ROUND(SUM(planned_hours) / NULLIF(SUM(available_hours), 0) * 100, 1) AS load_pct
            FROM work_center_capacity WHERE tenant_id = ${tenantId} AND capacity_date BETWEEN ${fromDate} AND ${toDate}
        `;
        if (workCenterId) q = sql`${q} AND work_center_id = ${workCenterId}`;
        return (await db.execute(sql`${q} GROUP BY work_center_id, work_center_name, capacity_date ORDER BY capacity_date`) as any).rows;
    }

    async getBottlenecks(tenantId: string, fromDate: string, toDate: string) {
        return (await db.execute(sql`
            SELECT work_center_id, work_center_name,
                ROUND(AVG(actual_hours / NULLIF(available_hours, 0) * 100)::numeric, 1) AS avg_utilization_pct,
                SUM(GREATEST(planned_hours - available_hours, 0)) AS overload_hours
            FROM work_center_capacity WHERE tenant_id = ${tenantId} AND capacity_date BETWEEN ${fromDate} AND ${toDate}
            GROUP BY work_center_id, work_center_name
            HAVING AVG(actual_hours / NULLIF(available_hours, 0)) > 0.85
            ORDER BY avg_utilization_pct DESC
        `) as any).rows;
    }
}

/** WIPCostingService — MFG-OG-04 */
export class WIPCostingService {
    async postTransaction(params: {
        tenantId: string; workOrderId: string; transactionType: string;
        costElement?: string; quantity?: number; unitCost?: number;
        totalCost: number; glAccount?: string; reference?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO wip_cost_transactions (tenant_id, work_order_id, transaction_type, cost_element, quantity, unit_cost, total_cost, gl_account, reference)
            VALUES (${params.tenantId}, ${params.workOrderId}, ${params.transactionType}, ${params.costElement ?? null},
                ${params.quantity ?? null}, ${params.unitCost ?? null}, ${params.totalCost}, ${params.glAccount ?? null}, ${params.reference ?? null})
            RETURNING *
        `)) as any;
        return r;
    }

    async reverseTransaction(transactionId: string, tenantId: string) {
        const orig = (await db.execute(sql`SELECT * FROM wip_cost_transactions WHERE id = ${transactionId}`) as any).rows?.[0];
        if (!orig) throw new Error('Transaction not found');
        await db.execute(sql`UPDATE wip_cost_transactions SET reversed = TRUE WHERE id = ${transactionId}`);
        return this.postTransaction({ ...orig, tenantId, transactionType: 'REVERSAL', totalCost: -orig.total_cost, reference: `REV-${transactionId}` });
    }

    async getWorkOrderCost(tenantId: string, workOrderId: string) {
        return (await db.execute(sql`
            SELECT cost_element, transaction_type,
                SUM(total_cost) FILTER (WHERE NOT reversed) AS net_cost,
                COUNT(*) AS transactions
            FROM wip_cost_transactions WHERE tenant_id = ${tenantId} AND work_order_id = ${workOrderId}
            GROUP BY cost_element, transaction_type ORDER BY cost_element
        `) as any).rows;
    }

    async getWIPSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT work_order_id,
                SUM(total_cost) FILTER (WHERE NOT reversed) AS total_wip_cost,
                SUM(total_cost) FILTER (WHERE cost_element = 'DIRECT_MATERIAL' AND NOT reversed) AS material_cost,
                SUM(total_cost) FILTER (WHERE cost_element = 'DIRECT_LABOR' AND NOT reversed) AS labor_cost,
                SUM(total_cost) FILTER (WHERE cost_element LIKE '%OVERHEAD%' AND NOT reversed) AS overhead_cost
            FROM wip_cost_transactions WHERE tenant_id = ${tenantId}
            GROUP BY work_order_id ORDER BY total_wip_cost DESC LIMIT 100
        `) as any).rows;
    }
}

export const ecoService = new ECOService();
export const outsideProcessingService = new OutsideProcessingService();
export const capacityPlanningService = new CapacityPlanningService();
export const wipCostingService = new WIPCostingService();
