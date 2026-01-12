
# 🧠 FA Level-15 Canonical Gap Analysis

## 1. Executive Summary

This document analyzes the current state of the Fixed Assets (FA) module against the Oracle Fusion Fixed Assets baseline, aiming for Level-15 "Autonomous Asset Lifecycle" maturity.

## 2. Feature Parity Heatmap (Initial Assessment)

| Feature Area | Current Status | Oracle Fusion Parity | Gap Severity |
| :--- | :--- | :--- | :--- |
| **Asset Lifecycle** | ❌ Missing | Add, Retire, Transfer, Reinstate | Critical |
| **Depreciation Engine** | ❌ Missing | STL, Declining Balance, Units of Production | Critical |
| **Asset Books** | ❌ Missing | Corporate, Tax, Budget Books | Critical |
| **Asset Categories** | ❌ Missing | Asset Cost/Reserve Accounts, Default Rules | Critical |
| **Lease Accounting** | ❌ Missing | IFRS 16 / ASC 842 Compliance | High |
| **Physical Inventory** | ❌ Missing | Barcode scanning, Reconciliation | Medium |
| **CIP / Construction** | ❌ Missing | Project capitalization, AUC | High |
| **Reporting** | ❌ Missing | Asset Roll Forward, Depreciation Projections | High |

## 3. Detailed Gaps by Dimension

### 🧱 Dimension 1: Asset Lifecycle Management
- **Status**: **Missing**
- **Oracle Fusion Reference**: Asset Workbench (Add, Adjust, Transfer, Retire)
- **Gaps**:
    - No `fa_assets` master table.
    - NoUI for adding assets manually or via spreadsheet.
    - No retirement logic (gain/loss calculation).

### 🧱 Dimension 2: Depreciation Rules
- **Status**: **Missing**
- **Oracle Fusion Reference**: Depreciation Methods, Prorate Conventions
- **Gaps**:
    - No calculation engine.
    - Missing standard methods (Straight Line, 200% DB, Sum of Years).
    - Missing prorate calendars (Month, Day).

### 🧱 Dimension 3: Asset Books & Categories
- **Status**: **Missing**
- **Oracle Fusion Reference**: Manage Asset Books, Asset Categories
- **Gaps**:
    - Missing Tax Books (MACRS).
    - Missing Category definition (Cost, Accum Depr, Expense Account defaults).

### 🧱 Dimension 4: Accounting Integrations
- **Status**: **Missing**
- **Oracle Fusion Reference**: Create Accounting (SLA)
- **Gaps**:
    - No integration with `gl_je_lines`.
    - No connection to AP for "Mass Additions" (CIP from Invoices).

## 4. Remediation Roadmap

### Phase 1: Core Foundation (The "Ledger" Phase)
- Define Schemas: `fa_books`, `fa_categories`, `fa_assets`, `fa_transactions`.
- Implement `FaService` for Asset Addition and Basic Depreciation (STL).
- Connect to GL for Depreciation Expense posting.

### Phase 2: Operations & Lifecycle (The "Manager" Phase)
- Implement Asset Workbench UI (Add/Edit/Retire).
- Implement Transfers (Cost Center/Location changes).
- Implement Mass Additions from AP.

### Phase 3: Advanced Accounting (The "Controller" Phase)
- Implement Tax Books & MACRS.
- Implement Roll Forward Reports.
- Implement Lease Accounting (Lightweight).

## 5. Next Steps
- [ ] Create `shared/schema/fa.ts`.
- [ ] Initialize `server/services/fa.ts`.
- [ ] Create FA Landing Page.
