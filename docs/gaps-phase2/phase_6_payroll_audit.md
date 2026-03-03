# Deep Parity Audit: Payroll & Compensation

This report provides a granular codebase parity analysis of the Nexus Payroll module against Oracle Fusion Global Payroll.

---

## 1. Database Schema Parity (`shared/schema/rewards_payroll.ts`)

**Current Implementation:**
The payroll foundation mirrors Oracle's elemental approach:
*   `hrm_pay_groups`: Categorizing employees (e.g., US Monthly).
*   `hrm_pay_elements`: The building blocks of pay (Earnings, Deductions, Taxes).
*   `hrm_payroll_runs`: The execution header.
*   `hrm_payroll_run_results`: The line-item calculated output per employee.

**Oracle Gaps (Required Upgrades):**
*   **Pay Element Input Values**: Oracle Elements have multiple "Input Values" (e.g., An Overtime Element has Input Values for 'Hours Rate' and 'Hours Worked'). Nexus schema simplifies this to a single amount/rate field.
*   **Element Links / Eligibility**: Oracle uses "Element Links" to determine which employees are eligible for which elements based on their Job/Department/Grade. Nexus is missing an Eligibility Profile schema.

---

## 2. Backend API Parity

**Current Implementation:**
There are routes in `server/routes/hr_self_service.ts` to fetch run results and create voluntary deductions.

**Oracle Gaps (Required Upgrades):**
*   **FastFormula / Calculation Engine**: This is the largest gap. Oracle calculates gross-to-net via "FastFormulas" (custom scripting logic applied to Elements). Nexus hardcodes basic calculations and lacks a dynamic formula parser/engine to handle complex statutory tax rules or conditional earnings.
*   **RetroPay Engine**: Oracle has a dedicated background processor to detect late changes to prior periods and automatically calculate retroactive pay differences. Nexus has a history endpoint but lacks the automated recalculation engine.
*   **Payroll Costing (SLA Integration)**: Oracle maps payroll results directly into the General Ledger. The bridge from `hrm_payroll_run_results` to `gl_journal_lines` requires complex mapping rules not yet built.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
Basic forms (`PayrollWorkbench.tsx`, `PayrollProcessing.tsx`).

**Oracle Gaps (Required Upgrades):**
*   **Element Entry UI**: Oracle has a specific grid UI for payroll admins to bulk upload or manually override Element Entries (e.g., one-off bonuses) prior to calculation.
*   **Payroll Run Command Center**: Missing a dashboard showing the step-by-step phases of a payroll cycle (Calculate -> Verify -> Prepayments -> Costing -> Archive).

---
**Upgrade Priority**: **HIGH**. While the table structure is solid, an enterprise Payroll system fundamentally requires a dynamic formula calculator (FastFormula equivalent) to handle ever-changing international tax laws and company policies.
