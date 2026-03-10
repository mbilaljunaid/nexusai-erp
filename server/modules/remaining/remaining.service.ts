import { db } from "../../db";
import { sql } from "drizzle-orm";

/** ExpenseExtService — Travel Pre-Auth & Mileage */
export class ExpenseExtService {
    async createTravelRequest(params: {
        tenantId: string; employeeId: string; purpose?: string; destination?: string;
        departureDate?: string; returnDate?: string; estimatedCost?: number; currency?: string;
    }) {
        const requestNumber = `TR-${Date.now().toString(36).toUpperCase()}`;
        const [r] = (await db.execute(sql`
            INSERT INTO travel_prereqs (tenant_id, request_number, employee_id, purpose, destination, departure_date, return_date, estimated_cost, currency, status)
            VALUES (${params.tenantId}, ${requestNumber}, ${params.employeeId}, ${params.purpose ?? null},
                ${params.destination ?? null}, ${params.departureDate ?? null}, ${params.returnDate ?? null},
                ${params.estimatedCost ?? null}, ${params.currency ?? 'USD'}, 'Draft')
            RETURNING *
        `)) as any;
        return r;
    }

    async transitionTravel(travelId: string, action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CANCEL', actor: string) {
        const statusMap: Record<string, string> = { SUBMIT: 'Submitted', APPROVE: 'Approved', REJECT: 'Rejected', CANCEL: 'Cancelled' };
        await db.execute(sql`
            UPDATE travel_prereqs SET status = ${statusMap[action]},
                approved_by = CASE WHEN ${action} = 'APPROVE' THEN ${actor} ELSE approved_by END,
                approved_at = CASE WHEN ${action} = 'APPROVE' THEN NOW() ELSE approved_at END
            WHERE id = ${travelId}
        `);
        return { travelId, status: statusMap[action] };
    }

