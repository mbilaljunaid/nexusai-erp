# NexusAI ERP — Oracle Gap Remedial Implementation Plan

> **Source:** `gaps/complete_document.md` — Phase 2 Oracle Gap Analysis (All 41 Modules)
> **Date:** 2026-02-20 | **Version:** 2.0 (includes all inline gaps)
> **Status Key:** 🔲 Open | 🔄 In Progress | ✅ Done | 🚫 Deferred
> **Gap ID Note:** IDs ending in higher numbers (e.g. -OG-14+) on some modules are synthetic IDs assigned to inline `[MISSING]` feature rows that lacked a formal OG prefix in the source document.

---

## Executive Summary

| Metric | Count |
|:---|---:|
| Total Modules | 41 |
| 🔴 High Severity Gaps | 146 |
| 🟡 Medium Severity Gaps | 287 |
| 🟢 Low Severity Gaps | 65 |
| **Total Oracle Gaps (Formal OG IDs)** | **485** |
| **Total Oracle Gaps (Inline / Previously Missing)** | **13** |
| **Grand Total** | **498** |
| 🚨 Contradicted Modules | 7 |
| ⚠️ Self-Scoped Modules | 5 |

---

## Implementation Phases

| Phase | Scope | Severity | Target |
|:---|:---|:---:|:---|
| **Phase 1** | Compliance-critical & missing core flows | 🔴 High | Q1–Q2 2026 |
| **Phase 2** | Oracle depth features & workflow gaps | 🟡 Medium | Q3–Q4 2026 |
| **Phase 3** | UX, convenience & minor depth gaps | 🟢 Low | Q1 2027 |

---

---

## Module 1: Accounts Payable

**Oracle Equivalent:** Oracle Fusion Payables

**Gaps:** 🔴 4 High · 🟡 11 Medium · 🟢 3 Low · **Total: 18**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| AP-OG-01 | Payment Terms Master Table | `ap_terms` with discount dates, installment schedules | 🔴 High | P1 | 🔲 Open | TBD |
| AP-OG-02 | Early Payment Discounts | Auto-discount on payment (2/10 Net 30) | 🔴 High | P1 | 🔲 Open | TBD |
| AP-OG-03 | Multi-Level Invoice Approval (AME) | BPM worklist, amount thresholds, delegation | 🔴 High | P1 | 🔲 Open | TBD |
| AP-OG-04 | WHT Remittance Invoice to Tax Authority | Auto invoice generation + 1099/1042-S reporting | 🔴 High | P1 | 🔲 Open | TBD |
| AP-OG-05 | 4-Way Matching (Inspection Acceptance) | Accept quantity gate before invoice match | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-06 | Positive Pay File | Anti-fraud bank file for check validation | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-07 | Stop Payment / Reissue Check | Void + reissue workflow with bank notification | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-08 | Supplier Statement Reconciliation | Compare supplier statement vs ledger | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-09 | Recurring Invoice Templates | Auto-generate monthly invoices | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-10 | Installment Payment Schedules | Split invoice into multiple due dates | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-11 | Supplier Balance Inquiry Workbench | Real-time unpaid/on-hold/overdue balance | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-12 | AP Trial Balance Report | Period-aligned AP vs GL reconciliation report | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-13 | Durable Payment Queue (BullMQ) | Crash-safe async processing with retry | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-14 | EDI 810 Invoice Import | Electronic invoice exchange standard | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-15 | SoD at AP Level (Entry vs Approval) | Field-level + SoD security in AP roles | 🟡 Medium | P2 | 🔲 Open | TBD |
| AP-OG-16 | Debit Memo from Return-to-Supplier PO | Auto-DM on PO return transaction | 🟢 Low | P3 | 🔲 Open | TBD |
| AP-OG-17 | Supplier Merge | Merge duplicate suppliers + re-parent invoices | 🟢 Low | P3 | 🔲 Open | TBD |
| AP-OG-18 | Invoice Image Viewer (UCM) | Inline PDF/image viewer in workbench | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 2: Accounts Receivable

**Oracle Equivalent:** Oracle Fusion Receivables

**Gaps:** 🔴 4 High · 🟡 13 Medium · 🟢 2 Low · **Total: 19**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| AR-OG-01 | Payment Terms Master Table | Discount terms, installment schedules | 🔴 High | P1 | 🔲 Open | TBD |
| AR-OG-02 | AutoInvoice Validation Engine | Batch import with error report before posting | 🔴 High | P1 | 🔲 Open | TBD |
| AR-OG-03 | Lockbox Auto-Apply Engine | BAI2 import + rule-based receipt matching | 🔴 High | P1 | 🔲 Open | TBD |
| AR-OG-04 | FX Revaluation (Open AR Balances) | Unrealized gain/loss journals at period-end | 🔴 High | P1 | 🔲 Open | TBD |
| AR-OG-05 | Customer Statement Generation | PDF/email outstanding statement per customer | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-06 | Interest Invoice (Finance Charges) | Auto-generate late payment invoices | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-07 | On-Account Receipts | Hold unidentified cash for future application | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-08 | Cross-Currency Receipt + Realized Gain/Loss | FX settlement with GL journal | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-09 | Dispute → Credit Memo/Write-off Workflow | Resolution with GL posting | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-10 | Credit Bureau Integration (D&B/Experian) | External score pull for credit decisions | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-11 | Promise-to-Pay Recording | Collector records PTP date + amount | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-12 | Collector Territory Assignment Rules | Segment-based auto-assignment | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-13 | AR Trial Balance / AR-GL Reconciliation | Control account balance report by period | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-14 | Durable Async Queue (BullMQ) | Crash-safe dunning + recognition with retry | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-15 | Email Delivery Integration (SMTP/SendGrid) | Actual dunning email send + tracking | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-16 | Mass Adjustment Batch | Bulk write-off with threshold approval | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-17 | Event-Based Revenue (Milestones/Usage) | B&RM-style contingent/milestone recognition | 🟡 Medium | P2 | 🔲 Open | TBD |
| AR-OG-18 | Customer Merge Utility | Merge duplicate party records | 🟢 Low | P3 | 🔲 Open | TBD |
| AR-OG-19 | Customer Self-Service Payment Portal | Online invoice payment + receipt generation | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 3: Billing & Revenue Innovation

**Oracle Equivalent:** Oracle Fusion Billing / RMCS

**Gaps:** 🔴 4 High · 🟡 11 Medium · 🟢 2 Low · **Total: 17**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| BI-OG-01 | Tax Jurisdiction + E-Invoicing (ViDA/ZATCA) | Geo-based tax determination + legal mandate | 🔴 High | P1 | 🔲 Open | TBD |
| BI-OG-02 | Subscription Mid-Period Amendment Proration | Co-term upsell/downsell exact-day proration | 🔴 High | P1 | 🔲 Open | TBD |
| BI-OG-03 | Billing Transaction Source Registry | Source-to-GL account derivation rules | 🔴 High | P1 | 🔲 Open | TBD |
| BI-OG-04 | Invoice PDF Template Engine | BI Publisher templates per transaction type | 🔴 High | P1 | 🔲 Open | TBD |
| BI-OG-05 | Consolidated Invoice (Group by Customer/Period) | Merge events into single periodic invoice | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-06 | Billing Schedule Calendar | Bill on specific date, not just frequency | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-07 | Tiered (Volume-Based) Pricing | Price breaks at quantity thresholds | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-08 | Usage-Based Revenue Recognition | Recognize proportional to consumption | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-09 | Real-Time Credit Exposure Calculation | Open orders + open invoices vs credit limit | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-10 | Daily FX Rate Feed Integration | ECB/Bloomberg rate ingestion | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-11 | Configurable Approval Matrix | Amount + BU + customer-tier rules | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-12 | Billing-Period Accrual Auto-Reversal | Unbilled revenue accrual reversal entry | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-13 | Dunning Auto-Escalation from Billing | Trigger collections on overdue invoice | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-14 | Bill-and-Hold / Deferred Revenue UI | Invoice raised, revenue deferred until delivery | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-15 | Exemption Certificate Management | Store/validate tax exemption certificates | 🟡 Medium | P2 | 🔲 Open | TBD |
| BI-OG-16 | On-Account Credit Memo + Auto-Refund | Credit not linked to invoice; trigger refund | 🟢 Low | P3 | 🔲 Open | TBD |
| BI-OG-17 | Evergreen Auto-Renewal with Advance Notice | Configurable renewal notice workflow | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 4: Cash Management

**Oracle Equivalent:** Oracle Fusion Cash Management

**Gaps:** 🔴 4 High · 🟡 9 Medium · 🟢 2 Low · **Total: 15**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| CM-OG-01 | Bank/Branch Hierarchy Registry (BIC Validated) | `ce_banks` / `ce_bank_branches` master tables | 🔴 High | P1 | 🔲 Open | TBD |
| CM-OG-02 | Automated Bank Statement Import (SFTP/API) | ESB connector to bank portals, no manual upload | 🔴 High | P1 | 🔲 Open | TBD |
| CM-OG-03 | Reconciliation Sign-Off Workflow (SOX) | Manager electronic approval before period close | 🔴 High | P1 | 🔲 Open | TBD |
| CM-OG-04 | Cross-Entity Consolidated Cash Position | Multi-ledger + IC elimination in treasury dashboard | 🔴 High | P1 | 🔲 Open | TBD |
| CM-OG-05 | Actual vs Forecast Variance Analysis | Snapshot baseline + variance drill-through | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-OG-06 | Reconciliation Exception Reason Codes + Write-Off | Categorized exceptions + GL write-off journal | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-OG-07 | Inter-Bank Transfer (Internal Movement) | Paired journals with settlement tracking | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-OG-08 | Manual External Cash Transaction Entry | Bank charge / non-AP-AR cash entry | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-OG-09 | Notional (Cross-Currency) Cash Pooling | Multi-currency pool with interest calculation | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-OG-10 | Revaluation History Log + Reverse Revaluation | `CE_REVALUATION` audit table; period re-open reversal | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-OG-11 | Undo-Match with SLA Reversal | Un-reconcile with full accounting reversal | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-OG-12 | Forecast Payroll/Tax/CapEx Source Integration | All cash outflow categories in forecast | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-OG-13 | Natural Language Cash Query (AI) | "What is EUR exposure tomorrow?" | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-OG-14 | Bank Account Number Masking in UI | PCI-compliant display of sensitive bank data | 🟢 Low | P3 | 🔲 Open | TBD |
| CM-OG-15 | ZBA Hierarchy Tree Visualization | Pool structure as drag-and-drop tree | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 5: Construction Management

**Oracle Equivalent:** Oracle ECC / Aconex / Primavera P6

**Gaps:** 🔴 4 High · 🟡 7 Medium · 🟢 2 Low · **Total: 13**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| CON-OG-01 | Earned Value Management (BCWS/BCWP/CPI/SPI) | Primavera P6 / Fusion PPM EVM reporting | 🔴 High | P1 | 🔲 Open | TBD |
| CON-OG-02 | Drawing & Document Register (Revision Control) | Oracle ACONEX RFC transmittal + revision lock | 🔴 High | P1 | 🔲 Open | TBD |
| CON-OG-03 | Schedule (Gantt / CPM) Integration | Primavera P6 import/export + critical path | 🔴 High | P1 | 🔲 Open | TBD |
| CON-OG-04 | Subcontract Invoice vs Pay App Matching | SCIV against certified SOV line with retainage | 🔴 High | P1 | 🔲 Open | TBD |
| CON-OG-05 | PCO → COR → CO Three-Step Pipeline | Owner + architect countersignature per step | 🟡 Medium | P2 | 🔲 Open | TBD |
| CON-OG-06 | Variable Retention Schedule + Release Invoice | Retention reduces at % completion milestones | 🟡 Medium | P2 | 🔲 Open | TBD |
| CON-OG-07 | Revenue Recognition Method Toggle (% cost vs completion) | POC method toggle per project type | 🟡 Medium | P2 | 🔲 Open | TBD |
| CON-OG-08 | RAMS/SWMS Health & Safety Compliance Gate | H&S document approval blocks site access | 🟡 Medium | P2 | 🔲 Open | TBD |
| CON-OG-09 | RFI Transmittal Package (Multi-Party Ball-in-Court) | Formal transmittal with response deadline tracking | 🟡 Medium | P2 | 🔲 Open | TBD |
| CON-OG-10 | Claims Quantum Calculation (Prolongation Costs) | Time-related cost calculation per FIDIC clause | 🟡 Medium | P2 | 🔲 Open | TBD |
| CON-OG-11 | GL Code from Cost Code Derivation | PA cost code → GL natural account SLA rule | 🟡 Medium | P2 | 🔲 Open | TBD |
| CON-OG-12 | Real MQTT/OPC-UA IoT Equipment Telemetry | ISO 15143-3 standard for heavy equipment data | 🟢 Low | P3 | 🔲 Open | TBD |
| CON-OG-13 | Lien Waiver Attachment per Pay App | Conditional/unconditional lien waiver tracking | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 6: Core HR

**Oracle Equivalent:** Oracle Fusion Global HR

**Gaps:** 🔴 5 High · 🟡 8 Medium · 🟢 2 Low · **Total: 15**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| HR-OG-01 | Payroll Element Entry Integration from Hire | Auto-create salary + element entries on hire | 🔴 High | P1 | 🔲 Open | TBD |
| HR-OG-02 | Absence Management (Accrual + Approval + Payroll) | Absence types, accrual plans, manager approval | 🔴 High | P1 | 🔲 Open | TBD |
| HR-OG-03 | BPM Approval Workflow on HR Transactions | Configurable approval chains for Hire/Transfer/Term | 🔴 High | P1 | 🔲 Open | TBD |
| HR-OG-04 | True Date-Track (Date-Effective Row History) | Each field change creates a new date-effective row | 🔴 High | P1 | 🔲 Open | TBD |
| HR-OG-05 | Compensation Workbench (Merit Cycle) | Manager salary recommendations with budget pool | 🔴 High | P1 | 🔲 Open | TBD |
| HR-OG-06 | Dual Employment (Multi-Assignment) | Single person, two active assignments in different BUs | 🟡 Medium | P2 | 🔲 Open | TBD |
| HR-OG-07 | PSU → TRU Hierarchy for Statutory Tax Reporting | TRU drives country-specific payroll tax filing | 🟡 Medium | P2 | 🔲 Open | TBD |
| HR-OG-08 | Grade Rate + Grade Ladder (Salary Benchmarking) | Pay rate per grade + progression path | 🟡 Medium | P2 | 🔲 Open | TBD |
| HR-OG-09 | "My Team" Manager Self-Service View | Direct + indirect reports scoped by AOR | 🟡 Medium | P2 | 🔲 Open | TBD |
| HR-OG-10 | Document Expiry Auto-Notification | Alert employee + HR N days before expiry | 🟡 Medium | P2 | 🔲 Open | TBD |
| HR-OG-11 | Journey Task Due-Date Escalation + Reminders | Auto-reminder at D-7, D-1, overdue | 🟡 Medium | P2 | 🔲 Open | TBD |
| HR-OG-12 | Visual Org Chart Navigation (Workforce Directory) | Tree-drill org chart with historical versions | 🟡 Medium | P2 | 🔲 Open | TBD |
| HR-OG-13 | Pre-Import Validation Report (HDL) | Error count report before bulk load commits | 🟡 Medium | P2 | 🔲 Open | TBD |
| HR-OG-14 | DEI Goals vs Actuals + AI Flight Risk | Diversity goal tracking + attrition prediction | 🟢 Low | P3 | 🔲 Open | TBD |
| HR-OG-15 | NID Format Validation per Country | Country-specific NID regex (UK NI, US SSN, etc.) | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 7: Cost Management

**Oracle Equivalent:** Oracle Fusion Cost Management

**Gaps:** 🔴 4 High · 🟡 7 Medium · 🟢 2 Low · **Total: 13**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| CM-MG-OG-01 ✱ | CM-MG-01 | Perpetual FIFO/LIFO per cost book | 🔴 High | P1 | 🔲 Open | TBD |
| CM-MG-OG-02 ✱ | CM-MG-02 | BPM-gated standard cost publish + adjustment | 🔴 High | P1 | 🔲 Open | TBD |
| CM-MG-OG-03 ✱ | CM-MG-03 | COGS = Revenue recognition timing per POB | 🔴 High | P1 | 🔲 Open | TBD |
| CM-MG-OG-04 ✱ | CM-MG-04 | Component → Sub-Assembly → Finished Good | 🔴 High | P1 | 🔲 Open | TBD |
| CM-MG-OG-05 ✱ | CM-MG-05 | Legal Entity → Cost Org for IC cost flows | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-MG-OG-06 ✱ | CM-MG-06 | Weight / volume / value / quantity basis | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-MG-OG-07 ✱ | CM-MG-07 | Period-end accrual for receipts without invoice | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-MG-OG-08 ✱ | CM-MG-08 | Department/resource rate + scrap loss journal | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-MG-OG-09 ✱ | CM-MG-09 | Distinct COGS/Receive/Issue event classes | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-MG-OG-10 ✱ | CM-MG-10 | `CST_PERIOD_CLOSE_SUMMARY` style report | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-MG-OG-11 ✱ | CM-MG-11 | Impact of proposed cost on in-progress jobs | 🟡 Medium | P2 | 🔲 Open | TBD |
| CM-MG-OG-12 ✱ | CM-MG-12 | Separate cost layer per lot number | 🟢 Low | P3 | 🔲 Open | TBD |
| CM-MG-OG-13 ✱ | CM-MG-13 | Future cost forecast from market prices | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 8: CRM

**Oracle Equivalent:** Oracle Fusion CX Cloud

**Gaps:** 🔴 3 High · 🟡 9 Medium · 🟢 2 Low · **Total: 14**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| CRM-OG-01 | Configure-Price-Quote (CPQ) Engine | Product configurator + price waterfall + quote approval | 🔴 High | P1 | 🔲 Open | TBD |
| CRM-OG-02 | B2B Self-Service Commerce Portal | Catalog + contract-price + re-order for B2B buyers | 🔴 High | P1 | 🔲 Open | TBD |
| CRM-OG-03 | Subscription Renewal Auto-Opportunity | Renewal opp from contract expiry + renewal rate KPI | 🔴 High | P1 | 🔲 Open | TBD |
| CRM-OG-04 | AI-Adjusted Sales Forecast (Activity-Based) | Deal risk flagging + AI commit adjustment | 🟡 Medium | P2 | 🔲 Open | TBD |
| CRM-OG-05 | SLA Milestone/Breach Escalation Engine | Multi-SLA per case with entitlement gating | 🟡 Medium | P2 | 🔲 Open | TBD |
| CRM-OG-06 | Contract Obligation + Redline Management | Obligation tracking + clause library + e-signature | 🟡 Medium | P2 | 🔲 Open | TBD |
| CRM-OG-07 | Partner MDF (Market Development Funds) | Fund request → approval → ROI tracking | 🟡 Medium | P2 | 🔲 Open | TBD |
| CRM-OG-08 | Quota Cascade (Country → Region → Rep) | Top-down quota distribution with alignment | 🟡 Medium | P2 | 🔲 Open | TBD |
| CRM-OG-09 | Territory Alignment Workbench | Drag-reassign with instant pipeline impact view | 🟡 Medium | P2 | 🔲 Open | TBD |
| CRM-OG-10 | Revenue Attribution (Multi-Touch) | First/last/multi-touch attribution on L2R | 🟡 Medium | P2 | 🔲 Open | TBD |
| CRM-OG-11 | Field-Level Security + Visibility Rules | Data masking + complex territory visibility | 🟡 Medium | P2 | 🔲 Open | TBD |
| CRM-OG-12 | D&B Account Enrichment + Hierarchy Sync | Global account hierarchy from Dun & Bradstreet | 🟡 Medium | P2 | 🔲 Open | TBD |
| CRM-OG-13 | Cross-Docking + Serial/Lot Track-and-Trace | WMS receive → outbound without putaway | 🟢 Low | P3 | 🔲 Open | TBD |
| CRM-OG-14 | Carrier Rate Shopping at Shipment | Multi-carrier freight rate comparison | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 9: EPM Planning

**Oracle Equivalent:** Oracle EPBCS / EPM Cloud

**Audit Note:** 🚨 Self-admitted PENDING gaps (ESG, Treasury Planning)

