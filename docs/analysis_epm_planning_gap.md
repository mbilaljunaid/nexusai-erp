# EPM — Planning, Budgeting & Forecasting
## Level-15 Canonical Decomposition & Gap Analysis

> **Status:** DRAFT / INITIAL
> **Maturity:** Tier-1 Target State Defined
> **Owner:** EPM Architect / CFO Office
> **Last Updated:** 2026-02-04

---

### 1. Objective
Produce a Level-15 Canonical Decomposition and Continuous Audit Framework for **Enterprise Performance Management (EPM)**, covering strategic, financial, operational, and workforce planning, fully aligned with ERP execution systems and CFO-grade governance.

### 2. Scope & Coverage
* Enterprise-wide planning and forecasting
* Multi-entity, multi-currency, multi-GAAP environments
* Integrated financial, operational, and workforce planning
* Construction, project-centric, and manufacturing enterprises
* CFO, FP&A, Treasury, Operations, HR, and Executive support

---

### 3. Level-15 Canonical Decomposition

#### Domain 1: Strategic & Long-Range Planning
*   **L1.1 Strategic Modeling**
    *   L2.1.1 Long-Range Plan (LRP) Generation (3-5-10 Year)
    *   L2.1.2 Mergers & Acquisitions (M&A) Simulation
    *   L2.1.3 Capital Structure & Treasury Planning
*   **L1.2 Driver-Based Strategy**
    *   L2.2.1 Macroeconomic Factor Modeling (Inflation, FX, Interest)
    *   L2.2.2 Market Share & Competitive Analysis Modeling
    *   L2.2.3 Product Portfolio Optimization

#### Domain 2: Financial Planning & Budgeting
*   **L1.3 Core Financials**
    *   L2.3.1 P&L Planning (Revenue, COGS, Opex)
    *   L2.3.2 Balance Sheet Planning (Assets, Liabilities, Equity)
    *   L2.3.3 Cash Flow Planning (Direct & Indirect)
*   **L1.4 Budget Control**
    *   L2.4.1 Budget Variance Analysis (BVA) logic
    *   L2.4.2 Zero-Based Budgeting (ZBB) Packages
    *   L2.4.3 Encumbrance & Commitment Control

#### Domain 3: Rolling Forecasting & Reforecasting
*   **L1.5 Continuous Planning**
    *   L2.5.1 Rolling Forecast Logic (12, 18, 24 months)
    *   L2.5.2 Daily/Weekly Sales Flash Reporting
    *   L2.5.3 Dynamic Seeding (Actuals + Forecast)

#### Domain 4: Driver-Based & Scenario Planning
*   **L1.6 Advanced Modeling**
    *   L2.6.1 Global Driver Library (Price, Volume, Headcount)
    *   L2.6.2 Correlation Analysis & Driver Sensitivity
    *   L2.6.3 Goal-Seeking (Target -> Driver Calculation)

#### Domain 5: Workforce & Compensation Planning
*   **L1.7 WFP Core**
    *   L2.7.1 Headcount Planning (New Hires, Terminations, Transfers)
    *   L2.7.2 Compensation Modeling (Salary, Merit, Bonus, Benefits)
    *   L2.7.3 Taxes & Burden Logic (Multi-Jurisdiction)
    *   L2.7.4 Strategic Workforce Planning (Skills Gap Analysis)

#### Domain 6: Capital Expenditure (CapEx) Planning
*   **L1.8 Asset Planning**
    *   L2.8.1 New Asset Requests & ROI Analysis
    *   L2.8.2 Depreciation & Amortization Simulation
    *   L2.8.3 Maintenance & Repair Planning
    *   L2.8.4 Project-Based Capitalization logic

#### Domain 7: Project & Construction Planning
*   **L1.9 Project Financials**
    *   L2.9.1 Project Revenue & Cost Estimation (EAC, ETC)
    *   L2.9.2 Resource Demand Planning (Labor & Equipment)
    *   L2.9.3 Percentage of Completion (POC) Modeling
    *   L2.9.4 Cash Flow at Project Level

#### Domain 8: Manufacturing & Supply Chain Planning
*   **L1.10 S&OP Alignment**
    *   L2.10.1 Demand Planning & Consensus Forecasting
    *   L2.10.2 Supply Planning (Capacity, Material Requirements)
    *   L2.10.3 Inventory Valuation & Holding Cost Modeling
    *   L2.10.4 Gross Margin Planning by SKU/Plant

#### Domain 9: Revenue, Pricing & Margin Planning
*   **L1.11 Commercial Planning**
    *   L2.11.1 Price-Volume-Mix (PVM) Analysis
    *   L2.11.2 Sales Rep Quota Planning
    *   L2.11.3 Trade Promotion & Discount Modeling
    *   L2.11.4 Revenue Recognition Modeling

#### Domain 10: Cash Flow & Liquidity Planning
*   **L1.12 Treasury Integration**
    *   L2.12.1 Daily Cash Position Forecasting
    *   L2.12.2 Working Capital Optimization (DSO, DPO, DTO)
    *   L2.12.3 Debt Scheduling & Interest Expense Planning

