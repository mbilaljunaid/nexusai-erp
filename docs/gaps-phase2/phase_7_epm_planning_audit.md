# Deep Parity Audit: EPM - Financial Planning

This report provides a granular codebase parity analysis of the Nexus EPM Planning module against Oracle EPM Planning.

---

## 1. Database Schema Parity (`epm.ts`)

**Current Implementation:**
Excellent multidimensional OLAP-like structure: Plan Scenarios (Actual, Budget) -> Plan Versions (V1, Final) -> Plan Dimensions -> Plan Units (the actual intersection data point containing Account, Amount, and Dimension IDs). 

**Oracle Gaps (Required Upgrades):**
*   **Approval & Consolidation Workflows**: Oracle EPM allows a "Bottom-Up" budget where Dept A approves, then passes to Division B. Nexus is missing the strict hierarchical approval routing tables specifically for Plan Versions.
*   **Driver-Based Planning Models**: Oracle uses complex rules to calculate line items based on drivers. Nexus stores the driver (`plan_drivers`), but lacks the formula-expression schema linking a driver to a ledger account.

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **In-Memory Calculation Engine**: EPM systems require massive aggregate calculations (e.g., rolling up 10,000 department units to a global Total). Nexus requires an Essbase-equivalent in-memory calculation cube or a highly optimized materialized view engine.
*   **Actuals Integration Sync**: A backend sync engine to pull finalized Trial Balances from the GL into the "ACTUAL" EPM Scenario regularly.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Smart View (Excel Integration)**: The biggest missing piece. Enterprise EPM lives and dies by Excel. Nexus needs an Excel add-in that interfaces with the EPM API.
*   **Data Grid Entry UI**: A web-based pivot-table UI allowing users to input numbers across dimensions quickly.

---
**Upgrade Priority**: **CRITICAL**. The schema foundation is perfect for EPM, but without the Excel Add-In and the Calculation Engine, it cannot compete.