**Gaps:** 🔴 6 High · 🟡 7 Medium · 🟢 2 Low · **Total: 15**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| EPM-OG-01 | ESG / Carbon Planning (Scope 1/2/3) | Self-admitted Critical gap (Phase 5 PENDING) | 🔴 High | P1 | 🔲 Open | TBD |
| EPM-OG-02 | Treasury Daily Cash + FX Hedging Plan | Self-admitted Major gap (Phase 5 PENDING) | 🔴 High | P1 | 🔲 Open | TBD |
| EPM-OG-03 | Financial Consolidation / FCCS (CTA, Minority Interest) | Currency translation + minority interest + goodwill in consolidation | 🔴 High | P1 | 🔲 Open | TBD |
| EPM-OG-04 | Essbase MOLAP Engine (Block Storage) | Sub-second multi-dimensional query on millions of cells | 🔴 High | P1 | 🔲 Open | TBD |
| EPM-OG-05 | Narrative Reporting (Board-Level Management Reports) | Financial data + commentary + chart in PDF/Word format | 🔴 High | P1 | 🔲 Open | TBD |
| EPM-OG-06 | Hard-Stop Budgetary Control at Transaction | Block PO/invoice when over-budget by cost center | 🔴 High | P1 | 🔲 Open | TBD |
| EPM-OG-07 | Monte Carlo Simulation + Tornado Chart | Probability distribution across correlated drivers | 🟡 Medium | P2 | 🔲 Open | TBD |
| EPM-OG-08 | Weekly Rolling Forecast + Daily Sales Flash | Weekly granularity with CRM actuals seeding | 🟡 Medium | P2 | 🔲 Open | TBD |
| EPM-OG-09 | Direct Method Daily Cash Flow Forecasting | AR/AP driver-linked daily cash position | 🟡 Medium | P2 | 🔲 Open | TBD |
| EPM-OG-10 | M&A Entity What-If (Mid-Year Consolidation) | New entity added mid-year with partial-period results | 🟡 Medium | P2 | 🔲 Open | TBD |
| EPM-OG-11 | Structured Task List + Cell-Level Commentary | Planning cycle task management + cell annotation | 🟡 Medium | P2 | 🔲 Open | TBD |
| EPM-OG-12 | IC Matching Discrepancy Alert | Flag IC revenue ≠ IC expense before consolidation | 🟡 Medium | P2 | 🔲 Open | TBD |
| EPM-OG-13 | Accelerated Depreciation + Lease vs Buy Analysis | MACRS/DDB + NPV/IRR for capital decision planning | 🟡 Medium | P2 | 🔲 Open | TBD |
| EPM-OG-14 | Trade Promotion / Gross-to-Net Deductions Planning | Promotion uplift curves + customer net revenue | 🟢 Low | P3 | 🔲 Open | TBD |
| EPM-OG-15 | AI Model Explainability + Ensemble Forecasting | Driver contribution + ARIMA/Prophet/LSTM ensemble | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 10: ESS / MSS (HCM Self-Service)

**Oracle Equivalent:** Oracle Fusion HCM Self-Service

**Gaps:** 🔴 4 High · 🟡 8 Medium · 🟢 1 Low · **Total: 13**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| ESS-OG-01 | Benefits Open Enrollment Self-Service | Health/dental/vision/FSA election with confirmation | 🔴 High | P1 | 🔲 Open | TBD |
| ESS-OG-02 | HR Help Desk (Employee Service Request) | HR ticket + SLA tracking + KB deflection | 🔴 High | P1 | 🔲 Open | TBD |
| ESS-OG-03 | Total Compensation Statement | Salary + bonus + equity + benefits PDF | 🔴 High | P1 | 🔲 Open | TBD |
| ESS-OG-04 | My Career & Learning Self-Service | Skills update + course enrollment + cert expiry | 🔴 High | P1 | 🔲 Open | TBD |
| ESS-OG-05 | Life Event Configuration | Marriage/birth trigger guided change + benefits cascade | 🟡 Medium | P2 | 🔲 Open | TBD |
| ESS-OG-06 | Action-Specific Delegation | Delegate only leave approval, not all manager actions | 🟡 Medium | P2 | 🔲 Open | TBD |
| ESS-OG-07 | Field-Level Salary Masking | Role-based salary visibility (HR vs. manager) | 🟡 Medium | P2 | 🔲 Open | TBD |
| ESS-OG-08 | Configurable Escalation Threshold per Transaction | Different escalation timers per action type | 🟡 Medium | P2 | 🔲 Open | TBD |
| ESS-OG-09 | Approval Chain Visualization | Real-time progress tracker for requestor | 🟡 Medium | P2 | 🔲 Open | TBD |
| ESS-OG-10 | Multi-Currency Expat Payslip | Home + host currency on payslip for global assignments | 🟡 Medium | P2 | 🔲 Open | TBD |
| ESS-OG-11 | National ID Validation by Country | Format-check Emirates ID, NIN, etc. | 🟡 Medium | P2 | 🔲 Open | TBD |
| ESS-OG-12 | e-Signature on Statutory Forms | W-4 / P45 digitally signed in-app | 🟡 Medium | P2 | 🔲 Open | TBD |
| ESS-OG-13 | GCC / Australia Statutory Form Localization | GOSI (Saudi), ATO Tax File Declaration (Australia) | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 11: Expense Management

**Oracle Equivalent:** Oracle Fusion Expenses

**Gaps:** 🔴 2 High · 🟡 8 Medium · 🟢 1 Low · **Total: 11**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| EXP-OG-01 | Travel Request & Pre-Authorization | Budget-checked travel approval before booking | 🔴 High | P1 | 🔲 Open | TBD |
| EXP-OG-02 | Mileage / GPS Distance Calculation Engine | Address-to-address distance + IRS/HMRC rate | 🔴 High | P1 | 🔲 Open | TBD |
| EXP-OG-03 | Per-Diem Policy Engine (GSA/HMRC Rates) | City-by-city daily limit with allowance vs actuals | 🟡 Medium | P2 | 🔲 Open | TBD |
| EXP-OG-04 | Project Cost Integration (Billable Flag) | Expense lines posted to project cost | 🟡 Medium | P2 | 🔲 Open | TBD |
| EXP-OG-05 | Period-End Expense Accrual | Accrue P&L for unsubmitted reports at month close | 🟡 Medium | P2 | 🔲 Open | TBD |
| EXP-OG-06 | Cost Center Owner Additional Approval | Route to cost center owner for cross-charging | 🟡 Medium | P2 | 🔲 Open | TBD |
| EXP-OG-07 | Automated Auditor Queue Routing | High-risk reports auto-routed by compliance score | 🟡 Medium | P2 | 🔲 Open | TBD |
| EXP-OG-08 | VAT Reclaim Filing Integration | EC Sales/Purchase List + jurisdiction reclaim packets | 🟡 Medium | P2 | 🔲 Open | TBD |
| EXP-OG-09 | Hotel Folio Line-Item OCR | Room rate / tax / F&B itemized from hotel receipt | 🟡 Medium | P2 | 🔲 Open | TBD |
| EXP-OG-10 | In-Flight Policy Warning (Real-Time) | Compliance flag while adding line item, before submit | 🟡 Medium | P2 | 🔲 Open | TBD |
| EXP-OG-11 | e-Invoicing Compliance (Italy SDI, Mexico CFDI) | B2B receipt compliance for specific jurisdictions | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 13: Financial Close

**Oracle Equivalent:** Oracle Fusion FCCS / Financial Close Cloud

**Audit Note:** 🚨 Consolidation logic 60% mocked (self-admitted)

**Gaps:** 🔴 5 High · 🟡 4 Medium · 🟢 2 Low · **Total: 11**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| FC-OG-01 | Account Reconciliation Certification Portal | Preparer certify + reviewer approve + auto-escalation | 🔴 High | P1 | 🔲 Open | TBD |
| FC-OG-02 | Tax Provision Engine (ASC 740 / IAS 12) | Current + deferred tax provision per entity | 🔴 High | P1 | 🔲 Open | TBD |
| FC-OG-03 | Disclosure Management / iXBRL Tagging | SEC EDGAR / ESMA-compliant iXBRL regulatory filings | 🔴 High | P1 | 🔲 Open | TBD |
| FC-OG-04 | IC Invoice-Level Matching (FCCS AR/AP) | AR invoice matches AP bill at line level pre-consolidation | 🔴 High | P1 | 🔲 Open | TBD |
| FC-OG-05 | Consolidation Logic Completeness Validation | Self-admitted 60% mocked — needs independent verification | 🔴 High | P1 | 🔲 Open | TBD |
| FC-OG-06 | Auto-Reconciliation Engine (Self-Admitted) | GL-to-subledger auto-match with exception flagging | 🟡 Medium | P2 | 🔲 Open | TBD |
| FC-OG-07 | Ownership Percentage & Minority Interest Config | Minority share auto-calculated in consolidated P&L | 🟡 Medium | P2 | 🔲 Open | TBD |
| FC-OG-08 | External Task Preparer/Reviewer Assignment | Per-task owner with email notification and sign-off | 🟡 Medium | P2 | 🔲 Open | TBD |
| FC-OG-09 | Revaluation Grouping by Exposure | Revalue by currency + ledger + segment separately | 🟡 Medium | P2 | 🔲 Open | TBD |
| FC-OG-10 | Statistical Journal Lines | Non-GL statistical accounts (headcount, units) | 🟢 Low | P3 | 🔲 Open | TBD |
| FC-OG-11 | Close Cycle Time Industry Benchmarking | Compare your close days vs. industry average | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 14: General Ledger

**Oracle Equivalent:** Oracle Fusion General Ledger

**Gaps:** 🔴 2 High · 🟡 7 Medium · 🟢 1 Low · **Total: 10**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| GL-OG-01 | FSG Financial Reporting Studio | Row/column formula builder with drill-through | 🔴 High | P1 | 🔲 Open | TBD |
| GL-OG-02 | External Tax Engine Integration (Vertex/Avalara) | Real-time tax calculation on journal entry | 🔴 High | P1 | 🔲 Open | TBD |
| GL-OG-03 | Segment Value Security | Block specific COA values from specific users | 🟡 Medium | P2 | 🔲 Open | TBD |
| GL-OG-04 | Oracle Accounting Hub (External System Journals) | Convert external transactions to journals via rules | 🟡 Medium | P2 | 🔲 Open | TBD |
| GL-OG-05 | Secondary Ledger (IFRS-to-GAAP Adjustment) | Parallel ledger for accounting method differences | 🟡 Medium | P2 | 🔲 Open | TBD |
| GL-OG-06 | Recursive Allocations (Pool-to-Pool) | Pool A → Pool B → Cost Centers cascade allocation | 🟡 Medium | P2 | 🔲 Open | TBD |
| GL-OG-07 | Remeasurement (FASB 52) + IAS 29 Hyperinflation | Monetary vs non-monetary translation separation | 🟡 Medium | P2 | 🔲 Open | TBD |
| GL-OG-08 | Position-Based Budgeting | Budget by headcount × salary at position level | 🟡 Medium | P2 | 🔲 Open | TBD |
| GL-OG-09 | DAS Enforcement Completeness | Read-only vs full DAS + segment balancing per entity | 🟡 Medium | P2 | 🔲 Open | TBD |
| GL-OG-10 | Parallel Posting Workers + Posting SLA Monitor | Multi-threaded posting + performance alerting | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 15: HR Analytics

**Oracle Equivalent:** Oracle HCM Analytics / OTBI

**Gaps:** 🔴 3 High · 🟡 7 Medium · 🟢 2 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| HRA-OG-01 | EEO-1 / UK Gender Pay Gap Statutory Filing | Exact regulatory format generation per jurisdiction | 🔴 High | P1 | 🔲 Open | TBD |
| HRA-OG-02 | Workforce Benchmarking (Radford/Mercer/SHRM) | Internal vs external market comparison by sector | 🔴 High | P1 | 🔲 Open | TBD |
| HRA-OG-03 | Ensemble Attrition Prediction + Explainability | Gradient boost + per-employee risk factor narrative | 🔴 High | P1 | 🔲 Open | TBD |
| HRA-OG-04 | Natural Language Analytics Query | "Show me turnover by dept Q3" as live data query | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRA-OG-05 | Nine-Box Performance-Potential Grid + Reporting | Population distribution + succession coverage ratio | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRA-OG-06 | Pre-Built HR Analysis Library (200+ OTBI) | Turnover, compa-ratio, span of control pre-built | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRA-OG-07 | Cell-Level Suppression for k-Anonymity | Suppress cells with group size < 5 in DEI reports | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRA-OG-08 | Calculated Columns in Report Builder | Inline calculated measure without backend changes | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRA-OG-09 | Conditional Formatting (Red/Yellow/Green thresholds) | Cells change color based on threshold breach | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRA-OG-10 | Event-Driven Snapshot Trigger | New hire triggers immediate headcount update | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRA-OG-11 | Time-Based Context Switching (As-of-date) | Compare today vs 12 months ago across all KPIs | 🟢 Low | P3 | 🔲 Open | TBD |
| HRA-OG-12 | Large Export (1M Rows) + Secure Email Delivery | Background jobs for big exports + PII-redacted delivery | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 16: HR Compliance

**Oracle Equivalent:** Oracle Fusion HCM Compliance

**Gaps:** 🔴 4 High · 🟡 8 Medium · 🟢 1 Low · **Total: 13**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| HRC-OG-01 | FCPA / Bribery Act Compliance Training Tracking | Annual mandatory training completion + access block | 🔴 High | P1 | 🔲 Open | TBD |
| HRC-OG-02 | Regulatory Filing Calendar (OSHA/EEO/VETS) | Jurisdiction-specific filing deadlines + workflow | 🔴 High | P1 | 🔲 Open | TBD |
| HRC-OG-03 | EEO Charge Response Workflow | EEOC charge structured response with evidence attachment | 🔴 High | P1 | 🔲 Open | TBD |
| HRC-OG-04 | Works Council / Union Obligation Management | Consultation notice periods + response documentation | 🔴 High | P1 | 🔲 Open | TBD |
| HRC-OG-05 | Cross-Border Data Transfer Compliance | EEA transfer rules + SCC/DPA tracking per vendor | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRC-OG-06 | Privacy Impact Assessment (DPIA) Workflow | Triggered when new data processing activity defined | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRC-OG-07 | SoD Simulation Before Role Assignment | Preview conflicts before saving role assignment | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRC-OG-08 | Cross-Application SoD (ERP + HCM + Procurement) | GRC-level detection across multiple system roles | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRC-OG-09 | Erasure Impact Map + Signed Certificate | Downstream system map + PDF erasure confirmation | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRC-OG-10 | Legislative Content Auto-Update (Oracle Quarterly) | Jurisdiction law changes delivered as config updates | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRC-OG-11 | Risk Model Versioning + Score Audit | Save/compare risk weight configs with historical scores | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRC-OG-12 | Consent Purpose Limitation Enforcement | Prevent use of data beyond consented purpose | 🟡 Medium | P2 | 🔲 Open | TBD |
| HRC-OG-13 | Audit Log Tamper Detection (Hash-Chain) | Cryptographic integrity check on audit records | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 17: Intercompany Accounting

**Oracle Equivalent:** Oracle Fusion AGIS (Intercompany)

**Gaps:** 🔴 4 High · 🟡 7 Medium · 🟢 1 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| AGIS-OG-01 | Full IC Dispute Lifecycle | Formal dispute → response → escalation → resolution | 🔴 High | P1 | 🔲 Open | TBD |
| AGIS-OG-02 | IC Balance Confirmation at Period-End | Provider/receiver agree outstanding balances before close | 🔴 High | P1 | 🔲 Open | TBD |
| AGIS-OG-03 | Multilateral Netting Center | Net payables/receivables across 5+ entities simultaneously | 🔴 High | P1 | 🔲 Open | TBD |
| AGIS-OG-04 | IC Invoice Mock → Real AR/AP Link | Linked AR invoice in provider + AP in receiver ledger | 🔴 High | P1 | 🔲 Open | TBD |
| AGIS-OG-05 | Multi-Currency IC Settlement | Exchange difference to IC revaluation account | 🟡 Medium | P2 | 🔲 Open | TBD |
| AGIS-OG-06 | Arm's-Length / TNMM / PSM Transfer Pricing Methods | Full OECD-compliant TP method support + documentation | 🟡 Medium | P2 | 🔲 Open | TBD |
| AGIS-OG-07 | IC Account Auto-Derivation (by LE pair) | Automatic IC receivable/payable GL account from system options | 🟡 Medium | P2 | 🔲 Open | TBD |
| AGIS-OG-08 | Statistical Unit Allocation Basis (Headcount/Floor Space) | Headcount or area as allocation driver | 🟡 Medium | P2 | 🔲 Open | TBD |
| AGIS-OG-09 | Recurring Allocation Schedule (Month-End Auto-Run) | Auto-scheduled allocation at period end | 🟡 Medium | P2 | 🔲 Open | TBD |
| AGIS-OG-10 | Netting Agreement Management | Formal netting terms, currencies, settlement cycles per pair | 🟡 Medium | P2 | 🔲 Open | TBD |
| AGIS-OG-11 | Predictive Dispute Likelihood Scoring | AI scores IC transaction on dispute probability pre-submission | 🟡 Medium | P2 | 🔲 Open | TBD |
| AGIS-OG-12 | Mass IC Transaction Import (CSV/Spreadsheet) | Bulk 10,000+ line IC transaction import with validation | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 18: Inventory Management

**Oracle Equivalent:** Oracle Fusion Inventory Management

**Gaps:** 🔴 5 High · 🟡 7 Medium · 🟢 1 Low · **Total: 13**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| INV-OG-01 | Lot Genealogy / Traceability (Upstream + Downstream) | Full recall trace for pharma, food, aerospace | 🔴 High | P1 | 🔲 Open | TBD |
| INV-OG-02 | Quality Inspection & Hold Management at Receipt | Inspection subinventory + accept/reject/rework disposition | 🔴 High | P1 | 🔲 Open | TBD |
| INV-OG-03 | Consignment Inventory (Vendor-Owned On-Site) | Ownership transfer on usage + supplier liability report | 🔴 High | P1 | 🔲 Open | TBD |
| INV-OG-04 | Physical Inventory Freeze & Variance Report | Full warehouse freeze + tag count + auditor variance report | 🔴 High | P1 | 🔲 Open | TBD |
| INV-OG-05 | Catch-Weight / Dual Unit of Measure | Primary UOM + catch weight for food/chemical industries | 🔴 High | P1 | 🔲 Open | TBD |
| INV-OG-06 | Item Revision Control (Engineering Change) | Revision-controlled inventory segregation + picking rules | 🟡 Medium | P2 | 🔲 Open | TBD |
| INV-OG-07 | LIFO Costing Layer | LIFO cost method for applicable jurisdictions | 🟡 Medium | P2 | 🔲 Open | TBD |
| INV-OG-08 | Standard Cost + Purchase Price Variance (PPV) | PPV auto-posted to GL at receipt vs standard cost | 🟡 Medium | P2 | 🔲 Open | TBD |
| INV-OG-09 | ABC Classification–Driven Count Frequency | A/B/C items auto-counted at different frequencies | 🟡 Medium | P2 | 🔲 Open | TBD |
| INV-OG-10 | Inter-Organization Transit Inventory | Goods-in-transit balance between orgs | 🟡 Medium | P2 | 🔲 Open | TBD |
| INV-OG-11 | Lot Expiration Enforcement (FEFO Picking) | First-expiry-first-out picking + block expired lot issues | 🟡 Medium | P2 | 🔲 Open | TBD |
| INV-OG-12 | Supply Chain ATP (Multi-Org + In-Transit) | ATP checks all orgs + in-transit supply, not just on-hand | 🟡 Medium | P2 | 🔲 Open | TBD |
| INV-OG-13 | Vendor Lead Time–Based Reorder Point + EOQ | Dynamic ROP with EOQ optimal order quantity suggestion | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 19: Landed Cost Management

**Oracle Equivalent:** Oracle Fusion Landed Cost Management

**Gaps:** 🔴 2 High · 🟡 8 Medium · 🟢 1 Low · **Total: 11**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| LCM-OG-01 | Duty Drawback Management | CBP/HMRC drawback claim + GL receivable posting | 🔴 High | P1 | 🔲 Open | TBD |
| LCM-OG-02 | C-TPAT / AEO Supply Chain Compliance | Trade compliance scoring + denied party screening | 🔴 High | P1 | 🔲 Open | TBD |
| LCM-OG-03 | Customs Tariff HS Code Linkage + Duty Auto-Calc | Duty rate auto-derived from HS code + trade agreement | 🟡 Medium | P2 | 🔲 Open | TBD |
| LCM-OG-04 | Retroactive Cost Reallocation (Post-Consumption) | Adjust already-consumed item cost when actuals arrive | 🟡 Medium | P2 | 🔲 Open | TBD |
| LCM-OG-05 | Broker Invoice 3-Way Match + EDI 810 | AP blocked if variance > tolerance without override | 🟡 Medium | P2 | 🔲 Open | TBD |
| LCM-OG-06 | Multi-Leg Routing with Per-Leg Charges | Intermediate port charges accumulated per shipment leg | 🟡 Medium | P2 | 🔲 Open | TBD |
| LCM-OG-07 | Partial Period Accrual (Cross-Period Shipments) | Accrue estimated LC at period end; reverse in next period | 🟡 Medium | P2 | 🔲 Open | TBD |
| LCM-OG-08 | Tolerance-Based Approval Escalation | <5% auto, 5-15% accountant, >15% controller | 🟡 Medium | P2 | 🔲 Open | TBD |
| LCM-OG-09 | Item-Level Perpetual Cost Update (FIFO/Avg Layer) | Unit cost updated at inventory layer level | 🟡 Medium | P2 | 🔲 Open | TBD |
| LCM-OG-10 | Trade Lane AI (Seasonal + Port Congestion Pricing) | Freight rate prediction using global trade data | 🟡 Medium | P2 | 🔲 Open | TBD |
| LCM-OG-11 | Original vs Revised Allocation Comparison Report | Side-by-side estimate vs actual for cost accountant sign-off | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 20: Lease & Contract Management

**Oracle Equivalent:** Oracle Fusion Lease Accounting (ASC 842 / IFRS 16)

