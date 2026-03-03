# Deep Parity Audit: Manufacturing (MFG) & Work in Process (WIP)

This report provides a granular codebase parity analysis of the Nexus Manufacturing module against Oracle Fusion Manufacturing.

---

## 1. Database Schema Parity (`shared/schema/manufacturing.ts`)

**Current Implementation (Excellent Depth):**
The database schema for Manufacturing is remarkably comprehensive. It covers:
*   **Discrete Manufacturing**: Bills of Material (BOM), Work Centers, Resources, Routings, Production Orders, and Transactions.
*   **Process Manufacturing**: Formulas, Ingredients, Recipes, and Batches.
*   **Planning**: MRP Plans, Recommendations, and Demand Forecasts.
*   **Costing**: Standard Costs, Overhead Rules, WIP Balances, and Variance Journals.

**Oracle Gaps (Required Upgrades):**
*   **Outside Processing (OSP)**: Oracle Manufacturing natively integrates with Procurement so that if a routing operation requires a third-party vendor (e.g., plating/coating), an OSP requisition is automatically generated. The Nexus schema lacks OSP integration linkage.
*   **Genealogy & Traceability**: While Lot/Serial tracking exists in Inventory, the deep genealogy tracking (proving exactly which Lot of Ingredient A went into which Serial Number of Product B) is underdeveloped in the transaction schema.

---

## 2. Backend API Parity

**Current Implementation:**
Severely lacking. While the schema is incredibly deep, there are virtually no backend API routes (`server/routes`) driving these tables.

**Oracle Gaps (Required Upgrades):**
*   **MRP Engine (Material Requirements Planning)**: The MRP tables exist, but there is no background node worker/engine to perform the complex "Netting" calculations (Supply minus Demand = Planned Orders) across the BOM hierarchy.
*   **Cost Rollup Engine**: Oracle requires a Cost Rollup process to calculate the Standard Cost of a finished good based on the sum of its BOM components and Routing resource rates. Nexus lacks this engine.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
There are placeholders like `ManufacturingWorkOrdersDetail.tsx` and `OrdersMfg.tsx`, but no comprehensive execution screens.

**Oracle Gaps (Required Upgrades):**
*   **Production Dispatch Dispatch**: Oracle uses a "Work Execution Work Area" where shop floor operators see a prioritized queue of jobs and operations. Nexus lacks this execution-focused UI.
*   **Visual BOM Designer**: Lacks a drag-and-drop hierarchy viewer for multi-level Bills of Material.

---
**Upgrade Priority**: **HIGH** (The DB foundation is Enterprise-grade, but the entire backend calculation engine [MRP, Costing] and frontend shop floor UI need to be built).