    async listTravel(tenantId: string, employeeId?: string, status?: string) {
        let q = sql`SELECT * FROM travel_prereqs WHERE tenant_id = ${tenantId}`;
        if (employeeId) q = sql`${q} AND employee_id = ${employeeId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY created_at DESC LIMIT 200`) as any).rows;
    }

    async createMileageLog(params: {
        tenantId: string; employeeId: string; tripDate: string; fromLocation?: string;
        toLocation?: string; miles: number; ratePerMile: number; gpsTrack?: any[]; expenseReportId?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO mileage_logs (tenant_id, employee_id, trip_date, from_location, to_location, miles, rate_per_mile, gps_track, expense_report_id, status)
            VALUES (${params.tenantId}, ${params.employeeId}, ${params.tripDate}, ${params.fromLocation ?? null},
                ${params.toLocation ?? null}, ${params.miles}, ${params.ratePerMile},
                ${JSON.stringify(params.gpsTrack ?? [])}::jsonb, ${params.expenseReportId ?? null}, 'Draft')
            RETURNING *, reimbursable
        `)) as any;
        return r;
    }

    async getMileageSummary(tenantId: string, employeeId: string, period?: string) {
        let q = sql`
            SELECT SUM(miles) AS total_miles, SUM(reimbursable) AS total_reimbursable, COUNT(*) AS trips, status
            FROM mileage_logs WHERE tenant_id = ${tenantId} AND employee_id = ${employeeId}`;
        if (period) q = sql`${q} AND DATE_TRUNC('month', trip_date) = ${period}::date`;
        return (await db.execute(sql`${q} GROUP BY status`) as any).rows;
    }

    async listMileage(tenantId: string, employeeId?: string, status?: string) {
        let q = sql`SELECT * FROM mileage_logs WHERE tenant_id = ${tenantId}`;
        if (employeeId) q = sql`${q} AND employee_id = ${employeeId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY trip_date DESC LIMIT 200`) as any).rows;
    }
}

/** LCMService — Duty Drawback & C-TPAT */
export class LCMService {
    async createDrawbackClaim(params: {
        tenantId: string; claimType?: string; importEntry?: string; exportEntry?: string;
        importDate?: string; exportDate?: string; dutiesPaid: number; drawbackRate?: number; currency?: string;
    }) {
        const claimNumber = `DDC-${Date.now().toString(36).toUpperCase()}`;
        const [r] = (await db.execute(sql`
            INSERT INTO duty_drawback_claims (tenant_id, claim_number, claim_type, import_entry, export_entry, import_date, export_date, duties_paid, drawback_rate, currency)
            VALUES (${params.tenantId}, ${claimNumber}, ${params.claimType ?? 'MANUFACTURING'},
                ${params.importEntry ?? null}, ${params.exportEntry ?? null},
                ${params.importDate ?? null}, ${params.exportDate ?? null},
                ${params.dutiesPaid}, ${params.drawbackRate ?? 0.99}, ${params.currency ?? 'USD'})
            RETURNING *, drawback_amount
        `)) as any;
        return r;
    }

    async fileDrawback(claimId: string) {
        await db.execute(sql`UPDATE duty_drawback_claims SET status = 'Filed', filed_at = NOW() WHERE id = ${claimId}`);
        return { claimId, status: 'Filed' };
    }

    async approveDrawback(claimId: string) {
        await db.execute(sql`UPDATE duty_drawback_claims SET status = 'Approved', approved_at = NOW() WHERE id = ${claimId}`);
        return { claimId, status: 'Approved' };
    }

    async listClaims(tenantId: string, status?: string) {
        let q = sql`SELECT *, drawback_amount FROM duty_drawback_claims WHERE tenant_id = ${tenantId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY created_at DESC`) as any).rows;
    }

    async createCTPATAssessment(params: {
        tenantId: string; partnerId: string; partnerType?: string; assessmentDate: string;
        assessedBy?: string; score?: number; certifiedUntil?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO ctpat_assessments (tenant_id, partner_id, partner_type, assessment_date, assessed_by, score, certified_until, status)
            VALUES (${params.tenantId}, ${params.partnerId}, ${params.partnerType ?? 'SUPPLIER'}, ${params.assessmentDate},
                ${params.assessedBy ?? null}, ${params.score ?? null}, ${params.certifiedUntil ?? null}, 'Scheduled')
            RETURNING *
        `)) as any;
        return r;
    }

    async updateCTPAT(assessmentId: string, status: string, score: number, findings: any[]) {
        await db.execute(sql`
            UPDATE ctpat_assessments SET status = ${status}, score = ${score},
                findings = ${JSON.stringify(findings)}::jsonb
            WHERE id = ${assessmentId}
        `);
        return { assessmentId, status };
    }

    async listCTPAT(tenantId: string, partnerId?: string, status?: string) {
        let q = sql`SELECT * FROM ctpat_assessments WHERE tenant_id = ${tenantId}`;
        if (partnerId) q = sql`${q} AND partner_id = ${partnerId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY assessment_date DESC`) as any).rows;
    }
}

/** LeaseExtService — Modifications & Subleases */
export class LeaseExtService {
    async createModification(params: {
        tenantId: string; leaseId: string; modificationType?: string; effectiveDate: string;
        newEndDate?: string; newMonthlyPmt?: number; incrementalRou?: number; incrementalLiability?: number;
        approvedBy?: string; accountingMemo?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO lease_modifications (tenant_id, lease_id, modification_type, effective_date, new_end_date, new_monthly_pmt,
                incremental_rou, incremental_liability, approved_by, accounting_memo, status)
            VALUES (${params.tenantId}, ${params.leaseId}, ${params.modificationType ?? 'EXTENSION'}, ${params.effectiveDate},
                ${params.newEndDate ?? null}, ${params.newMonthlyPmt ?? null}, ${params.incrementalRou ?? null},
                ${params.incrementalLiability ?? null}, ${params.approvedBy ?? null}, ${params.accountingMemo ?? null}, 'Draft')
            RETURNING *
        `)) as any;
        return r;
    }

    async listModifications(tenantId: string, leaseId?: string) {
        let q = sql`SELECT * FROM lease_modifications WHERE tenant_id = ${tenantId}`;
        if (leaseId) q = sql`${q} AND lease_id = ${leaseId}`;
        return (await db.execute(sql`${q} ORDER BY effective_date DESC`) as any).rows;
    }

    async createSublease(params: {
        tenantId: string; parentLeaseId: string; sublessee: string;
        startDate: string; endDate?: string; monthlyIncome?: number; currency?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO subleases (tenant_id, parent_lease_id, sublessee, start_date, end_date, monthly_income, currency)
            VALUES (${params.tenantId}, ${params.parentLeaseId}, ${params.sublessee}, ${params.startDate},
                ${params.endDate ?? null}, ${params.monthlyIncome ?? null}, ${params.currency ?? 'USD'})
            RETURNING *
        `)) as any;
        return r;
    }

    async listSubleases(tenantId: string, parentLeaseId?: string) {
        let q = sql`SELECT * FROM subleases WHERE tenant_id = ${tenantId}`;
        if (parentLeaseId) q = sql`${q} AND parent_lease_id = ${parentLeaseId}`;
        return (await db.execute(sql`${q} ORDER BY start_date DESC`) as any).rows;
    }
}

