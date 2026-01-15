# Maintenance Quality & Safety (Phase C)

- [ ] **Schema Definition**
    - [ ] Define `maint_inspection_definitions` (Templates) <!-- id: 0 -->
    - [ ] Define `maint_inspections` (Execution Results) <!-- id: 1 -->
    - [ ] Define `maint_permits` (Safety Permits) <!-- id: 2 -->
    - [ ] Export schema in `index.ts` <!-- id: 3 -->
    - [ ] Create bootstrap script <!-- id: 4 -->

- [ ] **Backend Service Implementation**
    - [ ] Create `MaintenanceQualityService.ts` <!-- id: 5 -->
    - [ ] Implement `createInspection` (from Template) <!-- id: 6 -->
    - [ ] Implement `completeInspection` (Pass/Fail) <!-- id: 7 -->
    - [ ] Implement `createPermit` <!-- id: 8 -->

- [ ] **Frontend Implementation**
    - [ ] Create `InspectionSheet` component (Checklist UI) <!-- id: 9 -->
    - [ ] Create `PermitPanel` component (Safety Info) <!-- id: 10 -->
    - [ ] Add "Safety & Quality" tab to `MaintenanceDetailSheet` <!-- id: 11 -->

- [ ] **Verification**
    - [ ] Script: `scripts/verify_quality_flow.ts` <!-- id: 12 -->
