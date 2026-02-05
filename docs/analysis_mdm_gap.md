
# MASTER DATA MANAGEMENT (MDM) — TIER-1 GAP ANALYSIS & ROADMAP
> **Role:** Senior Oracle Fusion MDM Architect & ERP Product Engineer
> **Scope:** Enterprise Master Data Management (Customer, Supplier, Item, Asset, Reference Data)
> **Compliance:** Level-15 Canonical Decomposition | Oracle Fusion TCA Alignment

---

## 🛑 EXECUTIVE SUMMARY & STOP ORDER
> [!IMPORTANT]
> **CRITICAL ARCHITECTURAL GAP DETECTED: NO TRADING COMMUNITY ARCHITECTURE (TCA)**
> The current system operates on **Separate Silos** for Suppliers, Customers, and Users. There is no central "Party" model, no unified "Location" registry, and no shared "Contact Point" architecture.

**Current Status:** `FRAGMENTED / UNREADY`
**Tier-1 Enterprise Readiness:** ❌ **FAIL** (0/15 Levels Compliant for Core MDM)

**Immediate Remediation Required:**
1.  **Stop building isolated master data tables.**
2.  **Implement `shared/schema/parties.ts`** (TCA equivalent).
3.  **Implement `shared/schema/locations.ts`** (Global Address Model).
4.  **Refactor Customer & Supplier entities** to link to Parties.

---

## 🧱 LEVEL-15 CANONICAL DECOMPOSITION

### Level 1 — Module Domain
*   **Current:** Dispersed across `procurement`, `crm`, `inventory`, `finance`.
*   **Target:** Centralized `modules/mdm` for governance, quality, and unified registry.
*   **Status:** ❌ **MISSING** (No dedicated MDM module).

### Level 2 — Sub-Domain
*   **Customer MDM:** Partially in `crm` (CustomerEntryForm).
*   **Supplier MDM:** Partially in `procurement` (SupplierManagement).
*   **Item MDM:** Partially in `inventory` (Item entity).
*   **Asset MDM:** Present in `finance` (Fixed Assets).
*   **Reference Data:** ❌ **MISSING** (No centralized lookup/value-set service).

### Level 3 — Functional Capability
*   **Create/Update:** ✅ Implemented but isolated.
*   **Validate:** ⚠️ Basic field validation only. No cross-reference checks.
*   **Govern:** ❌ **MISSING** (No change request workflow).
*   **Merge:** ❌ **MISSING** (No survivorship logic).
*   **Version:** ❌ **MISSING** (No effective dating for master data profile).

### Level 4 — Business Use Case
*   **Golden Record:** ❌ **MISSING** (No concept of "Single Source of Truth" separate from transaction tables).
*   **De-duplication:** ❌ **MISSING** (Mock UI in `DuplicateDetection.tsx`).
*   **Enrichment:** ❌ **MISSING** (No D&B or external data hooks).

### Level 5 — User Personas
*   **MDM Data Steward:** ❌ **MISSING** (No dedicated cockpit).
*   **Business Owner:** ✅ Partially supported via functional screens.
*   **Compliance Officer:** ❌ **MISSING**.

### Level 6 — UI Surfaces
*   **MDM Dashboard:** ❌ **MISSING** (No Data Quality metrics).
*   **Master Record Forms:** ✅ Exists (`CustomerEntryForm`, `SupplierManagement`).
*   **Merge Console:** ❌ **MISSING** (Mock only).
*   **Governance Workbench:** ❌ **MISSING**.

### Level 7 — UI Components
*   **StandardTable:** ✅ Used in `SupplierManagement`.
*   **Side-panels:** ✅ Used in `SupplierManagement`.
*   **Hierarchy Viewer:** ⚠️ Partial (`AssetHierarchyTree`), missing for Parties/Orgs.

### Level 8 — Configuration / Setup Screens
*   **Match Rules:** ❌ **MISSING**.
*   **Survivorship Rules:** ❌ **MISSING**.
*   **Source System Management:** ❌ **MISSING**.

### Level 9 — Master Data Screens
*   **Parties:** ❌ **MISSING**.
*   **Locations:** ❌ **MISSING** (Embedded strings).
*   **Contacts:** ❌ **MISSING** (Embedded).

### Level 10 — Transactional Objects
*   **Change Requests:** ❌ **MISSING**.
*   **Merge Request:** ❌ **MISSING**.

