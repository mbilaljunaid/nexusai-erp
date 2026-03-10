import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * DirectedPutawayService — WMS-OG-01
 *
 * Implements directed putaway:
 * 1. Evaluate putaway rules by priority (lower number = higher priority)
 * 2. Match against item attributes (category, temp class, hazmat)
 * 3. Find an available bin in preferred zone that meets capacity
 * 4. If no capacity in preferred zone, try overflow zone
 * 5. Create a PUTAWAY task assigned to the bin
 * 6. Operator confirms to complete: bin availability updated
 */
export class DirectedPutawayService {

    // ─── Zone & Bin Management ────────────────────────────────────────────────

    async createZone(params: {
        tenantId: string;
        warehouseId: string;
        zoneCode: string;
        zoneName: string;
        zoneType?: string;
        tempMinC?: number;
        tempMaxC?: number;
    }) {
        const [zone] = (await db.execute(sql`
            INSERT INTO wh_zones (tenant_id, warehouse_id, zone_code, zone_name, zone_type, temp_min_c, temp_max_c)
            VALUES (${params.tenantId}, ${params.warehouseId}, ${params.zoneCode}, ${params.zoneName},
                    ${params.zoneType ?? 'BULK'}, ${params.tempMinC ?? null}, ${params.tempMaxC ?? null})
            ON CONFLICT (tenant_id, warehouse_id, zone_code) DO UPDATE SET zone_name = EXCLUDED.zone_name
            RETURNING *
        `)) as any;
        return zone;
    }

    async createBin(params: {
        tenantId: string;
        warehouseId: string;
        zoneId: string;
        binCode: string;
        binType?: string;
        maxWeightKg?: number;
        maxVolumeM3?: number;
    }) {
        const [bin] = (await db.execute(sql`
            INSERT INTO wh_bin_locations (tenant_id, warehouse_id, zone_id, bin_code, bin_type, max_weight_kg, max_volume_m3)
            VALUES (${params.tenantId}, ${params.warehouseId}, ${params.zoneId}, ${params.binCode},
                    ${params.binType ?? 'STANDARD'}, ${params.maxWeightKg ?? null}, ${params.maxVolumeM3 ?? null})
            ON CONFLICT (tenant_id, warehouse_id, bin_code) DO NOTHING
            RETURNING *
        `)) as any;
        return bin;
    }

    async listZones(tenantId: string, warehouseId: string) {
        return (await db.execute(sql`
            SELECT z.*, COUNT(b.id) AS bin_count,
                   COUNT(b.id) FILTER (WHERE b.is_available) AS available_bins
            FROM wh_zones z
            LEFT JOIN wh_bin_locations b ON b.zone_id = z.id
            WHERE z.tenant_id = ${tenantId} AND z.warehouse_id = ${warehouseId} AND z.is_active = TRUE
            GROUP BY z.id ORDER BY z.zone_code
        `) as any).rows;
    }

    async listBins(tenantId: string, warehouseId: string, zoneId?: string, availableOnly = false) {
        let query = sql`
            SELECT b.*, z.zone_code, z.zone_type FROM wh_bin_locations b
            JOIN wh_zones z ON z.id = b.zone_id
            WHERE b.tenant_id = ${tenantId} AND b.warehouse_id = ${warehouseId}
        `;
        if (zoneId) query = sql`${query} AND b.zone_id = ${zoneId}`;
        if (availableOnly) query = sql`${query} AND b.is_available = TRUE`;
        query = sql`${query} ORDER BY b.bin_code LIMIT 500`;
        return (await db.execute(query) as any).rows;
    }

    // ─── Putaway Rules ────────────────────────────────────────────────────────

