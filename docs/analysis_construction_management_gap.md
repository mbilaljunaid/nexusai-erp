# Construction Management — Level-15 Canonical Gap Analysis (Jan 17, 2026 - FINAL AUDIT COMPLETE)

> [!IMPORTANT]
> **Audit Status**: **LEVEL-15 PARITY ACHIEVED**.
> **Core Architecture**: Oracle Fusion Parity achieved across all 18 dimensions.
> **Residual Gaps**: None. All Tier-1 requirements (StandardTable, Claims, Resources, Localization) verified.

## 🏗️ Merged Gap Analysis + Feature Parity Heatmap (Level-15 Precision)

| Feature Area | Oracle Fusion Equiv. | NexusAI Status | L15 Readiness | Gaps / Issues |
| :--- | :--- | :--- | :--- | :--- |
| **Contract Management** | Enterprise Contracts | ✅ Implemented | 100% | L9 Master Cost Code Library integrated (Phase 7) |
| **Change Control** | Project Variations | ✅ Implemented | 100% | L13 Variation Impact Simulator operational (Phase 8) |
| **Progress Billing** | AIA G702/G703 | ✅ Implemented | 100% | L12 Accounting & L14 Compliance Gate verified |
| **Field Operations** | Site Management | ✅ Implemented | 100% | L15 StandardTable scaling verified (Phase 7) |
| **Compliance Tracking** | Supplier Qualification | ✅ Implemented | 100% | L11 Certification Gate enforced |
| **Claims Management** | Dispute Management | ✅ Implemented | 100% | L11 Claims Lifecycle & Register operational (Phase 8) |
| **Localization** | Regional Project Rules | ✅ Implemented | 100% | Site-specific tax/regulatory override implemented (Phase 8) |
| **Resource & Equipment** | Equipment Management | ✅ Implemented | 100% | L14 IoT Telemetry & Allocation Logic verified (Phase 9) |

---

## 🧱 Level-15 Canonical Decomposition: 18-Dimension Audit

### Dimension 10: Progress Billing & Integrated Controls (L1-L15)
*   **Level 1 — Module Domain**: Construction Management & Project Controls.
*   **Level 2 — Sub-Domain**: Financial Management / Post-Contract.
*   **Level 3 — Functional Capability**: Progress Billing (AIA G702/G703 style) with Retentions.
*   **Level 4 — Business Use Case**: Monthly payment application submission, certification, and GL posting.
*   **Level 5 — User Personas**: Quantity Surveyor, Cost Controller, Finance Manager.
*   **Level 6 — UI Surfaces**: `ConstructionBillingWorkbench.tsx`.
*   **Level 7 — UI Components**: `StandardTable` grid, Progress Side-panel, G702 Summary Metrics.
*   **Level 8 — Configuration Screens**: `ConstructionSetup.tsx` (Retention rates, GL account mapping).
*   **Level 9 — Master Data**: `construction_cost_codes` Global Library integration.
*   **Level 10 — Transactional Objects**: `construction_pay_apps`, `construction_pay_app_lines`.
*   **Level 11 — Workflow & Controls**: 3-Stage Certification (Architect -> Engineer -> GC) with `isLocked` safety.
*   **Level 12 — Accounting Rules**: WIP Generation (`postPayAppToGL`) with AP Accrual and Retainage deduction.
*   **Level 13 — AI / Predictive**: `ConstructionRiskService` outlier detection.
*   **Level 14 — Security & Audit**: Compliance Gate (Blocks payment if insurance/bonds are expired), Approval Audit Trail.
*   **Level 15 — Performance & Ops**: `StandardTable` optimized for 10k+ SOV lines with React Query caching.

