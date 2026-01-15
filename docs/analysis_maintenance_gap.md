
# ⚠️✅ MAINTENANCE (FACILITIES MANAGEMENT) GAP ANALYSIS
**Canonical Level-15 Decomposition & Feature Parity Heatmap**

> **Role**: Senior Oracle Fusion Maintenance Architect & ERP Product Engineer
> **Date**: 2026-01-15
> **Status**: ⚠️ PARTIALLY IMPLEMENTED (Tier-2 Ready, Not Tier-1)
> **Reference**: Oracle Fusion Cloud Maintenance (Asset Lifecycle Management)

---

## 1. Executive Summary
The current Maintenance module provides a functional foundation for **Small-to-Midsize Business (SMB)** operations, capable of handling Asset Management, Preventive Maintenance (Time-based), Corrective Maintenance (Service Requests), and basic execution (Work Orders with Materials & Labor).

However, it **lacks Tier-1 Enterprise capabilities** required for large-scale operations, specifically in **Maintenance Costing**, **Complex Planning**, **Safety/Compliance**, and **Mobile Execution**. It currently operates as a "CMMS" (Computerized Maintenance Management System) rather than a fully integrated "EAM" (Enterprise Asset Management) system.

---

## 2. Gap Analysis + Feature Parity Heatmap
*Status Legend: ✅ = Full Parity | ⚠️ = Partial / Assessment Needed | ❌ = Missing / Gap*

| Feature Area | Level | Capability | Status | Gap / Observation |
| :--- | :---: | :--- | :---: | :--- |
| **Asset Management** | 9 | Asset Master & Hierarchy | ✅ | Parent/Child hierarchy exists. Basic fields covered. |
| | 10 | Asset Meters & Readings | ⚠️ | Basic recording exists. **Gap**: No rollup logic, no resetting counters, no gauge validation. |
| | 13 | Asset Health / IoT | ❌ | **Gap**: No real-time health score, no IoT ingestion endpoint. |
| **Preventive Maintenance** | 3 | PM Definitions | ⚠️ | Time-based exists. **Gap**: No Meter-based, no "Floating" vs "Fixed" interval logic. |
| | 13 | Forecasting | ❌ | **Gap**: No graphical forecast view, no "suppression" of lower-level PMs (e.g. annual suppresses monthly). |
| **Corrective Maintenance** | 10 | Service Requests | ✅ | Portal -> Queue -> WO workflow is solid. |
| | 11 | Triage & Dispatch | ❌ | **Gap**: No "Dispatch Console". Manual assignment only. |
| **Work Execution** | 10 | Work Orders | ⚠️ | Basic Header/Ops/Mat/Res exists. **Gap**: No "Work Definition" library (templates) reuse. |
| | 7 | Inspections / QA | ❌ | **Gap**: No checklists, no pass/fail criteria, no "Quality Plans". |
| | 14 | Safety & Permits | ❌ | **Critical Gap**: No Lockout/Tagout (LOTO), no Permit to Work (PTW). |
| **Supply Chain Integration** | 7 | Spare Parts | ✅ | Inventory linkage exists. Reserved/Issued logic working. |
| | 7 | Direct Procurement | ❌ | **Gap**: Cannot raise Requisition (PR) for non-stock items directly from WO. |
| **Resource Management** | 10 | Labor Booking | ✅ | Technician assignment & actuals logging functional. |
| | 9 | Shifts & Calendars | ❌ | **Gap**: No awareness of Tech availability/skills (Certification). |
| **Costing & Accounting** | 12 | Maintenance Costing | ❌ | **Major Gap**: No aggregation of Mat + Labor -> WIP -> Expense. No GL Integration. |
| | 12 | Capitalization | ❌ | **Gap**: No logic to capitalize overhaul costs to Asset Book Value. |
| **User Experience** | 15 | Mobile / Offline | ❌ | **Gap**: Desktop only. Maintenance happens in the field; offline mode is mandatory for Tier-1. |
| | 7 | Scheduling Board | ❌ | **Gap**: No Drag-and-Drop Gantt chart for Planners. |

---

## 3. Level-15 Canonical Decomposition

### Level 1: Module Domain
**Maintenance & Facilities Management**
*   **Current State**: Focused on "Execution" and "Basic Planning".
*   **Target**: Asset Lifecycle Management (ALM) covering Acquire -> Operate -> Maintain -> Dispose.

### Level 2: Sub-Domains
1.  **Asset Information Management** (Implemented)
2.  **Work Management** (Partially Implemented)
3.  **Materials Management** (Implemented)
4.  **Maintenance Costing** (MISSING)
5.  **Reliability Engineering** (MISSING)

