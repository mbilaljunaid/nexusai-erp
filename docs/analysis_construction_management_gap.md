# Construction Management — Level-15 Canonical Gap Analysis

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
