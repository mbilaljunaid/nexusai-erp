# NexusAI Project Portfolio Management (PPM) - Gap Analysis Report
**Date:** 2026-01-18
**Version:** 1.0
**Status:** ⚠️ API & UI Gaps Identified (Backend Logic is Mature)

## 1. Executive Summary
The Project Portfolio Management (PPM) module exhibits a significant dichotomy:
*   **Database & Logic Layer (Tier-1):** The schema (`shared/schema/ppm.ts`) and Service Layer (`server/services/PpmService.ts`) are **90% complete**, featuring advanced capabilities like Earned Value Management (EVM), Burdening, Asset Capitalization, and Sub-Ledger Accounting.
*   **API & UI Layer (Tier-3):** The current API (`server/modules/project/routes.ts`) exposes legacy "Agile/Sprint" functionality rather than the ERP Financial logic. The UI folder (`client/src/components/project`) does not exist.

**Conclusion:** The logic is "Gold Plated", but the user cannot access it. Phase 38 must build the "Bridge" (API) and the "Cockpit" (UI).

## 2. Current State Assessment

| Component | Status | Maturity | Notes |
| :--- | :--- | :--- | :--- |
| **Schema** | ✅ Complete | Level 15 | `ppmProjects`, `ppmTasks`, `ppmExpenditureItems`, `ppmCostDistributions`, `ppmPerformanceSnapshots` exist and represent Oracle-grade structure. |
| **Service Logic** | ✅ Mature | Level 14 | `PpmService.ts` implements EVM (CPI/SPI), Burdening engine, and Integration to AP/Inventory. **A hidden gem.** |
| **API Layer** | ❌ Mismatch | Level 2 | `routes.ts` points to legacy `storage.ts` Agile/Sprint methods. It completely ignores `PpmService`. |
| **Frontend UI** | ❌ Missing | Level 0 | No Workbench, no Project Dashboard, no Costing screens. |

## 3. Detailed Gap Findings

### 3.1 The "Agile vs. Financial" Conflict
*   **Existing Routes**: `/api/projects` returns "Agile Projects" (Title, Owner) via `storage.listProjects`.
*   **Required Routes**: Need endpoints for `Financial Projects` (Budget, BAC, EV, Cost Collection).
*   **Action**: We must check if we should Merge or Separate. Given this represents "ERP", we should prioritize the Financial view, potentially embedding Agile/Tasks as a sub-view.

### 3.2 Missing API Endpoints
The following `PpmService` methods are inaccessible via API:
*   **Health Checks**: `checkProjectAlerts(projectId)` (EVM Health)
*   **Costing**: `collectFromAP()`, `collectFromInventory()`, `collectFromLabor()`
*   **Accounting**: `generateDistributions()`
*   **Asset Mgmt**: `interfaceToFA()`

### 3.3 Missing UI Components
*   **Project Executive Dashboard**: CPI/SPI Cards, Budget Burn Rate graphs.
*   **PPM Workbench**:
    *   **Overview**: Financial Summary (Budget vs Actuals).
    *   **Expenditures**: DataGrid for reviewing and adjusting cost items.
    *   **Assets**: CIP tracking and Capitalization actions.
    *   **Burden Schedules**: Configuration of overhead rules.

## 4. Remediation Plan (Phase 38)
**Goal**: Unlock the `PpmService` capabilities for the End User.

### Phase 38.1: API Modernization
*   Refactor `server/modules/project/routes.ts` to use `PpmService`.
*   Introduce new endpoints:
    *   `GET /api/ppm/projects/:id/health`
    *   `GET /api/ppm/expenditures` (Paginated)
    *   `POST /api/ppm/costs/import`
    *   `POST /api/ppm/assets/capitalize`

### Phase 38.2: PPM Workbench (UI)
*   Create `client/src/components/ppm/PpmWorkbench.tsx` (New Directory `ppm` to avoid conflict with legacy `project`?).
*   Features:
    *   **Overview Tab**: Financial Health checks (Red/Green indicators).
    *   **Costs Tab**: DataGrid of `ppmExpenditureItems`.
    *   **Assets Tab**: CIP tracking.

## 5. Security & Control
*   **Role Based Access**: Ensure only Project Accountants can "Import Costs" or "Capitalize Assets".
