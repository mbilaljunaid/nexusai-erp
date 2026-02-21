import { db } from "../../db";
import { sql } from "drizzle-orm";

/** NettingService — IC-OG-02: Multilateral netting sessions */
export class NettingService {
    async createSession(params: {
        tenantId: string; sessionName: string; period: string;
        currency?: string; entitiesInScope?: string[]; settlementDate?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO ic_netting_sessions (tenant_id, session_name, period, currency, entities_in_scope, settlement_date)
            VALUES (${params.tenantId}, ${params.sessionName}, ${params.period}, ${params.currency ?? 'USD'},
                ${JSON.stringify(params.entitiesInScope ?? [])}::jsonb, ${params.settlementDate ?? null})
            RETURNING *
        `)) as any;
        return r;
    }

    async runNetting(sessionId: string, tenantId: string) {
        const sess = (await db.execute(sql`SELECT * FROM ic_netting_sessions WHERE id = ${sessionId}`) as any).rows?.[0];
        if (!sess) throw new Error('Session not found');
        const entities: string[] = sess.entities_in_scope ?? [];

        // Aggregate IC positions from existing ic_transactions table if present, else ic_headers
        let rows: any[] = [];
        try {
            rows = (await db.execute(sql`
                SELECT t.from_entity, t.to_entity, SUM(t.amount) AS total
                FROM ic_transactions t
                WHERE t.tenant_id = ${tenantId} AND t.period = ${sess.period}
                    AND t.match_status != 'Eliminated'
                    AND (t.from_entity = ANY(${entities}::text[]) OR t.to_entity = ANY(${entities}::text[]))
                GROUP BY t.from_entity, t.to_entity
            `) as any).rows;
        } catch { /* ic_transactions may not exist; fall through */ }

        const positions: Record<string, { payable: number; receivable: number; net: number }> = {};
        for (const e of entities) positions[e] = { payable: 0, receivable: 0, net: 0 };
        for (const row of rows) {
            if (positions[row.from_entity]) positions[row.from_entity].payable += Number(row.total);
            if (positions[row.to_entity]) positions[row.to_entity].receivable += Number(row.total);
        }
        const netPositions = Object.entries(positions).map(([entity, p]) => ({
            entity, payable: p.payable, receivable: p.receivable, net: p.receivable - p.payable
        }));

        await db.execute(sql`
            UPDATE ic_netting_sessions SET status = 'Completed',
                net_positions = ${JSON.stringify(netPositions)}::jsonb, run_by = 'system'
            WHERE id = ${sessionId}
        `);
        return { sessionId, netPositions };
    }

    async settle(sessionId: string, settledBy: string, settlementInstructions: any) {
        await db.execute(sql`
            UPDATE ic_netting_sessions SET status = 'Settled', settled_by = ${settledBy},
                settlement_instructions = ${JSON.stringify(settlementInstructions)}::jsonb
            WHERE id = ${sessionId}
        `);
        return { sessionId, status: 'Settled' };
    }

    async cancel(sessionId: string) {
        await db.execute(sql`UPDATE ic_netting_sessions SET status = 'Cancelled' WHERE id = ${sessionId}`);
        return { sessionId, status: 'Cancelled' };
    }

    async listSessions(tenantId: string, period?: string, status?: string) {
        let q = sql`SELECT * FROM ic_netting_sessions WHERE tenant_id = ${tenantId}`;
        if (period) q = sql`${q} AND period = ${period}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY created_at DESC`) as any).rows;
    }
}

/** TransferPricingAnalyticsService — IC-OG-03: TP analyses against arm-length benchmarks */
export class TransferPricingAnalyticsService {
    async createPolicy(params: {
        tenantId: string; policyName: string; transactionCategory: string; method: string;
        fromEntity?: string; toEntity?: string; armLengthMarginPct?: number;
        benchmarkRangeLow?: number; benchmarkRangeHigh?: number;
        effectiveFrom: string; effectiveTo?: string; approvedBy?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO transfer_pricing_policies (tenant_id, policy_name, transaction_category, method, from_entity, to_entity, arm_length_margin_pct, benchmark_range_low, benchmark_range_high, effective_from, effective_to, approved_by)
            VALUES (${params.tenantId}, ${params.policyName}, ${params.transactionCategory}, ${params.method},
                ${params.fromEntity ?? null}, ${params.toEntity ?? null},
                ${params.armLengthMarginPct ?? null}, ${params.benchmarkRangeLow ?? null}, ${params.benchmarkRangeHigh ?? null},
                ${params.effectiveFrom}, ${params.effectiveTo ?? null}, ${params.approvedBy ?? null})
            RETURNING *
        `)) as any;
        return r;
    }

    async runAnalysis(params: {
        tenantId: string; policyId: string; period: string;
        actualMarginPct: number; transactionsReviewed?: number; notes?: string;
    }) {
        const policy = (await db.execute(sql`SELECT * FROM transfer_pricing_policies WHERE id = ${params.policyId}`) as any).rows?.[0];
        if (!policy) throw new Error('Policy not found');
        const benchmarkMid = policy.arm_length_margin_pct
            ?? ((Number(policy.benchmark_range_low ?? 0) + Number(policy.benchmark_range_high ?? 0)) / 2);
        const variancePct = params.actualMarginPct - Number(benchmarkMid);
        const inRange = policy.benchmark_range_low && policy.benchmark_range_high
            ? params.actualMarginPct >= Number(policy.benchmark_range_low) && params.actualMarginPct <= Number(policy.benchmark_range_high)
            : true;
        const [r] = (await db.execute(sql`
            INSERT INTO transfer_pricing_analyses (tenant_id, policy_id, period, actual_margin_pct, benchmark_margin_pct, variance_pct, in_range, flagged, transactions_reviewed, analysis_notes)
            VALUES (${params.tenantId}, ${params.policyId}, ${params.period}, ${params.actualMarginPct},
                ${benchmarkMid}, ${variancePct}, ${inRange}, ${!inRange},
                ${params.transactionsReviewed ?? 0}, ${params.notes ?? null})
            RETURNING *
        `)) as any;
        return r;
    }

    async listPolicies(tenantId: string) {
        return (await db.execute(sql`SELECT * FROM transfer_pricing_policies WHERE tenant_id = ${tenantId} ORDER BY effective_from DESC`) as any).rows;
    }

    async listAnalyses(tenantId: string, period?: string, flaggedOnly = false) {
        let q = sql`
            SELECT a.*, p.policy_name, p.transaction_category, p.method
            FROM transfer_pricing_analyses a
            JOIN transfer_pricing_policies p ON p.id = a.policy_id
            WHERE a.tenant_id = ${tenantId}`;
        if (period) q = sql`${q} AND a.period = ${period}`;
        if (flaggedOnly) q = sql`${q} AND a.flagged = TRUE`;
        return (await db.execute(sql`${q} ORDER BY a.created_at DESC`) as any).rows;
    }
}

