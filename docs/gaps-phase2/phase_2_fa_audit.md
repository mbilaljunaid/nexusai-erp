# Deep Parity Audit: Fixed Assets (FA)

This report provides a granular, feature-by-feature codebase parity analysis of the Nexus FA module against Oracle Fusion Fixed Assets.

---

## 1. Database Schema Parity (`shared/schema/fixedAssets.ts`)

**Current Implementation:**
Excellent architectural foundation mirroring Oracle. Features `fa_books`, `fa_categories` (with default GL CCIDs), `fa_assets` (master), `fa_asset_books` (financials per book), `fa_transactions`, `fa_depreciation_history`, `fa_retirements`, `fa_mass_additions`, `fa_transfers`, and `fa_leases`.

**Oracle Gaps (Required Upgrades):**
*   **Prorate Conventions**: Oracle uses strict Prorate Conventions (e.g., Half-Year, Mid-Month, Following Month) to determine exactly when depreciation begins during the first year of an asset's life. Nexus `fa_books` mentions a `prorate_calendar` but lacks the detailed convention definition schemas and the prorate date calculation logic. *Gap: Missing Prorate Convention matrices.*
*   **Bonus Depreciation / Tax Rules**: Oracle supports Bonus Depreciation rules (MACRS, Section 179). Nexus schema has life years and basic STL/DB methods, but no advanced tax-rule schema overrides. *Gap: Missing complex tax depreciation logic tables.*

---

## 2. Backend API Parity (`server/routes/fixedAssets.ts`)

**Current Implementation:**
Strong API coverage including `/assets/:id/retire`, `/assets/:id/transfer`, `/mass-additions/prepare`, `/mass-additions/:id/post`, `/depreciation/run`, and `/reports/roll-forward`.

**Oracle Gaps (Required Upgrades):**
*   **Mass Additions Merging/Splitting**: Oracle's "Prepare Mass Additions" allows users to select 3 AP invoice lines and **merge** them into 1 Asset, or take 1 invoice line and **split** it into 5 Assets. The Nexus API posts 1-to-1. *Gap: Missing Mass Additions Merge/Split routing logic.*

---

## 3. Frontend UI/UX Parity (`FixedAssets.tsx`)

**Current Implementation:**
Extremely basic implementation. A single `FixedAssets.tsx` page with a standard table and a simple "Add Asset" slide-out sheet (Asset Name, Category, Cost).

**Oracle Gaps (Required Upgrades):**
*   **Asset Workbench**: Oracle's Asset Workbench handles Assignments (employee/location), Source Lines (AP references), and Financial Inquiry. The Nexus UI is currently a simple CRUD grid. *Gap: Major UI overhaul needed to create a multi-tabbed Asset Workbench.*
*   **Mass Additions UI**: While the backend APIs exist (`/mass-additions`), there is no UI screen to view the queue, assign categories to lines, and post them. *Gap: Missing "Prepare Mass Additions" interface.*
*   **Lifecycle UI Processing**: There are no UI screens to execute Depreciation Runs, record Retirements, or process Transfers. The backend is built, but the frontend is completely missing these pages. *Gap: Missing execution dashboards for FA lifecycle events.*

---
**Upgrade Priority**: **CRITICAL** (Frontend is severely lacking behind a very capable backend schema).
