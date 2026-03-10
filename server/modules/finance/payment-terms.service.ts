import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * PaymentTermsService — APAR-OG-01
 *
 * Manages the payment terms catalogue and generates due-date schedules.
 * Supports: Net, EOM (End-of-Month), InstallmentSplit, ImmediateDue.
 */
export class PaymentTermsService {

    async createTerm(params: {
        tenantId: string;
        termCode: string;
        termName: string;
        netDays?: number;
        discountPct?: number;
        discountDays?: number;
        isSplit?: boolean;
        installments?: Array<{ pct: number; dueDays: number }>;
        dayOfMonth?: number;
        termType?: string;
    }) {
        const [term] = (await db.execute(sql`
            INSERT INTO payment_terms (
                tenant_id, term_code, term_name, net_days, discount_pct, discount_days,
                is_split, installments, day_of_month, term_type
            ) VALUES (
                ${params.tenantId}, ${params.termCode}, ${params.termName},
                ${params.netDays ?? 30}, ${params.discountPct ?? 0}, ${params.discountDays ?? 0},
                ${params.isSplit ?? false}, ${JSON.stringify(params.installments ?? [])},
                ${params.dayOfMonth ?? null}, ${params.termType ?? 'Net'}
            )
            ON CONFLICT (tenant_id, term_code) DO UPDATE SET
                term_name = EXCLUDED.term_name, net_days = EXCLUDED.net_days,
                discount_pct = EXCLUDED.discount_pct, discount_days = EXCLUDED.discount_days,
                is_split = EXCLUDED.is_split, installments = EXCLUDED.installments
            RETURNING *
        `)) as any;
        return term;
    }

    async listTerms(tenantId: string) {
        return (await db.execute(sql`
            SELECT * FROM payment_terms WHERE tenant_id = ${tenantId} AND active = TRUE ORDER BY term_code
        `) as any).rows;
    }

    /**
     * Calculate due dates for an invoice/PO using the payment term.
     * Returns an array of payment schedule lines.
     */
    async generateSchedule(params: {
        termCode: string;
        tenantId: string;
        sourceType: string;
        sourceId: string;
        invoiceDate: string;
        totalAmount: number;
        currencyCode?: string;
    }) {
        const term = (await db.execute(sql`
            SELECT * FROM payment_terms WHERE tenant_id = ${params.tenantId} AND term_code = ${params.termCode}
        `) as any).rows?.[0];
        if (!term) throw new Error(`Payment term not found: ${params.termCode}`);

        const baseDate = new Date(params.invoiceDate);
        const lines: Array<{ dueDate: string; amount: number; discountAmount: number; discountDueDate: string | null; installmentNum: number }> = [];

        if (term.term_type === 'ImmediateDue') {
            lines.push({ dueDate: params.invoiceDate, amount: params.totalAmount, discountAmount: 0, discountDueDate: null, installmentNum: 1 });
        } else if (term.is_split && term.installments?.length > 0) {
            term.installments.forEach((inst: any, i: number) => {
                const dueDate = this._addDays(baseDate, inst.due_days);
                const amount = (inst.pct / 100) * params.totalAmount;
                const discountDueDate = term.discount_days > 0 ? this._addDays(baseDate, term.discount_days) : null;
                const discountAmount = term.discount_pct > 0 ? (term.discount_pct / 100) * amount : 0;
                lines.push({ dueDate, amount, discountAmount, discountDueDate, installmentNum: i + 1 });
            });
        } else if (term.term_type === 'EOM') {
            const eom = this._endOfMonth(baseDate, term.net_days);
            const dueDate = term.day_of_month ? this._specificDay(baseDate, term.net_days, term.day_of_month) : eom;
            const discountDueDate = term.discount_days > 0 ? this._addDays(baseDate, term.discount_days) : null;
            const discountAmount = term.discount_pct > 0 ? (term.discount_pct / 100) * params.totalAmount : 0;
            lines.push({ dueDate, amount: params.totalAmount, discountAmount, discountDueDate, installmentNum: 1 });
        } else {
            // Standard Net
            const dueDate = this._addDays(baseDate, term.net_days);
            const discountDueDate = term.discount_days > 0 ? this._addDays(baseDate, term.discount_days) : null;
            const discountAmount = term.discount_pct > 0 ? (term.discount_pct / 100) * params.totalAmount : 0;
            lines.push({ dueDate, amount: params.totalAmount, discountAmount, discountDueDate, installmentNum: 1 });
        }

        // Persist schedule lines (upsert)
        const saved = [];
        for (const line of lines) {
            const [row] = (await db.execute(sql`
                INSERT INTO payment_schedule_lines (
                    source_type, source_id, installment_num, due_date, amount,
                    discount_amount, discount_due_date
                ) VALUES (
                    ${params.sourceType}, ${params.sourceId}, ${line.installmentNum},
                    ${line.dueDate}, ${line.amount}, ${line.discountAmount}, ${line.discountDueDate ?? null}
                )
                ON CONFLICT (source_type, source_id, installment_num) DO UPDATE SET
                    due_date = EXCLUDED.due_date, amount = EXCLUDED.amount,
                    discount_amount = EXCLUDED.discount_amount
                RETURNING *
            `)) as any;
            saved.push(row);
        }

        return saved;
    }

    async getSchedule(sourceType: string, sourceId: string) {
        return (await db.execute(sql`
            SELECT * FROM payment_schedule_lines WHERE source_type = ${sourceType} AND source_id = ${sourceId}
            ORDER BY installment_num
        `) as any).rows;
    }

    async markPaid(lineId: string) {
        await db.execute(sql`UPDATE payment_schedule_lines SET status = 'Paid' WHERE id = ${lineId}`);
        return { lineId, status: 'Paid' };
    }

    async getOverdue(tenantId: string) {
        return (await db.execute(sql`
            SELECT psl.*, pt.tenant_id
            FROM payment_schedule_lines psl
            JOIN payment_terms pt ON pt.tenant_id = ${tenantId}
            WHERE psl.due_date < CURRENT_DATE AND psl.status = 'Open'
            ORDER BY psl.due_date
            LIMIT 200
        `) as any).rows;
    }

    // ─── Date Helpers ─────────────────────────────────────────────────────────

    private _addDays(base: Date, days: number): string {
        const d = new Date(base);
        d.setDate(d.getDate() + days);
        return d.toISOString().slice(0, 10);
    }

    private _endOfMonth(base: Date, addMonths: number): string {
        const d = new Date(base);
        d.setMonth(d.getMonth() + addMonths + 1, 0);  // day 0 = last day of previous month
        return d.toISOString().slice(0, 10);
    }

    private _specificDay(base: Date, addMonths: number, day: number): string {
        const d = new Date(base);
        d.setMonth(d.getMonth() + addMonths, day);
        return d.toISOString().slice(0, 10);
    }
}

export const paymentTermsService = new PaymentTermsService();
