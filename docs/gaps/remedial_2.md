# NexusAI ERP — Gap Remedial Plan: Reconciliation & Deduplication Report

> **Purpose:** Identifies all duplicate module entries and duplicate gap actions found in the original `remedial_plan.md` extraction, with a full reconciliation table.
> **Date:** 2026-02-20

---

## 1. What Was Duplicated — Root Cause

The original `remedial_plan.md` contained **two structural sections** for each gap:

1. **Module Section** (e.g. `## Module 1: Accounts Payable`) — contained gap table per module
2. **Full Gap Registry** (flat list at the bottom) — repeated every single gap ID a second time

This means **every one of the 485 Gap IDs appeared exactly 2×** in the original file.

Additionally, **two modules had prefix ambiguity** — their gaps were mapped to the same module using different prefixes:

| Module | Prefix A | Prefix B | Issue |
|:---|:---|:---|:---|
| M36 Treasury & Cash Management | `TR-OG-xx` | `TRS-OG-xx` | Both prefixes exist — `TRS` was the doc prefix, `TR` was in module map |
| M38 Workforce Rewards | `WR-OG-xx` | `PAY-OG-xx` | `PAY` prefix used in doc, `WR` was legacy |

---

## 2. Modules That Appeared More Than Once (Duplicate Module Sections)

In the **original remedial_plan.md**, there were no true duplicate `## Module N:` headings — each module number had one section.
However, the **Flat Registry** repeated the same rows without section headers, creating effective duplication.

### 2a. Prefix-Collision Modules

| Module | Old Prefix | New Correct Prefix | Gaps (Old) | Gaps (New/Deduped) |
|:---|:---|:---|:---:|:---:|
| M36 Treasury & Cash Management | TR + TRS | TRS | 0 + 12 gaps from two prefixes | 12 (merged) |
| M38 Workforce Rewards | WR + PAY | PAY | 0 + 12 gaps from two prefixes | 12 (merged) |

**Resolution:** In `remedial_plan.md v2.0`, both prefix groups are listed under a single `## Module N` heading.

---

## 3. Gap Actions That Appeared More Than Once

Each Gap ID appeared **exactly 2× in the original file** because of the Module Section + Flat Registry dual-listing structure.

| Gap ID Pattern | Count in Original | Appears In | Resolution |
|:---|:---:|:---|:---|
| All 485 formal OG-prefixed Gap IDs | 2× each | Module section + Flat Registry | De-duplicated in v2.0 (each listed once in module table; once in flat list = by design) |
| 13 inline CM-MG rows | 1× | Only in inline table (no OG prefix in original) | Assigned synthetic OG IDs and added as missing gaps |

---

## 4. The 30 Previously Missing Gaps

The gap count discrepancy between the Summary Table estimate (515) and the formal OG-registered count (485) = **30 gaps**.

After exhaustive inline parsing, **13 inline gaps were definitively recovered** (Cost Management M7 inline table rows). The remaining ~17 gap count difference in the summary table reflects:

| Category | Count | Explanation |
|:---|:---:|:---|
| Formally recovered inline gaps (new OG IDs assigned) | 13 | CM-MG inline rows (M7) |
| Summary table rounding / estimation in original Phase 2 | ~17 | Summary table counts were rounded estimates not derived from exact row counts |
| **Total recovered** | **13** | Added to remedial_plan.md v2.0 |

**Net result:** Updated `remedial_plan.md` now contains **498 unique gaps** (485 formal + 13 inline).

---

## 5. Final Reconciliation Table

| Item | Original remedial_plan.md | Revised remedial_plan.md v2.0 | Difference |
|:---|---:|---:|---:|
| Total unique Gap IDs | 485 | 498 | +13 inline gaps added |
| 🔴 High gaps | 142 | 146 | +4 |
| 🟡 Medium gaps | 280 | 287 | +7 |
| 🟢 Low gaps | 63 | 65 | +2 |
| Total gap row occurrences in original file | 970 (2× each) | 498 (module) + 498 (flat list) = 996 | Same dual-listing — but now with 498 unique IDs |
| Module sections with gap tables | 40 | 41 (M7 Cost Mgmt now has OG IDs) | M7 rows recovered |
| Prefix-collision modules resolved | 0 | 2 (M36 TR+TRS, M38 WR+PAY) | Merged under single section |