### Level 11 — Workflow & Controls
*   **Approval:** ❌ **MISSING** for master data creation.
*   **Lineage:** ❌ **MISSING**.

### Level 12 — Accounting / Rules / Derivation
*   **Validation:** ⚠️ Weak.

### Level 13 — AI / Automation
*   **Anomaly Detection:** ❌ **MISSING**.
*   **Duplicate Detection:** ❌ **MISSING** (Mock only).

### Level 14 — Security, Compliance & Audit
*   **Audit Trail:** ✅ `audit_logs` schema exists, but not explicitly wired for component-level field tracking in MDM.
*   **RBAC:** ✅ Basic roles exist.

### Level 15 — Performance & Ops
*   **Bulk Loader:** ❌ **MISSING** (No FBDI equivalent).
*   **Server-side Pagination:** ✅ Supported by `StandardTable` pattern.

---

## 📊 GAP ANALYSIS + FEATURE PARITY HEATMAP (ORACLE FUSION COMPARISON)

| Feature Category | Oracle Fusion Capability | Current NexusAI State | Gap Severity | Tier-1 Req? |
| :--- | :--- | :--- | :--- | :--- |
| **Foundation** | **Trading Community Arch (TCA)** | **None (Siloed Tables)** | 🔴 **CRITICAL** | ✅ YES |
| Geography | Global Geography / Address Model | Plain Text Fields | 🔴 **CRITICAL** | ✅ YES |
| Party Model | Party, Org, Person, Group | Customer/Supplier Entities | 🔴 **CRITICAL** | ✅ YES |
| **Data Quality** | Enterprise Data Quality (EDQ) | Mock UI Only | 🔴 **CRITICAL** | ✅ YES |
| Matching | Fuzzy, Exact, Levenshtein | None | 🔴 **CRITICAL** | ✅ YES |
| Survivorship | Source System Confidence | None | 🔴 **CRITICAL** | ✅ YES |
| **Governance** | Change Request Workflow | Direct Edits | 🔴 **CRITICAL** | ✅ YES |
| Stewardship | Data Steward Dashboard | None | 🔴 **CRITICAL** | ✅ YES |
| **Reference** | Value Sets / Lookups | Enum / Hardcoded | 🟠 HIGH | ✅ YES |

---

## 🔨 BUILD-READY TASK LIST & IMPLEMENTATION PLAN

### PHASE 1: FOUNDATION - TCA SCHEMA (Urgent)
> **Goal:** Establish the `Parties` and `Locations` canonical models.
- [ ] Create `shared/schema/parties.ts` (Party, OrganizationProfile, PersonProfile).
- [ ] Create `shared/schema/locations.ts` (Location, Address, ContactPoint).
- [ ] Create `shared/schema/relationships.ts` (PartyRelationship).
- [ ] Create `shared/schema/reference.ts` (Lookups, ValueSets).

### PHASE 2: MDM SERVICE LAYER
> **Goal:** Centralize logic for Party creation and management.
- [ ] Implement `PartyService` (Create, Update, Get Profile).
- [ ] Implement `LocationService` (Address Validation, Formatting).
- [ ] Implement `ReferenceDataService`.

### PHASE 3: ENTITY MIGRATION (Refactor)
> **Goal:** Link Procurement and CRM to the new Party model.
- [ ] Refactor `Supplier` entity to link to `PartyId`.
- [ ] Refactor `Customer` (CRM) to link to `PartyId`.
- [ ] Migrate existing data (Script).

### PHASE 4: DATA QUALITY ENGINE
> **Goal:** Real implementation of `DuplicateDetection`.
- [ ] Implement `MatchingService` (Fuzzy matching on Name, Address).
- [ ] Implement `MergeService` (Survivorship logic).
- [ ] Update `DuplicateDetection.tsx` to use real API.

### PHASE 5: GOVERNANCE UI
> **Goal:** Enterprise stewardship.
- [ ] Build `DataStewardDashboard.tsx`.
- [ ] Build `MasterDataChangeRequest` workflow.

---

## 🔮 REMEDIATION ROADMAP
1.  **Immediate:** Define the TCA Schemas.
2.  **Short Term:** Build the Party Service and refactor Supplier/Customer.
3.  **Medium Term:** Implement Data Quality matching.