**Gaps:** 🔴 4 High · 🟡 7 Medium · 🟢 1 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| LEASE-OG-01 | Lease Modification & Reassessment | Re-measure liability at revised rate + post adjustment | 🔴 High | P1 | 🔲 Open | TBD |
| LEASE-OG-02 | AI Clause Extraction (Currently Mock) | OCI NLP extraction of terms from PDF with 90%+ accuracy | 🔴 High | P1 | 🔲 Open | TBD |
| LEASE-OG-03 | Sublease Accounting (Intermediate Lessor) | Sublease receivable + income recognition + IFRS 16 disclosure | 🔴 High | P1 | 🔲 Open | TBD |
| LEASE-OG-04 | Contract Obligation Tracking & Renewal Management | Milestone tracking + auto-alert + renewal workflow | 🔴 High | P1 | 🔲 Open | TBD |
| LEASE-OG-05 | Embedded Lease Identification in Service Contracts | NLP scan for dedicated asset clauses requiring capitalization | 🟡 Medium | P2 | 🔲 Open | TBD |
| LEASE-OG-06 | Variable Lease Payment Handling (Usage/Index) | Separate recognition of variable vs fixed payments | 🟡 Medium | P2 | 🔲 Open | TBD |
| LEASE-OG-07 | ASC 842 ROU Asset & Liability Rollforward Report | Reg S-X compliant annual disclosure | 🟡 Medium | P2 | 🔲 Open | TBD |
| LEASE-OG-08 | Parallel Legal + Finance Approval for Commitments | Simultaneous two-stream approval above threshold | 🟡 Medium | P2 | 🔲 Open | TBD |
| LEASE-OG-09 | Amendment Impact Analysis (Before Confirmation) | Preview new liability + ROU + P&L before saving amendment | 🟡 Medium | P2 | 🔲 Open | TBD |
| LEASE-OG-10 | SLA Rule Configurability per Asset Class | Different GL accounts per asset class via rule engine | 🟡 Medium | P2 | 🔲 Open | TBD |
| LEASE-OG-11 | ROU Asset Auto-Derecognition on Termination | FA retirement triggered automatically at lease end | 🟡 Medium | P2 | 🔲 Open | TBD |
| LEASE-OG-12 | Lease vs Buy NPV Analysis | CFO decision tool comparing financing options | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 21: Learning (LMS)

**Oracle Equivalent:** Oracle Fusion Learning Cloud

**Gaps:** 🔴 4 High · 🟡 7 Medium · 🟢 1 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| LMS-OG-01 | Virtual Classroom (Zoom/Teams) Integration | Auto-attendance marking from video join/leave events | 🔴 High | P1 | 🔲 Open | TBD |
| LMS-OG-02 | LinkedIn Learning / Coursera External Content | Unified catalog + completion sync | 🔴 High | P1 | 🔲 Open | TBD |
| LMS-OG-03 | Regulatory Compliance Reports (SOX/OSHA/FCPA) | Pre-built compliance attestation reports | 🔴 High | P1 | 🔲 Open | TBD |
| LMS-OG-04 | External Certification Import (PMP/CPA/etc.) | Import externally earned certs with expiry to learning record | 🔴 High | P1 | 🔲 Open | TBD |
| LMS-OG-05 | Question Bank with Randomization | Unique question subset per learner from larger pool | 🟡 Medium | P2 | 🔲 Open | TBD |
| LMS-OG-06 | Eligibility Profile Enforcement at Enrollment | Block enrollment if learner doesn't meet profile criteria | 🟡 Medium | P2 | 🔲 Open | TBD |
| LMS-OG-07 | AICC / xAPI (Tin Can) Content Support | Modern granular interaction tracking beyond SCORM | 🟡 Medium | P2 | 🔲 Open | TBD |
| LMS-OG-08 | Adaptive Learning Path (Assessment-Driven Sequence) | Skip modules for high-scoring pre-tests | 🟡 Medium | P2 | 🔲 Open | TBD |
| LMS-OG-09 | Skills-Gap–Driven Recommendation (Job Profile Delta) | Current skills vs target role gap auto-course recommendation | 🟡 Medium | P2 | 🔲 Open | TBD |
| LMS-OG-10 | Team Learning Budget Management | Budget balance checked before course approval | 🟡 Medium | P2 | 🔲 Open | TBD |
| LMS-OG-11 | External Vendor Records + Procurement Integration | Training vendor POs routed through purchasing | 🟡 Medium | P2 | 🔲 Open | TBD |
| LMS-OG-12 | Bulk Enrollment Import (CSV) + Learning History Export | 500-learner batch enrollment + xAPI history export | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 22: Maintenance (EAM)

**Oracle Equivalent:** Oracle Fusion Enterprise Asset Management

**Gaps:** 🔴 4 High · 🟡 8 Medium · 🟢 1 Low · **Total: 13**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| EAM-OG-01 | Permit-to-Work (Hot Work, Confined Space, Electrical Isolation) | WO start blocked until safety permit issued + signed | 🔴 High | P1 | 🔲 Open | TBD |
| EAM-OG-02 | Condition-Based Maintenance (CBM) from IoT Threshold | Sensor breach auto-creates predictive WO | 🔴 High | P1 | 🔲 Open | TBD |
| EAM-OG-03 | Meter-Based PM Triggers (km / Operating Hours) | PM fired by meter reading, not clock time | 🔴 High | P1 | 🔲 Open | TBD |
| EAM-OG-04 | Asset Criticality Classification (A/B/C) | Drives PM frequency, spares stocking, WO priority | 🔴 High | P1 | 🔲 Open | TBD |
| EAM-OG-05 | Skill-Matched Auto-Assignment on WO | Best available tech by skill + location + workload | 🟡 Medium | P2 | 🔲 Open | TBD |
| EAM-OG-06 | Failed Inspection → Auto Corrective WO | Threshold breach creates WO automatically | 🟡 Medium | P2 | 🔲 Open | TBD |
| EAM-OG-07 | FMEA / RCM Library (Cause-Failure-Remedy Triples) | Standardized failure codes for MTBF/MTTR stats | 🟡 Medium | P2 | 🔲 Open | TBD |
| EAM-OG-08 | GIS / Spatial Asset Map (Floor Plan View) | Assets on building map with urgency highlight | 🟡 Medium | P2 | 🔲 Open | TBD |
| EAM-OG-09 | BOM-Driven Parts Pre-Population on WO | Asset BOM pre-loads expected parts on new WO | 🟡 Medium | P2 | 🔲 Open | TBD |
| EAM-OG-10 | Parts Reservation for Future Scheduled WOs | Hold stock for planned WO weeks in advance | 🟡 Medium | P2 | 🔲 Open | TBD |
| EAM-OG-11 | Budget vs Actual Variance per Asset + LCD | Annual maint budget vs YTD actual + lifecycle cost | 🟡 Medium | P2 | 🔲 Open | TBD |
| EAM-OG-12 | NFC / Barcode Asset Identification on Mobile | Scan tag to auto-load asset 360 + open WO | 🟡 Medium | P2 | 🔲 Open | TBD |
| EAM-OG-13 | Vendor Frame Agreement for Maintenance Parts | Blanket PO auto-release for common parts reorder | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 23: Manufacturing

**Oracle Equivalent:** Oracle Fusion Manufacturing / OPM

**Gaps:** 🔴 5 High · 🟡 7 Medium · 🟢 1 Low · **Total: 13**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| MFG-OG-01 | Engineering Change Order (ECO) Management | BOM changes governed by ECO with effectivity + approval | 🔴 High | P1 | 🔲 Open | TBD |
| MFG-OG-02 | Outside Processing (Subcontract WO Step) | Auto-PO for vendor service + cost posted to WO | 🔴 High | P1 | 🔲 Open | TBD |
| MFG-OG-03 | Constrained Capacity Planning (ASCP) | MRP respects machine/labor capacity with reschedule | 🔴 High | P1 | 🔲 Open | TBD |
| MFG-OG-04 | Configure-to-Order / Assemble-to-Order | Option-driven BOM explosion at order time | 🔴 High | P1 | 🔲 Open | TBD |
| MFG-OG-05 | Co-Product / By-Product Accounting | Cost allocation to simultaneous co-products/by-products | 🔴 High | P1 | 🔲 Open | TBD |
| MFG-OG-06 | Shop Floor Control (Queue + Scan Dispatch) | Real-time operation completion with auto WO progression | 🟡 Medium | P2 | 🔲 Open | TBD |
| MFG-OG-07 | MES Integration (OPC-UA / REST to Shop Machines) | Machine counts, cycle times, downtime to WOs in real-time | 🟡 Medium | P2 | 🔲 Open | TBD |
| MFG-OG-08 | In-Process Quality Checkpoints (Block Next Operation) | Non-conformance blocks WO progression at each step | 🟡 Medium | P2 | 🔲 Open | TBD |
| MFG-OG-09 | Specification Management (UCL/LCL Auto Pass/Fail) | Spec limits per test; auto-evaluate without manual compare | 🟡 Medium | P2 | 🔲 Open | TBD |
| MFG-OG-10 | Recall Forward-Trace from Ingredient Lot | Lot → all finished goods → all customer shipments | 🟡 Medium | P2 | 🔲 Open | TBD |
| MFG-OG-11 | Resource (Machine/Labor) Capacity Management | Resource availability, efficiency, and shortage alerts | 🟡 Medium | P2 | 🔲 Open | TBD |
| MFG-OG-12 | Dynamic Formula Scaling (Target Batch Size) | Scale all ingredient quantities to desired output qty | 🟡 Medium | P2 | 🔲 Open | TBD |
| MFG-OG-13 | Variance Investigation Workflow (Root Cause + CAR) | Threshold breach opens task with root cause required | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 24: Manufacturing Costing

**Oracle Equivalent:** Oracle Fusion Manufacturing Costing

**Gaps:** 🔴 4 High · 🟡 6 Medium · 🟢 1 Low · **Total: 11**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| WCOS-OG-01 | Actual / FIFO Layer Costing for WIP | Each WO has its own actual cost vs shared standard | 🔴 High | P1 | 🔲 Open | TBD |
| WCOS-OG-02 | Lot Cost Tracking (OPM Lot Costing) | Actual cost per ingredient lot used in each batch | 🔴 High | P1 | 🔲 Open | TBD |
| WCOS-OG-03 | Inventory Revaluation on Standard Cost Update | On-hand revalued at new standard + variance posted to GL | 🔴 High | P1 | 🔲 Open | TBD |
| WCOS-OG-04 | Actual Overhead Absorption (Rate × Actual Hours) | Rate × actual machine/labor hours; over/under absorption account | 🔴 High | P1 | 🔲 Open | TBD |
| WCOS-OG-05 | Cost Update Approval Workflow | Proposed cost reviewed + approved before system update | 🟡 Medium | P2 | 🔲 Open | TBD |
| WCOS-OG-06 | WIP Accounting Period Close (Sweep Variances) | Period close sweeps open WO variances to variance accounts | 🟡 Medium | P2 | 🔲 Open | TBD |
| WCOS-OG-07 | Outside Processing Cost Element Tracking | PO cost flows into WO as OSP cost element with variance | 🟡 Medium | P2 | 🔲 Open | TBD |
| WCOS-OG-08 | Variance Drill-Down to Source Transaction | Variance line links to originating WIP issue/charge/absorption | 🟡 Medium | P2 | 🔲 Open | TBD |
| WCOS-OG-09 | Rate vs Usage Variance Split (Efficiency vs Price) | Decompose variance into efficiency and rate components | 🟡 Medium | P2 | 🔲 Open | TBD |
| WCOS-OG-10 | Pending Standard Cost (Frozen vs Pending Dual View) | Maintain proposed standard alongside frozen; single-switch update | 🟡 Medium | P2 | 🔲 Open | TBD |
| WCOS-OG-11 | Cost Element Sub-Classification (OPM 5-element model) | Material, Mat OH, Resource, OSP, Overhead with GL mapping | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 25: Master Data Management

**Oracle Equivalent:** Oracle Fusion MDM / TCA / PIM

**Gaps:** 🔴 4 High · 🟡 7 Medium · 🟢 1 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| MDM-OG-01 | D&B / Experian External Enrichment | One-click enrich party with revenue, SIC, address, executives | 🔴 High | P1 | 🔲 Open | TBD |
| MDM-OG-02 | Real-Time Address Validation (Loqate / Melissa Data) | Postal authority validation at save time | 🔴 High | P1 | 🔲 Open | TBD |
| MDM-OG-03 | AI Anomaly Detection (Bank Account Change Alert, etc.) | Statistical flag for unusual MDM changes → review task | 🔴 High | P1 | 🔲 Open | TBD |
| MDM-OG-04 | Item Revision Control (Record History with Effectivity Date) | Each item change creates versioned revision; previous preserved | 🔴 High | P1 | 🔲 Open | TBD |
| MDM-OG-05 | Item Category Attribute Inheritance (Hierarchy-Based) | Define 50 attributes once at category; inherited by all SKUs | 🟡 Medium | P2 | 🔲 Open | TBD |
| MDM-OG-06 | Item Status Lifecycle (Prototype → Active → Discontinuing → Obsolete) | Status controls which transaction types are allowed | 🟡 Medium | P2 | 🔲 Open | TBD |
| MDM-OG-07 | Party Hierarchy Credit / AR Aggregation | AR balance + DSO rolls up to parent company | 🟡 Medium | P2 | 🔲 Open | TBD |
| MDM-OG-08 | Probabilistic Record Linkage (Fellegi-Sunter / EDQ) | Multi-attribute weighted scoring; learns from corrections | 🟡 Medium | P2 | 🔲 Open | TBD |
| MDM-OG-09 | Real-Time Duplicate Check on Create | Match fires before save; blocks duplicate, presents candidates | 🟡 Medium | P2 | 🔲 Open | TBD |
| MDM-OG-10 | MSDS / Regulatory Attribute Management | Hazardous item classification blocks shipping to restricted regions | 🟡 Medium | P2 | 🔲 Open | TBD |
| MDM-OG-11 | Pre-Import Validation Report (Exception Preview) | Validate file before commit; show rows that would fail | 🟡 Medium | P2 | 🔲 Open | TBD |
| MDM-OG-12 | Bulk Export / Data Portability (XLSX / SFTP) | Full party + item export for BI or GDPR data requests | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 26: Planning, Budgeting & Forecasting

**Oracle Equivalent:** Oracle EPBCS Planning & Budgeting Cloud

**Gaps:** 🔴 4 High · 🟡 8 Medium · 🟢 2 Low · **Total: 14**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| PBF-OG-01 | Plan Accuracy Dependency: Consolidation 60% Mocked | Plan-to-actual variance unmeasurable when actuals are mocked | 🔴 High | P1 | 🔲 Open | TBD |
| PBF-OG-02 | IC Elimination Plan ≠ Close IC Elimination (Mock IC) | Plan IC eliminations can't reconcile to actual close | 🔴 High | P1 | 🔲 Open | TBD |
| PBF-OG-03 | IC Cash Netting Not in Treasury Plan | Multilateral netting missing → treasury plan overstates gross cash | 🔴 High | P1 | 🔲 Open | TBD |
| PBF-OG-04 | EPBCS Sandbox Environment | Isolated plan copy for formula/dimension testing before production | 🔴 High | P1 | 🔲 Open | TBD |
| PBF-OG-05 | Project Budget Amendment Workflow | Overspend triggers approval before additional commitment allowed | 🟡 Medium | P2 | 🔲 Open | TBD |
| PBF-OG-06 | Incremental Hire/Attrition Scenario (WFP) | Model N new hires with cascading cost impacts across all budget lines | 🟡 Medium | P2 | 🔲 Open | TBD |
| PBF-OG-07 | Merit Increase Integration from HR to Plan | Approved merit % from HR auto-updates plan salary expense | 🟡 Medium | P2 | 🔲 Open | TBD |
| PBF-OG-08 | Planning Unit Hierarchy Lock Propagation | Parent lock cascades to all subordinate planning units | 🟡 Medium | P2 | 🔲 Open | TBD |
| PBF-OG-09 | Driver Ownership Assignment + Change Audit | Each driver has owner; version-controlled change log | 🟡 Medium | P2 | 🔲 Open | TBD |
| PBF-OG-10 | Deal Desk / Contract Backlog Revenue Plan | Signed contracts auto-contribute POC revenue to plan | 🟡 Medium | P2 | 🔲 Open | TBD |
| PBF-OG-11 | Prior Year Actual Version (Built-In YOY Context) | Prior year always available in grid without manual load | 🟡 Medium | P2 | 🔲 Open | TBD |
| PBF-OG-12 | Uncertified Actuals → Plan Baseline Risk | Account rec certification (FC-OG-01) missing; plan seeds from uncertified GL | 🟡 Medium | P2 | 🔲 Open | TBD |
| PBF-OG-13 | Automated Outlier Exclusion Before ML Training | 3σ anomalies excluded from forecast training window | 🟢 Low | P3 | 🔲 Open | TBD |
| PBF-OG-14 | Forecast-vs-Prior-Year Same-Period Comparison | Built-in PY actual version in grid without config | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 27: Project Portfolio Management

**Oracle Equivalent:** Oracle Fusion Project Portfolio Management

**Audit Note:** 🚨 Original audit: API Level 2, UI Level 0 (contradicts 100% claim)

**Gaps:** 🔴 4 High · 🟡 6 Medium · 🟢 1 Low · **Total: 11**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| PPM-OG-03 | Stage-Gate Review (Concept→Plan→Execute→Close) | Review board approval required at each project stage gate | 🔴 High | P1 | 🔲 Open | TBD |
| PPM-OG-04 | Milestone-Based Billing | Invoice triggered by deliverable milestone completion, not time | 🔴 High | P1 | 🔲 Open | TBD |
| PPM-OG-05 | Employee Timesheet → PPM Labor Auto-Flow | HCM timesheet approvals auto-create expenditure items in PPM | 🔴 High | P1 | 🔲 Open | TBD |
| PPM-OG-06 | Portfolio-Level Resource Demand vs Supply | Cross-project resource planning with over-allocation alerts | 🔴 High | P1 | 🔲 Open | TBD |
| PPM-OG-07 | Budget Version Control (Original / Revised / Current) | Change history with authorization trail per budget revision | 🟡 Medium | P2 | 🔲 Open | TBD |
| PPM-OG-08 | Provisional vs Final Burden Rate (DCAA Compliance) | Year-end actual rate replaces provisional with retroactive adjustment | 🟡 Medium | P2 | 🔲 Open | TBD |
| PPM-OG-09 | Retainage Management | Withhold % of invoice retained until project close milestone | 🟡 Medium | P2 | 🔲 Open | TBD |
| PPM-OG-10 | Capitalization Threshold Rule per Asset Category | Sub-threshold costs auto-expensed; above-threshold capitalized | 🟡 Medium | P2 | 🔲 Open | TBD |
| PPM-OG-11 | SPI Trend Chart (6-Period Performance Trend) | Schedule performance trajectory for recovery plan decisions | 🟡 Medium | P2 | 🔲 Open | TBD |
| PPM-OG-12 | Project Subledger vs GL Reconciliation Report | Cost subledger balance vs GL account out-of-balance detection | 🟡 Medium | P2 | 🔲 Open | TBD |
| PPM-OG-13 | Resource-Loaded Schedule (Resource Plan → Cost Plan) | Planned hours per resource auto-drive the cost budget | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 28: Procurement & SCM

**Oracle Equivalent:** Oracle Fusion Procurement Cloud

**Audit Note:** ⚠️ Self-scoped to "Tier-1 subset" only

**Gaps:** 🔴 4 High · 🟡 7 Medium · 🟢 1 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| PRO-OG-01 | Procurement Contract Lifecycle Management | PO must reference active contract; contract expiry alerts | 🔴 High | P1 | 🔲 Open | TBD |
| PRO-OG-02 | Supplier Qualification Management (SQM / AVL) | Scored questionnaire → approved vendor list | 🔴 High | P1 | 🔲 Open | TBD |
| PRO-OG-03 | AI Spend Classification (UNSPSC / Taxonomy ML) | Self-admitted mock; ML auto-classifies spend categories | 🔴 High | P1 | 🔲 Open | TBD |
| PRO-OG-04 | Punchout Catalog Integration (Grainger, Dell, etc.) | Requester shops live supplier catalog from within ERP | 🔴 High | P1 | 🔲 Open | TBD |
| PRO-OG-05 | PO Change Order Management (Numbered + Re-approval) | Every PO change creates a versioned change order with approval trail | 🟡 Medium | P2 | 🔲 Open | TBD |
| PRO-OG-06 | Blanket Purchase Agreement (BPA) with Release Tracking | Annual committed spend; releases draw down commitment | 🟡 Medium | P2 | 🔲 Open | TBD |
| PRO-OG-07 | Supplier Bank Account Verification Workflow | Call/letter confirmation before activating payment account | 🟡 Medium | P2 | 🔲 Open | TBD |
| PRO-OG-08 | Sealed Bid Sourcing Event | Bids sealed until deadline; winner disclosed after scoring | 🟡 Medium | P2 | 🔲 Open | TBD |
| PRO-OG-09 | Supplier Performance Scorecard (OTD, Defect, Price Var) | Measured per supplier across delivery, quality, and invoice match | 🟡 Medium | P2 | 🔲 Open | TBD |
| PRO-OG-10 | Maverick Spend Detection | Non-PO / non-preferred spend flagged as % of category total | 🟡 Medium | P2 | 🔲 Open | TBD |
| PRO-OG-11 | Over-Receipt Tolerance Enforcement | Block receiving above PO qty + tolerance % | 🟡 Medium | P2 | 🔲 Open | TBD |
| PRO-OG-12 | Carry-Forward Encumbrance at Fiscal Year-End | Open PO encumbrances auto-carry to new-year budget | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 29: Revenue Management

