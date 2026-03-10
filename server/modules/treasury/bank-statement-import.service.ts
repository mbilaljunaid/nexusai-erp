import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * BankStatementImportService — TREAS-OG-01
 *
 * Parses and imports bank statements in BAI2, MT940, and CAMT.053 (ISO 20022) formats.
 * Produces normalised transaction rows ready for reconciliation matching.
 */
export class BankStatementImportService {

    async importStatement(params: {
        tenantId: string;
        bankAccountId?: string;
        format: 'BAI2' | 'MT940' | 'CAMT053';
        rawContent: string;
        importedBy: string;
    }) {
        let parsed;
        try {
            switch (params.format) {
                case 'BAI2': parsed = this._parseBAI2(params.rawContent); break;
                case 'MT940': parsed = this._parseMT940(params.rawContent); break;
                case 'CAMT053': parsed = this._parseCAMT053(params.rawContent); break;
                default: throw new Error(`Unsupported format: ${params.format}`);
            }
        } catch (err: any) {
            const [imp] = (await db.execute(sql`
                INSERT INTO bank_statement_imports (
                    tenant_id, bank_account_id, format, raw_content, statement_date,
                    currency_code, import_status, error_message, imported_by
                ) VALUES (
                    ${params.tenantId}, ${params.bankAccountId ?? null}, ${params.format},
                    ${params.rawContent}, CURRENT_DATE, 'USD', 'Error', ${err.message}, ${params.importedBy}
                ) RETURNING id
            `)) as any;
            return { success: false, importId: imp?.id, error: err.message };
        }

        const [imp] = (await db.execute(sql`
            INSERT INTO bank_statement_imports (
                tenant_id, bank_account_id, format, raw_content, statement_date,
                opening_balance, closing_balance, currency_code,
                total_credits, total_debits, transaction_count, import_status, imported_by
            ) VALUES (
                ${params.tenantId}, ${params.bankAccountId ?? null}, ${params.format},
                ${params.rawContent}, ${parsed.statementDate},
                ${parsed.openingBalance}, ${parsed.closingBalance}, ${parsed.currencyCode},
                ${parsed.totalCredits}, ${parsed.totalDebits}, ${parsed.transactions.length}, 'Parsed', ${params.importedBy}
            ) RETURNING id
        `)) as any;

        // Insert transaction lines
        for (const tx of parsed.transactions) {
            await db.execute(sql`
                INSERT INTO bank_statement_transactions (
                    import_id, transaction_date, value_date, amount, direction,
                    currency_code, bank_ref, description, bai2_type_code, swift_code
                ) VALUES (
                    ${imp.id}, ${tx.transactionDate}, ${tx.valueDate ?? null},
                    ${tx.amount}, ${tx.direction}, ${parsed.currencyCode},
                    ${tx.bankRef ?? null}, ${tx.description ?? null},
                    ${tx.typeCode ?? null}, ${tx.swiftCode ?? null}
                )
            `);
        }

        return { success: true, importId: imp.id, transactionCount: parsed.transactions.length, parsed };
    }

