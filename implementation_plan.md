
# Implementation Plan: Maintenance GL Integration (Phase D)

## Goal
Achieve financial parity by posting Maintenance Costs (Material & Labor) to the General Ledger via the SLA (Sub-ledger Accounting) framework.
This ensures that every nut, bolt, and hour of labor consumed in maintenance is reflected in the company's financial statements.

## Proposed Changes

### 1. SLA Configuration (Seed Data)
We need to define the "Events" that trigger accounting in Maintenance.
*   **Event Class**: `MAINT_MATERIAL_ISSUE`
*   **Event Class**: `MAINT_RESOURCE_CHARGING` (Labor)

### 2. Backend Service
#### [NEW] `server/services/MaintenanceAccountingService.ts`
*   `createAccountingForCost(costId)`:
    *   Fetches the `maint_work_order_costs` record.
    *   Determines the **Debit** Account (Maintenance Expense) and **Credit** Account (Inventory Asset / Labor Absorption).
    *   Creates `sla_journal_headers` and `sla_journal_lines`.
    *   Updates `maint_work_order_costs` with `accounting_status = 'ACCOUNTED'`.

#### [MODIFY] `server/services/MaintenanceCostingService.ts`
*   Trigger `MaintenanceAccountingService.createAccountingForCost()` immediately after calculating a cost (real-time accounting) or via a batch process. For this MVF (Minimum Viable Feature), we'll do real-time.

### 3. Frontend UI
#### [MODIFY] `client/src/components/maintenance/MaintenanceDetailSheet.tsx`
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