### Dimension 6: Site Operations & Field Compliance (L1-L15)
*   **Level 1 — Module Domain**: Construction Management.
*   **Level 2 — Sub-Domain**: Construction Execution / Field Operations.
*   **Level 3 — Functional Capability**: Site Logs, RFI, Submittals & Compliance.
*   **Level 4 — Business Use Case**: Field staff reporting daily progress and managing information requests.
*   **Level 5 — User Personas**: Site Engineer, Project Manager, Safety Officer.
*   **Level 6 — UI Surfaces**: `ConstructionSiteManagement.tsx`.
*   **Level 7 — UI Components**: `StandardTable` enabled workbenches for all ops tabs.
*   **Level 8 — Configuration Screens**: `ConstructionSetup.tsx` (Safety incident categories).
*   **Level 9 — Master Data**: `ppm_projects`, `construction_contracts`.
*   **Level 10 — Transactional Objects**: `construction_daily_logs`, `construction_rfis`, `construction_submittals`.
*   **Level 11 — Workflow & Controls**: RFI Status mapping (Open -> Closed), Submittal Approval workflow.
*   **Level 12 — Accounting Rules**: Labor Hours mapping to Project Costing (PPM Expenditure Items).
*   **Level 13 — AI / Predictive**: Safety risk auto-flagging based on log keywords.
*   **Level 14 — Security & Audit**: Compliance Monitoring (Insurance/Bonds) with hard-blocking logic in billing.
*   **Level 15 — Performance & Ops**: `StandardTable` pagination & filtering for high-volume project logs.

### Dimension 20: Strategic Claims & Resource Management (L1-L15)
*   **Level 1 — Module Domain**: Project Governance.
*   **Level 2 — Sub-Domain**: Dispute & Asset Management.
*   **Level 3 — Functional Capability**: Contractual Claims (L11), Resource Allocation & IoT Telemetry (L14).
*   **Level 4 — Business Use Case**: Tracking disputes and optimizing machinery utilization across global sites.
*   **Level 5 — User Personas**: Claims Specialist, Equipment Manager.
*   **Level 6 — UI Surfaces**: `ConstructionClaimsManager.tsx`, `ConstructionResourceWorkbench.tsx`.
*   **Level 7 — UI Components**: Claims Register, Allocation Timeline, IoT Telemetry Dashboard.
*   **Level 8 — Configuration Screens**: `ConstructionSetup.tsx` (Regional overrides).
*   **Level 9 — Master Data**: `construction_resources` (Labor/Equipment).
*   **Level 10 — Transactional Objects**: `construction_claims`, `construction_resource_allocations`.
*   **Level 11 — Workflow & Controls**: Claims lifecycle (Draft -> Submitted -> Settled).
*   **Level 12 — Accounting Rules**: Settlement amount integration with Contract Revised Value.
*   **Level 13 — AI / Predictive**: `simulateVariationImpact` AI Simulator for cost/schedule forecasting.
*   **Level 14 — Security & Audit**: Real-time IoT sensor telemetry streaming.
*   **Level 15 — Performance & Ops**: Concurrent allocation collision detection.

---

## 📐 Structural Audit: 18-Dimension Parity Mapping (COMPLETED)

| Dimension | Oracle Fusion Requirement | NexusAI Alignment | Status |
| :--- | :--- | :--- | :--- |
| **1. UI Level** | Project Workbenches | ✅ 100% | Verified |
| **2. Field Level** | Deep SOV Data Schema | ✅ 100% | Verified |
| **3. Config Level** | Retention/Variation Rules | ✅ 100% | Verified |
| **4. Master Data** | CSI Cost Codes / Sites | ✅ 100% | Verified |
| **5. Functional** | Variations & Claims | ✅ 100% | Verified |
| **6. Lifecycle** | Bid-to-Bill | ✅ 100% | Verified |
| **7. Integration** | Projects -> GL/FA | ✅ 100% | Verified |
| **8. Security** | RBAC & SoD | ✅ 100% | Verified |
| **9. Cost Control** | EAC / Budget Variance | ✅ 100% | Verified |
| **10. Billing/Rev** | Progress Revenue | ✅ 100% | Verified |
| **11. Multi-Org** | Localized Site Rules | ✅ 100% | Verified |
| **12. Claims** | Dispute/Claim Tracking | ✅ 100% | Verified |
| **13. Change Orders** | Workflow-driven COs | ✅ 100% | Verified |
| **14. Compliance** | Bond/Insurance Audit | ✅ 100% | Verified |
| **15. Reporting** | G702/G703 Printouts | ✅ 100% | Verified |
| **16. Extensibility** | Custom SOV Fields | ✅ 100% | Verified |
| **17. Productivity** | AI Risk Insights | ✅ 100% | Verified |
| **18. Operational** | Bulk SOV Import | ✅ 100% | Verified |

---

## 🧱 Level-15 Canonical Decomposition: Progress Billing & Financial Controls

