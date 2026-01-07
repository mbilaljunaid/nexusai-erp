# CONSTRUCTION INDUSTRY PACK - PRD & FRD

**Version:** 1.0
**Status:** DRAFT
**Scope:** "All-In" General Contracting, Civil, Subcontracting

---

## 1. PRODUCT REQUIREMENTS (PRD)

### 1.1 Vision
A Project-First ERP for construction that unifies Bidding, Field execution, and Financial controls with real-time drone/IoT monitoring and predictive risk AI.

### 1.2 Scope
*   **Segments:** Commercial GC, Residential Developers, Civil Infrastructure, Specialty Subs.
*   **Key Modules:**
    *   **Project Mgmt:** RFI, Submittals, Daily Logs, Punch List.
    *   **Financials:** AIA Billing (G702/G703), Retainage, Change Orders.
    *   **Pre-Con:** Bidding, Estimation integration.
    *   **Resource Mgmt:** Labor scheduling, Equipment tracking.
    *   **IoT:** Drone Surveying, Telematics, Wearables (Safety).

### 1.3 User Personas
*   **Project Manager:** Owns schedule and budget.
*   **Superintendent:** Field operations, safety.
*   **Estimator:** Bids and takeoffs.
*   **Subcontractor:** Submits pay apps and RFIs.

---

## 2. FUNCTIONAL REQUIREMENTS (FRD)

### 2.1 Core Domain Entities

#### 2.1.1 Project (Job)
*   **Structure:** Project -> Phases -> Cost Codes.
*   **WBS:** Work Breakdown Structure linked to Schedule.

#### 2.1.2 Budget & Cost
*   **Columns:** Original Estimate | Approved COs | Revised Budget | Committed | Actual Cost | Forecast to Complete.
*   **Retainage:** Auto-withhold % (e.g., 10%) from Sub invoices until completion.

#### 2.1.3 Commitment (Subcontract/PO)
*   **Lifecycle:** `DRAFT` -> `SENT` -> `EXECUTED` -> `CLOSED`.
*   **Compliance:** Block payment if Insurance Cert expired.

### 2.2 Workflows

#### 2.2.1 Progress Billing (AIA Style)
1.  **Application:** Sub submits % complete per line item.
2.  **Review:** PM verifies work in field.
3.  **Approval:** Approved -> Retainage calculated -> AP Invoice created.
4.  **Owner Bill:** Rolled up into Prime Billing to Owner.

#### 2.2.2 AI Action: Predict Project Delay
*   **Trigger:** Daily Log update (Weather/Manpower) or Schedule slip.
*   **Input:** SPI (Schedule Performance Index), Weather forecast, RFI avg response time.
*   **Output:** Risk Alert + Estimated Finish Date slide (e.g., +5 days).

---

## 3. AI ACTION SPECIFICATIONS

### 3.1 `PREDICT_PROJECT_DELAY`
*   **Description:** Forecast schedule slippage.
*   **Action:** `CONSTRUCTION.SCHEDULE.UPDATE_FORECAST`
*   **Safety:** PM must review and accept new baseline.

### 3.2 `DETECT_SAFETY_RISK`
*   **Description:** Analyze site camera/drone feed for PPE violations or hazards.
*   **Action:** `CONSTRUCTION.SAFETY.CREATE_INCIDENT`
*   **Input:** Computer Vision stream.

### 3.3 `FORECAST_COST_AT_COMPLETION`
*   **Description:** Update EAC (Estimate at Completion) based on current burn rate.
*   **Action:** `CONSTRUCTION.BUDGET.UPDATE_FORECAST`

---

## 4. REPORTING & ANALYTICS
*   **WIP Report:** Contract Value | Billed | Cost | Earned Revenue | Over/Under Billed.
*   **Safety Rate:** TRIR (Total Recordable Incident Rate).
*   **Bid Hit Ratio:** Wins / Bids.
*   **Cash Flow:** Project-level cash position (billings vs. expenses).
