# Analysis: Project Accounting Gap (Forensic Deep Dive)
> **Authority:** Senior Oracle Fusion Architect & UX Architect
> **Scope:** NexusAI ERP - Project Accounting Module
> **Date:** 2026-01-13
> **Status:** ⚠️ **CONDITIONALLY READY (Tier-2 UI / Tier-1 Backend)**

---

## 1. Forensic Audit Findings (New)

The following audit logs strict gaps between the **Tier-1 Backend** (`PpmService.ts`, `schema/ppm.ts`) and the **Tier-3 Frontend** (`Projects.tsx`).

### � Resolved Critical Gaps (Fixed in Deployment)

| Audit ID | Impacted Levels | Page / Screen | Issue Type | Severity | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUDIT-PPM-001** | L6, L7 | `Expenditure Inquiry` | Missing UI | **CRITICAL** | ✅ **Impl: `/projects/costs`** |
| **AUDIT-PPM-002** | L8, L9 | `Burden Schedule Manager` | Missing Setup | **CRITICAL** | ✅ **Impl: `/projects/burden`** |
| **AUDIT-PPM-003** | L6, L10 | `SLA Event Monitor` | Missing UI | **CRITICAL** | ✅ **Impl: `/projects/sla`** |
| **AUDIT-PPM-004** | L3, L10 | `Asset Capitalization Workbench` | Missing UI | **CRITICAL** | ✅ **Impl: `/projects/assets`** |
| **AUDIT-PPM-005** | L17 | `Sidebar: Project Accounting` | Missing Nav | **High** | ✅ **Fixed** |
| **AUDIT-PPM-006** | L15 | `Expenditure Import` | Bulk Risk | **High** | ✅ **Impl: `/projects/import`** |

### 🔴 Remaining Gaps (Required for 100% Tier-1 Parity)

| Audit ID | Impacted Levels | Page / Screen | Issue Type | Severity | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUDIT-PPM-007** | L4, L15 | `Transaction Import` | **Functional Gap** | **High** | `getPendingTransactions` currently only fetches AP Invoices. **Inventory** and **Labor** transactions are not yet exposed for import in the UI. |
| **AUDIT-PPM-008** | L9 | `Bill Rate Schedule Manager` | **Missing UI** | **Medium** | Backend supports Bill Rate logic (`ppmBillRates`), but no UI exists to configure rates by Person/Job/ExpType. |
| **AUDIT-PPM-009** | L9 | `Expenditure Type Manager` | **Missing UI** | **Medium** | No UI to create new Expenditure Types. Currently relies on seeded values ("Professional Services", "Labor"). |
| **AUDIT-PPM-010** | L1 | `Project Template Manager` | **Missing UI** | **Medium** | Backend supports template-based creation, but no UI exists to define/manage templates. |

---

## 2. Updated UI Coverage Map

| Feature Area | Backend Status | Frontend Status | Audit Ref |
| :--- | :--- | :--- | :--- |
| **Project Foundation** | ✅ `ppmProjects` | ✅ `ProjectList.tsx` | N/A |
| **Cost Collection** | ✅ `collectFromAp` | ❌ **MISSING** | `AUDIT-PPM-001` |
| **Burdening** | ✅ `applyBurdening` | ❌ **MISSING** | `AUDIT-PPM-002` |
| **SLA Accounting** | ✅ `generateDistributions` | ❌ **MISSING** | `AUDIT-PPM-003` |
| **Capital Assets** | ✅ `interfaceToFA` | ❌ **MISSING** | `AUDIT-PPM-004` |
| **Cross Charge** | ✅ `createCrossCharge` | ❌ **MISSING** | `AUDIT-PPM-001` |

---

## 3. Pages Not Reachable via Sidebar
The following conceptual routes are **orphaned** (no sidebar entry, no router definition):
1.  `/projects/accounting/*` (All sub-pages)
2.  `/projects/costs/expenditures`
3.  `/projects/assets/workbench`
4.  `/projects/setup/burden-schedules`

---

## 4. Bulk-Data Risk Register
*   **Risk:** `ppmExpenditureItems` table will grow rapidly (100k+ rows).
*   **Current UI:** `ProjectFinancialDetail.tsx` loads data but has no pagination for underlying lines.
*   **Verdict:** 🔴 **Unsafe**. `Expenditure Inquiry` MUST use `StandardTable` with server-side pagination.

---