    async getImports(tenantId: string, bankAccountId?: string) {
        if (bankAccountId) {
            return (await db.execute(sql`
                SELECT * FROM bank_statement_imports
                WHERE tenant_id = ${tenantId} AND bank_account_id = ${bankAccountId}
                ORDER BY statement_date DESC LIMIT 50
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM bank_statement_imports
            WHERE tenant_id = ${tenantId}
            ORDER BY statement_date DESC LIMIT 50
        `) as any).rows;
    }

    async getTransactions(importId: string, matchStatus?: string) {
        if (matchStatus) {
            return (await db.execute(sql`
                SELECT * FROM bank_statement_transactions
                WHERE import_id = ${importId} AND match_status = ${matchStatus}
                ORDER BY transaction_date
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM bank_statement_transactions WHERE import_id = ${importId}
            ORDER BY transaction_date
        `) as any).rows;
    }

    async matchTransaction(txId: string, glJournalId: string) {
        await db.execute(sql`
            UPDATE bank_statement_transactions
            SET match_status = 'Matched', gl_journal_id = ${glJournalId}
            WHERE id = ${txId}
        `);
        return { txId, glJournalId, status: 'Matched' };
    }

    // ─── Parsers ─────────────────────────────────────────────────────────────

    private _parseBAI2(content: string) {
        const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
        let openingBalance = 0;
        let closingBalance = 0;
        let currencyCode = 'USD';
        let statementDate = new Date().toISOString().slice(0, 10);
        const transactions: any[] = [];

        for (const line of lines) {
            const parts = line.split(',');
            const recType = parts[0];

            if (recType === '02') {  // Group header
                currencyCode = parts[4] ?? 'USD';
            } else if (recType === '03') {  // Account identifier
                statementDate = this._baiDate(parts[2]);
                openingBalance = Number(parts[4] ?? '0') / 100;
            } else if (recType === '16') {  // Transaction
                const amount = Math.abs(Number(parts[3] ?? '0')) / 100;
                const typeCode = parts[1] ?? '';
                // BAI2 type codes ≥500 = credits, <500 = debits (simplified)
                const direction = Number(typeCode) >= 400 ? 'Credit' : 'Debit';
                transactions.push({
                    transactionDate: statementDate,
                    amount,
                    direction,
                    typeCode,
                    bankRef: parts[5],
                    description: parts.slice(6).join(' ').trim(),
                });
            } else if (recType === '49') {  // Account trailer
                closingBalance = Number(parts[2] ?? '0') / 100;
            }
        }

        const totalCredits = transactions.filter(t => t.direction === 'Credit').reduce((s, t) => s + t.amount, 0);
        const totalDebits = transactions.filter(t => t.direction === 'Debit').reduce((s, t) => s + t.amount, 0);

        return { statementDate, openingBalance, closingBalance, currencyCode, totalCredits, totalDebits, transactions };
    }

    private _parseMT940(content: string) {
        const statementDate = this._extractMT940Field(content, ':13D:') ?? new Date().toISOString().slice(0, 10);
        const curBal = this._extractMT940Field(content, ':60F:') ?? 'CUSD0';
        const openingBalance = parseFloat(curBal.slice(4).replace(',', '.')) || 0;
        const currencyCode = curBal.slice(1, 4) || 'USD';
        const transactions: any[] = [];

        const txRegex = /:61:(\d{6})(\d{4})?(C|D|RC|RD)(\d+,\d+)(N\w{3})?(.{0,16})?/g;
        let match;
        while ((match = txRegex.exec(content)) !== null) {
            const dateStr = match[1];
            const year = 2000 + parseInt(dateStr.slice(0, 2));
            const transactionDate = `${year}-${dateStr.slice(2, 4)}-${dateStr.slice(4, 6)}`;
            const direction = match[3].includes('C') ? 'Credit' : 'Debit';
            const amount = parseFloat(match[4].replace(',', '.'));
            transactions.push({
                transactionDate,
                amount,
                direction,
                swiftCode: match[5]?.slice(1),
                bankRef: match[6]?.trim(),
                description: `MT940 ${direction}`,
            });
        }

        const totalCredits = transactions.filter(t => t.direction === 'Credit').reduce((s, t) => s + t.amount, 0);
        const totalDebits = transactions.filter(t => t.direction === 'Debit').reduce((s, t) => s + t.amount, 0);
        const closingBalance = openingBalance + totalCredits - totalDebits;

        return { statementDate, openingBalance, closingBalance, currencyCode, totalCredits, totalDebits, transactions };
    }

    private _parseCAMT053(content: string) {
        const dateMatch = content.match(/<Dt>(\d{4}-\d{2}-\d{2})<\/Dt>/);
        const statementDate = dateMatch?.[1] ?? new Date().toISOString().slice(0, 10);
        const currencyMatch = content.match(/Ccy="([A-Z]{3})"/);
        const currencyCode = currencyMatch?.[1] ?? 'USD';
        const transactions: any[] = [];

        const txRegex = /<Ntry>[\s\S]*?<Amt Ccy="[A-Z]+">([\d.]+)<\/Amt>[\s\S]*?<CdtDbtInd>(CRDT|DBIT)<\/CdtDbtInd>[\s\S]*?<\/Ntry>/g;
        let match;
        while ((match = txRegex.exec(content)) !== null) {
            const amount = parseFloat(match[1]);
            const direction = match[2] === 'CRDT' ? 'Credit' : 'Debit';
            transactions.push({ transactionDate: statementDate, amount, direction, description: 'CAMT.053 Entry' });
        }

        const balanceMatch = content.match(/<Tp><CdOrPrtry><Cd>OPBD<\/Cd>[\s\S]*?<Amt Ccy="[A-Z]+">([\d.]+)<\/Amt>/);
        const openingBalance = parseFloat(balanceMatch?.[1] ?? '0');
        const totalCredits = transactions.filter(t => t.direction === 'Credit').reduce((s, t) => s + t.amount, 0);
        const totalDebits = transactions.filter(t => t.direction === 'Debit').reduce((s, t) => s + t.amount, 0);
        const closingBalance = openingBalance + totalCredits - totalDebits;

        return { statementDate, openingBalance, closingBalance, currencyCode, totalCredits, totalDebits, transactions };
    }

    private _baiDate(s: string): string {
        if (!s || s.length < 6) return new Date().toISOString().slice(0, 10);
        const y = s.slice(0, 2), m = s.slice(2, 4), d = s.slice(4, 6);
        return `20${y}-${m}-${d}`;
    }

    private _extractMT940Field(content: string, tag: string): string | null {
        const idx = content.indexOf(tag);
        if (idx < 0) return null;
        return content.slice(idx + tag.length, idx + tag.length + 50).split('\n')[0].trim();
    }
}

export const bankStatementImportService = new BankStatementImportService();
