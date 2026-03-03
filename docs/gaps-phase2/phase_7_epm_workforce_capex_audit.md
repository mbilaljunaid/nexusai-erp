# Deep Parity Audit: EPM - Workforce & CapEx Planning

This report provides a granular codebase parity analysis of the Nexus EPM Workforce & CapEx modules against Oracle EPM modules.

---

## 1. Database Schema Parity (`epm.ts`)

**Current Implementation:**
Direct mapping for specialized planning: `plan_positions` (for HR planning) and `plan_assets` (for CapEx purchasing/depreciation forecasting). Includes integration endpoints for project planning (`plan_projects`).

**Oracle Gaps (Required Upgrades):**
*   **Tax & Fringe Benefits Engine**: Oracle EPM Workforce doesn't just plan base salary. It computes employer taxes, benefits, and local statutory costs automatically based on the worker's geography. Nexus only stores `salary`.
*   **Asset Depreciation Logic**: `plan_assets` stores `useful_life`, but there is no engine to spread that depreciation cost across future forecast periods natively.

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Workforce to GL Translation Engine**: A backend engine that takes a planned `plan_position` salary and automatically generating the debit (expense) and credit (liability) forecast entries in the `plan_units` structure.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Manager CapEx Request Board**: A dedicated board for managers to prioritize asset requests before approving them into the budget.

---
**Upgrade Priority**: **MEDIUM**. The core data is captured. It primarily requires the background calculation scripts to generate the forecast distributions.
