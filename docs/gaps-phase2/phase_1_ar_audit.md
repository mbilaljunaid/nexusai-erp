# Deep Parity Audit: Accounts Receivable (AR)

This report provides a granular, feature-by-feature codebase parity analysis of the Nexus AR module against Oracle Fusion Receivables.

---

## 1. Database Schema Parity (`shared/schema/ar.ts`)

**Current Implementation:**
Nexus has a very comprehensive AR schema spanning Customers (TCA model: Party, Account, Site, Contact), Invoices, Receipts, Applications, Revenue Recognition, Dunning, AutoInvoice Staging, and Lockbox Batches.

**Oracle Gaps (Required Upgrades):**
*   **Customer Profile Class Cascading**: While standard TCA tables exist, Nexus lacks the Oracle "Customer Profile Class" architectural pattern. In Oracle, a Profile Class defines credit limits, payment terms, and dunning rules. Updating the Class automatically cascades these settings down to millions of Accounts/Sites. *Gap: Missing centralized Profile Class management engine.*
*   **Receipt Reversal Categories**: `ar_receipts` supports a "Reversed" status. Oracle explicitly requires a Reversal Category (e.g., Non-Sufficient Funds (NSF), Stop Payment, Data Entry Error) which triggers different SLA accounting SLA events (e.g., reinstating the invoice vs. writing it off). *Gap: Lack of granular reversal accounting triggers.*
*   **Cross-Currency Application Complexity**: While `fx_gain_loss` exists, Oracle stores multiple allocated amounts to handle scenarios where a EUR receipt pays a GBP invoice in a USD ledger, calculating cross-currency realization seamlessly.

---

## 2. Backend API Parity (`server/routes/ar.ts`)

**Current Implementation:**
Rich API surface handling invoice creation, receipt application, automated revenue recognition (`/revenue/recognize`), lockbox processing, and basic AutoInvoice imports.

**Oracle Gaps (Required Upgrades):**
*   **AutoInvoice Grouping & Ordering Rules**: Nexus `/autoinvoice/import` processes staging lines directly. Oracle AutoInvoice utilizes complex, user-defined Grouping Rules (e.g., "Group all lines with the same PO number into one Invoice") and Line Ordering Rules. *Gap: Missing rule-based aggregation engine during invoice import.*
*   **Advanced Collections Strategy Engine**: The `/dunning/run` endpoint is basic. Oracle Advanced Collections uses a concurrent scoring engine to evaluate customer health and assign a multi-step "Strategy" (e.g., Day 1: Email, Day 5: Call Task, Day 10: Suspend Credit). *Gap: Dunning is not driven by a sequential, multi-step strategy engine.*

---

## 3. Frontend UI/UX Parity (`ARInvoices.tsx`, `ARReceipts.tsx`)

**Current Implementation:**
Sleek React dashboards with capabilities like AI Payment Prediction, Interest Invoice generation, and interactive modals for applying receipts to invoices or creating chargebacks.

**Oracle Gaps (Required Upgrades):**
*   **Transaction Workbench (Line Level Entry)**: In `ARInvoices.tsx`, creating a new invoice is done via a simplified modal that only captures Header amounts (`invoiceAmount`). Oracle's Transactions Workbench allows meticulous line item entry, individual line tax overrides, and distribution of Sales Credits across multiple salespersons. *Gap: Manual AR invoice creation limits users to header-level entry without granular line/memo-line details.*
*   **Lockbox Mass AutoMatch UI**: While there are API endpoints for lockbox, there isn't a dedicated UI equivalent to Oracle's "Manage Lockbox Execution" where a user can view hundreds of fuzzy-matched receipts and quickly accept/reject the AI/system recommendations in bulk. *Gap: Missing high-volume receipt match resolution screen.*