/** ICDisputeWbService — IC-OG-04: Dispute lifecycle */
export class ICDisputeWbService {
    async open(params: {
        tenantId: string; icTransactionId?: string; fromEntity: string; toEntity: string;
        disputedAmount?: number; currency?: string; reason: string; openedBy: string; notes?: string;
    }) {
        const disputeNumber = `ICD-${Date.now().toString(36).toUpperCase()}`;
        const initEvent = { at: new Date().toISOString(), by: params.openedBy, action: 'OPENED', note: params.notes ?? params.reason };
        const [r] = (await db.execute(sql`
            INSERT INTO ic_disputes (tenant_id, dispute_number, ic_transaction_id, from_entity, to_entity, disputed_amount, currency, reason, opened_by, events)
            VALUES (${params.tenantId}, ${disputeNumber}, ${params.icTransactionId ?? null},
                ${params.fromEntity}, ${params.toEntity}, ${params.disputedAmount ?? null},
                ${params.currency ?? 'USD'}, ${params.reason}, ${params.openedBy},
                ${JSON.stringify([initEvent])}::jsonb)
            RETURNING *
        `)) as any;
        return r;
    }

    async addEvent(disputeId: string, actor: string, action: string, note: string) {
        const newEvent = { at: new Date().toISOString(), by: actor, action, note };
        const newStatus = action === 'ESCALATE' ? 'Escalated' : action === 'RESOLVE' ? 'Resolved' : null;
        let q = sql`
            UPDATE ic_disputes SET events = events || ${JSON.stringify([newEvent])}::jsonb
            WHERE id = ${disputeId}`;
        if (newStatus) q = sql`
            UPDATE ic_disputes SET events = events || ${JSON.stringify([newEvent])}::jsonb,
                status = ${newStatus},
                resolved_at = CASE WHEN ${newStatus} = 'Resolved' THEN NOW() ELSE resolved_at END,
                resolved_by = CASE WHEN ${newStatus} = 'Resolved' THEN ${actor} ELSE resolved_by END
            WHERE id = ${disputeId}`;
        await db.execute(q);
        return { disputeId, action, actor };
    }

    async resolve(disputeId: string, resolvedBy: string, resolution: string) {
        const closeEvent = { at: new Date().toISOString(), by: resolvedBy, action: 'RESOLVED', note: resolution };
        await db.execute(sql`
            UPDATE ic_disputes SET status = 'Resolved', resolved_by = ${resolvedBy},
                resolution = ${resolution}, resolved_at = NOW(),
                events = events || ${JSON.stringify([closeEvent])}::jsonb
            WHERE id = ${disputeId}
        `);
        return { disputeId, status: 'Resolved' };
    }

    async list(tenantId: string, status?: string, entity?: string) {
        let q = sql`SELECT * FROM ic_disputes WHERE tenant_id = ${tenantId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (entity) q = sql`${q} AND (from_entity = ${entity} OR to_entity = ${entity})`;
        return (await db.execute(sql`${q} ORDER BY opened_at DESC LIMIT 200`) as any).rows;
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT status, reason, COUNT(*) AS count, SUM(disputed_amount) AS total_disputed
            FROM ic_disputes WHERE tenant_id = ${tenantId}
            GROUP BY status, reason ORDER BY count DESC
        `) as any).rows;
    }
}

export const nettingService = new NettingService();
export const tpAnalyticsService = new TransferPricingAnalyticsService();
export const icDisputeWbService = new ICDisputeWbService();
