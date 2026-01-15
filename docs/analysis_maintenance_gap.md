
# ⚠️✅ MAINTENANCE (FACILITIES MANAGEMENT) GAP ANALYSIS
**Canonical Level-15 Decomposition & Feature Parity Heatmap**

> **Role**: Senior Oracle Fusion Maintenance Architect & ERP Product Engineer
> **Date**: 2026-01-15 (Updated: Post-Step 2 Verification)
> **Status**: ⚠️ PARTIALLY IMPLEMENTED (Steps 1 & 2 Complete, Steps 3 & 4 Pending)
> **Reference**: Oracle Fusion Cloud Maintenance (Asset Lifecycle Management)

---

## 🔁 2026-01-15 RE-RUN: Delta Changes & Analysis
**Recent Achievements (Steps 1 & 2)**:
1.  **Asset Meters (Level 10)**: Successfully implemented `maint_asset_meters` and `maint_asset_meter_readings`. Meters can be absolute or delta (change).
2.  **Work Definition Library (Level 3)**: Implemented standard operations and materials templates (`maint_work_definitions`). Verification confirms seamless application to Work Orders.
3.  **Advanced PM Engine (Level 3 & 13)**:
    *   **Meter-Based PM**: Implemented logic to trigger WOs based on meter intervals (e.g., every 500 hours).
    *   **Floating Interval**: Implemented `isFloating` logic for dynamic scheduling based on completion date.
    *   **Forecasting**: Backend service `getForecast()` implemented for time-based PMs (Level 13).

**Critical Open Gaps**:
1.  **Dispatch Console (Level 11)**: Backend API enhanced (`listTechnicians`, filtered `listWorkOrders`), but UI integration pending.
2.  **Forecasting Visualization (Level 13)**: Backend service exists, but `PlanningBoard` integration pending.
3.  **Financial Integration (Level 12)**: Costs are calculated but **not posted to GL**. This remains the largest barrier to "Tier-1" status.

**Readiness Verdict**: ⚠️ **Conditionally Ready** (Functional Core is solid; Financials & Visualization needing closure).

---

## 1. Executive Summary
The Maintenance module has advanced significantly from a basic CMMS to a robust **Enterprise Asset Management (EAM)** system. 
Recent updates (January 2026) have delivered:
1.  **Financial Intelligence**: Real-time costing for Materials and Labor.
2.  **Planning Capabilities**: Visual Gantt-style scheduling, Work Center capacity loads, and now **PM Forecasting**.
3.  **Compliance Framework**: Integrated Inspection Checklists and Safety Permits.
4.  **Advanced Strategies**: **Meter-based** and **floating** interval preventive maintenance.

**Prognosis**:
With the completion of Dispatch & Forecasting (Steps 3 & 4), the *operational* side will be effectively complete. The focus must then shift aggressively to **Phase D (GL Integration)** to close the loop with Finance.

---

## 2. Gap Analysis + Feature Parity Heatmap
*Status Legend: ✅ = Full Parity | ⚠️ = Partial / Assessment Needed | ❌ = Missing / Gap*

| Feature Area | Level | Capability | Status | Gap / Observation |
| :--- | :---: | :--- | :---: | :--- |
| **Asset Management** | 9 | Asset Master & Hierarchy | ✅ | Parent/Child hierarchy exists. Basic fields covered. |
| | 10 | Asset Meters & Readings | ✅ | **Parity Achieved**: Readings, Definitions, Trigger logic working. |
| | 13 | Asset Health / IoT | ❌ | **Gap**: No real-time health score, no IoT ingestion endpoint. |
| **Preventive Maintenance** | 3 | PM Definitions | ✅ | **Parity Achieved**: Time, Meter, and Floating intervals supported. |
| | 13 | Forecasting | ⚠️ | Backend logic (`getForecast`) done. **Gap**: UI Visualization pending (Planning Board). |
| **Corrective Maintenance** | 10 | Service Requests | ✅ | Portal -> Queue -> WO workflow is solid. |
| | 11 | Triage & Dispatch | ⚠️ | **Gap**: UI Integration pending for `DispatchConsole`. |
| **Work Execution** | 10 | Work Orders | ✅ | **Parity Achieved**: Work Definition Library integration verified. |
| | 7 | Inspections / QA | ✅ | **Parity Achieved**: Templates, Execution, Pass/Fail logic implemented. |
| | 14 | Safety & Permits | ✅ | **Parity Achieved**: Hot Work/Cold Work permits linked to WOs. |
| **Supply Chain Integration** | 7 | Spare Parts | ✅ | Inventory linkage solid. Reserved/Issued logic working. |
| | 7 | Direct Procurement | ❌ | **Gap**: Cannot raise Requisition (PR) for non-stock items directly. |
| **Resource Management** | 10 | Labor Booking | ✅ | Technician assignment & actuals logging functional. |
| | 9 | Shifts & Calendars | ❌ | **Gap**: No awareness of Tech availability/skills (Certification). |
| **Costing & Accounting** | 12 | Maintenance Costing | ✅ | **Parity Achieved**: Material & Labor costs calculated and aggregated. |
| | 12 | GL Integration | ❌ | **Critical Gap**: Costs are calculated but not posted to General Ledger (Journals). |
| | 12 | Capitalization | ❌ | **Gap**: No logic to capitalize overhaul costs to Asset Book Value. |
| **Planning & Scheduling** | 7 | Scheduling Board | ✅ | **Parity Achieved**: Gantt view, Drag-and-Drop backend support. |
| **User Experience** | 15 | Mobile / Offline | ❌ | **Gap**: Desktop only. Offline mode is mandatory for field work. |