### Level 3: Functional Capabilities
*   **PM Schedules**: Currently supports `Fixed Interval`. Needs `Floating Interval`, `Meter-Based`, `Condition-Based`.
*   **Work Execution**: Supports `Complete`. Needs `Release`, `Hold`, `Cancel`, `Rollback`.
*   **Failure Analysis**: Needs `Failure Codes` (Problem/Cause/Remedy) library for root cause analysis.

### Level 4: Business Use Cases
*   **Scenario A (Emergency)**: Breakdown -> SR -> Emergency WO -> Execute -> Fix. (Matches Current)
*   **Scenario B (Planned)**: PM Forecast -> Generate WOs -> Balance Load -> Material Pick -> Execute. (Gap: Load Balancing)
*   **Scenario C (Refurbishment)**: Asset Return -> Decon -> Repair -> Return to Stock. (Gap: Return to Inventory)

### Level 5: User Personas
*   **Maintenance Manager**: Needs Dashboard (KPIs: MTBF, MTTR).
*   **Planner**: Needs Gantt Scheduler & Material Availability Report.
*   **Technician**: Needs Mobile App with "My Work" list & Barcode Scanner.
*   **Requester**: Needs Service Portal (Implemented).

### Level 6: UI Surfaces
*   `CMMSMaintenance.tsx`: Main Hub.
*   `MaintenanceDetailSheet.tsx`: Execution Surface.
*   `ServiceRequestPortal.tsx`: Intake Surface.
*   **MISSING**: `SchedulingBoard.tsx`, `AssetHealth360.tsx`, `CostAnalysis.tsx`.

### Level 7: UI Components
*   **Inputs**: Needs rich text for "Work Instructions" (Images/PDFs).
*   **Grids**: Current grids need server-side pagination for >10k assets.
*   **Visuals**: Needs "Equipment Hierarchy Tree" visualizer.

### Level 8: Configuration
*   **Needed**: `Work Order Types`, `Priorities`, `Failure Code Sets`, `Maintenance Plant Parameters`.

### Level 9: Master Data
*   **Assets**: Implemented.
*   **Resources**: Implemented (Users).
*   **Work Centers**: MISSING (Grouping resources by location).

### Level 10: Transactional Objects
*   **Work Order**: The core object. Needs `Status History` table.
*   **Operation**: Needs `Standard Operations` library references.

### Level 11: Workflow & Controls
*   **Approvals**: Needs 'Release' gate (e.g., if cost > $5k, Manager approval required).
*   **Status Transitions**: Needs State Machine validation (can't go `Draft` -> `Closed`).

### Level 12: Accounting & Rules
*   **Costing**:
    *   `Mat Cost` = Qty * Moving Avg Cost.
    *   `Labor Cost` = Hours * Resource Rate.
    *   `Overhead` = % of Labor.
    *   **GL Entries**: Dr Maint Expense / Cr Inventory (Mat), Cr Absorption (Lab).

### Level 13: AI / Automation
*   **Current**: None.
*   **Target**:
    *   "Predictive Asset Health" (using Meter history).
    *   "Smart Scheduling" (assign tech based on skills/location).

### Level 14: Security & Audit
*   **RBAC**: Technicians should only see assigned WOs.
*   **Audit**: "Who changed the planned start date?" (Full Field History).

### Level 15: Performance & Scalability
*   **Volume**: 50k Assets, 100k WOs/year.
*   **Strategy**: Archive `Closed` WOs to historical tables. Index `asset_id` and `status`.

---

## 4. Remediation Roadmap (Phased)

### Phase A: Costing & Accounting (Priority: High)
*   **Objective**: Financial accountability.
*   **Tasks**:
    1.  Create `maint_work_order_costs` table (buckets: Mat, Lab, Equip).
    2.  Implement `CostCalculator` service runs on every Transaction.
    3.  Integrate with GL (Journal creation).

### Phase B: Planning & Scheduling (Priority: Medium)
*   **Objective**: Efficient resource usage.
*   **Tasks**:
    1.  Implement `Work Center` master data.
    2.  Build `SchedulingBoard` (React Big Calendar / Gantt).
    3.  Implement "Mass Release" of PMs.

### Phase C: Quality & Safety (Priority: Medium)
*   **Objective**: Compliance.
*   **Tasks**:
    1.  Create `maint_inspection_plans` (Questions/Pass-Fail).
    2.  Implement `maint_permits` (LOTO associations).

### Phase D: Mobile & Offline (Priority: Low / Future)
*   **Objective**: Field efficiency.
*   **Tasks**: PWA implementation with LocalStorage sync.

---

## 5. Build-Ready Task List (Next Steps)
1.  **Refactor**: Rename `MaintenanceService` methods to be more granular (`WorkOrderService`, `AssetService`).
2.  **Schema**: Add `maint_costs` and `maint_definitions` (Templates).
3.  **UI**: Build `CostAnalysis` tab in WO Detail.

**Verdict**: ⚠️ **Conditionally Ready**. Foundation is solid, but Financial and Compliance layers are missing for Enterprise deployment.
