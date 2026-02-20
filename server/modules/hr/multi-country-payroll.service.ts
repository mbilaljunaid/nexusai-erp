import { db } from "../../db";
import { sql } from "drizzle-orm";
import { payrollElementService } from "./payroll-element.service";
import { financeService } from "../../services/finance";

/**
 * MultiCountryPayrollService — HR-OG-04
 *
 * Orchestrates a country-specific payroll run:
 * 1. Fetches employees and their base salaries
 * 2. Calculates each active payroll element (earnings, deductions, taxes)
 * 3. Persists result lines to payroll_run_results
 * 4. Summarises run totals
 * 5. Generates GL costing journals via financeService
 */
export class MultiCountryPayrollService {

    async createRun(params: {
        tenantId: string;
        payrollName: string;
        periodStart: string;
        periodEnd: string;
        payDate: string;
        countryCode: string;
        currencyCode?: string;
        processedBy: string;
    }) {
        const [run] = (await db.execute(sql`
            INSERT INTO payroll_runs (
                tenant_id, payroll_name, period_start, period_end, pay_date, country_code,
                currency_code, status, processed_by
            ) VALUES (
                ${params.tenantId}, ${params.payrollName}, ${params.periodStart}, ${params.periodEnd},
                ${params.payDate}, ${params.countryCode}, ${params.currencyCode ?? 'USD'},
                'Draft', ${params.processedBy}
            )
            RETURNING *
        `)) as any;
        return run;
    }

    /**
     * Process all employees in this run.
     * For each employee: fetch base salary, iterate all active elements, calculate amount.
     */
    async processRun(runId: string, userId: string) {
        const run = (await db.execute(sql`SELECT * FROM payroll_runs WHERE id = ${runId}`) as any).rows?.[0];
        if (!run) throw new Error('Payroll run not found');
        if (run.status !== 'Draft') throw new Error('Can only process Draft runs');

        await db.execute(sql`
            UPDATE payroll_runs SET status = 'Processing', updated_at = NOW()
            WHERE id = ${runId}
        `);

        // Fetch employees in this entity's country (from hr_employees / employees table)
        const employees = (await db.execute(sql`
            SELECT e.id, e.base_salary, e.currency_code
            FROM employees e
            WHERE e.tenant_id = ${run.tenant_id}
              AND e.country_code = ${run.country_code}
              AND e.status = 'Active'
            LIMIT 5000
        `) as any).rows ?? [];

        // Fetch active elements for this country
        const elements = await payrollElementService.getElements(run.tenant_id, run.country_code);

        let grossTotal = 0;
        let netTotal = 0;
        let taxTotal = 0;
        let employerNI = 0;

        for (const emp of employees) {
            const baseSalary = Number(emp.base_salary ?? 0);
            let empGross = 0;
            let empDeductions = 0;
            let empTax = 0;
            let empNI = 0;

            for (const el of elements) {
                const amount = await payrollElementService.calculateElement(el.id, emp.id, baseSalary);
                if (amount === 0) continue;

                await db.execute(sql`
                    INSERT INTO payroll_run_results (
                        run_id, employee_id, element_id, element_code, calculated_amount,
                        currency_code, gl_account_code
                    ) VALUES (
                        ${runId}, ${emp.id}, ${el.id}, ${el.code}, ${amount},
                        ${run.currency_code}, ${el.gl_account_code ?? null}
                    )
                `);

                switch (el.element_type) {
                    case 'Earnings': empGross += amount; break;
                    case 'Deduction': empDeductions += amount; break;
                    case 'Tax': empTax += amount; break;
                    case 'Employer_Contribution': empNI += amount; break;
                }
            }

            grossTotal += empGross;
            netTotal += empGross - empDeductions - empTax;
            taxTotal += empTax;
            employerNI += empNI;
        }

        await db.execute(sql`
            UPDATE payroll_runs SET
                status = 'Review',
                employee_count = ${employees.length},
                gross_total = ${grossTotal},
                net_total = ${netTotal},
                tax_total = ${taxTotal},
                employer_ni = ${employerNI},
                updated_at = NOW()
            WHERE id = ${runId}
        `);

        return {
            runId, employeeCount: employees.length,
            grossTotal, netTotal, taxTotal, employerNI,
        };
    }

    async approveRun(runId: string, approvedBy: string) {
        await db.execute(sql`
            UPDATE payroll_runs
            SET status = 'Approved', approved_by = ${approvedBy}, updated_at = NOW()
            WHERE id = ${runId} AND status = 'Review'
        `);
        return { runId, status: 'Approved' };
    }

    async reverseRun(runId: string) {
        await db.execute(sql`
            UPDATE payroll_runs SET status = 'Reversed', updated_at = NOW()
            WHERE id = ${runId} AND status IN ('Approved', 'Paid')
        `);
        await db.execute(sql`
            DELETE FROM payroll_run_results WHERE run_id = ${runId}
        `);
        return { runId, status: 'Reversed' };
    }

    async listRuns(tenantId: string, countryCode?: string) {
        if (countryCode) {
            return (await db.execute(sql`
                SELECT * FROM payroll_runs
                WHERE tenant_id = ${tenantId} AND country_code = ${countryCode}
                ORDER BY pay_date DESC LIMIT 50
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM payroll_runs WHERE tenant_id = ${tenantId}
            ORDER BY pay_date DESC LIMIT 50
        `) as any).rows;
    }

    async getRunResults(runId: string) {
        return (await db.execute(sql`
            SELECT * FROM payroll_run_results WHERE run_id = ${runId}
            ORDER BY element_code, employee_id
        `) as any).rows;
    }
}

export const multiCountryPayrollService = new MultiCountryPayrollService();
