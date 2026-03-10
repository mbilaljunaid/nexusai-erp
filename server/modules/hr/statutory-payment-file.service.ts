import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * StatutoryPaymentFileService — HR-OG-05
 *
 * Generates jurisdiction-specific payment files for payroll disbursement:
 * - ACH/NACHA (USA)
 * - BACS (UK)
 * - SEPA SCT / PAIN.001 (EU)
 * - FPS (UK Real-time)
 */
export class StatutoryPaymentFileService {

    async generateFile(params: {
        tenantId: string;
        runId: string;
        format: 'ACH_NACHA' | 'BACS' | 'SEPA_PAIN001' | 'FPS';
        generatedBy: string;
        companyName?: string;
        companyRoutingNumber?: string;  // ACH
        companyAccountNumber?: string;  // ACH/BACS
        valueDate?: string;
    }) {
        // Fetch employee payments from this run
        const payments = (await db.execute(sql`
            SELECT
                e.id AS employee_id,
                e.full_name,
                e.bank_account_number,
                e.bank_sort_code,
                e.bank_iban,
                e.bank_bic,
                SUM(CASE WHEN pe.element_type = 'Earnings' THEN rr.calculated_amount ELSE -rr.calculated_amount END) AS net_pay
            FROM payroll_run_results rr
            JOIN employees e ON e.id = rr.employee_id
            JOIN payroll_elements pe ON pe.id = rr.element_id
            WHERE rr.run_id = ${params.runId}
            GROUP BY e.id, e.full_name, e.bank_account_number, e.bank_sort_code, e.bank_iban, e.bank_bic
            HAVING SUM(CASE WHEN pe.element_type = 'Earnings' THEN rr.calculated_amount ELSE -rr.calculated_amount END) > 0
        `) as any).rows ?? [];

        const totalAmount = payments.reduce((s: number, p: any) => s + Number(p.net_pay ?? 0), 0);
        const valueDate = params.valueDate ?? new Date().toISOString().slice(0, 10);

        let fileContent = '';
        let fileName = '';

        switch (params.format) {
            case 'ACH_NACHA':
                ({ fileContent, fileName } = this._buildNACHA(payments, totalAmount, valueDate, params));
                break;
            case 'BACS':
                ({ fileContent, fileName } = this._buildBACS(payments, totalAmount, valueDate, params));
                break;
            case 'SEPA_PAIN001':
                ({ fileContent, fileName } = this._buildSEPA(payments, totalAmount, valueDate, params));
                break;
            case 'FPS':
                ({ fileContent, fileName } = this._buildFPS(payments, totalAmount, valueDate, params));
                break;
        }

        const [record] = (await db.execute(sql`
            INSERT INTO statutory_payment_files (
                tenant_id, run_id, format, file_content, file_name,
                total_amount, currency_code, payment_count, generated_by
            ) VALUES (
                ${params.tenantId}, ${params.runId}, ${params.format}, ${fileContent}, ${fileName},
                ${totalAmount}, 'USD', ${payments.length}, ${params.generatedBy}
            )
            RETURNING id, file_name, total_amount, payment_count, status, generated_at
        `)) as any;

        return { ...record, fileContent };
    }

