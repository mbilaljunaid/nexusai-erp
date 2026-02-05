
# MASTER DATA MANAGEMENT (MDM) — TIER-1 GAP ANALYSIS & ROADMAP
> **Role:** Senior Oracle Fusion MDM Architect & ERP Product Engineer
> **Scope:** Enterprise Master Data Management (Customer, Supplier, Item, Asset, Reference Data)
> **Compliance:** Level-15 Canonical Decomposition | Oracle Fusion TCA Alignment

---

## 🛑 EXECUTIVE SUMMARY & STOP ORDER
> [!IMPORTANT]
> **ARCHITECTURAL STATUS: FOUNDATION COMPLETE / CORE UI IMPLEMENTED**
> The "Trading Community Architecture" (TCA) foundation is **IMPLEMENTED** (Phase 7).
> The **Data Stewardship UI** (Phase 8 & 9) is **IMPLEMENTED**.
> Users can now:
> *   Search & View Party Profiles (Organization & Person)
> *   Visualize Hierarchy & Relationships
> *   Manage Reference Data (Lookups)
> *   Execute Deduplication Batches & Resolve Duplicates

**Current Status:** `CORE_READY / ADVANCED_GAPS_ONLY`
**Tier-1 Enterprise Readiness:** ⚠️ **PARTIAL** (Backend 12/15, Frontend 10/15)

**Major Gaps Remaining (Phase 10+):**
1.  **Item Master (PIM):** Completely missing.
2.  **Configurable Rules:** Match/Survivorship rules are hardcoded.
3.  **Data Enrichment:** No integration with D&B, Experian, etc.
4.  **Advanced Workflow:** No "Change Request" approval engine.

---

## 🧱 LEVEL-15 CANONICAL DECOMPOSITION

### Level 1 — Module Domain
*   **target:** Centralized `modules/mdm` for governance.
*   **Status:** ✅ **DONE**. Backend routing and frontend `/mdm` routes established.

### Level 2 — Sub-Domain
*   **Customer MDM:** ✅ Linked to TCA.
*   **Supplier MDM:** ✅ Linked to TCA.
*   **Item MDM:** ❌ **MISSING** (Crucial Gap).
*   **Reference Data:** ✅ **DONE**. `ReferenceDataService` + UI.
*   **Data Quality:** ✅ **DONE**. `MatchingService` + Batch + Merge UI.

### Level 3 — Functional Capability
*   **Create/Update:** ✅ Implemented via API & Profile UI.
*   **Validate:** ⚠️ Basic. No standardized address validation integration (Loqate/Google).
*   **Govern:** ⚠️ Merge Console exists, but "Propose New Party" workflow missing.
*   **Merge:** ✅ **DONE**. Deduplication Console (`/mdm/duplicates`).
*   **Version:** ❌ **MISSING**.

### Level 4 — Business Use Case
*   **Golden Record:** ✅ Supported (`hz_parties`).
*   **De-duplication:** ✅ Fuzzy Logic + UI.
*   **Enrichment:** ❌ **MISSING**.

### Level 5 — User Personas
*   **MDM Data Steward:** ✅ **DONE**. Dashboard & Console provided.
*   **Business Owner:** ✅ Supported.
*   **Compliance Officer:** ❌ **MISSING**.

### Level 6 — UI Surfaces
*   **MDM Dashboard:** ✅ **DONE**. `/mdm/governance`.
*   **Master Record Forms:** ✅ **DONE**. `/mdm/parties/:id`.
*   **Merge Console:** ✅ **DONE**. `/mdm/duplicates`.
*   **Reference Data Manager:** ✅ **DONE**. `/mdm/reference-data`.

### Level 7 — UI Components
*   **StandardTable:** ✅ Used extensively.
*   **Hierarchy Viewer:** ✅ **DONE**. `RelationshipViewer` component.

### Level 8 — Configuration / Setup Screens
*   **Match Rules:** ❌ **MISSING** (Hardcoded).
*   **Survivorship Rules:** ❌ **MISSING** (Hardcoded).
*   **Source System Management:** ✅ Supported in schema.

