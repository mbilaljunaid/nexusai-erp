# Level-15 Canonical Decomposition: Billing & Revenue Innovation

**Module:** Billing & Revenue Innovation
**Role:** Senior ERP Architect
**Status:** APPROVED FOR BUILD
**Governance:** PR-ENFORCE-001 Compliant

---

## Level 1: Module Domain
**Billing & Revenue Innovation**
*   **Goal:** Enterprise-grade invoice generation, revenue recognition, and AR management.
*   **Scope:** From "Billing Event" generation to "GL Posting".
*   **Backend:** `BillingService.ts`
*   **UI:** `BillingDashboard.tsx`
*   **Sidebar:** `/finance/billing`

## Level 2: Sub-Domains
1.  **Billing Command Center:** The "Cockpit" for billing managers.
2.  **Subscription Management:** Recurring revenue lifecycle.
3.  **Customer Billing Profiles:** Master data for billing rules.
4.  **Revenue Intelligence:** Revenue waterfalls and forecasting.
5.  **Accounts Receivable:** Invoice issuance and collections.

## Level 3: Functional Capabilities
1.  **Ingest Billing Events:** Capture unbilled items (`BillingService.processEvent`).
2.  **Auto-Invoice Engine:** Batch processing (`BillingService.runAutoInvoice`).
3.  **Subscription Billing:** Recurring engine (`SubscriptionService.ts`).
4.  **Billing Rules:** Defines cycles and milestones (`BillingRulesManager.tsx`).
5.  **Anomalies:** AI-driven error checking (`BillingService.detectAnomalies`).

## Level 6: UI Surfaces (Mandatory)
### 6.1 Workbenches
*   **Billing Workbench:** Grid view of events. Actions: "Group", "Hold".
    *   *Path:* `/finance/billing/workbench`
*   **Subscription Workbench:** Grid view of contracts. Actions: "Amend", "Renew".
    *   *Path:* `/finance/billing/subscriptions` (To Be Added)
*   **Invoice Workbench:** AR Invoice management.
    *   *Path:* `/finance/ar/invoices`

### 6.2 Dashboards
*   **Billing Manager Dashboard:** Unbilled Revenue, Suspense, Approvals.
    *   *Path:* `/finance/billing`

## Level 8: Configuration Screens
*   **Billing Rules Setup:** Configure "Net 30", "Milestone".
    *   *UI:* `BillingRulesManager.tsx`
    *   *Backend:* `billing_rules` table
*   **Billing Profiles:** Customer-specific overrides.
    *   *UI:* **MISSING** (`BillingProfileManager.tsx`)
    *   *Backend:* `billing_profiles`

## Level 10: Transactional Objects
1.  **Billing Event (`billing_events`):** Raw billable item.
2.  **Billing Batch (`billing_batches`):** Processing group.
3.  **Subscription (`subscription_contracts`):** Recurring source.
4.  **AR Invoice (`ar_invoices`):** Final legal document.

## Level 13: AI Agent Actions
*   **"Detect Anomalies":** Hook into `BillingService.detectAnomalies`.
*   **"Predict Revenue":** Forecast based on subscriptions.

## Level 15: Performance & Scalability
*   **Bulk Processing:** `AutoInvoice` must use Batch SQL.
*   **Pagination:** All Grids must use Server-Side Pagination.
*   **Lazy Loading:** Child components (Lines) must lazy load.

---

## Remediation Plan (Immediate)
1.  **Navigation:** Add `SubscriptionWorkbench` to Sidebar.
2.  **UI Build:** Create `BillingProfileManager` for Master Data.
3.  **Optimization:** Refactor `runAutoInvoice` to be set-based.