---

## 3. Level-15 Canonical Decomposition

### Level 1: Module Domain
**Maintenance & Facilities Management**
*   **Current State**: Execution, Planning, Costing, and **Advanced PM** layers Active.
*   **Target**: Predictive Maintenance and Financial Capitalization.

### Level 2: Sub-Domains
1.  **Asset Information Management** (Implemented: Master + Meters)
2.  **Work Management** (Implemented: Library + Execution)
3.  **Materials Management** (Implemented)
4.  **Maintenance Costing** (Implemented - Operational Only)
5.  **Reliability Engineering** (MISSING)

### Level 3: Functional Capabilities
*   **PM Schedules**: Supports `Time-Based`, `Meter-Based`, `Floating`. (Complete)
*   **Work Execution**: Supports `Release`, `Complete`, `Inspect`, `Permit`, `Library`. (Complete)
*   **Failure Analysis**: Needs `Failure Codes`.

### Level 4: Business Use Cases
*   **Scenario A (Meter PM)**: Meter Reading -> Threshold Breached -> Auto-WO Generation. (Verified)
*   **Scenario B (Planned)**: PM Forecast -> Scheduling Board (Balance Load) -> Execute. (In Progress)

### Level 5: User Personas
*   **Planner**: Uses `PlanningBoard` to visualize load.
*   **Dispatcher**: Uses `DispatchConsole` (Pending) to assign techs.
*   **Technician**: Uses `ServiceModule` (needs Mobile).

### Level 6: UI Surfaces
*   `CMMSMaintenance.tsx`: Main Hub.
*   `MaintenanceDetailSheet.tsx`: Execution Surface.
*   `PlanningBoard.tsx`: Scheduling Surface (Needs Forecast View).
*   `DispatchConsole.tsx`: Triage Surface (Pending Integration).

### Level 7: UI Components
*   **Gantt Chart**: Implemented.
*   **Forecast Grid**: Pending.

### Level 8: Configuration
*   **Needed**: `Failure Code Sets`, `Maintenance Plant Parameters`.

### Level 9: Master Data
*   **Work Centers**: Implemented.
*   **Work Definitions**: Implemented (Templates).
*   **Asset Meters**: Implemented.

### Level 10: Transactional Objects
*   **Work Order Costs**: Implemented.
*   **Meter Readings**: Implemented.
*   **PM Definitions**: Implemented.

### Level 11: Workflow & Controls
*   **Safety Gates**: Cannot close WO if Inspection failed.
*   **Dispatch**: Auto-assign or Manual Drag-and-Drop.

### Level 12: Accounting & Rules
*   **Costing**: Calculated.
*   **GL Entries**: **MISSING**.

### Level 13: AI / Automation
*   **Current**: PM Forecasting (Algorithm).
*   **Target**: Predictive Maintenance (AI Model).

### Level 14: Security & Audit
*   **Permits**: Audit trail of who authorized work.

### Level 15: Performance & Scalability
*   **Volume**: Inspection Results stored as JSONB.
*   **PM Generation**: Batch process optimized.

---

## 4. Remediation Roadmap (Updated)

### Phase Current: Dispatch & Forecasting (Steps 3 & 4)
*   **Objective**: Operational Visiblity.
*   **Tasks**:
    1.  Link `DispatchConsole` to new APIs.
    2.  Visualize `getForecast()` on `PlanningBoard`.

### Phase D: GL Integration & Capitalization (Priority: High)
*   **Objective**: Financial Reconciliation.
*   **Tasks**:
    1.  Implement `MaintenanceAppSla` (Sub-ledger Accounting).
    2.  Create Journal Entries (`Dr Expense`, `Cr Absorb`).

### Phase E: Reliability & Predictive AI (Priority: Medium)
*   **Objective**: Reduce Downtime.
*   **Tasks**:
    1.  Implement `Failure Codes`.
    2.  build `AssetHealthService` (MTBF calc).

---

## 5. Build-Ready Task List (Next Steps)
1.  **Dispatch Console**: Finalize UI integration.
2.  **Planning Board**: Add Forecast overlay.
3.  **GL Integration**: Create `MaintenanceAccountingService`.

**Verdict**: ⚠️ **Conditionally Ready**. Proceed to finish Steps 3 & 4, then MUST prioritize GL Integration.