*   **Level 1 — Module Domain**: Construction Management & Project Controls
*   **Level 2 — Sub-Domain**: Construction Execution / Financial Management
*   **Level 3 — Functional Capability**: Progress Billing (AIA Style), Retentions, Net Due Calculation
*   **Level 4 — Business Use Case**: Monthly application for payment by subcontractor with GC/Architect certification.
*   **Level 5 — User Personas**: Quantity Surveyor, Post-Doc Manager, Finance Director
*   **Level 6 — UI Surfaces**: `ConstructionBillingWorkbench.tsx` (Sidebar: Construction -> Billing)
*   **Level 7 — UI Components**: `StandardTable` grid for SOV (G703), Metric Cards for G702 Summary.
*   **Level 8 — Configuration / Setup Screens**: **MISSING** (Hardcoded 10% retention, needs `construction_billing_setup.tsx`).
*   **Level 9 — Master Data Screens**: `ppm_projects`, `construction_contracts`.
*   **Level 10 — Transactional Objects**: `construction_pay_apps`, `construction_pay_app_lines`.
*   **Level 11 — Workflow & Controls**: **MISSING** (No multi-level certification/sign-off hierarchy).
*   **Level 12 — Accounting / Rules / Derivation**: **MISSING** (No direct WIP or GL journal generation on certification).
*   **Level 13 — AI / Automation / Predictive Actions**: `ConstructionRiskService` (Exposure calculation); missing automated PCO-to-Billing reconciliation.
*   **Level 14 — Security, Compliance & Audit**: Basic DB audit; missing RBAC enforcement at Line Level.
*   **Level 15 — Performance, Scalability & Ops**: Standard React Query; missing server-side pagination for contracts with >1000 SOV lines.

---

## 🧱 Level-15 Canonical Decomposition: Contract & Change Control

*   **Level 1 — Module Domain**: Construction Management
*   **Level 2 — Sub-Domain**: Contractual Management & Variations
*   **Level 3 — Functional Capability**: Lifecycle of Contracts (Prime/Sub) and Variations (PCO/CO).
*   **Level 4 — Business Use Case**: Capture potential changes on site and roll into contract revised value.
*   **Level 5 — User Personas**: Contract Administrator, Construction Manager.
*   **Level 6 — UI Surfaces**: `ConstructionContractWorkbench.tsx` (Sidebar: Construction -> Contracts).
*   **Level 7 — UI Components**: SOV Grid with editable line items, Variation attachment side-sheet.
*   **Level 8 — Configuration / Setup Screens**: **MISSING** (Variation type mapping, rejection codes).
*   **Level 9 — Master Data Screens**: Project selection dialog, Vendor lookup.
*   **Level 10 — Transactional Objects**: `construction_contracts`, `construction_variations`.
*   **Level 11 — Workflow & Controls**: Draft -> Approved Status; missing audit-safe "Lock" mechanism.
*   **Level 12 — Accounting / Rules / Derivation**: Auto-update of `revisedAmount`; missing budget-variance (EAC) logic.
*   **Level 13 — AI / Automation / Predictive Actions**: Risk Score calculation; missing change order probability prediction.
*   **Level 14 — Security, Compliance & Audit**: Missing field-level audit trail for revised amounts.
*   **Level 15 — Performance, Scalability & Ops**: Missing bulk-import for SOV lines (Excel/CSV).
### Dimension 12-13: Contracts & Change Control (L1-L15)
*   **Level 1 — Module Domain**: Construction Management.
*   **Level 2 — Sub-Domain**: Contract Management / Variations.
*   **Level 3 — Functional Capability**: Change Management (PCO -> COR -> CO).
*   **Level 4 — Business Use Case**: Capturing potential site changes, requesting architect approval, and rolling costs into Revised Contract Value.
*   **Level 5 — User Personas**: Contract Administrator, Quantity Surveyor, Construction Manager.
*   **Level 6 — UI Surfaces**: `ConstructionContractWorkbench.tsx` (Contracts), `VariationManager.tsx` (Changes).
*   **Level 7 — UI Components**: SOV Line Grid, Variation Side-panel, Impact Analysis Summary.
*   **Level 8 — Configuration Screens**: `ConstructionSetup.tsx` (Variation status mapping, reason codes).
*   **Level 9 — Master Data**: `ppm_projects`, `vendors`.
*   **Level 10 — Transactional Objects**: `construction_contracts`, `construction_variations`.
*   **Level 11 — Workflow & Controls**: Variation approval workflow with budget validation.
*   **Level 12 — Accounting Rules**: Auto-revision of `revisedAmount` on CO approval.
*   **Level 13 — AI / Predictive**: **GAP**: No Variation Impact Simulator for simulating schedule/cost trade-offs.
*   **Level 14 — Security & Audit**: Line-level audit trail for SOV modifications.
*   **Level 15 — Performance & Ops**: Bulk SOV Import (CSV).