    async createRule(params: {
        tenantId: string;
        warehouseId: string;
        ruleName: string;
        priority?: number;
        matchItemCategory?: string;
        matchTempClass?: string;
        matchHazmat?: boolean;
        preferredZoneId?: string;
        preferredBinType?: string;
        overflowZoneId?: string;
    }) {
        const [rule] = (await db.execute(sql`
            INSERT INTO putaway_rules (
                tenant_id, warehouse_id, rule_name, priority,
                match_item_category, match_temp_class, match_hazmat,
                preferred_zone_id, preferred_bin_type, overflow_zone_id
            ) VALUES (
                ${params.tenantId}, ${params.warehouseId}, ${params.ruleName}, ${params.priority ?? 50},
                ${params.matchItemCategory ?? null}, ${params.matchTempClass ?? null},
                ${params.matchHazmat ?? null}, ${params.preferredZoneId ?? null},
                ${params.preferredBinType ?? null}, ${params.overflowZoneId ?? null}
            ) RETURNING *
        `)) as any;
        return rule;
    }

    async listRules(tenantId: string, warehouseId: string) {
        return (await db.execute(sql`
            SELECT r.*, z1.zone_code AS preferred_zone, z2.zone_code AS overflow_zone
            FROM putaway_rules r
            LEFT JOIN wh_zones z1 ON z1.id = r.preferred_zone_id
            LEFT JOIN wh_zones z2 ON z2.id = r.overflow_zone_id
            WHERE r.tenant_id = ${tenantId} AND r.warehouse_id = ${warehouseId} AND r.is_active = TRUE
            ORDER BY r.priority ASC
        `) as any).rows;
    }

    // ─── Core Directed Putaway Engine ─────────────────────────────────────────

    async createPutawayTask(params: {
        tenantId: string;
        warehouseId: string;
        receiptId?: string;
        lpn: string;
        itemId: string;
        qty: number;
        tempClass?: string;
        isHazmat?: boolean;
        itemCategory?: string;
        weightKg?: number;
        operatorId?: string;
    }) {
        const tempClass = params.tempClass ?? 'AMBIENT';
        const isHazmat = params.isHazmat ?? false;

        // Load priority-sorted rules for this warehouse
        const rules = (await db.execute(sql`
            SELECT * FROM putaway_rules
            WHERE tenant_id = ${params.tenantId} AND warehouse_id = ${params.warehouseId} AND is_active = TRUE
            ORDER BY priority ASC
        `) as any).rows ?? [];

        let matchedRule: any = null;
        let assignedBin: any = null;

        for (const rule of rules) {
            // Check rule conditions
            const catMatch = !rule.match_item_category || rule.match_item_category === params.itemCategory;
            const tempMatch = !rule.match_temp_class || rule.match_temp_class === tempClass;
            const hazMatch = rule.match_hazmat === null || rule.match_hazmat === isHazmat;

            if (!catMatch || !tempMatch || !hazMatch) continue;

            matchedRule = rule;

            // Try preferred zone first
            if (rule.preferred_zone_id) {
                const bin = await this._findAvailableBin(params.tenantId, params.warehouseId, rule.preferred_zone_id, rule.preferred_bin_type, params.weightKg);
                if (bin) { assignedBin = bin; break; }
            }

            // Try overflow zone
            if (rule.overflow_zone_id) {
                const bin = await this._findAvailableBin(params.tenantId, params.warehouseId, rule.overflow_zone_id, null, params.weightKg);
                if (bin) { assignedBin = bin; break; }
            }
        }

        // Fallback: any available bin in warehouse
        if (!assignedBin) {
            const fallback = (await db.execute(sql`
                SELECT b.* FROM wh_bin_locations b
                JOIN wh_zones z ON z.id = b.zone_id
                WHERE b.tenant_id = ${params.tenantId} AND b.warehouse_id = ${params.warehouseId}
                  AND b.is_available = TRUE AND z.is_active = TRUE
                ORDER BY b.lpn_count ASC LIMIT 1
            `) as any).rows?.[0];
            if (fallback) assignedBin = fallback;
        }

        const [task] = (await db.execute(sql`
            INSERT INTO putaway_tasks (
                tenant_id, warehouse_id, receipt_id, lpn, item_id, qty,
                temp_class, is_hazmat, item_category, rule_id, assigned_bin_id,
                status, operator_id
            ) VALUES (
                ${params.tenantId}, ${params.warehouseId}, ${params.receiptId ?? null},
                ${params.lpn}, ${params.itemId}, ${params.qty}, ${tempClass}, ${isHazmat},
                ${params.itemCategory ?? null}, ${matchedRule?.id ?? null},
                ${assignedBin?.id ?? null},
                ${assignedBin ? 'Assigned' : 'Exception'},
                ${params.operatorId ?? null}
            ) RETURNING *
        `)) as any;

        // Reserve the bin
        if (assignedBin) {
            await db.execute(sql`
                UPDATE wh_bin_locations SET is_available = FALSE, lpn_count = lpn_count + 1
                WHERE id = ${assignedBin.id}
            `);
        }

        return {
            task,
            assignedBin,
            matchedRule,
            status: assignedBin ? 'Assigned' : 'Exception',
            message: assignedBin ? `Bin ${assignedBin.bin_code} assigned` : 'No bin available — manual assignment required',
        };
    }

