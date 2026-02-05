
# MASTER DATA MANAGEMENT (MDM) — TIER-1 GAP ANALYSIS & ROADMAP
> **Role:** Senior Oracle Fusion MDM Architect & ERP Product Engineer
> **Scope:** Enterprise Master Data Management (Customer, Supplier, Item, Asset, Reference Data)
> **Compliance:** Level-15 Canonical Decomposition | Oracle Fusion TCA Alignment

---

## 🛑 EXECUTIVE SUMMARY & STOP ORDER
> [!IMPORTANT]
> **ARCHITECTURAL STATUS: BACKEND FOUNDATION COMPLETE / FRONTEND CRITICAL GAP**
> The backend "Trading Community Architecture" (TCA) foundation is now **IMPLEMENTED** (Phase 7). We have `Party`, `Location`, and `Data Quality` schemes.
> However, the **Frontend is completely MOCK/MISSING**. Users cannot search parties, manage duplicates, or govern data quality.

**Current Status:** `BACKEND_READY / UI_MISSING`
**Tier-1 Enterprise Readiness:** ❌ **FAIL** (Backend 10/15, Frontend 1/15)

**Immediate Remediation Required:**
1.  **Build Generic Party Search & Profile UI** (The "Single View of 360").
2.  **Connect MOCK Dashboards** (`DataGovernance`, `DuplicateDetection`) to real APIs.
3.  **Implement Data Steward Work flows** (Merge actions, manual approval).

---

## 🧱 LEVEL-15 CANONICAL DECOMPOSITION

### Level 1 — Module Domain
*   **target:** Centralized `modules/mdm` for governance vs `modules/crm` for sales.
*   **Status:** ⚠️ **PARTIAL**. Backend services exist (`PartyService`, `MatchingService`), but no dedicated frontend module folder.

### Level 2 — Sub-Domain
*   **Customer MDM:** ✅ Linked to TCA (`createAccount` now creates `Party`).
*   **Supplier MDM:** ✅ Linked to TCA (`approveSupplier` now creates `Party`).
*   **Item MDM:** ❌ **MISSING** (Still siloed in Inventory).
*   **Reference Data:** ✅ Backend `ReferenceDataService` exists.
*   **Data Quality:** ✅ Backend `MatchingService` exists.

### Level 3 — Functional Capability
*   **Create/Update:** ✅ Implemented via API.
*   **Validate:** ⚠️ Basic simulation in `LocationService`. No real address verification.
*   **Govern:** ❌ **MISSING** (No UI for approvals).
*   **Merge:** ⚠️ Service exists (`resolveSet`), but no UI to trigger it.
*   **Version:** ❌ **MISSING** (Date-effective columns exist in schema, but logic is basic).

### Level 4 — Business Use Case
*   **Golden Record:** ✅ Supported by Schema (`hz_parties`).
*   **De-duplication:** ✅ Fuzzy Logic implemented (`Levenshtein`), Batch execution supported.
*   **Enrichment:** ❌ **MISSING** (No 3rd party hooks).

### Level 5 — User Personas
*   **MDM Data Steward:** ❌ **MISSING** (No Dashboard UI).
*   **Business Owner:** ✅ Supported via transactional screens (CRM/SCM).
*   **Compliance Officer:** ❌ **MISSING**.

### Level 6 — UI Surfaces
*   **MDM Dashboard:** ❌ **MOCK** (`DataGovernancePage.tsx` is static HTML).
*   **Master Record Forms:** ❌ **MISSING** (No generic Party view).
*   **Merge Console:** ❌ **MOCK** (`DuplicateDetection.tsx` is static HTML).
*   **Governance Workbench:** ❌ **MISSING**.

### Level 7 — UI Components
*   **StandardTable:** ✅ Available system-wide.
*   **Side-panels:** ✅ Available.
*   **Hierarchy Viewer:** ❌ **MISSING** for Parties.

### Level 8 — Configuration / Setup Screens
*   **Match Rules:** ❌ **MISSING** (Hardcoded in `MatchingService`).
*   **Survivorship Rules:** ❌ **MISSING** (Hardcoded "Surviving Party" logic).
*   **Source System Management:** ✅ Schema supports `origSystemReference`.

