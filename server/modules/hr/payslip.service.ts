import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * PayslipService — HR-OG-08
 *
 * Generates structured payslip data per employee per run.
 * Returns JSON suitable for client-side PDF rendering or HTML email.
 * Supports re-generation and retrieval of past payslips.
 */
export class PayslipService {

    /**
     * Generate payslips for all employees in a run
     */
    async generatePayslips(runId: string) {
        const run = (await db.execute(sql`SELECT * FROM payroll_runs WHERE id = ${runId}`) as any).rows?.[0];
        if (!run) throw new Error('Payroll run not found');

        const results = (await db.execute(sql`
            SELECT
                rr.employee_id,
                rr.element_code,
                pe.name AS element_name,
                pe.element_type,
                rr.calculated_amount,
                rr.currency_code
            FROM payroll_run_results rr
            JOIN payroll_elements pe ON pe.id = rr.element_id
            WHERE rr.run_id = ${runId}
            ORDER BY rr.employee_id, pe.element_type, pe.name
        `) as any).rows ?? [];

        const employees = (await db.execute(sql`
            SELECT e.id, e.full_name, e.employee_number, e.job_title, e.department, e.base_salary
            FROM employees e
            WHERE e.id = ANY(
                SELECT DISTINCT employee_id FROM payroll_run_results WHERE run_id = ${runId}
            )
        `) as any).rows ?? [];

        const empMap = new Map(employees.map((e: any) => [e.id, e]));
        const payslips: any[] = [];

        // Group results by employee
        const grouped: Map<string, any[]> = new Map();
        for (const line of results) {
            if (!grouped.has(line.employee_id)) grouped.set(line.employee_id, []);
            grouped.get(line.employee_id)!.push(line);
        }

        for (const [employeeId, lines] of grouped) {
            const emp = empMap.get(employeeId) ?? {};
            const earnings = lines.filter(l => l.element_type === 'Earnings');
            const deductions = lines.filter(l => l.element_type === 'Deduction');
            const taxes = lines.filter(l => l.element_type === 'Tax');
            const employerContribs = lines.filter(l => l.element_type === 'Employer_Contribution');

            const grossPay = earnings.reduce((s: number, l) => s + Number(l.calculated_amount), 0);
            const totalDeductions = deductions.reduce((s: number, l) => s + Number(l.calculated_amount), 0);
            const totalTax = taxes.reduce((s: number, l) => s + Number(l.calculated_amount), 0);
            const netPay = grossPay - totalDeductions - totalTax;

            payslips.push({
                runId,
                employeeId,
                employeeNumber: emp.employee_number ?? 'N/A',
                fullName: emp.full_name ?? 'Employee',
                jobTitle: emp.job_title ?? '',
                department: emp.department ?? '',
                payPeriod: `${run.period_start} to ${run.period_end}`,
                payDate: run.pay_date,
                currencyCode: run.currency_code,
                baseSalary: Number(emp.base_salary ?? 0),
                earnings: earnings.map(l => ({ code: l.element_code, name: l.element_name, amount: Number(l.calculated_amount) })),
                deductions: deductions.map(l => ({ code: l.element_code, name: l.element_name, amount: Number(l.calculated_amount) })),
                taxes: taxes.map(l => ({ code: l.element_code, name: l.element_name, amount: Number(l.calculated_amount) })),
                employerContributions: employerContribs.map(l => ({ code: l.element_code, name: l.element_name, amount: Number(l.calculated_amount) })),
                grossPay: parseFloat(grossPay.toFixed(4)),
                totalDeductions: parseFloat(totalDeductions.toFixed(4)),
                totalTax: parseFloat(totalTax.toFixed(4)),
                netPay: parseFloat(netPay.toFixed(4)),
            });
        }

        return payslips;
    }

    /**
     * Generate payslip HTML suitable for rendering as PDF
     */
    renderPayslipHTML(payslip: any): string {
        const fmtAmt = (n: number) =>
            `${payslip.currencyCode} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

        const rows = (items: any[]) =>
            items.map(i => `<tr><td>${i.name}</td><td style="text-align:right">${fmtAmt(i.amount)}</td></tr>`).join('');

        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Payslip</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; margin: 0; padding: 32px; }
  .header { background: #1d4ed8; color: #fff; padding: 16px 24px; border-radius: 8px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #f3f4f6; text-align: left; padding: 6px 10px; font-size: 11px; text-transform: uppercase; }
  td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
  .totals { background: #f9fafb; font-weight: bold; }
  .net { background: #d1fae5; font-size: 15px; font-weight: bold; }
</style>
</head><body>
<div class="header">
  <div style="font-size:18px;font-weight:bold">NexusAI ERP — Payslip</div>
  <div>Pay Period: ${payslip.payPeriod} &nbsp;|&nbsp; Pay Date: ${payslip.payDate}</div>
</div>
<div class="grid">
  <div>
    <strong>${payslip.fullName}</strong><br/>
    Employee #: ${payslip.employeeNumber}<br/>
    Job Title: ${payslip.jobTitle}<br/>
    Department: ${payslip.department}
  </div>
  <div>
    Base Salary: ${fmtAmt(payslip.baseSalary)}<br/>
    Currency: ${payslip.currencyCode}
  </div>
</div>

<table>
  <thead><tr><th>Earnings</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>
    ${rows(payslip.earnings)}
    <tr class="totals"><td>Gross Pay</td><td style="text-align:right">${fmtAmt(payslip.grossPay)}</td></tr>
  </tbody>
</table>

<table>
  <thead><tr><th>Deductions</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>
    ${rows(payslip.deductions)}
    ${rows(payslip.taxes)}
    <tr class="totals"><td>Total Deductions + Tax</td><td style="text-align:right">${fmtAmt(payslip.totalDeductions + payslip.totalTax)}</td></tr>
  </tbody>
</table>

<table>
  <tbody>
    <tr class="net"><td>NET PAY</td><td style="text-align:right">${fmtAmt(payslip.netPay)}</td></tr>
  </tbody>
</table>

${payslip.employerContributions.length > 0 ? `<table>
  <thead><tr><th>Employer Contributions (for info)</th><th></th></tr></thead>
  <tbody>${rows(payslip.employerContributions)}</tbody>
</table>` : ''}
</body></html>`;
    }
}

export const payslipService = new PayslipService();
