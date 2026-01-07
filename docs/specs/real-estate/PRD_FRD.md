# REAL ESTATE INDUSTRY PACK - PRD & FRD

**Version:** 1.0
**Status:** DRAFT
**Scope:** "All-In" Property Management & Investments

---

## 1. PRODUCT REQUIREMENTS (PRD)

### 1.1 Vision
A comprehensive property management and investment platform servicing commercial, residential, and mixed-use portfolios with AI-driven valuation, maintenance, and lease optimization.

### 1.2 Scope
*   **Segments:** Commercial (Office/Retail), Residential (Multi-family), REITs.
*   **Key Modules:**
    *   **Property Management:** Units, Amenities, Maintenance Requests.
    *   **Leasing:** Prospecting, Screening, Lease Contracts (IFRS 16 / ASC 842 compliant), Renewals.
    *   **Billing:** Rent Roll, CAM (Common Area Maintenance) Reconciliations, Escalations.
    *   **Asset Management:** Valuations, CapEx, ROI tracking.
    *   **IoT:** Smart Building integration (HVAC, Access Control).
    *   **Investments:** Fund management, Investor reporting.

### 1.3 User Personas
*   **Property Manager:** Handles day-to-day operations and tenant issues.
*   **Leasing Agent:** Manages vacancies and applications.
*   **Asset Manager:** Strategic portfolio performance.
*   **Tenant:** Payment portal and maintenance requests.
*   **Investor:** Performance dashboards.

---

## 2. FUNCTIONAL REQUIREMENTS (FRD)

### 2.1 Core Domain Entities

#### 2.1.1 Property & Unit
*   **Structure:** Hierarchical (Portfolio -> Property -> Building -> Floor -> Unit).
*   **Attributes:** GLA (Gross Leasable Area), Asset Class, Location.

#### 2.1.2 Lease
*   **Complexity:** Must support Base Rent + CAM + Percentage Rent (Retail) + Ad-hoc Charges.
*   **Term:** Start/End dates with automated notification triggers for expiry.
*   **Clauses:** Break clauses, Renewal options.

#### 2.1.3 Ledger
*   **Rent Roll:** Immutable record of expected vs. collected rent.
*   **CAM:** Expense pools allocated to tenants based on GLA % or other keys.

### 2.2 Workflows

#### 2.2.1 Lease Lifecycle
1.  **Prospect:** Application received. Credit Check (AI).
2.  **Draft:** Terms negotiated.
3.  **Active:** Signed -> Security Deposit collected -> Move-in.
4.  **Billing:** Monthly invoices generated automatically.
5.  **Renewal/Term:** 90-day alert -> Renewal offer or Move-out inspection.

#### 2.2.2 AI Action: Forecast Occupancy
*   **Input:** Current lease expiries, market absorption rates, historical retention.
*   **Output:** 12-month Rolling Occupancy Forecast %.

---

## 3. AI ACTION SPECIFICATIONS

### 3.1 `FORECAST_OCCUPANCY`
*   **Description:** Predicting future vacancy risk based on lease data and market trends.
*   **Action:** `REAL_ESTATE.REPORTING.UPDATE_FORECAST`
*   **deterministic:** Output is a snapped forecast record.

### 3.2 `OPTIMIZE_RENT_PRICING`
*   **Description:** Dynamic pricing for vacant units based on real-time demand.
*   **Action:** `REAL_ESTATE.UNIT.UPDATE_ASKING_RENT`
*   **Constraints:** Cannot drop below 'Minimum Floor Price' set by Asset Manager.

---

## 4. REPORTING & ANALYTICS
*   **Rent Roll:** Real-time view of tenant status and arrears.
*   **NOI (Net Operating Income):** Revenue - Operating Expenses.
*   **Vacancy Loss:** Revenue lost due to empty units.
*   **Lease Expiry Profile:** Visual timeline of risk.
