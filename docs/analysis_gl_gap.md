# General Ledger Gap Analysis (Level-15 Canonical Decomposition)

**Document Status:** DRAFT
**Version:** 1.0
**Date:** 2026-01-12
**Author:** Antigravity (Senior Oracle Fusion Financials Architect)

---

## 1. Level-15 Gap Analysis

### Domain: General Ledger Core

| Level | Dimension | Status | Oracle Fusion Reference | Gap / Finding |
| :--- | :--- | :--- | :--- | :--- |
| **L1** | **Module Domain** | **Fully Parity** | Fusion GL | GL schema, services, and core flows are established. |
| **L2** | **Sub-Domain** | **Partial** | Journals, SLA, Close, Consolidation | SLA & Journals are strong. Consolidation & Close are in early stages (Schema exists, UI missing). |
| **L3** | **Functional Capability** | **Partial** | Manual Journals, Auto-Post, Reversals, Allocations | Manual Journals: Full. Auto-Post/Reverse: Schema supported, logic partial. Allocations: Logic minimal. |
| **L4** | **Business Use Case** | **Partial** | Multicurrency, Intercompany, Budgeting | Translation Rules (Chunk 2) added currency support. Intercompany balancing logic exists in SLA. Budgeting is backend-only. |
| **L5** | **User Personas** | **Partial** | Controller vs Accountant | RBAC exists. UI does not yet strictly separate "Setup" views (Controller) from "Entry" views (Accountant). |
| **L6** | **UI Surfaces** | **Partial** | Period Close Monitor, Reconciliation Hub | Journals Grid is good. Setup forms (Calendar, SLA) recently added. Dashboarding & Close Hub are missing. |
| **L7** | **UI Components** | **Partial** | Drill-down, Smart Grids | Metric cards & skeletons needed (Chunk 7). Drill-down paths (Report -> Journal -> SLA) need hardening. |
| **L8** | **Configuration** | **Partial** | Sources, Categories, COA Structure | **Chunk 2 Success**: Calendar, SLA, Translation Rules now exist. **Critical Gap**: COA Structure & Ledger Sets UI (Chunk 3). |
| **L9** | **Master Data** | **Missing UI** | Segments, Values, Hierarchies | DB Schemas are perfect (`gl_segments`, `gl_segment_values`). UI for defining them is MISSING (Chunk 3). |
| **L10** | **Transactional Objects** | **Parity** | Headers, Lines, Batches | `gl_journals_v2` is robust. Batch logic needs UI exposure. |
| **L11** | **Workflow & Controls** | **Partial** | Journal Approval, Period Locking | Period Locking exists (Calendar Setup). Approval workflow is currently simplistic. |
| **L12** | **Accounting Intelligence** | **Parity** | Dynamic Accounting Rules | **Major Win**: `SlaService.ts` now drives accounting via DB rules (Level 15 Pattern). CVRs need UI (Chunk 4). |
| **L13** | **AI Agent Actions** | **Conceptual** | "Create Journal", "Explain Variance" | Framework exists. Actual Agentic Tools for these actions need to be registered (Chunk 8). |
| **L14** | **Security & Audit** | **Partial** | DAS (Data Access Sets), Audit Trail | Audit Schema (`gl_audit_logs`) exists. DAS Logic is placeholder. Need strictly enforced DAS in `FinanceService`. |
| **L15** | **Performance** | **Risk** | Async Posting, High Volume | Current `createJournal` is synchronous. Need background job worker for high-volume SLA/Posting (Chunk 15). |

---

## 2. Business Impact
- **Operational Risk**: Without flexible COA Structure UI (L9), users cannot define their chart of accounts without engineering support.
- **Compliance Risk**: Lack of visual Journal Approval Workflow (L11) and robust Audit Trails (L14) limits SOX readiness.
- **Efficiency**: Missing Period Close Dashboard (L6) makes month-end highly manual and opaque.

## 3. Enterprise Adoption Risk
- **Adoption Blocker**: Users expect to configure Segments/Values (Chunk 3) immediately. Current reliance on seed data is a blocker.
- **Scalability**: Synchronous transaction processing (L15) will bottleneck at enterprise volumes (>10k lines/journal).

## 4. Oracle-Aligned Remediation Pattern
- **Master Data**: Implement "Manage Chart of Accounts Structures" and "Manage Segment Values" UIs matching FSM (Functional Setup Manager) patterns.
- **SLA**: Continue forcing all accounting through `SlaService` (Subledger Accounting), never writing directly to `gl_journal_lines` from submodules.
- **Security**: Adopt "Data Access Sets" to filter GL data by Ledger/Segment values, enforcing this in the Service Layer.

## 5. Feature Parity Heatmap
- **Core GL Engine**: 🟢 (High Parity - Schemas & Service)
- **SLA Engine**: 🟢 (High Parity - Dynamic Rules)
- **Configuration UIs**: 🟡 (Medium - Chunk 2 helped, Chunk 3 critical)
- **Reporting & Dashboards**: 🔴 (Low - Needs build)
- **AI Agent Capabilities**: ⚪ (Not Started)

## 6. Task List (Build-Ready, Ordered)

### Phase 3: Master Data Management (Immediate Priority)
1.  **COA Structure UI**: Create `CoaStructureSetup.tsx` to define Segments and Labels.
2.  **Value Set Manager**: Create `ValueSetManager.tsx` for managing independent/dependent value sets.
3.  **Hierarchy Manager**: UI for Segment Hierarchies (Tree definition).
4.  **Ledger Set UI**: Define Ledger Sets for grouping.
5.  **Legal Entity UI**: Define Legal Entities and assign to Ledgers.

### Phase 4: Transactional Flows & Controls
1.  **CVR Manager**: Cross-Validation Rules UI.
2.  **DAS Manager**: Data Access Sets UI & Backend Enforcement.
3.  **Journal Wizard**: Spreadsheet-style high-volume journal entry UI.

### Phase 5: Accounting Intelligence
1.  **Posting Rules Engine**: Configurable Auto-Post criteria.
2.  **Revaluation Engine**: UI and logic for unrealized fx gain/loss.

## 7. Phased Implementation Plan

- **Chunk 1 & 2 (Complete)**: Core Engine & Basic Config.
- **Chunk 3 (Next)**: Master Data (COA, Values, Ledgers). **CRITICAL**
- **Chunk 4**: Controls (CVR, DAS) & Complex Transactions.
- **Chunk 5**: Consolidation & Advanced Tech (Allocations, Revaluation).
- **Chunk 6**: Period Close & Reporting.
- **Chunk 7-10**: AI, Premium UX, Performance.

## 8. Explicit STOP
❌ **DO NOT build Chunk 3 yet.** Awaiting approval of this analysis.
