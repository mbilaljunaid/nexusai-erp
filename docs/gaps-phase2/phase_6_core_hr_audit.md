# Deep Parity Audit: Core Human Resources (HCM)

This report provides a granular codebase parity analysis of the Nexus Core HR module against Oracle Fusion Global Human Resources.

---

## 1. Database Schema Parity (`shared/schema/hr_worker.ts`, `hr.ts`)

**Current Implementation:**
Nexus uses a simplified form of the Oracle worker model:
*   `hr_persons`: Biological and demographic data.
*   `hr_work_relationships`: The legal contract linking a person to an employer.
*   `hr_assignments`: The role, job, manager, and department details.

**Oracle Gaps (Required Upgrades):**
*   **True DateTrack (Effective Dating)**: Oracle HR is entirely built on Effective Start Date and Effective End Date for EVERY major table row (allowing historical reconstruction and future-dated changes). Nexus has `effective_start_date` and `effective_end_date` on `hr_assignments` as a *simulation*, but the core backend logic to handle date-effective row splitting (inserts/updates) does not exist.
*   **Journeys / Checklists**: While there's an `hr_checklists` schema, Oracle's complex "Journeys" engine (triggering onboarding tasks based on assignment changes) is not fully implemented in the backend.

---

## 2. Backend API Parity

**Current Implementation:**
Basic CRUD APIs exist for maintaining employees and assignments. There are also robust endpoints for HR Analytics (`/api/hr/analytics`) offering predictive headcounts.

**Oracle Gaps (Required Upgrades):**
*   **Action & Reason Framework**: Oracle requires every change (e.g., Transfer, Promotion, Termination) to be tagged with an Action Code and Reason Code. Nexus does not enforce this rigorous transactional event logging.
*   **Absence Processing**: Oracle has a background Absence Calculator that accrues PTO balances dynamically based on formulas. Nexus simply stores leave balances without a complex accrual matrix engine.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
Standard tabular views for Employee Directory and basic forms for adding employees.

**Oracle Gaps (Required Upgrades):**
*   **Manager Self Service (MSS) Workflow**: Oracle relies heavily on UI wizards (Guided Flows) for Managers to promote/transfer employees, complete with graphical organization charts. Nexus lacks a deep MSS transaction wizard.
*   **Effective Date UI Navigator**: Oracle UIs have a "Session Date" picker, allowing HR to view an employee's record exactly as it looked last year. Nexus only displays the "Current" view.

---
**Upgrade Priority**: **HIGH**. The schema accurately mimics the Oracle 3-tier worker model (Person -> Relationship -> Assignment), but the critical lacking feature is the **Date-Effective processing engine**, which is the absolute bedrock of Oracle HCM.
