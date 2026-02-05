# EPM Planning Phase 2: Core Financials & Real Integration

- [x] **Step 1: Real-time GL Integration**
    - [x] Explore GL module to identify `GLBalance` and `GLJeLine` entities <!-- id: 1 -->
    - [x] Create `GLBalance` TypeORM Entity (`backend/src/modules/finance/entities/gl-balance.entity.ts`) <!-- id: 1a -->
    - [x] Update `GLIntegrationService` to inject GL repositories <!-- id: 2 -->
    - [x] Implement `fetchActuals` with real QueryBuilder logic (Aggregating GL Balances) <!-- id: 3 -->
    - [x] Verify data seeding from GL to EPM <!-- id: 4 -->

- [x] **Step 2: Expanded Dimensionality**
    - [x] Update `PlanUnit` entity to include `projectId` and `channelId` <!-- id: 5 -->
    - [x] Create `PlanProject` and `PlanChannel` dimension tables (or link to ERP masters) <!-- id: 6 -->
    - [x] Update `PlanningGrid` UI to support new dimensions <!-- id: 7 -->

- [x] **Step 3: Formula Engine**
    - [x] Create `FormulaService` generic engine <!-- id: 8 -->
    - [x] Implement "Apply Driver" using Formula Engine (Dynamic % increase) <!-- id: 9 -->
    - [x] Implement "Allocations" (Spread total to depts based on headcount) <!-- id: 10 -->

- [x] **Step 4: Verification**
    - [x] Script: Seed GL data -> Run Fetch -> Verify PlanUnits <!-- id: 11 -->
    - [x] Script: Run Allocations -> Verify distribution <!-- id: 12 -->

# EPM Planning Phase 2.5: Advanced UI & Integrations

- [x] **Step 1: ERP Projects Integration**
    - [x] Create `Project` TypeORM Entity (mapping `projects2`) <!-- id: 13a -->
    - [x] Create `ProjectIntegrationService` to sync ERP Projects -> `PlanProject` <!-- id: 13b -->
    - [x] Verify Project Sync <!-- id: 13c -->

- [x] **Step 2: Calculations UI**
    - [x] Create `AllocationRules` Component (Define Source/Target) <!-- id: 14a -->
    - [x] Create `FormulaManager` Component (Manage Driver Rules) <!-- id: 14b -->
    - [x] Integrate "Run Allocation" into `PlanningGrid` <!-- id: 14c -->

- [x] **Step 3: Verification**
    - [x] Manual Verification of UI Flows <!-- id: 15a -->

# EPM Planning Phase 3: Operational Planning

- [x] **Step 1: Project Financials**
    - [x] Create `ProjectFinanceService` logic layer <!-- id: 13 -->
    - [x] Implement Revenue Recognition (POC Method) <!-- id: 14 -->
    - [x] Link `PlanProject` to ERP `Project` entity (Stub or Integration) <!-- id: 15 -->

- [x] **Step 2: S&OP Alignment**
    - [x] Create `DemandPlanningService` <!-- id: 16 -->
    - [x] Implement `calculateGrossMargin` logic <!-- id: 17 -->
    - [x] Create `PlanProduct` dimension entity <!-- id: 18 -->

- [x] **Step 3: Verification**
    - [x] Script: Verify Project Revenue Rec <!-- id: 19 -->
    - [x] Script: Verify Gross Margin Calc <!-- id: 20 -->

# EPM Planning Phase 4: Enterprise Hardening & AI

- [x] **Step 1: AI & Predictive Forecasting**
    - [x] Create `PredictiveForecastingService` <!-- id: 21 -->
    - [x] Implement Simple Linear Regression (or connect to basic ML mock) <!-- id: 22 -->
    - [x] Add "AI Forecast" button to UI <!-- id: 23 -->

- [x] **Step 2: Advanced Security (RLS/FLS)**
    - [x] Create `EpmSecurityService` <!-- id: 24 -->
    - [x] Implement Row-Level Security (Entity/Dept access check) <!-- id: 25 -->
    - [x] Implement Field-Level Security (Mask Pay/Benefits for non-HR) <!-- id: 26 -->

- [x] **Step 3: Verification**
    - [x] Script: Verify Forecasting Logic <!-- id: 27 -->
    - [x] Script: Verify Security Restrictions <!-- id: 28 -->

# EPM Planning Phase 5: Extended Domains (ESG, Treasury, Strategic)

- [x] **Step 1: ESG & Non-Financials**
    - [x] Create `PlanEsgMetric` entity (Carbon, Diversity) <!-- id: 29 -->
    - [x] Create `EsgPlanningService` for driving ESG goals <!-- id: 30 -->

- [x] **Step 2: Treasury & Strategic Planning**
    - [x] Create `TreasuryPlanningService` (Cash Forecasting) <!-- id: 31 -->
    - [x] Implement Long-Range Planning (LRP) models (Year + 5) <!-- id: 32 -->

- [x] **Step 3: Verification**
    - [x] Script: Verify ESG and Treasury calculations <!-- id: 33 -->