**Oracle Equivalent:** Oracle Fusion Revenue Management Cloud (RMCS)

**Audit Note:** 🚨 Original history: 5 of 13 sub-modules = UI shells

**Gaps:** 🔴 3 High · 🟡 5 Medium · 🟢 1 Low · **Total: 9**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| RMCS-OG-05 | Revenue Assurance Dashboard (Self-Admitted Shell) | Anomaly detection, aging, allocation exceptions | 🔴 High | P1 | 🔲 Open | TBD |
| RMCS-OG-06 | Revenue Forecasting (Self-Admitted Placeholder) | Waterfall + churn impact; actual ML logic | 🔴 High | P1 | 🔲 Open | TBD |
| RMCS-OG-07 | GL Subledger Reconciliation Report (Self-Admitted Missing) | Deferred/unbilled/recognized vs GL by contract | 🔴 High | P1 | 🔲 Open | TBD |
| RMCS-OG-08 | Audit Rule Change Log (SSP / Rule Modifications) | Who changed SSP + before/after; auditor requirement | 🟡 Medium | P2 | 🔲 Open | TBD |
| RMCS-OG-09 | Contract Modification Timeline View (Self-Admitted Missing) | Versioned Before/After revenue schedule per mod | 🟡 Medium | P2 | 🔲 Open | TBD |
| RMCS-OG-10 | Multi-Currency Deferred Revenue Revaluation (Self-Admitted) | FX rate at inception; OCI translation each period | 🟡 Medium | P2 | 🔲 Open | TBD |
| RMCS-OG-11 | Auditor Read-Only Deep Trace Workbench | Source event → POB → journal trace; no modify | 🟡 Medium | P2 | 🔲 Open | TBD |
| RMCS-OG-12 | SSP Residual Approach + Range Tolerance Validation | Residual method for variable-SSP POBs | 🟡 Medium | P2 | 🔲 Open | TBD |
| RMCS-OG-13 | Billing-to-Revenue Deep Link Integration | Invoice ↔ revenue schedule link; unbilled AR tracking | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 30: Subledger Accounting

**Oracle Equivalent:** Oracle Fusion Subledger Accounting (XLA)

**Gaps:** 🔴 1 High · 🟡 7 Medium · 🟢 2 Low · **Total: 10**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| SLA-OG-01 | Automated Accounting Scheduler (ESS Job) | Create Accounting + GL Transfer runs on schedule without manual UI | 🔴 High | P1 | 🔲 Open | TBD |
| SLA-OG-02 | Cost Element Accounting (Material / MOH / Resource / OSP) | Inventory debits split by cost element to separate GL accounts | 🟡 Medium | P2 | 🔲 Open | TBD |
| SLA-OG-03 | Third-Party Subledger Self-Registration | Custom modules register own event classes in XLA without core code change | 🟡 Medium | P2 | 🔲 Open | TBD |
| SLA-OG-04 | Formula-Based Amount Source in JLTs | Amount = Invoice Amount × Tax Rate (computed, not just column reference) | 🟡 Medium | P2 | 🔲 Open | TBD |
| SLA-OG-05 | Accounting Error Correction Workflow | Fix ADR rule and re-process failed events without full batch re-run | 🟡 Medium | P2 | 🔲 Open | TBD |
| SLA-OG-06 | Reporting Currency Ledger (3rd Ledger Type) | Translated balance-only ledger for group reporting | 🟡 Medium | P2 | 🔲 Open | TBD |
| SLA-OG-07 | Average Cost Revaluation Accounting Event | On-hand inventory revalued to new average cost across all subinventories | 🟡 Medium | P2 | 🔲 Open | TBD |
| SLA-OG-08 | IFRS Revaluation / IAS 36 Impairment Events (Fixed Assets) | Revaluation surplus (OCI) and impairment loss accounting entries | 🟡 Medium | P2 | 🔲 Open | TBD |
| SLA-OG-09 | T-Account Drilldown from GL Balance | Balance → journal → subledger event in single click | 🟢 Low | P3 | 🔲 Open | TBD |
| SLA-OG-10 | XLA Audit Trail Report (Execution History) | Who ran Create Accounting, events processed, success/failure log | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 31: Supplier Portal & PCM

**Oracle Equivalent:** Oracle iSupplier Portal / PCM

**Gaps:** 🔴 3 High · 🟡 6 Medium · 🟢 2 Low · **Total: 11**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| SUP-OG-01 | Contract Obligation Tracking (Quarterly Reports, Due Dates) | Overdue obligation escalation per contract clause | 🔴 High | P1 | 🔲 Open | TBD |
| SUP-OG-02 | Certification Expiry Alerting + PO Block | Automated 60/30/7 day alerts; blocks supplier selection on expiry | 🔴 High | P1 | 🔲 Open | TBD |
| SUP-OG-03 | Qualification Questionnaire Weighted Scoring | Below-threshold score = probation/disqualification without manual review | 🔴 High | P1 | 🔲 Open | TBD |
| SUP-OG-04 | Invoicing Rule Enforcement (Deliver-Before-Bill) | Cannot invoice undelivered PO line if contract requires ASN receipt first | 🟡 Medium | P2 | 🔲 Open | TBD |
| SUP-OG-05 | Multi-Round Negotiation (Best and Final Offer) | Shortlist re-bid round after initial quotes close | 🟡 Medium | P2 | 🔲 Open | TBD |
| SUP-OG-06 | Release Order Committed Spend Tracking (PO vs Received vs Invoiced) | Full P2P exposure = PO + received + invoiced separately tracked | 🟡 Medium | P2 | 🔲 Open | TBD |
| SUP-OG-07 | Weighted Composite Supplier Score + CAP Workflow | Low score → corrective action plan auto-triggered | 🟡 Medium | P2 | 🔲 Open | TBD |
| SUP-OG-08 | Supplier Duplicate Detection (D-U-N-S / Tax ID / Name-Address) | Match check before registration approval | 🟡 Medium | P2 | 🔲 Open | TBD |
| SUP-OG-09 | Contract Template Library with Mandatory Clauses | Pre-approved templates; mandatory clauses cannot be deleted | 🟡 Medium | P2 | 🔲 Open | TBD |
| SUP-OG-10 | PO Acknowledgement Deadline Escalation | Unacknowledged PO beyond threshold escalates to procurement manager | 🟢 Low | P3 | 🔲 Open | TBD |
| SUP-OG-11 | Buyer-Facing Portal Adoption Analytics | % portal vs. manual PO/ASN/invoice; cycle time metrics | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 32: Talent Management

**Oracle Equivalent:** Oracle Fusion HCM Talent Management

**Audit Note:** 🚨 Original audit: all sub-domains = UI shells with 404 API errors

**Gaps:** 🔴 4 High · 🟡 6 Medium · 🟢 2 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| TAL-OG-01 | Cascading Goals (Division → Department → Individual) | Corporate goal rollup with aggregate completion % | 🔴 High | P1 | 🔲 Open | TBD |
| TAL-OG-02 | GDPR Candidate Data Purge (Retention Policy) | Auto-purge rejected candidates after configurable retention period | 🔴 High | P1 | 🔲 Open | TBD |
| TAL-OG-03 | Nine-Box Grid (Performance vs Potential Placement) | Grid placement drives succession pool prioritization | 🔴 High | P1 | 🔲 Open | TBD |
| TAL-OG-04 | Learning Path with Prerequisite Enforcement | Cannot enroll in Course 3 until Course 2 assessed | 🔴 High | P1 | 🔲 Open | TBD |
| TAL-OG-05 | 360-Degree Feedback with Anonymization | Anonymous peer feedback; synthesized summary only | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAL-OG-06 | Calibration Session (Forced Distribution Curve) | Cross-manager rating normalization before finalization | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAL-OG-07 | Skill Gap Analysis vs Role Competency Profile | Gap vs target role → personal development plan | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAL-OG-08 | AI Candidate Ranking (Fit Score vs Job Requirements) | AI shortlist ranked by match score | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAL-OG-09 | New Hire Onboarding Workflow (Pre-Day-1 Checklist) | E-sign NDA, tax forms, equipment requests before start | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAL-OG-10 | Succession Readiness Timeline (Now / 1-2yr / 3-5yr) | Readiness change alerts to HR and plan owner | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAL-OG-11 | External Content Integration (SCORM/xAPI / LinkedIn) | Third-party course completion syncs to Oracle LMS | 🟢 Low | P3 | 🔲 Open | TBD |
| TAL-OG-12 | AI Career Path Recommendation | Skills + performance → 2-3 career paths with training steps | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 33: Tax Engine

**Oracle Equivalent:** Oracle Fusion Tax Cloud / Vertex

**Gaps:** 🔴 3 High · 🟡 7 Medium · 🟢 1 Low · **Total: 11**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| TAX-OG-01 | e-Invoicing Compliance (ZATCA / SDI / GST IRN) | Signed XML clearance for B2B e-invoicing mandates | 🔴 High | P1 | 🔲 Open | TBD |
| TAX-OG-02 | Withholding Tax (TDS, 1099, WHT Certificates) | WHT on AP payments; annual returns (Form 26Q, 1099) | 🔴 High | P1 | 🔲 Open | TBD |
| TAX-OG-03 | GL Reconciliation — Self-Admitted Simulated | Tax subledger vs GL control account live validation | 🔴 High | P1 | 🔲 Open | TBD |
| TAX-OG-04 | Tax Content Subscription (Vertex / Avalara) | Auto-update of rates/rules when legislation changes | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAX-OG-05 | Country-Specific Tax Return Box Mapping | UK Box 1-9, German UStVA, French CA3, etc. | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAX-OG-06 | Tax Determination Trace (Rule Sequence Audit) | Full rule evaluation log per invoice line | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAX-OG-07 | Economic Nexus Threshold Monitoring (US Sales Tax) | Cumulative sales tracking per state; threshold alerts | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAX-OG-08 | Product Taxability Matrix (PTCC per Item) | Per-item tax classification code × jurisdiction | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAX-OG-09 | Intrastat Statistical Reporting (EU) | Arrivals/dispatches of goods between EU member states | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAX-OG-10 | Tax Control Account Reconciliation Certification | Controller certifies reconciliation before period close | 🟡 Medium | P2 | 🔲 Open | TBD |
| TAX-OG-11 | Regime-to-Rate Configuration UI (No-Code Admin) | Tax regime/type/rate setup via guided UI, not API | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 34: Time & Labor

**Oracle Equivalent:** Oracle Fusion Time & Labor / WFM

**Audit Note:** ⚠️ Self-admitted: no deep rule engine, basic OT logic only

**Gaps:** 🔴 3 High · 🟡 5 Medium · 🟢 2 Low · **Total: 10**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| WFM-OG-01 | FLSA/WTD Compliance Enforcement (Multi-Jurisdiction OT) | Auto-flag OT violations before timesheet approval | 🔴 High | P1 | 🔲 Open | TBD |
| WFM-OG-02 | Absence Management (Leave Request + Approval Workflow) | Leave request → approval → balance deduction + schedule coverage | 🔴 High | P1 | 🔲 Open | TBD |
| WFM-OG-03 | AI Predictive Scheduling — Self-Admitted Incomplete (Phase 33) | Demand-based AI roster with coverage gap alerts | 🔴 High | P1 | 🔲 Open | TBD |
| WFM-OG-04 | Labor Cost Distribution to Cost Center / Project | Per-timesheet-line allocation to GL via SLA | 🟡 Medium | P2 | 🔲 Open | TBD |
| WFM-OG-05 | Union Work Rule Validation (CBA per Employee) | Collective bargaining agreement enforcement per timesheet | 🟡 Medium | P2 | 🔲 Open | TBD |
| WFM-OG-06 | Time Rule Engine Deep Configuration UI (No-Code) | No-code rule definition for pay policies and rounding rules | 🟡 Medium | P2 | 🔲 Open | TBD |
| WFM-OG-07 | Retroactive Timesheet Correction + Retro-Pay Adjustment | Correction to locked period → retro-pay in next payroll | 🟡 Medium | P2 | 🔲 Open | TBD |
| WFM-OG-08 | Accrual Proration on Hire/Termination | Prorated accrual + balance forfeiture at termination | 🟡 Medium | P2 | 🔲 Open | TBD |
| WFM-OG-09 | Biometric Time Capture (Kronos / Geo-Fenced Mobile Punch) | Clock-in events feed timesheet without manual entry | 🟢 Low | P3 | 🔲 Open | TBD |
| WFM-OG-10 | Multi-Calendar Assignment (Split-Country Work Pattern) | Dual holiday calendar per employee based on work location | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 35: Transportation & Logistics

**Oracle Equivalent:** Oracle Transportation Management (OTM)

**Audit Note:** 🚨 Audit: Route Planning, Freight Settlement, Carrier Portal = placeholders

**Gaps:** 🔴 3 High · 🟡 6 Medium · 🟢 2 Low · **Total: 11**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| TMS-OG-01 | Electronic Load Tender (EDI 204) + Carrier Accept/Reject (EDI 990) | Auto-tender to next carrier in hierarchy on rejection | 🔴 High | P1 | 🔲 Open | TBD |
| TMS-OG-02 | Carrier EDI 214 / API Tracking Integration | Automatic milestone events from carrier systems | 🔴 High | P1 | 🔲 Open | TBD |
| TMS-OG-03 | Multi-Modal Transport Mode Selection (TL/LTL/Air/Ocean/Rail) | Mode optimization per weight, distance, urgency | 🔴 High | P1 | 🔲 Open | TBD |
| TMS-OG-04 | Carrier Invoice Rate Audit (Contract vs Billed) | Flag discrepancies before payment | 🟡 Medium | P2 | 🔲 Open | TBD |
| TMS-OG-05 | Load Building (Cubic/Weight Optimization with Hazmat Segregation) | Pack orders to maximize truck cube utilization | 🟡 Medium | P2 | 🔲 Open | TBD |
| TMS-OG-06 | Carrier Portal (External POD, Invoice Submission) | Self-service portal for carriers | 🟡 Medium | P2 | 🔲 Open | TBD |
| TMS-OG-07 | Real-Time Traffic Data in Route Optimization | HERE/Google Maps live traffic advisories | 🟡 Medium | P2 | 🔲 Open | TBD |
| TMS-OG-08 | Freight Accrual Reversal on Invoice Match | Auto-reverse accrual and replace with exact invoiced amount | 🟡 Medium | P2 | 🔲 Open | TBD |
| TMS-OG-09 | Order Consolidation Policy (Weight/Cube/Time Window) | Auto-consolidate orders to minimize shipments | 🟡 Medium | P2 | 🔲 Open | TBD |
| TMS-OG-10 | Driver GPS Real-Time Position on Route Map | Truck position every 2-5 minutes from driver app | 🟢 Low | P3 | 🔲 Open | TBD |
| TMS-OG-11 | Carrier Capability Attributes (Hazmat, Reefer, Oversize) | Planning engine filters carriers by capability match | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 36: Treasury & Cash Management

**Oracle Equivalent:** Oracle Fusion Treasury

**Audit Note:** 🚨 Forensic section: Debt / Investments / AI = Critical / Missing

**Gaps:** 🔴 4 High · 🟡 6 Medium · 🟢 2 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| TRS-OG-01 | IFRS 9 / ASC 815 Hedge Effectiveness Testing | Prospective + retrospective test at each reporting date | 🔴 High | P1 | 🔲 Open | TBD |
| TRS-OG-02 | Bank Statement Auto-Import (BAI2 / SWIFT MT940) | Daily bank balance reconciliation vs GL | 🔴 High | P1 | 🔲 Open | TBD |
| TRS-OG-03 | Debt Covenant Monitoring (Leverage / Interest Coverage) | Pre-breach alerts before measurement date | 🔴 High | P1 | 🔲 Open | TBD |
| TRS-OG-04 | Sanctions Screening (OFAC/EU/UN) on Payments | Block and quarantine non-compliant payments | 🔴 High | P1 | 🔲 Open | TBD |
| TRS-OG-05 | Per-Trader Deal Size Limits + Counterparty Credit Lines | Block deals exceeding approved limits | 🟡 Medium | P2 | 🔲 Open | TBD |
| TRS-OG-06 | CVA/DVA Credit Valuation Adjustment for OTC Derivatives | Fair value adjustment for counterparty default risk | 🟡 Medium | P2 | 🔲 Open | TBD |
| TRS-OG-07 | Payment Factory Model (Subsidiary Payment Aggregation) | Central netting and release of subsidiary payments | 🟡 Medium | P2 | 🔲 Open | TBD |
| TRS-OG-08 | Netting Agreement Validation (ISDA / Bilateral) | Exclude counterparty pairs without netting agreements | 🟡 Medium | P2 | 🔲 Open | TBD |
| TRS-OG-09 | Cash Concentration / ZBA Pooling Structures (Configurable) | Configurable sweep thresholds per account hierarchy | 🟡 Medium | P2 | 🔲 Open | TBD |
| TRS-OG-10 | Bank Fee Analysis vs Negotiated AFP Tariff | Fee exception report for above-tariff charges | 🟡 Medium | P2 | 🔲 Open | TBD |
| TRS-OG-11 | Intraday Liquidity Monitoring (Near-Real-Time Position) | Intraday cash position from payment confirmations | 🟢 Low | P3 | 🔲 Open | TBD |
| TRS-OG-12 | Day-Count Convention Configurability (30/360, Act/360, etc.) | Per-instrument interest accrual convention | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 37: Warehouse Management (WMS)

**Oracle Equivalent:** Oracle Fusion WMS Cloud

**Audit Note:** ⚠️ L7 / L8 / L11 self-admitted MISSING in pre-Phase 29 audit

**Gaps:** 🔴 3 High · 🟡 7 Medium · 🟢 2 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| WMS-OG-01 | Directed Putaway Rule Engine (Rule Priority Sequence) | Worker directed to specific bin based on prioritized rules | 🔴 High | P1 | 🔲 Open | TBD |
| WMS-OG-02 | Yard Management (Dock Appointments, Trailer Staging) | Pre-arrival dock booking; yard position tracking | 🔴 High | P1 | 🔲 Open | TBD |
| WMS-OG-03 | Carrier Manifesting + Label Printing (ZPL/DPL) | Carrier label generated and printed on ship confirm | 🔴 High | P1 | 🔲 Open | TBD |
| WMS-OG-04 | Replenishment Task Auto-Trigger from Pick Depletion | Empty primary location triggers reserve pull | 🟡 Medium | P2 | 🔲 Open | TBD |
| WMS-OG-05 | Cluster Picking (Multi-Order Cart with Tote Labels) | Single worker picks multiple orders simultaneously | 🟡 Medium | P2 | 🔲 Open | TBD |
| WMS-OG-06 | Quality Inspection Hold (Receipt → QC Disposition) | Quarantine bay + supervisor Accept/Reject/Return | 🟡 Medium | P2 | 🔲 Open | TBD |
| WMS-OG-07 | ABC/XYZ Classification-Driven Cycle Count Frequency | A=weekly, B=monthly, C=quarterly auto-schedule | 🟡 Medium | P2 | 🔲 Open | TBD |
| WMS-OG-08 | RF / Mobile Scanner Optimized UI (One-Task-at-a-Time) | Purpose-built mobile screens for handheld scanners | 🟡 Medium | P2 | 🔲 Open | TBD |
| WMS-OG-09 | Labor Standards (ELS) vs Actual SPH Productivity | Engineered time-per-task standard comparison | 🟡 Medium | P2 | 🔲 Open | TBD |
| WMS-OG-10 | Task Interleaving (Combine Putaway into Pick Route) | Eliminate empty-travel legs by blending task types | 🟡 Medium | P2 | 🔲 Open | TBD |
| WMS-OG-11 | Slotting Weight/Cube Constraints (Ergonomic Bin Assignment) | Heavy items to floor bins; size-matched bin face | 🟢 Low | P3 | 🔲 Open | TBD |
| WMS-OG-12 | Count Variance Approval Threshold (Second-Count + Supervisor) | Variances above threshold require verification before adjustment | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 38: Workforce Rewards

**Oracle Equivalent:** Oracle Fusion Global Payroll / Compensation

**Audit Note:** ⚠️ Scoped "Level-1 only"; Payslip PDF listed as future Next Step

**Gaps:** 🔴 4 High · 🟡 6 Medium · 🟢 2 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| PAY-OG-01 | Multi-Country Legislative Data Groups (UK/EU/APAC Payroll) | Country-specific tax tables and statutory deductions | 🔴 High | P1 | 🔲 Open | TBD |
| PAY-OG-02 | Payroll Costing — Element-Level GL Distribution | Salary expense split by cost center per pay element | 🔴 High | P1 | 🔲 Open | TBD |
| PAY-OG-03 | Statutory Payment File Generation (ACH / BACS / SEPA XML) | Country-specific bank payment output file | 🔴 High | P1 | 🔲 Open | TBD |
| PAY-OG-04 | Payslip PDF Generation — Self-Admitted Future (Analysis Doc) | Downloadable payslip with YTD and employer contributions | 🔴 High | P1 | 🔲 Open | TBD |
| PAY-OG-05 | Merit Matrix + Compensation Planning Worksheets | Manager worksheet with compa-ratio and merit %-recommendation | 🟡 Medium | P2 | 🔲 Open | TBD |
| PAY-OG-06 | Compensation Band / Grade-Range Enforcement | Salary outside grade range triggers override justification | 🟡 Medium | P2 | 🔲 Open | TBD |
| PAY-OG-07 | Multi-Tier Compensation Proposal Approval Chain | Manager → HRBP → Finance approval workflow | 🟡 Medium | P2 | 🔲 Open | TBD |
| PAY-OG-08 | Position Management (Headcount Control per Department) | Block requisition if position is already full | 🟡 Medium | P2 | 🔲 Open | TBD |
| PAY-OG-09 | Retroactive Costing Delta (Prior-Period GL Correction) | Element-level delta adjustments per prior period | 🟡 Medium | P2 | 🔲 Open | TBD |
| PAY-OG-10 | Balance Verification Rules Before Payroll Confirm | Pre-confirm exception report (zero-net-pay, large variance) | 🟡 Medium | P2 | 🔲 Open | TBD |
| PAY-OG-11 | Total Compensation Statement (Salary + Benefits + Equity PDF) | Personalized total rewards statement for employee | 🟢 Low | P3 | 🔲 Open | TBD |
| PAY-OG-12 | Data Access Sets for Payroll (Legal Entity Segregation) | UK payroll admin cannot see US payroll runs | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 39: Recruiting / Talent Acquisition

