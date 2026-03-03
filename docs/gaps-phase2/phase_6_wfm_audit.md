# Deep Parity Audit: Workforce Management (Time & Labor)

This report provides a granular codebase parity analysis of the Nexus Workforce Management (WFM) module against Oracle Fusion Time and Labor / Absence Management.

---

## 1. Database Schema Parity (`shared/schema/time_labor.ts`)

**Current Implementation:**
The `time_labor.ts` schema is impressively detailed, bridging Time & Labor with Payroll.
*   **Time & Labor**: Covers Time Periods, Timesheets, Time Entries (duration-based), Shifts, and Shift Assignments.
*   **Labor Rules**: Maps `hrm_labor_policies` (Overtime rules) and generates `hrm_time_violations` for late-ins.
*   **Absence Management**: Tracks `hrm_leave_balances` and `hrm_accrual_policies` (vesting and max caps).
*   **Payroll Intg**: Connects Time & Labor directly to the Payroll Engine via `hrm_payroll_batches`.

**Oracle Gaps (Required Upgrades):**
*   **Time Collection Devices (TCDs)**: In Oracle WFM, a complex Web Clock / Badge Reader integration layer exists. Nexus relies entirely on manual UI input.
*   **Time Calculation Rules (TCR)**: Oracle allows defining profound logic where a "Regular Hour" transforms into "Overtime Hour" or "Shift Premium" dynamically based on the day. Nexus relies on a very simplified `overtimeMultiplier` configuration.
*   **Absence Eligibility Profiles**: Oracle dynamically evaluates if an employee is eligible for a certain Absence Plan using complex rules.

---

## 2. Backend API Parity

**Current Implementation:**
Routes likely exist to push timesheets through approval steps or batch send them to payroll (`/api/wfm/payroll/transfer`).

**Oracle Gaps (Required Upgrades):**
*   **Time Processing Engine / Background Job**: Oracle WFM has a rigorous engine that imports swipe events, validates them against schedules, calculates exceptions, and outputs payroll-ready calculations. Nexus lacks this automated pipeline, relying on frontend inputs.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
Basic forms for timesheets (`HRAttendanceDetail.tsx`).

**Oracle Gaps (Required Upgrades):**
*   **Manager Team Schedule Gantt**: Missing the visual Gantt UI showing all employee shifts, coverage gaps, and time-off requests continuously.
*   **Matrix Time Card**: Needs the standard Oracle multi-project/multi-task timecard entry grid.

---
**Upgrade Priority**: **HIGH**. The core objects are perfectly mapped, but a robust WFM suite requires the "Time Evaluation Engine" to do the heavy lifting converting raw clock/swipe data into calculated pay rules.
