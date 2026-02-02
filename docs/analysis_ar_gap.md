# Level-15 AR Gap Analysis & Roadmap
**Date**: 2026-01-12
**Status**: ⚠️ CONDITIONALLY READY (Performance & Integrity Gaps Identified)
**Validation**: Codebase Audit (Deep Dive)

> **Executive Summary**: The Accounts Receivable module demonstrates mature "Premium" architecture with full SLA integration, "TCA-style" customer hierarchy (Party/Account/Site), and integrated Revenue Management structures.
> However, it **FAILS Level 15 (Performance)** due to unbounded memory operations in Dunning and Credit Scoring.
> It also **FAILS Level 10 (Integrity)** due to the explicit absence of Receipt Unapplication logic, which creates a "trap" where mistakes cannot be reversed.

---

## 1. Delta Changes & Findings
-   **SLA Engine**: ✅ Confirmed `slaService.createAccounting` integration for Invoices, CMs, and Receipts.
-   **TCA Model**: ✅ Confirmed Oracle-aligned Customer -> Account -> Site hierarchy.
-   **Revenue**: ✅ Confirmed `ar_revenue_schedules` generation exists.
-   **Dunning**: ❌ **Performance Risk**: `createDunningRun` fetches ALL invoices into memory to calculate overdue status.
-   **Receipts**: ❌ **Integrity Gap**: `unapplyReceipt` is explicitly unimplemented (stubbed).
-   **AI**: ❌ **Mock Only**: `generateAiCollectionEmail` returns a hardcoded string.

## 2. Feature Parity Heatmap (Level 1-15)

| Level | Dimension | Status | Notes |
| :--- | :--- | :--- | :--- |
| **L1** | **Module Domain** | 🟢 **Parity** | Billing, Receipts, Collections, Revenue. |
| **L2** | **Sub-Domain** | 🟢 **Parity** | Standard Invoice, CM, DM, Chargeback supported. |
| **L3** | **Functional** | 🟢 **Parity** | Payment Terms, Apply/Unapply (Missing Unapply). |
| **L4** | **Business Case** | 🟢 **Parity** | B2B flow, Subscription (Revenue Rules) support. |
| **L5** | **Personas** | 🟢 **Parity** | Billing Clerk, Collector, Manager roles. |
| **L6** | **UI Surfaces** | 🟢 **Parity** | Revenue Workbench, Collections Dashboard. |
| **L7** | **UI Components** | 🟢 **Parity** | Premium Grids, Metric Cards. |
| **L8** | **Configuration** | 🟡 **Partial** | System Options exist. Tax Method hardcoded. |
| **L9** | **Master Data** | 🟢 **Parity** | Customer Hierarchy (Parties, Accounts, Sites). |
| **L10** | **Objects** | 🔴 **Gap** | **Receipt Unapplication** missing. |
| **L11** | **Workflow** | 🟢 **Parity** | Credit Holds, Approval statuses. |
| **L12** | **Intelligence** | 🟡 **Partial** | Automated Accounting (SLA). Scoring is naive/slow. |
| **L13** | **AI Agents** | 🔴 **Gap** | Collections AI is mock-only. |
| **L14** | **Security** | 🟢 **Parity** | RBAC enforced via API. |
| **L15** | **Performance** | 🔴 **FAILED** | **Dunning Run** is synchronous O(N). **List Invoices** is unbounded. |

---

## 3. Business Impact & Risk
1.  **Dunning Timeout**: Running dunning for 10,000 invoices will crash the server (NodeJS Heap OOM or Timeout).
2.  **Accounting Trap**: If a user applies a receipt to the wrong invoice, they cannot undo it (Unapply), leading to permanent accounting errors.
3.  **Manual Toil**: Revenue recognition requires clicking "Recognize" line-by-line; no bulk sweep exists.

## 4. Oracle-Aligned Remediation Roadmap

### Phase 1: Transactional Integrity (Priority: Critical)
-   **Objective**: Enable reversible receipt applications.
-   **Task**: Implement `unapplyReceipt` logic (Reverse SLA, Restore Balance, Update Status).

### Phase 2: Performance & Scalability (Priority: High)
-   **Objective**: Prevent timeouts on bulk processes.
-   **Task**: Move `createDunningRun` and `calculateCreditScore` to **Async Workers** (`DunningWorker.ts`, `ScoringWorker.ts`).
-   **Task**: Implement pagination for `listInvoices`.

### Phase 3: Automation (Priority: Medium)
-   **Objective**: Automate monthly revenue closes.
-   **Task**: Implement `RevenueRecognitionWorker` to sweep and process pending schedules for the period.

### Phase 4: AI Logic (Priority: Low/Future)
-   **Objective**: Real AI for Collections.
-   **Task**: Replace mock email generation with LLM call using Invoice/Customer context.

## 5. Build-Ready Task List

### Phase 1: Integrity
- [ ] Implement `arService.unapplyReceipt` logic <!-- id: 201 -->
- [ ] Implement SLA Reversal event (`AR_RECEIPT_UNAPPLIED`) <!-- id: 202 -->

### Phase 2: Performance
- [ ] Create `server/worker/DunningWorker.ts` <!-- id: 203 -->
- [ ] Refactor `arService.createDunningRun` to offload to worker <!-- id: 204 -->
- [ ] Refactor `arService.calculateCreditScore` to be on-demand or background <!-- id: 205 -->

### Phase 3: Automation
- [ ] Create `server/worker/RevenueWorker.ts` <!-- id: 206 -->
- [ ] Implement Bulk Recognition API <!-- id: 207 -->

## 6. STOP: Do Not Proceed
**Status**: Handover for Approval.
**Next Step**: Implementation requires approval of Phase 1 & 2.