### Level 9 — Master Data Screens
*   **Parties:** ✅ **DONE**.
*   **Locations:** ✅ **DONE** (Embedded in Profile).
*   **Ref Data:** ✅ **DONE**.

### Level 10 — Transactional Objects
*   **Change Requests:** ❌ **MISSING**.
*   **Merge Request:** ✅ **DONE**.

### Level 11 — Workflow & Controls
*   **Approval:** ❌ **MISSING** for MDM.
*   **Lineage:** ⚠️ Basic timestamps only.

### Level 12 — Accounting / Rules / Derivation
*   **Validation:** ❌ **MISSING**.

### Level 13 — AI / Automation
*   **Anomaly Detection:** ❌ **MISSING**.
*   **Duplicate Detection:** ✅ **DONE**. Match Scores & Thresholds.

### Level 14 — Security, Compliance & Audit
*   **Audit Trail:** ⚠️ Partial.
*   **RBAC:** ⚠️ Basic.

### Level 15 — Performance & Ops
*   **Bulk Loader:** ❌ **MISSING**.
*   **Server-side Pagination:** ✅ Services support it.

---

## 📊 GAP ANALYSIS + FEATURE PARITY HEATMAP (ORACLE FUSION COMPARISON)

| Feature Category | Oracle Fusion Capability | Current NexusAI State | Gap Severity | Tier-1 Req? |
| :--- | :--- | :--- | :--- | :--- |
| **Foundation** | **Trading Community Arch (TCA)** | **✅ IMPLEMENTED** |  **READY** | ✅ YES |
| Geography | Global Geography / Address Model | **✅ IMPLEMENTED** |  **READY** | ✅ YES |
| Party Model | Party, Org, Person, Group | **✅ IMPLEMENTED** |  **READY** | ✅ YES |
| **Data Quality** | Enterprise Data Quality (EDQ) | **✅ IMPLEMENTED (Basic)** |  **READY** | ✅ YES |
| Matching | Fuzzy, Exact, Levenshtein | ✅ Implemented |  **READY** | ✅ YES |
| Survivorship | Source System Confidence | Hardcoded |  **HIGH** | ✅ YES |
| **Governance** | Change Request Workflow | Direct API/UI Edits | 🔴 **CRITICAL** | ✅ YES |
| Stewardship | Data Steward Dashboard | **✅ IMPLEMENTED** |  **READY** | ✅ YES |
| **Reference** | Value Sets / Lookups | **✅ IMPLEMENTED** |  **READY** | ✅ YES |
| **Product** | **Product Hub (PIM)** | **❌ MISSING** | � **CRITICAL** | ✅ YES |

---

## 🔨 BUILD-READY TASK LIST & IMPLEMENTATION PLAN

### PHASE 10: CONFIGURABLE RULES ENGINES
> **Goal:** Remove hardcoded logic for Matching and Survivorship.
- [ ] **Step 1: Match Rule Configuration**
    - [ ] Create `MatchRule` entity (cols, weights, threshold).
    - [ ] UI to creating/editing Match Rules.
    - [ ] Update `MatchingService` to use dynamic rules.
- [ ] **Step 2: Survivorship Rules**
    - [ ] Create `SurvivorshipRule` entity (Source confidence, Recency).

### PHASE 11: ITEM MASTER (PIM)
> **Goal:** Bring Products/Items into MDM.
- [ ] **Step 1: Item Schema**
    - [ ] `egp_system_items` (Item Master).
    - [ ] `egp_item_categories`.
- [ ] **Step 2: Item UI**
    - [ ] `ItemDirectory.tsx`.
    - [ ] `ItemProfile.tsx`.

### PHASE 12: WORKFLOW & AUDIT
- [ ] **Step 1: Change Requests**
    - [ ] "Propose Change" vs "Edit" mode.
    - [ ] `mdm_change_requests` table.

---

## 🔮 REMEDIATION ROADMAP
1.  **Immediate:** None - Core MDM is functional.
2.  **Next Strategic:** **Product Information Management (PIM)**. Currently items are likely siloed in Inventory/Order Mgmt. Moving them to MDM is critical for "Enterprise" status.
3.  **Future:** Advanced Governance (Change Requests, Audit).
