# MANUFACTURING INDUSTRY PACK - PRD & FRD

**Version:** 1.0
**Status:** DRAFT
**Scope:** "All-In" Enterprise Manufacturing (Discrete, Process, Mixed-mode)

---

## 1. PRODUCT REQUIREMENTS (PRD)

### 1.1 Vision
To provide a FAANG-grade, deterministic, and fully integrated manufacturing suite that unifies production planning, shop floor execution, and financial costing with advanced AI and IoT capabilities.

### 1.2 Scope
*   **Supported Modes:** Discrete (Assembly), Process (Formulation), Mixed-mode, Make-to-Stock (MTS), Make-to-Order (MTO), Engineer-to-Order (ETO).
*   **Key Modules:**
    *   **Production Planning:** MRP, MPS, Capacity Planning.
    *   **Engineering:** BOM (Multi-level, Revision controlled), Routings.
    *   **Shop Floor:** Work Orders, Job Tracking, Machine Integration.
    *   **Quality:** Inspections, AI Defect Detection, Non-Conformance (NC).
    *   **Maintenance:** Preventive, Predictive (IoT-driven).
    *   **Inventory:** Warehouse integration, WIP tracking.
    *   **Costing:** Standard, Actual, Variance Analysis (Material/Labor/Overhead).

### 1.3 User Personas
*   **Plant Manager:** Oversees KPIs, OEE, and costs.
*   **Production Planner:** Runs MRP, schedules orders.
*   **Shop Floor Operator:** Executes jobs, logs time/materials.
*   **Quality Inspector:** Records inspection results.
*   **Maintenance Engineer:** Responds to breakdowns and IoT alerts.

---

## 2. FUNCTIONAL REQUIREMENTS (FRD)

### 2.1 Core Domain Entities

#### 2.1.1 Item & BOM
*   **Item:** Must support types: Raw Material (RM), Work in Progress (WIP), Finished Good (FG).
*   **BOM:**
    *   Must satisfy: `parent_item_id` != `child_item_id` (No cycles).
    *   Must enable **Revision Control**. Active revision is locked upon Production Order release.
    *   **Phantom Items:** Supported for transient sub-assemblies.

#### 2.1.2 Production Order (Work Order)
*   **Lifecycle:** `PLANNED` -> `RELEASED` -> `IN_PROCESS` -> `COMPLETED` -> `CLOSED`.
*   **Validation:**
    *   Cannot move to `RELEASED` without active BOM/Routing.
    *   Cannot `CLOSE` with open material issuance or labor logs.
*   **Costing:**
    *   **Planned Cost:** Calculated at `RELEASED` based on Std Cost.
    *   **Actual Cost:** Accumulated real-time from Material + Labor + Overhead.

#### 2.1.3 IoT & Sensors
*   **Ingestion:** Real-time stream (MQTT/Kafka) -> Timeseries Store (or buffered).
*   **Alerts:** Threshold-based triggers (e.g., Temp > 80°C) generate Maintenance Work Orders.

### 2.2 Workflows

#### 2.2.1 Manufacturing Execution
1.  **Release:** Planner releases Order -> Material Inventory Reserved.
2.  **Issue:** Warehouse issues RM to Shop Floor (WIP).
3.  **Execute:** Operator starts Operation -> Logs Time -> Machine Data captured.
4.  **Complete:** Operator finishes -> FG incremented -> Backflush (optional) triggers.
5.  **Quality:** QC Inspector verifies -> Pass/Fail. If Fail -> Scrap or Rework workflow.

#### 2.2.2 AI Action: Predict Equipment Failure
*   **Trigger:** Periodic Schedule or IoT Event.
*   **Input:** Sensor history (Vibration, Heat), Maintenance logs.
*   **Output:** Recommended Maintenance Order (Probability score, Estimated downtime).
*   **Safety:** Human must approve the order creation.

---

## 3. AI ACTION SPECIFICATIONS

### 3.1 `PREDICT_EQUIPMENT_FAILURE`
*   **Description:** Analyzing sensor data to predict failure.
*   **Action:** `MANUFACTURING.MAINTENANCE.CREATE_REQUEST`
*   **deterministic:** False (Probabilistic input), but Output Action is deterministic.

### 3.2 `OPTIMIZE_PRODUCTION_SCHEDULE`
*   **Description:** Re-sequence jobs to minimize changeover/late delivery.
*   **Action:** `MANUFACTURING.SCHEDULE.UPDATE`
*   **Constraints:** Cannot violate delivery promise dates without "override" flag.

---

## 4. REPORTING & ANALYTICS
*   **OEE (Overall Equipment Effectiveness):** Availability * Performance * Quality.
*   **Production Variance:** Standard Cost vs. Actual Cost.
*   **Scrap Analysis:** By Reason Code, Work Center, Item.