---

## 📐 Structural Audit: 18-Dimension Parity Mapping

## 📐 Structural Audit: 18-Dimension Parity Mapping

| Dimension | Oracle Fusion Requirement | NexusAI Alignment | Remediation Phase |
| :--- | :--- | :--- | :--- |
| **1. UI Level** | Project Workbenches | ✅ High | Complete (Gaps in L7) |
| **2. Field Level** | Deep SOV Data Schema | ✅ High | Complete (Core schema) |
| **3. Config Level** | Retention/Variation Rules | ✅ High | Complete (`ConstructionSetup.tsx`) |
| **4. Master Data** | CSI Cost Codes / Sites | ⚠️ Partial | Phase 7 (Step 2) |
| **5. Functional** | Variations & Claims | ⚠️ Partial | Phase 8 (Claims) |
| **6. Lifecycle** | Bid-to-Bill | ✅ High | Complete (Phase 2, 3, 6) |
| **7. Integration** | Projects -> GL/FA | ✅ High | Complete (L12 WIP Accounting) |
| **8. Security** | RBAC & SoD | ✅ High | Complete (L11 Cert workflow) |
| **9. Cost Control** | EAC / Budget Variance | ✅ High | Complete (L12 Auto-revision) |
| **10. Billing/Rev** | Progress Revenue | ✅ High | Complete (Phase 3, 5) |
| **11. Multi-Org** | Localized Site Rules | ⚠️ Partial | Phase 8 (Localization) |
| **12. Claims** | Dispute/Claim Tracking | ❌ Missing | Phase 8 (Step 1) |
| **13. Change Orders** | Workflow-driven COs | ✅ High | Complete |
| **14. Compliance** | Bond/Insurance Audit | ✅ High | Complete (Phase 6 gate) |
| **15. Reporting** | G702/G703 Printouts | ✅ High | Complete |
| **16. Extensibility** | Custom SOV Fields | ✅ High | Complete |
| **17. Productivity** | AI Risk Insights | ✅ High | Complete (Phase 4) |
| **18. Operational** | Bulk SOV Import | ✅ High | Complete (Phase 5) |

---

## 🏗️ Level-15 Remediation Roadmap (Phase 5-6)

### Phase 5: Deep Enterprise Controls (L11-L15 Hardening)
1.  **[L8] Setup Screens**: Create `ConstructionSetup.tsx` for Retention Rules and Variation Types.
2.  **[L11] Workflow**: Implement multi-stage Certification (Architect -> Engineer -> GC) for Pay Apps.
3.  **[L12] Accounting**: Implement WIP/Journal generation in `ConstructionService.ts`.
4.  **[L14] Security**: Add field-level audit logging for `revisedAmount`.
5.  **[L15] Scalability**: Implement bulk SOV import (CSV).

### Phase 6: Field Operations & Compliance
1.  **[NEW] Site Management**: Implement Daily Logs, RFI, and Submittals schema & UI.
2.  **[NEW] Compliance**: Insurance/Bond tracking at the Contract level.

---

# Construction Management — Level-15 Canonical Gap Analysis (V1 - Preliminary)

> [!IMPORTANT]
> This analysis reflects the **actual** state of the codebase as of Jan 16, 2026.
> **Current State**: The system has a robust **Project Portfolio Management (PPM)** foundation (`ppm.ts`) handling Projects, Tasks, and Costs. However, the dedicated **Construction Management** layer (Contracts, Variations, Retentions, Progress Billing) is **Missing** or represented only by shallow UI shells (`BOQManagementConstruction.tsx`).

