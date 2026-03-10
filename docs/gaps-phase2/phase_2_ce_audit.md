# Deep Parity Audit: Cash Management (CE)

This report provides a granular, feature-by-feature codebase parity analysis of the Nexus CE module against Oracle Fusion Cash Management.

---

## 1. Database Schema Parity (`shared/schema/cash.ts`)

**Current Implementation:**
Strong foundation implementing `cash_bank_accounts`, `cash_statement_headers`, `cash_statement_lines`, `cash_transactions` (subledger ties), and `cash_zba_structures`. Master data connects `cash_banks` to `cash_bank_branches`.

**Oracle Gaps (Required Upgrades):**
*   **Detailed Tolerance & Matching Rules**: `cash_reconciliation_rules` exists with a generic JSONB criteria field. Oracle defines highly specific tolerance rules (e.g., Amount Tolerance %, Amount Tolerance Fixed, Date Tolerance Days) globally and per bank account. *Gap: Schema relies on undefined JSONB rather than strict relational tolerance matrices.*
*   **Advanced Cash Pooling**: Schema supports physical ZBA sweeps (`cash_zba_structures`). Oracle Cash Management supports Notional Pooling (virtual balance aggregation without physical sweeps) to optimize interest calculation. *Gap: Missing Notional Pooling concepts and interest calculation schemas.*

---

## 2. Backend API Parity (`server/routes/cash.ts`)

**Current Implementation:**
Provides routes to upload statements (handling parsing), auto-reconcile, manual reconcile, execute ZBA sweeps, and handle basic cash forecasting.

**Oracle Gaps (Required Upgrades):**
*   **Heuristic Matching Engine**: Oracle's auto-reconciliation runs through a complex rules engine (e.g., First attempt exact match on Date+Amount+Ref, then Date+Amount, then +/- 1 Day + Amount). The Nexus auto-reconcile API is a black box service call without configurable pass-throughs. *Gap: Missing multi-pass heuristic matching engine logic.*
*   **External Cash Transactions**: Oracle handles direct-to-bank expected cashflows (e.g., a planned payroll run not yet in AP). The `/forecasts` endpoint handles manual entries, but lacks deep integration with payroll/tax modules.

---

## 3. Frontend UI/UX Parity (`CashReconciliation.tsx`, `CashManagementDashboard.tsx`)

**Current Implementation:**
Sleek Dashboard showing available cash and un-reconciled items. The Reconciliation Workbench provides side-by-side lists of Bank Statement Lines and ERP Transactions.

**Oracle Gaps (Required Upgrades):**
*   **Drag-and-Drop Dual Pane Reconciliation**: While the Nexus UI has two lists, Oracle provides an interactive dual-pane UI where users can multi-select 3 statement lines and drag them onto 1 subledger transaction to execute a 3-to-1 match. *Gap: Nexus UI is currently click-based and lacks interactive drag-and-drop N-to-N matching capability.*
*   **Matching Rules Configurator UI**: The "Reconciliation Rules" tab in `CashReconciliation.tsx` literally states "Configuration coming soon." *Gap: No UI exists to define matching rules and tolerances.*
*   **Bank/Branch/Account Hierarchy Setup UI**: Missing the Oracle-style multi-step wizard to define a Bank, then link Branches, then link Accounts.

---
**Upgrade Priority**: **HIGH** (Specifically the Rules Configurator and Drag-and-Drop UI).
