# Construction Management — Level-15 Canonical Gap Analysis (V2 - Parity Audit)

> [!IMPORTANT]
> **Audit Date**: Jan 16, 2026
> **Scope**: Oracle Fusion Construction & Project Control Parity
> **Status**: **Phase 1-4 Implementation Complete**. Basic Contract, Variation, Billing, and AI Risk modules exist. **Gap**: Deep enterprise controls (L11-15) and specific field-ops (Site Management) are still missing.

## 🏗️ Merged Gap Analysis + Feature Parity Heatmap (Enterprise Edition)

| Feature Area | Oracle Fusion Equiv. | NexusAI Status | L15 Readiness | Gaps / Issues |
| :--- | :--- | :--- | :--- | :--- |
| **Contract Management** | Enterprise Contracts | ✅ Implemented | 85% | Missing detailed L11 (Approval Hierarchy) & L14 (SoD) |
| **Change Control** | Project Variations | ✅ Implemented | 80% | Missing L13 (Variation Impact Simulator) |
| **Progress Billing** | AIA G702/G703 | ✅ Implemented | 90% | Missing L12 (Automated WIP/Revenue integration) |
| **Retention Mgmt** | Retention Accounting | ✅ Implemented | 95% | Basic logic done; missing L15 scalability for 10k+ lines |
| **Site Management** | Field Operations | ❌ Missing | 0% | No Daily Logs, RFIs, or Submittals |
| **Subcontractor Comp.** | Supplier Compliance | ❌ Missing | 0% | No Insurance/Certification tracking at Contract level |
| **Predictive Risk** | Project Analytics | ✅ Implemented | 75% | `ConstructionRiskService` exists; missing L13 auto-rollback |

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


## 📐 Structural Audit: 18-Dimension Parity Mapping

| Dimension | Oracle Fusion Requirement | NexusAI Alignment | Remediation Phase |
| :--- | :--- | :--- | :--- |
| **1. UI Level** | Project Workbenches | ✅ High | Phase 2, 3, 4 |
| **2. Field Level** | Deep SOV Data Schema | ✅ High | Phase 1 (Core schema done) |
| **3. Config Level** | Retention/Variation Rules | ❌ Missing | Phase 5 (Step 1) |
| **4. Master Data** | CSI Cost Codes / Sites | ❌ Missing | Phase 6 (Step 1) |
| **5. Functional** | Variations & Claims | ✅ Partial | Phase 2 (PCO done), Phase 6 (Claims) |
| **6. Lifecycle** | Bid-to-Bill | ✅ Partial | Phase 2, 3 Done |
| **7. Integration** | Projects -> GL/FA | ❌ Missing | Phase 5 (Step 3) |
| **8. Security** | RBAC & SoD | ✅ Partial | Phase 5 (Step 4) |
| **9. Cost Control** | EAC / Budget Variance | ✅ Partial | Phase 4 (AI Score), Phase 5 (Logic) |
| **10. Billing/Rev** | Progress Revenue | ✅ Partial | Phase 3 Done, Phase 5 (Rev Rec) |
| **11. Multi-Org** | Localized Site Rules | ❌ Missing | Phase 7 (Localization) |
| **12. Claims** | Dispute/Claim Tracking | ❌ Missing | Phase 6 (Step 1) |
| **13. Change Orders** | Workflow-driven COs | ✅ High | Phase 2 Done |
| **14. Compliance** | Bond/Insurance Audit | ❌ Missing | Phase 6 (Step 2) |
| **15. Reporting** | G702/G703 Printouts | ✅ High | Phase 3 (UI Layouts) |
| **16. Extensibility** | Custom SOV Fields | ✅ Medium | Standard Drizzle/TS Extension |
| **17. Productivity** | AI Risk Insights | ✅ High | Phase 4 Done |
| **18. Operational** | Bulk SOV Import | ❌ Missing | Phase 5 (Step 5) |

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
