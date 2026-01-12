# analysis_procurement_scm_gap

---

## 1. Executive Summary & Status

**Current Status**: ⚠️ **MVP / Proof of Concept Only**
**Enterprise Readiness**: ❌ **Not Ready**
**Oracle Fusion Parity**: < 5%

The current Procurement and Supply Chain Management (SCM) module consists of minimal, in-memory prototypes (`PurchaseOrderService`, `ProductService`) connected to basic UI dashboards. It lacks fundamental enterprise structures such as persistent database entities, supplier master data, requisition lifecycle, receiving, inventory transactions, and financial integration. It is effectively a "Delete & Rebuild" scenario for the backend core, while the frontend components can be refactored and bound to new persistent services.

---

## 2. Level-15 Gap Analysis

### Dimension A: Source-to-Pay Lifecycle

| Level | Component | Current State | Oracle Fusion Reference | Gap Severity |
|---|---|---|---|---|
| **L1** | **Module Domain** | Procurement & Inventory POC | Procurement Cloud, SCM Cloud | Critical |
| **L2** | **Sub-Domain** | Purchasing, Inventory | Purchasing, Self Service Procurement, Inventory Management, Receipt Accounting | Critical |
| **L3** | **Functional Capability** | Basic PO Creation, Item List | Requisitions, RFQ, PO, ASNs, Receipts, Returns, Debit Memos | Critical |
| **L4** | **Business Use Case** | Ad-hoc buying | Strategic Sourcing → Contract → Req → PO → Receipt → Pay | Critical |
| **L5** | **User Personas** | Generic User | Requester, Buyer, Category Manager, Warehouse Manager, Receiver | Critical |
| **L6** | **UI Surfaces** | Simple Dashboards | Sourcing Workbench, Requester Catalog, Buyer Work Center, Receiving Dock | Critical |
| **L7** | **UI Components** | Basic Cards & Grids | Infolets, Approval Tiles, Catalog Search, Shopping Cart | Major |
| **L8** | **Configuration** | None | Purchasing System Options, Receiving Parameters, Document Styles | Critical |
| **L9** | **Master Data** | String 'Supplier', In-memory Items | Supplier Protocol (Parties, Sites), Item Master (Orgs, Categories) | **BLOCKER** |
| **L10** | **Transactional Objects** | PO Object (Memory) | `PO_HEADERS_ALL`, `PO_LINES_ALL`, `RCV_TRANSACTIONS`, `INV_MATERIAL_TXNS` | **BLOCKER** |
| **L11** | **Workflow & Controls** | Status Dropdown | AME/BPM Approval Rules, Tolerance Checks, Budget Control | Critical |
| **L12** | **Intelligence** | Simple Sums | Spend Analytics, Supplier Performance, Inventory Turn | Major |
| **L13** | **AI Agent Actions** | None | Smart Sourcing, Risk Prediction, Auto-Replenishment | Critical |
| **L14** | **Security & Audit** | Basic | RBAC (Data Access Sets), SoD, Audit Trail | Critical |
| **L15** | **Performance** | In-Memory (Fast but volatile) | High Volume Processing, Background Jobs | Critical |

---

## 3. Detailed Gap Findings (By Dimension)

### 1. Master Data (Suppliers & Items)
*   **Missing**: Real Supplier entity. Currently `supplier` is just a string field in a PO.
*   **Missing**: Supplier Sites/Addresses (critical for tax & delivery).
*   **Missing**: Item Master configuration (Units of Measure, Categories, Attributes).
*   **Missing**: Inventory Organization structure.

### 2. Procurement Lifecycle (Req to PO)
*   **Missing**: Requisition entity. No shopping cart experience.
*   **Missing**: Approval workflow logic.
*   **Deviated**: PO creation is direct execution without control/validation.
*   **Missing**: PO Lines/Distributions (Charge Accounts).

### 3. Receiving & Inventory
*   **Missing**: Receiving transactions (Receipts, Inspections, Deliveries).
*   **Missing**: Inventory transactional history (Material Transactions).
*   **Missing**: On-hand quantity calculation based on transactions (currently explicit update).
*   **Missing**: Lot/Serial control.

