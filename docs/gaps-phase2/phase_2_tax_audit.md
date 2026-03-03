# Deep Parity Audit: Tax Engine

This report provides a granular, feature-by-feature codebase parity analysis of the Nexus Tax Engine against Oracle E-Business Tax (eBTax).

---

## 1. Database Schema Parity (`shared/schema/tax.ts`)

**Current Implementation:**
The schema is extremely simplified, containing only `tax_jurisdictions`, `tax_codes`, and `tax_exemptions`.

**Oracle Gaps (Required Upgrades):**
*   **Regime-to-Rate Flow**: Oracle eBTax utilizes a strict hierarchical setup: Tax Regime -> Tax -> Tax Status -> Tax Rate. The Nexus schema collapses this into a flat `tax_codes` table tied directly to a `jurisdiction_id`. *Gap: Complete absence of the Regime-to-Rate foundational architecture.*
*   **Determining Factor Sets & Condition Sets**: Oracle uses highly flexible Tax Rules based on Defining Factor Sets (e.g., "If Ship-To is CA and Item Category is Software"). Nexus currently has no rules engine schema. *Gap: Missing robust Tax Rule schemas.*
*   **Geographies Hierarchy**: E-Business tax relies heavily on a structured Geographies schema (Country > State > County > City > Postal Code). Nexus merely has a generic "type" string inside `tax_jurisdictions`. *Gap: Lack of a dedicated Trading Community Architecture (TCA) style Geography hierarchy.*

---

## 2. Backend API Parity (`server/routes/tax.ts`)

**Current Implementation:**
Provides basic CRUD operations for codes, jurisdictions, and exemptions. Includes `/simulate` and `/calculate/:invoiceId` endpoints.

**Oracle Gaps (Required Upgrades):**
*   **Advanced Tax Calculation Engine**: The calculation endpoint is a black box that presumably just applies flat rates based on the simplistic DB schema. It does not evaluate complex "Place of Supply" rules or "Tax Applicability" rules like Oracle's calculation engine. *Gap: The backend logic requires a total rewrite to support condition-based rule evaluation.*
*   **Tax Recovery (Procure to Pay)**: Oracle handles recoverable vs. non-recoverable taxes on AP invoices. Nexus AP Withholding is handled separately (`APWithholdingTax.tsx`) but general indirect tax recovery calculation is missing.

---

## 3. Frontend UI/UX Parity (`TaxProvisionWorkbench.tsx`, `APWithholdingTax.tsx`)

**Current Implementation:**
The `TaxProvisionWorkbench.tsx` provides a solid UI for ASC740/IAS12 calculations (Current vs. Deferred Tax Expense). The `APWithholdingTax.tsx` handles Withholding Tax Groups with priority-based rates.

**Oracle Gaps (Required Upgrades):**
*   **Tax Configuration UI**: Completely missing. There are no frontend screens to configure Regimes, Taxes, Statuses, Rates, or Rules. Because the backend doesn't support them, the frontend doesn't either. *Gap: Need a massive UI build-out for the "Tax Manager" role to configure the engine.*
*   **Tax Simulator UI**: While the `/simulate` endpoint exists, there is no generic "Tax Simulator" UI screen to test transactions before creating them (often found in Oracle to debug tax setups).

---
**Upgrade Priority**: **CRITICAL** (The Tax engine is structurally non-compliant with global enterprise tax requirements and requires a full rewrite of its foundational architecture).
