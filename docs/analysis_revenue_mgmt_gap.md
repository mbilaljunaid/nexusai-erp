# Nexus ERP — Forensic Revenue Management Analysis (Gap)

> **Document Type:** Core Compliance Audit
> **Status:** Draft / Level-15 Forensic Complete
> **Parity Target:** Oracle Fusion RMCS / SAP Revenue Recognition

---

## 🚩 EXECUTABLE SUMMARY OF FINDINGS

### 1️⃣ ARCHITECTURAL CRITICAL GAPS (Level 1-5)
*   **Contract Identification Deficit**: Current logic creates one `revenue_contract` per `source_event_id`. Enterprise standards require **Contract Grouping Rules** (e.g., group by Customer PO, sales agreement, or timeframe).
*   **POB Identification Deficit**: No support for **Performance Obligation Rules**. Every item is treated as a distinct POB. Fails to handle "Combined POBs" (e.g., Software + Installation as one).
*   **Price Allocation (Step 4)**: While Relative SSP logic exists in `RevenueService.ts`, the **SSP Library** is a stub. No logic for "Estimated SSP" or "High/Low Fair Value" range validation.
*   **Recognition Method Rigidity**: Hardcoded 12-month ratable schedules. No support for **Milestone**, **Percentage of Completion**, or **Point-in-Time** recognition triggered by warehouse shipment (SCM integration).

### 2️⃣ UI/UX & NAVIGATION GAPS (Level 6-9)
*   **Exposed UUIDs**: `RevenueContractWorkbench` displays raw `customerId` and `itemId` UUIDs. **Violation of PR-ENFORCE-001**.
*   **Orphaned IQ Surfaces**: `RevenueAssurance`, `Forecasting`, and `Optimization` pages exist in the codebase but are **unreachable** via sidebar or `App.tsx` routes.
*   **Setup Impoverishment**: `RevenueAccountingSetup` only allows 4 GL accounts. Oracle/SAP require **Mapping Sets** (e.g., Segment 1 based on Region).
*   **Bulk Data Risks**: `StandardTable` implementation lacks **Server-side Pagination** and **Buffered Loading**. Performance will degrade at >500 contracts.

### 3️⃣ INTEGRATION & AUDIT GAPS (Level 10-15)
*   **AR Disconnect**: No reconciliation between "Billings" (from AR) and "Revenue Recognized" (from Subledger).
*   **SCM/Sales Integration**: Source events are "pushed" via API but no "pull" logic or deep link exists to the originating **Sales Order**.
*   **Audit Trail Absence**: No versioning for contract modifications. Catch-up adjustments are made but the original schedule state is lost.

---

## 🔒 LEVEL-15 CANONICAL DECOMPOSITION

| Level | Component | Status | Finding / Gap |
| :--- | :--- | :--- | :--- |
| **L1** | Domain | Partial | Core ASC 606 framework started (Step 1-5). |
| **L2** | Sub-Domain | Missing | **Billing Management** (AR Integration) is missing. |
| **L3** | Capability | Partial | Calculation of Relative SSP exists; **SSP Book management** is missing UI. |
| **L4** | Use Case | Missing | **Project Revenue** (Milestone) and **Subscription Termination** logic missing. |
| **L5** | Persona | Missing | No distinct views for **Auditors** (Reconciliation reports). |
| **L6** | UI Surfaces | Partial | Dashboard placeholder exists; Contract Detail view is operational but lacks history. |
| **L7** | UI Components| Failed | No server-side pagination in contract grids. **UUID exposure**. |
| **L8** | Config | Deficient | **Contract Identification Rules** and **POB Rules** have no config UI. |
| **L9** | Master Data | Partial | Customers/Items linked via UUID; no master-view for **SSP Books**. |
| **L10**| Transactions | Operational| `revenue_source_events` staging is solid. |
| **L11**| Controls | Partial | Period Close logic exists but lacks "Soft Close" vs "Hard Close". |
| **L12**| Accounting | Deficient | **Accounting Rules engine** is hardcoded; needs conditional logic. |
| **L13**| AI Agent | Missing | Forecasting page exists but logic is empty. No anomaly detection. |
| **L14**| Security/Audit| Partial | Basic RBAC; missing **Change Log** for modifications. |
| **L15**| Perf/Scalability| Failed | Client-side filtering/sorting will fail at enterprise scale. |

---

## 🛠️ PROPOSED REMEDIATION PLAN (NO-BUILD)

### Phase A: Foundation & Integration
1.  **Schema Expansion**: Add `legal_entity_id`, `org_id`, and `version_number` to `revenue_contracts`.
2.  **Order-to-Revenue Link**: Implement `SalesOrder` link in `revenue_source_events` for bidirectional drill-down.

### Phase B: Config & Rules
1.  **Rule Engine**: Migrate hardcoded catch-up and recognition logic to a **Rule Master** (Level 8).
2.  **SSP Manager**: Build the UI for `revenue_ssp_books` to allow fair-value management.

### Phase C: UX Cleanup (PR-ENFORCE-001)
1.  **UUID Replacement**: Update all grids to join on `customers` and `products` to show names.
2.  **Sidebar Alignment**: Register orphaned Forecasting and Assurance pages.
3.  **Scalable Grids**: Implement server-side pagination for `RevenueContractWorkbench`.
