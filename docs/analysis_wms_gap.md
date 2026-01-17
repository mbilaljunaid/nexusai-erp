# Analysis: Warehouse Management (WMS) Gap & Readiness

> **Last Updated:** 2026-01-17
> **Assessment Verdict:** ⚠️ **Gap Analysis In-Progress** (Core Inventory exists, WMS Execution missing)

## 1. Forensic Audit (Current State)
The existing system has a robust **Inventory Foundation** but lacks the **Warehouse Execution** layer required for Tier-1 parity.

### Fully Implemented (Inventory Foundation)
*   **Structure**: Multi-Org, Subinventories, Locators (L9)
*   **Transactions**: Receipts, Issues, Transfers (L4)
*   **Accuracy**: Cycle Counting, Reservations (L13, L10)
*   **Control**: Lot & Serial tracking (L9)

### Missing / Partial (WMS Execution Gaps)
*   **Wave Management**: No ability to group orders into waves for optimized picking (L3)
*   **Task Management**: No "Warehouse Task" entity for Directed Picking, Putaway, or Replenishment (L11)
*   **Packing & LPNs**: No Handling Unit (HU) or License Plate Number (LPN) management (L9)
*   **Directed Putaway**: No rules-based storage optimization (L13)
*   **Dock & Yard**: No management for trailer check-in or dock assignment (L2)

---

## 2. Feature Parity Heatmap (Oracle Fusion Standard)

| Feature Area | Oracle Fusion | NexusAI Current | Gap | Level (1-15) |
| :--- | :--- | :--- | :--- | :--- |
| **Receiving** | ASN, Inspection, Putaway | ✅ ASN, Receipt | ⚠️ No Directed Putaway | L3 |
| **Material Handling** | Task-based (Pick/Move) | ❌ None | **No Task Workbench** | L6 |
| **Picking** | Wave, Batch, Cluster | ❌ None | **No Wave Console** | L4 |
| **Packing** | Containerization, manifest | ⚠️ Shipping Console | **No LPN/HU Control** | L6 |
| **Shipping** | Manifest, Carrier Integration | ⚠️ Partial | **No Carrier API** | L15 |
| **Labor** | Labor metrics, balancing | ❌ None | **No Labor Mgmt** | L13 |

---

## 3. detailed Level-15 Canonical Decomposition

### Level 1: Module Domain
*   **Target**: Warehouse Management & Execution
*   **State**: ✅ Defined in `InventoryModule`

### Level 2: Sub-Domain
*   **Target**: Inbound, Storage, Outbound, Inventory Control, Yard
*   **State**: ⚠️ Partial (Inventory Control, Inbound/Outbound exist but lack execution depth. Yard is missing).

### Level 3: Functional Capability
*   **Target**: Receiving, Putaway, Picking, Packing, Shipping, Counting, Task Mgmt
*   **State**: ⚠️ Partial.
    *   ✅ Receiving (Receipts)
    *   ✅ Counting (Cycle Counts)
    *   ❌ Putaway (Directed)
    *   ❌ Picking (Wave/Directed)
    *   ❌ Packing (Handling Units)
    *   ❌ Task Management

### Level 4: Business Use Case
*   **Target**: Goods receipt, optimal storage, order fulfillment, accuracy
*   **State**: ⚠️ Basic Receipt & Fulfillment supported. Optimal storage and complex fulfillment missing.

### Level 5: User Personas
*   **Target**: Warehouse Manager, Supervisor, Picker, Packer, Inventory Controller
*   **State**: ⚠️ Generic roles only. Need specific WMS roles.

### Level 6: UI Surfaces
*   **Target**: Warehouse Dashboard, Receiving, Task Workbench, Packing Console, Shipping Console
*   **State**: ⚠️ Basic Screens only. **MISSING**: Task Workbench, Wave Console, Packing Station.

### Level 7: UI Components
*   **Target**: Scannable Grids, Side-panels, Barcode Inputs
*   **State**: ❌ generic grids only. Need high-efficiency WMS grids.

### Level 8: Configuration / Setup
*   **Target**: Pick Rules, Putaway Rules, Wave Templates
*   **State**: ❌ **MISSING**.

### Level 9: Master Data
*   **Target**: Zones, Bins, Items, Containers, Handling Units
*   **State**: ⚠️ Partial. Locators exist. **MISSING**: Zones, Handling Units (Containers).

