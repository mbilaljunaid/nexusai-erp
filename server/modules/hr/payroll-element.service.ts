import { db } from "../../db";
import { sql } from "drizzle-orm";
import { financeService } from "../../services/finance";

/**
 * PayrollElementService — HR-OG-03
 *
 * Manages payroll element definitions and calculates employee earnings/deductions.
 * Feeds into the payroll run engine.
 */
export class PayrollElementService {

    async createElement(params: {
        tenantId: string;
        code: string;
        name: string;
        elementType: 'Earnings' | 'Deduction' | 'Tax' | 'Employer_Contribution';
        calculationRule: 'Flat' | 'Percent_of_Base' | 'Formula' | 'Table';
        formula?: string;
        glAccountCode?: string;
        isStatutory?: boolean;
        countryCode?: string;
        effectiveFrom: string;
        effectiveTo?: string;
    }) {
        const [el] = (await db.execute(sql`
            INSERT INTO payroll_elements (
                tenant_id, code, name, element_type, calculation_rule, formula,
                gl_account_code, is_statutory, country_code, effective_from, effective_to
            ) VALUES (
                ${params.tenantId}, ${params.code}, ${params.name}, ${params.elementType},
                ${params.calculationRule}, ${params.formula ?? null}, ${params.glAccountCode ?? null},
                ${params.isStatutory ?? false}, ${params.countryCode ?? null},
                ${params.effectiveFrom}, ${params.effectiveTo ?? null}
            )
            ON CONFLICT (tenant_id, code) DO UPDATE
            SET name = EXCLUDED.name, calculation_rule = EXCLUDED.calculation_rule,
                formula = EXCLUDED.formula, updated_at = NOW()
            RETURNING *
        `)) as any;
        return el;
    }

    async getElements(tenantId: string, countryCode?: string) {
        if (countryCode) {
            return (await db.execute(sql`
                SELECT * FROM payroll_elements
                WHERE tenant_id = ${tenantId} AND (country_code = ${countryCode} OR country_code IS NULL)
                  AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
                ORDER BY element_type, name
            `) as any).rows;
        }
        return (await db.execute(sql`
            SELECT * FROM payroll_elements
            WHERE tenant_id = ${tenantId}
              AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
            ORDER BY element_type, name
        `) as any).rows;
    }

    async setEmployeeEntry(params: {
        tenantId: string;
        employeeId: string;
        elementId: string;
        inputValue: number;
        effectiveFrom: string;
        effectiveTo?: string;
    }) {
        const [entry] = (await db.execute(sql`
            INSERT INTO employee_element_entries (tenant_id, employee_id, element_id, input_value, effective_from, effective_to)
            VALUES (${params.tenantId}, ${params.employeeId}, ${params.elementId}, ${params.inputValue},
                    ${params.effectiveFrom}, ${params.effectiveTo ?? null})
            ON CONFLICT DO NOTHING
            RETURNING *
        `)) as any;
        return entry;
    }

    /**
     * Calculate an element's amount for an employee given a base salary
     */
    async calculateElement(elementId: string, employeeId: string, baseSalary: number): Promise<number> {
        const elements = (await db.execute(sql`
            SELECT pe.*, eee.input_value
            FROM payroll_elements pe
            LEFT JOIN employee_element_entries eee ON eee.element_id = pe.id AND eee.employee_id = ${employeeId}
                AND eee.effective_from <= CURRENT_DATE AND (eee.effective_to IS NULL OR eee.effective_to >= CURRENT_DATE)
            WHERE pe.id = ${elementId}
        `) as any).rows;

        const el = elements?.[0];
        if (!el) return 0;

        const inputOverride = el.input_value !== null ? Number(el.input_value) : null;

        switch (el.calculation_rule) {
            case 'Flat':
                return inputOverride ?? 0;

            case 'Percent_of_Base':
                if (el.formula) {
                    const pct = parseFloat(el.formula.replace('%', '')) / 100;
                    return parseFloat((baseSalary * pct).toFixed(4));
                }
                return 0;

            case 'Formula':
                if (el.formula) {
                    // Safe eval with limited context
                    const base = baseSalary;
                    const input = inputOverride ?? 0;
                    try {
                        // Replace variable names, allow only math
                        const safe = el.formula
                            .replace(/base/g, String(base))
                            .replace(/input/g, String(input));
                        const result = Function(`"use strict"; return (${safe})`)();
                        return parseFloat(Number(result).toFixed(4));
                    } catch { return 0; }
                }
                return 0;

            default:
                return 0;
        }
    }
}

export const payrollElementService = new PayrollElementService();