### Level 9 — Master Data Screens
*   **Parties:** ❌ **MISSING**.
*   **Locations:** ❌ **MISSING**.
*   **Ref Data:** ❌ **MISSING** (API only).

### Level 10 — Transactional Objects
*   **Change Requests:** ❌ **MISSING**.
*   **Merge Request:** ✅ Backend `hz_dup_sets` exists.

### Level 11 — Workflow & Controls
*   **Approval:** ❌ **MISSING** for MDM.
*   **Lineage:** ⚠️ `created_at`/`updated_at` only. No full audit log integration yet.

### Level 12 — Accounting / Rules / Derivation
*   **Validation:** ❌ **MISSING**.

### Level 13 — AI / Automation
*   **Anomaly Detection:** ❌ **MISSING**.
*   **Duplicate Detection:** ✅ Implemented (Batch/Fuzzy).

### Level 14 — Security, Compliance & Audit
*   **Audit Trail:** ⚠️ Partial (Schema has fields, but no strict logging).
*   **RBAC:** ⚠️ Basic.

### Level 15 — Performance & Ops
*   **Bulk Loader:** ❌ **MISSING**.
*   **Server-side Pagination:** ⚠️ Service supports limits, but UI integration missing.

---

## 📊 GAP ANALYSIS + FEATURE PARITY HEATMAP (ORACLE FUSION COMPARISON)

| Feature Category | Oracle Fusion Capability | Current NexusAI State | Gap Severity | Tier-1 Req? |
| :--- | :--- | :--- | :--- | :--- |
| **Foundation** | **Trading Community Arch (TCA)** | **✅ IMPLEMENTED (Backend)** | � **READY** | ✅ YES |
| Geography | Global Geography / Address Model | **✅ IMPLEMENTED (Backend)** | � **READY** | ✅ YES |
| Party Model | Party, Org, Person, Group | **✅ IMPLEMENTED (Backend)** | � **READY** | ✅ YES |
| **Data Quality** | Enterprise Data Quality (EDQ) | **⚠️ BACKEND ONLY** | � **HIGH** | ✅ YES |
| Matching | Fuzzy, Exact, Levenshtein | ✅ Implemented | � **READY** | ✅ YES |
| Survivorship | Source System Confidence | Hardcoded | � **HIGH** | ✅ YES |
| **Governance** | Change Request Workflow | Direct API Edits | 🔴 **CRITICAL** | ✅ YES |
| Stewardship | Data Steward Dashboard | **❌ MOCK UI** | 🔴 **CRITICAL** | ✅ YES |
| **Reference** | Value Sets / Lookups | **⚠️ API ONLY** | 🟠 **HIGH** | ✅ YES |

---

## 🔨 BUILD-READY TASK LIST & IMPLEMENTATION PLAN

### PHASE 8: DATA STEWARDSHIP UI (The "Face" of MDM)
> **Goal:** Build the actual UI for Data Stewards to manage the backend we just built.
- [ ] **Step 1: Data Governance Dashboard**
    - [ ] Update `DataGovernancePage.tsx` to fetch real stats from `MatchingService`.
    - [ ] Add "Run Deduplication Batch" button (Actionable UI).
- [ ] **Step 2: Duplicate Resolution Console**
    - [ ] Update `DuplicateDetection.tsx` to list real `hz_dup_sets`.
    - [ ] Build "Merge Review" Side Sheet (Compare Party A vs Party B).
    - [ ] Implement "Merge" action (calls `resolveSet`).
- [ ] **Step 3: Master Data Registry (360 View)**
    - [ ] Create `PartyDirectory.tsx` (Search Parties).
    - [ ] Create `PartyProfile.tsx` (View/Edit Party + Addresses + Contacts).

### PHASE 9: ADVANCED GOVERNANCE
> **Goal:** Configuration and Control.
- [ ] **Step 1: Reference Data UI**
    - [ ] UI to Manage Lookup Types and Values.
- [ ] **Step 2: Hierarchy Management**
    - [ ] Party Relationships UI (Parent/Child).

---

## 🔮 REMEDIATION ROADMAP
1.  **Immediate:** Build the **Duplicate Resolution Console**. The backend is ready; the UI is fake. This is the highest value win.
2.  **Short Term:** Build the **Party Directory**. Admins need to see the "Golden Records" created by CRM/SCM.
3.  **Medium Term:** Full Governance Dashboard.