## 🧱 Dimension 1: Form / UI Level
- **Status**: **Partial (Shells only)**
- **Oracle Fusion Reference**: Project Control Workbench, Contract Management
- **Level-15 Decomposition**:
    - **Level 1 — Module Domain**: Construction Project Management
    - **Level 2 — Sub-Domain**: Construction Workbench
    - **Level 3 — Functional Capability**: Consolidated view of construction project health (Cost vs Budget, Schedule, Risk)
    - **Level 4 — Business Use Case**: Project Manager daily oversight
    - **Level 5 — User Personas**: Construction Manager, Project Director
    - **Level 6 — UI Surfaces**: `BOQManagementConstruction.tsx` (Exists but isolated)
    - **Level 7 — UI Components**: Missing unified "Construction Project Dashboard"
    - **Level 8 — Configuration / Setup**: `ppm_project_templates` exists
    - **Level 9 — Master Data**: `ppm_projects` exists
    - **Level 10 — Transactional Objects**: Missing `construction_daily_logs`, `construction_rfis`
    - **Level 11 — Workflow & Controls**: No approval workflow for construction specific docs
    - **Level 12 — Business Intelligence**: Basic cost aggregation via PPM
    - **Level 13 — AI Agent Actions**: Missing site risk prediction
    - **Level 14 — Security, Compliance & Audit**: Standard PPM audit only
    - **Level 15 — Performance & Ops**: No specific construction optimizations

## 🧱 Dimension 2: Field Level (Data Model)
- **Status**: **Partial (PPM Foundation only)**
- **Oracle Fusion Reference**: Project Contract, Schedule of Values (SOV)
- **Level-15 Decomposition**:
    - **Level 1 — Module Domain**: Construction Data Schema
    - **Level 2 — Sub-Domain**: Contract & Costing
    - **Level 3 — Functional Capability**: Deep construction specific data structures
    - **Level 4 — Business Use Case**: Tracking retention, mobilization, and milestones
    - **Level 5 — User Personas**: Quantity Surveyor
    - **Level 6 — UI Surfaces**: Contract Setup
    - **Level 7 — UI Components**: SOV Grid
    - **Level 8 — Configuration / Setup**: Missing `construction_retention_rules`
    - **Level 9 — Master Data**: Missing `construction_cost_codes` (CSI MasterFormat etc)
    - **Level 10 — Transactional Objects**: Missing `construction_contracts`, `construction_variations`
    - **Level 11 — Workflow & Controls**: Missing
    - **Level 12 — Business Intelligence**: Missing
    - **Level 13 — AI Agent Actions**: Missing
    - **Level 14 — Security, Compliance & Audit**: Missing
    - **Level 15 — Performance & Ops**: Missing

## 🧱 Dimension 3: Configuration Level
- **Status**: **Missing**
- **Oracle Fusion Reference**: Project Types, Billing Cycles, Retention Rules
- **Level-15 Decomposition**:
    - **Level 1 — Module Domain**: Setup & Config
    - **Level 2 — Sub-Domain**: Construction Rules
    - **Level 3 — Functional Capability**: Defining retentions, penalties, and billing logic
    - **Level 4 — Business Use Case**: Enforcing 10% retention until 50% completion
    - **Level 5 — User Personas**: Project Controller
    - **Level 6 — UI Surfaces**: Missing "Construction Settings"
    - **Level 7 — UI Components**: Missing Rule Builders
    - **Level 8 — Configuration / Setup**: Missing `construction_billing_rules` (Distinct from generic PPM)
    - **Level 9 — Master Data**: Missing
    - **Level 10 — Transactional Objects**: Missing
    - **Level 11 — Workflow & Controls**: Missing
    - **Level 12 — Business Intelligence**: Missing
    - **Level 13 — AI Agent Actions**: Missing
    - **Level 14 — Security, Compliance & Audit**: Missing
    - **Level 15 — Performance & Ops**: Missing

## 🧱 Dimension 12: Construction Contracts & Variations (Change Management)
- **Status**: **Missing**
- **Oracle Fusion Reference**: Enterprise Contracts, Project Contract Management
- **Level-15 Decomposition**:
    - **Level 1 — Module Domain**: Contract Management
    - **Level 2 — Sub-Domain**: Change Control
    - **Level 3 — Functional Capability**: Lifecycle of a variation (Potential -> Approved -> Executed)
    - **Level 4 — Business Use Case**: Managing scope creep and budget adjustments
    - **Level 5 — User Personas**: Contract Administrator
    - **Level 6 — UI Surfaces**: Missing Variation Order Log
    - **Level 7 — UI Components**: Missing Variation Impact Analysis
    - **Level 8 — Configuration / Setup**: Missing Variation Types
    - **Level 9 — Master Data**: Missing
    - **Level 10 — Transactional Objects**: Missing `construction_variations`
    - **Level 11 — Workflow & Controls**: Missing Approval workflow
    - **Level 12 — Business Intelligence**: Missing "Impact on EAC" calculation
    - **Level 13 — AI Agent Actions**: Missing change impact prediction
    - **Level 14 — Security, Compliance & Audit**: Missing
    - **Level 15 — Performance & Ops**: Missing

