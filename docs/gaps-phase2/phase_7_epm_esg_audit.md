# Deep Parity Audit: EPM - ESG Reporting

This report provides a granular codebase parity analysis of the Nexus EPM ESG module against Oracle EPM ESG.

---

## 1. Database Schema Parity (`epm.ts`)

**Current Implementation:**
`plan_esg_metrics` stores metric codes (e.g., Carbon, Water), actual values, targets, and UOM against a specific period and entity (matching Oracle's ESG framework).

**Oracle Gaps (Required Upgrades):**
*   **Carbon Equivalent Conversions**: Oracle has a master library of carbon conversation factors (e.g., converting kWh of electricity in France vs USA into metric tons of CO2e). Nexus lacks this conversion factor lookup table.
*   **Framework Tagging**: Missing tables to tag metrics against global frameworks (e.g., "This metric satisfies GHG Protocol Scope 2" or "SASB Standard X").

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Scope 3 Supplier Ingestion**: A critical API required to ingest carbon output data directly from the Procurement module or external supplier portals.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Sustainability Dashboard**: A public-facing or internal visual dashboard tracking emission reduction goals against actuals.

---
**Upgrade Priority**: **HIGH**. ESG requires highly specialized carbon conversion logic; it cannot just be treated as a numerical value in a table.
