# Implementation Plan: Maintenance GL Integration (Phase D)

## Phase 1-4: Foundation & AI (✅ Complete)
- [x] Schema Core, Contracts UI, Billing, AI Risk.

## Phase 5: Deep Enterprise Controls (✅ Complete)
- [x] Construction Setup, Multi-stage certification, WIP Accounting, Bulk Import.

## Phase 6: Field Operations & Compliance (✅ Complete)
- [x] Site Management (Logs/RFIs), Compliance Payment Gate.

## Phase 7: Master Data & UI Perfection (Level-7, Level-9)
### Goal
Closing UI/UX consistency gaps and establishing reusable master data libraries.

### Changes
#### [NEW] shared/schema/construction_master.ts
- `construction_cost_codes`: Global CSI MasterFormat / Standard library support.
#### [NEW] client/src/components/construction/ConstructionCostCodeLibrary.tsx
- Centralized management of standard costing categories.
#### [MODIFY] Construction Workbenches
- Upgrade `ConstructionContractWorkbench.tsx`, `ConstructionBillingWorkbench.tsx`, and `ConstructionSiteManagement.tsx` to the `StandardTable` grid pattern for L15 scalability (server-side sorting/filtering).

## Phase 8: Strategic Claims & Project Control (Level-11 to Level-15)
### Goal
Achieve full Oracle Fusion parity for complex dispute management and localized project rules.

### Changes
#### [NEW] `construction_claims` Schema
- Dispute tracking, claim impact assessment, and formal settlement workflow.
#### [MODIFY] ConstructionSetup.tsx
- Implement "Site-Level Regulatory Overrides" (Localization support for tax/regional rules).
#### [AI] Variation Impact Simulator (L13)
- Predictive simulation of change order impact on schedule vs. cost trade-offs.
*   In the **Costs** tab, add a column or indicator for "Accounting Status" (Draft vs Accounted).
*   Add a "View Journals" button (optional drill-down).

## Accounting Logic (Standard Pattern)

| Transaction | Debit (Dr) | Credit (Cr) |
| :--- | :--- | :--- |
| **Material Issue** | Maintenance Expense (Asset Context) | Inventory Valuation (Item Context) |
| **Labor Booking** | Maintenance Labor Expense | Labor Absorption / Payroll Clearing |

## Verification
*   **Script**: `scripts/verify_maintenance_accounting.ts`
    1.  Create Cost (Issue Material).
    2.  Verify `sla_journal_headers` created.
    3.  Verify Debits = Credits.
    4.  Verify Links to GL Ledgers.

## Phase 11: Period Close & Reporting
### Goal
Implement Period Close controls (Sweep, Validation) and Account Analysis reporting to ensure data integrity and auditability.

### Changes
#### [NEW] server/modules/sla/period-close.service.ts
- `closePeriod`: Validates all events are accounted.
- `sweepUnaccountedEvents`: Moves unaccounted events to the next open period.
- `validateEventDate`: Prevents accounting in closed periods.

#### [NEW] server/modules/sla/reporting.service.ts
- `getAccountAnalysisReport`: Generates detailed transaction listing by Account, Period, Source.

#### [NEW] scripts/verify_period_close.ts
- Test strict period close validation.
- Test sweep mechanism.
- Test accounting date validation.

### Schema
- `sla_period_statuses` (Already Exists in shared/schema/sla).
- `gl_periods` (Already Exists in shared/schema/finance).
