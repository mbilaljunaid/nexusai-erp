# Deep Parity Audit: Inventory Management (INV)

This report provides a granular codebase parity analysis of the Nexus Inventory module against Oracle Fusion Inventory Management.

---

## 1. Database Schema Parity (`shared/schema/scm.ts`)

**Current Implementation:**
The inventory schema includes Organization, Subinventory, Locator, Item Master, On-Hand balances, Material Transactions, and Lot/Serial control. 

**Oracle Gaps (Required Upgrades):**
*   **Item Master Complexity**: Oracle's Product Information Management (PIM) uses hundreds of attributes spread across tabs (Purchasing, Planning, Costing, Service, MRP). The Nexus `inv_items` table is highly simplified (just item info, uom, and min/max qty). *Gap: Needs a dedicated Item Master Attributes schema (EAV pattern).*
*   **Material Status Control**: Oracle allows setting strict "Statuses" on Lots, Locators, or Subinventories (e.g., "Active", "Quarantine", "Hold") that block specific transaction types. Nexus only has an `active` boolean.

---

## 2. Backend API Parity 

**Current Implementation:**
APIs support basic receiving (`rcv_shipment_headers`), material issuance, and balance lookups.

**Oracle Gaps (Required Upgrades):**
*   **Cost Processor Engine**: Oracle processes Costing asynchronously from Inventory material movement. When an item moves, a cost event is queued for the Costing Module. Nexus lacks an asynchronous costing event engine.
*   **Min-Max Planning Engine**: No background job or API engine exists to calculate Min-Max restock recommendations and auto-generate Purchase Requisitions based on reorder points.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
Standard tabular views for stock levels and item definitions.

**Oracle Gaps (Required Upgrades):**
*   **Item Master Workbench**: Missing the deep, multi-tabbed UI required to configure enterprise items.
*   **Transaction Execution**: Needs dedicated, user-friendly forms for Inter-Org Transfers, Subinventory Transfers, and Miscellaneous Receipts/Issues.

---
**Upgrade Priority**: **HIGH** (The Item Master is the backbone of the ERP and is currently too simple).