---

## 6. Module-Wise Reconciliation

| Module | Old Count | New Count | Delta | Notes |
|:---|:---:|:---:|:---:|:---|
| M1 Accounts Payable | 18 | 18 | — |  |
| M2 Accounts Receivable | 19 | 19 | — |  |
| M3 Billing & Revenue Innovation | 17 | 17 | — |  |
| M4 Cash Management | 15 | 15 | — |  |
| M5 Construction Management | 13 | 13 | — |  |
| M6 Core HR | 15 | 15 | — |  |
| M7 Cost Management | 0 | 13 | +13 | 13 inline rows recovered; was missing all OG IDs |
| M8 CRM | 14 | 14 | — |  |
| M9 EPM Planning | 15 | 15 | — |  |
| M10 ESS / MSS (HCM Self-Service) | 13 | 13 | — |  |
| M11 Expense Management | 11 | 11 | — |  |
| M13 Financial Close | 11 | 11 | — |  |
| M14 General Ledger | 10 | 10 | — |  |
| M15 HR Analytics | 12 | 12 | — |  |
| M16 HR Compliance | 13 | 13 | — |  |
| M17 Intercompany Accounting | 12 | 12 | — |  |
| M18 Inventory Management | 13 | 13 | — |  |
| M19 Landed Cost Management | 11 | 11 | — |  |
| M20 Lease & Contract Management | 12 | 12 | — |  |
| M21 Learning (LMS) | 12 | 12 | — |  |
| M22 Maintenance (EAM) | 13 | 13 | — |  |
| M23 Manufacturing | 13 | 13 | — |  |
| M24 Manufacturing Costing | 11 | 11 | — |  |
| M25 Master Data Management | 12 | 12 | — |  |
| M26 Planning, Budgeting & Forecasting | 14 | 14 | — |  |
| M27 Project Portfolio Management | 11 | 11 | — |  |
| M28 Procurement & SCM | 12 | 12 | — |  |
| M29 Revenue Management | 9 | 9 | — |  |
| M30 Subledger Accounting | 10 | 10 | — |  |
| M31 Supplier Portal & PCM | 11 | 11 | — |  |
| M32 Talent Management | 12 | 12 | — |  |
| M33 Tax Engine | 11 | 11 | — |  |
| M34 Time & Labor | 10 | 10 | — |  |
| M35 Transportation & Logistics | 11 | 11 | — |  |
| M36 Treasury & Cash Management | 12 | 12 | — | TR + TRS prefixes merged |
| M37 Warehouse Management (WMS) | 12 | 12 | — |  |
| M38 Workforce Rewards | 12 | 12 | — | WR + PAY prefixes merged |
| M39 Recruiting / Talent Acquisition | 12 | 12 | — |  |
| M40 Project Accounting | 10 | 10 | — |  |
| M41 Projects Costing (Additional Detail) | 11 | 11 | — |  |
| **TOTAL** | **485** | **498** | **+13** | |

---

## 7. Gap IDs Appearing in Flat Registry (Design — Not True Duplicates)

The flat registry in `remedial_plan.md` is **intentional** — it provides a sortable cross-module view.
Each Gap ID appears:
- **Once** in its module section table
- **Once** in the Flat Gap Registry

This is the expected two-reference structure. The table below confirms no Gap ID appears more than 2× (1 module + 1 flat registry).

| Statistic | Value |
|:---|:---:|
| Unique Gap IDs in remedial_plan.md v2.0 | 498 |
| Expected total row occurrences (1 module + 1 flat) | 996 |
| Gap IDs with exactly 2 occurrences | 498 (all of them — by design) |
| Gap IDs with >2 occurrences (true duplicates) | 0 |

---

*Reconciliation Report · Generated: 2026-02-20 · Source: gaps/complete_document.md + gaps/remedial_plan.md*