    async completePutaway(taskId: string, operatorId?: string) {
        const task = (await db.execute(sql`SELECT * FROM putaway_tasks WHERE id = ${taskId}`) as any).rows?.[0];
        if (!task) throw new Error('Task not found');
        if (task.status === 'Complete') return { taskId, status: 'AlreadyComplete' };

        await db.execute(sql`
            UPDATE putaway_tasks
            SET status = 'Complete', operator_id = COALESCE(${operatorId ?? null}, operator_id), completed_at = NOW()
            WHERE id = ${taskId}
        `);
        return { taskId, status: 'Complete', binCode: (await db.execute(sql`SELECT bin_code FROM wh_bin_locations WHERE id = ${task.assigned_bin_id}`) as any).rows?.[0]?.bin_code };
    }

    async getPendingTasks(tenantId: string, warehouseId: string) {
        return (await db.execute(sql`
            SELECT t.*, b.bin_code, z.zone_code FROM putaway_tasks t
            LEFT JOIN wh_bin_locations b ON b.id = t.assigned_bin_id
            LEFT JOIN wh_zones z ON z.id = b.zone_id
            WHERE t.tenant_id = ${tenantId} AND t.warehouse_id = ${warehouseId}
              AND t.status IN ('Pending', 'Assigned', 'InProgress')
            ORDER BY t.created_at ASC
        `) as any).rows;
    }

    async getUtilizationReport(tenantId: string, warehouseId: string) {
        return (await db.execute(sql`
            SELECT z.zone_code, z.zone_type,
                   COUNT(b.id) AS total_bins,
                   COUNT(b.id) FILTER (WHERE b.is_available) AS free_bins,
                   ROUND(100.0 * COUNT(b.id) FILTER (WHERE NOT b.is_available) / NULLIF(COUNT(b.id), 0), 2) AS utilization_pct
            FROM wh_zones z
            LEFT JOIN wh_bin_locations b ON b.zone_id = z.id
            WHERE z.tenant_id = ${tenantId} AND z.warehouse_id = ${warehouseId} AND z.is_active = TRUE
            GROUP BY z.id, z.zone_code, z.zone_type
            ORDER BY utilization_pct DESC NULLS LAST
        `) as any).rows;
    }

    private async _findAvailableBin(tenantId: string, warehouseId: string, zoneId: string, binType: string | null, weightKg?: number) {
        let q = sql`
            SELECT * FROM wh_bin_locations
            WHERE tenant_id = ${tenantId} AND warehouse_id = ${warehouseId}
              AND zone_id = ${zoneId} AND is_available = TRUE
        `;
        if (binType) q = sql`${q} AND bin_type = ${binType}`;
        if (weightKg) q = sql`${q} AND (max_weight_kg IS NULL OR max_weight_kg >= ${weightKg})`;
        q = sql`${q} ORDER BY lpn_count ASC LIMIT 1`;
        return (await db.execute(q) as any).rows?.[0] ?? null;
    }
}

export const directedPutawayService = new DirectedPutawayService();
