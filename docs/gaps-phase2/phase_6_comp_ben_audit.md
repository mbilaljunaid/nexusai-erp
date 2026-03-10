# Deep Parity Audit: Compensation & Benefits

This report provides a granular codebase parity analysis of the Nexus Compensation and Benefits modules against Oracle Compensation and Oracle Benefits.

---

## 1. Database Schema Parity (`rewards_compensation.ts`, `rewards_benefits.ts`)

**Current Implementation:**
*   **Compensation**: Maps `hrm_salary_bases` (e.g., Annual/Hourly factors) and records `hrm_worker_salaries`. It also defines `hrm_compensation_plans` for variable bonuses.
*   **Benefits**: Very solid hierarchical layout mimicking Oracle's Program -> Plan -> Option -> Plan/Option (Rates) -> Enrollment flow. Supports Open Enrollment periods and explicit tracking of Employer/Employee costs.

**Oracle Gaps (Required Upgrades):**
*   **Life Event Processing (Benefits)**: Oracle Benefits revolves around "Life Events" (Marriage, Birth, Hire) triggering dynamic enrollment windows. Nexus only uses a static Date filter.
*   **Budgeting & Modeling (Compensation)**: Oracle provides a Workforce Compensation Workbench allowing HR to distribute a budget (e.g., $1M Merit Pool) down the management hierarchy. Nexus has no concept of top-down Merit Budgeting.

---

## 2. Backend API Parity

**Current Implementation:**
Basic CRUD routing.

**Oracle Gaps (Required Upgrades):**
*   **Eligibility Engine**: Both Compensation and Benefits heavily rely on an eligibility engine (e.g., "Full Time, Non-Union, US workers get Plan X"). Nexus currently manually assigns these without dynamic, rules-based calculation.
*   **Compensation Allocation Matrices**: Oracle automatically computes min/max merit percentages based on the employee's Performance Score and Compa-Ratio (salary against midpoint). Nexus lacks the math processors for this.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
Standard profile viewers.

**Oracle Gaps (Required Upgrades):**
*   **Compensation Workbench UI**: Missing the massive, scrollable spreadsheet UI where a manager can allocate merit, stock, and bonuses to all their direct reports simultaneously out of a set budget pool.
*   **Benefits Enrollment Wizard**: Missing the shopping-cart style interface presented during Open Enrollment for employees to compare plans and see live paycheck deductions.

---
**Upgrade Priority**: **HIGH**. Without the Workforce Compensation Workbench (Budget pool distribution) and Life Event Processors, these modules act as simple record-keepers rather than strategic HR tools.