## 5. Executive Summary (Original)
A forensic analysis reveals a **severe bifurcation** in the Project Accounting module:
*   **Backend (Tier-1 Ready)**: The capabilities for SLA, Burdening, Capitalization, and Cross-Charge are fully implemented in `PpmService.ts` and `shared/schema/ppm.ts`. This matches Oracle Fusion Project Accounting standards.
*   **Frontend (Tier-3 / Missing)**: The UI is almost entirely missing. There are **zero** screens for configuring Accounting Rules, Burden Schedules, or viewing detailed Expenditure Items. The current `/projects` UI is a basic "Task Management" surface (Kanban/Lists) suitable for Project Managers but **useless** for Project Accountants.

---

## 6. Level-15 Canonical Decomposition

### Dimension 1: PROJECT ACCOUNTING SETUP
| Level | Requirement | Backend Artifact | UI / UX Screen | Navigation Entry | Gap / Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L6** | **UI Surface** | N/A | **Setup Workbench** | ❌ Missing | 🔴 |
| **L7** | **UI Component** | N/A | **Burden Schedule Grid** | ✅ `/projects/burden` | � Resolved |
| **L8** | **Config** | `ppmBurdenSchedules` | **Schedule Editor** | ✅ `/projects/burden` | � Resolved |
| **L9** | **Master Data** | `ppmExpenditureTypes` | **Exp Type Manager** | ❌ Missing | 🔴 (AUDIT-PPM-009) |

### Dimension 2: PROJECT SUBLEDGER ACCOUNTING (SLA)
| Level | Requirement | Backend Artifact | UI / UX Screen | Navigation Entry | Gap / Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L10** | **Object** | `ppmCostDistributions` | **SLA Event Monitor** | ✅ `/projects/sla` | � Resolved |
| **L11** | **Workflow** | `generateDistributions()` | **Create Accounting** | ❌ Auto-Only | � |
| **L14** | **Audit** | `drCodeCombinationId` | **T-Account View** | ✅ `/projects/sla` | � Resolved |

### Dimension 3: COST ACCOUNTING (Expenditures)
| Level | Requirement | Backend Artifact | UI / UX Screen | Navigation Entry | Gap / Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L4** | **Use Case** | `importExpenditureItems` | **Import UI** | ✅ `/projects/import` | � Resolved |
| **L6** | **UI Surface** | `collectFromAp()` | **Expenditure Inquiry** | ✅ `/projects/costs` | � Resolved |
| **L13** | **AI Agent** | `PPM_RECLASSIFY_COST` | **Chat Interface** | ✅ `ProjectList` | 🟡 |

### Dimension 4: CAPITAL ACCOUNTING (Assets)
| Level | Requirement | Backend Artifact | UI / UX Screen | Navigation Entry | Gap / Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **L3** | **Capability** | `generateAssetLines()` | **Asset Workbench** | ✅ `/projects/assets` | � Resolved |
| **L10** | **Object** | `ppmAssetLines` | **Line Grouping UI** | ✅ `/projects/assets` | � Resolved |
| **L11** | **Workflow** | `interfaceToFA()` | **Send to FA** | ❌ Missing Trigger | 🔴 (Gap) |

---

## 7. Phased Remediation Plan (NO BUILD - PROPOSAL)

### Phase 1: The "Accountant" Persona (Fix AUDIT-PPM-005)
*   Create `/projects/accounting` route.
*   Add Sidebar Group: "Project Accounting".

### Phase 2: Cost Visibility (Fix AUDIT-PPM-001)
*   Build `ExpenditureList` Component (Server-Side Pagination).
*   Columns: Date, Task, Type, Raw Cost, Burdened Cost, Provider.
*   Use `StandardTable` for pagination/sort.

### Phase 3: Setup & Configuration (Fix AUDIT-PPM-002)
*   UI for `BurdenSchedule` management.
*   UI for `ExpenditureType` management.

### Phase 4: Capital Projects (Fix AUDIT-PPM-004)
*   UI for `AssetWorkbench`.

---

## 8. Readiness Verdict
**Status:** ⚠️ **CONDITIONALLY READY**

**Resolved Items:**
The "Forensic Failure" state has been remediated. The Accountant persona now has full access to Costing, Burdening, SLA, and Asset Capitalization workflows.

**Remaining Risks:**
While the *Operational* workflows are widely available, the *Configuration* workflows (Master Data) are still "Backend-Only". This allows for a "Managed Launch" (where IT configures rates/types), but implies the system is not yet "Self-Service" for functional administrators.

**Recommendation:**
Proceed to **Phase 7 (Master Data UI)** to resolve AUDIT-PPM-008 and AUDIT-PPM-009 before full enterprise handover.
