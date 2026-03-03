# Deep Parity Audit: HR Analytics & Infrastructure (DOR, HDL)

This report provides a granular codebase parity analysis of the Nexus HR Infrastructure (Analytics, Documents, HDL) against Oracle HCM.

---

## 1. Database Schema Parity (`hr_analytics.ts`, `hr_documents.ts`, `hr_hdl.ts`)

**Current Implementation:**
*   **Analytics**: Excellent schema for KPI definitions, snapshot warehousing, and Predictive Models metadata.
*   **Documents (DOR)**: Standard schema for worker documents, issuing authorities, and verification statuses.
*   **HDL (HCM Data Loader)**: Bulk data import tracking.

**Oracle Gaps (Required Upgrades):**
*   **Document Extensibility**: Oracle Document Records (DOR) allow configuring massive amounts of custom Flexfields (DFFs) based on Document Type (e.g., Visa type needs Country field, but standard contract does not). Nexus DOR is somewhat rigid.
*   **HDL Multi-Threading**: Oracle HDL manages millions of rows concurrently by spreading `business_object` chunks across threads. The Nexus schema implies a synchronous or single-threaded bulk loader.

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Analytics Snapshot Cron**: A heavy backend engine is required to actually compute the Logic defined in `hr_kpi_definitions.sql_logic` on a daily cron job and insert into the `hr_analytics_snapshots` warehouse.
*   **Predictive Model Runtime**: Missing integration with Python/TensorFlow microservices to execute the models defined in `hr_predictive_models`.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **KPI Dashboard Builder**: Oracle Transactional Business Intelligence (OTBI) provides a drag-and-drop dashboard builder for these HR KPIs. Nexus uses hardcoded React analytics dashes.

---
**Upgrade Priority**: **MEDIUM-HIGH**. The Analytics warehouse schema is very promising, but the backend snapshot generator and predictive model execution runtime must be built.