### 4. Financial Integration
*   **Missing**: Accrual Accounting (Receipt Accruals).
*   **Missing**: Integration with AP (Invoice matching).
*   **Missing**: Integration with GL (SLA/Accounting generation).

---

## 4. Oracle-Aligned Remediation Pattern

We will implement the **Oracle Fusion Procurement & SCM Architecture** using a phased "Foundation First" approach.

### Pattern:
1.  **Party Model**: Supplier -> Supplier Site -> Supplier Contact.
2.  **Item Master**: Item -> Item Organization Assignment.
3.  **Document Hierarchy**: Requisition -> PO Header -> PO Line -> PO Distribution.
4.  **Fulfillment**: PO -> ASN -> Receipt -> Putaway.
5.  **Event-Based Accounting**: Transaction -> Accounting Event -> Journal.

---

## 5. Feature Parity Heatmap

```
Feature                         | Current | Target (Oracle) | Gap
-------------------------------|---------|----------------|------
Supplier Management            | ❌      | ✅             | Blocker
Item Master                    | ⚠️      | ✅             | Major
Requisitioning                 | ❌      | ✅             | Blocker
Purchase Order Mgmt            | ⚠️      | ✅             | Major (Rebuild)
Receiving                      | ❌      | ✅             | Blocker
Inventory Transactions         | ❌      | ✅             | Blocker
Receipt Accounting             | ❌      | ✅             | Blocker
Sourcing / RFQ                 | ❌      | ✅             | Deferred
Supplier Portal                | ❌      | ✅             | Deferred
AI Procurement Agent           | ❌      | ✅             | Major
```

---

## 6. Phased Implementation Plan

### Phase 1: Core Foundation (Master Data & Inventory)
*   **Goal**: Establish solid entities for Suppliers and Items.
*   **Tasks**:
    1.  Create `Supplier`, `SupplierSite` entities.
    2.  Create `Item`, `UOM`, `Category` entities.
    3.  Create `InventoryOrganization`, `Subinventory`, `Locator`.
    4.  Migrate `ProductService` to permanent DB storage.

### Phase 2: Purchasing Core (PO Lifecycle)
*   **Goal**: Enable creation of structured Purchase Orders.
*   **Tasks**:
    1.  Create `PurchaseOrder`, `PurchaseOrderLine`, `PurchaseOrderDistribution` entities.
    2.  Implement `PurchaseOrderService` with persistent storage.
    3.  Implement PO Status workflow (Draft -> Approved -> Open).

### Phase 3: Receiving & Inventory Execution
*   **Goal**: Handover from Purchasing to Inventory.
*   **Tasks**:
    1.  Create `Receipt` and `ReceiptLine` entities.
    2.  Implement `ReceivingService` (3-way match logic preparation).
    3.  Create `MaterialTransaction` entity for inventory movements.
    4.  Update Inventory levels based on transactions.

### Phase 4: Requisitions & Approvals (Self-Service) - *Next Sprint*
*   **Goal**: Employee-facing procurement.
*   **Tasks**: Requisition entity, Approval Engine.

---

## 7. Ordered, Build-Ready Task List (Immediate)

1.  **[Foundation] Implement Supplier Master**
    *   Create `Supplier` and `SupplierSite` entities.
    *   Create `SupplierService` and Controller.
    *   Update `ProcurementManagement.tsx` to use real suppliers.

2.  **[Foundation] Implement Item Master & Inventory Org**
    *   Refactor `Product` entity to `Item` with `InventoryOrg` relation.
    *   Update `ProductService` to DB storage.

3.  **[Core] Implement Purchase Order Architecture**
    *   Replace in-memory PO with `PurchaseOrder` (Header/Line/Dist).
    *   Implement Database relationship (Supplier, Item).

4.  **[Exec] Implement Receiving & Transactions**
    *   Create `MaterialTransaction` entity.
    *   Implement `receiveGoods` API (PO -> Inventory).

---

## 8. EXPLICIT STOP

**STOP** – Analysis Complete. Awaiting approval to begin Phase 1 (Foundation).
