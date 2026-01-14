# Forensic Billing Analysis & Gap Assessment

**Document Status:** FINAL REVIEW
**Module:** Billing (Invoicing & Revenue Accounting)
**Role:** Senior ERP Architect & Senior UX/UI Architect
**Date:** 2026-01-14

---

## 1. Executive Summary
The forensic analysis reveals a **critical architecture bifurcation** and **significant functionality gaps** required for Tier-1 Enterprise Billing parity. 
*   **"Billing" Module (`billing.ts`):** Currently exists only as a **SaaS Subscription Billing** engine (Plans, Subscriptions) for the platform itself, not an Enterprise Billing module for end-users. UI (`BillingManagement.tsx`) is mock-data only and **orphaned** (not in sidebar).
*   **"AR" Module (`ar.ts`):** Exists and holds the core "Invoice" entity. However, it lacks an upstream "Billing" engine to generate invoices from sources (Projects, Orders, Contracts).
*   **Current State:** Manual invoice entry only via `ARInvoices.tsx`. Exposed UUIDs. No rules engine. No integration.

---

## 2. Forensic Findings

### 2.1 Backend Architecture
*   **Schema `shared/schema/billing.ts`:** 
    *   **STATUS:** SaaS Platform Billing only. Irrelevant for Enterprise ERP functionality.
*   **Schema `shared/schema/ar.ts`:** 
    *   **STATUS:** Core AR Entities exist (`arInvoices`, `aradjustments`, `arCustomers`).
    *   **GAP:** Missing `BillingSource`, `BillingEvent`, `BillingRule`, `AutoInvoiceInterface` tables.
*   **Services:**
    *   `ARService` handles basic CRUD.
    *   **GAP:** No `BillingEngine` to process unbilled events into invoices.

### 2.2 Frontend UX & UI
*   **`BillingManagement.tsx`:** 
    *   **STATUS:** 100% Mock Data. "SaaS" focused. Orphaned (No Sidebar Link).
    *   **VERDICT:** **DELETE** or **REPURPOSE** for Enterprise Billing Dashboard.
*   **`ARInvoices.tsx`:**
    *   **STATUS:** Functional but primitive. Linked in Sidebar as "Accounts Receivable".
    *   **VIOLATIONS:** 
        *   Exposes raw UUIDs (`customerId` input).
        *   No validation.
        *   No "Workbench" features (Lines, Tax, Distributions).
*   **Navigation (`navigation.ts`):**
    *   "Accounts Receivable" exists.
    *   **MISSING:** "Billing Dashboard", "Billing Workbench" (The upstream module).

### 2.3 Integration Points
*   **Project Accounting:** No "Generate Invoice" flow found.
*   **Sales Orders:** No "Auto-Invoice" flow found.
*   **Revenue Management:** `revenue_schedule_id` exists in AR, but no clear flow from Revenue -> Billing.

---

## 3. Detailed Gap Analysis (vs. Oracle Fusion / SAP S/4HANA)

### 3.1 Functionality Gaps
| Feature | Tier-1 Standard | Nexus Current State | Remediation |
| :--- | :--- | :--- | :--- |
| **Billing Source** | Ingests data from Orders, Projects, Contracts | Manual Entry Only | Create `BillingEvent` entity |
| **Auto-Invoice** | Batch process to creating invoices | Non-Existent | Implement `AutoInvoiceService` |
| **Rule Engine** | Recurring, Milestone, Usage-based rules | `arRevenueRules` (unused) | Implement `BillingRuleEngine` |
| **Invoice Workbench** | Header, Lines, Tax, Freight, Credits in one view | Basic List View | Build `InvoiceWorkbench` |
| **Customer Master** | Rich implementation (Sites, Contacts, Profiles) | UUID Input Field | Integrate `CustomerPicker` |

### 3.2 Governance Vioations (PR-ENFORCE-001)
*   [x] **UUID Exposure:** `ARInvoices.tsx` requires typing Customer ID UUID.
*   [x] **Mock Data:** `BillingManagement.tsx` uses hardcoded arrays.
*   [x] **Orphaned Page:** `BillingManagement.tsx` is not accessible via navigation.

---

## 4. Level-15 Conceptual Model (Target State)
*See `docs/level_15_canonical_decomposition_billing.md` for full breakdown.*

### Level 1: Module Domain
**Billing & Revenue Innovation**

### Level 6: Required UI Surfaces
1.  **Billing Dashboard:** Real-time metrics (Unbilled, Invoiced, Suspended).
2.  **Billing Workbench:** The core "Action" screen for billing specialists.
3.  **Auto-Invoice Console:** For managing batch runs and errors.
4.  **Transaction Correction:** For fixing interface errors.
5.  **Customer Billing Profile:** Managing rules per customer.

---

## 5. Remediation Plan
**(DO NOT BUILD YET)**
1.  **Rename/Refactor:** Clarify `Billing` (Platform) vs `EnterpriseBilling` (ERP).
2.  **Schema:** Add `billing_events` and `billing_batches`.
3.  **Backend:** Implement `AutoInvoice` logic.
4.  **Frontend:** 
    *   Replace `BillingManagement.tsx` with real `BillingDashboard`.
    *   Upgrade `ARInvoices.tsx` to `InvoiceWorkbench`.
    *   Add `CustomerPicker` to replace UUID inputs.
    *   Add "Billing" section to Sidebar.
