# Analysis: Landed Cost Management (LCM) Gap & Readiness

> **Audit Date:** 2026-01-18 (Post-Phase 36)
> **Assessment Verdict:** ⚠️ **60% Feature Parity** (Operational Core Complete / Financials Missing)
> **Target:** Tier-1 Enterprise LCM

## 1. Executive Summary (Current System State)
The **Operational Core** of Landed Cost Management is **fully implemented** and verified. Users can:
*   Create Trade Operations and Shipments.
*   Estimate charges (Freight, Duty) using simple entry or **AI Prediction**.
*   **Allocate** costs to line items (Weight, Qty, Value) with precision.
*   Capture **Actuals** from AP Invoices and track Variance.

However, the module is **NOT Tier-1 Ready** due to missing **Financial Integration** and **Scalability**.
*   **Accounting Gap**: Allocations do not generate GL Journals (Dr Inventory / Cr Accrual).
*   **Scalability Gap**: `listTradeOperations` lacks server-side pagination.
*   **Control Gap**: No formal "Period Close" or "Approval" workflow for Trade Ops.

---


## 1. Forensic Audit (Current State)
The system currently has **NO dedicated Landed Cost Management module**.
*   **Receipts**: Basic PO receipts exist (`procure_receipt_headers`), but no mechanisms to capture freight, insurance, or third-party charges.
*   **Allocations**: No logic to allocate overhead costs to inventory items.
*   **Accounting**: No "Landed Cost Absorption" or "Charge Clearing" accounts in the GL interface.
*   **Valuation**: Item costs are fixed or average based on PO price only, ignoring true landed cost components.

## 2. Canonical Decomposition (Level 1 - 15)

### Level 1: Module Domain
*   **Target**: Landed Cost Management
*   **State**: ❌ **MISSING**. Concepts do not exist in the codebase.

### Level 2: Sub-Domain
*   **Target**: Shipment Costing, Receipt Costing, Cost Allocation, Settlement
*   **State**: ❌ **MISSING**. No distinction between material cost and landed cost charges.

### Level 3: Functional Capability
*   **Target**: Capture Charges (Freight, Duty), Allocate by (Qty/Value/Weight/Volume), Absorb to Inventory, Reconcile AP.
*   **State**: ❌ **MISSING**.

### Level 4: Business Use Case
*   **Target**: "I need to add $500 shipping to this container of 1000 widgets so the unit cost reflects the true $10.50, not just the $10.00 purchase price."
*   **State**: ❌ **Not Supported**. Users can only see the Purchase Price.

### Level 5: User Personas
*   **Target**: Cost Accountant, Logistics Manager.
*   **State**: ❌ **MISSING**.

### Level 6: UI Surfaces
*   **Target**: Trade Operations Dashboard, Landed Cost Workbench, Charge Management.
*   **State**: ❌ **MISSING**.

### Level 7: UI Components
*   **Target**: Grids for Charge Lines, Allocation Previews, Cost Components.
*   **State**: ❌ **MISSING**.

### Level 8: Configuration / Setup
*   **Target**: Cost Component Maintenance, Allocation Rules, Default Charge Accounts.
*   **State**: ❌ **MISSING**.

### Level 9: Master Data
*   **Target**: Carriers, Cost Components (Freight, Insurance, Duty), Reference Types.
*   **State**: ❌ **MISSING**. Basic Suppliers exist, but not linked to Charge Types.

### Level 10: Transactional Objects
*   **Target**: `lcm_shipments`, `lcm_charges`, `lcm_allocations`, `lcm_distributions`.
*   **State**: ❌ **MISSING**.

### Level 11: Workflow & Controls
*   **Target**: Charge Approval, Allocation Confirmation, Period Close for LCM.
*   **State**: ❌ **MISSING**.

### Level 12: Accounting & Derivation
*   **Target**:
    *   Dr Inventory Valuation (Material + Landed Cost)
    *   Cr Accrual (Material)
    *   Cr Landed Cost Absorption / Clearing
