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

# EPM Planning Phase 3: Operational Planning

- [ ] **Step 1: Project Financials**
    - [ ] Create `ProjectFinanceService` logic layer <!-- id: 13 -->
    - [ ] Implement Revenue Recognition (POC Method) <!-- id: 14 -->
    - [ ] Link `PlanProject` to ERP `Project` entity (Stub or Integration) <!-- id: 15 -->

- [ ] **Step 2: S&OP Alignment**
    - [ ] Create `DemandPlanningService` <!-- id: 16 -->
    - [ ] Implement `calculateGrossMargin` logic <!-- id: 17 -->
    - [ ] Create `PlanProduct` dimension entity <!-- id: 18 -->

- [ ] **Step 3: Verification**
    - [ ] Script: Verify Project Revenue Rec <!-- id: 19 -->
    - [ ] Script: Verify Gross Margin Calc <!-- id: 20 -->
