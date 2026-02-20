import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * FCPATrainingTrackerService — HR-OG-04
 * Manages mandatory FCPA/anti-bribery training assignments and completion tracking.
 */
export class FCPATrainingTrackerService {

    async assignTraining(params: {
        tenantId: string; employeeId: string; trainingModule: string;
        requiredBy: string; passingScorePct?: number;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO fcpa_training_assignments (
                tenant_id, employee_id, training_module, required_by, passing_score_pct
            ) VALUES (
                ${params.tenantId}, ${params.employeeId}, ${params.trainingModule},
                ${params.requiredBy}, ${params.passingScorePct ?? 80}
            )
            ON CONFLICT DO NOTHING RETURNING *
        `)) as any;
        return r ?? { message: 'Already assigned' };
    }

    async bulkAssign(tenantId: string, employeeIds: string[], trainingModule: string, requiredBy: string, passingScorePct = 80) {
        const results = [];
        for (const eid of employeeIds) {
            results.push(await this.assignTraining({ tenantId, employeeId: eid, trainingModule, requiredBy, passingScorePct }));
        }
        return { assigned: results.length, employeeIds };
    }

    async startTraining(assignmentId: string) {
        await db.execute(sql`
            UPDATE fcpa_training_assignments
            SET status = 'In_Progress', started_at = NOW()
            WHERE id = ${assignmentId} AND status = 'Pending'
        `);
        return { assignmentId, status: 'In_Progress' };
    }

    async completeTraining(assignmentId: string, scorePct: number, certificateUrl?: string) {
        const passed = scorePct >= (
            (await db.execute(sql`SELECT passing_score_pct FROM fcpa_training_assignments WHERE id = ${assignmentId}`) as any).rows?.[0]?.passing_score_pct ?? 80
        );
        await db.execute(sql`
            UPDATE fcpa_training_assignments
            SET status = ${passed ? 'Completed' : 'In_Progress'}, completed_at = ${passed ? 'NOW()' : null},
                score_pct = ${scorePct}, passed = ${passed},
                certificate_url = ${certificateUrl ?? null}
            WHERE id = ${assignmentId}
        `);
        return { assignmentId, passed, scorePct };
    }

    async exemptEmployee(assignmentId: string, reason: string) {
        await db.execute(sql`
            UPDATE fcpa_training_assignments SET status = 'Exempt', exemption_reason = ${reason} WHERE id = ${assignmentId}
        `);
        return { assignmentId, status: 'Exempt', reason };
    }

    /** Sweep to auto-mark overdue assignments */
    async runOverdueSweep(tenantId: string) {
        const result = await db.execute(sql`
            UPDATE fcpa_training_assignments
            SET status = 'Overdue'
            WHERE tenant_id = ${tenantId}
              AND status IN ('Pending', 'In_Progress')
              AND required_by < CURRENT_DATE
            RETURNING employee_id, training_module, required_by
        `);
        return { markedOverdue: (result as any).rows?.length ?? 0, entries: (result as any).rows };
    }

    async listAssignments(tenantId: string, employeeId?: string, status?: string, module_?: string) {
        let q = sql`SELECT * FROM fcpa_training_assignments WHERE tenant_id = ${tenantId}`;
        if (employeeId) q = sql`${q} AND employee_id = ${employeeId}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (module_) q = sql`${q} AND training_module = ${module_}`;
        q = sql`${q} ORDER BY required_by ASC LIMIT 500`;
        return (await db.execute(q) as any).rows;
    }

    async getComplianceSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                training_module,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Completed' AND passed) AS completed_passed,
                COUNT(*) FILTER (WHERE status = 'Overdue') AS overdue,
                COUNT(*) FILTER (WHERE status = 'In_Progress') AS in_progress,
                COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
                ROUND(COUNT(*) FILTER (WHERE status = 'Completed' AND passed)::numeric / NULLIF(COUNT(*) FILTER (WHERE status != 'Exempt'), 0) * 100, 1) AS completion_rate_pct
            FROM fcpa_training_assignments WHERE tenant_id = ${tenantId}
            GROUP BY training_module ORDER BY training_module
        `) as any).rows;
    }
}

/**
 * RegulatoryCalendarService — HR-OG-05
 * Manages compliance filing deadlines, training windows, and audit schedules.
 */
export class RegulatoryCalendarService {

    async createEvent(params: {
        tenantId: string; title: string; regulation?: string; jurisdiction?: string;
        eventType?: string; dueDate: string; recurrence?: string;
        ownerId?: string; description?: string; reminderDays?: number;
    }) {
        const [r] = (await db.execute(sql`
            INSERT INTO regulatory_calendar_events (
                tenant_id, title, regulation, jurisdiction, event_type,
                due_date, recurrence, owner_id, description, reminder_days
            ) VALUES (
                ${params.tenantId}, ${params.title}, ${params.regulation ?? null},
                ${params.jurisdiction ?? 'US'}, ${params.eventType ?? 'FILING'},
                ${params.dueDate}, ${params.recurrence ?? 'NONE'}, ${params.ownerId ?? null},
                ${params.description ?? null}, ${params.reminderDays ?? 30}
            ) RETURNING *
        `)) as any;
        return r;
    }

    async listEvents(tenantId: string, regulation?: string, status?: string, fromDate?: string, toDate?: string) {
        let q = sql`SELECT * FROM regulatory_calendar_events WHERE tenant_id = ${tenantId}`;
        if (regulation) q = sql`${q} AND regulation = ${regulation}`;
        if (status) q = sql`${q} AND status = ${status}`;
        if (fromDate) q = sql`${q} AND due_date >= ${fromDate}`;
        if (toDate) q = sql`${q} AND due_date <= ${toDate}`;
        q = sql`${q} ORDER BY due_date ASC LIMIT 200`;
        return (await db.execute(q) as any).rows;
    }

    async getDueSoon(tenantId: string, days = 30) {
        return (await db.execute(sql`
            SELECT * FROM regulatory_calendar_events
            WHERE tenant_id = ${tenantId}
              AND status IN ('Upcoming', 'In_Progress')
              AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ${days}::int
            ORDER BY due_date ASC
        `) as any).rows;
    }

    async updateStatus(eventId: string, status: string, completedBy?: string) {
        await db.execute(sql`
            UPDATE regulatory_calendar_events
            SET status = ${status},
                completed_at = ${status === 'Completed' ? sql`NOW()` : null},
                completed_by = ${completedBy ?? null}
            WHERE id = ${eventId}
        `);
        return { eventId, status };
    }

    async getUpcomingByRegulation(tenantId: string) {
        return (await db.execute(sql`
            SELECT regulation, COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Overdue') AS overdue,
                MIN(due_date) FILTER (WHERE status IN ('Upcoming','In_Progress')) AS next_due
            FROM regulatory_calendar_events WHERE tenant_id = ${tenantId}
            GROUP BY regulation ORDER BY MIN(due_date)
        `) as any).rows;
    }

    /** Daily sweep to auto-mark overdue events */
    async runOverdueSweep(tenantId: string) {
        const result = await db.execute(sql`
            UPDATE regulatory_calendar_events
            SET status = 'Overdue'
            WHERE tenant_id = ${tenantId} AND status IN ('Upcoming', 'In_Progress') AND due_date < CURRENT_DATE
            RETURNING id, title, due_date
        `);
        return { markedOverdue: (result as any).rows?.length ?? 0 };
    }
}

export const fcpaTrainingTrackerService = new FCPATrainingTrackerService();
export const regulatoryCalendarService = new RegulatoryCalendarService();
