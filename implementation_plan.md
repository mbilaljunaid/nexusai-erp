# Implementation Plan: Maintenance Quality & Safety (Phase C)

## Goal
Implement a Quality Assurance (QA) and Safety layer to ensure maintenance work meets compliance standards and is performed safely using Permits and Inspection Checklists.

## Proposed Changes

### 1. Schema Definition
#### [NEW] `shared/schema/maintenance_quality.ts`
*   `maint_inspection_definitions`: Templates for checklists (e.g., "Annual Forklift Inspection").
    *   `questions`: JSONB (Array of {id, text, type, options}).
*   `maint_inspections`: Execution record linked to an Asset or Work Order.
    *   `results`: JSONB (Answers).
    *   `status`: PASS/FAIL.
*   `maint_permits`: Safety documents (e.g., "Hot Work Permit").
    *   `type`: HOT_WORK, COLD_WORK, CONFINED_SPACE.
    *   `status`: ACTIVE, CLOSED.
    *   `work_order_id`: FK.

### 2. Backend Service
#### [NEW] `server/services/MaintenanceQualityService.ts`
*   `createInspectionFromTemplate(templateId, assetId, woId)`: Instantiates a checklist.
*   `submitInspectionResults(inspectionId, answers)`: Validates and scores the inspection.
*   `createWorkPermit(data)`: Generates a permit for a WO.

### 3. Frontend UI
#### [MODIFY] `client/src/components/maintenance/MaintenanceDetailSheet.tsx`
*   Add **"Safety & Quality"** Tab.
*   **Permits Section**: List active permits. Button to "Generate Permit".
*   **Inspections Section**: List required inspections. Button to "Perform Inspection".
    *   **InspectionRunner**: A modal/drawer to answer questions (Yes/No/Text).

## Verification
*   **Script**: `scripts/verify_quality_flow.ts`
    1.  Create Inspection Template (Seed).
    2.  Create WO.
    3.  Generate Inspection from Template.
    4.  Submit Results (Pass).
    5.  Create Safety Permit.
    6.  Verify Links.
