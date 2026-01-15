# Maintenance Feature Parity (Gaps)

- [x] **Step 1: Meters & Library (Foundation)**
    - [x] Schema: `shared/schema/maintenance_meters.ts` <!-- id: 1 -->
    - [x] Schema: `shared/schema/maintenance_library.ts` <!-- id: 2 -->
    - [x] Service: `MaintenanceMeterService` (Record readings) <!-- id: 3 -->
    - [x] Service: `MaintenanceLibraryService` (Apply templates) <!-- id: 4 -->
    - [x] Verify: `scripts/verify_parity_step1.ts` (Passed with manual path) <!-- id: 5 -->

- [x] **Step 2: Advanced PM Definitions**
    - [x] Schema: Update `maint_pm_definitions` (Meter fields, Floating) <!-- id: 6 -->
    - [x] Schema: Fix `maint_work_definitions` reference in PM <!-- id: 7 -->
    - [x] Service: Update `MaintenanceService.generatePMWorkOrders` to handle Meter & Floating logic <!-- id: 8 -->
    - [x] Verify: `scripts/verify_parity_step2.ts` <!-- id: 9 -->


- [x] **Step 3: Triage Dispatch Console**
    - [x] UI: `DispatchConsole.tsx` (Finish implementation with real data) <!-- id: 10 -->
    - [x] Route: Add to Sidebar/Navigation <!-- id: 11 -->
    - [x] Verify: Manual UI Test <!-- id: 12 -->

- [x] **Step 4: Forecasting Visualization**
    - [x] UI: `PlanningBoard.tsx` (Forecast Mode) <!-- id: 13 -->
    - [x] Service: `MaintenanceService.getForecast(horizon)` <!-- id: 14 -->
    - [x] Verify: Manual UI Test <!-- id: 15 -->

