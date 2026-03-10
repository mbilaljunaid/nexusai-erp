import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * ProjectRevenueRecognitionService — PA-OG-01
 *
 * Implements multiple revenue recognition methods:
 * - POC (Percentage of Completion) — costs-incurred / total costs
 * - MILESTONE — fixed amounts tied to deliverable completions
 * - COMPLETED_CONTRACT — all revenue at contract end
 * - TIME_MATERIALS — bill-as-you-go, = invoiced amount
 */
export class ProjectRevenueRecognitionService {

    async setupMethod(params: {
        tenantId: string;
        projectId: string;
        method: string;
        contractValue: number;
        currencyCode?: string;
        startDate?: string;
        endDate?: string;
    }) {
        // Deactivate existing method first
        await db.execute(sql`
            UPDATE project_revenue_methods
            SET is_active = FALSE
            WHERE tenant_id = ${params.tenantId} AND project_id = ${params.projectId}
        `);
        const [m] = (await db.execute(sql`
            INSERT INTO project_revenue_methods (
                tenant_id, project_id, method, contract_value, currency_code, start_date, end_date
            ) VALUES (
                ${params.tenantId}, ${params.projectId}, ${params.method},
                ${params.contractValue}, ${params.currencyCode ?? 'USD'},
                ${params.startDate ?? null}, ${params.endDate ?? null}
            ) RETURNING *
        `)) as any;
        return m;
    }

    /**
     * Recognize revenue for a period.
     * For POC: pct = costsIncurred / (costsIncurred + costsToComplete)
     */
    async recognizeRevenue(params: {
        tenantId: string;
        projectId: string;
        periodStart: string;
        periodEnd: string;
        costsIncurred?: number;
        costsToComplete?: number;
        pctCompleteOverride?: number;  // manual override
        milestoneAmount?: number;
    }) {
        const method = (await db.execute(sql`
            SELECT * FROM project_revenue_methods
            WHERE tenant_id = ${params.tenantId} AND project_id = ${params.projectId} AND is_active = TRUE
            LIMIT 1
        `) as any).rows?.[0];
        if (!method) throw new Error('No active revenue method for project');

        // Get cumulative revenue to date
        const cumPrior = (await db.execute(sql`
            SELECT COALESCE(SUM(revenue_recognized), 0) AS cum
            FROM project_revenue_events
            WHERE tenant_id = ${params.tenantId} AND project_id = ${params.projectId}
              AND period_end < ${params.periodStart}
        `) as any).rows?.[0]?.cum ?? 0;

        let pctComplete = 0;
        let revenueRecognized = 0;
        const contractValue = Number(method.contract_value);

        if (method.method === 'POC') {
            const inc = params.costsIncurred ?? 0;
            const ttc = params.costsToComplete ?? 0;
            pctComplete = params.pctCompleteOverride != null
                ? params.pctCompleteOverride
                : (inc + ttc > 0 ? inc / (inc + ttc) : 0);
            // Revenue this period = (cumulative % × contract) - prior cumulative
            revenueRecognized = Math.max(0, pctComplete * contractValue - Number(cumPrior));
        } else if (method.method === 'MILESTONE') {
            revenueRecognized = params.milestoneAmount ?? 0;
            pctComplete = (Number(cumPrior) + revenueRecognized) / contractValue;
        } else if (method.method === 'TIME_MATERIALS') {
            revenueRecognized = params.costsIncurred ?? 0; // billed = cost incurred
            pctComplete = (Number(cumPrior) + revenueRecognized) / contractValue;
        } else if (method.method === 'COMPLETED_CONTRACT') {
            revenueRecognized = 0; // recognized only at completion
            pctComplete = params.pctCompleteOverride ?? 0;
        }

        const [event] = (await db.execute(sql`
            INSERT INTO project_revenue_events (
                tenant_id, project_id, method_id, period_start, period_end,
                pct_complete, costs_incurred, costs_to_complete, revenue_recognized, cumulative_revenue
            ) VALUES (
                ${params.tenantId}, ${params.projectId}, ${method.id},
                ${params.periodStart}, ${params.periodEnd},
                ${pctComplete}, ${params.costsIncurred ?? 0}, ${params.costsToComplete ?? 0},
                ${revenueRecognized}, ${Number(cumPrior) + revenueRecognized}
            ) RETURNING *
        `)) as any;
        return { ...event, pctComplete: Math.round(pctComplete * 10000) / 100 + '%' };
    }

    async postToGL(eventId: string, postedBy: string, glReference: string) {
        await db.execute(sql`
            UPDATE project_revenue_events
            SET gl_posted = TRUE, gl_reference = ${glReference}, posted_at = NOW(), posted_by = ${postedBy}
            WHERE id = ${eventId}
        `);
        return { eventId, glReference, status: 'Posted' };
    }

    async getSchedule(tenantId: string, projectId: string) {
        return (await db.execute(sql`
            SELECT e.*, m.method, m.contract_value
            FROM project_revenue_events e
            JOIN project_revenue_methods m ON m.id = e.method_id
            WHERE e.tenant_id = ${tenantId} AND e.project_id = ${projectId}
            ORDER BY e.period_start
        `) as any).rows;
    }

    async getSummary(tenantId: string, projectId: string) {
        return (await db.execute(sql`
            SELECT
                m.method, m.contract_value,
                COALESCE(SUM(e.revenue_recognized), 0) AS total_recognized,
                COALESCE(MAX(e.cumulative_revenue), 0) AS cumulative,
                m.contract_value - COALESCE(MAX(e.cumulative_revenue), 0) AS remaining,
                ROUND((COALESCE(MAX(e.cumulative_revenue), 0) / NULLIF(m.contract_value, 0)) * 100, 1) AS pct_recognized,
                COUNT(e.id) AS period_count,
                COUNT(e.id) FILTER (WHERE e.gl_posted) AS gl_posted_count
            FROM project_revenue_methods m
            LEFT JOIN project_revenue_events e ON e.method_id = m.id
            WHERE m.tenant_id = ${tenantId} AND m.project_id = ${projectId} AND m.is_active = TRUE
            GROUP BY m.id, m.method, m.contract_value
        `) as any).rows?.[0];
    }
}

export const projectRevenueRecognitionService = new ProjectRevenueRecognitionService();