**Oracle Equivalent:** Oracle Fusion Recruiting Cloud

**Gaps:** 🔴 3 High · 🟡 7 Medium · 🟢 2 Low · **Total: 12**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| REC-OG-01 | EEO / Diversity Compliance Reporting (EEO-1 Report) | EEOC-required demographic data collection + report | 🔴 High | P1 | 🔲 Open | TBD |
| REC-OG-02 | Offer Letter E-Signature (DocuSign / Native) | Signed offer document stored on candidate record | 🔴 High | P1 | 🔲 Open | TBD |
| REC-OG-03 | Background Check Integration (Sterling / Checkr API) | Auto-trigger on offer acceptance; pass/fail back | 🔴 High | P1 | 🔲 Open | TBD |
| REC-OG-04 | GDPR Candidate Purge Schedule (Retention-Based Auto-Anonymize) | Auto-purge rejected candidates after configurable period | 🟡 Medium | P2 | 🔲 Open | TBD |
| REC-OG-05 | Job Board Direct API Posting (LinkedIn / Indeed / Glassdoor) | Post requisitions multi-channel with source attribution | 🟡 Medium | P2 | 🔲 Open | TBD |
| REC-OG-06 | Skills Taxonomy Normalization (Oracle Skills Cloud) | Synonym collapse + competency profile gap scoring | 🟡 Medium | P2 | 🔲 Open | TBD |
| REC-OG-07 | Candidate Self-Scheduling (Interviewer Availability Link) | Candidate selects slot from panel availability | 🟡 Medium | P2 | 🔲 Open | TBD |
| REC-OG-08 | Structured Interview Guide (Competency Scorecard per Stage) | All interviewers use same rating rubric per stage | 🟡 Medium | P2 | 🔲 Open | TBD |
| REC-OG-09 | Staffing Agency / VMS Portal (Agency Submission + Fee) | Agency portal with candidate submission and fee agreement | 🟡 Medium | P2 | 🔲 Open | TBD |
| REC-OG-10 | ITSM Provisioning Integration (ServiceNow / JIRA Ticket) | Auto-create IT provisioning tickets on hire date | 🟡 Medium | P2 | 🔲 Open | TBD |
| REC-OG-11 | Auto-Disqualification via Screening Questions | Mandatory question failure → auto-Disqualified stage | 🟢 Low | P3 | 🔲 Open | TBD |
| REC-OG-12 | Job Alert Subscriptions for Candidates | Email alerts when matching job is posted | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 40: Project Accounting

**Oracle Equivalent:** Oracle Fusion Project Accounting

**Gaps:** 🔴 3 High · 🟡 5 Medium · 🟢 2 Low · **Total: 10**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| PA-OG-01 | Project Revenue Recognition (% Complete EVM / Milestone-Based) | Revenue events posted via SLA independently of billing | 🔴 High | P1 | 🔲 Open | TBD |
| PA-OG-02 | Funding Source Limit Tracking (Hard Cap per Funding Source) | Block billing when funding limit is reached | 🔴 High | P1 | 🔲 Open | TBD |
| PA-OG-03 | Progress Billing (Milestone / % Complete Invoice Generation) | Fixed-price invoice generation on milestone achievement | 🔴 High | P1 | 🔲 Open | TBD |
| PA-OG-04 | Transaction Rejection + Resubmission Workflow | Failed imports go to rejection queue for correction | 🟡 Medium | P2 | 🔲 Open | TBD |
| PA-OG-05 | Cross-Charge Billing (Lend/Borrow Between Organizations) | Cross-charge expenditure + revenue netting at legal entity | 🟡 Medium | P2 | 🔲 Open | TBD |
| PA-OG-06 | Financial Plan Types (Budget Versioning: Approved / Working / Original) | Multiple budget versions with lock and revision workflow | 🟡 Medium | P2 | 🔲 Open | TBD |
| PA-OG-07 | Cost Transfer Accounting (Reversing + Replacement SLA Journals) | SLA audit trail for cost reclassification between projects | 🟡 Medium | P2 | 🔲 Open | TBD |
| PA-OG-08 | Organization-Level Burden Schedule Override | Different G&A rates per org/contract type | 🟡 Medium | P2 | 🔲 Open | TBD |
| PA-OG-09 | Labor Cost-to-Revenue Rate Multiplier (T&M Bill Rate) | Bill rate = cost × multiplier for T&M contracts | 🟢 Low | P3 | 🔲 Open | TBD |
| PA-OG-10 | Asset Cost Grouping (Multi-Line CIP to Single FA Asset) | Consolidate multiple cost lines into one fixed asset | 🟢 Low | P3 | 🔲 Open | TBD |

---

## Module 41: Projects Costing (Additional Detail)

**Oracle Equivalent:** Oracle Fusion Project Costing

**Gaps:** 🔴 3 High · 🟡 5 Medium · 🟢 3 Low · **Total: 11**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Phase | Status | Owner |
|:---|:---|:---|:---:|:---:|:---:|:---|
| PC-OG-01 | Commitment Tracking (Open PO + AP Invoices vs Budget) | Total exposure = Actual + Committed vs Budget | 🔴 High | P1 | 🔲 Open | TBD |
| PC-OG-02 | Resource Plan vs Actual (Named Resource Capacity View) | Planned hours vs timesheet actuals per period | 🔴 High | P1 | 🔲 Open | TBD |
| PC-OG-03 | Budget Exception Alerting (% Threshold Notification) | Alert PM + accountant when cost exceeds budget threshold | 🔴 High | P1 | 🔲 Open | TBD |
| PC-OG-04 | Project Risk Register (Probability × Impact Exposure) | Risk tracking with portfolio-level exposure aggregation | 🟡 Medium | P2 | 🔲 Open | TBD |
| PC-OG-05 | Physical % Complete EVM Method (PM-Entered Independent of Cost) | PM-entered progress separate from cost-based earned value | 🟡 Medium | P2 | 🔲 Open | TBD |
| PC-OG-06 | EAC vs BAC Variance Trend (Estimate at Completion) | EAC trend over time on project status report | 🟡 Medium | P2 | 🔲 Open | TBD |
| PC-OG-07 | Cross-Charge Transfer Price Method (Actual / Negotiated / Burdened) | Method-specific GL entries + cross-charge gain/loss | 🟡 Medium | P2 | 🔲 Open | TBD |
| PC-OG-08 | Rate Schedule Effective Dating (Transaction-Date Rate Selection) | Auto-select rate based on transaction date | 🟡 Medium | P2 | 🔲 Open | TBD |
| PC-OG-09 | WBS Element Type Enforcement (Work Package vs Planning vs Summary) | Only Work Package elements accept cost charges | 🟢 Low | P3 | 🔲 Open | TBD |
| PC-OG-10 | Project Copy from Existing (Create-from-Project with Element Selection) | Copy tasks/resources/budgets/billing rules from existing project | 🟢 Low | P3 | 🔲 Open | TBD |
| PC-OG-11 | Actual vs Standard Cost Burdening Variance (Year-End Reconciliation) | Overhead pool actual vs standard burdening reconciliation | 🟢 Low | P3 | 🔲 Open | TBD |

---

> ✱ Gap IDs marked with ✱ are inline gaps recovered from module narrative sections (previously missing from formal OG registry).

---

## Full Gap Registry — Flat List (All Modules, All Gaps)

> 498 unique Oracle gaps sorted by: Severity → Module Number.

