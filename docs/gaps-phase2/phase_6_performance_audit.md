# Deep Parity Audit: Performance Management

This report provides a granular codebase parity analysis of the Nexus Performance module against Oracle Performance Management.

---

## 1. Database Schema Parity (`talent_performance.ts`)

**Current Implementation:**
Includes Goals, Performance Documents, customizable Templates (JSON sections/rating scales), and 360 Feedback logs.

**Oracle Gaps (Required Upgrades):**
*   **Goal Alignment (Cascading)**: Oracle allows a goal to be linked to a Parent Goal or Organization Goal so that completion ripples upward. Nexus sets Goals as isolated objects.
*   **Eligibility Profiles**: Like Benefits, Oracle assigns Performance Documents via Eligibility Profiles. Nexus currently requires manual assignment.

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Rigid Workflow Engine (State-Machine)**: Oracle Performance requires a strict State-Machine route (Worker Self-Eval -> Manager Eval -> Calibration -> Worker Acknowledgment). Nexus uses a simple ENUM `status`, which lacks the enforcement logic of a true document routing engine.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Check-In Document UI**: Oracle utilizes specialized UIs for continuous 1-on-1 Check-Ins (separate from annual appraisals).
*   **Template Form Builder**: Missing the admin UI to construct the JSON layout for a new appraisal document.

---
**Upgrade Priority**: **MEDIUM**. Requires a defined graph-structure for cascading goals and a more mature state-machine workflow.
