# LOGISTICS INDUSTRY PACK - PRD & FRD

**Version:** 1.0
**Status:** DRAFT
**Scope:** "All-In" 3PL, Transportation, Warehousing

---

## 1. PRODUCT REQUIREMENTS (PRD)

### 1.1 Vision
A complete Transport Management System (TMS) and Warehouse Management System (WMS) in one platform, featuring autonomous vehicle integration and real-time route optimization.

### 1.2 Scope
*   **Segments:** Third-Party Logistics (3PL), Fleet Operators, Last-Mile Delivery, Freight Forwarders.
*   **Key Modules:**
    *   **Fleet Mgmt:** Vehicle maintenance, Driver assignment, Fuel tracking.
    *   **TMS:** Link Orders -> Shipments -> Routes -> Carriers.
    *   **WMS:** Bin locations, Pick/Pack strategies (FEFO/FIFO), Cross-docking.
    *   **IoT:** Telematics (GPS, Speed, Temp), Drone integration.

### 1.3 User Personas
*   **Dispatcher:** Assigns routes to drivers.
*   **Warehouse Mgr:** Optimizes slotting and throughput.
*   **Driver:** Mobile app for proof of delivery.
*   **Customer:** Real-time tracking portal.

---

## 2. FUNCTIONAL REQUIREMENTS (FRD)

### 2.1 Core Domain Entities

#### 2.1.1 Shipment
*   **Composition:** One or more Orders.
*   **Status:** `PLANNED` -> `DISPATCHED` -> `IN_TRANSIT` -> `DELIVERED` -> `POD_SIGNED`.
*   **Constraints:** Weight/Volume limits vs. Vehicle Capacity.

#### 2.1.2 Route
*   **Optimization:** Multi-stop (Milk run) supported.
*   **Live Data:** ETA recalculated every 5 mins based on GPS.

#### 2.1.3 Warehouse Bin
*   **Types:** Rack, Floor, Cold Storage, Hazmat.
*   **Capacity:** Max weight/volume enforced.

### 2.2 Workflows

#### 2.2.1 Order to Cash (Logistics)
1.  **Order Entry:** Received via API/EDI.
2.  **Load Planning:** Consolidated into Shipment.
3.  **Tendering:** Assigned to Internal Fleet or External Carrier.
4.  **Execution:** Driver starts route -> GPS tracking active.
5.  **Delivery:** Sign-on-glass -> Invoice triggered.

#### 2.2.2 AI Action: Predict ETA Delay
*   **Trigger:** GPS coordinate update OR Weather alert.
*   **Input:** Current Speed, Distance remaining, Traffic API.
*   **Output:** Revised ETA. If delay > 30m, alert customer.

---

## 3. AI ACTION SPECIFICATIONS

### 3.1 `PREDICT_ETA_DELAY`
*   **Description:** Real-time update of arrival times.
*   **Action:** `LOGISTICS.SHIPMENT.UPDATE_ETA`
*   **Safety:** Notify customer if variance exceeds SLA.

### 3.2 `OPTIMIZE_ROUTE`
*   **Description:** Re-sequence stops to save fuel/time.
*   **Action:** `LOGISTICS.ROUTE.UPDATE_SEQUENCE`
*   **Input:** Google Maps/Mapbox API, Vehicle constraints.
*   **Reversible:** Yes, until driver departs.

### 3.3 `WAREHOUSE_SLOTTING_OPT`
*   **Description:** Suggest bin moves to put high-velocity items near dock.
*   **Action:** `LOGISTICS.WMS.CREATE_MOVE_TASK`

---

## 4. REPORTING & ANALYTICS
*   **On-Time Delivery (OTD):** % shipments arrived by promise time.
*   **Fleet Utilization:** % time moving vs. idle.
*   **Cost per Mile:** Fuel + Driver + Maintenance / Miles.
*   **Perfect Order Rate:** On-time + Complete + Damage-free.