| Gap ID | Module | Feature | Severity | Phase | Type | Status |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| AP-OG-01 | M1 – Accounts Payable | Payment Terms Master Table | 🔴 High | P1 | Formal | 🔲 Open |
| AP-OG-02 | M1 – Accounts Payable | Early Payment Discounts | 🔴 High | P1 | Formal | 🔲 Open |
| AP-OG-03 | M1 – Accounts Payable | Multi-Level Invoice Approval (AME) | 🔴 High | P1 | Formal | 🔲 Open |
| AP-OG-04 | M1 – Accounts Payable | WHT Remittance Invoice to Tax Authority | 🔴 High | P1 | Formal | 🔲 Open |
| AR-OG-01 | M2 – Accounts Receivable | Payment Terms Master Table | 🔴 High | P1 | Formal | 🔲 Open |
| AR-OG-02 | M2 – Accounts Receivable | AutoInvoice Validation Engine | 🔴 High | P1 | Formal | 🔲 Open |
| AR-OG-03 | M2 – Accounts Receivable | Lockbox Auto-Apply Engine | 🔴 High | P1 | Formal | 🔲 Open |
| AR-OG-04 | M2 – Accounts Receivable | FX Revaluation (Open AR Balances) | 🔴 High | P1 | Formal | 🔲 Open |
| BI-OG-01 | M3 – Billing & Revenue Innovation | Tax Jurisdiction + E-Invoicing (ViDA/ZATCA) | 🔴 High | P1 | Formal | 🔲 Open |
| BI-OG-02 | M3 – Billing & Revenue Innovation | Subscription Mid-Period Amendment Proration | 🔴 High | P1 | Formal | 🔲 Open |
| BI-OG-03 | M3 – Billing & Revenue Innovation | Billing Transaction Source Registry | 🔴 High | P1 | Formal | 🔲 Open |
| BI-OG-04 | M3 – Billing & Revenue Innovation | Invoice PDF Template Engine | 🔴 High | P1 | Formal | 🔲 Open |
| CM-OG-01 | M4 – Cash Management | Bank/Branch Hierarchy Registry (BIC Validated) | 🔴 High | P1 | Formal | 🔲 Open |
| CM-OG-02 | M4 – Cash Management | Automated Bank Statement Import (SFTP/API) | 🔴 High | P1 | Formal | 🔲 Open |
| CM-OG-03 | M4 – Cash Management | Reconciliation Sign-Off Workflow (SOX) | 🔴 High | P1 | Formal | 🔲 Open |
| CM-OG-04 | M4 – Cash Management | Cross-Entity Consolidated Cash Position | 🔴 High | P1 | Formal | 🔲 Open |
| CON-OG-01 | M5 – Construction Management | Earned Value Management (BCWS/BCWP/CPI/SPI) | 🔴 High | P1 | Formal | 🔲 Open |
| CON-OG-02 | M5 – Construction Management | Drawing & Document Register (Revision Control) | 🔴 High | P1 | Formal | 🔲 Open |
| CON-OG-03 | M5 – Construction Management | Schedule (Gantt / CPM) Integration | 🔴 High | P1 | Formal | 🔲 Open |
| CON-OG-04 | M5 – Construction Management | Subcontract Invoice vs Pay App Matching | 🔴 High | P1 | Formal | 🔲 Open |
| HR-OG-01 | M6 – Core HR | Payroll Element Entry Integration from Hire | 🔴 High | P1 | Formal | 🔲 Open |
| HR-OG-02 | M6 – Core HR | Absence Management (Accrual + Approval + Payroll) | 🔴 High | P1 | Formal | 🔲 Open |
| HR-OG-03 | M6 – Core HR | BPM Approval Workflow on HR Transactions | 🔴 High | P1 | Formal | 🔲 Open |
| HR-OG-04 | M6 – Core HR | True Date-Track (Date-Effective Row History) | 🔴 High | P1 | Formal | 🔲 Open |
| HR-OG-05 | M6 – Core HR | Compensation Workbench (Merit Cycle) | 🔴 High | P1 | Formal | 🔲 Open |
| CM-MG-OG-01 | M7 – Cost Management | CM-MG-01 | 🔴 High | P1 | Inline ✱ | 🔲 Open |
| CM-MG-OG-02 | M7 – Cost Management | CM-MG-02 | 🔴 High | P1 | Inline ✱ | 🔲 Open |
| CM-MG-OG-03 | M7 – Cost Management | CM-MG-03 | 🔴 High | P1 | Inline ✱ | 🔲 Open |
| CM-MG-OG-04 | M7 – Cost Management | CM-MG-04 | 🔴 High | P1 | Inline ✱ | 🔲 Open |
| CRM-OG-01 | M8 – CRM | Configure-Price-Quote (CPQ) Engine | 🔴 High | P1 | Formal | 🔲 Open |
| CRM-OG-02 | M8 – CRM | B2B Self-Service Commerce Portal | 🔴 High | P1 | Formal | 🔲 Open |
| CRM-OG-03 | M8 – CRM | Subscription Renewal Auto-Opportunity | 🔴 High | P1 | Formal | 🔲 Open |
| EPM-OG-01 | M9 – EPM Planning | ESG / Carbon Planning (Scope 1/2/3) | 🔴 High | P1 | Formal | 🔲 Open |
| EPM-OG-02 | M9 – EPM Planning | Treasury Daily Cash + FX Hedging Plan | 🔴 High | P1 | Formal | 🔲 Open |
| EPM-OG-03 | M9 – EPM Planning | Financial Consolidation / FCCS (CTA, Minority Interest) | 🔴 High | P1 | Formal | 🔲 Open |
| EPM-OG-04 | M9 – EPM Planning | Essbase MOLAP Engine (Block Storage) | 🔴 High | P1 | Formal | 🔲 Open |
| EPM-OG-05 | M9 – EPM Planning | Narrative Reporting (Board-Level Management Reports) | 🔴 High | P1 | Formal | 🔲 Open |
| EPM-OG-06 | M9 – EPM Planning | Hard-Stop Budgetary Control at Transaction | 🔴 High | P1 | Formal | 🔲 Open |
| ESS-OG-01 | M10 – ESS / MSS (HCM Self-Service) | Benefits Open Enrollment Self-Service | 🔴 High | P1 | Formal | 🔲 Open |
| ESS-OG-02 | M10 – ESS / MSS (HCM Self-Service) | HR Help Desk (Employee Service Request) | 🔴 High | P1 | Formal | 🔲 Open |
| ESS-OG-03 | M10 – ESS / MSS (HCM Self-Service) | Total Compensation Statement | 🔴 High | P1 | Formal | 🔲 Open |
| ESS-OG-04 | M10 – ESS / MSS (HCM Self-Service) | My Career & Learning Self-Service | 🔴 High | P1 | Formal | 🔲 Open |
| EXP-OG-01 | M11 – Expense Management | Travel Request & Pre-Authorization | 🔴 High | P1 | Formal | 🔲 Open |
| EXP-OG-02 | M11 – Expense Management | Mileage / GPS Distance Calculation Engine | 🔴 High | P1 | Formal | 🔲 Open |
| FC-OG-01 | M13 – Financial Close | Account Reconciliation Certification Portal | 🔴 High | P1 | Formal | 🔲 Open |
| FC-OG-02 | M13 – Financial Close | Tax Provision Engine (ASC 740 / IAS 12) | 🔴 High | P1 | Formal | 🔲 Open |
| FC-OG-03 | M13 – Financial Close | Disclosure Management / iXBRL Tagging | 🔴 High | P1 | Formal | 🔲 Open |
| FC-OG-04 | M13 – Financial Close | IC Invoice-Level Matching (FCCS AR/AP) | 🔴 High | P1 | Formal | 🔲 Open |
| FC-OG-05 | M13 – Financial Close | Consolidation Logic Completeness Validation | 🔴 High | P1 | Formal | 🔲 Open |
| GL-OG-01 | M14 – General Ledger | FSG Financial Reporting Studio | 🔴 High | P1 | Formal | 🔲 Open |
| GL-OG-02 | M14 – General Ledger | External Tax Engine Integration (Vertex/Avalara) | 🔴 High | P1 | Formal | 🔲 Open |
| HRA-OG-01 | M15 – HR Analytics | EEO-1 / UK Gender Pay Gap Statutory Filing | 🔴 High | P1 | Formal | 🔲 Open |
| HRA-OG-02 | M15 – HR Analytics | Workforce Benchmarking (Radford/Mercer/SHRM) | 🔴 High | P1 | Formal | 🔲 Open |
| HRA-OG-03 | M15 – HR Analytics | Ensemble Attrition Prediction + Explainability | 🔴 High | P1 | Formal | 🔲 Open |
| HRC-OG-01 | M16 – HR Compliance | FCPA / Bribery Act Compliance Training Tracking | 🔴 High | P1 | Formal | 🔲 Open |
| HRC-OG-02 | M16 – HR Compliance | Regulatory Filing Calendar (OSHA/EEO/VETS) | 🔴 High | P1 | Formal | 🔲 Open |
| HRC-OG-03 | M16 – HR Compliance | EEO Charge Response Workflow | 🔴 High | P1 | Formal | 🔲 Open |
| HRC-OG-04 | M16 – HR Compliance | Works Council / Union Obligation Management | 🔴 High | P1 | Formal | 🔲 Open |
| AGIS-OG-01 | M17 – Intercompany Accounting | Full IC Dispute Lifecycle | 🔴 High | P1 | Formal | 🔲 Open |
| AGIS-OG-02 | M17 – Intercompany Accounting | IC Balance Confirmation at Period-End | 🔴 High | P1 | Formal | 🔲 Open |
| AGIS-OG-03 | M17 – Intercompany Accounting | Multilateral Netting Center | 🔴 High | P1 | Formal | 🔲 Open |
| AGIS-OG-04 | M17 – Intercompany Accounting | IC Invoice Mock → Real AR/AP Link | 🔴 High | P1 | Formal | 🔲 Open |
| INV-OG-01 | M18 – Inventory Management | Lot Genealogy / Traceability (Upstream + Downstream) | 🔴 High | P1 | Formal | 🔲 Open |
| INV-OG-02 | M18 – Inventory Management | Quality Inspection & Hold Management at Receipt | 🔴 High | P1 | Formal | 🔲 Open |
| INV-OG-03 | M18 – Inventory Management | Consignment Inventory (Vendor-Owned On-Site) | 🔴 High | P1 | Formal | 🔲 Open |
| INV-OG-04 | M18 – Inventory Management | Physical Inventory Freeze & Variance Report | 🔴 High | P1 | Formal | 🔲 Open |
| INV-OG-05 | M18 – Inventory Management | Catch-Weight / Dual Unit of Measure | 🔴 High | P1 | Formal | 🔲 Open |
| LCM-OG-01 | M19 – Landed Cost Management | Duty Drawback Management | 🔴 High | P1 | Formal | 🔲 Open |
| LCM-OG-02 | M19 – Landed Cost Management | C-TPAT / AEO Supply Chain Compliance | 🔴 High | P1 | Formal | 🔲 Open |
| LEASE-OG-01 | M20 – Lease & Contract Management | Lease Modification & Reassessment | 🔴 High | P1 | Formal | 🔲 Open |
| LEASE-OG-02 | M20 – Lease & Contract Management | AI Clause Extraction (Currently Mock) | 🔴 High | P1 | Formal | 🔲 Open |
| LEASE-OG-03 | M20 – Lease & Contract Management | Sublease Accounting (Intermediate Lessor) | 🔴 High | P1 | Formal | 🔲 Open |
| LEASE-OG-04 | M20 – Lease & Contract Management | Contract Obligation Tracking & Renewal Management | 🔴 High | P1 | Formal | 🔲 Open |
| LMS-OG-01 | M21 – Learning (LMS) | Virtual Classroom (Zoom/Teams) Integration | 🔴 High | P1 | Formal | 🔲 Open |
| LMS-OG-02 | M21 – Learning (LMS) | LinkedIn Learning / Coursera External Content | 🔴 High | P1 | Formal | 🔲 Open |
| LMS-OG-03 | M21 – Learning (LMS) | Regulatory Compliance Reports (SOX/OSHA/FCPA) | 🔴 High | P1 | Formal | 🔲 Open |
| LMS-OG-04 | M21 – Learning (LMS) | External Certification Import (PMP/CPA/etc.) | 🔴 High | P1 | Formal | 🔲 Open |
| EAM-OG-01 | M22 – Maintenance (EAM) | Permit-to-Work (Hot Work, Confined Space, Electrical Isolation) | 🔴 High | P1 | Formal | 🔲 Open |
| EAM-OG-02 | M22 – Maintenance (EAM) | Condition-Based Maintenance (CBM) from IoT Threshold | 🔴 High | P1 | Formal | 🔲 Open |
| EAM-OG-03 | M22 – Maintenance (EAM) | Meter-Based PM Triggers (km / Operating Hours) | 🔴 High | P1 | Formal | 🔲 Open |
| EAM-OG-04 | M22 – Maintenance (EAM) | Asset Criticality Classification (A/B/C) | 🔴 High | P1 | Formal | 🔲 Open |
| MFG-OG-01 | M23 – Manufacturing | Engineering Change Order (ECO) Management | 🔴 High | P1 | Formal | 🔲 Open |
| MFG-OG-02 | M23 – Manufacturing | Outside Processing (Subcontract WO Step) | 🔴 High | P1 | Formal | 🔲 Open |
| MFG-OG-03 | M23 – Manufacturing | Constrained Capacity Planning (ASCP) | 🔴 High | P1 | Formal | 🔲 Open |
| MFG-OG-04 | M23 – Manufacturing | Configure-to-Order / Assemble-to-Order | 🔴 High | P1 | Formal | 🔲 Open |
| MFG-OG-05 | M23 – Manufacturing | Co-Product / By-Product Accounting | 🔴 High | P1 | Formal | 🔲 Open |
| WCOS-OG-01 | M24 – Manufacturing Costing | Actual / FIFO Layer Costing for WIP | 🔴 High | P1 | Formal | 🔲 Open |
| WCOS-OG-02 | M24 – Manufacturing Costing | Lot Cost Tracking (OPM Lot Costing) | 🔴 High | P1 | Formal | 🔲 Open |
| WCOS-OG-03 | M24 – Manufacturing Costing | Inventory Revaluation on Standard Cost Update | 🔴 High | P1 | Formal | 🔲 Open |
| WCOS-OG-04 | M24 – Manufacturing Costing | Actual Overhead Absorption (Rate × Actual Hours) | 🔴 High | P1 | Formal | 🔲 Open |
| MDM-OG-01 | M25 – Master Data Management | D&B / Experian External Enrichment | 🔴 High | P1 | Formal | 🔲 Open |
| MDM-OG-02 | M25 – Master Data Management | Real-Time Address Validation (Loqate / Melissa Data) | 🔴 High | P1 | Formal | 🔲 Open |
| MDM-OG-03 | M25 – Master Data Management | AI Anomaly Detection (Bank Account Change Alert, etc.) | 🔴 High | P1 | Formal | 🔲 Open |
| MDM-OG-04 | M25 – Master Data Management | Item Revision Control (Record History with Effectivity Date) | 🔴 High | P1 | Formal | 🔲 Open |
| PBF-OG-01 | M26 – Planning, Budgeting & Forecasting | Plan Accuracy Dependency: Consolidation 60% Mocked | 🔴 High | P1 | Formal | 🔲 Open |
| PBF-OG-02 | M26 – Planning, Budgeting & Forecasting | IC Elimination Plan ≠ Close IC Elimination (Mock IC) | 🔴 High | P1 | Formal | 🔲 Open |
| PBF-OG-03 | M26 – Planning, Budgeting & Forecasting | IC Cash Netting Not in Treasury Plan | 🔴 High | P1 | Formal | 🔲 Open |
| PBF-OG-04 | M26 – Planning, Budgeting & Forecasting | EPBCS Sandbox Environment | 🔴 High | P1 | Formal | 🔲 Open |
| PPM-OG-03 | M27 – Project Portfolio Management | Stage-Gate Review (Concept→Plan→Execute→Close) | 🔴 High | P1 | Formal | 🔲 Open |
| PPM-OG-04 | M27 – Project Portfolio Management | Milestone-Based Billing | 🔴 High | P1 | Formal | 🔲 Open |
| PPM-OG-05 | M27 – Project Portfolio Management | Employee Timesheet → PPM Labor Auto-Flow | 🔴 High | P1 | Formal | 🔲 Open |
| PPM-OG-06 | M27 – Project Portfolio Management | Portfolio-Level Resource Demand vs Supply | 🔴 High | P1 | Formal | 🔲 Open |
| PRO-OG-01 | M28 – Procurement & SCM | Procurement Contract Lifecycle Management | 🔴 High | P1 | Formal | 🔲 Open |
| PRO-OG-02 | M28 – Procurement & SCM | Supplier Qualification Management (SQM / AVL) | 🔴 High | P1 | Formal | 🔲 Open |
| PRO-OG-03 | M28 – Procurement & SCM | AI Spend Classification (UNSPSC / Taxonomy ML) | 🔴 High | P1 | Formal | 🔲 Open |
| PRO-OG-04 | M28 – Procurement & SCM | Punchout Catalog Integration (Grainger, Dell, etc.) | 🔴 High | P1 | Formal | 🔲 Open |
| RMCS-OG-05 | M29 – Revenue Management | Revenue Assurance Dashboard (Self-Admitted Shell) | 🔴 High | P1 | Formal | 🔲 Open |
| RMCS-OG-06 | M29 – Revenue Management | Revenue Forecasting (Self-Admitted Placeholder) | 🔴 High | P1 | Formal | 🔲 Open |
| RMCS-OG-07 | M29 – Revenue Management | GL Subledger Reconciliation Report (Self-Admitted Missing) | 🔴 High | P1 | Formal | 🔲 Open |
| SLA-OG-01 | M30 – Subledger Accounting | Automated Accounting Scheduler (ESS Job) | 🔴 High | P1 | Formal | 🔲 Open |
| SUP-OG-01 | M31 – Supplier Portal & PCM | Contract Obligation Tracking (Quarterly Reports, Due Dates) | 🔴 High | P1 | Formal | 🔲 Open |
| SUP-OG-02 | M31 – Supplier Portal & PCM | Certification Expiry Alerting + PO Block | 🔴 High | P1 | Formal | 🔲 Open |
| SUP-OG-03 | M31 – Supplier Portal & PCM | Qualification Questionnaire Weighted Scoring | 🔴 High | P1 | Formal | 🔲 Open |
| TAL-OG-01 | M32 – Talent Management | Cascading Goals (Division → Department → Individual) | 🔴 High | P1 | Formal | 🔲 Open |
| TAL-OG-02 | M32 – Talent Management | GDPR Candidate Data Purge (Retention Policy) | 🔴 High | P1 | Formal | 🔲 Open |
| TAL-OG-03 | M32 – Talent Management | Nine-Box Grid (Performance vs Potential Placement) | 🔴 High | P1 | Formal | 🔲 Open |
| TAL-OG-04 | M32 – Talent Management | Learning Path with Prerequisite Enforcement | 🔴 High | P1 | Formal | 🔲 Open |
| TAX-OG-01 | M33 – Tax Engine | e-Invoicing Compliance (ZATCA / SDI / GST IRN) | 🔴 High | P1 | Formal | 🔲 Open |
| TAX-OG-02 | M33 – Tax Engine | Withholding Tax (TDS, 1099, WHT Certificates) | 🔴 High | P1 | Formal | 🔲 Open |
| TAX-OG-03 | M33 – Tax Engine | GL Reconciliation — Self-Admitted Simulated | 🔴 High | P1 | Formal | 🔲 Open |
| WFM-OG-01 | M34 – Time & Labor | FLSA/WTD Compliance Enforcement (Multi-Jurisdiction OT) | 🔴 High | P1 | Formal | 🔲 Open |
| WFM-OG-02 | M34 – Time & Labor | Absence Management (Leave Request + Approval Workflow) | 🔴 High | P1 | Formal | 🔲 Open |
| WFM-OG-03 | M34 – Time & Labor | AI Predictive Scheduling — Self-Admitted Incomplete (Phase 33) | 🔴 High | P1 | Formal | 🔲 Open |
| TMS-OG-01 | M35 – Transportation & Logistics | Electronic Load Tender (EDI 204) + Carrier Accept/Reject (EDI 990) | 🔴 High | P1 | Formal | 🔲 Open |
| TMS-OG-02 | M35 – Transportation & Logistics | Carrier EDI 214 / API Tracking Integration | 🔴 High | P1 | Formal | 🔲 Open |
| TMS-OG-03 | M35 – Transportation & Logistics | Multi-Modal Transport Mode Selection (TL/LTL/Air/Ocean/Rail) | 🔴 High | P1 | Formal | 🔲 Open |
| TRS-OG-01 | M36 – Treasury & Cash Management | IFRS 9 / ASC 815 Hedge Effectiveness Testing | 🔴 High | P1 | Formal | 🔲 Open |
| TRS-OG-02 | M36 – Treasury & Cash Management | Bank Statement Auto-Import (BAI2 / SWIFT MT940) | 🔴 High | P1 | Formal | 🔲 Open |
| TRS-OG-03 | M36 – Treasury & Cash Management | Debt Covenant Monitoring (Leverage / Interest Coverage) | 🔴 High | P1 | Formal | 🔲 Open |
| TRS-OG-04 | M36 – Treasury & Cash Management | Sanctions Screening (OFAC/EU/UN) on Payments | 🔴 High | P1 | Formal | 🔲 Open |
| WMS-OG-01 | M37 – Warehouse Management (WMS) | Directed Putaway Rule Engine (Rule Priority Sequence) | 🔴 High | P1 | Formal | 🔲 Open |
| WMS-OG-02 | M37 – Warehouse Management (WMS) | Yard Management (Dock Appointments, Trailer Staging) | 🔴 High | P1 | Formal | 🔲 Open |
| WMS-OG-03 | M37 – Warehouse Management (WMS) | Carrier Manifesting + Label Printing (ZPL/DPL) | 🔴 High | P1 | Formal | 🔲 Open |
| PAY-OG-01 | M38 – Workforce Rewards | Multi-Country Legislative Data Groups (UK/EU/APAC Payroll) | 🔴 High | P1 | Formal | 🔲 Open |
| PAY-OG-02 | M38 – Workforce Rewards | Payroll Costing — Element-Level GL Distribution | 🔴 High | P1 | Formal | 🔲 Open |
| PAY-OG-03 | M38 – Workforce Rewards | Statutory Payment File Generation (ACH / BACS / SEPA XML) | 🔴 High | P1 | Formal | 🔲 Open |
| PAY-OG-04 | M38 – Workforce Rewards | Payslip PDF Generation — Self-Admitted Future (Analysis Doc) | 🔴 High | P1 | Formal | 🔲 Open |
| REC-OG-01 | M39 – Recruiting / Talent Acquisition | EEO / Diversity Compliance Reporting (EEO-1 Report) | 🔴 High | P1 | Formal | 🔲 Open |
| REC-OG-02 | M39 – Recruiting / Talent Acquisition | Offer Letter E-Signature (DocuSign / Native) | 🔴 High | P1 | Formal | 🔲 Open |
| REC-OG-03 | M39 – Recruiting / Talent Acquisition | Background Check Integration (Sterling / Checkr API) | 🔴 High | P1 | Formal | 🔲 Open |
| PA-OG-01 | M40 – Project Accounting | Project Revenue Recognition (% Complete EVM / Milestone-Based) | 🔴 High | P1 | Formal | 🔲 Open |
| PA-OG-02 | M40 – Project Accounting | Funding Source Limit Tracking (Hard Cap per Funding Source) | 🔴 High | P1 | Formal | 🔲 Open |
| PA-OG-03 | M40 – Project Accounting | Progress Billing (Milestone / % Complete Invoice Generation) | 🔴 High | P1 | Formal | 🔲 Open |
| PC-OG-01 | M41 – Projects Costing (Additional Detail) | Commitment Tracking (Open PO + AP Invoices vs Budget) | 🔴 High | P1 | Formal | 🔲 Open |
| PC-OG-02 | M41 – Projects Costing (Additional Detail) | Resource Plan vs Actual (Named Resource Capacity View) | 🔴 High | P1 | Formal | 🔲 Open |
| PC-OG-03 | M41 – Projects Costing (Additional Detail) | Budget Exception Alerting (% Threshold Notification) | 🔴 High | P1 | Formal | 🔲 Open |
| AP-OG-05 | M1 – Accounts Payable | 4-Way Matching (Inspection Acceptance) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-06 | M1 – Accounts Payable | Positive Pay File | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-07 | M1 – Accounts Payable | Stop Payment / Reissue Check | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-08 | M1 – Accounts Payable | Supplier Statement Reconciliation | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-09 | M1 – Accounts Payable | Recurring Invoice Templates | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-10 | M1 – Accounts Payable | Installment Payment Schedules | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-11 | M1 – Accounts Payable | Supplier Balance Inquiry Workbench | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-12 | M1 – Accounts Payable | AP Trial Balance Report | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-13 | M1 – Accounts Payable | Durable Payment Queue (BullMQ) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-14 | M1 – Accounts Payable | EDI 810 Invoice Import | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-15 | M1 – Accounts Payable | SoD at AP Level (Entry vs Approval) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-05 | M2 – Accounts Receivable | Customer Statement Generation | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-06 | M2 – Accounts Receivable | Interest Invoice (Finance Charges) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-07 | M2 – Accounts Receivable | On-Account Receipts | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-08 | M2 – Accounts Receivable | Cross-Currency Receipt + Realized Gain/Loss | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-09 | M2 – Accounts Receivable | Dispute → Credit Memo/Write-off Workflow | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-10 | M2 – Accounts Receivable | Credit Bureau Integration (D&B/Experian) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-11 | M2 – Accounts Receivable | Promise-to-Pay Recording | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-12 | M2 – Accounts Receivable | Collector Territory Assignment Rules | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-13 | M2 – Accounts Receivable | AR Trial Balance / AR-GL Reconciliation | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-14 | M2 – Accounts Receivable | Durable Async Queue (BullMQ) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-15 | M2 – Accounts Receivable | Email Delivery Integration (SMTP/SendGrid) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-16 | M2 – Accounts Receivable | Mass Adjustment Batch | 🟡 Medium | P2 | Formal | 🔲 Open |
| AR-OG-17 | M2 – Accounts Receivable | Event-Based Revenue (Milestones/Usage) | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-05 | M3 – Billing & Revenue Innovation | Consolidated Invoice (Group by Customer/Period) | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-06 | M3 – Billing & Revenue Innovation | Billing Schedule Calendar | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-07 | M3 – Billing & Revenue Innovation | Tiered (Volume-Based) Pricing | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-08 | M3 – Billing & Revenue Innovation | Usage-Based Revenue Recognition | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-09 | M3 – Billing & Revenue Innovation | Real-Time Credit Exposure Calculation | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-10 | M3 – Billing & Revenue Innovation | Daily FX Rate Feed Integration | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-11 | M3 – Billing & Revenue Innovation | Configurable Approval Matrix | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-12 | M3 – Billing & Revenue Innovation | Billing-Period Accrual Auto-Reversal | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-13 | M3 – Billing & Revenue Innovation | Dunning Auto-Escalation from Billing | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-14 | M3 – Billing & Revenue Innovation | Bill-and-Hold / Deferred Revenue UI | 🟡 Medium | P2 | Formal | 🔲 Open |
| BI-OG-15 | M3 – Billing & Revenue Innovation | Exemption Certificate Management | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-OG-05 | M4 – Cash Management | Actual vs Forecast Variance Analysis | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-OG-06 | M4 – Cash Management | Reconciliation Exception Reason Codes + Write-Off | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-OG-07 | M4 – Cash Management | Inter-Bank Transfer (Internal Movement) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-OG-08 | M4 – Cash Management | Manual External Cash Transaction Entry | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-OG-09 | M4 – Cash Management | Notional (Cross-Currency) Cash Pooling | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-OG-10 | M4 – Cash Management | Revaluation History Log + Reverse Revaluation | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-OG-11 | M4 – Cash Management | Undo-Match with SLA Reversal | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-OG-12 | M4 – Cash Management | Forecast Payroll/Tax/CapEx Source Integration | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-OG-13 | M4 – Cash Management | Natural Language Cash Query (AI) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CON-OG-05 | M5 – Construction Management | PCO → COR → CO Three-Step Pipeline | 🟡 Medium | P2 | Formal | 🔲 Open |
| CON-OG-06 | M5 – Construction Management | Variable Retention Schedule + Release Invoice | 🟡 Medium | P2 | Formal | 🔲 Open |
| CON-OG-07 | M5 – Construction Management | Revenue Recognition Method Toggle (% cost vs completion) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CON-OG-08 | M5 – Construction Management | RAMS/SWMS Health & Safety Compliance Gate | 🟡 Medium | P2 | Formal | 🔲 Open |
| CON-OG-09 | M5 – Construction Management | RFI Transmittal Package (Multi-Party Ball-in-Court) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CON-OG-10 | M5 – Construction Management | Claims Quantum Calculation (Prolongation Costs) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CON-OG-11 | M5 – Construction Management | GL Code from Cost Code Derivation | 🟡 Medium | P2 | Formal | 🔲 Open |
| HR-OG-06 | M6 – Core HR | Dual Employment (Multi-Assignment) | 🟡 Medium | P2 | Formal | 🔲 Open |
| HR-OG-07 | M6 – Core HR | PSU → TRU Hierarchy for Statutory Tax Reporting | 🟡 Medium | P2 | Formal | 🔲 Open |
| HR-OG-08 | M6 – Core HR | Grade Rate + Grade Ladder (Salary Benchmarking) | 🟡 Medium | P2 | Formal | 🔲 Open |
| HR-OG-09 | M6 – Core HR | "My Team" Manager Self-Service View | 🟡 Medium | P2 | Formal | 🔲 Open |
| HR-OG-10 | M6 – Core HR | Document Expiry Auto-Notification | 🟡 Medium | P2 | Formal | 🔲 Open |
| HR-OG-11 | M6 – Core HR | Journey Task Due-Date Escalation + Reminders | 🟡 Medium | P2 | Formal | 🔲 Open |
| HR-OG-12 | M6 – Core HR | Visual Org Chart Navigation (Workforce Directory) | 🟡 Medium | P2 | Formal | 🔲 Open |
| HR-OG-13 | M6 – Core HR | Pre-Import Validation Report (HDL) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CM-MG-OG-05 | M7 – Cost Management | CM-MG-05 | 🟡 Medium | P2 | Inline ✱ | 🔲 Open |
| CM-MG-OG-06 | M7 – Cost Management | CM-MG-06 | 🟡 Medium | P2 | Inline ✱ | 🔲 Open |
| CM-MG-OG-07 | M7 – Cost Management | CM-MG-07 | 🟡 Medium | P2 | Inline ✱ | 🔲 Open |
| CM-MG-OG-08 | M7 – Cost Management | CM-MG-08 | 🟡 Medium | P2 | Inline ✱ | 🔲 Open |
| CM-MG-OG-09 | M7 – Cost Management | CM-MG-09 | 🟡 Medium | P2 | Inline ✱ | 🔲 Open |
| CM-MG-OG-10 | M7 – Cost Management | CM-MG-10 | 🟡 Medium | P2 | Inline ✱ | 🔲 Open |
| CM-MG-OG-11 | M7 – Cost Management | CM-MG-11 | 🟡 Medium | P2 | Inline ✱ | 🔲 Open |
| CRM-OG-04 | M8 – CRM | AI-Adjusted Sales Forecast (Activity-Based) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CRM-OG-05 | M8 – CRM | SLA Milestone/Breach Escalation Engine | 🟡 Medium | P2 | Formal | 🔲 Open |
| CRM-OG-06 | M8 – CRM | Contract Obligation + Redline Management | 🟡 Medium | P2 | Formal | 🔲 Open |
| CRM-OG-07 | M8 – CRM | Partner MDF (Market Development Funds) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CRM-OG-08 | M8 – CRM | Quota Cascade (Country → Region → Rep) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CRM-OG-09 | M8 – CRM | Territory Alignment Workbench | 🟡 Medium | P2 | Formal | 🔲 Open |
| CRM-OG-10 | M8 – CRM | Revenue Attribution (Multi-Touch) | 🟡 Medium | P2 | Formal | 🔲 Open |
| CRM-OG-11 | M8 – CRM | Field-Level Security + Visibility Rules | 🟡 Medium | P2 | Formal | 🔲 Open |
| CRM-OG-12 | M8 – CRM | D&B Account Enrichment + Hierarchy Sync | 🟡 Medium | P2 | Formal | 🔲 Open |
| EPM-OG-07 | M9 – EPM Planning | Monte Carlo Simulation + Tornado Chart | 🟡 Medium | P2 | Formal | 🔲 Open |
| EPM-OG-08 | M9 – EPM Planning | Weekly Rolling Forecast + Daily Sales Flash | 🟡 Medium | P2 | Formal | 🔲 Open |
| EPM-OG-09 | M9 – EPM Planning | Direct Method Daily Cash Flow Forecasting | 🟡 Medium | P2 | Formal | 🔲 Open |
| EPM-OG-10 | M9 – EPM Planning | M&A Entity What-If (Mid-Year Consolidation) | 🟡 Medium | P2 | Formal | 🔲 Open |
| EPM-OG-11 | M9 – EPM Planning | Structured Task List + Cell-Level Commentary | 🟡 Medium | P2 | Formal | 🔲 Open |
| EPM-OG-12 | M9 – EPM Planning | IC Matching Discrepancy Alert | 🟡 Medium | P2 | Formal | 🔲 Open |
| EPM-OG-13 | M9 – EPM Planning | Accelerated Depreciation + Lease vs Buy Analysis | 🟡 Medium | P2 | Formal | 🔲 Open |
| ESS-OG-05 | M10 – ESS / MSS (HCM Self-Service) | Life Event Configuration | 🟡 Medium | P2 | Formal | 🔲 Open |
| ESS-OG-06 | M10 – ESS / MSS (HCM Self-Service) | Action-Specific Delegation | 🟡 Medium | P2 | Formal | 🔲 Open |
| ESS-OG-07 | M10 – ESS / MSS (HCM Self-Service) | Field-Level Salary Masking | 🟡 Medium | P2 | Formal | 🔲 Open |
| ESS-OG-08 | M10 – ESS / MSS (HCM Self-Service) | Configurable Escalation Threshold per Transaction | 🟡 Medium | P2 | Formal | 🔲 Open |
| ESS-OG-09 | M10 – ESS / MSS (HCM Self-Service) | Approval Chain Visualization | 🟡 Medium | P2 | Formal | 🔲 Open |
| ESS-OG-10 | M10 – ESS / MSS (HCM Self-Service) | Multi-Currency Expat Payslip | 🟡 Medium | P2 | Formal | 🔲 Open |
| ESS-OG-11 | M10 – ESS / MSS (HCM Self-Service) | National ID Validation by Country | 🟡 Medium | P2 | Formal | 🔲 Open |
| ESS-OG-12 | M10 – ESS / MSS (HCM Self-Service) | e-Signature on Statutory Forms | 🟡 Medium | P2 | Formal | 🔲 Open |
| EXP-OG-03 | M11 – Expense Management | Per-Diem Policy Engine (GSA/HMRC Rates) | 🟡 Medium | P2 | Formal | 🔲 Open |
| EXP-OG-04 | M11 – Expense Management | Project Cost Integration (Billable Flag) | 🟡 Medium | P2 | Formal | 🔲 Open |
| EXP-OG-05 | M11 – Expense Management | Period-End Expense Accrual | 🟡 Medium | P2 | Formal | 🔲 Open |
| EXP-OG-06 | M11 – Expense Management | Cost Center Owner Additional Approval | 🟡 Medium | P2 | Formal | 🔲 Open |
| EXP-OG-07 | M11 – Expense Management | Automated Auditor Queue Routing | 🟡 Medium | P2 | Formal | 🔲 Open |
| EXP-OG-08 | M11 – Expense Management | VAT Reclaim Filing Integration | 🟡 Medium | P2 | Formal | 🔲 Open |
| EXP-OG-09 | M11 – Expense Management | Hotel Folio Line-Item OCR | 🟡 Medium | P2 | Formal | 🔲 Open |
| EXP-OG-10 | M11 – Expense Management | In-Flight Policy Warning (Real-Time) | 🟡 Medium | P2 | Formal | 🔲 Open |
| FC-OG-06 | M13 – Financial Close | Auto-Reconciliation Engine (Self-Admitted) | 🟡 Medium | P2 | Formal | 🔲 Open |
| FC-OG-07 | M13 – Financial Close | Ownership Percentage & Minority Interest Config | 🟡 Medium | P2 | Formal | 🔲 Open |
| FC-OG-08 | M13 – Financial Close | External Task Preparer/Reviewer Assignment | 🟡 Medium | P2 | Formal | 🔲 Open |
| FC-OG-09 | M13 – Financial Close | Revaluation Grouping by Exposure | 🟡 Medium | P2 | Formal | 🔲 Open |
| GL-OG-03 | M14 – General Ledger | Segment Value Security | 🟡 Medium | P2 | Formal | 🔲 Open |
| GL-OG-04 | M14 – General Ledger | Oracle Accounting Hub (External System Journals) | 🟡 Medium | P2 | Formal | 🔲 Open |
| GL-OG-05 | M14 – General Ledger | Secondary Ledger (IFRS-to-GAAP Adjustment) | 🟡 Medium | P2 | Formal | 🔲 Open |
| GL-OG-06 | M14 – General Ledger | Recursive Allocations (Pool-to-Pool) | 🟡 Medium | P2 | Formal | 🔲 Open |
| GL-OG-07 | M14 – General Ledger | Remeasurement (FASB 52) + IAS 29 Hyperinflation | 🟡 Medium | P2 | Formal | 🔲 Open |
| GL-OG-08 | M14 – General Ledger | Position-Based Budgeting | 🟡 Medium | P2 | Formal | 🔲 Open |
| GL-OG-09 | M14 – General Ledger | DAS Enforcement Completeness | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRA-OG-04 | M15 – HR Analytics | Natural Language Analytics Query | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRA-OG-05 | M15 – HR Analytics | Nine-Box Performance-Potential Grid + Reporting | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRA-OG-06 | M15 – HR Analytics | Pre-Built HR Analysis Library (200+ OTBI) | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRA-OG-07 | M15 – HR Analytics | Cell-Level Suppression for k-Anonymity | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRA-OG-08 | M15 – HR Analytics | Calculated Columns in Report Builder | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRA-OG-09 | M15 – HR Analytics | Conditional Formatting (Red/Yellow/Green thresholds) | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRA-OG-10 | M15 – HR Analytics | Event-Driven Snapshot Trigger | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRC-OG-05 | M16 – HR Compliance | Cross-Border Data Transfer Compliance | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRC-OG-06 | M16 – HR Compliance | Privacy Impact Assessment (DPIA) Workflow | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRC-OG-07 | M16 – HR Compliance | SoD Simulation Before Role Assignment | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRC-OG-08 | M16 – HR Compliance | Cross-Application SoD (ERP + HCM + Procurement) | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRC-OG-09 | M16 – HR Compliance | Erasure Impact Map + Signed Certificate | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRC-OG-10 | M16 – HR Compliance | Legislative Content Auto-Update (Oracle Quarterly) | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRC-OG-11 | M16 – HR Compliance | Risk Model Versioning + Score Audit | 🟡 Medium | P2 | Formal | 🔲 Open |
| HRC-OG-12 | M16 – HR Compliance | Consent Purpose Limitation Enforcement | 🟡 Medium | P2 | Formal | 🔲 Open |
| AGIS-OG-05 | M17 – Intercompany Accounting | Multi-Currency IC Settlement | 🟡 Medium | P2 | Formal | 🔲 Open |
| AGIS-OG-06 | M17 – Intercompany Accounting | Arm's-Length / TNMM / PSM Transfer Pricing Methods | 🟡 Medium | P2 | Formal | 🔲 Open |
| AGIS-OG-07 | M17 – Intercompany Accounting | IC Account Auto-Derivation (by LE pair) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AGIS-OG-08 | M17 – Intercompany Accounting | Statistical Unit Allocation Basis (Headcount/Floor Space) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AGIS-OG-09 | M17 – Intercompany Accounting | Recurring Allocation Schedule (Month-End Auto-Run) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AGIS-OG-10 | M17 – Intercompany Accounting | Netting Agreement Management | 🟡 Medium | P2 | Formal | 🔲 Open |
| AGIS-OG-11 | M17 – Intercompany Accounting | Predictive Dispute Likelihood Scoring | 🟡 Medium | P2 | Formal | 🔲 Open |
| INV-OG-06 | M18 – Inventory Management | Item Revision Control (Engineering Change) | 🟡 Medium | P2 | Formal | 🔲 Open |
| INV-OG-07 | M18 – Inventory Management | LIFO Costing Layer | 🟡 Medium | P2 | Formal | 🔲 Open |
| INV-OG-08 | M18 – Inventory Management | Standard Cost + Purchase Price Variance (PPV) | 🟡 Medium | P2 | Formal | 🔲 Open |
| INV-OG-09 | M18 – Inventory Management | ABC Classification–Driven Count Frequency | 🟡 Medium | P2 | Formal | 🔲 Open |
| INV-OG-10 | M18 – Inventory Management | Inter-Organization Transit Inventory | 🟡 Medium | P2 | Formal | 🔲 Open |
| INV-OG-11 | M18 – Inventory Management | Lot Expiration Enforcement (FEFO Picking) | 🟡 Medium | P2 | Formal | 🔲 Open |
| INV-OG-12 | M18 – Inventory Management | Supply Chain ATP (Multi-Org + In-Transit) | 🟡 Medium | P2 | Formal | 🔲 Open |
| LCM-OG-03 | M19 – Landed Cost Management | Customs Tariff HS Code Linkage + Duty Auto-Calc | 🟡 Medium | P2 | Formal | 🔲 Open |
| LCM-OG-04 | M19 – Landed Cost Management | Retroactive Cost Reallocation (Post-Consumption) | 🟡 Medium | P2 | Formal | 🔲 Open |
| LCM-OG-05 | M19 – Landed Cost Management | Broker Invoice 3-Way Match + EDI 810 | 🟡 Medium | P2 | Formal | 🔲 Open |
| LCM-OG-06 | M19 – Landed Cost Management | Multi-Leg Routing with Per-Leg Charges | 🟡 Medium | P2 | Formal | 🔲 Open |
| LCM-OG-07 | M19 – Landed Cost Management | Partial Period Accrual (Cross-Period Shipments) | 🟡 Medium | P2 | Formal | 🔲 Open |
| LCM-OG-08 | M19 – Landed Cost Management | Tolerance-Based Approval Escalation | 🟡 Medium | P2 | Formal | 🔲 Open |
| LCM-OG-09 | M19 – Landed Cost Management | Item-Level Perpetual Cost Update (FIFO/Avg Layer) | 🟡 Medium | P2 | Formal | 🔲 Open |
| LCM-OG-10 | M19 – Landed Cost Management | Trade Lane AI (Seasonal + Port Congestion Pricing) | 🟡 Medium | P2 | Formal | 🔲 Open |
| LEASE-OG-05 | M20 – Lease & Contract Management | Embedded Lease Identification in Service Contracts | 🟡 Medium | P2 | Formal | 🔲 Open |
| LEASE-OG-06 | M20 – Lease & Contract Management | Variable Lease Payment Handling (Usage/Index) | 🟡 Medium | P2 | Formal | 🔲 Open |
| LEASE-OG-07 | M20 – Lease & Contract Management | ASC 842 ROU Asset & Liability Rollforward Report | 🟡 Medium | P2 | Formal | 🔲 Open |
| LEASE-OG-08 | M20 – Lease & Contract Management | Parallel Legal + Finance Approval for Commitments | 🟡 Medium | P2 | Formal | 🔲 Open |
| LEASE-OG-09 | M20 – Lease & Contract Management | Amendment Impact Analysis (Before Confirmation) | 🟡 Medium | P2 | Formal | 🔲 Open |
| LEASE-OG-10 | M20 – Lease & Contract Management | SLA Rule Configurability per Asset Class | 🟡 Medium | P2 | Formal | 🔲 Open |
| LEASE-OG-11 | M20 – Lease & Contract Management | ROU Asset Auto-Derecognition on Termination | 🟡 Medium | P2 | Formal | 🔲 Open |
| LMS-OG-05 | M21 – Learning (LMS) | Question Bank with Randomization | 🟡 Medium | P2 | Formal | 🔲 Open |
| LMS-OG-06 | M21 – Learning (LMS) | Eligibility Profile Enforcement at Enrollment | 🟡 Medium | P2 | Formal | 🔲 Open |
| LMS-OG-07 | M21 – Learning (LMS) | AICC / xAPI (Tin Can) Content Support | 🟡 Medium | P2 | Formal | 🔲 Open |
| LMS-OG-08 | M21 – Learning (LMS) | Adaptive Learning Path (Assessment-Driven Sequence) | 🟡 Medium | P2 | Formal | 🔲 Open |
| LMS-OG-09 | M21 – Learning (LMS) | Skills-Gap–Driven Recommendation (Job Profile Delta) | 🟡 Medium | P2 | Formal | 🔲 Open |
| LMS-OG-10 | M21 – Learning (LMS) | Team Learning Budget Management | 🟡 Medium | P2 | Formal | 🔲 Open |
| LMS-OG-11 | M21 – Learning (LMS) | External Vendor Records + Procurement Integration | 🟡 Medium | P2 | Formal | 🔲 Open |
| EAM-OG-05 | M22 – Maintenance (EAM) | Skill-Matched Auto-Assignment on WO | 🟡 Medium | P2 | Formal | 🔲 Open |
| EAM-OG-06 | M22 – Maintenance (EAM) | Failed Inspection → Auto Corrective WO | 🟡 Medium | P2 | Formal | 🔲 Open |
| EAM-OG-07 | M22 – Maintenance (EAM) | FMEA / RCM Library (Cause-Failure-Remedy Triples) | 🟡 Medium | P2 | Formal | 🔲 Open |
| EAM-OG-08 | M22 – Maintenance (EAM) | GIS / Spatial Asset Map (Floor Plan View) | 🟡 Medium | P2 | Formal | 🔲 Open |
| EAM-OG-09 | M22 – Maintenance (EAM) | BOM-Driven Parts Pre-Population on WO | 🟡 Medium | P2 | Formal | 🔲 Open |
| EAM-OG-10 | M22 – Maintenance (EAM) | Parts Reservation for Future Scheduled WOs | 🟡 Medium | P2 | Formal | 🔲 Open |
| EAM-OG-11 | M22 – Maintenance (EAM) | Budget vs Actual Variance per Asset + LCD | 🟡 Medium | P2 | Formal | 🔲 Open |
| EAM-OG-12 | M22 – Maintenance (EAM) | NFC / Barcode Asset Identification on Mobile | 🟡 Medium | P2 | Formal | 🔲 Open |
| MFG-OG-06 | M23 – Manufacturing | Shop Floor Control (Queue + Scan Dispatch) | 🟡 Medium | P2 | Formal | 🔲 Open |
| MFG-OG-07 | M23 – Manufacturing | MES Integration (OPC-UA / REST to Shop Machines) | 🟡 Medium | P2 | Formal | 🔲 Open |
| MFG-OG-08 | M23 – Manufacturing | In-Process Quality Checkpoints (Block Next Operation) | 🟡 Medium | P2 | Formal | 🔲 Open |
| MFG-OG-09 | M23 – Manufacturing | Specification Management (UCL/LCL Auto Pass/Fail) | 🟡 Medium | P2 | Formal | 🔲 Open |
| MFG-OG-10 | M23 – Manufacturing | Recall Forward-Trace from Ingredient Lot | 🟡 Medium | P2 | Formal | 🔲 Open |
| MFG-OG-11 | M23 – Manufacturing | Resource (Machine/Labor) Capacity Management | 🟡 Medium | P2 | Formal | 🔲 Open |
| MFG-OG-12 | M23 – Manufacturing | Dynamic Formula Scaling (Target Batch Size) | 🟡 Medium | P2 | Formal | 🔲 Open |
| WCOS-OG-05 | M24 – Manufacturing Costing | Cost Update Approval Workflow | 🟡 Medium | P2 | Formal | 🔲 Open |
| WCOS-OG-06 | M24 – Manufacturing Costing | WIP Accounting Period Close (Sweep Variances) | 🟡 Medium | P2 | Formal | 🔲 Open |
| WCOS-OG-07 | M24 – Manufacturing Costing | Outside Processing Cost Element Tracking | 🟡 Medium | P2 | Formal | 🔲 Open |
| WCOS-OG-08 | M24 – Manufacturing Costing | Variance Drill-Down to Source Transaction | 🟡 Medium | P2 | Formal | 🔲 Open |
| WCOS-OG-09 | M24 – Manufacturing Costing | Rate vs Usage Variance Split (Efficiency vs Price) | 🟡 Medium | P2 | Formal | 🔲 Open |
| WCOS-OG-10 | M24 – Manufacturing Costing | Pending Standard Cost (Frozen vs Pending Dual View) | 🟡 Medium | P2 | Formal | 🔲 Open |
| MDM-OG-05 | M25 – Master Data Management | Item Category Attribute Inheritance (Hierarchy-Based) | 🟡 Medium | P2 | Formal | 🔲 Open |
| MDM-OG-06 | M25 – Master Data Management | Item Status Lifecycle (Prototype → Active → Discontinuing → Obsolete) | 🟡 Medium | P2 | Formal | 🔲 Open |
| MDM-OG-07 | M25 – Master Data Management | Party Hierarchy Credit / AR Aggregation | 🟡 Medium | P2 | Formal | 🔲 Open |
| MDM-OG-08 | M25 – Master Data Management | Probabilistic Record Linkage (Fellegi-Sunter / EDQ) | 🟡 Medium | P2 | Formal | 🔲 Open |
| MDM-OG-09 | M25 – Master Data Management | Real-Time Duplicate Check on Create | 🟡 Medium | P2 | Formal | 🔲 Open |
| MDM-OG-10 | M25 – Master Data Management | MSDS / Regulatory Attribute Management | 🟡 Medium | P2 | Formal | 🔲 Open |
| MDM-OG-11 | M25 – Master Data Management | Pre-Import Validation Report (Exception Preview) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PBF-OG-05 | M26 – Planning, Budgeting & Forecasting | Project Budget Amendment Workflow | 🟡 Medium | P2 | Formal | 🔲 Open |
| PBF-OG-06 | M26 – Planning, Budgeting & Forecasting | Incremental Hire/Attrition Scenario (WFP) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PBF-OG-07 | M26 – Planning, Budgeting & Forecasting | Merit Increase Integration from HR to Plan | 🟡 Medium | P2 | Formal | 🔲 Open |
| PBF-OG-08 | M26 – Planning, Budgeting & Forecasting | Planning Unit Hierarchy Lock Propagation | 🟡 Medium | P2 | Formal | 🔲 Open |
| PBF-OG-09 | M26 – Planning, Budgeting & Forecasting | Driver Ownership Assignment + Change Audit | 🟡 Medium | P2 | Formal | 🔲 Open |
| PBF-OG-10 | M26 – Planning, Budgeting & Forecasting | Deal Desk / Contract Backlog Revenue Plan | 🟡 Medium | P2 | Formal | 🔲 Open |
| PBF-OG-11 | M26 – Planning, Budgeting & Forecasting | Prior Year Actual Version (Built-In YOY Context) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PBF-OG-12 | M26 – Planning, Budgeting & Forecasting | Uncertified Actuals → Plan Baseline Risk | 🟡 Medium | P2 | Formal | 🔲 Open |
| PPM-OG-07 | M27 – Project Portfolio Management | Budget Version Control (Original / Revised / Current) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PPM-OG-08 | M27 – Project Portfolio Management | Provisional vs Final Burden Rate (DCAA Compliance) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PPM-OG-09 | M27 – Project Portfolio Management | Retainage Management | 🟡 Medium | P2 | Formal | 🔲 Open |
| PPM-OG-10 | M27 – Project Portfolio Management | Capitalization Threshold Rule per Asset Category | 🟡 Medium | P2 | Formal | 🔲 Open |
| PPM-OG-11 | M27 – Project Portfolio Management | SPI Trend Chart (6-Period Performance Trend) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PPM-OG-12 | M27 – Project Portfolio Management | Project Subledger vs GL Reconciliation Report | 🟡 Medium | P2 | Formal | 🔲 Open |
| PRO-OG-05 | M28 – Procurement & SCM | PO Change Order Management (Numbered + Re-approval) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PRO-OG-06 | M28 – Procurement & SCM | Blanket Purchase Agreement (BPA) with Release Tracking | 🟡 Medium | P2 | Formal | 🔲 Open |
| PRO-OG-07 | M28 – Procurement & SCM | Supplier Bank Account Verification Workflow | 🟡 Medium | P2 | Formal | 🔲 Open |
| PRO-OG-08 | M28 – Procurement & SCM | Sealed Bid Sourcing Event | 🟡 Medium | P2 | Formal | 🔲 Open |
| PRO-OG-09 | M28 – Procurement & SCM | Supplier Performance Scorecard (OTD, Defect, Price Var) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PRO-OG-10 | M28 – Procurement & SCM | Maverick Spend Detection | 🟡 Medium | P2 | Formal | 🔲 Open |
| PRO-OG-11 | M28 – Procurement & SCM | Over-Receipt Tolerance Enforcement | 🟡 Medium | P2 | Formal | 🔲 Open |
| RMCS-OG-08 | M29 – Revenue Management | Audit Rule Change Log (SSP / Rule Modifications) | 🟡 Medium | P2 | Formal | 🔲 Open |
| RMCS-OG-09 | M29 – Revenue Management | Contract Modification Timeline View (Self-Admitted Missing) | 🟡 Medium | P2 | Formal | 🔲 Open |
| RMCS-OG-10 | M29 – Revenue Management | Multi-Currency Deferred Revenue Revaluation (Self-Admitted) | 🟡 Medium | P2 | Formal | 🔲 Open |
| RMCS-OG-11 | M29 – Revenue Management | Auditor Read-Only Deep Trace Workbench | 🟡 Medium | P2 | Formal | 🔲 Open |
| RMCS-OG-12 | M29 – Revenue Management | SSP Residual Approach + Range Tolerance Validation | 🟡 Medium | P2 | Formal | 🔲 Open |
| SLA-OG-02 | M30 – Subledger Accounting | Cost Element Accounting (Material / MOH / Resource / OSP) | 🟡 Medium | P2 | Formal | 🔲 Open |
| SLA-OG-03 | M30 – Subledger Accounting | Third-Party Subledger Self-Registration | 🟡 Medium | P2 | Formal | 🔲 Open |
| SLA-OG-04 | M30 – Subledger Accounting | Formula-Based Amount Source in JLTs | 🟡 Medium | P2 | Formal | 🔲 Open |
| SLA-OG-05 | M30 – Subledger Accounting | Accounting Error Correction Workflow | 🟡 Medium | P2 | Formal | 🔲 Open |
| SLA-OG-06 | M30 – Subledger Accounting | Reporting Currency Ledger (3rd Ledger Type) | 🟡 Medium | P2 | Formal | 🔲 Open |
| SLA-OG-07 | M30 – Subledger Accounting | Average Cost Revaluation Accounting Event | 🟡 Medium | P2 | Formal | 🔲 Open |
| SLA-OG-08 | M30 – Subledger Accounting | IFRS Revaluation / IAS 36 Impairment Events (Fixed Assets) | 🟡 Medium | P2 | Formal | 🔲 Open |
| SUP-OG-04 | M31 – Supplier Portal & PCM | Invoicing Rule Enforcement (Deliver-Before-Bill) | 🟡 Medium | P2 | Formal | 🔲 Open |
| SUP-OG-05 | M31 – Supplier Portal & PCM | Multi-Round Negotiation (Best and Final Offer) | 🟡 Medium | P2 | Formal | 🔲 Open |
| SUP-OG-06 | M31 – Supplier Portal & PCM | Release Order Committed Spend Tracking (PO vs Received vs Invoiced) | 🟡 Medium | P2 | Formal | 🔲 Open |
| SUP-OG-07 | M31 – Supplier Portal & PCM | Weighted Composite Supplier Score + CAP Workflow | 🟡 Medium | P2 | Formal | 🔲 Open |
| SUP-OG-08 | M31 – Supplier Portal & PCM | Supplier Duplicate Detection (D-U-N-S / Tax ID / Name-Address) | 🟡 Medium | P2 | Formal | 🔲 Open |
| SUP-OG-09 | M31 – Supplier Portal & PCM | Contract Template Library with Mandatory Clauses | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAL-OG-05 | M32 – Talent Management | 360-Degree Feedback with Anonymization | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAL-OG-06 | M32 – Talent Management | Calibration Session (Forced Distribution Curve) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAL-OG-07 | M32 – Talent Management | Skill Gap Analysis vs Role Competency Profile | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAL-OG-08 | M32 – Talent Management | AI Candidate Ranking (Fit Score vs Job Requirements) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAL-OG-09 | M32 – Talent Management | New Hire Onboarding Workflow (Pre-Day-1 Checklist) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAL-OG-10 | M32 – Talent Management | Succession Readiness Timeline (Now / 1-2yr / 3-5yr) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAX-OG-04 | M33 – Tax Engine | Tax Content Subscription (Vertex / Avalara) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAX-OG-05 | M33 – Tax Engine | Country-Specific Tax Return Box Mapping | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAX-OG-06 | M33 – Tax Engine | Tax Determination Trace (Rule Sequence Audit) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAX-OG-07 | M33 – Tax Engine | Economic Nexus Threshold Monitoring (US Sales Tax) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAX-OG-08 | M33 – Tax Engine | Product Taxability Matrix (PTCC per Item) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAX-OG-09 | M33 – Tax Engine | Intrastat Statistical Reporting (EU) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TAX-OG-10 | M33 – Tax Engine | Tax Control Account Reconciliation Certification | 🟡 Medium | P2 | Formal | 🔲 Open |
| WFM-OG-04 | M34 – Time & Labor | Labor Cost Distribution to Cost Center / Project | 🟡 Medium | P2 | Formal | 🔲 Open |
| WFM-OG-05 | M34 – Time & Labor | Union Work Rule Validation (CBA per Employee) | 🟡 Medium | P2 | Formal | 🔲 Open |
| WFM-OG-06 | M34 – Time & Labor | Time Rule Engine Deep Configuration UI (No-Code) | 🟡 Medium | P2 | Formal | 🔲 Open |
| WFM-OG-07 | M34 – Time & Labor | Retroactive Timesheet Correction + Retro-Pay Adjustment | 🟡 Medium | P2 | Formal | 🔲 Open |
| WFM-OG-08 | M34 – Time & Labor | Accrual Proration on Hire/Termination | 🟡 Medium | P2 | Formal | 🔲 Open |
| TMS-OG-04 | M35 – Transportation & Logistics | Carrier Invoice Rate Audit (Contract vs Billed) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TMS-OG-05 | M35 – Transportation & Logistics | Load Building (Cubic/Weight Optimization with Hazmat Segregation) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TMS-OG-06 | M35 – Transportation & Logistics | Carrier Portal (External POD, Invoice Submission) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TMS-OG-07 | M35 – Transportation & Logistics | Real-Time Traffic Data in Route Optimization | 🟡 Medium | P2 | Formal | 🔲 Open |
| TMS-OG-08 | M35 – Transportation & Logistics | Freight Accrual Reversal on Invoice Match | 🟡 Medium | P2 | Formal | 🔲 Open |
| TMS-OG-09 | M35 – Transportation & Logistics | Order Consolidation Policy (Weight/Cube/Time Window) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TRS-OG-05 | M36 – Treasury & Cash Management | Per-Trader Deal Size Limits + Counterparty Credit Lines | 🟡 Medium | P2 | Formal | 🔲 Open |
| TRS-OG-06 | M36 – Treasury & Cash Management | CVA/DVA Credit Valuation Adjustment for OTC Derivatives | 🟡 Medium | P2 | Formal | 🔲 Open |
| TRS-OG-07 | M36 – Treasury & Cash Management | Payment Factory Model (Subsidiary Payment Aggregation) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TRS-OG-08 | M36 – Treasury & Cash Management | Netting Agreement Validation (ISDA / Bilateral) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TRS-OG-09 | M36 – Treasury & Cash Management | Cash Concentration / ZBA Pooling Structures (Configurable) | 🟡 Medium | P2 | Formal | 🔲 Open |
| TRS-OG-10 | M36 – Treasury & Cash Management | Bank Fee Analysis vs Negotiated AFP Tariff | 🟡 Medium | P2 | Formal | 🔲 Open |
| WMS-OG-04 | M37 – Warehouse Management (WMS) | Replenishment Task Auto-Trigger from Pick Depletion | 🟡 Medium | P2 | Formal | 🔲 Open |
| WMS-OG-05 | M37 – Warehouse Management (WMS) | Cluster Picking (Multi-Order Cart with Tote Labels) | 🟡 Medium | P2 | Formal | 🔲 Open |
| WMS-OG-06 | M37 – Warehouse Management (WMS) | Quality Inspection Hold (Receipt → QC Disposition) | 🟡 Medium | P2 | Formal | 🔲 Open |
| WMS-OG-07 | M37 – Warehouse Management (WMS) | ABC/XYZ Classification-Driven Cycle Count Frequency | 🟡 Medium | P2 | Formal | 🔲 Open |
| WMS-OG-08 | M37 – Warehouse Management (WMS) | RF / Mobile Scanner Optimized UI (One-Task-at-a-Time) | 🟡 Medium | P2 | Formal | 🔲 Open |
| WMS-OG-09 | M37 – Warehouse Management (WMS) | Labor Standards (ELS) vs Actual SPH Productivity | 🟡 Medium | P2 | Formal | 🔲 Open |
| WMS-OG-10 | M37 – Warehouse Management (WMS) | Task Interleaving (Combine Putaway into Pick Route) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PAY-OG-05 | M38 – Workforce Rewards | Merit Matrix + Compensation Planning Worksheets | 🟡 Medium | P2 | Formal | 🔲 Open |
| PAY-OG-06 | M38 – Workforce Rewards | Compensation Band / Grade-Range Enforcement | 🟡 Medium | P2 | Formal | 🔲 Open |
| PAY-OG-07 | M38 – Workforce Rewards | Multi-Tier Compensation Proposal Approval Chain | 🟡 Medium | P2 | Formal | 🔲 Open |
| PAY-OG-08 | M38 – Workforce Rewards | Position Management (Headcount Control per Department) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PAY-OG-09 | M38 – Workforce Rewards | Retroactive Costing Delta (Prior-Period GL Correction) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PAY-OG-10 | M38 – Workforce Rewards | Balance Verification Rules Before Payroll Confirm | 🟡 Medium | P2 | Formal | 🔲 Open |
| REC-OG-04 | M39 – Recruiting / Talent Acquisition | GDPR Candidate Purge Schedule (Retention-Based Auto-Anonymize) | 🟡 Medium | P2 | Formal | 🔲 Open |
| REC-OG-05 | M39 – Recruiting / Talent Acquisition | Job Board Direct API Posting (LinkedIn / Indeed / Glassdoor) | 🟡 Medium | P2 | Formal | 🔲 Open |
| REC-OG-06 | M39 – Recruiting / Talent Acquisition | Skills Taxonomy Normalization (Oracle Skills Cloud) | 🟡 Medium | P2 | Formal | 🔲 Open |
| REC-OG-07 | M39 – Recruiting / Talent Acquisition | Candidate Self-Scheduling (Interviewer Availability Link) | 🟡 Medium | P2 | Formal | 🔲 Open |
| REC-OG-08 | M39 – Recruiting / Talent Acquisition | Structured Interview Guide (Competency Scorecard per Stage) | 🟡 Medium | P2 | Formal | 🔲 Open |
| REC-OG-09 | M39 – Recruiting / Talent Acquisition | Staffing Agency / VMS Portal (Agency Submission + Fee) | 🟡 Medium | P2 | Formal | 🔲 Open |
| REC-OG-10 | M39 – Recruiting / Talent Acquisition | ITSM Provisioning Integration (ServiceNow / JIRA Ticket) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PA-OG-04 | M40 – Project Accounting | Transaction Rejection + Resubmission Workflow | 🟡 Medium | P2 | Formal | 🔲 Open |
| PA-OG-05 | M40 – Project Accounting | Cross-Charge Billing (Lend/Borrow Between Organizations) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PA-OG-06 | M40 – Project Accounting | Financial Plan Types (Budget Versioning: Approved / Working / Original) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PA-OG-07 | M40 – Project Accounting | Cost Transfer Accounting (Reversing + Replacement SLA Journals) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PA-OG-08 | M40 – Project Accounting | Organization-Level Burden Schedule Override | 🟡 Medium | P2 | Formal | 🔲 Open |
| PC-OG-04 | M41 – Projects Costing (Additional Detail) | Project Risk Register (Probability × Impact Exposure) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PC-OG-05 | M41 – Projects Costing (Additional Detail) | Physical % Complete EVM Method (PM-Entered Independent of Cost) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PC-OG-06 | M41 – Projects Costing (Additional Detail) | EAC vs BAC Variance Trend (Estimate at Completion) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PC-OG-07 | M41 – Projects Costing (Additional Detail) | Cross-Charge Transfer Price Method (Actual / Negotiated / Burdened) | 🟡 Medium | P2 | Formal | 🔲 Open |
| PC-OG-08 | M41 – Projects Costing (Additional Detail) | Rate Schedule Effective Dating (Transaction-Date Rate Selection) | 🟡 Medium | P2 | Formal | 🔲 Open |
| AP-OG-16 | M1 – Accounts Payable | Debit Memo from Return-to-Supplier PO | 🟢 Low | P3 | Formal | 🔲 Open |
| AP-OG-17 | M1 – Accounts Payable | Supplier Merge | 🟢 Low | P3 | Formal | 🔲 Open |
| AP-OG-18 | M1 – Accounts Payable | Invoice Image Viewer (UCM) | 🟢 Low | P3 | Formal | 🔲 Open |
| AR-OG-18 | M2 – Accounts Receivable | Customer Merge Utility | 🟢 Low | P3 | Formal | 🔲 Open |
| AR-OG-19 | M2 – Accounts Receivable | Customer Self-Service Payment Portal | 🟢 Low | P3 | Formal | 🔲 Open |
| BI-OG-16 | M3 – Billing & Revenue Innovation | On-Account Credit Memo + Auto-Refund | 🟢 Low | P3 | Formal | 🔲 Open |
| BI-OG-17 | M3 – Billing & Revenue Innovation | Evergreen Auto-Renewal with Advance Notice | 🟢 Low | P3 | Formal | 🔲 Open |
| CM-OG-14 | M4 – Cash Management | Bank Account Number Masking in UI | 🟢 Low | P3 | Formal | 🔲 Open |
| CM-OG-15 | M4 – Cash Management | ZBA Hierarchy Tree Visualization | 🟢 Low | P3 | Formal | 🔲 Open |
| CON-OG-12 | M5 – Construction Management | Real MQTT/OPC-UA IoT Equipment Telemetry | 🟢 Low | P3 | Formal | 🔲 Open |
| CON-OG-13 | M5 – Construction Management | Lien Waiver Attachment per Pay App | 🟢 Low | P3 | Formal | 🔲 Open |
| HR-OG-14 | M6 – Core HR | DEI Goals vs Actuals + AI Flight Risk | 🟢 Low | P3 | Formal | 🔲 Open |
| HR-OG-15 | M6 – Core HR | NID Format Validation per Country | 🟢 Low | P3 | Formal | 🔲 Open |
| CM-MG-OG-12 | M7 – Cost Management | CM-MG-12 | 🟢 Low | P3 | Inline ✱ | 🔲 Open |
| CM-MG-OG-13 | M7 – Cost Management | CM-MG-13 | 🟢 Low | P3 | Inline ✱ | 🔲 Open |
| CRM-OG-13 | M8 – CRM | Cross-Docking + Serial/Lot Track-and-Trace | 🟢 Low | P3 | Formal | 🔲 Open |
| CRM-OG-14 | M8 – CRM | Carrier Rate Shopping at Shipment | 🟢 Low | P3 | Formal | 🔲 Open |
| EPM-OG-14 | M9 – EPM Planning | Trade Promotion / Gross-to-Net Deductions Planning | 🟢 Low | P3 | Formal | 🔲 Open |
| EPM-OG-15 | M9 – EPM Planning | AI Model Explainability + Ensemble Forecasting | 🟢 Low | P3 | Formal | 🔲 Open |
| ESS-OG-13 | M10 – ESS / MSS (HCM Self-Service) | GCC / Australia Statutory Form Localization | 🟢 Low | P3 | Formal | 🔲 Open |
| EXP-OG-11 | M11 – Expense Management | e-Invoicing Compliance (Italy SDI, Mexico CFDI) | 🟢 Low | P3 | Formal | 🔲 Open |
| FC-OG-10 | M13 – Financial Close | Statistical Journal Lines | 🟢 Low | P3 | Formal | 🔲 Open |
| FC-OG-11 | M13 – Financial Close | Close Cycle Time Industry Benchmarking | 🟢 Low | P3 | Formal | 🔲 Open |
| GL-OG-10 | M14 – General Ledger | Parallel Posting Workers + Posting SLA Monitor | 🟢 Low | P3 | Formal | 🔲 Open |
| HRA-OG-11 | M15 – HR Analytics | Time-Based Context Switching (As-of-date) | 🟢 Low | P3 | Formal | 🔲 Open |
| HRA-OG-12 | M15 – HR Analytics | Large Export (1M Rows) + Secure Email Delivery | 🟢 Low | P3 | Formal | 🔲 Open |
| HRC-OG-13 | M16 – HR Compliance | Audit Log Tamper Detection (Hash-Chain) | 🟢 Low | P3 | Formal | 🔲 Open |
| AGIS-OG-12 | M17 – Intercompany Accounting | Mass IC Transaction Import (CSV/Spreadsheet) | 🟢 Low | P3 | Formal | 🔲 Open |
| INV-OG-13 | M18 – Inventory Management | Vendor Lead Time–Based Reorder Point + EOQ | 🟢 Low | P3 | Formal | 🔲 Open |
| LCM-OG-11 | M19 – Landed Cost Management | Original vs Revised Allocation Comparison Report | 🟢 Low | P3 | Formal | 🔲 Open |
| LEASE-OG-12 | M20 – Lease & Contract Management | Lease vs Buy NPV Analysis | 🟢 Low | P3 | Formal | 🔲 Open |
| LMS-OG-12 | M21 – Learning (LMS) | Bulk Enrollment Import (CSV) + Learning History Export | 🟢 Low | P3 | Formal | 🔲 Open |
| EAM-OG-13 | M22 – Maintenance (EAM) | Vendor Frame Agreement for Maintenance Parts | 🟢 Low | P3 | Formal | 🔲 Open |
| MFG-OG-13 | M23 – Manufacturing | Variance Investigation Workflow (Root Cause + CAR) | 🟢 Low | P3 | Formal | 🔲 Open |
| WCOS-OG-11 | M24 – Manufacturing Costing | Cost Element Sub-Classification (OPM 5-element model) | 🟢 Low | P3 | Formal | 🔲 Open |
| MDM-OG-12 | M25 – Master Data Management | Bulk Export / Data Portability (XLSX / SFTP) | 🟢 Low | P3 | Formal | 🔲 Open |
| PBF-OG-13 | M26 – Planning, Budgeting & Forecasting | Automated Outlier Exclusion Before ML Training | 🟢 Low | P3 | Formal | 🔲 Open |
| PBF-OG-14 | M26 – Planning, Budgeting & Forecasting | Forecast-vs-Prior-Year Same-Period Comparison | 🟢 Low | P3 | Formal | 🔲 Open |
| PPM-OG-13 | M27 – Project Portfolio Management | Resource-Loaded Schedule (Resource Plan → Cost Plan) | 🟢 Low | P3 | Formal | 🔲 Open |
| PRO-OG-12 | M28 – Procurement & SCM | Carry-Forward Encumbrance at Fiscal Year-End | 🟢 Low | P3 | Formal | 🔲 Open |
| RMCS-OG-13 | M29 – Revenue Management | Billing-to-Revenue Deep Link Integration | 🟢 Low | P3 | Formal | 🔲 Open |
| SLA-OG-09 | M30 – Subledger Accounting | T-Account Drilldown from GL Balance | 🟢 Low | P3 | Formal | 🔲 Open |
| SLA-OG-10 | M30 – Subledger Accounting | XLA Audit Trail Report (Execution History) | 🟢 Low | P3 | Formal | 🔲 Open |
| SUP-OG-10 | M31 – Supplier Portal & PCM | PO Acknowledgement Deadline Escalation | 🟢 Low | P3 | Formal | 🔲 Open |
| SUP-OG-11 | M31 – Supplier Portal & PCM | Buyer-Facing Portal Adoption Analytics | 🟢 Low | P3 | Formal | 🔲 Open |
| TAL-OG-11 | M32 – Talent Management | External Content Integration (SCORM/xAPI / LinkedIn) | 🟢 Low | P3 | Formal | 🔲 Open |
| TAL-OG-12 | M32 – Talent Management | AI Career Path Recommendation | 🟢 Low | P3 | Formal | 🔲 Open |
| TAX-OG-11 | M33 – Tax Engine | Regime-to-Rate Configuration UI (No-Code Admin) | 🟢 Low | P3 | Formal | 🔲 Open |
| WFM-OG-09 | M34 – Time & Labor | Biometric Time Capture (Kronos / Geo-Fenced Mobile Punch) | 🟢 Low | P3 | Formal | 🔲 Open |
| WFM-OG-10 | M34 – Time & Labor | Multi-Calendar Assignment (Split-Country Work Pattern) | 🟢 Low | P3 | Formal | 🔲 Open |
| TMS-OG-10 | M35 – Transportation & Logistics | Driver GPS Real-Time Position on Route Map | 🟢 Low | P3 | Formal | 🔲 Open |
| TMS-OG-11 | M35 – Transportation & Logistics | Carrier Capability Attributes (Hazmat, Reefer, Oversize) | 🟢 Low | P3 | Formal | 🔲 Open |
| TRS-OG-11 | M36 – Treasury & Cash Management | Intraday Liquidity Monitoring (Near-Real-Time Position) | 🟢 Low | P3 | Formal | 🔲 Open |
| TRS-OG-12 | M36 – Treasury & Cash Management | Day-Count Convention Configurability (30/360, Act/360, etc.) | 🟢 Low | P3 | Formal | 🔲 Open |
| WMS-OG-11 | M37 – Warehouse Management (WMS) | Slotting Weight/Cube Constraints (Ergonomic Bin Assignment) | 🟢 Low | P3 | Formal | 🔲 Open |
| WMS-OG-12 | M37 – Warehouse Management (WMS) | Count Variance Approval Threshold (Second-Count + Supervisor) | 🟢 Low | P3 | Formal | 🔲 Open |
| PAY-OG-11 | M38 – Workforce Rewards | Total Compensation Statement (Salary + Benefits + Equity PDF) | 🟢 Low | P3 | Formal | 🔲 Open |
| PAY-OG-12 | M38 – Workforce Rewards | Data Access Sets for Payroll (Legal Entity Segregation) | 🟢 Low | P3 | Formal | 🔲 Open |
| REC-OG-11 | M39 – Recruiting / Talent Acquisition | Auto-Disqualification via Screening Questions | 🟢 Low | P3 | Formal | 🔲 Open |
| REC-OG-12 | M39 – Recruiting / Talent Acquisition | Job Alert Subscriptions for Candidates | 🟢 Low | P3 | Formal | 🔲 Open |
| PA-OG-09 | M40 – Project Accounting | Labor Cost-to-Revenue Rate Multiplier (T&M Bill Rate) | 🟢 Low | P3 | Formal | 🔲 Open |
| PA-OG-10 | M40 – Project Accounting | Asset Cost Grouping (Multi-Line CIP to Single FA Asset) | 🟢 Low | P3 | Formal | 🔲 Open |
| PC-OG-09 | M41 – Projects Costing (Additional Detail) | WBS Element Type Enforcement (Work Package vs Planning vs Summary) | 🟢 Low | P3 | Formal | 🔲 Open |
| PC-OG-10 | M41 – Projects Costing (Additional Detail) | Project Copy from Existing (Create-from-Project with Element Selection) | 🟢 Low | P3 | Formal | 🔲 Open |
| PC-OG-11 | M41 – Projects Costing (Additional Detail) | Actual vs Standard Cost Burdening Variance (Year-End Reconciliation) | 🟢 Low | P3 | Formal | 🔲 Open |

---

*Remedial Plan v2.0 · 498 unique gaps · Generated: 2026-02-20 · Source: gaps/complete_document.md*
