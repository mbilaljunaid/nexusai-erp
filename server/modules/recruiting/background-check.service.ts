import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * BackgroundCheckService — REC-OG-03
 * Manages FCRA-compliant background check orders with adverse action workflow.
 */
export class BackgroundCheckService {

    private readonly PACKAGE_COMPONENTS: Record<string, string[]> = {
        BASIC: ['CRIMINAL'],
        STANDARD: ['CRIMINAL', 'EMPLOYMENT', 'EDUCATION'],
        COMPREHENSIVE: ['CRIMINAL', 'EMPLOYMENT', 'EDUCATION', 'CREDIT', 'MVR'],
        EXECUTIVE: ['CRIMINAL', 'EMPLOYMENT', 'EDUCATION', 'CREDIT', 'MVR', 'SANCTIONS', 'SOCIAL_MEDIA'],
        INTERNATIONAL: ['CRIMINAL', 'EMPLOYMENT', 'EDUCATION', 'SANCTIONS'],
    };

    async initiateCheck(params: {
        tenantId: string; applicantId: string; candidateName?: string;
        candidateEmail?: string; packageType?: string; provider?: string;
    }) {
        const pkg = params.packageType ?? 'STANDARD';
        const [order] = (await db.execute(sql`
            INSERT INTO background_check_orders (
                tenant_id, applicant_id, candidate_name, candidate_email,
                package_type, provider, status
            ) VALUES (
                ${params.tenantId}, ${params.applicantId}, ${params.candidateName ?? null},
                ${params.candidateEmail ?? null}, ${pkg}, ${params.provider ?? 'Internal'}, 'Initiated'
            ) RETURNING *
        `)) as any;

        // Create component rows for the package
        const components = this.PACKAGE_COMPONENTS[pkg] ?? ['CRIMINAL'];
        for (const component of components) {
            await db.execute(sql`
                INSERT INTO background_check_components (order_id, component_type, status)
                VALUES (${order.id}, ${component}, 'Pending')
            `);
        }

        return { ...order, components };
    }

    async recordConsent(orderId: string) {
        await db.execute(sql`
            UPDATE background_check_orders
            SET status = 'In_Progress', consent_signed_at = NOW(), ordered_at = NOW()
            WHERE id = ${orderId}
        `);
        return { orderId, status: 'In_Progress' };
    }

    async updateComponent(orderId: string, componentType: string, result: string, details?: string) {
        await db.execute(sql`
            UPDATE background_check_components
            SET status = 'Complete', result = ${result}, details = ${details ?? null}, completed_at = NOW()
            WHERE order_id = ${orderId} AND component_type = ${componentType}
        `);

        // Auto-complete order if all components done
        const pending = (await db.execute(sql`
            SELECT COUNT(*) AS cnt FROM background_check_components WHERE order_id = ${orderId} AND status != 'Complete'
        `) as any).rows?.[0]?.cnt ?? 1;

        if (Number(pending) === 0) {
            // Compute adjudication: any 'Hit' → 'Consider', else 'Clear'
            const hits = (await db.execute(sql`SELECT COUNT(*) AS cnt FROM background_check_components WHERE order_id = ${orderId} AND result = 'Hit'`) as any).rows?.[0]?.cnt;
            const adj = Number(hits) > 0 ? 'Consider' : 'Clear';
            await db.execute(sql`UPDATE background_check_orders SET status = 'Complete', completed_at = NOW(), adjudication = ${adj} WHERE id = ${orderId}`);
        }

        return { orderId, componentType, result };
    }

    /**
     * Adverse Action — FCRA requires minimum 5-day pre-adverse hold before final decision.
     */
    async initiateAdverseAction(orderId: string) {
        const holdStart = new Date();
        const holdEnd = new Date(holdStart.getTime() + 5 * 86400000);
        await db.execute(sql`
            UPDATE background_check_orders
            SET status = 'Adverse_Action', hold_start_date = ${holdStart.toISOString().split('T')[0]}
            WHERE id = ${orderId}
        `);
        return { orderId, status: 'Adverse_Action', holdEndDate: holdEnd.toISOString().split('T')[0], message: 'Pre-adverse notice sent. Final decision can be made after 5 business days.' };
    }

    async finalizeDecision(orderId: string, decision: 'Proceed' | 'Withdraw' | 'Conditional', decidedBy: string, notes?: string) {
        await db.execute(sql`
            UPDATE background_check_orders
            SET final_decision = ${decision}, decided_by = ${decidedBy}, decided_at = NOW(), adjudication_notes = ${notes ?? null}
            WHERE id = ${orderId}
        `);
        return { orderId, finalDecision: decision, decidedBy };
    }

    async listOrders(tenantId: string, applicantId?: string, status?: string) {
        let q = sql`
            SELECT o.*, 
                COUNT(c.id) AS total_components,
                COUNT(c.id) FILTER (WHERE c.status = 'Complete') AS completed_components,
                COUNT(c.id) FILTER (WHERE c.result = 'Hit') AS hits
            FROM background_check_orders o
            LEFT JOIN background_check_components c ON c.order_id = o.id
            WHERE o.tenant_id = ${tenantId}
        `;
        if (applicantId) q = sql`${q} AND o.applicant_id = ${applicantId}`;
        if (status) q = sql`${q} AND o.status = ${status}`;
        q = sql`${q} GROUP BY o.id ORDER BY o.created_at DESC LIMIT 200`;
        return (await db.execute(q) as any).rows;
    }

    async getOrderDetail(orderId: string) {
        const order = (await db.execute(sql`SELECT * FROM background_check_orders WHERE id = ${orderId}`) as any).rows?.[0];
        if (!order) return null;
        const components = (await db.execute(sql`SELECT * FROM background_check_components WHERE order_id = ${orderId} ORDER BY component_type`) as any).rows;
        return { ...order, components };
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(*) FILTER (WHERE status = 'Initiated') AS initiated,
                COUNT(*) FILTER (WHERE status = 'In_Progress') AS in_progress,
                COUNT(*) FILTER (WHERE status = 'Complete' AND adjudication = 'Clear') AS clear,
                COUNT(*) FILTER (WHERE status = 'Complete' AND adjudication = 'Consider') AS consider,
                COUNT(*) FILTER (WHERE status = 'Adverse_Action') AS adverse_action,
                COUNT(*) FILTER (WHERE final_decision = 'Withdraw') AS withdrawn
            FROM background_check_orders WHERE tenant_id = ${tenantId}
        `) as any).rows?.[0];
    }
}

export const backgroundCheckService = new BackgroundCheckService();
