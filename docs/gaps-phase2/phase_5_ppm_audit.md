# Deep Parity Audit: Project Portfolio Management (PPM)

This report provides a granular codebase parity analysis of the Nexus PPM module against Oracle Project Financial Management.

---

## 1. Database Schema Parity (`shared/schema/ppm.ts`, `projects.ts`)

**Current Implementation (Hidden Gem):**
The `ppm.ts` file reveals an incredibly mature, Oracle-aligned Project Financials schema. It perfectly replicates:
*   **Project & Task Hierarchy (WBS)**
*   **Project Costing**: Expenditure Types, Items, Cost Distributions.
*   **Burdening**: Burden Schedules, Rules, and Multipliers (overhead application).
*   **Project Billing**: Bill Rates, Billing Rules, Events, and Draft Invoices.
*   **Capital Projects**: Linkage to Fixed Assets (`ppm_project_assets`).
*   **Earned Value Management (EVM)**: Performance snapshots tracking PV, AC, EV, CPI, and SPI.

**Oracle Gaps (Required Upgrades):**
*   **Resource Management**: Oracle PPM has deep functionality for forecasting resource utilization, skills matching, and talent capacity planning. Nexus assumes Resources are just names/IDs assigned to tasks without a global utilization engine.
*   **Cross-Charge / Transfer Pricing**: Missing the complex schemas required when an employee from Legal Entity A charges time to a Project owned by Legal Entity B, requiring automatic intercompany AR/AP generation.

---

## 2. Backend API Parity

**Current Implementation:**
Virtually non-existent in `server/routes`. The schema is a masterclass in accounting architecture but sits dormant.

**Oracle Gaps (Required Upgrades):**
*   **Project Costing Processor**: Needs a high-volume background engine to ingest expenses/timecards, calculate Burden Cost (applying overhead rates), and generate Accounting SLA entries.
*   **Project Billing Engine**: Needs an engine to scan unbilled expenditures and milestones, apply markup/billing rules, and generate Draft Invoices to push to AR.
*   **EVM Calculation Job**: A nightly job to recalculate the Earned Value metrics.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
Standard Agile IT-style project boards (`projects.ts`) exist, but the Financial PPM tools do not.

**Oracle Gaps (Required Upgrades):**
*   **Project Manager Dashboard**: Missing the financial command center displaying real-time Budget vs. Actuals, EVM charts, and unbilled revenue.
*   **Time & Labor Entry**: Lacks a robust, matrix-style timecard entry UI for employees to charge hours to specific Project/Task combinations.

---
**Upgrade Priority**: **MEDIUM-HIGH** (Like Manufacturing, the DB schema is surprisingly perfect and enterprise-ready. It simply needs the backend processing engines [Costing, Billing, EVM] built).
