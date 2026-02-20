import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * AbsenceService — HR-OG-02
 *
 * Manages absence types, employee balances, accruals, and approval workflow.
 */
export class AbsenceService {

    async createAbsenceType(params: {
        tenantId: string;
        code: string;
        name: string;
        accrualRate: number;         // hours per pay period
        maxCarryover: number;
        isPaid?: boolean;
        requiresApproval?: boolean;
    }) {
        const [type] = (await db.execute(sql`
            INSERT INTO absence_types (tenant_id, code, name, accrual_rate, max_carryover, is_paid, requires_approval)
            VALUES (${params.tenantId}, ${params.code}, ${params.name}, ${params.accrualRate},
                    ${params.maxCarryover}, ${params.isPaid ?? true}, ${params.requiresApproval ?? true})
            ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, accrual_rate = EXCLUDED.accrual_rate
            RETURNING *
        `)) as any;
        return type;
    }

    async getTypes(tenantId: string) {
        return (await db.execute(sql`
            SELECT * FROM absence_types WHERE tenant_id = ${tenantId} ORDER BY name
        `) as any).rows;
    }

    /**
     * Run accrual for an employee for a given pay period
     */
    async runAccrual(params: {
        tenantId: string;
        employeeId: string;
        year: number;
        accrualDate: string;  // ISO date
    }) {
        const types = (await db.execute(sql`
            SELECT * FROM absence_types WHERE tenant_id = ${params.tenantId} AND accrual_rate > 0
        `) as any).rows;

        const results = [];
        for (const t of types) {
            await db.execute(sql`
                INSERT INTO absence_balances (tenant_id, employee_id, absence_type_id, year, accrued, last_accrual_date)
                VALUES (${params.tenantId}, ${params.employeeId}, ${t.id}, ${params.year}, ${Number(t.accrual_rate)}, ${params.accrualDate})
                ON CONFLICT (tenant_id, employee_id, absence_type_id, year)
                DO UPDATE SET
                    accrued = absence_balances.accrued + EXCLUDED.accrued,
                    last_accrual_date = EXCLUDED.last_accrual_date,
                    updated_at = NOW()
            `);
            results.push({ typeCode: t.code, accrued: t.accrual_rate });
        }
        return results;
    }

    async getBalance(tenantId: string, employeeId: string, year: number) {
        return (await db.execute(sql`
            SELECT ab.*, at.code, at.name, at.is_paid
            FROM absence_balances ab
            JOIN absence_types at ON at.id = ab.absence_type_id
            WHERE ab.tenant_id = ${tenantId} AND ab.employee_id = ${employeeId} AND ab.year = ${year}
        `) as any).rows;
    }

    async submitRequest(params: {
        tenantId: string;
        employeeId: string;
        absenceTypeId: string;
        startDate: string;
        endDate: string;
        daysRequested: number;
        reason?: string;
    }) {
        // Validate balance
        const year = new Date(params.startDate).getFullYear();
        const bal = (await db.execute(sql`
            SELECT balance FROM absence_balances
            WHERE tenant_id = ${params.tenantId}
              AND employee_id = ${params.employeeId}
              AND absence_type_id = ${params.absenceTypeId}
              AND year = ${year}
        `) as any).rows?.[0];

        if (bal && Number(bal.balance ?? 0) < params.daysRequested) {
            throw new Error(`Insufficient balance: ${bal.balance} days available, ${params.daysRequested} requested`);
        }

        const [req] = (await db.execute(sql`
            INSERT INTO absence_requests (
                tenant_id, employee_id, absence_type_id, start_date, end_date, days_requested, reason
            ) VALUES (
                ${params.tenantId}, ${params.employeeId}, ${params.absenceTypeId},
                ${params.startDate}, ${params.endDate}, ${params.daysRequested}, ${params.reason ?? null}
            )
            RETURNING *
        `)) as any;
        return req;
    }

    async approveRequest(requestId: string, approvedBy: string) {
        const [req] = (await db.execute(sql`
            UPDATE absence_requests
            SET status = 'Approved', approved_by = ${approvedBy}, approved_at = NOW(), updated_at = NOW()
            WHERE id = ${requestId} AND status = 'Pending'
            RETURNING *
        `)) as any;

        if (req) {
            // Deduct from balance
            await db.execute(sql`
                UPDATE absence_balances
                SET used = used + ${req.days_requested}, updated_at = NOW()
                WHERE tenant_id = ${req.tenant_id}
                  AND employee_id = ${req.employee_id}
                  AND absence_type_id = ${req.absence_type_id}
                  AND year = EXTRACT(YEAR FROM ${req.start_date}::DATE)::INTEGER
            `);
        }
        return req;
    }

    async rejectRequest(requestId: string, rejectedBy: string, reason: string) {
        return (await db.execute(sql`
            UPDATE absence_requests
            SET status = 'Rejected', approved_by = ${rejectedBy}, rejection_reason = ${reason}, updated_at = NOW()
            WHERE id = ${requestId} AND status = 'Pending'
            RETURNING *
        `)) as any;
    }

    async listRequests(tenantId: string, employeeId?: string, status?: string) {
        if (employeeId) {
            return (await db.execute(sql`
                SELECT ar.*, at.name AS type_name FROM absence_requests ar
                JOIN absence_types at ON at.id = ar.absence_type_id
                WHERE ar.tenant_id = ${tenantId} AND ar.employee_id = ${employeeId}
                ORDER BY ar.start_date DESC
            `) as any).rows;
        }
        if (status) {
            return (await db.execute(sql`
                SELECT ar.*, at.name AS type_name FROM absence_requests ar
                JOIN absence_types at ON at.id = ar.absence_type_id
                WHERE ar.tenant_id = ${tenantId} AND ar.status = ${status}
                ORDER BY ar.created_at DESC LIMIT 100
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT ar.*, at.name AS type_name FROM absence_requests ar
            JOIN absence_types at ON at.id = ar.absence_type_id
            WHERE ar.tenant_id = ${tenantId}
            ORDER BY ar.created_at DESC LIMIT 100
        `) as any).rows;
    }
}

export const absenceService = new AbsenceService();
