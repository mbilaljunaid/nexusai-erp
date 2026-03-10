# Deep Parity Audit: Warehouse Management System (WMS)

This report provides a granular parity analysis of the Nexus WMS module. Note: The initial scoping audit claimed Nexus completely lacked WMS structure. A deep dive proves the **schema exists** but the UI and execution engines do not.

---

## 1. Database Schema Parity (`shared/schema/scm.ts`)

**Current Implementation (Hidden Strength found in audit):**
Nexus already has schemas for `wms_zones`, `wms_handling_units` (LPNs), `wms_lpn_contents`, `wms_waves`, `wms_tasks`, `wms_strategies`, and `wms_dock_appointments`. This is structurally equivalent to major parts of Oracle WMS Cloud (LogFire).

**Oracle Gaps (Required Upgrades):**
*   **Landed Cost Management (LCM)**: While WMS exists, capturing the complex inbound transport costs (freight, duties, insurance) to apply to Item Cost is missing. *Gap: Missing LCM Charge tables.*
*   **Equipment Types**: Oracle WMS has schemas tracking Forklifts, Pallet Jacks, and their capacities restricting what tasks they can perform. Nexus is missing MHE (Material Handling Equipment) tracking.

---

## 2. Backend API Parity

**Current Implementation:**
Mostly placeholder routes. 

**Oracle Gaps (Required Upgrades):**
*   **Wave Planning Algorithm**: The schema `wms_strategies` exists, but there is no actual backend code running a "Wave Allocation" process to assign stock to outbound shipments based on FIFO/FEFO rules.
*   **Task Interleaving Engine**: A WMS needs to optimize travel paths (e.g., dropping a pallet off and picking another one nearby). The intelligence to route tasks is missing.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
Virtually non-existent dedicated WMS UI.

**Oracle Gaps (Required Upgrades):**
*   **RF Scanner (Mobile) UI**: The core of any WMS is the bar-code scanner interface on the warehouse floor (often green-screen or simplified web-mobile). Nexus has no mobile-optimized "Task Execution" screens for warehouse workers.
*   **Wave Planning Dashboard**: A control room UI for Warehouse Managers to monitor picking waves and bottlenecks.

---
**Upgrade Priority**: **HIGH** (The DB schema is excellent, but building the Wave engines and Mobile RF UIs is necessary for true WMS parity).