*   **State**: ❌ **MISSING**. Inventory is valued at PO Price only.

### Level 13: AI / Automation
*   **Target**: Predicted Freight Costs, Anomaly Detection (High Duty).
*   **State**: ❌ **MISSING**.

### Level 14: Security & Compliance
*   **Target**: LCM Audit Trails, RBAC for Costing.
*   **State**: ❌ **MISSING**.

### Level 15: Scalability
*   **Target**: High-volume receipt matching, background allocation processors.
*   **State**: ❌ **N/A**.

## 3. Gap Analysis + Feature Parity Heatmap

| Feature Area | Tier-1 Requirement | Current Status | Remediation Priority |
| :--- | :--- | :--- | :--- |
| **Trade Operations** | Create/Manage Shipments ("Trade Ops") linking multiple POs. | ✅ **Implemented** | - |
| **Charge Management** | Define Estimates (Pre-Receipt) and Actuals (AP Invoice) for Freight/Duty. | ✅ **Implemented** | - |
| **Cost Allocation** | Engine to spread charges to lines based on Qty, Value, Weight, Volume. | ✅ **Implemented** | - |
| **Accounting** | Generate specialized accounting events for Charge Absorption and Variance. | ❌ **Missing** | **Critical** |
| **Visibility** | View "Total Landed Cost" per item/receipt. | ⚠️ Partial | High |
| **Prediction** | AI-driven cost estimation based on history. | ✅ **Implemented** | - |
| **Scalability** | Server-side pagination for high-volume Ops. | ❌ **Missing** | **Critical** |

## 4. Remediation Roadmap (Oracle Aligned)

### Phase 1: Foundation (Trade Ops & Charges) - ✅ COMPLETED
*   **Schema**: Created `lcm_trade_operations`, `lcm_charges`, `lcm_cost_components`.
*   **UI**: Built `LcmWorkbench` for Trade Ops and `CostComponentManager` for Master Data.
*   **Status**: Verified.

### Phase 2: Allocation Engine - ✅ COMPLETED
*   **Schema**: added `lcm_allocations`.
*   **Logic**: `LcmAllocationService` distributes charges.
*   **Status**: Verified.

### Phase 3: AP Integration - ✅ COMPLETED
*   **Schema**: Added `is_landed_cost` to AP Lines.
*   **Logic**: `trackActualCharge` links Invoices to Ops.
*   **Status**: Verified.

### Phase 4: Intelligence (Current Focus)
*   **Goal**: Predict Freight/Duty based on history.
*   **Logic**: Calculate historical Cost-Per-Unit (Weight/Qty) and apply to new ops.
*   **UI**: "Auto-Predict Costs" button.
*   **Logic**: Calculate Variance (Estimated vs Actual) and adjust inventory/expense.

### Phase 4: Intelligence - ✅ COMPLETED
*   **AI**: "Predict Freight" based on history and carrier.
*   **Status**: Verified.

### Phase 5: Enterprise Hardening (Current Focus)
*   **Accounting**: Implement Sub-Ledger Accounting (SLA) for LCM.
    *   Event: `Trade Operation Finalized` -> Dr Inventory / Cr LCM Absorption.
    *   Event: `Invoice Variance` -> Dr/Cr Variance Account.
*   **Scalability**: Implement Pagination for Trade Ops Grid.
*   **Controls**: Implement `Period Close` validation for LCM.

## 5. Build-Ready Task List (Phase 1)
- [ ] **Schema**: Define `lcm_trade_operations`, `lcm_charges`, `lcm_allocations`.
- [ ] **Master Data**: Seed standard Cost Components (Freight, Insurance, Duty).
- [ ] **Service**: `LcmService` to manage Trade Ops.
- [ ] **UI**: `LcmWorkbench.tsx` (Dashboard & Creation).
