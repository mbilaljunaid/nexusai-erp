# Deep Parity Audit: Purchasing / Procurement (PO)

This report provides a granular codebase parity analysis of the Nexus Procurement module against Oracle Fusion Purchasing.

---

## 1. Database Schema Parity (`shared/schema/scm.ts`)

**Current Implementation:**
The schema is surprisingly deep. It includes `purchase_orders`, `purchase_order_lines`, and importantly, `purchase_order_distributions` (allowing for split-accounting, which was previously thought missing). It also contains `purchase_requisitions`, `procurement_contracts`, and `scm_sourcing_rfqs`.

**Oracle Gaps (Required Upgrades):**
*   **Blanket Purchase Agreements (BPAs)**: While `procurement_contracts` exist (acting like Contract Purchase Agreements - CPAs), there is no schema for BPAs, where specific items are pre-negotiated at specific prices without a committed quantity. *Gap: Missing `scm_blanket_agreements` and Price Break logic.*
*   **Encumbrance Accounting (Commitment Control)**: Oracle natively encumbers funds when a PR/PO is approved. The `scm.ts` schema does not track budget relief or encumbrance statuses.

---

## 2. Backend API Parity (`server/routes/scm.ts` & others)

**Current Implementation:**
Basic CRUD routing endpoints handles PO creation, PR creation, and Approval routing. Includes simple endpoint like `/api/procurement/purchase-orders/:id/approve`.

**Oracle Gaps (Required Upgrades):**
*   **Auto-Create Logic**: Oracle allows Buyers to Auto-Create POs directly from approved Requisitions using a dedicated Builder API. The current backend requires manual linking or basic 1:1 conversions.
*   **Funds Check API**: Missing integration with the GL to check if Budget Funds are available before PO Approval.

---

## 3. Frontend UI/UX Parity (`PurchaseOrders.tsx`, etc.)

**Current Implementation:**
A standard CRUD grid interface (`PurchaseOrderList.tsx`) and standard "Smart Add" modals. There is a `PurchaseRequisitions.tsx` cart-like UI.

**Oracle Gaps (Required Upgrades):**
*   **Buyer Work Area**: Oracle provides a comprehensive dashboard for Buyers to manage Exceptions (Past Due POs, Unassigned Requisitions, Rejected Invoices). The Nexus UI is just a list of POs.
*   **Distributions UI**: Although the database supports `purchase_order_distributions`, there is no UI screen in the frontend to allocate a single PO Line amount across multiple Charge Accounts/Projects. *Gap: Missing Line-Level split accounting UI.*

---
**Upgrade Priority**: **MEDIUM** (The schema is strong, but the frontend lacks the complex "Buyer Work Area" and Distributions UI).
