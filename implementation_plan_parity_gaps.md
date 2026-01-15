# implementation_plan_parity_gaps.md

# Goal Description
Close all "Partial" (⚠️) gaps identified in `analysis_maintenance_gap.md` to achieve 100% feature parity for the Maintenance module. This focuses on deepening existing functionalities: Asset Meters, Advanced PM Scheduling, Work Definition Libraries, and Triage Dispatch.

## User Review Required
> [!NOTE]
> This plan introduces new schema tables for Meters and Work Definitions. No breaking changes to existing WO data, but PM generation logic will be enhanced.

## Proposed Changes

### 1. Asset Meters & Readings
**Goal**: Track usage (Runtime, Cycles, Odometer) to drive maintenance.
#### [NEW] `shared/schema/maintenance_meters.ts`
*   `maint_meters`: Definition of a meter on an asset (e.g., "Engine Hours", "Odometer").
    *   `assetId`, `name`, `unitOfMeasure`, `readingType` (ABSOLUTE/DELTA), `currentValue`.
*   `maint_meter_readings`: Log of readings.
    *   `meterId`, `value`, `readingDate`, `deltaValue` (calc).

### 2. Advanced PM Definitions (Meter-Based & Floating)
**Goal**: Trigger maintenance based on usage, not just time.
#### [MODIFY] `shared/schema/maintenance_planning.ts`
*   Add to `maint_pm_definitions`:
    *   `frequencyType`: enum ('TIME', 'METER')
    *   `meterId`: FK to `maint_meters` (nullable)
    *   `meterInterval`: number (e.g., every 5000 hours)
    *   `isFloating`: boolean (Next Due calculated from *Last Completion* vs *Last Due*)

### 3. Work Definition Library
**Goal**: Reusable templates for standardized work (e.g., "5000h Service Template").
#### [NEW] `shared/schema/maintenance_library.ts`
*   `maint_work_definitions`: Header (Name, Description, Type).
*   `maint_work_definition_operations`: Template operations.
*   `maint_work_definition_materials`: Template materials.
*   **Logic**: `applyWorkDefinition(woId, defId)` copies ops/materials to the WO.

### 4. Triage & Dispatch Console
**Goal**: Rapidly assign incoming requests.
#### [NEW] `client/src/components/maintenance/DispatchConsole.tsx`
*   Split view:
    *   **Left**: Incoming / Unassigned WOs (List).
    *   **Right**: Available Technicians (List/Card).
*   Action: Drag and drop or "Assign" button to link Tech to WO.

### 5. Forecasting Visualization
**Goal**: Long-term visibility.
#### [MODIFY] `client/src/components/maintenance/PlanningBoard.tsx`
*   Add "Forecast Mode": Show generated PM instances (ghost bars) for future dates based on frequency.

## Verification Plan

### Automated Tests
1.  **Meters**: Script to create meter, log reading, verify update.
2.  **PM Gen**: Script to triggers Meter-based PM when reading crosses threshold.
3.  **Library**: Script to apply Work Def to WO and verify lines copied.

### Manual Verification
1.  **Dispatch**: Use UI to assign multiple WOs to a tech.
2.  **Forecast**: View Planning Board in future range to see PM placeholders.