#### Domain 11: Intercompany & Group Planning
*   **L1.13 Consolidation Alignment**
    *   L2.13.1 Intercompany Elimination Logic (Plan Level)
    *   L2.13.2 Transfer Pricing Simulation
    *   L2.13.3 FX Translation & CTA Estimation

#### Domain 12: ESG / Sustainability Planning
*   **L1.14 Non-Financials**
    *   L2.14.1 Carbon Footprint Planning (Scope 1, 2, 3)
    *   L2.14.2 DEI (Diversity, Equity, Inclusion) Target Setting
    *   L2.14.3 Social Impact Investment Planning

#### Domain 13: What-If, Sensitivity & Stress Testing
*   **L1.15 Simulation Engine**
    *   L2.15.1 Multi-Variable Stress Testing
    *   L2.15.2 Monte Carlo Simulations
    *   L2.15.3 Version Management (Best, Worst, Base, Custom)

#### Domain 14: AI-Assisted Planning & Predictive Forecasting
*   **L1.16 Intelligent EPM**
    *   L2.16.1 Time-Series Forecasting (ARIMA, Prophet, LSTM)
    *   L2.16.2 Anomaly Detection in Forecasts
    *   L2.16.3 Driver Discovery (Feature Importance)
    *   L2.16.4 Narrative Generation (NLG) for Variance

#### Domain 15: Governance, Controls & Auditability
*   **L1.17 Process Control**
    *   L2.17.1 Task Management & Workflow Approvals
    *   L2.17.2 Cell-Level Audit Trails
    *   L2.17.3 Version Locking & Freeze Logic
    *   L2.17.4 Data Access Security (Dimensional Security)

#### Domain 16: Data Integration, Models & Master Data Alignment
*   **L1.18 Technical Foundation**
    *   L2.18.1 Dimensional Metamodel Integration (GL Alignment)
    *   L2.18.2 Drill-Through to Transactions
    *   L2.18.3 Automated Actuals Load
    *   L2.18.4 Write-Back to ERP (Budget Control)

#### Domain 17: Security, Access & Segregation of Duties
*   **L1.19 Risk Management**
    *   L2.19.1 Planner vs. Reviewer vs. Admin Roles
    *   L2.19.2 Data Hiding/Masking (Salary Data)
    *   L2.19.3 SoD Conflict Detection

#### Domain 18: Performance Reporting, Dashboards & Narrative Intelligence
*   **L1.20 Visualization**
    *   L2.20.1 Financial Reporting Studio (Pixel Perfect)
    *   L2.20.2 Interactive EPM Dashboards
    *   L2.20.3 Variance Commentary Collection

---

### 4. Level-15 Conceptual Model (Target State)

**Core Entity: `PlanUnit`**
*   **Dimensions:**
    *   `Entity` (Company, Business Unit)
    *   `Account` (GL + Statistical)
    *   `CostCenter` / `Department`
    *   `Product` / `Project` / `Channel` (Custom Dims 1-5)
    *   `Time` (Period, Quarter, Year) - Fiscal Intelligence
    *   `Scenario` (Actual, Budget, Forecast, Plan)
    *   `Version` (Working, V1, V2, Final, What-If)
    *   `Currency` (Local, Functional, Reporting)
*   **Time Intelligence:**
    *   YTD, QTD, MTD, Rolling sums
    *   Prior Year, Prior Period, Variance
*   **Logic Layer:**
    *   `Member Formulas`: On-the-fly calculations (e.g., Gross Margin %)
    *   `Allocation Scripts`: Top-down spreads, driver-based allocations
    *   `Business Rules`: Procedural logic for complex models (e.g., Depreciation)
*   **Data Flow:**
    *   **Inbound:** GL Balances (Actuals), HR Data (Roster), Subledgers (Open POs)
    *   **Processing:** Aggregation, Translation, Elimination, Calculation
    *   **Outbound:** Approved Budget -> GL (Budget Control), Reporting, Analytics

---

### 5. Gap Analysis + Feature Parity Heatmap

