# CONSULTING INDUSTRY PACK - PRD & FRD

**Version:** 1.0
**Status:** DRAFT
**Scope:** "All-In" Professional Services, IT, Legal, Accounting

---

## 1. PRODUCT REQUIREMENTS (PRD)

### 1.1 Vision
A Professional Services Automation (PSA) platform optimizing utilization, project profitability, and talent matching in a single view.

### 1.2 Scope
*   **Segments:** Management Consulting, IT Services, Legal Firms, Marketing Agencies.
*   **Key Modules:**
    *   **Resource Mgmt:** Skills inventory, Capacity planning, Staffing.
    *   **Project Accounting:** T&M, Fixed Fee, Retainer billing.
    *   **Time & Expense:** Automated capture, Approvals.
    *   **CRM:** Opportunity to Project conversion.
    *   **Contract Mgmt:** MSA/SOW tracking.

### 1.3 User Personas
*   **Partner:** Owns client relationship and P&L.
*   **Resource Manager:** Staffs projects.
*   **Consultant:** Logs time/expense.
*   **Project Manager:** Tracks burn rate and deliverables.

---

## 2. FUNCTIONAL REQUIREMENTS (FRD)

### 2.1 Core Domain Entities

#### 2.1.1 Resource (Consultant)
*   **Attributes:** Skills (Ranked 1-5), Industry Experience, Location, Rate Card (Cost/Bill).
*   **Utilization:** Target vs. Actual (Billable Hours).

#### 2.1.2 Engagement (Project)
*   **Types:** `Time & Materials` (Bill per hour), `Fixed Price` (Milestone billing).
*   **Budget:** Hard cap (Not to Exceed) vs. Soft cap.

#### 2.1.3 Time Entry
*   **Validation:** Cannot log > 24 hours/day. Must map to active Project Code.
*   **Approval:** PM approval required before Billing.

### 2.2 Workflows

#### 2.2.1 Staffing
1.  **Demand:** PM creates Resource Request (Role: "Senior React Dev", Start: "Nov 1").
2.  **Match:** RM searches pool -> AI suggests candidates.
3.  **Booking:** Soft Book (Proposed) -> Hard Book (Confirmed).
4.  **Onboarding:** Access provisioning triggered.

#### 2.2.2 AI Action: Forecast Bench Risk
*   **Trigger:** Weekly batch.
*   **Input:** Project end dates, Probability of Pipeline wins.
*   **Output:** List of consultants hitting the "Bench" in < 4 weeks without assignment.

---

## 3. AI ACTION SPECIFICATIONS

### 3.1 `FORECAST_BENCH_RISK`
*   **Description:** Predict unbillable time.
*   **Action:** `CONSULTING.RESOURCE.FLAG_BENCH`
*   **Safety:** Notify Resource Manager to prioritize sales for these profiles.

### 3.2 `MATCH_RESOURCE_TO_PROJECT`
*   **Description:** Find best fit based on Skills, Availability, and Margin targets.
*   **Action:** `CONSULTING.STAFFING.SUGGEST_CANDIDATE`
*   **Input:** Skills Matrix, Calendar.

### 3.3 `PREDICT_PROJECT_MARGIN`
*   **Description:** Forecast final margin based on burn rate and ETC (Estimate to Complete).
*   **Action:** `CONSULTING.PROJECT.UPDATE_FORECAST`

---

## 4. REPORTING & ANALYTICS
*   **Utilization Rate:** Billable Hours / Total Available Hours.
*   **Realization Rate:** Billed Rates / Standard Rates.
*   **Project Margin:** Revenue - (Resource Cost + Expenses).
*   **DSO (Days Sales Outstanding):** Invoice aging.