### Level 10: Transactional Objects
*   **Target**: Receipts, Tasks, Picks, Packs, Shipments, Transfers
*   **State**: ⚠️ Partial. Receipts, Transfers exist. **MISSING**: Warehouse Tasks (Pick/Putaway), Waves.

### Level 11: Workflow & Controls
*   **Target**: Task Assignment, Confirmations, Exceptions
*   **State**: ❌ **MISSING**.

### Level 12: Accounting / Rules
*   **Target**: Cost Impact, GL Validation
*   **State**: ✅ Core costing integration exists (`CstTransactionCost`).

### Level 13: AI / Automation
*   **Target**: Slotting Optimization, Pick Path Optimization
*   **State**: ❌ **MISSING**.

### Level 14: Security, Compliance & Audit
*   **Target**: RBAC, Audit Trail
*   **State**: ✅ Basic Audit exists. Need granular WMS action auditing.

### Level 15: Performance & Scalability
*   **Target**: High-volume, server-side pagination
*   **State**: ⚠️ Needs verification for high-volume task generation.

---

## 4. Remediation Roadmap (Phase 29: WMS Parity)

### Chunk A: WMS Core Architecture (Schema & Services)
1.  **Schema Expansion**:
    *   `wms_tasks`: The central execution object (Type: PICK, PUTAWAY, REPLENISH, COUNT).
    *   `wms_waves`: Grouping headers for release-to-warehouse.
    *   `wms_handling_units` (LPNs): Containers/Pallets tracking.
    *   `wms_zones`: Logical grouping of locators for picking/putaway rules.
2.  **Service Layer**:
    *   `WmsTaskService`: Logic for generating, assigning, and completing tasks.
    *   `WmsWaveService`: Logic for releasing orders to warehouse.
    *   `WmsStrategyService`: Rule engine for directed putaway/picking.

### Chunk B: Inbound Execution Improvements
1.  **Directed Putaway**: Implement logic to suggest best bin based on item velocity/size (even if simple initially).
2.  **Receiving Inspection**: Quality check workflow/screen.

### Chunk C: Outbound Execution (Pick/Pack/Ship)
1.  **Wave release**: UI to select orders and generate pick tasks.
2.  **Task Workbench**: UI for warehouse workers to view and execute tasks.
3.  **Packing Station**: UI to associate items to LPNs/Handling Units.
4.  **Shipping Integration**: Placeholder for carrier API integration.

### Chunk D: AI & Optimization
1.  **Slotting Copilot**: AI agent to analyze movement history and suggest bin moves.
2.  **Pick Path Optimization**: Heuristic to sort tasks by bin location to minimize walking.

## 5. Build-Ready Task List & Phased Execution

### Phase 29.1: WMS Foundation (Schema & Master Data)
- [ ] **Schema**: Create `wms_zones`, `wms_handling_units`, `wms_waves`, `wms_tasks`.
- [ ] **API**: Create `WmsMasterData` endpoints (Zones, LU template).
- [ ] **UI**: Create Setup screens for Zones and Wave Templates.
- [ ] **Integration**: Update `InventoryModule` to export/share new entities.

### Phase 29.2: Inbound Execution (Directed Putaway)
- [ ] **Logic**: Implement `PutawayStrategy` (e.g., Empty Bin, Existing Item, ABC Zone).
- [ ] **Service**: Update `ReceiptService` to auto-generate Putaway Tasks on specific trigger.
- [ ] **UI**: Create "Putaway Tasks" view in Receiving Dashboard.

### Phase 29.3: Outbound Execution (Wave & Pick)
- [ ] **Logic**: Implement `WaveRelease` logic (Group Orders -> Generate Tasks).
- [ ] **UI**: Create `WaveManager` console.
- [ ] **schema**: Link `om_order_lines` to `wms_tasks`.
- [ ] **UI**: `TaskWorkbench` (The "Scanner" View) for executing Picks.

### Phase 29.4: Packing & Shipping
- [ ] **Logic**: Handling Unit encapsulation logic (Items -> LPN).
- [ ] **UI**: `PackingStation` (Scan Item -> Add to Box -> Print Label).
- [ ] **Logic**: Update `Shipment` status based on LPN loading.

---

### 🛑 STOP: EXPLICIT APPROVAL REQUIRED
Do not proceed to build until these gaps are reviewed and prioritized.
