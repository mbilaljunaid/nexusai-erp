# analysis_inventory_gap

## 1. Executive Summary: Inventory Module Status
**Current State:** ❌ **Proto-MVP / Catalog Only**
**Enterprise Readiness:** ❌ **Not Ready**

The current codebase (`backend/src/modules/inventory`) implements a basic **Product Catalog** with a single `quantityOnHand` field. It completely lacks the transactional immutable ledger required for an ERP. It functions more like an e-commerce backend than a Supply Chain system.

**Critical Deficiencies:**
*   **No Transaction Ledger:** Stock updates are direct overwrites of the `Item` table. No audit trail.
*   **No Subinventories/Locators:** Inventory is a single flat number per Org.
*   **No Costing:** No FIFO/Average/Standard cost layers.
*   **No Lot/Serial Control:** Impossible to trace batches or specific units.

---

## 2. Level-15 Gap Analysis (Canonical Structure)

### Dimension 1: Inventory Transactions (The Core Ledger)
| Level | Requirement | Current Implementation | Gap Severity |
| :--- | :--- | :--- | :--- |
| **L1** | **Domain** | Material Transactions | ✅ **Implemented** |
| **L2** | **Sub-Domain** | Transaction Types | ✅ **Implemented** (Svc Logic) |
| **L3** | **Capability** | Immutable Ledger Entry | ✅ **Implemented** (`MaterialTransaction`) |
| **L10** | **Object** | `MaterialTransaction` Entity | ✅ **Implemented** |
| **L14** | **Audit** | Transaction History View | ⚠️ **Pending UI** |

### Dimension 2: Structure (Warehouse Topology)
| Level | Requirement | Current Implementation | Gap Severity |
| :--- | :--- | :--- | :--- |
| **L9** | **Master Data** | Subinventories (Storage Areas) | ✅ **Implemented** (Entity) |
| **L9** | **Master Data** | Locators (Row/Rack/Bin) | ✅ **Implemented** (Entity) |
| **L8** | **Config** | Locator Control | ⚠️ **Pending Logic** |

### Dimension 3: Item Control (Granularity)
| Level | Requirement | Current Implementation | Gap Severity |
| :--- | :--- | :--- | :--- |
| **L9** | **Master Data** | Lot Control | ✅ **Implemented** (Entity) |
| **L9** | **Master Data** | Serial Control | ✅ **Implemented** (Entity) |
| **L9** | **Master Data** | Item Attributes | ⚠️ **Pending Legacy Mig** |

### Dimension 4: Inventory Planning & Allocations
| Level | Requirement | Current Implementation | Gap Severity |
| :--- | :--- | :--- | :--- |
| **L10** | **Object** | Reservations (Hard/Soft allocation) | ❌ Missing |
| **L10** | **Object** | Min-Max Planning / Replenishment | ✅ **Implemented** (`PlanningService`) |
| **L4** | **Use Case** | Available-to-Promise (ATP) Calc | ❌ Missing |

### Dimension 5: Costing & Valuation
| Level | Requirement | Current Implementation | Gap Severity |
| :--- | :--- | :--- | :--- |
| **L12** | **Logic** | Cost Layers (FIFO/Avg) | ✅ **Implemented** (`CstTransactionCost`) |
| **L12** | **Logic** | Transaction Costing | ✅ **Implemented** (Inline w/ Txn) |

---

## 3. Business Impact & Risk
*   **Financial Risk:** Without a transaction ledger and costing layers, **Inventory Valuation is impossible to audit**. The Balance Sheet figure for Inventory will be undefendable.
*   **Operational Risk:** Without Bin/Locator management, warehouse staff **cannot find items** efficiently.
*   **Compliance Risk:** Lack of Lot Tracking makes the system unusable for Pharma/Food/Automotive (traceability).

---

## 4. Remediation Roadmap (Build-Ready)

### Phase 1: The Core Transaction Engine (Must Do First)
1.  **Define Structure:** Create `Subinventory` and `Locator` entities.
2.  **Define Ledger:** Create `MaterialTransaction` entity (txn_type, quantity, date, source_doc, cost).
3.  **Define Balances:** Create `OnHandBalance` entity (Item + Sub + Locator + Lot). **Remove** `quantityOnHand` from `Item` entity (it should be an aggregate, not a column).
4.  **Transaction Service:** Implement `executeTransaction()` pattern (Validate -> Insert Txn -> Update OnHand).

### Phase 2: Item Control & Costing
1.  **Lot/Serial:** Create `Lot` and `Serial` entities. Update Transaction logic to handle Split-Lot scenarios.
2.  **Cost Stack:** Create `CstTransactionCost` (FIFO layers or Average Cost history).

### Phase 3: Planning & Operations
1.  **Inter-Org Transfer:** Logic to move stock between Orgs (Intransit Shipments).
2.  **Counting:** Cycle Count and Physical Inventory entry forms.

---

## 5. Proposed Architecture (Oracle Fusion Aligned)

**Entities:**
*   `InvOrganization` (Org Parameters)
*   `InvSubinventory` (Zone)
*   `InvLocator` (Bin)
*   `InvItem` (Attributes only)
*   `InvMaterialTransaction` (The Immutable Ledger)
*   `InvOnHandBalance` (Current State Table)
*   `InvLot` / `InvSerial`

**Services:**
*   `InventoryTransactionService`: The single source of truth for stock movement.
*   `InventoryBalanceService`: Aggregates On-Hand for UI/ATP.
*   `CostingService`: Listens to Transactions and computes Value.

---

## 6. Execution Plan
**STOP.** Needs explicit user approval to refactor `Item` entity and introduce the Transactional Engine. This is a "Re-platforming" of the inventory module, not just a feature add.
