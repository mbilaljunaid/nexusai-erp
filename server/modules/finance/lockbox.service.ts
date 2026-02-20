import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * LockboxService — APAR-OG-02
 *
 * Processes bank lockbox remittance files (BAI2 / addenda / flat CSV)
 * and auto-matches payments to open invoices using a 3-tier matching cascade:
 * 1. Exact invoice reference match
 * 2. Fuzzy remittance reference (normalized Jaccard)
 * 3. Amount match on open invoices
 */
export class LockboxService {

    async importBatch(params: {
        tenantId: string;
        bankAccountId?: string;
        batchDate: string;
        items: Array<{
            checkNumber?: string;
            remittanceRef?: string;
            payerName?: string;
            payerAccount?: string;
            amount: number;
            itemDate?: string;
        }>;
        importedBy?: string;
        rawFile?: string;
    }) {
        const totalAmount = params.items.reduce((s, i) => s + i.amount, 0);
        const [batch] = (await db.execute(sql`
            INSERT INTO lockbox_batches (
                tenant_id, bank_account_id, batch_date, total_amount, item_count,
                status, imported_by, raw_file
            ) VALUES (
                ${params.tenantId}, ${params.bankAccountId ?? null}, ${params.batchDate},
                ${totalAmount}, ${params.items.length}, 'Pending',
                ${params.importedBy ?? 'system'}, ${params.rawFile ?? null}
            ) RETURNING *
        `)) as any;

        // Insert items and attempt auto-matching
        const results = [];
        for (const item of params.items) {
            const [lbItem] = (await db.execute(sql`
                INSERT INTO lockbox_items (
                    batch_id, check_number, remittance_ref, payer_name, payer_account,
                    amount, item_date
                ) VALUES (
                    ${batch.id}, ${item.checkNumber ?? null}, ${item.remittanceRef ?? null},
                    ${item.payerName ?? null}, ${item.payerAccount ?? null},
                    ${item.amount}, ${item.itemDate ?? params.batchDate}
                ) RETURNING *
            `)) as any;

            const matched = await this._autoMatch(lbItem, params.tenantId);
            results.push({ item: lbItem, match: matched });
        }

        // Update batch status
        const allMatched = results.every(r => r.match?.status === 'Matched');
        const anyMatched = results.some(r => r.match?.status === 'Matched');
        const newStatus = allMatched ? 'Matched' : anyMatched ? 'Partial' : 'Exception';
        await db.execute(sql`UPDATE lockbox_batches SET status = ${newStatus} WHERE id = ${batch.id}`);

        const summary = {
            batchId: batch.id, totalAmount,
            matched: results.filter(r => r.match?.status === 'Matched').length,
            unmatched: results.filter(r => r.match?.status === 'Unmatched').length,
            partial: results.filter(r => r.match?.status === 'Partial').length,
        };

        return { batch: { ...batch, status: newStatus }, summary, results };
    }

