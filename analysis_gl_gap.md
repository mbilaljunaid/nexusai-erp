# NexusAI General Ledger: Oracle Fusion Gap Analysis

**Date:** January 10, 2026
**Role:** Senior Oracle Fusion Financials Architect
**Status:** Baseline Analysis Complete (Chunk 1)

---

## 1. Executive Summary
The NexusAI GL module is currently in a **Split-Brain State**.
- **The Good:** A robust, Oracle-aligned backend service (`FinancialService.ts`) exists, capable of complex validation, intercompany balancing, and DB persistence.
- **The Bad:** The public API endpoints (`glRoutes.ts`) currently bypass this robust service and use an inferior, in-memory prototype (`glPostingEngine.ts`). **This is a critical P0 risk** as data posted via API is ephemeral.
- **The Gap:** While the Schema is V2 (advanced), the "Wiring" is broken. Subledger Accounting (SLA) is missing, meaning AP/AR modules cannot automatically generate journals using configurable rules.

---

## 2. Feature Parity Classification

| Feature Area | Classification | Notes |
| :--- | :--- | :--- |
| **Ledger Architecture** | **Partially Implemented** | `gl_ledgers_v2` schema supports Primary/Secondary, but API wiring is missing. |
| **Journal Processing** | **Implemented Differently** | APIs use in-memory engine. Robust DB-backed engine exists but is dormant. |
| **Subledger Accounting (SLA)** | **Missing** | No transformation engine to convert Invoices/Payments to GL Journals. |
| **Chart of Accounts (COA)** | **Partially Implemented** | 5 rigid segments. Oracle requires dynamic segment support (up to 30). |
| **Intercompany (AGIS)** | **Partially Implemented** | Basic peer-to-peer balancing logic exists in `FlightService`. Missing Global Intercompany balancing. |
| **Revaluation** | **Partially Implemented** | Schema exists (`gl_revaluations`), but logic is not exposed via API. |
| **Reporting (FSG)** | **Missing** | No "Financial Statement Generator" engine to define row/column sets dynamically. |
| **Internal Controls** | **Partially Implemented** | Data Access Sets (DAS) schema exists but is not enforced on the API layer. |

---

## 3. High-Priority Remediation Roadmap (Chunks 2-12)

### 🔴 CRITICAL FIXES (Chunk 2)
1.  **Deprecate `glPostingEngine.ts`:** Delete this in-memory prototype.
2.  **Rewire `glRoutes.ts`:** Point all endpoints (`/post`, `/validate`) to `FinanceService.ts`.
3.  **Enforce Persistence:** Ensure `db.insert` is called for every journal.

### 🟠 ARCHITECTURE UPGRADES (Chunk 3)
1.  **Dynamic COA:** Update `glCodeCombinations` to support N-segments (JSON storage or Dynamic Columns).
2.  **Ledger Sets:** Expose "Ledger Set" logic in `FinanceService` for consolidated reporting.

### 🟡 PREMIUM UI (Chunk 4)
1.  **Journal Workbench:** Build a specialized "Grid View" for high-volume journal entry.
2.  **Dashboard Integration:** Connect Metric Cards to real `FinanceService` stats.

### 🔵 NEW ENGINES (Chunks 5-10)
1.  **SLA Engine:** Build `SubledgerAccountingService` to listen to AP/AR events.
2.  **AI Operations:** Hook AI Agents into `FinanceService` for anomaly detection.

---

## 4. Business Impact & Risk
- **Data Loss Risk (High):** Current API writes to memory. Server restart wipes data.
- **Compliance Risk (High):** Missing "Sequence Numbering" (Document Sequencing) for audit.
- **Scalability Risk (Medium):** Hardcoded 5 segments limits enterprise adoption.

---

## 5. Artifacts to Watch
- `server/services/finance.ts` (The True Generic Backend)
- `shared/schema/finance.ts` (The Source of Truth)
- `glRoutes.ts` (The Broken Interface)

⚠️ **DIRECTIVE:** Proceed to Chunk 2 to fix the "Split-Brain" issue immediately.
