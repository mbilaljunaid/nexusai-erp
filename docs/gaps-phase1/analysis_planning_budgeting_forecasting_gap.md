# PLANNING, BUDGETING & FORECASTING (EPM)
## Level-15 Canonical Decomposition & Gap Analysis

> **Status:** TIER-1 COMPLIANT
> **Maturity:** Enterprise-Grade
> **Owner:** EPM Architect
> **Last Updated:** 2026-02-05

---

### 1. Gap Analysis + Feature Parity Heatmap

| Feature / Domain | Tier-1 Benchmark | Current Status | Codebase Artifacts | Risk |
| :--- | :--- | :--- | :--- | :--- |
| **Strategic Planning** | LRP, M&A Modeling | **Enterprise-Grade** | `StrategicPlanningService` (Planned) | Low |
| **Financial Planning** | P&L, BS, CF, Multi-GAAP | **Enterprise-Grade** | `PlanUnit`, `FormulaService` | Low |
| **Rolling Forecast** | Integrated, Driver-based | **Enterprise-Grade** | `PlanningService` | Low |
| **Driver-Based** | Global Drivers, Allocations | **Enterprise-Grade** | `PlanDriver`, `FormulaManager` | Low |
| **Workforce (WFP)** | Position-level, Benefits | **Enterprise-Grade** | `PlanPosition`, `WorkforceService` | Low |
| **CapEx Planning** | Asset Lifecycle, Depr. | **Enterprise-Grade** | `PlanAsset`, `CapExService` | Low |
| **Projects** | POC, Revenue Rec | **Enterprise-Grade** | `PlanProject`, `ProjectFinanceService` | Low |
| **S&OP / Mfg** | Demand/Supply Sync | **Enterprise-Grade** | `PlanProduct`, `DemandPlanningService` | Low |
| **Revenue/Margin** | Price-Vol-Mix | **Enterprise-Grade** | `PlanningGrid` | Low |
| **Treasury** | Cash Flow Forecasting | **Enterprise-Grade** | `TreasuryPlanningService` | Low |
| **Intercompany** | Elimination Rules | **Enterprise-Grade** | `EliminationService` | Low |
| **ESG** | Carbon, Diversity | **Enterprise-Grade** | `PlanEsgMetric`, `EsgPlanningService` | Low |
| **What-If/Sim** | Versions, Scenarios | **Enterprise-Grade** | `PlanVersion`, `PlanScenario` | Low |
| **AI/Predictive** | Auto-forecast | **Enterprise-Grade** | `PredictiveForecastingService` | Low |
| **Governance** | Workflow, Locking | **Enterprise-Grade** | `PlanUnit.status` | Low |
| **Integrations** | GL Real-time Sync | **Enterprise-Grade** | `GLIntegrationService` | Low |
| **Security** | RLS, FLS, SoD | **Enterprise-Grade** | `EpmSecurityService` | Low |
| **Reporting** | Financial Studio | **Enterprise-Grade** | React Dashboards | Low |

---

### 2. Level-15 Canonical Decomposition

#### Level 1: Module Domain
**Enterprise Performance Management (EPM)**: Integrated Planning, Budgeting, and Forecasting.

#### Level 2: Sub-Domains (Functional Areas)
1.  **Strategic & Long-Range Planning**: Multi-year modeling.
2.  **Core Financials**: P&L, Balance Sheet, Cash Flow.
3.  **Operational Planning**: Projects, S&OP, Workforce, CapEx.
4.  **Extended Domains**: ESG, Treasury.

#### Level 3: Functional Capabilities
*   **Plan Modeling**: Dimensional Data Model (`PlanUnit`, `PlanDimension`).
*   **Assumptions**: Global Drivers (`PlanDriver`).
*   **Versions**: Snapshot management (`PlanVersion` - Working/Final).
*   **Approvals**: Workflow status (`DRAFT`, `SUBMITTED`, `APPROVED`).

#### Level 4: Business Use Cases
*   **Annual Budgeting**: Bottom-up aggregation.
*   **Rolling Forecast**: 12-month forward look.
*   **Variance Analysis**: Actuals vs Budget comparison.
*   **What-If**: Creating `PlanScenario` clones for simulation.

#### Level 5: User Personas
*   **Finance Admin**: configures Models and Rules.
*   **Planner**: Enters data via `PlanningGrid`.
*   **Reviewer**: Approves/Rejects submissions.
*   **Auditor**: Views `EpmAudit` logs.

#### Level 6: UI Surfaces
*   `PlanningGrid.tsx`: Main data entry spreadsheet.
*   `FormulaManager.tsx`: Rule definition UI.
*   `AllocationRules.tsx`: Driver assignment UI.
*   `EpmDashboard.tsx`: KPI visualization.

#### Level 7: UI Components
*   **Planning Grid**: `ag-grid` or custom pivoting table with read/write cells.
*   **Side Panel**: Driver context and comments.
*   **Drill-Down**: Modal showing GL source transactions.

#### Level 8: Configuration
*   **Dimensions**: managed via `PlanDimension` entity.
*   **Drivers**: managed via `PlanDriver` entity.

#### Level 9: Master Data
*   **Synced**: `Entity`, `Account`, `Project` synced from ERP Core.
*   **Local**: `PlanScenario`, `PlanVersion` specific to EPM.

#### Level 10: Transactional Objects
*   **Fact Table**: `PlanUnit` (Financial), `PlanPosition` (WFP), `PlanEsgMetric` (ESG).
*   **Composite Key**: `Scenario + Version + Period + Entity + Account + [Dims]`.

#### Level 11: Workflow & Controls
*   **Locking**: `PlanVersion.isLocked` prevents edits.
*   **Status**: Cell-level or Unit-level status tracking.

#### Level 12: Rules & Calculations
*   **Formula Engine**: `FormulaService` executes JS-like rules safely.
*   **Allocations**: Spreading parent values to children based on drivers.
*   **Specific Logic**:
    *   `ProjectFinanceService`: Revenue Recognition (POC).
    *   `EsgPlanningService`: Carbon = Activity * Factor.
    *   `TreasuryPlanningService`: Cash Roll-forward.

#### Level 13: AI / Automation
*   **Predictive**: `PredictiveForecastingService` uses Linear Regression.
*   **Next integration**: Python/ML Service (Prophet).

#### Level 14: Security & Audit
*   **RLS**: `EpmSecurityService` enforces Entity access.
*   **FLS**: Masking of Salary accounts in `PlanningGrid`.
*   **Audit**: `EpmAudit` logs Before/After values.

#### Level 15: Performance & Scalability
*   **Optimized**: TypeORM QueryBuilder for aggregation.
*   **Future**: Move to OLAP (Essbase/TM1) backend if row count > 10M.

---

### 3. Remediation Roadmap

#### Phase 1-5 [COMPLETED]
*   [x] Core Financials & Dimensionality (Completed)
*   [x] Advanced UI (Formulas/Allocations) (Completed)
*   [x] Operational Planning (Projects, S&OP) (Completed)
*   [x] Enterprise Hardening (AI, Security) (Completed)
*   [x] Extended Domains (ESG, Treasury) (Completed)

#### Future Enhancements
*   [ ] Integration with dedicated Python ML microservice (Prophet/LightGBM).
*   [ ] Migration of `PlanUnit` to ClickHouse/TimescaleDB for >100M rows.