| L1 Domain | Tier-1 Benchmark (Oracle/SAP) | Current Status | Parity Gap | Integration Risks |
| :--- | :--- | :--- | :--- | :--- |
| **1. Strategic Planning** | Robust LRP, M&A, Treasury sync | **Not Available** | **Critical** | High (Missing logic) |
| **2. Financial Planning** | Full P&L/BS/CF logic, ZBB | **Available (Prototype)** | Major | High (Schema naive) |
| **3. Rolling Forecast** | Integrated, seeded actuals | **Not Available** | **Critical** | Medium |
| **4. Driver-Based** | Global drivers, sensitivity | **Not Available** | **Critical** | High |
| **5. Workforce (WFP)** | Position-level, benefits logic | **Not Available** | **Critical** | Critical (GDPR/PII) |
| **6. CapEx Planning** | Asset lifecycle, depr. engine | **Not Available** | **Critical** | Medium |
| **7. Projects** | POC, resource costing | **Not Available** | **Critical** | High (PPM sync) |
| **8. Mfg/Supply Chain** | Demand/Supply/Inventory | **Not Available** | **Critical** | High (SCM sync) |
| **9. Rev/Margin** | Price-Vol-Mix, Quota | **Not Available** | **Critical** | Medium |
| **10. Cash/Liquidity** | Daily Direct method | **Not Available** | **Critical** | High (Treasury) |
| **11. Intercompany** | Elimination at Plan | **Not Available** | **Critical** | High (Consolidation) |
| **12. ESG** | Carbon Calc, DEI | **Not Available** | **Critical** | Low |
| **13. What-If/Sim** | Stress tests, Monte Carlo | **Prototype (Random)** | **Critical** | None (Isolated) |
| **14. AI/Predictive** | ML-based forecast, anomaly | **Prototype (Mock)** | **Critical** | Medium |
| **15. Process/Gov** | Workflow, Locking, Audit | **Partial (Logs)** | Major | High (Compliance) |
| **16. Integrations** | Drill-through, Write-back | **Partial (Basic)** | Major | High (Data Integrity) |
| **17. Security** | Cell-level, SoD | **Not Available** | **Critical** | Critical (Access) |
| **18. Reporting** | Financial Studio, Comments | **Partial** | Major | Low |

**Findings:** The current `modules/epm` is a bare-bones CRUD service for a single `Budget` table. It lacks dimensionality, calculation engines, versioning, workflows, and practically all Tier-1 EPM capabilities.

---

### 6. Continuous Audit Rules
*   **Rule 1:** No planning data exists without a `Version` and `Scenario`.
*   **Rule 2:** All adjustments to "Final" versions must be immutable and audit-logged.
*   **Rule 3:** Integration Actuals must reconcile 100% to GL Source at all times.
*   **Rule 4:** Security must be enforced at the intersection of Entity and Cost Center (Row-Level Security).
*   **Rule 5:** WFP data must never be exposed to users without specific HR-Exec roles.

---

### 7. Phased Remedial Measures

#### Phase 1: Stabilization & Foundation (Steps 1-10)
*   **Functional:** Implement multi-dimensional data model (Entity, Account, Dept, Time, Scenario, Version).
*   **Data:** Create Data Seeding mechanism from GL Actuals.
*   **Governance:** Implement Basic Workflow (Submit/Approve) and Version Locking.

#### Phase 2: Core Financials (Steps 11-20)
*   **Functional:** Implement P&L Planning with Driver logic.
*   **Integration:** Build Write-back to ERP `gl_budget_interface` for control.
*   **Reporting:** Deploy Variance Analysis (BVA) Reports.

#### Phase 3: Operational Planning (Steps 21-35)
*   **Functional:** Workforce Planning (Headcount + Salary).
*   **Functional:** CapEx Planning (New Assets + Depreciation).
*   **Functional:** Project Planning integration.

#### Phase 4: Enterprise Hardening & AI (Steps 36-50)
*   **Functional:** Intercompany Eliminations & Currency Translation.
*   **AI:** Replace Random mocks with real Python/ML forecasting (Prophet/ARIMA).
*   **Governance:** Full Audit Trail & SoD Enforcement.

---

### 8. Integration Architecture (End-to-End)
*   **ERP to EPM (Actuals):**
    *   Source: `gl_balances`, `gl_je_lines`, `hr_employees`, `fa_additions`, `pjm_projects`.
    *   Mechanism: Asynchronous Batch (Nightly) + Real-time Flash (On-Demand).
    *   Transformation: Mapping logic (COA segments to EPM Dimensions).
*   **EPM to ERP (Budget Control):**
    *   Target: `gl_budget_control`, `po_encumbrance`.
    *   Mechanism: API Write-back on Approval.
*   **Master Data:**
    *   System of Record: ERP (GL COA, Entities, Projects) -> Sync to EPM.
    *   EPM-Only Masters: Scenario, Version, Planning Drivers.

---

### 9. Controls, Governance & Audit
*   **Workflows:** Multi-stage approval (Dept Head -> Finance BP -> CFO).
*   **Versioning:**
    *   `Working`: Open for edits.
    *   `Submitted`: Locked for submitter.
    *   `Approved`: Locked for all.
    *   `Historical`: Read-only snapshot.
*   **Audit:** Record `User`, `Timestamp`, `OldValue`, `NewValue`, `Justification` for every cell change.

---

### 10. AI, Automation & Intelligence (Enterprise Grade)
*   **Predictive:** Use historical Actuals to baseline the Forecast (Auto-Seed).
*   **Anomaly:** Flag variance > 2 standard deviations in real-time.
*   **Drivers:** Suggest drivers based on correlation analysis of historical data.
*   **Narrative:** Auto-generate text explanations for variances (e.g., "Revenue down 5% vs Budget due to Volume decline in North America").