    async getFiles(tenantId: string, runId?: string) {
        if (runId) {
            return (await db.execute(sql`
                SELECT id, format, file_name, total_amount, payment_count, status, generated_at, submitted_at
                FROM statutory_payment_files WHERE tenant_id = ${tenantId} AND run_id = ${runId}
                ORDER BY generated_at DESC
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT id, format, file_name, total_amount, payment_count, status, generated_at, submitted_at
            FROM statutory_payment_files WHERE tenant_id = ${tenantId}
            ORDER BY generated_at DESC LIMIT 50
        `) as any).rows;
    }

    async markSubmitted(fileId: string) {
        await db.execute(sql`
            UPDATE statutory_payment_files
            SET status = 'Submitted', submitted_at = NOW()
            WHERE id = ${fileId}
        `);
        return { fileId, status: 'Submitted' };
    }

    // ─── File Builders ───────────────────────────────────────────────────────

    private _buildNACHA(payments: any[], total: number, date: string, params: any) {
        const d = date.replace(/-/g, '').slice(2);  // YYMMDD
        const t = new Date().toISOString().slice(11, 16).replace(':', '');
        const fileHeader = `101 ${(params.companyRoutingNumber ?? '000000000').padEnd(9)} ${(params.companyAccountNumber ?? '000000000').padEnd(9)}${d}${t}A094101${(params.companyName ?? 'NEXUSAI PAYROLL').padEnd(23).slice(0, 23)}BANK REFERENCE    1`;
        const entries = payments.map((p, i) => {
            const amt = String(Math.round(Number(p.net_pay ?? 0) * 100)).padStart(10, '0');
            const acct = (p.bank_account_number ?? '000000000').padStart(17);
            const trace = `${(params.companyRoutingNumber ?? '000000000').slice(0, 8)}${String(i + 1).padStart(7, '0')}`;
            return `622${(p.bank_sort_code ?? '000000000').padStart(9)} ${acct}${amt}${(p.full_name ?? 'EMPLOYEE').padEnd(22).slice(0, 22)}  ${trace}`;
        }).join('\n');
        const controlAmt = String(Math.round(total * 100)).padStart(12, '0');
        const footer = `9${String(payments.length).padStart(6, '0')}000001${controlAmt}${controlAmt}`;
        const fileContent = [fileHeader, ...entries.split('\n'), footer].join('\n');
        return { fileContent, fileName: `payroll_ach_${date}.txt` };
    }

    private _buildBACS(payments: any[], total: number, date: string, params: any) {
        const header = `BACS PAYMENT FILE\nDate: ${date}\nOriginator: ${params.companyName ?? 'NEXUSAI'}\nTotal Records: ${payments.length}\nTotal Amount: ${total.toFixed(2)}\n\n`;
        const lines = payments.map(p =>
            `${(p.bank_sort_code ?? '000000').replace('-', '')}|${(p.bank_account_number ?? '00000000').padStart(8, '0')}|${Number(p.net_pay ?? 0).toFixed(2)}|${p.full_name ?? 'EMPLOYEE'}|SALARY`
        ).join('\n');
        return { fileContent: header + lines, fileName: `payroll_bacs_${date}.txt` };
    }

    private _buildSEPA(payments: any[], total: number, date: string, params: any) {
        const msgId = `PAYROLL-${Date.now()}`;
        const entries = payments.map((p, i) => `
      <CdtTrfTxInf>
        <PmtId><EndToEndId>PAY-${i + 1}</EndToEndId></PmtId>
        <Amt><InstdAmt Ccy="EUR">${Number(p.net_pay ?? 0).toFixed(2)}</InstdAmt></Amt>
        <CdtrAgt><FinInstnId><BIC>${p.bank_bic ?? 'NOTPROVIDED'}</BIC></FinInstnId></CdtrAgt>
        <Cdtr><Nm>${p.full_name ?? 'EMPLOYEE'}</Nm></Cdtr>
        <CdtrAcct><Id><IBAN>${p.bank_iban ?? 'NOTPROVIDED'}</IBAN></Id></CdtrAcct>
        <RmtInf><Ustrd>SALARY ${date}</Ustrd></RmtInf>
      </CdtTrfTxInf>`).join('');

        const fileContent = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${total.toFixed(2)}</CtrlSum>
      <InitgPty><Nm>${params.companyName ?? 'NEXUSAI'}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PI-${msgId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>${date}</ReqdExctnDt>
      <Dbtr><Nm>${params.companyName ?? 'NEXUSAI'}</Nm></Dbtr>
      ${entries}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
        return { fileContent, fileName: `sepa_pain001_${date}.xml` };
    }

    private _buildFPS(payments: any[], total: number, date: string, params: any) {
        const entries = payments.map(p => ({
            sortCode: (p.bank_sort_code ?? '000000').replace('-', ''),
            accountNumber: p.bank_account_number ?? '00000000',
            amount: Number(p.net_pay ?? 0).toFixed(2),
            reference: 'SALARY',
            receivingName: p.full_name ?? 'EMPLOYEE',
        }));
        const fileContent = JSON.stringify({ format: 'FPS', valueDate: date, payments: entries, total: total.toFixed(2) }, null, 2);
        return { fileContent, fileName: `fps_${date}.json` };
    }
}

export const statutoryPaymentFileService = new StatutoryPaymentFileService();