/** StagePPMService — Stage-Gate & Milestone Billing */
export class StagePPMService {
    async createGate(params: {
        tenantId: string; projectId: string; gateName: string; gateOrder: number;
        criteria?: { name: string; required: boolean }[];
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO stage_gates (tenant_id, project_id, gate_name, gate_order, criteria)
            VALUES (${params.tenantId}, ${params.projectId}, ${params.gateName}, ${params.gateOrder},
                ${JSON.stringify((params.criteria ?? []).map(c => ({ ...c, met: false })))}::jsonb)
            RETURNING *
        `)) as any;
        return r;
    }

    async reviewGate(gateId: string, reviewer: string, status: 'Passed' | 'Conditional' | 'Failed', criteriaUpdates: { name: string; met: boolean }[], notes?: string) {
        const current = (await db.execute(sql`SELECT criteria FROM stage_gates WHERE id = ${gateId}`) as any).rows?.[0];
        const criteria = (current?.criteria ?? []).map((c: any) => {
            const upd = criteriaUpdates.find(u => u.name === c.name);
            return upd ? { ...c, met: upd.met } : c;
        });
        await db.execute(sql`
            UPDATE stage_gates SET status = ${status}, reviewed_by = ${reviewer}, reviewed_at = NOW(),
                criteria = ${JSON.stringify(criteria)}::jsonb, notes = ${notes ?? null}
            WHERE id = ${gateId}
        `);
        return { gateId, status };
    }

    async getProjectGates(tenantId: string, projectId: string) {
        return (await db.execute(sql`
            SELECT * FROM stage_gates WHERE tenant_id = ${tenantId} AND project_id = ${projectId}
            ORDER BY gate_order
        `) as any).rows;
    }

    async createMilestoneBilling(params: {
        tenantId: string; projectId: string; contractId?: string; milestoneName: string;
        billingAmount?: number; currency?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO milestone_billing_events (tenant_id, project_id, contract_id, milestone_name, billing_amount, currency)
            VALUES (${params.tenantId}, ${params.projectId}, ${params.contractId ?? null}, ${params.milestoneName},
                ${params.billingAmount ?? null}, ${params.currency ?? 'USD'})
            RETURNING *
        `)) as any;
        return r;
    }

    async triggerMilestoneBilling(milestoneId: string, invoiceId: string) {
        await db.execute(sql`
            UPDATE milestone_billing_events SET status = 'Invoiced', invoice_id = ${invoiceId}, triggered_at = NOW()
            WHERE id = ${milestoneId}
        `);
        return { milestoneId, status: 'Invoiced', invoiceId };
    }

    async listMilestones(tenantId: string, projectId: string, status?: string) {
        let q = sql`SELECT * FROM milestone_billing_events WHERE tenant_id = ${tenantId} AND project_id = ${projectId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        return (await db.execute(sql`${q} ORDER BY created_at`) as any).rows;
    }
}

/** GLReconService — GL Reconciliation */
export class GLReconService {
    async runRecon(params: { tenantId: string; period: string; runBy: string }) {
        const [run] = (await db.execute(sql`
            INSERT INTO gl_recon_runs (tenant_id, period, run_by, status) VALUES (${params.tenantId}, ${params.period}, ${params.runBy}, 'Running')
            RETURNING *
        `)) as any;

        // Compare sub-ledger summary with GL totals (simplified: count of posting_lines vs journal_headers)
        let matched = 0; let unmatched = 0; let variance = 0;
        try {
            const glRows = (await db.execute(sql`
                SELECT account, SUM(debit_amount - credit_amount) AS gl_balance
                FROM posting_lines WHERE tenant_id = ${params.tenantId} AND period = ${params.period}
                GROUP BY account
            `) as any).rows;
            matched = glRows.filter((r: any) => Number(r.gl_balance) === 0).length;
            unmatched = glRows.filter((r: any) => Number(r.gl_balance) !== 0).length;
            variance = glRows.reduce((s: number, r: any) => s + Math.abs(Number(r.gl_balance ?? 0)), 0);
            await db.execute(sql`
                UPDATE gl_recon_runs SET status = 'Complete', matched_count = ${matched},
                    unmatched_count = ${unmatched}, variance_total = ${variance},
                    results = ${JSON.stringify(glRows.slice(0, 100))}::jsonb
                WHERE id = ${run.id}
            `);
        } catch {
            await db.execute(sql`UPDATE gl_recon_runs SET status = 'Complete', results = '[]'::jsonb WHERE id = ${run.id}`);
        }
        return { runId: run.id, matched, unmatched, variance };
    }

    async listRuns(tenantId: string, period?: string) {
        let q = sql`SELECT * FROM gl_recon_runs WHERE tenant_id = ${tenantId}`;
        if (period) q = sql`${q} AND period = ${period}`;
        return (await db.execute(sql`${q} ORDER BY run_at DESC LIMIT 50`) as any).rows;
    }
}

/** MDMService — Data Quality Scoring */
export class MDMService {
    async score(params: {
        tenantId: string; entityType: string; entityId: string;
        completeness: number; accuracy: number; consistency: number;
        anomalyFlags?: any[]; enrichedBy?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO mdm_data_quality_scores (tenant_id, entity_type, entity_id, completeness, accuracy, consistency, anomaly_flags, enriched_by, enriched_at)
            VALUES (${params.tenantId}, ${params.entityType}, ${params.entityId},
                ${params.completeness}, ${params.accuracy}, ${params.consistency},
                ${JSON.stringify(params.anomalyFlags ?? [])}::jsonb, ${params.enrichedBy ?? null},
                CASE WHEN ${params.enrichedBy} IS NOT NULL THEN NOW() ELSE NULL END)
            ON CONFLICT (tenant_id, entity_type, entity_id) DO UPDATE SET
                completeness = EXCLUDED.completeness, accuracy = EXCLUDED.accuracy, consistency = EXCLUDED.consistency,
                anomaly_flags = EXCLUDED.anomaly_flags, enriched_by = EXCLUDED.enriched_by,
                enriched_at = CASE WHEN EXCLUDED.enriched_by IS NOT NULL THEN NOW() ELSE mdm_data_quality_scores.enriched_at END,
                scored_at = NOW()
            RETURNING *
        `)) as any;
        return r;
    }

    async getUnderperformers(tenantId: string, entityType: string, threshold = 70) {
        return (await db.execute(sql`
            SELECT * FROM mdm_data_quality_scores
            WHERE tenant_id = ${tenantId} AND entity_type = ${entityType}
                AND ((completeness + accuracy + consistency) / 3.0) < ${threshold}
            ORDER BY ((completeness + accuracy + consistency) / 3.0)
            LIMIT 100
        `) as any).rows;
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT entity_type,
                COUNT(*) AS total,
                ROUND(AVG(completeness), 1) AS avg_completeness,
                ROUND(AVG(accuracy), 1) AS avg_accuracy,
                ROUND(AVG(consistency), 1) AS avg_consistency,
                COUNT(*) FILTER (WHERE jsonb_array_length(anomaly_flags) > 0) AS anomaly_count
            FROM mdm_data_quality_scores WHERE tenant_id = ${tenantId}
            GROUP BY entity_type
        `) as any).rows;
    }
}

/** TalentExtService — Cascading Goals, Nine-Box & GDPR */
export class TalentExtService {
    async createGoal(params: {
        tenantId: string; employeeId: string; goalTitle: string; description?: string;
        weight?: number; dueDate?: string; parentGoalId?: string;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO talent_goals (tenant_id, employee_id, goal_title, description, weight, due_date, parent_goal_id)
            VALUES (${params.tenantId}, ${params.employeeId}, ${params.goalTitle}, ${params.description ?? null},
                ${params.weight ?? 100}, ${params.dueDate ?? null}, ${params.parentGoalId ?? null})
            RETURNING *
        `)) as any;
        return r;
    }

    async updateProgress(goalId: string, progressPct: number) {
        await db.execute(sql`UPDATE talent_goals SET progress_pct = ${progressPct} WHERE id = ${goalId}`);
        return { goalId, progressPct };
    }

    async getGoalTree(tenantId: string, employeeId: string) {
        return (await db.execute(sql`
            WITH RECURSIVE goal_tree AS (
                SELECT *, 0 AS depth FROM talent_goals
                WHERE tenant_id = ${tenantId} AND employee_id = ${employeeId} AND parent_goal_id IS NULL
                UNION ALL
                SELECT g.*, gt.depth + 1 FROM talent_goals g JOIN goal_tree gt ON g.parent_goal_id = gt.id
            )
            SELECT * FROM goal_tree ORDER BY depth, goal_title
        `) as any).rows;
    }

    async createNineBox(params: {
        tenantId: string; employeeId: string; period: string;
        performance: 1 | 2 | 3; potential: 1 | 2 | 3;
        assessedBy?: string; notes?: string; gdprRetentionYears?: number;
    }) {
        const gdprPurgeAt = new Date();
        gdprPurgeAt.setFullYear(gdprPurgeAt.getFullYear() + (params.gdprRetentionYears ?? 5));
        const [r] = (await db.execute(sql`
            INSERT INTO nine_box_assessments (tenant_id, employee_id, period, performance, potential, assessed_by, notes, gdpr_purge_at)
            VALUES (${params.tenantId}, ${params.employeeId}, ${params.period},
                ${params.performance}, ${params.potential}, ${params.assessedBy ?? null},
                ${params.notes ?? null}, ${gdprPurgeAt.toISOString()})
            ON CONFLICT (tenant_id, employee_id, period) DO UPDATE SET
                performance = EXCLUDED.performance, potential = EXCLUDED.potential,
                assessed_by = EXCLUDED.assessed_by, notes = EXCLUDED.notes, gdpr_purge_at = EXCLUDED.gdpr_purge_at
            RETURNING *
        `)) as any;
        return r;
    }

    async getNineBoxGrid(tenantId: string, period: string) {
        return (await db.execute(sql`
            SELECT employee_id, performance, potential, box_label, assessed_by, notes
            FROM nine_box_assessments WHERE tenant_id = ${tenantId} AND period = ${period}
            ORDER BY potential DESC, performance DESC
        `) as any).rows;
    }

    async purgeGDPRExpired(tenantId: string) {
        const result = await db.execute(sql`
            DELETE FROM nine_box_assessments
            WHERE tenant_id = ${tenantId} AND gdpr_purge_at < NOW()
            RETURNING employee_id, period
        `);
        return { purged: (result as any).rows?.length ?? 0 };
    }
}

export const expenseExtService = new ExpenseExtService();
export const lcmService = new LCMService();
export const leaseExtService = new LeaseExtService();
export const stagePPMService = new StagePPMService();
export const glReconService = new GLReconService();
export const mdmService = new MDMService();
export const talentExtService = new TalentExtService();