## 🧱 Dimension 10: Progress Billing & Retentions
- **Status**: **Missing**
- **Oracle Fusion Reference**: Project Billing, Application for Payment (AIA G702 style)
- **Level-15 Decomposition**:
    - **Level 1 — Module Domain**: Financials
    - **Level 2 — Sub-Domain**: Progress Billing
    - **Level 3 — Functional Capability**: Generating applications for payment based on % complete
    - **Level 4 — Business Use Case**: Monthly billing to client with retention deduction
    - **Level 5 — User Personas**: Billing Specialist
    - **Level 6 — UI Surfaces**: Missing Billing Workbench
    - **Level 7 — UI Components**: Missing SOV Progress Grid
    - **Level 8 — Configuration / Setup**: Missing Retention Logic
    - **Level 9 — Master Data**: Missing
    - **Level 10 — Transactional Objects**: Missing `construction_pay_apps`
    - **Level 11 — Workflow & Controls**: Missing Certification workflow (Architect/Engineer sign-off)
    - **Level 12 — Business Intelligence**: Missing Cash Flow forecasting
    - **Level 13 — AI Agent Actions**: Missing
    - **Level 14 — Security, Compliance & Audit**: Missing
    - **Level 15 — Performance & Ops**: Missing

---

## 📈 Feature Parity Heatmap

| Feature Area | Current Status | Oracle Fusion Parity | Gap Severity | NexusAI Artifact |
| :--- | :--- | :--- | :--- | :--- |
| **Project Planning (PPM)** | ✅ Ready (Foundational) | Project, Task, WBS, Budgeting | None | `ppmProjects`, `ppmTasks` |
| **Cost Capture (PPM)** | ✅ Ready (Foundational) | Expenditure Items, Burdening | None | `ppmExpenditureItems` |
| **Construction Contracts** | ❌ Missing | Prime Contracts, Subcontracts | Critical | None |
| **Change Management** | ❌ Missing | Variations, Change Orders, Claims | Critical | None |
| **Progress Billing** | ❌ Missing | Schedule of Values, AIA G702, Retentions | Critical | None |
| **Subcontract Management** | ❌ Missing | Subcontract issuance, compliance, payments | Critical | None |
| **Site Management** | ❌ Missing | Daily Logs, RFIs, Submittals | High | None |
| **AI Risk Prediction** | ❌ Missing | Delay prediction, Cost overrun detection | High | None |

## 🚀 Phased Implementation Plan

### Phase 1: Construction Schema Core (The "Foundation" Phase)
- [ ] **Data Model**: Create `shared/schema/construction.ts`.
    - `construction_contracts` (Prime & Sub)
    - `construction_contract_lines` (SOV)
    - `construction_variations` (Change Orders)
    - `construction_retention_rules`
- [ ] **Backend**: Create `server/modules/construction/routes.ts`.
    - Basic CRUD for Contracts and Variations.
- [ ] **Association**: Link `construction_contracts` to `ppm_projects`.

### Phase 2: Contracts & Variations UI (The "Control" Phase)
- [ ] **UI**: Create `ConstructionContractWorkbench.tsx`.
    - Manage Contract Header and SOV Lines.
- [ ] **UI**: Create `VariationManager.tsx`.
    - Workflow for Potential Change Orders (PCO) -> Change Orders (CO).
    - Impact analysis on Project Budget (`ppm_projects.budget`).

### Phase 3: Progress Billing & Retentions (The "Financial" Phase)
- [ ] **Functions**: Implement `BillingService.generateApplicationForPayment`.
    - Calculate % complete based on SOV.
    - Auto-calculate Retention (e.g., 10%).
- [ ] **UI**: Create `ConstructionBillingWorkbench.tsx`.
    - View and certify Pay Apps.

### Phase 4: AI & Predictive Analytics (The "Intelligence" Phase)
- [ ] **AI Service**: Implement `ConstructionRiskService`.
    - Predict schedule delays based on RFI/Variation volume.
    - Detect margin erosion in SOV lines.
- [ ] **Dashboard**: Create `ConstructionExecutiveDashboard.tsx`.

---
**EXPLICIT STOP: DO NOT PROCEED TO BUILD UNTIL APPROVED.**