    async getBatches(tenantId: string, status?: string) {
        if (status) {
            return (await db.execute(sql`
                SELECT * FROM lockbox_batches WHERE tenant_id = ${tenantId} AND status = ${status}
                ORDER BY batch_date DESC LIMIT 50
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM lockbox_batches WHERE tenant_id = ${tenantId}
            ORDER BY batch_date DESC LIMIT 50
        `) as any).rows;
    }

    async getItems(batchId: string, matchStatus?: string) {
        if (matchStatus) {
            return (await db.execute(sql`
                SELECT * FROM lockbox_items WHERE batch_id = ${batchId} AND match_status = ${matchStatus}
                ORDER BY created_at
            `) as any).rows;
        }
        return (await db.execute(sql`SELECT * FROM lockbox_items WHERE batch_id = ${batchId} ORDER BY created_at`) as any).rows;
    }

    async manualMatch(itemId: string, invoiceId: string) {
        const item = (await db.execute(sql`SELECT * FROM lockbox_items WHERE id = ${itemId}`) as any).rows?.[0];
        if (!item) throw new Error('Lockbox item not found');

        const unapplied = Math.max(0, Number(item.amount) - /* invoice amount placeholder */ Number(item.amount));
        await db.execute(sql`
            UPDATE lockbox_items SET
                matched_invoice_id = ${invoiceId}, match_method = 'Manual',
                match_status = 'Matched', unapplied_amount = ${unapplied}
            WHERE id = ${itemId}
        `);
        return { itemId, invoiceId, method: 'Manual' };
    }

    async getSummary(tenantId: string) {
        return (await db.execute(sql`
            SELECT
                COUNT(lb.id) AS total_batches,
                SUM(lb.total_amount) AS total_processed,
                COUNT(li.id) FILTER (WHERE li.match_status = 'Matched') AS matched_items,
                COUNT(li.id) FILTER (WHERE li.match_status = 'Unmatched') AS unmatched_items,
                SUM(li.unapplied_amount) AS total_unapplied
            FROM lockbox_batches lb
            LEFT JOIN lockbox_items li ON li.batch_id = lb.id
            WHERE lb.tenant_id = ${tenantId}
        `) as any).rows?.[0];
    }

    // ─── Auto-Match Logic ─────────────────────────────────────────────────────

    private async _autoMatch(item: any, tenantId: string) {
        // Tier 1: Exact reference match on invoice number
        if (item.remittance_ref) {
            const invoice = (await db.execute(sql`
                SELECT id, total_amount FROM invoices
                WHERE tenant_id = ${tenantId} AND invoice_number = ${item.remittance_ref} AND status = 'Open'
                LIMIT 1
            `) as any).rows?.[0];
            if (invoice) {
                return await this._applyMatch(item.id, invoice.id, 'Exact', item.amount, Number(invoice.total_amount));
            }
        }

        // Tier 2: Fuzzy reference match
        if (item.remittance_ref || item.payer_name) {
            const candidates = (await db.execute(sql`
                SELECT id, invoice_number, total_amount FROM invoices
                WHERE tenant_id = ${tenantId} AND status = 'Open'
                LIMIT 100
            `) as any).rows ?? [];

            const searchTerm = (item.remittance_ref ?? item.payer_name ?? '').toUpperCase();
            let bestScore = 0;
            let bestCandidate: any = null;
            for (const cand of candidates) {
                const score = this._jaccardSim(searchTerm, cand.invoice_number.toUpperCase());
                if (score > bestScore && score >= 0.6) { bestScore = score; bestCandidate = cand; }
            }
            if (bestCandidate) {
                return await this._applyMatch(item.id, bestCandidate.id, 'Fuzzy_Ref', item.amount, Number(bestCandidate.total_amount));
            }
        }

        // Tier 3: Exact amount match
        const byAmount = (await db.execute(sql`
            SELECT id, total_amount FROM invoices
            WHERE tenant_id = ${tenantId} AND status = 'Open' AND ABS(total_amount - ${item.amount}) < 0.01
            LIMIT 1
        `) as any).rows?.[0];
        if (byAmount) {
            return await this._applyMatch(item.id, byAmount.id, 'Amount', item.amount, Number(byAmount.total_amount));
        }

        // No match
        await db.execute(sql`UPDATE lockbox_items SET match_status = 'Unmatched' WHERE id = ${item.id}`);
        return { status: 'Unmatched' };
    }

    private async _applyMatch(itemId: string, invoiceId: string, method: string, paidAmount: number, invoiceAmount: number) {
        const unapplied = Math.max(0, paidAmount - invoiceAmount);
        const status = paidAmount < invoiceAmount ? 'Partial' : paidAmount > invoiceAmount ? 'Overpayment' : 'Matched';

        await db.execute(sql`
            UPDATE lockbox_items SET
                matched_invoice_id = ${invoiceId}, match_method = ${method},
                match_status = ${status}, unapplied_amount = ${unapplied}
            WHERE id = ${itemId}
        `);
        return { status, invoiceId, method, unapplied };
    }

    private _jaccardSim(a: string, b: string): number {
        const setA = new Set(a.split(''));
        const setB = new Set(b.split(''));
        const inter = [...setA].filter(c => setB.has(c)).length;
        const union = new Set([...setA, ...setB]).size;
        return union === 0 ? 0 : inter / union;
    }
}

export const lockboxService = new LockboxService();
