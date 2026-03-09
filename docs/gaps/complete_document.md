# NexusAI ERP — Complete Module Analysis Register
**Source:** `/docs/analysis_*.md` (41 documents)
**Purpose:** Master listing of all modules, their documented features, and documented Oracle parity status. Gap column to be filled in subsequent phases.
**Status:** Phase 1 — Listing Only (Pending Gap Review)

---

## How to Read This Document

| Column | Meaning |
|:---|:---|
| **#** | Module index |
| **Module** | Module name (from document title) |
| **Source File** | Analysis document filename |
| **Oracle Equivalent** | Target Oracle Fusion/Cloud feature |
| **Key Features Documented** | Features listed as implemented in the analysis doc |
| **Documented Status** | Final parity verdict from the analysis doc |
| **Oracle Gaps (TBD)** | To be filled in Phase 2+ — additional Oracle features not yet in NexusAI |

---

## Module Analysis Register

### 1. Accounts Payable (AP)
**Source:** `analysis_ap_gap.md` | **Oracle Equiv:** Oracle Fusion Payables Cloud

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Payables) |
|:---|:---|:---|
| Supplier Master (Hdr + Sites with IBAN/SWIFT) | ✅ Parity | **GAP:** No supplier bank account verification (positive pay / pre-note); no Supplier Merge utility; no alternate supplier names / DBA support; no supplier audit change history UI |
| Standard Invoice (Header/Lines/Distributions) + SLA | ✅ Parity | **GAP:** No recurring invoice templates (Oracle: `AP_RECURRING_PAYMENTS`); no installment-based payment schedules (split due dates per invoice); no quick-match from purchase receipt screen |
| Prepayments (Application/Unapplication, balance tracking) | ✅ Parity | **MINOR GAP:** Prepayment offset is applied manually — Oracle auto-suggests outstanding prepayments on invoice entry |
| 2-Way/3-Way Matching + Multi-level Variance Holds | ✅ Parity | **GAP:** No 4-way matching (Receipt + Inspector Acceptance); no quantity-billed tolerance vs quantity-received ledger comparison; no `BILLED QUANTITY > RECEIVED QUANTITY` auto-hold release workflow |
| Multi-tier Withholding Tax (WHT) Groups & priority-based rates | ✅ Parity | **GAP:** WHT remittance invoice generation (auto-create invoice to Tax Authority supplier) not implemented; no WHT certificate printing; no 1099/1042-S reporting |
| PPR Payment Batches with ISO20022 (pain.001) XML export | ✅ Parity | **GAP:** No payment document formatting templates (check stock layouts, MICR fonts); no positive pay file generation (bank fraud prevention); no stop payment request / reissue check flow; no electronic funds confirmation (ACH) status callback |
| Treasury Bank Account Connectivity | ✅ Parity | **GAP:** No multi-bank-account selection UI on PPR (Oracle lets user select which internal bank account funds each payment); no BAI2 bank statement import for AP clearing account reconciliation |
| Automated Intercompany Balancing (SLA/BSV level) | ✅ Parity | **MINOR GAP:** IC invoice netting (combine IC payable/receivable before settlement) not exposed as a self-service workflow in AP — handled in IC module only |
| 5-Bucket Aging Reports + Immutable Audit Trail | ✅ Parity | **GAP:** No supplier statement reconciliation (compare supplier-sent statement vs NexusAI ledger balances); no outstanding-liability drill-through to individual distributions |
| Subledger Period Close (readiness checks) | ✅ Parity | **GAP:** No `AP_TRIAL_BALANCE` report aligned to GL by period; no mass invoice posting status sweep before period close |
| Async Payment Worker (Background Processing) | ✅ Parity | **MINOR GAP:** `setImmediate` used (single-process); should use a durable queue (BullMQ/Redis) for crash recovery — process restart would lose in-flight batches |
| AI Multimodal Invoice Capture (Whisper/GPT-4o) | ✅ Parity (Leader) | **GAP:** No vendor invoice portal (suppliers submit invoices via external portal instead of email/upload); no EDI 810 invoice import |
| RBAC (Manager/Clerk) | ✅ Parity | **GAP:** No Segregation of Duties (SoD) rule between invoice entry and payment approval enforced at AP level (Oracle uses Fusion Security SoD policies); no field-level security (e.g. hide bank details from AP Clerk) |
| **[MISSING]** Invoice Approval Routing | — | **GAP:** Invoice approval is a single-stage `ap_approvals` record with no multi-level routing, delegation, or AME-style rule engine (Oracle: BPM worklist with amount thresholds, cost center owners) |
| **[MISSING]** Payment Terms Master | — | **GAP:** Payment terms are hardcoded strings (`"Net 30"`, `"Immediate"`) in `createInvoice`. Oracle maintains a `ap_terms` master table with discount terms (e.g. 2/10 Net 30) and complex installment schedules |
| **[MISSING]** Early Payment Discounts | — | **GAP:** No early payment discount capture or automatic discount forfeit logic (Oracle: discount date vs payment date comparison, discount amount auto-applied on payment) |
| **[MISSING]** Supplier Balance Inquiry | — | **GAP:** No live supplier outstanding balance query (total unpaid, on-hold, overdue) — Oracle: Payables Inquiry workbench with real-time balance |
| **[MISSING]** Invoice Image Attachment | — | **GAP:** `documentUrl` field exists but no content management / attachment viewer integrated into the invoice workbench UI (Oracle: UCM-based image viewing inline) |
| **[MISSING]** Debit Memo / Supplier Credit Integration | — | **GAP:** Debit memos are created manually; no automatic debit memo from return-to-supplier PO transactions |
| **[MISSING]** 1099 / Tax Reporting | — | **GAP:** No 1099-MISC / 1099-NEC income reporting for US vendors; no FATCA / W-8 flag management on suppliers |

**Overall Oracle Parity Status:** ✅ Documented as **100% Production Ready**

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| AP-OG-01 | Payment Terms Master Table | `ap_terms` with discount dates, installment schedules | 🔴 High |
| AP-OG-02 | Early Payment Discounts | Auto-discount on payment (2/10 Net 30) | 🔴 High |
| AP-OG-03 | Multi-Level Invoice Approval (AME) | BPM worklist, amount thresholds, delegation | 🔴 High |
| AP-OG-04 | WHT Remittance Invoice to Tax Authority | Auto invoice generation + 1099/1042-S reporting | 🔴 High |
| AP-OG-05 | 4-Way Matching (Inspection Acceptance) | Accept quantity gate before invoice match | 🟡 Medium |
| AP-OG-06 | Positive Pay File | Anti-fraud bank file for check validation | 🟡 Medium |
| AP-OG-07 | Stop Payment / Reissue Check | Void + reissue workflow with bank notification | 🟡 Medium |
| AP-OG-08 | Supplier Statement Reconciliation | Compare supplier statement vs ledger | 🟡 Medium |
| AP-OG-09 | Recurring Invoice Templates | Auto-generate monthly invoices | 🟡 Medium |
| AP-OG-10 | Installment Payment Schedules | Split invoice into multiple due dates | 🟡 Medium |
| AP-OG-11 | Supplier Balance Inquiry Workbench | Real-time unpaid/on-hold/overdue balance | 🟡 Medium |
| AP-OG-12 | AP Trial Balance Report | Period-aligned AP vs GL reconciliation report | 🟡 Medium |
| AP-OG-13 | Durable Payment Queue (BullMQ) | Crash-safe async processing with retry | 🟡 Medium |
| AP-OG-14 | EDI 810 Invoice Import | Electronic invoice exchange standard | 🟡 Medium |
| AP-OG-15 | SoD at AP Level (Entry vs Approval) | Field-level + SoD security in AP roles | 🟡 Medium |
| AP-OG-16 | Debit Memo from Return-to-Supplier PO | Auto-DM on PO return transaction | 🟢 Low |
| AP-OG-17 | Supplier Merge | Merge duplicate suppliers + re-parent invoices | 🟢 Low |
| AP-OG-18 | Invoice Image Viewer (UCM) | Inline PDF/image viewer in workbench | 🟢 Low |

---

### 2. Accounts Receivable (AR)
**Source:** `analysis_ar_gap.md` | **Oracle Equiv:** Oracle Fusion Receivables Cloud

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Receivables) |
|:---|:---|:---|
| TCA-Style Customer Hierarchy (Party → Account → Site) | ✅ Parity | **GAP:** No Customer Relationship tracking (Guarantor, Ship-to Contact, Bill-to Contact as separate profile); no customer merge utility; no party-level data sharing across BUs |
| Standard Invoices, Credit Memos, Debit Memos, Chargebacks | ✅ Parity | **GAP:** No AutoInvoice validation engine (Oracle validates batch import with error reporting before posting); no on-account credit memo (CM not linked to specific invoice); no line-level tax override on invoice |
| Payment Terms & Application | ✅ Parity | **GAP:** Payment terms are a `varchar` field (`"Net 30"`), not a master table — no discount terms (e.g. 2/10 Net 30), no split installment due-date schedules; no earned discount application on early receipt |
| Receipt Application (Manual Apply) | ✅ Parity | **GAP:** No on-account receipts (unidentified receipt held for future application); no cross-currency receipt application with realized gain/loss posting; no lockbox auto-apply rule engine (Oracle Lockbox) |
| Receipt Unapplication (`unapplyReceipt` + SLA Reversal) | ✅ Parity | **MINOR GAP:** Only full unapplication supported — Oracle allows partial unapplication (reduce amount on a specific application line without reversing all) |
| SLA Integration (Invoices, CMs, Receipts) | ✅ Parity | **GAP:** No `AR_ADJUSTMENT`, `AR_CHARGEBACK`, `AR_WRITEOFF` SLA event types — only invoice/receipt events confirmed; no accounting for exchange rate gains/losses on foreign-currency receipts |
| Revenue Schedules (`ar_revenue_schedules`) | ✅ Parity | **GAP:** Recognition method is Straight Line or Immediate only — no event-based revenue (Oracle: Bill & Revenue Management — milestone/usage triggers); no contingent revenue constraint |
| Async Dunning Worker (via `setImmediate`) | ✅ Parity | **MINOR GAP:** `setImmediate` is single-process; no durable queue for crash recovery. Oracle Dunning: stratified letters by relationship score + automatic hold placement after nth dunning level |
| Credit Scoring (on-demand) | ✅ Parity | **GAP:** Credit scoring is a simple formula (`daysOverdue * 2 + amountBonus`) — no external bureau pull (D&B/Experian), no historical payment behavior trending; credit limit is static — no auto-adjustment |
| Bulk Revenue Recognition API | ✅ Parity | **GAP:** Bulk sweep fires `setImmediate` (same single-process issue); no period-end mass recognition report showing what was recognized vs scheduled vs deferred |
| AI Collections Email | ✅ Parity | **GAP:** Collector task is created but no actual email send — no email delivery integration (SMTP/SendGrid); no response tracking; Oracle Collections Cloud: full omni-channel (email, SMS, phone log) |
| Adjustments (Write-off, Discount) | ✅ Parity | **GAP:** No write-off approval by amount threshold (Oracle: auto-approve under tolerance, require manager for larger); no mass adjustment batch; no adjustment reversal |
| Disputes (`ar_disputes`) | ✅ Schema Only | **GAP:** Dispute table exists in schema but no resolution-to-credit-memo workflow (Oracle: dispute → credit memo or write-off decision with GL posting); no customer-facing dispute portal integration |
| Collections Dashboard | ✅ Parity | **GAP:** No territory/collector assignment rules (Oracle: AGIS-style assignment based on customer segment, BU, amount); no promise-to-pay recording and tracking |
| **[MISSING]** Lockbox / Auto-Apply | — | **GAP:** No bank lockbox file import (BAI2/custom) with auto-match and unapplied exception queue |
| **[MISSING]** Customer Statements | — | **GAP:** No periodic customer statement generation (Oracle: `AR_CUSTOMER_STATEMENTS` — outstanding invoices formatted as PDF/email) |
| **[MISSING]** Interest Invoices | — | **GAP:** No late-payment interest invoice auto-generation (Oracle: `AR_INTEREST_BATCH` — calculates and creates finance charge invoices) |
| **[MISSING]** AR Aging (On-Screen Drill-Down) | — | **GAP:** `ArAgingAnalysis.tsx` component exists but no live drill-through from bucket totals to individual invoices + receipt detail |
| **[MISSING]** AR-to-GL Reconciliation Report | — | **GAP:** No AR Control Account reconciliation report (AR subledger total vs GL control account balance by period) |
| **[MISSING]** FX Revaluation (AR Balances) | — | **GAP:** No period-end foreign currency revaluation of open AR balances (Oracle: `AR_REVALUATION` — generates unrealized gain/loss journals) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Conditionally Ready** (prior gaps AR-001–005 closed, but structural gaps remain)

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| AR-OG-01 | Payment Terms Master Table | Discount terms, installment schedules | 🔴 High |
| AR-OG-02 | AutoInvoice Validation Engine | Batch import with error report before posting | 🔴 High |
| AR-OG-03 | Lockbox Auto-Apply Engine | BAI2 import + rule-based receipt matching | 🔴 High |
| AR-OG-04 | FX Revaluation (Open AR Balances) | Unrealized gain/loss journals at period-end | 🔴 High |
| AR-OG-05 | Customer Statement Generation | PDF/email outstanding statement per customer | 🟡 Medium |
| AR-OG-06 | Interest Invoice (Finance Charges) | Auto-generate late payment invoices | 🟡 Medium |
| AR-OG-07 | On-Account Receipts | Hold unidentified cash for future application | 🟡 Medium |
| AR-OG-08 | Cross-Currency Receipt + Realized Gain/Loss | FX settlement with GL journal | 🟡 Medium |
| AR-OG-09 | Dispute → Credit Memo/Write-off Workflow | Resolution with GL posting | 🟡 Medium |
| AR-OG-10 | Credit Bureau Integration (D&B/Experian) | External score pull for credit decisions | 🟡 Medium |
| AR-OG-11 | Promise-to-Pay Recording | Collector records PTP date + amount | 🟡 Medium |
| AR-OG-12 | Collector Territory Assignment Rules | Segment-based auto-assignment | 🟡 Medium |
| AR-OG-13 | AR Trial Balance / AR-GL Reconciliation | Control account balance report by period | 🟡 Medium |
| AR-OG-14 | Durable Async Queue (BullMQ) | Crash-safe dunning + recognition with retry | 🟡 Medium |
| AR-OG-15 | Email Delivery Integration (SMTP/SendGrid) | Actual dunning email send + tracking | 🟡 Medium |
| AR-OG-16 | Mass Adjustment Batch | Bulk write-off with threshold approval | 🟡 Medium |
| AR-OG-17 | Event-Based Revenue (Milestones/Usage) | B&RM-style contingent/milestone recognition | 🟡 Medium |
| AR-OG-18 | Customer Merge Utility | Merge duplicate party records | 🟢 Low |
| AR-OG-19 | Customer Self-Service Payment Portal | Online invoice payment + receipt generation | 🟢 Low |

---

### 3. Billing & Revenue Innovation
**Source:** `analysis_billing_gap.md` | **Oracle Equiv:** Oracle Fusion Billing / AutoInvoice / Subscription Management Cloud

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Billing Cloud) |
|:---|:---|:---|
| Auto-Invoice Engine (Batch SQL + App Batching) | ✅ Parity | **GAP:** No transaction source / transaction type master (Oracle AutoInvoice: each source (Projects, OM, Contracts) must be registered with distinct GL defaults); no pre-AutoInvoice validation report showing rejected lines with reason codes before import |
| Subscription Billing (Recurring Engine) | ✅ Parity | **GAP:** No mid-period amendment proration engine (Oracle: co-term proration for upsell/downsell effective mid-period); no evergreen auto-renewal with advance notice workflow; no suspension / re-activation billing adjustment |
| Billing Rules / Profiles Manager | ✅ Parity | **GAP:** Billing frequency is `varchar` — no billing schedule calendar (Oracle: bill on 1st of month, or N days after contract start); no minimum commitment enforcement (actual vs committed revenue gap billing); no tiered (volume-based) pricing structure |
| Tax Calculation (`TaxService` — stub) | ✅ Parity | **GAP:** `TaxService` is a stub returning a flat rate — no tax jurisdiction determination by ship-to address; no exemption certificate management per billing profile (tax_exempt flag exists but no end-to-end exemption certificate storage/expiry); no e-invoicing (ViDA/ZATCA/UBL mandate) |
| SLA / GL Integration (`BillingAccountingService`) | ✅ Parity | **GAP:** No billing-period accrual reversal (Oracle: auto-reversal entry for unbilled revenue accrual at period start); no intercompany billing GL balancing for cross-BU subscription fulfillment |
| Tiered Invoice Approval (VP > $10k) | ✅ Parity | **GAP:** Approval is a hardcoded `> $10k → VP` rule in the controller — no configurable approval matrix by customer tier, amount band, or business unit; no delegated approval or absence substitute |
| Revenue Recognition (Auto-Schedules, ASC 606) | ✅ Parity | **GAP:** Only Straight Line and Immediate recognition methods exist — no usage-based recognition (recognize as consumed), no event-based (milestone) trigger; no contract modification re-allocation SSP engine (ASC 606 Step 4 re-run) |
| Credit Check (`CreditCheckService`) | ✅ Parity | **GAP:** Credit limit is a static field on `ar_customer_accounts` — no real-time credit exposure calculation (credit limit minus open invoices minus open orders minus open SO value); no auto-release of hold when payment received |
| Credit Memos (`CreditMemoService`) | ✅ Parity | **GAP:** Credit memo can be created and applied but no on-account credit (credit not linked to any invoice); no auto-refund trigger when CM exceeds account balance; no credit memo PDF template generation |
| Multi-Currency Exchange Rate Service | ✅ Parity | **GAP:** Exchange rates appear to be inline/static — no daily rate feed integration (ECB/Bloomberg); no rate tolerance warning when invoicing in a stale-rate currency; no triangulation (EUR→GBP via USD) |
| AI Anomaly Detection (`BillingAnomalyDashboard`) | ✅ Parity | **GAP:** Anomaly detection is rule-based (HIGH_VALUE, DUPLICATE_SUSPECT, PATTERN_DEVIATION) — no ML-based anomaly scoring comparing against rolling baseline; no anomaly auto-hold with AI-generated explanation |
| Server-Side Pagination (StandardTable) | ✅ Parity | **MINOR GAP:** No cursor-based pagination — offset pagination breaks under concurrent inserts for real-time billing volumes >100k/day |
| **[MISSING]** Billing Transaction Source Registry | — | **GAP:** No `billing_transaction_sources` master table (Oracle AutoInvoice: each upstream source must register a transaction source + type with default GL accounts, tax codes, and account derivation rules) |
| **[MISSING]** Consolidated Invoicing | — | **GAP:** No invoice consolidation by customer/period (Oracle: merge multiple billing events into one invoice per customer per billing cycle with grouping rules) |
| **[MISSING]** Invoice Formatting / Template Engine | — | **GAP:** No invoice PDF template engine (Oracle: BI Publisher templates per transaction type — logo, header, line grouping, footer, remittance stub); no email delivery of formatted invoice |
| **[MISSING]** Dunning / Collections Integration | — | **GAP:** No automatic escalation from Billing to Collections when invoice passes due date (Oracle: triggers Dunning workflow based on billing profile settings) |
| **[MISSING]** Bill-and-Hold / Deferred Revenue UI | — | **GAP:** No bill-and-hold transaction type (invoice raised but revenue deferred until delivery/acceptance); no deferred revenue liability schedule viewer on invoice workbench |

**Overall Oracle Parity Status:** ⚠️ Documented as **100% Parity** — but structural gaps found in tax engine depth, proration, template engine, and AutoInvoice source registry

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| BI-OG-01 | Tax Jurisdiction + E-Invoicing (ViDA/ZATCA) | Geo-based tax determination + legal mandate | 🔴 High |
| BI-OG-02 | Subscription Mid-Period Amendment Proration | Co-term upsell/downsell exact-day proration | 🔴 High |
| BI-OG-03 | Billing Transaction Source Registry | Source-to-GL account derivation rules | 🔴 High |
| BI-OG-04 | Invoice PDF Template Engine | BI Publisher templates per transaction type | 🔴 High |
| BI-OG-05 | Consolidated Invoice (Group by Customer/Period) | Merge events into single periodic invoice | 🟡 Medium |
| BI-OG-06 | Billing Schedule Calendar | Bill on specific date, not just frequency | 🟡 Medium |
| BI-OG-07 | Tiered (Volume-Based) Pricing | Price breaks at quantity thresholds | 🟡 Medium |
| BI-OG-08 | Usage-Based Revenue Recognition | Recognize proportional to consumption | 🟡 Medium |
| BI-OG-09 | Real-Time Credit Exposure Calculation | Open orders + open invoices vs credit limit | 🟡 Medium |
| BI-OG-10 | Daily FX Rate Feed Integration | ECB/Bloomberg rate ingestion | 🟡 Medium |
| BI-OG-11 | Configurable Approval Matrix | Amount + BU + customer-tier rules | 🟡 Medium |
| BI-OG-12 | Billing-Period Accrual Auto-Reversal | Unbilled revenue accrual reversal entry | 🟡 Medium |
| BI-OG-13 | Dunning Auto-Escalation from Billing | Trigger collections on overdue invoice | 🟡 Medium |
| BI-OG-14 | Bill-and-Hold / Deferred Revenue UI | Invoice raised, revenue deferred until delivery | 🟡 Medium |
| BI-OG-15 | Exemption Certificate Management | Store/validate tax exemption certificates | 🟡 Medium |
| BI-OG-16 | On-Account Credit Memo + Auto-Refund | Credit not linked to invoice; trigger refund | 🟢 Low |
| BI-OG-17 | Evergreen Auto-Renewal with Advance Notice | Configurable renewal notice workflow | 🟢 Low |

---

### 4. Cash Management (CM)
**Source:** `analysis_cm_gap.md` | **Oracle Equiv:** Oracle Fusion Cash Management / Treasury

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Cash Management) |
|:---|:---|:---|
| Bank Account Management (Maker-Checker + Audit) | ✅ Parity | **GAP:** No hierarchical Bank → Branch → Account registry (Oracle CE: dedicated Bank and Branch master tables with BIC validation); no account number masking in UI; no field-level audit trail (who changed account number/IBAN?) |
| Statement Processing: Camt.053, MT940, BAI2, Camt.052 | ✅ Parity | **GAP:** Parser factory is file-based with regex (bottleneck for 100MB enterprise files); no SFTP/API auto-pull from bank (Oracle: automated bank statement import via ESB connectors); no Swift MT statements for payments confirmation (MT199/MT299) |
| Smart Reconciliation Engine (Amount/Date Tolerance, Regex) | ✅ Parity | **GAP:** Auto-reconcile is O(N×M) in-service loop — no batch SQL set-based matching; no reconciliation exception reason codes (`bank_fee`, `interest`, `fx_difference`); no undo-match with full reversal of SLA entries; no reconciliation sign-off workflow for SOX |
| Multi-Scenario Cash Forecasting | ✅ Parity | **GAP:** Forecast sources hardcoded (AP + AR balance aggregation); no integration with Payroll, Tax, CapEx, Treasury debt schedules; no Actual vs Forecast variance analysis; no snapshot pinning (Oracle: lock a forecast as the period baseline) |
| FX Revaluation via `glDailyRates` + SLA Posting | ✅ Parity | **GAP:** Revaluation runs account-by-account sequentially — no bulk set-based posting; no revaluation history log (Oracle: `CE_BANK_ACCTS_REVALUATION` audit table); no reverse-revaluation on period re-open |
| ZBA / Cash Pooling (Autonomous Cron Sweep Engine) | ✅ Parity | **MINOR GAP:** ZBA sweeps are single-currency only — no notional (cross-currency) pooling; no interest calculation on pool balances; no ZBA hierarchy visualization (tree view vs flat list) |
| Auditor-Grade PDF Reconciliation Report | ✅ Parity | **GAP:** PDF report is generated but no report sign-off workflow (Oracle: reconciliation report requires manager electronic approval before period close); no drill-from-report-to-transaction links |
| AI Liquidity Insights Sidebar | ✅ Parity | **GAP:** AI insights are rule-based commentary — no ML-driven anomaly detection in intraday cash movements; no natural-language cash position query ("What is my EUR exposure tomorrow?") |
| Immutable Audit Logging (`cash-audit.service.ts`) | ✅ Parity | **GAP:** Audit log retention policy not configurable (Oracle: configurable by legal entity for regulatory compliance); no automated SOX compliance breach alerting from audit log analysis |
| **[MISSING]** Bank Hierarchy Registry (Bank → Branch) | — | **GAP:** Bank and Branch names are `varchar` fields on accounts — no `ce_banks` / `ce_bank_branches` master tables with BIC/NCC codes (Oracle: managed separately, validated against SWIFT reference data) |
| **[MISSING]** Manual Cash Transaction Entry | — | **GAP:** No manual external cash transaction creation UI (Oracle: CE allows manual entry of bank transactions — payments received, bank charges — not from AP/AR, for direct clearing) |
| **[MISSING]** Bank Account Transfer | — | **GAP:** No inter-bank account transfer (Oracle: creates paired cash journals — Cr source bank / Dr target bank — with settlement tracking) |
| **[MISSING]** Reconciliation Exception Write-Off | — | **GAP:** Unreconciled statement lines cannot be written off with a GL posting (Oracle: approved write-off creates an expense or bank charges journal and marks line as cleared) |
| **[MISSING]** Cross-Entity Cash Position Consolidation | — | **GAP:** Cash position dashboard shows one legal entity — no consolidated group-level view with intercompany elimination (Oracle: multi-ledger cash position with treasury reporting segment) |

**Overall Oracle Parity Status:** ⚠️ Documented as **100% Core Enterprise Parity** — structural gaps found in bank hierarchy, manual transactions, exception write-off, and cross-entity consolidation

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| CM-OG-01 | Bank/Branch Hierarchy Registry (BIC Validated) | `ce_banks` / `ce_bank_branches` master tables | 🔴 High |
| CM-OG-02 | Automated Bank Statement Import (SFTP/API) | ESB connector to bank portals, no manual upload | 🔴 High |
| CM-OG-03 | Reconciliation Sign-Off Workflow (SOX) | Manager electronic approval before period close | 🔴 High |
| CM-OG-04 | Cross-Entity Consolidated Cash Position | Multi-ledger + IC elimination in treasury dashboard | 🔴 High |
| CM-OG-05 | Actual vs Forecast Variance Analysis | Snapshot baseline + variance drill-through | 🟡 Medium |
| CM-OG-06 | Reconciliation Exception Reason Codes + Write-Off | Categorized exceptions + GL write-off journal | 🟡 Medium |
| CM-OG-07 | Inter-Bank Transfer (Internal Movement) | Paired journals with settlement tracking | 🟡 Medium |
| CM-OG-08 | Manual External Cash Transaction Entry | Bank charge / non-AP-AR cash entry | 🟡 Medium |
| CM-OG-09 | Notional (Cross-Currency) Cash Pooling | Multi-currency pool with interest calculation | 🟡 Medium |
| CM-OG-10 | Revaluation History Log + Reverse Revaluation | `CE_REVALUATION` audit table; period re-open reversal | 🟡 Medium |
| CM-OG-11 | Undo-Match with SLA Reversal | Un-reconcile with full accounting reversal | 🟡 Medium |
| CM-OG-12 | Forecast Payroll/Tax/CapEx Source Integration | All cash outflow categories in forecast | 🟡 Medium |
| CM-OG-13 | Natural Language Cash Query (AI) | "What is EUR exposure tomorrow?" | 🟡 Medium |
| CM-OG-14 | Bank Account Number Masking in UI | PCI-compliant display of sensitive bank data | 🟢 Low |
| CM-OG-15 | ZBA Hierarchy Tree Visualization | Pool structure as drag-and-drop tree | 🟢 Low |

---

### 5. Construction Management
**Source:** `analysis_construction_management_gap.md` | **Oracle Equiv:** Oracle Fusion Project Contracts / Oracle ECC / ACONEX

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Project Contracts / ECC) |
|:---|:---|:---|
| Project Controls (WBS, Budget, EAC) | ✅ 100% | **GAP:** EAC (Estimate at Completion) calculation is basic auto-revision of `revisedAmount` — no bottom-up ETC re-estimation by resource; no Progress Measurement Method (% complete by units, cost, or effort); no earned value (BCWS / BCWP / ACWP / SPI / CPI) |
| Contract Management (Prime/Sub, SOV) | ✅ 100% | **GAP:** Subcontract payment flow is missing — no subcontract invoice (SCIV) against a pay app line; no subcontract certified value vs subcontractor claim matching; no subcontract retainage release trigger |
| Change Control (Variations/PCO/CO) | ✅ 100% | **GAP:** Change order workflow is single-step (Draft → Approved) — no PCO → COR → CO three-step pipeline with owner and architect countersignature; no time extension tracking (calendar days impact per CO); no historical CO probability prediction |
| Progress Billing (AIA G702/G703 + Retentions) | ✅ 100% | **GAP:** Retention is a single flat rate — no variable retention (e.g., 10% until 50% complete, then 5%); no retention release via separate invoice (Oracle: `retention_release_pay_app`); no lien waiver attachment/tracking per pay app |
| 3-Stage Certification Workflow | ✅ 100% | **GAP:** Certification is sequential lock-step — no parallel certification option; no mobile-first field certification (Oracle ACONEX: iOS sign-off); no delegation when certifier is absent |
| SLA Accounting (WIP/AP/Retainage journals) | ✅ 100% | **GAP:** WIP journals are posted at pay-app level — no project-level WIP roll-forward report; no intercompany SLA entries for multi-BU construction JVs; no revenue recognition % of completion vs cost method toggle |
| Field Operations (Daily Logs, RFIs, Submittals) | ✅ 100% | **GAP:** RFI has no formal transmittal package (send to multiple parties, track ball-in-court); submittal has no register grouping by spec section; no drawing management or field issue register (Oracle ACONEX core capability) |
| Claims & Disputes Register | ✅ 100% | **GAP:** Claims lifecycle ends at Settled — no claim quantum calculation (time-related costs, prolongation); no expert determination or arbitration tracking; no FIDIC/NEC contract clause compliance check |
| Resource Management + IoT Telemetry | ✅ 100% | **GAP:** IoT telemetry is simulated — no real MQTT/REST integration standard (Oracle requires OPC-UA or ISO 15143-3 for heavy equipment telematics); no equipment preventive maintenance scheduling from utilization hours |
| Construction Setup (Retention Rules, Variation Types) | ✅ 100% | **GAP:** Setup is single-tenant — no global construction setup hierarchy (Oracle: Organization → Project Type → Project for setup override); no tax withholding rule on subcontract payment |
| CSI Global Cost Code Library | ✅ 100% | **GAP:** Cost code library is static — no CSI MasterFormat 2016 live sync; no cost code mapping to Oracle GL natural account segment (Construction PA → GL code derivation); no cost code rate card by labor class |
| Site Compliance Gate (Insurance/Bond expiry block) | ✅ 100% | **GAP:** Compliance gate checks only insurance/bond — no health and safety (RAMS/SWMS) document approval gate; no contractor prequalification score threshold enforcement; no multi-document e-signature workflow |
| Server-Side Pagination for bulk SOV | ✅ 100% | **MINOR GAP:** Pagination is offset-based — cursor-based pagination needed for live SOV editing sessions with concurrent users (race condition on page offset under bulk import) |
| AI Risk Score + Schedule Delay | ✅ 100% | **GAP:** Risk score uses static rule weights — no ML model trained on historical project performance; no BIM (Building Information Model) clash detection integration for risk quantification |
| **[MISSING]** Earned Value Management (EVM) | — | **GAP:** No BCWS/BCWP/ACWP metrics; no SPI/CPI dashboard; no EVA trend chart (Oracle Primavera P6 / Fusion PPM: mandatory for government/infrastructure contracts) |
| **[MISSING]** Drawing & Document Management | — | **GAP:** No Drawing Register with revision control (Oracle ACONEX: core capability — superseded drawing auto-lock, RFC transmittal, distribution list management) |
| **[MISSING]** Schedule (Gantt) Integration | — | **GAP:** No integrated schedule baseline (Oracle + Primavera P6: CPM schedule import/export — critical path, float analysis, what-if baseline comparison) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Core Complete** — deep Oracle/ACONEX cross-reference reveals gaps in EVM, EPC schedule integration, subcontract billing flow, and document management

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| CON-OG-01 | Earned Value Management (BCWS/BCWP/CPI/SPI) | Primavera P6 / Fusion PPM EVM reporting | 🔴 High |
| CON-OG-02 | Drawing & Document Register (Revision Control) | Oracle ACONEX RFC transmittal + revision lock | 🔴 High |
| CON-OG-03 | Schedule (Gantt / CPM) Integration | Primavera P6 import/export + critical path | 🔴 High |
| CON-OG-04 | Subcontract Invoice vs Pay App Matching | SCIV against certified SOV line with retainage | 🔴 High |
| CON-OG-05 | PCO → COR → CO Three-Step Pipeline | Owner + architect countersignature per step | 🟡 Medium |
| CON-OG-06 | Variable Retention Schedule + Release Invoice | Retention reduces at % completion milestones | 🟡 Medium |
| CON-OG-07 | Revenue Recognition Method Toggle (% cost vs completion) | POC method toggle per project type | 🟡 Medium |
| CON-OG-08 | RAMS/SWMS Health & Safety Compliance Gate | H&S document approval blocks site access | 🟡 Medium |
| CON-OG-09 | RFI Transmittal Package (Multi-Party Ball-in-Court) | Formal transmittal with response deadline tracking | 🟡 Medium |
| CON-OG-10 | Claims Quantum Calculation (Prolongation Costs) | Time-related cost calculation per FIDIC clause | 🟡 Medium |
| CON-OG-11 | GL Code from Cost Code Derivation | PA cost code → GL natural account SLA rule | 🟡 Medium |
| CON-OG-12 | Real MQTT/OPC-UA IoT Equipment Telemetry | ISO 15143-3 standard for heavy equipment data | 🟢 Low |
| CON-OG-13 | Lien Waiver Attachment per Pay App | Conditional/unconditional lien waiver tracking | 🟢 Low |

---

### 6. Core HR (Global Human Resources)
**Source:** `analysis_core_hr_gap.md` | **Oracle Equiv:** Oracle Fusion Global Human Resources (HCM)

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Global HR) |
|:---|:---|:---|
| Enterprise Structure (Legal Entity, Legal Employer, PSU) | ✅ Parity | **GAP:** No Payroll Statutory Unit (PSU) → Tax Reporting Unit (TRU) link (Oracle: PSU drives payroll statutory reporting; TRU drives W-2/P60 filing); no legal reporting unit hierarchy for international tax entity mapping |
| Workforce Structure (Jobs, Positions, Grades) | ✅ Parity | **GAP:** Grade structure exists but no Grade Rate (pay rate by grade) or Grade Ladder (progression path) — Oracle HCM core for salary benchmarking; no Benchmark Job classification (Oracle: links position to salary survey data) |
| Person Model (Person ID, Global Name, NID) | ✅ Parity | **GAP:** No global person search across legal entities (Oracle: Person has a single Person ID across all legal employers in the enterprise — dual-employment not modeled); no NID type validation per country (e.g., UK NI format, US SSN format) |
| 3-Tier Employment Model (Person → Work Relationship → Assignment) | ✅ Parity | **GAP:** Dual employment (same person with two active assignments in different legal entities) not modeled; no Employee/Contingent Worker type split at the Work Relationship level (Oracle: `PER_WORK_RELATIONSHIPS.WORKER_TYPE` drives separate payroll flows) |
| Hire / Transfer / Terminate Workflows | ✅ Parity | **GAP:** HR transactions are instant commit — no approval wrapper (Oracle: all lifecycle transactions route through BPM workflow with configurable approval chains, notifications, and FYI participants); no delegation or absence substitute for approvers |
| Effective Dating ("As Of Date") | ✅ Parity | **GAP:** Effective dating is UI-only (query-time filter) — no true datetrack (Oracle: each field change creates a new date-effective row; prior rows are queryable; future-dated changes are held in a pending state until date activation) |
| Manager Hierarchy (Line, Matrix, Dept) | ✅ Parity | **GAP:** Hierarchy is recursive DB query — no visual org chart navigation (Oracle: Workforce Directory with tree-drill UI); no hierarchy version export (org chart as-of a past date); no hierarchy restructuring workbench |
| Checklists / Journeys (Onboarding, Offboarding) | ✅ Parity | **GAP:** Checklist tasks are assigned but no due-date escalation or reminder automation (Oracle: Journey sends automated reminders at D-7, D-1, and overdue; auto-reassigns on manager change); no task completion certificate generation |
| Document Records (Visas, Contracts) | ✅ Parity | **GAP:** Document expiry exists but no auto-notification to employee and HR at N days before expiry; no global document type registry (Oracle: country-specific DT setup per `PER_DOCUMENT_TYPES`); no e-signature integration |
| Area of Responsibility (AOR) RBAC | ✅ Parity | **GAP:** AOR is schema-only — no manager self-service "My Team" view (Oracle: Manager landing page scoped to their direct and indirect reports via AOR); no HR Partner assignment (HRBP covering a population) |
| Analytics Dashboard (Headcount, Attrition, Diversity) | ✅ Parity | **GAP:** Analytics is static aggregation — no cohort analysis (Oracle: retention cohort by hire year/quarter); no DEI goals vs actuals tracking; no flight risk prediction (Oracle AI HCM feature) |
| Field-Level Immutable Audit Log | ✅ Parity | **GAP:** Audit log captures all writes but no automated data quality check (Oracle: Data Quality Dashboard shows blank mandatory fields, duplicate NIDs, invalid grades across all workers) |
| HDL Lite Bulk Data (CSV Import) | ✅ Parity | **GAP:** HDL Lite is CSV only — no HDL dat file format (Oracle standard for mass loads); no transformation template with field mapping; no pre-import validation report showing error counts before committing |
| Server-Side Pagination | ✅ Parity | **MINOR GAP:** Person search is paginated but no saved searches or personalized column sets (Oracle: Users can save and share search criteria and display column sets) |
| **[MISSING]** Payroll Integration (Element Entries) | — | **GAP:** No payroll element entry model from HR (Oracle: Hire action creates salary element entry + standard element entries in payroll — crucial link between HR and Payroll for auto-enrolment, benefits, tax elections) |
| **[MISSING]** Absence Management | — | **GAP:** No absence types, accrual plans, or absence records (Oracle: Absence Management is a sub-module of HCM — accrual engine, absence schedule, manager approval of absence, integration to payroll for absence pay) |
| **[MISSING]** Compensation Workbench | — | **GAP:** No merit cycle / compensation review process (Oracle: Compensation Workbench — manager recommends salary increase within budget, HRBP approves, interfaces to payroll element entry) |

**Overall Oracle Parity Status:** ⚠️ Documented as **100% Tier-1 Certified** — deep Oracle HCM cross-reference reveals critical gaps in payroll integration, absence management, datetrack architecture, and BPM approval flow

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| HR-OG-01 | Payroll Element Entry Integration from Hire | Auto-create salary + element entries on hire | 🔴 High |
| HR-OG-02 | Absence Management (Accrual + Approval + Payroll) | Absence types, accrual plans, manager approval | 🔴 High |
| HR-OG-03 | BPM Approval Workflow on HR Transactions | Configurable approval chains for Hire/Transfer/Term | 🔴 High |
| HR-OG-04 | True Date-Track (Date-Effective Row History) | Each field change creates a new date-effective row | 🔴 High |
| HR-OG-05 | Compensation Workbench (Merit Cycle) | Manager salary recommendations with budget pool | 🔴 High |
| HR-OG-06 | Dual Employment (Multi-Assignment) | Single person, two active assignments in different BUs | 🟡 Medium |
| HR-OG-07 | PSU → TRU Hierarchy for Statutory Tax Reporting | TRU drives country-specific payroll tax filing | 🟡 Medium |
| HR-OG-08 | Grade Rate + Grade Ladder (Salary Benchmarking) | Pay rate per grade + progression path | 🟡 Medium |
| HR-OG-09 | "My Team" Manager Self-Service View | Direct + indirect reports scoped by AOR | 🟡 Medium |
| HR-OG-10 | Document Expiry Auto-Notification | Alert employee + HR N days before expiry | 🟡 Medium |
| HR-OG-11 | Journey Task Due-Date Escalation + Reminders | Auto-reminder at D-7, D-1, overdue | 🟡 Medium |
| HR-OG-12 | Visual Org Chart Navigation (Workforce Directory) | Tree-drill org chart with historical versions | 🟡 Medium |
| HR-OG-13 | Pre-Import Validation Report (HDL) | Error count report before bulk load commits | 🟡 Medium |
| HR-OG-14 | DEI Goals vs Actuals + AI Flight Risk | Diversity goal tracking + attrition prediction | 🟢 Low |
| HR-OG-15 | NID Format Validation per Country | Country-specific NID regex (UK NI, US SSN, etc.) | 🟢 Low |

---

### 7. Cost Management
**Source:** `analysis_cost_management_gap.md` | **Oracle Equiv:** Oracle Fusion Cost Management / Inventory Costing

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Cost Management) |
|:---|:---|:---|
| Standard & Weighted Average Costing | ✅ Parity | **GAP:** FIFO and LIFO costing methods explicitly flagged as roadmap — Oracle supports all four perpetual cost methods (Standard, Weighted Average, FIFO, LIFO) simultaneously per cost book; no lot-level costing (Oracle: `CST_LOT_COSTS` for lot-controlled items) |
| Receipt Accounting (Accruals, Match to PO) | ✅ Parity | **GAP:** Receipt accruals are invoice-matched but no uninvoiced receipt accrual report (Oracle: identifies receipts with no AP invoice, used for period-end accrual journal); no accrual clearing account reconciliation workbench |
| Landed Cost Management (Estimated & Actual LCM) | ✅ Parity | **GAP:** LCM charge types are flat allocation — no weight/volume/quantity/value-based allocation method per charge type (Oracle: each LCM charge is distributed by a configurable allocation basis); no retroactive LCM adjustment when actual differs from estimated |
| Cost Planning (Scenarios, Rollups, Updates) | ✅ Parity | **GAP:** Cost rollup is single-level — no multi-level BOM cost rollup (Oracle: rolls up from components → sub-assemblies → finished goods through all BOM levels with overhead absorption at each level); no make/buy indicator driving routing cost vs purchase cost |
| Period Close (Cost Period Open/Close, Reconcile) | ✅ Parity | **GAP:** Period close reconciliation is dashboard-only — no Inventory Value Report by cost group/organization exportable for finance sign-off; no period-end perpetual to GL reconciliation report (Oracle: `CST_PERIOD_CLOSE_SUMMARY`) |
| WIP Costing (Material, Resource, Overhead) | ✅ Parity | **GAP:** WIP overhead is applied at a flat rate — no overhead absorption rate pool (Oracle: overhead rate by department/resource with fixed/variable split); no WIP scrap accounting (Oracle: generates separate scrap loss journal) |
| Subledger Accounting (Create Accounting, Transfer to GL) | ✅ Parity | **GAP:** SLA journal creation is direct posting — no accounting event class model (Oracle: COGS/Receive/Issue are distinct event classes with separate SLA rules); no transfer pricing for intercompany inventory transactions |
| Analytics (Gross Margin, WIP Valuation) | ✅ Parity | **GAP:** Gross margin report is invoice-level — no COGS matching (Oracle: Revenue-COGS deferred matching when revenue is recognized, per ASC 606 timing); no item profitability report drilling to individual transactions |
| AI Anomaly Engine (IPV/Efficiency Variance Detection) | ✅ Parity | **GAP:** Anomaly detection is rule-based threshold — no ML model comparing against rolling seasonal baseline; no cost trend prediction (future cost based on commodity price indices) |
| Cost Dashboards, Scenario Manager, Distributions Viewer | ✅ Parity | **GAP:** No cost simulation comparing published standard cost vs new proposed cost on open WIP jobs (Oracle: "What-if" cost update analysis before publishing a new standard cost) |
| Multi-Level Approval Workflow for Adjustments | ✅ Parity | **GAP:** The analysis doc explicitly states approval is still **manual/API-based — no dedicated Approval Workflow Engine** (noted as L11 blocker for Tier-1); no standard cost publish approval routing |
| Stress Test (1M+ transactions) | ✅ Parity | **GAP:** Stress test is documented as planned but analysis explicitly flags **"unproven at scale"** as L15 blocker for Tier-1; no queue-based async cost processor with dead-letter queue handling |
| **[MISSING]** FIFO / LIFO Costing | — | **GAP:** Explicitly documented as roadmap — Oracle supports FIFO/LIFO for regulated industries (LIFO required for US GAAP inventory costing in specific sectors) |
| **[MISSING]** Cost Group + Cost Organization Hierarchy | — | **GAP:** No cost organization hierarchy (Oracle: legal entity → cost organization — drives inventory accounting segregation and intercompany cost flows between warehouses) |
| **[MISSING]** COGS Revenue Matching (ASC 606 Deferred) | — | **GAP:** No deferred COGS account (Oracle: when revenue is deferred, COGS is moved to a deferred COGS account and recognized proportionally as revenue is recognized per ASC 606 Step 5) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Functionally Complete / Conditionally Ready** — analysis itself admits L11 (Approval Workflow) and L15 (Scale) as open Tier-1 blockers; Oracle cross-reference adds FIFO/LIFO, multi-level BOM rollup, and COGS matching

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| CM-MG-01 | FIFO / LIFO Costing Methods | Perpetual FIFO/LIFO per cost book | 🔴 High |
| CM-MG-02 | Cost Adjustment Approval Workflow (L11 Blocker) | BPM-gated standard cost publish + adjustment | 🔴 High |
| CM-MG-03 | Deferred COGS / Revenue Matching (ASC 606) | COGS = Revenue recognition timing per POB | 🔴 High |
| CM-MG-04 | Multi-Level BOM Cost Rollup | Component → Sub-Assembly → Finished Good | 🔴 High |
| CM-MG-05 | Cost Organization Hierarchy | Legal Entity → Cost Org for IC cost flows | 🟡 Medium |
| CM-MG-06 | LCM Allocation Method per Charge Type | Weight / volume / value / quantity basis | 🟡 Medium |
| CM-MG-07 | Uninvoiced Receipt Accrual Report | Period-end accrual for receipts without invoice | 🟡 Medium |
| CM-MG-08 | WIP Overhead Rate Pool + Scrap Accounting | Department/resource rate + scrap loss journal | 🟡 Medium |
| CM-MG-09 | SLA Event Class Model for Cost Accounting | Distinct COGS/Receive/Issue event classes | 🟡 Medium |
| CM-MG-10 | Inventory Value + Period-End GL Reconciliation | `CST_PERIOD_CLOSE_SUMMARY` style report | 🟡 Medium |
| CM-MG-11 | Standard Cost What-If Simulation on Open WIP | Impact of proposed cost on in-progress jobs | 🟡 Medium |
| CM-MG-12 | Lot-Level Costing (Lot-Controlled Items) | Separate cost layer per lot number | 🟢 Low |
| CM-MG-13 | Commodity Price Index Cost Trend Prediction | Future cost forecast from market prices | 🟢 Low |

---

### 8. CRM (Customer Relationship Management)
**Source:** `analysis_crm_gap.md` | **Oracle Equiv:** Oracle Fusion CX Sales Cloud / CPQ / Service Cloud / PRM

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion CX Cloud) |
|:---|:---|:---|
| Lead Capture, Scoring, Conversion, Campaigns | ✅ Match | **GAP:** Lead scoring is rule-based (title/revenue/email) — no ML-based predictive lead scoring (Oracle CX: AI-driven fit/intent scores using Eloqua behavior data); no lead deduplication merge wizard; no lead import with data enrichment (Oracle: Dun & Bradstreet enrichment) |
| Opportunity Pipeline (Kanban + DnD, Forecasting) | ✅ Match | **GAP:** Forecasting is weighted pipeline only — no AI-adjusted forecast (Oracle: Sales AI auto-adjusts rep committed forecast based on deal activity); no multi-currency pipeline consolidation; no commit/best-case/upside forecast categories per rep |
| Account 360 (Hierarchy, Interaction History, Installed Base) | ✅ Match | **GAP:** Account hierarchy is tree-view only — no D&B/Hoovers account hierarchy sync (Oracle: Global Account hierarchy enrichment); no relationship intelligence (Oracle: maps relationships between contacts and accounts from email/calendar activity) |
| Service Cloud (Case Mgmt, Field Service, Knowledge Base) | ✅ Match | **GAP:** Case SLA is basic status transition — no SLA milestone/warning/breach escalation engine (Oracle Service Cloud: multiple SLAs per case based on customer segment); no entitlement contract gating (Oracle: blocks case creation if customer has no active service contract) |
| Sales Contracts (MSA/SOW, Expiration Alerts) | ✅ Match | **GAP:** Contract lifecycle is status-only — no obligation management (Oracle CLM: tracks performance obligations, milestones, and penalties within the contract); no contract redline/version tracking with clause library; no e-signature integration (Oracle: DocuSign native) |
| Partner Portal (Deal Registration, Pipeline View) | ✅ Match | **GAP:** Partner deal registration requires manual approval — no incentive funds management (Oracle PRM: Market Development Funds — partners request, marketing approves, tracks ROI); no partner onboarding certification (Oracle: certification path before deal registration unlock) |
| Territories, Quotas, Incentive Compensation | ✅ Match | **GAP:** Territory rules are static assignment — no territory alignment workbench (Oracle: sales manager drags/reassigns accounts between territories and sees instant pipeline impact); quota is rep-level flat — no quota cascade (country → region → district → rep) |
| Order-to-Fulfillment WMS (Wave → Pick → Ship) | ✅ Match | **GAP:** WMS is a simple linear flow — no real-time carrier rate shopping (Oracle SCM: multi-carrier freight rate comparison at shipping); no cross-docking (Oracle WMS: receive directly to outbound dock without putaway); no serial/lot-number track-and-trace through fulfillment |
| Analytics (Win Rate, SLA, Pipeline KPIs) | ✅ Match | **GAP:** Analytics is static aggregation — no activity-based intelligence (Oracle: flags "at-risk" deals where engagement dropped); no revenue attribution (Oracle: first-touch/last-touch/multi-touch attribution on leads-to-revenue) |
| Server-Side Pagination + RBAC | ✅ Match | **GAP:** RBAC is middleware-enforced but no data masking (Oracle CX: field-level security masks sensitive account revenue/competitive data for non-owners); no visibility rule engine (Oracle: complex conditions — e.g., a rep sees only accounts in their territory) |
| Multi-Tenancy Isolation | ✅ Match | **MINOR GAP:** Tenant isolation is `tenantId` on users table — no tenant-level CRM configuration (custom fields, custom objects, custom views) that are isolated per tenant |
| **[MISSING]** Configure-Price-Quote (CPQ) | — | **GAP:** No CPQ engine (Oracle CPQ Cloud: product configurator with constraint-based rules, price waterfall with discounting tiers, quote document generation, and approval workflow for non-standard discounts) |
| **[MISSING]** Digital Sales / B2B Commerce | — | **GAP:** No self-service B2B buyer portal (Oracle CX Commerce: catalog browsing, contract-price display, order history, re-order for B2B buyers) |
| **[MISSING]** Subscription Renewal Management | — | **GAP:** No renewal opportunity auto-creation from contract expiry (Oracle CX: creates renewal opportunity N days before contract end, assigns to renewal rep, tracks renewal rate as a KPI) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Enterprise Ready** — Oracle CX CX/CPQ cross-reference reveals 3 missing pillars (CPQ, B2B Commerce, Renewal Management) and structural gaps in AI forecasting, entitlement management, and territory alignment

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| CRM-OG-01 | Configure-Price-Quote (CPQ) Engine | Product configurator + price waterfall + quote approval | 🔴 High |
| CRM-OG-02 | B2B Self-Service Commerce Portal | Catalog + contract-price + re-order for B2B buyers | 🔴 High |
| CRM-OG-03 | Subscription Renewal Auto-Opportunity | Renewal opp from contract expiry + renewal rate KPI | 🔴 High |
| CRM-OG-04 | AI-Adjusted Sales Forecast (Activity-Based) | Deal risk flagging + AI commit adjustment | 🟡 Medium |
| CRM-OG-05 | SLA Milestone/Breach Escalation Engine | Multi-SLA per case with entitlement gating | 🟡 Medium |
| CRM-OG-06 | Contract Obligation + Redline Management | Obligation tracking + clause library + e-signature | 🟡 Medium |
| CRM-OG-07 | Partner MDF (Market Development Funds) | Fund request → approval → ROI tracking | 🟡 Medium |
| CRM-OG-08 | Quota Cascade (Country → Region → Rep) | Top-down quota distribution with alignment | 🟡 Medium |
| CRM-OG-09 | Territory Alignment Workbench | Drag-reassign with instant pipeline impact view | 🟡 Medium |
| CRM-OG-10 | Revenue Attribution (Multi-Touch) | First/last/multi-touch attribution on L2R | 🟡 Medium |
| CRM-OG-11 | Field-Level Security + Visibility Rules | Data masking + complex territory visibility | 🟡 Medium |
| CRM-OG-12 | D&B Account Enrichment + Hierarchy Sync | Global account hierarchy from Dun & Bradstreet | 🟡 Medium |
| CRM-OG-13 | Cross-Docking + Serial/Lot Track-and-Trace | WMS receive → outbound without putaway | 🟢 Low |
| CRM-OG-14 | Carrier Rate Shopping at Shipment | Multi-carrier freight rate comparison | 🟢 Low |

---

### 9. EPM — Planning, Budgeting & Forecasting
**Source:** `analysis_epm_planning_gap.md` | **Oracle Equiv:** Oracle EPBCS / Planning Cloud / Narrative Reporting

| Feature Area | Documented Status | Oracle Gap (vs Oracle EPBCS / EPM Cloud) |
|:---|:---|:---|
| Strategic & Long-Range Planning (LRP, M&A Simulation) | ✅ Enterprise-Grade | **GAP:** Analysis doc flags this as **"Partial"** (Phase 5 PENDING) — no M&A what-if entity consolidation (Oracle: acquisitions modeled as new entities added mid-year with partial-period consolidation); no capital structure optimization (Oracle: debt/equity ratio simulation with interest coverage covenants) |
| Financial Planning (P&L, Balance Sheet, Cash Flow) | ✅ Enterprise-Grade | **GAP:** Cash flow planning is indirect method — no direct method daily cash planning (Oracle EPBCS: separate Direct Cash Flow cube with AR/AP driver linkage); no multi-GAAP balance sheet (IFRS vs GAAP parallel books in same plan) |
| Budget Control (Variance Analysis, ZBB, Encumbrance) | ✅ Enterprise-Grade | **GAP:** Encumbrance control is recorded but no hard-stop budget check at transaction entry (Oracle: Budgetary Control stops PO creation if over-budget by cost center); no ZBB package approval workflow (Oracle: each ZBB package routes through a separate configurable approval) |
| Rolling Forecast (12/18/24 month, Dynamic Seeding) | ✅ Enterprise-Grade | **GAP:** Rolling forecast is period-based — no weekly forecast (Oracle EPBCS: weekly granularity with calendar week rollup to monthly); no Sales Flash integration (Oracle: daily flash from CRM actuals seeds forecast) |
| Driver-Based & Scenario Planning (Goal-Seeking, Sensitivity) | ✅ Enterprise-Grade | **GAP:** Driver library is single-variable — no Monte Carlo simulation (Oracle: runs thousands of random simulations across correlated drivers to produce a probability distribution of outcomes); no sensitivity tornado chart |
| Workforce Planning (Headcount, Benefits, Compensation) | ✅ Enterprise-Grade | **GAP:** Workforce plan is position-level — no skills-based capacity planning (Oracle HCM+EPM: plan by skill, certifications, and competency fill-rate); no union/collective bargaining agreement rate table integration |
| CapEx Planning (Asset Lifecycle, Depreciation) | ✅ Enterprise-Grade | **GAP:** Depreciation simulation is straight-line only — no accelerated depreciation method (MACRS/DDB) simulation in plan; no lease vs. buy analysis (Oracle: NPV/IRR comparison for capital vs. operating lease decision) |
| S&OP / Manufacturing Integration (Demand/Supply Sync) | ✅ Enterprise-Grade | **GAP:** S&OP planning is demand-driven only — no rough-cut capacity planning (Oracle ASCP: machine/labor hour constraint vs demand plan); no inventory target-day computation per SKU/location |
| Revenue/Margin Planning (Price-Volume-Mix) | ✅ Enterprise-Grade | **GAP:** PVM analysis is revenue-level — no promotion/trade-spend modeling (Oracle TPM: trade promotion uplift curves per account/product); no customer profitability by net revenue (gross-to-net deductions by customer) |
| Treasury Planning (Cash Flow Forecasting) | ✅ Enterprise-Grade | **GAP:** Analysis doc flags this as **"Partial / Major gap"** (Phase 5 PENDING) — no direct method daily cash forecasting; no debt maturity schedule planning; no FX hedging effectiveness simulation (Oracle EPBCS Treasury: cash position + FX hedging overlaid) |
| Intercompany Eliminations | ✅ Enterprise-Grade | **GAP:** IC eliminations are at-plan summary level — no IC matching discrepancy alert (Oracle FCCS: flags where Entity A's IC revenue ≠ Entity B's IC expense before consolidation); no transfer price adjustment in plan (Oracle: TP simulation per OECD method) |
| ESG Planning (Carbon, Diversity) | ✅ Enterprise-Grade | **GAP:** Analysis doc flags ESG as **"Critical Gap / Not Available"** (Phase 5 PENDING) — no Scope 1/2/3 carbon footprint driver model; no GHG emission factor library; no carbon credit/offset budgeting; no DEI representation target by job family |
| AI/Predictive Forecasting (Python ML Bridge) | ✅ Enterprise-Grade | **GAP:** ML bridge is linear regression only — no ensemble model (ARIMA + Prophet + LSTM); no automatic model selection based on data characteristics; no explainability output (Oracle AI EPM: shows which drivers contributed to forecast change) |
| Governance (Workflow, Locking, Row-Level Security) | ✅ Enterprise-Grade | **GAP:** Workflow is DRAFT→APPROVED status — no task list management (Oracle EPBCS: structured Task List with due dates, dependencies, status roll-up for the entire planning cycle); no cell-level commentary collection (Oracle: annotate individual plan cells with business justification) |
| GL Real-Time Sync | ✅ Enterprise-Grade | **GAP:** GL sync is direct query to `gl_balances` — no incremental delta load (Oracle: only changed GL balances are loaded, reducing overhead); no actuals-to-plan mapping rule (Oracle: `gl_account` maps to a plan account via a configurable chart of accounts mapping rule) |
| **[MISSING]** Essbase-Style Hypercube / Block Storage | — | **GAP:** NexusAI EPM uses a relational `plan_units` table — Oracle EPM uses the Essbase MOLAP engine (block storage option / aggregate storage option) for sub-second multi-dimensional slice-and-dice on millions of cells; no sparse/dense dimension configuration |
| **[MISSING]** Narrative Reporting (Management Reports) | — | **GAP:** No pixel-perfect management report builder (Oracle Narrative Reporting: combines financial data with text commentary, charts, and tables in a Word/PDF-style report with version control for board-level reporting) |
| **[MISSING]** Financial Consolidation (FCCS-equivalent) | — | **GAP:** No currency translation with OCI/CTA (Oracle FCCS: translates subsidiary financials at closing/average/historical rates, books CTA to equity; handles minority interest, goodwill, and purchase price allocation in consolidation) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Enterprise Grade** — analysis itself flags Strategic LRP, Treasury Daily Cash, and ESG as Phase 5 PENDING critical gaps; Oracle cross-reference adds MOLAP/Essbase engine, Narrative Reporting, and Financial Consolidation (FCCS) as missing pillars

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| EPM-OG-01 | ESG / Carbon Planning (Scope 1/2/3) | Self-admitted Critical gap (Phase 5 PENDING) | 🔴 High |
| EPM-OG-02 | Treasury Daily Cash + FX Hedging Plan | Self-admitted Major gap (Phase 5 PENDING) | 🔴 High |
| EPM-OG-03 | Financial Consolidation / FCCS (CTA, Minority Interest) | Currency translation + minority interest + goodwill in consolidation | 🔴 High |
| EPM-OG-04 | Essbase MOLAP Engine (Block Storage) | Sub-second multi-dimensional query on millions of cells | 🔴 High |
| EPM-OG-05 | Narrative Reporting (Board-Level Management Reports) | Financial data + commentary + chart in PDF/Word format | 🔴 High |
| EPM-OG-06 | Hard-Stop Budgetary Control at Transaction | Block PO/invoice when over-budget by cost center | 🔴 High |
| EPM-OG-07 | Monte Carlo Simulation + Tornado Chart | Probability distribution across correlated drivers | 🟡 Medium |
| EPM-OG-08 | Weekly Rolling Forecast + Daily Sales Flash | Weekly granularity with CRM actuals seeding | 🟡 Medium |
| EPM-OG-09 | Direct Method Daily Cash Flow Forecasting | AR/AP driver-linked daily cash position | 🟡 Medium |
| EPM-OG-10 | M&A Entity What-If (Mid-Year Consolidation) | New entity added mid-year with partial-period results | 🟡 Medium |
| EPM-OG-11 | Structured Task List + Cell-Level Commentary | Planning cycle task management + cell annotation | 🟡 Medium |
| EPM-OG-12 | IC Matching Discrepancy Alert | Flag IC revenue ≠ IC expense before consolidation | 🟡 Medium |
| EPM-OG-13 | Accelerated Depreciation + Lease vs Buy Analysis | MACRS/DDB + NPV/IRR for capital decision planning | 🟡 Medium |
| EPM-OG-14 | Trade Promotion / Gross-to-Net Deductions Planning | Promotion uplift curves + customer net revenue | 🟢 Low |
| EPM-OG-15 | AI Model Explainability + Ensemble Forecasting | Driver contribution + ARIMA/Prophet/LSTM ensemble | 🟢 Low |

---

### 10. ESS / MSS (Employee & Manager Self-Service)
**Source:** `analysis_ess_mss_gap.md` | **Oracle Equiv:** Oracle Fusion HCM Self-Service / Oracle HR Help Desk

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion HCM Self-Service) |
|:---|:---|:---|
| Personal Information (Effective-dated changes, PII validation) | ✅ 100% | **GAP:** Effective-dated changes only for address/name — no Life Event configuration (Oracle: marriage, birth, adoption trigger specific guided change flows with benefits re-enrollment cascade); no National Identifier validation by country (Oracle: validates Emirates ID format in UAE, NIN in UK) |
| Payroll / Deductions (Voluntary deductions, Retro-pay, PDF Payslips) | ✅ 100% | **GAP:** PDF payslips are listed as build-ready task — no high-fidelity PDF with employer branding; no multi-currency payslip for international assignments (Oracle: payslip shows home + host currency for expats); no payslip delivery to encrypted employee portal archive |
| Statutory Forms (US W-4, UK P45, AE localized compliance) | ✅ 100% | **GAP:** Static form delivery only — no e-signature integration (Oracle: W-4 digitally signed on-screen); no ATO Tax File Number Declaration (Australia) or GOSI form (Saudi Arabia / GCC); no form auto-population from stored HR data |
| MSS Delegation / Proxy (Secure date-based authority) | ✅ 100% | **GAP:** Delegation is date-based only — no action-specific delegation (Oracle: Manager A can delegate only "Leave Approval" to Manager B, not all actions); no delegation audit trail viewable by the HR administrator |
| MSS Team Productivity (Real-time analytics, Quick Actions) | ✅ 100% | **GAP:** Quick Actions are static menu items — no configurable Quick Action layout per manager persona (Oracle: each manager type sees different quick actions based on HR role); no team-level succession readiness score |
| Parallel Approval Routing + Auto-Escalation + Nudges | ✅ 100% | **GAP:** Escalation is cron-based (3 days) — no configurable escalation threshold per transaction type (Oracle: salary change escalates in 1 day, address change in 7 days); no approval chain visualization for the requestor to track real-time progress |
| RBAC & Privacy (AOR, Persona-based isolation) | ✅ 100% | **GAP:** Data masking noted as "planned" (not implemented) — no field-level masking per role (Oracle: Salary shown to HR only, masked to manager unless compensation admin); no AOR territory-based filtering in global search |
| Proactive AI Guide / HUD | ✅ 100% | **GAP:** AI guide is deterministic intent-routing — no natural language HR Help Desk (Oracle HR Help Desk: employee asks "how many sick days do I have" and receives real-time balance from payroll); no article recommendation from HCM Knowledge Base |
| Server-Side Pagination (StandardTable) | ✅ 100% | **MINOR GAP:** Pagination exists but no configurable page size per user preference (Oracle: employees set preferred rows-per-page, retained across sessions) |
| **[MISSING]** Benefits Open Enrollment | — | **GAP:** No benefits self-service for open enrollment (Oracle Benefits: employee selects health plan, dental, vision, FSA/HSA during open enrollment window; system enforces election deadlines, generates confirmation statement) |
| **[MISSING]** My Career & Learning Self-Service | — | **GAP:** No employee career profile or learning enrollment (Oracle: employees update skills, enroll in courses, view learning objectives, and track certification expiry from ESS) |
| **[MISSING]** HR Help Desk (Service Request) | — | **GAP:** No self-service HR case/ticket creation (Oracle HR Help Desk: employees raise HR service requests, tracked SLA-based to HR agents, with knowledge article suggestions to deflect tickets) |
| **[MISSING]** Total Compensation Statement | — | **GAP:** No annual total compensation statement (Oracle: displays salary + bonus + equity + benefits + pension in a single PDF statement for the employee for offers and year-end reward communication) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Certified** — Oracle HCM cross-reference reveals 4 missing pillars (Benefits Open Enrollment, Career/Learning Self-Service, HR Help Desk, Total Compensation Statement) and structural gaps in escalation configurability, life events, and field-level masking

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| ESS-OG-01 | Benefits Open Enrollment Self-Service | Health/dental/vision/FSA election with confirmation | 🔴 High |
| ESS-OG-02 | HR Help Desk (Employee Service Request) | HR ticket + SLA tracking + KB deflection | 🔴 High |
| ESS-OG-03 | Total Compensation Statement | Salary + bonus + equity + benefits PDF | 🔴 High |
| ESS-OG-04 | My Career & Learning Self-Service | Skills update + course enrollment + cert expiry | 🔴 High |
| ESS-OG-05 | Life Event Configuration | Marriage/birth trigger guided change + benefits cascade | 🟡 Medium |
| ESS-OG-06 | Action-Specific Delegation | Delegate only leave approval, not all manager actions | 🟡 Medium |
| ESS-OG-07 | Field-Level Salary Masking | Role-based salary visibility (HR vs. manager) | 🟡 Medium |
| ESS-OG-08 | Configurable Escalation Threshold per Transaction | Different escalation timers per action type | 🟡 Medium |
| ESS-OG-09 | Approval Chain Visualization | Real-time progress tracker for requestor | 🟡 Medium |
| ESS-OG-10 | Multi-Currency Expat Payslip | Home + host currency on payslip for global assignments | 🟡 Medium |
| ESS-OG-11 | National ID Validation by Country | Format-check Emirates ID, NIN, etc. | 🟡 Medium |
| ESS-OG-12 | e-Signature on Statutory Forms | W-4 / P45 digitally signed in-app | 🟡 Medium |
| ESS-OG-13 | GCC / Australia Statutory Form Localization | GOSI (Saudi), ATO Tax File Declaration (Australia) | 🟢 Low |

---

### 11. Expense Management
**Source:** `analysis_expense_management_gap.md` | **Oracle Equiv:** Oracle Fusion Expenses / SAP Concur

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Expenses / SAP Concur) |
|:---|:---|:---|
| Smart Capture (OCR — High-fidelity extraction) | ✅ Tier-1 | **GAP:** OCR is heuristic-based — no itemized hotel folio parsing (Oracle: extracts room rate, taxes, F&B separately from hotel receipt); no vendor-specific receipt template library (Concur: pre-trained on 500+ merchant formats for high accuracy) |
| Corporate Card Feed Reconciliation (Automated sync & matching) | ✅ Tier-1 | **GAP:** Card feed is OFX-format only — no Visa/Mastercard Smart Data Level 3 data (Oracle: enriches card transactions with line-item data from merchant); no personal vs. corporate card split on same report |
| AI Policy Engine (Weekend anomaly, split detection, fraud scoring) | ✅ Tier-1 | **GAP:** Policy is heuristic fraud scoring — no per-diem policy engine (Oracle: daily per-diem limit by city and country from GSA/HMRC rate tables; auto-calculates allowance vs. actuals); no policy exception pre-approval (Concur: employee requests exception before submitting the expense) |
| Global VAT/GST Engine (Multi-jurisdiction tax reclaim) | ✅ Tier-1 | **GAP:** VAT derivation is rule-based — no VAT reclaim filing integration (Oracle: generates EC Sales List, EC Purchase List for UK/EU VAT reclaim; auto-generates VAT reclaim packets by jurisdiction); no e-invoicing compliance for B2B receipts (Italy SDI, Mexico CFDI) |
| SLA / GL Posting (Direct subledger lifecycle) | ✅ Tier-1 | **GAP:** GL posting is synchronous — no expense accrual at period-end for unsubmitted reports (Oracle: accrues P&L for outstanding unsubmitted expense at month-end controlled by a run-period close step); no project cost integration (Oracle: expense lines posted to project cost with billable flag) |
| Compliance Score (Weighted risk assessment 0-100) | ✅ Tier-1 | **GAP:** Compliance score is computed at report level — no in-flight warning while adding line items (Oracle: flags policy breach in real-time as expense line is entered, before submission); no compliance benchmark by department/manager |
| Multi-Tier Approval Workflow | ✅ Tier-1 | **GAP:** Approval is static hierarchy — no cost center owner approval (Oracle: expenses charged to another cost center route to that cost center's owner for additional approval); no receipt-required threshold enforcement per approver level |
| RBAC + PII Data Protection + Audit Overrides | ✅ Tier-1 | **GAP:** Audit overrides are manual — no automated auditor queue routing (Oracle: high-risk reports routed to internal auditor queue automatically based on compliance score threshold); no IP litigation hold on expense records |
| High-Volume Partitioned Storage + Async Card Sync | ✅ Tier-1 | **GAP:** Partitioned storage is documented as a design target — no real-time expense analytics dashboard (Oracle Analytics: live expense spend by GL account, project, cost center with drill-to-receipt) |
| **[MISSING]** Travel Request & Pre-Authorization | — | **GAP:** No travel request module (Oracle: employee submits travel request for pre-approval, system enforces budget before booking; integrates with TMC/travel booking tools like Concur Travel or Cytric) |
| **[MISSING]** Mileage / Distance Calculation Engine | — | **GAP:** No mileage claim with GPS-based distance calculation (Oracle Expenses: employee enters start/end address, system calculates miles/km using Google Maps and applies IRS/HMRC mileage rate) |

**Overall Oracle Parity Status:** ⚠️ Documented as **100% Tier-1 Certified** — Oracle Fusion Expenses / Concur cross-reference reveals 2 missing pillars (Travel Pre-Authorization, Mileage Engine) and structural gaps in per-diem enforcement, hotel folio parsing, VAT reclaim filing, and expense accrual

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| EXP-OG-01 | Travel Request & Pre-Authorization | Budget-checked travel approval before booking | 🔴 High |
| EXP-OG-02 | Mileage / GPS Distance Calculation Engine | Address-to-address distance + IRS/HMRC rate | 🔴 High |
| EXP-OG-03 | Per-Diem Policy Engine (GSA/HMRC Rates) | City-by-city daily limit with allowance vs actuals | 🟡 Medium |
| EXP-OG-04 | Project Cost Integration (Billable Flag) | Expense lines posted to project cost | 🟡 Medium |
| EXP-OG-05 | Period-End Expense Accrual | Accrue P&L for unsubmitted reports at month close | 🟡 Medium |
| EXP-OG-06 | Cost Center Owner Additional Approval | Route to cost center owner for cross-charging | 🟡 Medium |
| EXP-OG-07 | Automated Auditor Queue Routing | High-risk reports auto-routed by compliance score | 🟡 Medium |
| EXP-OG-08 | VAT Reclaim Filing Integration | EC Sales/Purchase List + jurisdiction reclaim packets | 🟡 Medium |
| EXP-OG-09 | Hotel Folio Line-Item OCR | Room rate / tax / F&B itemized from hotel receipt | 🟡 Medium |
| EXP-OG-10 | In-Flight Policy Warning (Real-Time) | Compliance flag while adding line item, before submit | 🟡 Medium |
| EXP-OG-11 | e-Invoicing Compliance (Italy SDI, Mexico CFDI) | B2B receipt compliance for specific jurisdictions | 🟢 Low |

---

### 12. Fixed Assets (FA)
**Source:** `analysis_fa_gap.md` | **Oracle Equiv:** Oracle Fusion Assets Cloud

| Feature Area | Documented Status |
|:---|:---|
| Asset Lifecycle (Add, Retire, Transfer, Reinstate) + Approvals | ✅ Ready |
| Depreciation Engine (STL, DB, Units of Production) — Async | ✅ Ready |
| Multi-Book (Corporate/Tax) with Independent Lifecycle | ✅ Ready |
| Lease Accounting (IFRS 16 / ASC 842, PV Calc, Liability) | ✅ Ready |
| Physical Inventory (Barcode scanning + Reconciliation) | ✅ Ready |
| Reporting (Roll Forward, Movement Analysis) | ✅ Ready |
| SLA Integration (All events → Subledger Accounting) | ✅ Ready |

**Overall Oracle Parity Status:** ✅ **BUILD APPROVED — All L1-L15 Complete**

---

### 13. Financial Close & Consolidation
**Source:** `analysis_financial_close_gap.md` | **Oracle Equiv:** Oracle Fusion FCCS / Financial Close

| Feature Area | Documented Status | Oracle Gap (vs Oracle FCCS / Financial Close Cloud) |
|:---|:---|:---|
| Close Orchestration (Close Calendar, Task Dependencies, Dependency Graphs) | ✅ Full Parity | **GAP:** Close task graph exists — no external preparer/reviewer assignment (Oracle FCCS: assign each close task to a specific preparer and reviewer, with status roll-up to the close manager dashboard); no email notification per task due date |
| Journal Processing (Batch, Approval, Excel Import) | ✅ Full Parity | **GAP:** Journal approval is rule-based — no statistical journal lines (Oracle: journals accept statistical accounts for headcount/units that don't post to GL but drive reporting); no ADROC (Accounting Hub Rules) for external system journal automation |
| Consolidation Structure (Ledger Sets, Elimination Rules) | ✅ Full Parity | **GAP:** Ledger sets exist — no ownership percentage configuration (Oracle FCCS: minority interest % per subsidiary with auto-calculation of minority share in consolidated P&L); no partial consolidation vs equity method switch per entity |
| Consolidation Logic (Translation, Intercompany Matching — Real Math) | ✅ Full Parity | **GAP:** Analysis doc is contradictory — executive summary explicitly states consolidation logic is **60% mocked** ("placeholder"), while Phase 13 completion note says it was implemented; verification required — IC matching at plan level, CTA calculation confirmed? |
| FX Revaluation Engine | ✅ Full Parity | **GAP:** Revaluation posts to GL — no revaluation grouping by exposure (Oracle: revalue by currency + ledger + market segment separately, not as one batch); no revaluation sensitivity reporting (showing P&L impact at different FX rates before running) |
| Auto-Reconciliation Rules | ⚠️ Partial | **GAP (Self-Admitted):** Auto-reconciliation engine is pending — no system-to-system auto-match (Oracle Account Reconciliation: matches GL balance to sub-ledger balance by rule; flags any unexplained difference for human review); no reconciliation certification workflow (preparer certifies, manager approves) |
| Smart Close (AI Anomaly & Delay Prediction) | ✅ Full Parity | **GAP:** Delay prediction is probability-based — no root-cause drill-down (Oracle: when a task is at-risk, AI identifies the blocking upstream dependency); no close cycle time benchmarking against industry peers (Oracle Analytics: compares your close days vs. industry average) |
| **[MISSING]** Intercompany Invoice Matching (FCCS AR/AP Match) | — | **GAP:** No IC invoice-level matching (Oracle FCCS: matches Entity A's IC invoice to Entity B's IC bill at the line level, enforces that both sides post the same amount before consolidation proceeds) |
| **[MISSING]** Account Reconciliation Certification Portal | — | **GAP:** No structured account reconciliation management (Oracle Account Reconciliation Cloud: reconciler prepares account balance explanation with supporting attachments; reviewer certifies; auto-escalation on missed deadlines; period-over-period variance alerting) |
| **[MISSING]** Tax Provision (ASC 740 / IAS 12) | — | **GAP:** No tax provision module (Oracle Tax Reporting Cloud: calculates current and deferred tax provision by entity, tracks deferred tax assets/liabilities, generates GAAP-to-Statutory book differences, and produces tax package for external auditors) |
| **[MISSING]** Disclosure Management / iXBRL Reporting | — | **GAP:** No XBRL/iXBRL tagging for regulatory filings (Oracle Disclosure Management: SEC EDGAR / FCA/ESMA filings with tagged iXBRL, directly consuming FCCS consolidation data) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Architecture Ready** — analysis doc self-admits consolidation logic is **60% mocked** (contradicted by Phase 13 note); Oracle cross-reference reveals 4 missing pillars (IC Invoice Matching, Account Reconciliation Portal, Tax Provision, Disclosure Management) and structural gaps in auto-reconciliation and ownership percentage configuration

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| FC-OG-01 | Account Reconciliation Certification Portal | Preparer certify + reviewer approve + auto-escalation | 🔴 High |
| FC-OG-02 | Tax Provision Engine (ASC 740 / IAS 12) | Current + deferred tax provision per entity | 🔴 High |
| FC-OG-03 | Disclosure Management / iXBRL Tagging | SEC EDGAR / ESMA-compliant iXBRL regulatory filings | 🔴 High |
| FC-OG-04 | IC Invoice-Level Matching (FCCS AR/AP) | AR invoice matches AP bill at line level pre-consolidation | 🔴 High |
| FC-OG-05 | Consolidation Logic Completeness Validation | Self-admitted 60% mocked — needs independent verification | 🔴 High |
| FC-OG-06 | Auto-Reconciliation Engine (Self-Admitted) | GL-to-subledger auto-match with exception flagging | 🟡 Medium |
| FC-OG-07 | Ownership Percentage & Minority Interest Config | Minority share auto-calculated in consolidated P&L | 🟡 Medium |
| FC-OG-08 | External Task Preparer/Reviewer Assignment | Per-task owner with email notification and sign-off | 🟡 Medium |
| FC-OG-09 | Revaluation Grouping by Exposure | Revalue by currency + ledger + segment separately | 🟡 Medium |
| FC-OG-10 | Statistical Journal Lines | Non-GL statistical accounts (headcount, units) | 🟢 Low |
| FC-OG-11 | Close Cycle Time Industry Benchmarking | Compare your close days vs. industry average | 🟢 Low |

---

### 14. General Ledger (GL)
**Source:** `analysis_gl_gap.md` | **Oracle Equiv:** Oracle Fusion General Ledger / Oracle Accounting Hub

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion General Ledger) |
|:---|:---|:---|
| Chart of Accounts (COA, Segments, Values, Hierarchies, Ledgers) | ✅ Parity | **GAP:** COA is operational — no alternate account code combinations (Oracle: secondary COA for management reporting alongside statutory COA, mapped via translation rules); no value set security (Oracle: block specific segment values from specific users) |
| Journal Entry (Manual, Import, Reversal, Allocations) | ✅ Parity | **GAP:** Allocations are listed but noted as "logic minimal" in earlier audit — no statistical basis allocations (Oracle: allocate overhead by headcount or square footage using statistical accounts); no recursive allocation (Oracle: pool A allocated to pool B, then pool B allocated to final cost centers) |
| Multi-Currency (Translation Rules, Intercompany) | ✅ Parity | **GAP:** Translation uses rules — no remeasurement (FASB 52: translate monetary items at spot rate, non-monetary at historical rate, with remeasurement gain/loss to P&L separately from CTA); no hyperinflationary accounting (IAS 29 restatement) |
| RBAC Roles (Manager, User, Viewer) | ✅ Parity | **GAP:** RBAC is 3-tier — no segment value security (Oracle: user X can only enter journals to cost center 100-199, not 200+); no journal source restriction (Oracle: AP clerk can only post journals from AP source, not manual) |
| Configuration Hub (Sources, Categories, Calendars, SLA Rules) | ✅ Parity | **GAP:** SLA rules are DB-driven — no external Accounting Hub (Oracle Accounting Hub Cloud: external system transactions converted to journal entries via configurable accounting rules without writing code) |
| Data Access Sets (DAS) + Audit Trails | ✅ Parity | **GAP:** Earlier audit explicitly notes DAS enforcement was a placeholder — no read-only DAS vs. full DAS distinction (Oracle: read-only DAS for financial analysts, full DAS for controllers); no segment balancing enforcement across legal entities |
| Dynamic Account Rules + Auto-Post Engines | ✅ Parity | **GAP:** Auto-post is rule-based — no account derivation from transaction attributes (Oracle: derive GL account from project + expenditure type + employee grade automatically); no secondary ledger for IFRS-to-GAAP journal adjustment |
| NLP Journal Entry + Variance Analysis (AI Leader) | ✅ Leader | **MINOR GAP:** NLP journal is AI-assisted — no embedded digital assistant in Oracle's contextual panel (Oracle Digital Assistant: embedded in right panel, answers "what is the balance of account 5000?" without leaving the GL screen) |
| Budget Versions UI + Budget Manager | ✅ Parity | **GAP:** Budget is a single ledger — no budget hierarchy control (Oracle: country budget owner controls region budgets which control department budgets with cascade overrides); no position-based budgeting (Oracle: budget by position headcount × salary) |
| Async Posting Worker (Enterprise Volume) | ✅ Parity | **GAP:** Async posting is single-threaded background worker — no parallel posting (Oracle: journals split across multiple parallel posting workers by ledger segment); no posting performance SLA monitoring (Oracle: alert if posting takes >5 min) |
| **[MISSING]** FSG Financial Reporting Studio | — | **GAP:** GL notes FSG UI is "basic" (deferred to post-launch) — no Financial Statement Generator row/column formula builder (Oracle FSG: drag-and-drop row definitions with account range formulas, column calculations, comparative periods, and drill-through to journal) |
| **[MISSING]** External Tax Engine Integration | — | **GAP:** Tax integration is mocked ("hooks ready but not active") — no live Vertex O Series / Avalara integration (Oracle: tax engine determines taxable amount and tax code on journal entry in real-time based on header attributes) |

**Overall Oracle Parity Status:** ⚠️ Documented as **100% Parity / Build Approved** — earlier audit versions reveal DAS was a placeholder and allocations were minimal; Oracle cross-reference adds FSG Report Builder (deferred self-admitted), external tax engine, and segment value security as gaps

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| GL-OG-01 | FSG Financial Reporting Studio | Row/column formula builder with drill-through | 🔴 High |
| GL-OG-02 | External Tax Engine Integration (Vertex/Avalara) | Real-time tax calculation on journal entry | 🔴 High |
| GL-OG-03 | Segment Value Security | Block specific COA values from specific users | 🟡 Medium |
| GL-OG-04 | Oracle Accounting Hub (External System Journals) | Convert external transactions to journals via rules | 🟡 Medium |
| GL-OG-05 | Secondary Ledger (IFRS-to-GAAP Adjustment) | Parallel ledger for accounting method differences | 🟡 Medium |
| GL-OG-06 | Recursive Allocations (Pool-to-Pool) | Pool A → Pool B → Cost Centers cascade allocation | 🟡 Medium |
| GL-OG-07 | Remeasurement (FASB 52) + IAS 29 Hyperinflation | Monetary vs non-monetary translation separation | 🟡 Medium |
| GL-OG-08 | Position-Based Budgeting | Budget by headcount × salary at position level | 🟡 Medium |
| GL-OG-09 | DAS Enforcement Completeness | Read-only vs full DAS + segment balancing per entity | 🟡 Medium |
| GL-OG-10 | Parallel Posting Workers + Posting SLA Monitor | Multi-threaded posting + performance alerting | 🟢 Low |

---

### 15. HR Analytics & Reporting
**Source:** `analysis_hr_analytics_gap.md` | **Oracle Equiv:** Oracle Fusion HCM Analytics / Oracle OTBI / Oracle Workforce Intelligence

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion HCM Analytics / OTBI) |
|:---|:---|:---|
| KPI Repository (`hr_kpi_definitions`) | ✅ Implemented | **GAP:** KPI logic is SQL-based — no metric derivation workspace (Oracle OTBI: drag-and-drop metric builder with pre-built HR subject areas; joins across Person, Assignment, Payroll, Absence without writing SQL); no calculated KPI sharing across departments |
| Data Warehouse / Snapshots (`hr_analytics_snapshots`) | ✅ Implemented | **GAP:** Snapshot is daily only — no hourly intra-day snapshot for high-frequency workforce events (Oracle HCM Analytics: near-real-time pipeline from HCM transactional DB to analytics warehouse); no historical edit support (Oracle: correct a past snapshot without losing history) |
| Workforce Trends Dashboard (Headcount, Attrition — Drill-Down) | ✅ Implemented | **GAP:** Dashboard is custom-built — no pre-built Oracle HCM analytics library (Oracle: 200+ pre-built HR analyses covering turnover, compa-ratio, time-to-fill, span of control, internal mobility); no dashboard personalization per user (Oracle: each HR manager pins their own KPIs) |
| Predictive Attrition Forecasting (Linear Regression) | ✅ Implemented | **GAP:** Model is linear regression only — no ensemble attrition prediction (Oracle AI: gradient boosting model using 40+ signals including absenteeism, engagement score, peer-review, promotion recency); no explainability (Oracle: "John is high-risk because: no promotion in 3 years, 20% below market pay") |
| Compliance Reports (Terminations, New Hires — CSV Export) | ✅ Implemented | **GAP:** Compliance is manual CSV only — no EEO-1 Component 1/2 report (Oracle: generates the exact EEOC filing format for US employers); no UK Gender Pay Gap Report (Oracle: auto-calculates and generates the mandated UK government reporting format); no ADA/OFCCP compliance tracking |
| Manager Insights / Skill Gap Analysis | ✅ Implemented | **GAP:** Skill gap is job-profile vs person-skill comparison — no succession coverage ratio (Oracle: shows talent bench depth, e.g., "position has 2 ready-now and 1 ready-in-1-year successor"); no nine-box performance-potential grid with population distribution |
| Deep RLS (`rlsMiddleware` + Field Masking) | ✅ Implemented | **GAP:** Field masking is at report level — no cell-level suppression for k-anonymity (Oracle: suppresses cells where group size < 5 to protect individual identity in DEI reports); no configurable derived analytics roles (Oracle: "HR Analyst in France" sees only France employees) |
| AI Assistant Interface | ✅ Implemented | **GAP:** AI assistant is listed as "Fixed" in post-audit but originally documented as 0% missing — no natural language analytics query (Oracle HCM Analytics AI: "Show me turnover by department for Q3" executes as a live data query, not a pre-calculated response); no anomaly narration |
| Scheduled Job Runner (`JobRunnerService`) | ✅ Implemented | **GAP:** Scheduler is cron-based polling — no event-driven report trigger (Oracle: a new hire triggers an updated headcount snapshot within seconds, not waiting for next cron cycle); no report delivery to secure email with PII redaction |
| Server-Side Pagination for Drill-Down | ✅ Implemented | **MINOR GAP:** Pagination is drill-down only — no server-side pagination on report export (Oracle: exports up to 1M rows in background, available for download); no virtual scroll for 100k+ row analytical grids |
| Column Selector (Report Builder) | ✅ Implemented | **GAP:** Column selector is static — no custom calculated columns in report builder (Oracle OTBI: create a calculated column "Salary / Market Median" inline without backend changes); no conditional formatting (Oracle: cells turn red if attrition > threshold) |
| Granular `HR_ANALYST` Role | ✅ Implemented | **GAP:** Analyst role is single-level — no analytics sensitivity tier (Oracle: Analyst-Salary tier sees compensation data, Analyst-Basic does not; both use the same role prefix with different data security grants) |
| Global/Contextual Filtering (Dept, Entity) | ✅ Implemented | **GAP:** Filters are department/entity — no time-based context switching (Oracle: compare "as of today" vs "as of 12 months ago" across all metrics simultaneously using period context selector) |
| **[MISSING]** Workforce Benchmarking (External Market Data) | — | **GAP:** No external market benchmark integration (Oracle: compares internal compa-ratio, turnover, span of control, and time-to-hire against Radford/Mercer/SHRM industry benchmarks segmented by company size and sector) |
| **[MISSING]** OFCCP / EEO / Statutory HR Compliance Filings | — | **GAP:** No regulatory HR filing engine (Oracle HR Compliance: generates EEO-1, VETS-4212, ADA, OFCCP audit data in required formats; tracks legislative compliance status per jurisdiction) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Certified, 100% Parity** — analysis doc self-admits AI assistant was 0% originally and custom report builder was 10%; Oracle OTBI cross-reference reveals 2 missing pillars (market benchmarking, statutory compliance filing engine) and significant gaps in ensemble ML, statutory reporting, and nine-box succession analytics

**Oracle Gap Summary (Phase 2 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| HRA-OG-01 | EEO-1 / UK Gender Pay Gap Statutory Filing | Exact regulatory format generation per jurisdiction | 🔴 High |
| HRA-OG-02 | Workforce Benchmarking (Radford/Mercer/SHRM) | Internal vs external market comparison by sector | 🔴 High |
| HRA-OG-03 | Ensemble Attrition Prediction + Explainability | Gradient boost + per-employee risk factor narrative | 🔴 High |
| HRA-OG-04 | Natural Language Analytics Query | "Show me turnover by dept Q3" as live data query | 🟡 Medium |
| HRA-OG-05 | Nine-Box Performance-Potential Grid + Reporting | Population distribution + succession coverage ratio | 🟡 Medium |
| HRA-OG-06 | Pre-Built HR Analysis Library (200+ OTBI) | Turnover, compa-ratio, span of control pre-built | 🟡 Medium |
| HRA-OG-07 | Cell-Level Suppression for k-Anonymity | Suppress cells with group size < 5 in DEI reports | 🟡 Medium |
| HRA-OG-08 | Calculated Columns in Report Builder | Inline calculated measure without backend changes | 🟡 Medium |
| HRA-OG-09 | Conditional Formatting (Red/Yellow/Green thresholds) | Cells change color based on threshold breach | 🟡 Medium |
| HRA-OG-10 | Event-Driven Snapshot Trigger | New hire triggers immediate headcount update | 🟡 Medium |
| HRA-OG-11 | Time-Based Context Switching (As-of-date) | Compare today vs 12 months ago across all KPIs | 🟢 Low |
| HRA-OG-12 | Large Export (1M Rows) + Secure Email Delivery | Background jobs for big exports + PII-redacted delivery | 🟢 Low |

---

### 16. HR Compliance & Governance
**Source:** `analysis_hr_compliance_gap.md` | **Oracle Equiv:** Oracle Fusion HCM Compliance / Oracle Regulatory Compliance Cloud

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion HCM Compliance) |
|:---|:---|:---|
| Audit & Traceability (Before/After Field-Level Snapshots) | ✅ Parity | **GAP:** Before/after snapshots exist — no forensic timeline view (Oracle: full chronological audit trail for any employee record showing who changed what and from which IP/device, filterable by date range and field name); no audit log tamper-detection (Oracle: hash-chain log entries so alterations are detectable) |
| Legislative Engine (Dynamic rules — US/UK/EU templates, MODULO) | ✅ Parity | **GAP:** Rule builder is template-based — no legislative calendar auto-update (Oracle: Oracle Fusion receives legislative content updates quarterly for each supported jurisdiction; new laws are delivered as configuration updates without customization); no country-specific statutory checklist for new hire (Oracle: onboarding triggers jurisdiction-specific tasks, e.g., I-9 in US, Right to Work in UK) |
| Compliance Velocity Reporting & Risk Heatmaps | ✅ Parity | **GAP:** Velocity reports are custom-built — no regulatory deadline tracker (Oracle: compliance calendar showing upcoming mandatory reporting deadlines by jurisdiction, e.g., US OSHA 300A due Feb 1, UK Modern Slavery Act statement due annually); no auto-alert when violation backlog exceeds SLA threshold |
| Server-Side Pagination (>50k violations) | ✅ Parity | **MINOR GAP:** Pagination exists — no bulk-action on filtered violation set (Oracle: select 500 violations, approve all with single comment); no violation export with chain-of-custody metadata for legal proceedings |
| Weighted Risk Scoring (`hr_risk_weights`) | ✅ Parity | **GAP:** Risk weights are DB-driven — no risk model versioning (Oracle: save and compare different risk weight configurations to assess impact; track which model produced which score at time of violation); no external risk signal ingestion (Oracle: integrate OSHA inspection history, EEOC charge history from public data) |
| Multi-Step Remediation Approval (Manager → HR, Escalation) | ✅ Parity | **GAP:** Approval chain is Manager → HR — no legal counsel step (Oracle: compliance workflows can include Legal as a mandatory reviewer for violations above a threshold); no EEO charge response workflow (Oracle: when EEOC/DFEH charge is received, opens a structured response workflow for HR + Legal with evidence attachment) |
| GDPR Data Privacy (AOR-based PII Masking, `@MaskPII`) | ✅ Parity | **GAP:** PII masking is decorator-based — no cross-border data transfer compliance (Oracle: enforces rules around transferring EU personal data outside EEA; tracks Standard Contractual Clauses and data processing agreements per vendor); no privacy impact assessment (DPIA) workflow (Oracle: triggered when new data processing activity is defined) |
| Right to Erasure (`AnonymizationService`) | ✅ Parity | **GAP:** Anonymization scrubs HR core tables — no erasure impact map (Oracle: before executing erasure, shows which downstream systems hold copies of the data so all must be included in the erasure request); no erasure audit certificate (Oracle: generates signed PDF confirming erasure was completed within GDPR 30-day SLA) |
| Consent Management + ESS `MyConsents` UI | ✅ Parity | **GAP:** Consent is policy-acknowledgment — no purpose limitation enforcement (Oracle: consent is tied to specific processing purposes; if employee consents to marketing email but not profiling, the system prevents profiling use automatically); no consent withdrawal propagation (Oracle: withdrawal triggers downstream system suppression across integrated tools) |
| Segregation of Duties (SoD) Conflict Detection + Matrix UI | ✅ Parity | **GAP:** SoD is role-conflict detection — no SoD simulation before role assignment (Oracle: when assigning a role, system shows \"this assignment would create X SoD conflicts\" before saving); no cross-application SoD (Oracle GRC: detects SoD conflicts spanning ERP + HCM + Procurement roles simultaneously) |
| **[MISSING]** FCPA / UK Bribery Act Compliance Training Tracking | — | **GAP:** No mandatory compliance training tracking (Oracle Learning + Compliance: tracks annual FCPA, UK Bribery Act, Code of Conduct training completion rates by entity; auto-assigns overdue training; blocks system access for non-completers after deadline) |
| **[MISSING]** Works Council & Union Obligation Management | — | **GAP:** No works council consultation tracking (Oracle: tracks mandatory consultation obligations with works councils or unions before HR decisions, with required notice period enforcement and documentation of council responses) |
| **[MISSING]** Regulatory Filing Calendar (OSHA, EEO, VETS) | — | **GAP:** No integrated regulatory filing calendar (Oracle Compliance Center: centralized calendar of all mandatory regulatory filings by jurisdiction with preparation workflow, approval chain, and submission confirmation tracking) |

**Overall Oracle Parity Status:** ⚠️ Documented as **All Modules Parity (Phases 1-7 Complete)** — the analysis document itself contains an unresolved "EXPLICIT STOP — DO NOT BUILD YET" for Phase 6; Oracle Regulatory Compliance cross-reference reveals 3 missing pillars (FCPA training tracking, works council obligations, regulatory filing calendar) and structural gaps in cross-border data transfer compliance, SoD simulation, and erasure impact mapping

**Oracle Gap Summary (Module 16 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| HRC-OG-01 | FCPA / Bribery Act Compliance Training Tracking | Annual mandatory training completion + access block | 🔴 High |
| HRC-OG-02 | Regulatory Filing Calendar (OSHA/EEO/VETS) | Jurisdiction-specific filing deadlines + workflow | 🔴 High |
| HRC-OG-03 | EEO Charge Response Workflow | EEOC charge structured response with evidence attachment | 🔴 High |
| HRC-OG-04 | Works Council / Union Obligation Management | Consultation notice periods + response documentation | 🔴 High |
| HRC-OG-05 | Cross-Border Data Transfer Compliance | EEA transfer rules + SCC/DPA tracking per vendor | 🟡 Medium |
| HRC-OG-06 | Privacy Impact Assessment (DPIA) Workflow | Triggered when new data processing activity defined | 🟡 Medium |
| HRC-OG-07 | SoD Simulation Before Role Assignment | Preview conflicts before saving role assignment | 🟡 Medium |
| HRC-OG-08 | Cross-Application SoD (ERP + HCM + Procurement) | GRC-level detection across multiple system roles | 🟡 Medium |
| HRC-OG-09 | Erasure Impact Map + Signed Certificate | Downstream system map + PDF erasure confirmation | 🟡 Medium |
| HRC-OG-10 | Legislative Content Auto-Update (Oracle Quarterly) | Jurisdiction law changes delivered as config updates | 🟡 Medium |
| HRC-OG-11 | Risk Model Versioning + Score Audit | Save/compare risk weight configs with historical scores | 🟡 Medium |
| HRC-OG-12 | Consent Purpose Limitation Enforcement | Prevent use of data beyond consented purpose | 🟡 Medium |
| HRC-OG-13 | Audit Log Tamper Detection (Hash-Chain) | Cryptographic integrity check on audit records | 🟢 Low |

---

### 17. Intercompany Accounting (AGIS)
**Source:** `analysis_intercompany_accounting_gap.md` | **Oracle Equiv:** Oracle Fusion AGIS (Advanced Global Intercompany System)

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion AGIS) |
|:---|:---|:---|
| Intercompany Subledger (`ic_batches`, `ic_transactions`) | ✅ Done | **GAP:** IC subledger is separate from GL — no automatic IC account derivation (Oracle AGIS: derives the IC receivable/payable GL account automatically from the Intercompany System Options based on the sending/receiving LE pair; no manual account entry needed); no IC chart of accounts mapping for cross-currency entities |
| Intercompany Invoicing (AR/AP mirror flow) | ✅ Done | **GAP:** IC invoicing is noted as "Mock" in the analysis doc — no e-invoice delivery between entities (Oracle: AGIS generates an AR invoice in the provider's ledger and an AP invoice in the receiver's ledger that are linked and trackable together); no invoice number cross-reference between provider and receiver |
| Approve / Reject / Resubmit Workflow | ✅ Done | **GAP:** Approval is binary (Approve/Reject) — no multi-level receiver approval (Oracle: receiver can require Controller → CFO approval for IC invoices above a threshold); no automatic re-routing if approver is out of office |
| Transfer Pricing Rules (Percentage Markup) | ✅ Done | **GAP:** Transfer pricing is percentage markup only — no cost-plus, market-based, or arm's-length pricing methods (Oracle: AGIS supports cost-plus markup, CUP/TNMM/PSM methods with documentation; each rule can be jurisdiction-specific for tax treaty compliance); no TP documentation report generation |
| GL Balancing + Cross-Ledger Journals | ✅ Done | **GAP:** GL balancing is intra-batch — no IC balance confirmation process (Oracle: period-end IC balance confirmation workflow where provider and receiver must agree on outstanding balances before close proceeds; disagreements open a formal dispute); no automatic interunit accounting (IUA) for shared service deployments |
| Cross-Ledger Settlement (Provider/Receiver Split-Journal) | ✅ Done | **GAP:** Split-journal posts to both ledgers — no multi-currency IC settlement (Oracle: handles IC transactions where provider ledger is USD and receiver ledger is EUR; records exchange difference in a separate IC revaluation account); no settlement date control (Oracle: settlement must occur within N days, else auto-escalate) |
| Netting / Settlement (`NettingService` — Cashless) | ✅ Done | **GAP:** Netting is bilateral (two entities) — no multilateral netting (Oracle Treasury Netting: netting center offsets payables and receivables across 5+ entities simultaneously, producing a single net payment per entity); no netting agreement management (Oracle: stores formal netting agreements with terms, currencies, and settlement cycles) |
| Data Access Sets (Row-Level Security) | ✅ Done | **GAP:** DAS is entity-level row security — no IC relationship access control (Oracle: user can see IC transactions where their entity is EITHER provider OR receiver, but not transactions between two other entities; configurable per IC organization pair) |
| Mass Allocations (`AllocationService` + UI) | ✅ Done | **GAP:** Allocations use formula-based targets — no statistical unit basis (Oracle: allocate shared IT costs by headcount or floor space using statistical accounts as the allocation basis); no recurring allocation schedule (Oracle: allocations run automatically at month-end via a scheduled process, not manually triggered) |
| AI Anomaly Detection (High Value, Duplicate, Unauthorized) | ✅ Done | **GAP:** Anomaly detection flags three types — no predictive dispute likelihood scoring (Oracle: AI scores each IC transaction on likelihood of receiver dispute based on prior history, allowing proactive clarification before submission); no pattern-based transfer pricing audit flag (Oracle: flags pricing that deviates from the approved TP policy by entity and transaction type) |
| Server-Side Pagination | ✅ Done | **MINOR GAP:** Pagination covers batch list — no mass IC import (Oracle: bulk-import IC transactions from CSV/spreadsheet with validation; supports 10,000+ lines in a single import batch for shared-service center operations) |
| Dispute Management | ⚠️ Partial | **GAP (Self-Admitted):** Full dispute object model is pending — Oracle AGIS has a complete dispute lifecycle: receiver raises formal dispute → provider responds with evidence → escalation to both CFOs → resolution record with accounting impact; no aged dispute report (Oracle: shows IC disputes by entity, aging bucket, and financial impact) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Enterprise Ready** — analysis doc explicitly notes IC invoicing is "Mock" and dispute object model is pending; Oracle AGIS cross-reference reveals structural gaps in IC account auto-derivation, period-end balance confirmation, multilateral netting, multi-currency IC settlement, and full dispute lifecycle

**Oracle Gap Summary (Module 17 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| AGIS-OG-01 | Full IC Dispute Lifecycle | Formal dispute → response → escalation → resolution | 🔴 High |
| AGIS-OG-02 | IC Balance Confirmation at Period-End | Provider/receiver agree outstanding balances before close | 🔴 High |
| AGIS-OG-03 | Multilateral Netting Center | Net payables/receivables across 5+ entities simultaneously | 🔴 High |
| AGIS-OG-04 | IC Invoice Mock → Real AR/AP Link | Linked AR invoice in provider + AP in receiver ledger | 🔴 High |
| AGIS-OG-05 | Multi-Currency IC Settlement | Exchange difference to IC revaluation account | 🟡 Medium |
| AGIS-OG-06 | Arm's-Length / TNMM / PSM Transfer Pricing Methods | Full OECD-compliant TP method support + documentation | 🟡 Medium |
| AGIS-OG-07 | IC Account Auto-Derivation (by LE pair) | Automatic IC receivable/payable GL account from system options | 🟡 Medium |
| AGIS-OG-08 | Statistical Unit Allocation Basis (Headcount/Floor Space) | Headcount or area as allocation driver | 🟡 Medium |
| AGIS-OG-09 | Recurring Allocation Schedule (Month-End Auto-Run) | Auto-scheduled allocation at period end | 🟡 Medium |
| AGIS-OG-10 | Netting Agreement Management | Formal netting terms, currencies, settlement cycles per pair | 🟡 Medium |
| AGIS-OG-11 | Predictive Dispute Likelihood Scoring | AI scores IC transaction on dispute probability pre-submission | 🟡 Medium |
| AGIS-OG-12 | Mass IC Transaction Import (CSV/Spreadsheet) | Bulk 10,000+ line IC transaction import with validation | 🟢 Low |

---

### 18. Inventory Management
**Source:** `analysis_inventory_gap.md` | **Oracle Equiv:** Oracle Fusion Inventory Management / Oracle WMS Cloud

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Inventory Management) |
|:---|:---|:---|
| Multi-Org Structure (Subinventories, Locators) | ✅ Parity | **GAP:** Multi-org structure exists — no locator capacity planning (Oracle: each locator has a defined capacity by volume/weight; system prevents putaway that would exceed capacity); no subinventory netting rules (Oracle: some subinventories are excluded from ATP/netting calculations, e.g., vendor-managed or consignment) |
| Material Transactions (Receipts, Issues, Transfers) | ✅ Parity | **GAP:** Core transactions exist — no account alias issue (Oracle: issue material to a GL account directly without a downstream order, for one-time usage like lab samples); no inter-organization transit inventory (Oracle: goods in transit between orgs exist as a separate balance; receiving org confirms receipt to complete the transfer) |
| Lot & Serial Control | ✅ Parity | **GAP:** Lot and serial tracking exist — no lot genealogy / traceability (Oracle: full upstream and downstream trace — where did lot X come from, and which finished goods used it; critical for pharma, food, aerospace recall management); no lot expiration date enforcement (Oracle: blocks pick of expired lots; first-expiry-first-out picking sequence) |
| Cost Layers (FIFO/Average) | ✅ Parity | **GAP:** FIFO/Average are implemented — no LIFO costing (Oracle Inventory: LIFO cost layer method for jurisdictions that allow it); no standard cost with purchase price variance (PPV) calculation (Oracle: compares PO price to standard cost, posts difference to PPV GL account automatically at receipt) |
| Min-Max Replenishment | ✅ Parity | **GAP:** Min-max planning is item-level — no vendor lead time–based reorder point (Oracle: ROP = daily demand × lead time + safety stock; dynamically updated based on historical consumption and supplier delivery performance); no economic order quantity (EOQ) calculation (Oracle: suggests optimal order quantity minimizing holding + ordering costs) |
| Cycle Counting (Snapshot & Adjustment) | ✅ Parity | **GAP:** Cycle count is snapshot-based — no ABC classification-driven count frequency (Oracle: A-items counted monthly, B-items quarterly, C-items annually; classification auto-updates based on usage value); no count schedule auto-generation (Oracle: generates count sheets by subinventory/locator on the scheduled date) |
| Reservations (Hard/Soft Allocation) & ATP | ✅ Parity | **GAP:** Reservation is binary (hard/soft) — no supply chain ATP (Oracle ASCP ATP: checks supply across all orgs and in-transit inventory, not just on-hand in one org); no capable-to-promise (CTP) that checks production capacity before promising a delivery date |
| **[MISSING]** Consignment Inventory Management | — | **GAP:** No consignment inventory (Oracle: tracks vendor-owned inventory stored at customer site; goods are not owned until consumed; automatic transfer of ownership on usage transaction with supplier liability report) |
| **[MISSING]** Quality Inspection & Hold Management | — | **GAP:** No quality inspection at receipt (Oracle Quality: received goods go to inspection subinventory; quality results trigger Accept/Reject/Rework; rejected lots placed on hold with user-defined disposition plan; integrates with supplier scorecards) |
| **[MISSING]** Catch-Weight / Dual Unit of Measure | — | **GAP:** No dual-UOM / catch-weight (Oracle: items managed in both a primary UOM and a catch weight, e.g., meat ordered by kg but invoiced by piece with variable weight; costing and billing both accommodate the dual measurement — essential for food and chemical industries) |
| **[MISSING]** Physical Inventory (Full Freeze) | ⚠️ Manual via Cycle Count | **GAP:** Physical inventory uses cycle count as a workaround — Oracle has a dedicated Physical Inventory process: freeze all balances at a point in time, generate count tags for the entire warehouse, compare tags to frozen snapshot, adjust differences, and generate a physical inventory variance report for auditors |
| **[MISSING]** Item Revision Control | — | **GAP:** No item revision tracking (Oracle: engineering change orders advance the item revision; inventory is segregated by revision level; shipment and picking rules can enforce minimum revision levels) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Build Approved — Tier-1 Capability Achieved** — analysis doc acknowledges physical inventory uses a cycle-count workaround; Oracle Inventory cross-reference reveals 5 missing pillars (consignment, quality inspection & hold, catch-weight/dual-UOM, proper physical inventory freeze, item revision control) and structural gaps in lot genealogy, LIFO costing, and ABC-driven count frequency

**Oracle Gap Summary (Module 18 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| INV-OG-01 | Lot Genealogy / Traceability (Upstream + Downstream) | Full recall trace for pharma, food, aerospace | 🔴 High |
| INV-OG-02 | Quality Inspection & Hold Management at Receipt | Inspection subinventory + accept/reject/rework disposition | 🔴 High |
| INV-OG-03 | Consignment Inventory (Vendor-Owned On-Site) | Ownership transfer on usage + supplier liability report | 🔴 High |
| INV-OG-04 | Physical Inventory Freeze & Variance Report | Full warehouse freeze + tag count + auditor variance report | 🔴 High |
| INV-OG-05 | Catch-Weight / Dual Unit of Measure | Primary UOM + catch weight for food/chemical industries | 🔴 High |
| INV-OG-06 | Item Revision Control (Engineering Change) | Revision-controlled inventory segregation + picking rules | 🟡 Medium |
| INV-OG-07 | LIFO Costing Layer | LIFO cost method for applicable jurisdictions | 🟡 Medium |
| INV-OG-08 | Standard Cost + Purchase Price Variance (PPV) | PPV auto-posted to GL at receipt vs standard cost | 🟡 Medium |
| INV-OG-09 | ABC Classification–Driven Count Frequency | A/B/C items auto-counted at different frequencies | 🟡 Medium |
| INV-OG-10 | Inter-Organization Transit Inventory | Goods-in-transit balance between orgs | 🟡 Medium |
| INV-OG-11 | Lot Expiration Enforcement (FEFO Picking) | First-expiry-first-out picking + block expired lot issues | 🟡 Medium |
| INV-OG-12 | Supply Chain ATP (Multi-Org + In-Transit) | ATP checks all orgs + in-transit supply, not just on-hand | 🟡 Medium |
| INV-OG-13 | Vendor Lead Time–Based Reorder Point + EOQ | Dynamic ROP with EOQ optimal order quantity suggestion | 🟢 Low |

---

### 19. Landed Cost Management (LCM)
**Source:** `analysis_landed_cost_gap.md` | **Oracle Equiv:** Oracle Fusion Landed Cost Management / Oracle Global Trade Management

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Landed Cost Management) |
|:---|:---|:---|
| Trade Operations (Shipment lifecycle) | ✅ Tier-1 | **GAP:** Trade operations cover shipment lifecycle — no multi-leg routing with intermediate port stops (Oracle GTM: shipment breaks into legs, e.g., Origin Port → Transshipment Port → Destination; each leg has its own charges, carrier, and transit time for accurate cost accumulation) |
| Charge Management (Estimated & Actual) | ✅ Tier-1 | **GAP:** Charge types are user-defined — no classification linkage to customs tariff (Oracle GTM: each charge type maps to a specific customs tariff code; duty rates are auto-calculated based on HS code, origin country, and trade agreement preference); no third-party freight invoice matching (Oracle: auto-matches third-party freight broker invoice to estimated charges and flags discrepancies above tolerance) |
| Cost Allocation (Qty/Value/Weight/Volume) | ✅ Tier-1 | **GAP:** Four allocation bases supported — no allocation by duty rate (Oracle LCM: allocates duty charge proportionally based on each item line's tariff duty rate, not a uniform spread); no retroactive reallocation when actuals arrive (Oracle: when actual duty differs from estimate, retroactively adjusts inventory cost of already-consumed items via retroactive adjustment journal) |
| Inventory Absorption (Dr Inventory / Cr Absorption) | ✅ Tier-1 | **GAP:** Absorption is summary-level — no item-level unit cost update to inventory (Oracle: landed cost variance updates each item's perpetual average cost or FIFO layer; cost inquiry shows base PO cost + landed cost components separately); no cost update to project cost if item was procured for a project |
| AP Integration (Actuals from AP Invoices + Variance) | ✅ Tier-1 | **GAP:** AP actuals are captured — no broker invoice 3-way match (Oracle: matches customs broker invoice to LCM estimated charge + shipment receipt; blocks AP payment if variance exceeds approved tolerance without override approval); no auto-create LCM charge from EDI 810 broker invoice |
| AI Predictive Cost Modeling | ✅ Tier-1 | **GAP:** Prediction uses historical averages — no trade lane intelligence (Oracle GTM AI: predicts total landed cost by trade lane including duty, freight, insurance, and port charges using global trade data; accounts for seasonal freight rate fluctuations and port congestion surcharges) |
| Premium Workbench (SideSheets, Variance Analysis) | ✅ Tier-1 | **GAP:** Workbench is single-org — no global trade operations dashboard (Oracle GTM: consolidated view of all international trade operations across all legal entities with shipment tracking, customs clearance status, and C-TPAT/AEO compliance score per shipment) |
| Server-Side Pagination | ✅ Tier-1 | **MINOR GAP:** Pagination on trade operation list — no background processing for bulk cost absorption (Oracle: when closing 500+ trade operations at month-end, absorption journals created in a background batch with progress tracking and error handling) |
| Variance Accounting (Estimated vs Actual + Accrual Reversal) | ✅ Parity | **GAP:** Variance is posted at close — no partial period accrual (Oracle: if shipment spans month-end, accrues the estimated landed cost in the period goods arrive, with reversal in next period when actuals are processed; critical for accurate monthly COGS) |
| Approval / Period Close Gates | ✅ Parity | **GAP:** Approval is a single-step state machine — no tolerance-based escalation (Oracle: variances within 5% auto-approve; 5-15% route to cost accountant; >15% route to controller with mandatory comment); no integration with period close calendar (Oracle: LCM close blocked until parent inventory period is closed) |
| Granular Audit Trail for Allocation Changes | ✅ Parity | **GAP:** Audit trail covers CREATE/ALLOCATE/CLOSE — no original vs. revised allocation comparison report (Oracle: shows side-by-side original estimate allocation vs. actual allocation per item line for all charges; used for cost accounting sign-off) |
| **[MISSING]** Duty Drawback Management | — | **GAP:** No duty drawback (Oracle GTM: tracks imported goods eligible for duty refund when re-exported; calculates drawback amount, generates CBP/HMRC drawback claim, and posts duty drawback receivable to GL) |
| **[MISSING]** C-TPAT / AEO Supply Chain Security Compliance | — | **GAP:** No trade compliance framework (Oracle GTM: manages C-TPAT (US Customs) and AEO (EU Customs) certifications for suppliers and carriers; flags non-compliant shipments that may face delays or inspections; tracks denied party screening for all trade counterparties) |

**Overall Oracle Parity Status:** ⚠️ Documented as **85% initially → claimed 100% after Phase 7** — Oracle GTM cross-reference reveals 2 additional missing pillars (duty drawback, C-TPAT/AEO compliance) not addressed in any phase, plus structural gaps in multi-leg routing, duty-rate allocation, retroactive cost adjustment, and partial period accrual

**Oracle Gap Summary (Module 19 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| LCM-OG-01 | Duty Drawback Management | CBP/HMRC drawback claim + GL receivable posting | 🔴 High |
| LCM-OG-02 | C-TPAT / AEO Supply Chain Compliance | Trade compliance scoring + denied party screening | 🔴 High |
| LCM-OG-03 | Customs Tariff HS Code Linkage + Duty Auto-Calc | Duty rate auto-derived from HS code + trade agreement | 🟡 Medium |
| LCM-OG-04 | Retroactive Cost Reallocation (Post-Consumption) | Adjust already-consumed item cost when actuals arrive | 🟡 Medium |
| LCM-OG-05 | Broker Invoice 3-Way Match + EDI 810 | AP blocked if variance > tolerance without override | 🟡 Medium |
| LCM-OG-06 | Multi-Leg Routing with Per-Leg Charges | Intermediate port charges accumulated per shipment leg | 🟡 Medium |
| LCM-OG-07 | Partial Period Accrual (Cross-Period Shipments) | Accrue estimated LC at period end; reverse in next period | 🟡 Medium |
| LCM-OG-08 | Tolerance-Based Approval Escalation | <5% auto, 5-15% accountant, >15% controller | 🟡 Medium |
| LCM-OG-09 | Item-Level Perpetual Cost Update (FIFO/Avg Layer) | Unit cost updated at inventory layer level | 🟡 Medium |
| LCM-OG-10 | Trade Lane AI (Seasonal + Port Congestion Pricing) | Freight rate prediction using global trade data | 🟡 Medium |
| LCM-OG-11 | Original vs Revised Allocation Comparison Report | Side-by-side estimate vs actual for cost accountant sign-off | 🟢 Low |

---

### 20. Lease & Contract Management
**Source:** `analysis_lease_contract_gap.md` | **Oracle Equiv:** Oracle Fusion Lease Accounting (OLFM) / Oracle Contract Lifecycle Management (CLM)

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Lease Accounting / CLM) |
|:---|:---|:---|
| Paginated Lease Portfolio (>1M records) | ✅ Built | **GAP:** Portfolio is a flat list — no lease classification dashboard (Oracle OLFM: categorizes leases by finance vs operating, by asset class, by currency, by legal entity; shows portfolio-level ROU asset and lease liability balances with waterfall to prior period) |
| IFRS 16 / ASC 842 Amortization & Liability Schedules | ✅ Built | **GAP:** Schedules are computed at inception — no lease modification / reassessment (Oracle OLFM: when lease is modified (e.g., rental change, extension option exercised), system re-measures the liability at the revised discount rate and posts the remeasurement adjustment; critical for annual reassessments); no variable lease payment handling (Oracle: recognizes variable payments based on usage/index separately from fixed lease payments) |
| GL Integration (Auto-Journal Entry on Recognition) | ✅ Built | **GAP:** GL journals are posted on recognition — no subledger accounting rule configurability (Oracle OLFM uses OLA SLA engine: each lease event maps to a configurable SLA rule with custom account derivation; different asset classes can use different GL accounts without code changes) |
| FA Integration (Auto-Capitalize ROU Assets) | ✅ Built | **GAP:** ROU asset auto-capitalized — no lease-to-asset lifecycle linkage (Oracle OLFM: when lease terminates or asset is retired, ROU asset FA record is automatically retired in the Fixed Assets module; no manual derecognition step required) |
| RBAC Approval Lifecycle (DRAFT → ACTIVE) | ✅ Built | **GAP:** Single approval tier — no parallel legal & finance approval (Oracle: lease commitments above a threshold require simultaneous approval from Legal (contract review) and Finance (budget check) before activation) |
| Contract Repository (MSAs/SOWs — Central) | ✅ Built | **GAP:** Repository is document storage — no contract obligation tracking (Oracle CLM: each contract obligation (e.g., delivery milestone, payment, SLA) is tracked with due dates and owner; auto-alert when obligation is approaching or overdue); no contract renewal management (Oracle: tracks contract expiry, sends alerts, and opens renewal workflow with prior contract terms pre-populated) |
| AI Extraction Wizard | ✅ Built | **GAP (Self-Admitted):** AI clause extraction is explicitly labeled as **(Mock)** in the analysis doc — no production NLP extraction (Oracle: uses OCI Document Understanding to extract lease commencement date, term, payment amounts, renewal options, and key clauses directly from PDF with 90%+ accuracy); no exception queue for low-confidence extractions |
| IFRS 16 Note 16 Maturity Analysis Report | ✅ Built | **GAP:** Note 16 report is a single report — no SEC ASC 842 ROU asset and lease liability rollforward (Oracle: Regulation S-X compliant disclosure with beginning balance, additions, modifications, terminations, and ending balance for the fiscal year); no multi-scenario maturity analysis (Oracle: run Note 16 under "exercise all renewal options" vs "no renewals" for sensitivity disclosure) |
| Lease Amendments History | ✅ Built | **GAP:** Amendment history tracks changes — no amendment impact analysis (Oracle: before confirming an amendment, system shows projected new liability balance, ROU asset carrying value, and P&L impact vs the current schedule) |
| **[MISSING]** Sublease Accounting (Intermediate Lessor) | — | **GAP:** No sublease (Oracle OLFM: when the lessee subleases to a third party, system creates a sublease receivable, recognizes sublease income, and adjusts the head lease ROU asset presentation for IFRS 16 intermediate lessor disclosures) |
| **[MISSING]** Embedded Lease Identification | — | **GAP:** No embedded lease detection (Oracle CLM: scans service and supply contracts for embedded lease language (e.g., dedicated asset clauses) and flags for accountant review to determine if IFRS 16 / ASC 842 capitalization is required) |
| **[MISSING]** Lease vs Buy Analysis | — | **GAP:** No decision support tool (Oracle: given asset cost, residual value, and financing rate, compares NPV of lease payments vs purchase with ownership; produces comparison report for CFO approval of the financing decision) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Ready (Certified)** — analysis doc self-admits AI clause extraction is **Mock**; Oracle OLFM/CLM cross-reference reveals 3 missing pillars (sublease accounting, embedded lease identification, lease vs buy analysis) and critical gaps in lease modification/reassessment, variable lease payments, and contract obligation tracking

**Oracle Gap Summary (Module 20 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| LEASE-OG-01 | Lease Modification & Reassessment | Re-measure liability at revised rate + post adjustment | 🔴 High |
| LEASE-OG-02 | AI Clause Extraction (Currently Mock) | OCI NLP extraction of terms from PDF with 90%+ accuracy | 🔴 High |
| LEASE-OG-03 | Sublease Accounting (Intermediate Lessor) | Sublease receivable + income recognition + IFRS 16 disclosure | 🔴 High |
| LEASE-OG-04 | Contract Obligation Tracking & Renewal Management | Milestone tracking + auto-alert + renewal workflow | 🔴 High |
| LEASE-OG-05 | Embedded Lease Identification in Service Contracts | NLP scan for dedicated asset clauses requiring capitalization | 🟡 Medium |
| LEASE-OG-06 | Variable Lease Payment Handling (Usage/Index) | Separate recognition of variable vs fixed payments | 🟡 Medium |
| LEASE-OG-07 | ASC 842 ROU Asset & Liability Rollforward Report | Reg S-X compliant annual disclosure | 🟡 Medium |
| LEASE-OG-08 | Parallel Legal + Finance Approval for Commitments | Simultaneous two-stream approval above threshold | 🟡 Medium |
| LEASE-OG-09 | Amendment Impact Analysis (Before Confirmation) | Preview new liability + ROU + P&L before saving amendment | 🟡 Medium |
| LEASE-OG-10 | SLA Rule Configurability per Asset Class | Different GL accounts per asset class via rule engine | 🟡 Medium |
| LEASE-OG-11 | ROU Asset Auto-Derecognition on Termination | FA retirement triggered automatically at lease end | 🟡 Medium |
| LEASE-OG-12 | Lease vs Buy NPV Analysis | CFO decision tool comparing financing options | 🟢 Low |

---

### 21. Learning Management System (LMS)
**Source:** `analysis_lms_gap.md` | **Oracle Equiv:** Oracle Fusion Learning Cloud (OLC)

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Learning Cloud) |
|:---|:---|:---|
| Hierarchical Course Catalog (Communities → Subject → Course → Offering → Activity) | ✅ Parity | **GAP:** Catalog structure matches — no catalog visibility rules (Oracle OLC: catalog can restrict visibility of courses by job family, grade, country, or business unit; HR-sensitive courses hidden from non-eligible learners automatically); no course prerequisites enforcement (Oracle: enrollment blocked if prerequisite course not completed with passing grade) |
| Secure Content Delivery (SCORM/Video + Progress Tracking) | ✅ Parity | **GAP:** SCORM/Video supported — no AICC / xAPI (Tin Can) support (Oracle OLC: supports AICC for legacy content and xAPI for modern granular tracking, e.g., tracking specific interactions within a simulation); no offline content package download (Oracle: learners can download course package for offline completion, auto-syncs progress on reconnect) |
| Enrollment (Approval Workflows, Waitlists, Paid Flow) | ✅ Parity | **GAP:** Approval workflows exist — no eligibility profile enforcement (Oracle: enrollment blocked if learner doesn't meet profile criteria like job level, HR status, or completed prerequisites); no automatic waitlist promotion when seat opens (Oracle: when a learner cancels, next on waitlist auto-enrolled and notified) |
| Certification & Recertification (`RecertificationService`, Auto-Renew) | ✅ Parity | **GAP:** Recertification is auto-renewal — no external certification import (Oracle OLC: import externally earned certifications (e.g., PMP, CPA license) with expiry date and attach to worker's learning record; treated the same as internally earned certs for compliance reporting); no certification achievement badge / digital credential (Oracle: issues a verifiable digital badge via Credly integration when certification is earned) |
| Learning Paths / Curricula + Bundling | ✅ Parity | **GAP:** Curricula are bundled — no adaptive learning path (Oracle OLC: based on assessment results, dynamically adjusts the sequence of courses recommended; a learner who scores 90% on a pre-test skips introductory modules); no time-boxed learning journey (Oracle: "Complete this 6-module journey within 30 days" with auto-reminder cadence) |
| Native Quiz/Assessment Engine | ✅ Parity | **GAP:** Quiz engine exists — no question bank with randomization (Oracle: question pools where each learner gets a unique 20-question subset from a 100-question bank; prevents answer sharing); no proctoring integration (Oracle OLC: integrates with ProctorU/Examity for high-stakes assessments requiring identity verification) |
| Instructor Dashboard (Scheduling, Resources) | ✅ Parity | **GAP:** Instructor dashboard covers scheduling — no virtual classroom integration (Oracle OLC: native Zoom/Teams/WebEx integration; attendance marked automatically from video call join/leave events; recording stored in course activity); no instructor substitution workflow (Oracle: when instructor is unavailable, auto-notify alternate instructor and reschedule with learners) |
| Manager Self-Service (Team Assignments, Compliance Dashboard) | ✅ Parity | **GAP:** Manager can assign courses — no team learning budget management (Oracle: manager has a learning budget for their team; course approval checks available budget balance before approval; budget consumed visible on dashboard); no succession-linked learning plan (Oracle: if employee is in a succession plan, auto-assign development courses linked to target role) |
| AI Recommendations + Skill Extraction | ✅ Parity | **GAP:** AI recommendations exist — no LinkedIn Learning / external content integration (Oracle OLC: surfaces LinkedIn Learning, Coursera, or custom content provider courses in the same catalog with a single enrollment click; completions sync back to the learning record); no skills-gap–driven recommendation engine (Oracle: compares employee's current skills to the job profile target skills and recommends courses to close the delta) |
| Field-Level Audit Logging (`hrm_learning_audit_logs`) | ✅ Parity | **GAP:** Audit logs critical actions — no regulatory compliance report (Oracle: pre-built reports for SOX (training completion attestation), OSHA (safety training compliance rate by site), FCPA (code of conduct training completion by legal entity); auto-distributable to compliance officers) |
| Server-Side Pagination | ✅ Parity | **MINOR GAP:** Pagination on admin table — no learning history export (Oracle: export complete learner history in SuccessFactors-compatible or LRS xAPI format for portability and external audit); no bulk enrollment import from CSV (Oracle: HR admin uploads a CSV of 500 workers → enrollments created in batch) |
| **[MISSING]** External Vendor / Training Provider Records | — | **GAP:** No external vendor master (Oracle OLC: stores external training vendors with contact, pricing, and catalog agreements; purchase orders for external training route through Procurement and cost charged to the learning cost center) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Enterprise Ready** — analysis doc explicitly names 3 Day-2 gaps (virtual classroom integration, native quiz authoring upgrade, external vendor records); Oracle OLC cross-reference reveals additional structural gaps in AICC/xAPI content standards, eligibility profile enforcement, LinkedIn Learning integration, adaptive learning paths, and regulatory compliance reporting

**Oracle Gap Summary (Module 21 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| LMS-OG-01 | Virtual Classroom (Zoom/Teams) Integration | Auto-attendance marking from video join/leave events | 🔴 High |
| LMS-OG-02 | LinkedIn Learning / Coursera External Content | Unified catalog + completion sync | 🔴 High |
| LMS-OG-03 | Regulatory Compliance Reports (SOX/OSHA/FCPA) | Pre-built compliance attestation reports | 🔴 High |
| LMS-OG-04 | External Certification Import (PMP/CPA/etc.) | Import externally earned certs with expiry to learning record | 🔴 High |
| LMS-OG-05 | Question Bank with Randomization | Unique question subset per learner from larger pool | 🟡 Medium |
| LMS-OG-06 | Eligibility Profile Enforcement at Enrollment | Block enrollment if learner doesn't meet profile criteria | 🟡 Medium |
| LMS-OG-07 | AICC / xAPI (Tin Can) Content Support | Modern granular interaction tracking beyond SCORM | 🟡 Medium |
| LMS-OG-08 | Adaptive Learning Path (Assessment-Driven Sequence) | Skip modules for high-scoring pre-tests | 🟡 Medium |
| LMS-OG-09 | Skills-Gap–Driven Recommendation (Job Profile Delta) | Current skills vs target role gap auto-course recommendation | 🟡 Medium |
| LMS-OG-10 | Team Learning Budget Management | Budget balance checked before course approval | 🟡 Medium |
| LMS-OG-11 | External Vendor Records + Procurement Integration | Training vendor POs routed through purchasing | 🟡 Medium |
| LMS-OG-12 | Bulk Enrollment Import (CSV) + Learning History Export | 500-learner batch enrollment + xAPI history export | 🟢 Low |

---

### 22. Maintenance & Asset Management (EAM)
**Source:** `analysis_maintenance_gap.md` | **Oracle Equiv:** Oracle Fusion Enterprise Asset Management (EAM) / Oracle IoT Intelligent Applications

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion EAM) |
|:---|:---|:---|
| Supervisor Workbench (Overview, Dispatch, Planning, Financials) | ✅ Wired | **GAP:** Supervisor workbench is unified — no capacity planning vs demand balancing (Oracle EAM: resource planner shows available technician hours vs forecasted WO demand by week/month; highlights over/under capacity by trade or skill); no shutdown/outage planning (Oracle: planned shutdown events that group all WOs for a facility into a single outage window with Gantt chart) |
| Technician Mobile UI (Parts, Time, Offline Sync) | ✅ Wired | **GAP:** Mobile UI supports offline sync — no NFC/barcode-driven asset identification (Oracle EAM Mobile: technician scans asset barcode or NFC tag to auto-pull asset 360 data and open WO without manual search); no GPS log of technician location at WO completion (Oracle: records geo-coordinates when technician closes WO on mobile for field service compliance) |
| Inspection Forms (Dynamic JSON Templates) | ✅ Wired | **GAP:** Dynamic JSON forms exist — no failed inspection → auto-WO creation (Oracle EAM: when an inspection result breaches a threshold, a corrective maintenance work order is automatically created and assigned); no inspection result trend analytics (Oracle: trends failed inspection counts by asset or location to identify systemic quality issues) |
| Material Issue / Parts Management | ✅ Wired | **GAP:** Direct stock decrement implemented — no storeroom replenishment integration (Oracle EAM: when parts fall below reorder point due to WO consumption, a purchase requisition is auto-raised; tracks demand-driven vs calendar-driven replenishment separately); no serialized part tracking (Oracle: tracks serial number of replaced part, links to PO lot, and logs removal from asset) |
| Visual Scheduling / Planning Board | ✅ Wired | **GAP:** Planning board is integrated — no skill-matched auto-assignment (Oracle EAM: when creating a WO, system suggests the best available technician based on required skill code, location, and current workload); no shift scheduling (Oracle: manages technician shifts (day/night/rotating) and prevents assignment during off-shift hours) |
| PM Definitions (Floating/Fixed Intervals) | ✅ Wired | **GAP:** PM supports time intervals — no meter-based PM trigger (Oracle EAM: PM triggered by meter reading e.g., oil change every 5,000 km or filter change every 500 operating hours; meter readings captured from IoT or manual entry); no seasonal PM suppression (Oracle: suppress PMs during planned shutdown periods to avoid generating unnecessary WOs) |
| Asset Hierarchy Tree (Drag-and-Drop) | ✅ Wired | **GAP:** Hierarchy exists — no GIS / spatial asset mapping (Oracle: assets plotted on a floor plan or map; technician opens a building layout and sees which assets need maintenance highlighted by urgency); no asset criticality classification (Oracle: assigns A/B/C criticality rank to each asset; drives PM frequency, spare parts stocking levels, and WO priority escalation rules) |
| Bill of Materials (BOM) Editor | ✅ Wired | **GAP:** BOM editor is implemented — no BOM-driven parts list on WO (Oracle EAM: when creating a WO for an asset, parts list is pre-populated from the asset BOM; technician checks off what they used vs what was pre-loaded); no spare parts catalog with preferred vendor linkage per part |
| IoT Telemetry / Real-Time Charts (Asset 360) | ✅ Wired | **GAP:** UI displays real-time telemetry — no condition-based maintenance (CBM) trigger (Oracle IoT Intelligent Applications: if vibration or temperature exceeds threshold, auto-creates a predictive maintenance WO; trigger is configurable per sensor type and asset class); no digital twin (Oracle: maintains a virtual model of physical asset state that updates from IoT readings and predicts failure modes) |
| Failure Analysis / Failure Code Config | ✅ Wired | **GAP:** Failure code configuration exists — no FMEA / RCM library (Oracle: Failure Mode & Effects Analysis templates linked to asset class; technicians select from standardized cause-failure-remedy triples instead of free text, enabling statistical MTBF/MTTR calculations across fleet); no reliability-centered maintenance (RCM) strategy assignment per asset |
| Work Order Costing (Real-Time Rollup) | ✅ Wired | **GAP:** Cost rollup is real-time — no budget vs actual variance by asset (Oracle EAM: compares annual maintenance budget to YTD actual spend per asset; budget consumed visible on Asset 360; over-budget alerts notify planner); no lifecycle cost analysis (Oracle: total cost of ownership from commissioning to disposal including capex, maintenance, and energy costs) |
| CIP Capitalization → Projects | ✅ Wired | **GAP:** Costs transfer to projects — no automatic asset book value update on capitalization (Oracle: when CIP project is closed, asset cost is capitalized in FA, FA book value updated, and depreciation starts in the same period); no component accounting split (Oracle: large asset split into separately depreciated components, e.g., building = structure + HVAC + electrical) |
| Inventory Integration (Direct Stock Decrement) | ✅ Wired | **GAP:** Stock decrement is direct — no parts reservation for future WOs (Oracle EAM: planner can reserve parts for a scheduled WO 4 weeks out, preventing other work orders from consuming the last unit in stock); no excess parts return to storeroom workflow (Oracle: at WO close, unused parts returned to storeroom, stock balance updated, and cost reversed from WO) |
| Auto-Requisition (Inventory Reorder Service) | ✅ Wired | **GAP:** Auto-requisition triggers reorder — no vendor frame agreement for maintenance parts (Oracle Procurement: blanket PO with preferred vendor for common parts; auto-releases quantity against blanket when triggered by maintenance reorder, skipping full PO creation); no emergency parts procurement escalation (Oracle: for critical assets, emergency requisition bypasses normal approval chain and goes directly to CFO) |
| Server-Side Pagination (Work Orders) | ✅ Wired | **MINOR GAP:** Pagination on WO list — no WO archive and retrieval (Oracle EAM: completed WOs automatically archived after N months but remain queryable; reduces active table size while preserving full history for asset failure trend analysis) |
| Row-Level Security (OrgId Filtering) | ✅ Wired | **GAP:** OrgId filter is scaffolded — no permit-to-work (PTW) integration (Oracle EAM: high-hazard work requires a formal permit (hot work, confined space, electrical isolation); WO cannot be started until permit is issued and all safety precautions are confirmed; permit tracks isolation points and signatory chain) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Build Approved — Ready for Advanced Scenarios** — Oracle EAM cross-reference reveals critical missing pillars: permit-to-work (safety compliance), meter-based PM triggers (operations-critical for fleet/plant), condition-based maintenance from IoT thresholds, GIS spatial mapping, and technician skill-matched auto-assignment; telemetry display is confirmed wired but no CBM trigger logic

**Oracle Gap Summary (Module 22 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| EAM-OG-01 | Permit-to-Work (Hot Work, Confined Space, Electrical Isolation) | WO start blocked until safety permit issued + signed | 🔴 High |
| EAM-OG-02 | Condition-Based Maintenance (CBM) from IoT Threshold | Sensor breach auto-creates predictive WO | 🔴 High |
| EAM-OG-03 | Meter-Based PM Triggers (km / Operating Hours) | PM fired by meter reading, not clock time | 🔴 High |
| EAM-OG-04 | Asset Criticality Classification (A/B/C) | Drives PM frequency, spares stocking, WO priority | 🔴 High |
| EAM-OG-05 | Skill-Matched Auto-Assignment on WO | Best available tech by skill + location + workload | 🟡 Medium |
| EAM-OG-06 | Failed Inspection → Auto Corrective WO | Threshold breach creates WO automatically | 🟡 Medium |
| EAM-OG-07 | FMEA / RCM Library (Cause-Failure-Remedy Triples) | Standardized failure codes for MTBF/MTTR stats | 🟡 Medium |
| EAM-OG-08 | GIS / Spatial Asset Map (Floor Plan View) | Assets on building map with urgency highlight | 🟡 Medium |
| EAM-OG-09 | BOM-Driven Parts Pre-Population on WO | Asset BOM pre-loads expected parts on new WO | 🟡 Medium |
| EAM-OG-10 | Parts Reservation for Future Scheduled WOs | Hold stock for planned WO weeks in advance | 🟡 Medium |
| EAM-OG-11 | Budget vs Actual Variance per Asset + LCD | Annual maint budget vs YTD actual + lifecycle cost | 🟡 Medium |
| EAM-OG-12 | NFC / Barcode Asset Identification on Mobile | Scan tag to auto-load asset 360 + open WO | 🟡 Medium |
| EAM-OG-13 | Vendor Frame Agreement for Maintenance Parts | Blanket PO auto-release for common parts reorder | 🟢 Low |

---

### 23. Manufacturing
**Source:** `analysis_manufacturing_gap.md` | **Oracle Equiv:** Oracle Fusion Manufacturing / Oracle Process Manufacturing (OPM)

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Manufacturing) |
|:---|:---|:---|
| Discrete BOMs (StandardTable UI) | ✅ Pass | **GAP:** BOM structure exists — no engineering change order (ECO) management (Oracle MFG: changes to BOMs are governed by ECOs with effectivity dates; existing open WOs can be updated to the new BOM revision or allowed to complete on the old revision; change authorization requires multi-level approval); no BOM mass change (Oracle: change one material on 200 BOMs simultaneously with single ECO) |
| Process Formulas (Designer — Ingredients/Yield) | ✅ Pass | **GAP:** Formula designer supports ingredients and yield — no co-product / by-product accounting (Oracle OPM: when producing Product A, co-product B and by-product C are simultaneously produced; each gets a cost allocation based on market value or fixed percentage; by-products can have negative cost if they have value); no dynamic formula scaling (Oracle: "I want to produce 500 kg rather than 100 kg" — system rescales all ingredient quantities preserving ratios) |
| Process Recipes (Formula + Routing Link) | ✅ Pass | **GAP:** Recipe links formula to routing — no recipe security (Oracle OPM: recipes can be classified as Proprietary; only authorized users see ingredient quantities for trade-secret formulations); no recipe costing simulation (Oracle: run "what-if" simulations on a recipe to see cost impact of substituting Ingredient A with Ingredient B) |
| Batch Production Workbench (Release & Execute) | ✅ Pass | **GAP:** Batch workbench handles release and execution — no outside processing (Oracle MFG: a work order step that sends sub-assemblies to a third-party vendor for heat treatment or plating; auto-creates a PO for the service, receives the processed goods back, and posts cost to the WO); no shop floor control (Oracle: shop floor dispatching with queue management, operation completion scanning, and automatic WO status progression based on real-time production events) |
| Lot Genealogy (Interactive Tree) | ✅ Pass | **GAP:** Genealogy tree is visual — no forward trace for recall (Oracle OPM: from a specific ingredient lot, forward-traces all finished goods batches that used it and all sales orders shipped to customers; generates a recall list in minutes for regulatory response); no genealogy export for regulatory submission (Oracle: export full genealogy as PDF with electronic signature for pharma batch record) |
| LIMS Quality Results (pH, Density, Purity) | ✅ Pass | **GAP:** LIMS records results — no specification management (Oracle Quality: each item has a spec with upper/lower limits per test; system auto-evaluates pass/fail without manual comparison); no in-process quality checkpoints (Oracle: quality must be confirmed at each routing operation before next operation can begin; non-conformance blocks WO progression) |
| MRP Planning (Server-Side Pagination) | ✅ Pass | **GAP:** MRP is implemented — no constrained capacity planning (Oracle ASCP: MRP respects machine and labor capacity constraints; if capacity is exceeded in week 3, system auto-reschedules to week 4; basic MRP ignores capacity and creates infeasible plans); no supplier lead time variability (Oracle: uses statistical safety lead time based on supplier on-time delivery history) |
| Costing Workbench (Linked to Sidebar) | ✅ Pass | **GAP:** Costing workbench is accessible — no cost roll approval workflow (Oracle MFG: a new standard cost roll must be reviewed and approved by the Cost Accounting Manager before it becomes effective; prevents accidental cost updates affecting inventory valuation) |
| Variance Analysis (Date-Range Filtering + Pagination) | ✅ Pass | **GAP:** Variance analysis has date filtering and pagination — but Variance Analysis pagination was listed as ⚠️ PENDING at time of initial audit (self-admitted); no variance investigation workflow (Oracle: variance exceeding threshold opens an investigation task assigned to cost accountant with root cause and corrective action required fields) |
| Standard Op Library | ✅ Pass | **GAP:** Standard operations exist — no resource (machine/labor) capacity management (Oracle MFG: each operation requires X hours of Machine Center Y and Z hours of Labor Grade A; resource availability and efficiency rates are tracked; overloading any resource generates a capacity shortage alert) |
| All Manufacturing Pages accessible via Sidebar | ✅ Pass | **NOTE (Self-Admitted):** Analysis doc explicitly states screens were **"Orphans"** (in router but missing from Sidebar) at time of initial audit; resolved in that same audit pass — confirms these were undetected regressions, not built-in from the start |
| **[MISSING]** Configure-to-Order (CTO) / Assemble-to-Order (ATO) | — | **GAP:** No configure-to-order support (Oracle MFG: customer-facing configurator captures options (color, size, features); BOM is exploded at order time using option selection rules; no single "configured BOM" stored; each option combination generates a unique phantom WO) |
| **[MISSING]** MES / Shop Floor Integration | — | **GAP:** No manufacturing execution system (MES) integration (Oracle MFG: real-time bi-directional OPC-UA / REST interface to shop floor machines; actual machine counts, cycle times, and downtime events flow into WOs; Oracle provides Oracle MES as a dedicated shop floor execution layer above ERP) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Conditionally Ready → All Audits Resolved** — analysis doc itself called the screens "Orphans" at audit time; Oracle Manufacturing cross-reference reveals structural gaps in ECO management, co-product/by-product accounting, outside processing, constrained capacity planning, configure-to-order, and MES integration that are not addressed in any phase

**Oracle Gap Summary (Module 23 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| MFG-OG-01 | Engineering Change Order (ECO) Management | BOM changes governed by ECO with effectivity + approval | 🔴 High |
| MFG-OG-02 | Outside Processing (Subcontract WO Step) | Auto-PO for vendor service + cost posted to WO | 🔴 High |
| MFG-OG-03 | Constrained Capacity Planning (ASCP) | MRP respects machine/labor capacity with reschedule | 🔴 High |
| MFG-OG-04 | Configure-to-Order / Assemble-to-Order | Option-driven BOM explosion at order time | 🔴 High |
| MFG-OG-05 | Co-Product / By-Product Accounting | Cost allocation to simultaneous co-products/by-products | 🔴 High |
| MFG-OG-06 | Shop Floor Control (Queue + Scan Dispatch) | Real-time operation completion with auto WO progression | 🟡 Medium |
| MFG-OG-07 | MES Integration (OPC-UA / REST to Shop Machines) | Machine counts, cycle times, downtime to WOs in real-time | 🟡 Medium |
| MFG-OG-08 | In-Process Quality Checkpoints (Block Next Operation) | Non-conformance blocks WO progression at each step | 🟡 Medium |
| MFG-OG-09 | Specification Management (UCL/LCL Auto Pass/Fail) | Spec limits per test; auto-evaluate without manual compare | 🟡 Medium |
| MFG-OG-10 | Recall Forward-Trace from Ingredient Lot | Lot → all finished goods → all customer shipments | 🟡 Medium |
| MFG-OG-11 | Resource (Machine/Labor) Capacity Management | Resource availability, efficiency, and shortage alerts | 🟡 Medium |
| MFG-OG-12 | Dynamic Formula Scaling (Target Batch Size) | Scale all ingredient quantities to desired output qty | 🟡 Medium |
| MFG-OG-13 | Variance Investigation Workflow (Root Cause + CAR) | Threshold breach opens task with root cause required | 🟢 Low |

---

### 24. Manufacturing Costing (WIP)
**Source:** `analysis_manufacturing_costing_gap.md` | **Oracle Equiv:** Oracle Fusion Manufacturing Cost Management / WIP Accounting

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Manufacturing Costing) |
|:---|:---|:---|
| Cost Elements (`mfg_cost_elements`, Overhead Rules, Standard Costs) | ✅ Parity | **GAP:** Cost elements exist — no user-defined cost element categories (Oracle MFG Costing: cost elements are organized into Material, Material Overhead, Resource, Outside Processing, and Overhead; each maps to a separate GL account; NexusAI uses a flat cost element list without this sub-classification); no cost element security (Oracle: restrict which roles can update which cost elements) |
| WIP Balances & Variance Journals | ✅ Parity | **GAP:** WIP balances and variance journals exist — no WIP accounting close (Oracle MFG: at period end, WIP accounting close sweeps all open WO variances to variance accounts and closes the WIP accounting period; prevents new transactions from posting to a closed period); no WIP transaction reversal (Oracle: allows reversing a mistaken WIP material issue or resource charge) |
| Standard Costing (Rollup/Update) | ✅ Parity | **GAP:** Standard costing is the only method — no actual/FIFO layer costing for WIP (Oracle MFG: supports actual cost (each WO has its own cost based on actual material and resource transactions) and FIFO layer costing; critical for process manufacturers where batch costs vary); no lot cost tracking (Oracle OPM Lot Costing: tracks the actual cost of every specific ingredient lot used in a production batch — essential for pharma and food manufacturing traceability) |
| Costing Workbench + WIP Dashboard | ✅ Parity | **GAP:** Workbench is functional — no cost roll simulation (Oracle: before updating standard costs, run a simulation showing what the new standard would be and how existing WIP WO variances would be affected; gives CFO a preview before committing); no pending cost maintenance (Oracle: maintains "frozen" standard and "pending" proposed standard simultaneously; switch is a single system action) |
| Variance Analysis (Date Range Filtering + Pagination) | ✅ Parity | **GAP:** Variance analysis is date-filtered — no variance drill-down to source transaction (Oracle: from a variance line, click to drill into the specific WIP material issue, resource charge, or overhead absorption that created the variance; links back to the originating WO and operation); no variance rate vs usage split (Oracle MFG: decomposes variance into efficiency (quantity) variance and rate (price) variance separately, the classic manufacturing accounting split) |
| **[MISSING]** Actual Overhead Absorption (Machine / Labor Hours) | — | **GAP:** No actual overhead absorption (Oracle MFG: overhead rates (e.g., \$15/machine-hour) are applied to WOs based on actual machine or labor hours reported; difference between absorbed overhead and actual spend posted to Over/Under Absorption account; NexusAI uses a flat overhead rule model without rate × actual-hours absorption) |
| **[MISSING]** Outside Processing Cost Tracking | — | **GAP:** No outside processing cost (Oracle MFG: when a WO step involves a vendor service (outside processing), the PO cost flows into the WO as an OSP cost element; WO variance includes OSP rate vs actual variance; NexusAI has no outside processing capability at all as noted in Module 23) |
| **[MISSING]** Cost Update Approval Workflow | — | **GAP:** No cost update governance (Oracle MFG: updating standard costs requires a formal cost update request: proposed costs reviewed by Cost Manager, approved by Controller, then system runs the update; all changes logged in cost history with before/after values and approver name) |
| **[MISSING]** Inventory Revaluation on Standard Cost Update | — | **GAP:** No inventory revaluation (Oracle MFG: when standard costs are updated, all on-hand inventory is revalued at the new standard; the difference is posted to a Standard Cost Variance account; this is a critical accounting event that must happen atomically) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Architecture Approved** — only standard costing is implemented; Oracle Manufacturing Costing cross-reference reveals structural gaps in actual/FIFO WIP costing (critical for pharma/food/process industries), lot cost tracking, actual overhead absorption, outside processing cost, inventory revaluation on cost update, and cost update approval

**Oracle Gap Summary (Module 24 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| WCOS-OG-01 | Actual / FIFO Layer Costing for WIP | Each WO has its own actual cost vs shared standard | 🔴 High |
| WCOS-OG-02 | Lot Cost Tracking (OPM Lot Costing) | Actual cost per ingredient lot used in each batch | 🔴 High |
| WCOS-OG-03 | Inventory Revaluation on Standard Cost Update | On-hand revalued at new standard + variance posted to GL | 🔴 High |
| WCOS-OG-04 | Actual Overhead Absorption (Rate × Actual Hours) | Rate × actual machine/labor hours; over/under absorption account | 🔴 High |
| WCOS-OG-05 | Cost Update Approval Workflow | Proposed cost reviewed + approved before system update | 🟡 Medium |
| WCOS-OG-06 | WIP Accounting Period Close (Sweep Variances) | Period close sweeps open WO variances to variance accounts | 🟡 Medium |
| WCOS-OG-07 | Outside Processing Cost Element Tracking | PO cost flows into WO as OSP cost element with variance | 🟡 Medium |
| WCOS-OG-08 | Variance Drill-Down to Source Transaction | Variance line links to originating WIP issue/charge/absorption | 🟡 Medium |
| WCOS-OG-09 | Rate vs Usage Variance Split (Efficiency vs Price) | Decompose variance into efficiency and rate components | 🟡 Medium |
| WCOS-OG-10 | Pending Standard Cost (Frozen vs Pending Dual View) | Maintain proposed standard alongside frozen; single-switch update | 🟡 Medium |
| WCOS-OG-11 | Cost Element Sub-Classification (OPM 5-element model) | Material, Mat OH, Resource, OSP, Overhead with GL mapping | 🟢 Low |

---

### 25. Master Data Management (MDM)
**Source:** `analysis_mdm_gap.md` | **Oracle Equiv:** Oracle Fusion MDM / TCA / Oracle Customer Data Management (CDM) / Product Hub

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion MDM / TCA / Product Hub) |
|:---|:---|:---|
| TCA Pattern (Parties, Locations, Relationships) | ✅ Done | **GAP:** TCA-aligned party model exists — no party hierarchy publishing (Oracle TCA/CDM: a parent company and all its subsidiaries form a hierarchy that can be published to downstream modules like AR, AP, and Collections; setting a credit limit at the parent applies to all children; NexusAI has relationship viewer but no hierarchy-based credit/risk aggregation); no DUNS number / external registry ID linkage (Oracle: parties linked to D&B DUNS, LEI, or VAT ID stored in `hz_party_sites.party_id`; used for regulatory reporting and supplier risk monitoring) |
| Product Hub / Item Master (PIM — `egp_system_items`) | ✅ Done | **GAP:** Item master is implemented — no item category hierarchy with inheritance (Oracle Product Hub: item categories form a tree (e.g., Electronics > Computers > Laptops); attributes defined at category level are inherited by all items in that category; no need to set the same 50 attributes on every laptop SKU individually); no item revision control (Oracle: each approved change to an item record creates a new revision with effectivity date; previous revision preserved and accessible; critical for engineering-to-manufacturing traceability) |
| Configurable Match/Survivorship Rules | ✅ Done | **GAP:** Match and survivorship rules exist — no probabilistic record linkage (Oracle Enterprise Data Quality (EDQ): beyond fuzzy matching, EDQ uses probabilistic scoring (Fellegi-Sunter model) that weights multiple attributes simultaneously with learned frequency tables; outperforms simple Levenshtein on noisy data); no real-time match-on-create (Oracle CDM: when a new customer is created in any channel, a real-time duplicate check fires before the record is saved; blocks creation of a duplicate and presents merge candidates) |
| Change Request Workflows | ✅ Done | **GAP:** Maker-checker change request workflow exists — no multi-level approval routing based on data domain (Oracle MDM Governance: different approval chains for Customer edits (Sales Manager → Credit → Finance) vs Supplier edits (Procurement → Legal) vs Item categorization changes (Product Manager → Engineering); routing rules are configurable per attribute group); no impact analysis before approval (Oracle: shows steward how many downstream transactions (open POs, open invoices, active contracts) reference the record before approving a change) |
| Data Quality Dashboard & Deduplication Console | ✅ Done | **GAP:** DQ dashboard and dedup console are functional — no data quality scoring per attribute (Oracle EDQ: each record is scored 0–100 per attribute (name completeness, address validity, email format) and an aggregate master data quality score is published; stewards can filter records with score < 70 for remediation); no D&B/Experian external enrichment (explicitly self-admitted as missing in analysis doc; Oracle CDM: one-click enrich a party record from D&B Hoovers to auto-populate SIC code, revenue, employee count, address, phone, and executive contacts) |
| Bulk Import (CSV) | ✅ Done | **GAP:** CSV bulk import is implemented — no pre-import validation report (Oracle Product Hub Import: before committing, system runs the full validation suite and generates an exception report showing rows that would fail, with error codes, allowing user to fix the source file before import); no incremental delta import (Oracle: import only new/changed records since last run using a timestamp column; prevents full re-load of millions of rows every night) |
| Cross-Module PIM Integration (OM/Procurement) | ✅ Done | **GAP:** Active item validation in OM/Procurement is implemented — no item status lifecycle management (Oracle Product Hub: items have statuses (Prototype → Active → Discontinuing → Obsolete); each status controls allowed transactions (e.g., Discontinuing blocks new POs but allows fulfillment of existing orders); NexusAI has only Active/Inactive binary); no MSDS / regulatory attribute management (Oracle: items classified as hazardous store MSDS number, UN hazard class, and restricted-country list; used to block sales order shipping to embargoed regions) |
| **[MISSING]** Global Address Validation (Real-Time) | — | **GAP:** Only basic address validation (self-admitted ⚠️ in analysis doc) — no real-time postal authority validation (Oracle TCA integrates with Loqate/Melissa Data to validate and standardize addresses against postal authority databases at save time; NexusAI has no active integration; incorrect addresses cause failed shipments and AP payments returned) |
| **[MISSING]** AI Anomaly Detection for Master Data | — | **GAP:** Explicitly self-admitted as ❌ MISSING — Oracle MDM Intelligence flags statistically unusual records (e.g., a supplier whose bank account changed within 24 hours of a large payment, or a customer whose address changed to a known fraud locale); triggers a review task automatically |
| **[MISSING]** Party Hierarchy Credit / Risk Aggregation | — | **GAP:** No parent-child hierarchy financial aggregation — Oracle CDM: outstanding AR balance, credit exposure, and Days Sales Outstanding (DSO) roll up to the parent party; credit controller sees the consolidated picture not just the legal entity being transacted with |
| **[MISSING]** Item Lifecycle Costing at Category Level | — | **GAP:** No category-level cost template — Oracle Product Hub: standard cost template attached to item category; when a new item is created in the category, standard cost is auto-populated from the template |
| **[MISSING]** Bulk Export / Data Portability | — | **MINOR GAP:** No full MDM export — Oracle: export complete party/item master to XLSX or SFTP for downstream BI tools or for regulatory data requests (GDPR data portability) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Feature Complete (15/15 backend, 14/15 frontend)** — analysis doc self-admits two remaining gaps (D&B enrichment and AI anomaly detection); Oracle MDM cross-reference reveals additional structural gaps in probabilistic record linkage, party hierarchy credit aggregation, item revision control, category attribute inheritance, item lifecycle status management, MSDS/regulatory attributes, and real-time address validation

**Oracle Gap Summary (Module 25 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| MDM-OG-01 | D&B / Experian External Enrichment | One-click enrich party with revenue, SIC, address, executives | 🔴 High |
| MDM-OG-02 | Real-Time Address Validation (Loqate / Melissa Data) | Postal authority validation at save time | 🔴 High |
| MDM-OG-03 | AI Anomaly Detection (Bank Account Change Alert, etc.) | Statistical flag for unusual MDM changes → review task | 🔴 High |
| MDM-OG-04 | Item Revision Control (Record History with Effectivity Date) | Each item change creates versioned revision; previous preserved | 🔴 High |
| MDM-OG-05 | Item Category Attribute Inheritance (Hierarchy-Based) | Define 50 attributes once at category; inherited by all SKUs | 🟡 Medium |
| MDM-OG-06 | Item Status Lifecycle (Prototype → Active → Discontinuing → Obsolete) | Status controls which transaction types are allowed | 🟡 Medium |
| MDM-OG-07 | Party Hierarchy Credit / AR Aggregation | AR balance + DSO rolls up to parent company | 🟡 Medium |
| MDM-OG-08 | Probabilistic Record Linkage (Fellegi-Sunter / EDQ) | Multi-attribute weighted scoring; learns from corrections | 🟡 Medium |
| MDM-OG-09 | Real-Time Duplicate Check on Create | Match fires before save; blocks duplicate, presents candidates | 🟡 Medium |
| MDM-OG-10 | MSDS / Regulatory Attribute Management | Hazardous item classification blocks shipping to restricted regions | 🟡 Medium |
| MDM-OG-11 | Pre-Import Validation Report (Exception Preview) | Validate file before commit; show rows that would fail | 🟡 Medium |
| MDM-OG-12 | Bulk Export / Data Portability (XLSX / SFTP) | Full party + item export for BI or GDPR data requests | 🟢 Low |

---

### 26. Planning, Budgeting & Forecasting (EPM)
**Source:** `analysis_planning_budgeting_forecasting_gap.md` | **Oracle Equiv:** Oracle EPBCS (Enterprise Planning & Budgeting Cloud) / Oracle FCCS (for close-to-plan integration)

> ⚠️ **Cross-Module Note:** This module shares the same analysis artifact as **Module 9 (EPM — Planning, Budgeting & Forecasting)**. All 15 Oracle gaps documented in Module 9 apply here directly. Module 9 analysis already identified 6 High-severity gaps (ESG, Treasury daily cash, FCCS consolidation, Essbase MOLAP engine, Narrative Reporting, hard-stop budgetary control). The gaps below focus specifically on **budgeting process integration** cross-referencing modules 9, 13 (Financial Close & Consolidation), and 17 (Intercompany Accounting).

| Feature Area | Documented Status | Oracle Gap (vs Oracle EPBCS / cross-referenced with Modules 9, 13, 17) |
|:---|:---|:---|
| Strategic Planning (LRP, M&A) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-10:** No M&A entity what-if consolidation (mid-year entity addition with partial-period results). **Cross-module dependency (Module 13):** Financial Close consolidation is 60% mocked (FC-OG-05) — actuals flowing into the plan from consolidation are therefore unreliable as a planning baseline; plan vs actual variance analysis is structurally broken when the consolidation truth is incomplete |
| Financial Planning (P&L, BS, Cash Flow, Multi-GAAP) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-09:** No direct method daily cash planning. **Cross-module dependency (Module 13):** Account Reconciliation Certification Portal is missing (FC-OG-01) — account balances certified for close are the same balances that seed the plan-to-actual comparison; uncertified actuals create plan targets based on unreconciled GL data |
| Rolling Forecast (Integrated, Driver-based) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-08:** No weekly forecast or daily Sales Flash seeding. **Additional Oracle EPBCS gap:** No forecast-vs-prior-year same-period comparison (Oracle: EPBCS provides a built-in "Prior Year Actual" version that is always available in the planning grid for YOY context without any manual data load) |
| Driver-Based (Global Drivers, Allocations, Formula Manager) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-07:** No Monte Carlo simulation or sensitivity tornado chart. **Additional Oracle EPBCS gap:** No driver ownership assignment (Oracle: each global driver is owned by a specific user; when the driver value changes, the owner is notified; change is versioned with an audit trail) |
| Workforce Planning (Position-Level, Benefits) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-06 area:** Position-level plan is implemented — no incremental hire/attrition scenario (Oracle EPBCS Workforce: model "what if we hire 20 engineers in Q2" with cascading cost impact on salary, benefits, equipment, office space, and IT license budget lines); no merit increase cycle integration (Oracle: approved merit % from HR flows into the plan salary expense without manual re-entry) |
| CapEx Planning (Asset Lifecycle, Depreciation) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-13:** Straight-line only, no MACRS/DDB, no lease vs buy. **Cross-module dependency (Module 13 FC-OG-07):** Minority interest and ownership % config is missing in Financial Close — CapEx plans at consolidated entity level cannot accurately reflect minority-owned subsidiaries |
| Project Finance Planning (POC, Revenue Rec) | ✅ Enterprise-Grade | **Additional Oracle EPBCS gap:** No project-to-budget variance workflow (Oracle: when a project's actual spend exceeds its approved budget, a budget amendment request is auto-triggered requiring PM + Finance approval before additional spend is committed; NexusAI has no project budget amendment workflow) |
| S&OP / Manufacturing (Demand/Supply Sync) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG area:** Demand planning is implemented — no rough-cut capacity planning (Oracle ASCP). **Additional gap:** No promotion/trade-spend demand uplift (Oracle TPM) flowing from Module 9 EPM-OG-14 |
| Revenue/Margin (Price-Volume-Mix) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-14:** No promotion/trade-spend or gross-to-net customer profitability. **Additional Oracle EPBCS gap:** No deal desk / contract-level revenue planning (Oracle: revenue plan can be built from contract backlog in project portfolio; each signed contract contributes POC-based revenue into the plan automatically) |
| Treasury Planning (Cash Flow Forecasting) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-02:** Self-admitted Major gap — no daily cash, no FX hedging simulation. **Cross-module dependency (Module 17 AGIS-OG-03):** Multilateral IC netting center is missing — intercompany cash flows are therefore not correctly modeled in the treasury plan; entities that net their IC positions show inflated gross cash requirements in the treasury forecast |
| Intercompany Elimination Rules | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-12:** IC matching discrepancy alert missing. **Cross-module dependency (Module 17 AGIS-OG-01/02):** Full IC dispute lifecycle and period-end IC balance confirmation are both missing in Module 17 — this means the IC elimination rules in the plan are operating on unconfirmed, potentially disputed IC balances; plan-level IC eliminations may not match close-level eliminations (AGIS-OG-04: IC invoicing is Mock). **Cross-module dependency (Module 13 FC-OG-04):** IC invoice-level matching at close is missing — IC eliminations in the plan cannot be reconciled to actual close IC eliminations; the plan-to-actual IC variance is structurally unmeasurable |
| ESG Planning (Carbon, Diversity) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-01:** Self-admitted Critical gap — Scope 1/2/3, GHG factor library, DEI target by job family all missing (Phase 5 PENDING). No change from Module 9 finding |
| AI/Predictive Auto-Forecast | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-15:** Linear regression only, no ensemble model, no explainability. **Additional Oracle EPBCS gap:** No automated outlier exclusion before model training (Oracle: data points that deviate >3σ from the mean are flagged and excluded from the ML training window to prevent historical anomalies (COVID year, one-off write-offs) from polluting the forecast) |
| Governance (Workflow, Locking, RLS, FLS, SoD) | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-11:** No task list management, no cell-level commentary. **Additional Oracle EPBCS gap:** No planning unit hierarchy lock propagation (Oracle: when a manager locks their planning unit (entity + version), all subordinate planning units are automatically locked; prevents a subordinate planner from changing data after the manager has submitted) |
| GL Real-Time Sync | ✅ Enterprise-Grade | **→ See Module 9 EPM-OG-15 area:** GL sync is direct query — no incremental delta load, no chart of accounts mapping rule. **Cross-module dependency (Module 13 FC-OG-05):** Consolidation logic is 60% mocked — GL balances flowing into the plan from consolidation entities are therefore partial actuals; consolidated plan-vs-actual analysis for subsidiary entities is structurally incomplete |
| **[MISSING]** Hard-Stop Budgetary Control at Transaction | — | **→ See Module 9 EPM-OG-06:** No budget check at PO/invoice creation. This is a standalone structural gap that requires integration between the budget engine and the AP/Procurement transaction layer — NexusAI has no such integration; users can spend over budget without any system prevention |
| **[MISSING]** EPBCS Sandboxing / Sandbox Environment | — | **Additional Oracle EPBCS gap:** No planning sandbox (Oracle EPBCS: an isolated copy of the production plan where Finance can test formula changes, allocation rule updates, or dimension additions without affecting live data; promoted to production via a formal release process) |

**Overall Oracle Parity Status:** ⚠️ Documented as **Tier-1 Compliant** — this module shares its analysis artifact with Module 9 which already carries 15 Oracle gaps (6 High-severity); cross-module dependencies on Module 13 (Financial Close) and Module 17 (Intercompany) reveal that plan-to-actual accuracy is structurally compromised by the 60% mocked consolidation logic (FC-OG-05) and partially mocked IC invoicing (AGIS-OG-04), making the "Enterprise-Grade" self-assessment misleading without those upstream modules being complete

**Oracle Gap Summary (Module 26 Findings — incremental beyond Module 9):**

| Gap ID | Feature | Oracle Fusion Capability | Severity | Cross-Module Link |
|:---|:---|:---|:---|:---|
| PBF-OG-01 | Plan Accuracy Dependency: Consolidation 60% Mocked | Plan-to-actual variance unmeasurable when actuals are mocked | 🔴 High | Module 13 FC-OG-05 |
| PBF-OG-02 | IC Elimination Plan ≠ Close IC Elimination (Mock IC) | Plan IC eliminations can't reconcile to actual close | 🔴 High | Module 17 AGIS-OG-04 |
| PBF-OG-03 | IC Cash Netting Not in Treasury Plan | Multilateral netting missing → treasury plan overstates gross cash | 🔴 High | Module 17 AGIS-OG-03 |
| PBF-OG-04 | EPBCS Sandbox Environment | Isolated plan copy for formula/dimension testing before production | 🔴 High | — |
| PBF-OG-05 | Project Budget Amendment Workflow | Overspend triggers approval before additional commitment allowed | 🟡 Medium | — |
| PBF-OG-06 | Incremental Hire/Attrition Scenario (WFP) | Model N new hires with cascading cost impacts across all budget lines | 🟡 Medium | — |
| PBF-OG-07 | Merit Increase Integration from HR to Plan | Approved merit % from HR auto-updates plan salary expense | 🟡 Medium | — |
| PBF-OG-08 | Planning Unit Hierarchy Lock Propagation | Parent lock cascades to all subordinate planning units | 🟡 Medium | — |
| PBF-OG-09 | Driver Ownership Assignment + Change Audit | Each driver has owner; version-controlled change log | 🟡 Medium | — |
| PBF-OG-10 | Deal Desk / Contract Backlog Revenue Plan | Signed contracts auto-contribute POC revenue to plan | 🟡 Medium | — |
| PBF-OG-11 | Prior Year Actual Version (Built-In YOY Context) | Prior year always available in grid without manual load | 🟡 Medium | — |
| PBF-OG-12 | Uncertified Actuals → Plan Baseline Risk | Account rec certification (FC-OG-01) missing; plan seeds from uncertified GL | 🟡 Medium | Module 13 FC-OG-01 |
| PBF-OG-13 | Automated Outlier Exclusion Before ML Training | 3σ anomalies excluded from forecast training window | 🟢 Low | — |
| PBF-OG-14 | Forecast-vs-Prior-Year Same-Period Comparison | Built-in PY actual version in grid without config | 🟢 Low | — |

---

### 27. Project Portfolio Management (PPM)
**Source:** `analysis_ppm_gap.md` + `analysis_projects_costing_gap.md` | **Oracle Equiv:** Oracle Fusion PPM (Project Management Cloud / Project Costing / Grants Management)

> 🚨 **Critical Contradiction in Source Documents:** `analysis_ppm_gap.md` (the primary gap audit) explicitly states: **API layer is Level 2** (routes point to legacy Agile storage, ignoring `PpmService`) and **UI is Level 0** ("the UI folder `client/src/components/project` does not exist"). The secondary doc `analysis_projects_costing_gap.md` claims 100% remediation but does not reference resolving the API mismatch. The "Remediated" status in the table below should be treated as schema/service-level parity only — user accessibility is unverified.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion PPM) |
|:---|:---|:---|
| Project Foundation (Templates, WBS, Financial Plan Types) | ✅ Remediated | **GAP:** WBS and templates exist at schema level — no resource-loaded schedule (Oracle PPM: each WBS task has assigned resources with planned hours; resource demand drives the cost plan automatically; no manual budget entry needed if resource plan is complete); no project calendar (Oracle: each project has its own working calendar (holidays, work hours) that governs task scheduling and SLA computation) |
| Cost Collection (AP, Inventory, Labor — `collectFromAp`, etc.) | ✅ Remediated | **🚨 SELF-ADMITTED ACCESS GAP:** The primary analysis doc states `collectFromAP()`, `collectFromInventory()`, and `collectFromLabor()` are **inaccessible via API** (routes point to legacy `storage.ts`); no **transaction control date validation** (Oracle: prevents importing expenditure items into a closed period; NexusAI's batch API may accept future-dated or closed-period items without rejection); no employee timesheet integration (Oracle PPM: timesheets submitted in Oracle HCM auto-flow to PPM as labor expenditures; no manual import needed) |
| Burdening (Overhead Allocation Schedules) | ✅ Remediated | **GAP:** Burden matrix exists — no burdened cost reporting to customer (Oracle PPM: for cost-plus government contracts, the invoice to the customer is the burdened cost; burdening must be auditable per DCAA requirements); no provisional vs final burden rate (Oracle: preliminary rate is used during the year; at year-end, final actual rates replace provisional and cost adjustments are retroactively computed) |
| Budgeting (Budget vs Actual, EAC) | ✅ Remediated | **GAP:** Budget vs actual is tracked — no budget version control (Oracle PPM: original budget, revised budget, and current working budget are maintained as separate versions; change history shows who changed what and why authorized); no budget exception report (Oracle: automatically highlights projects where EAC exceeds the approved budget by more than a configurable threshold, routed to the project sponsor) |
| Capitalization (CIP → Fixed Assets) | ✅ Remediated | **GAP:** CIP flow to FA is implemented — no capitalization threshold rule (Oracle: costs below a configured amount (e.g., $2,500) cannot be capitalized, are automatically expensed; threshold is per asset category); no partial capitalization split (Oracle: a single project can have some costs capitalized (the building) and some expensed (training); split rule applied per expenditure type) |
| Inter-Project Cross-Charge / Borrow-Lend | ✅ Remediated | **GAP:** Cross-charge is implemented — no internal order / service work order integration (Oracle: inter-project cross-charges can be backed by an internal service work order that requires the receiving project manager's approval before the cost is transferred; prevents unauthorized charges) |
| Earned Value Management (CPI/SPI Live) | ✅ Remediated | **GAP:** CPI/SPI is calculated live — no schedule performance index trend chart (Oracle: SPI over last 6 periods plotted to show whether schedule performance is improving or degrading; critical for recovery plan decisions); no at-completion variance (VAC = Budget at Completion − Estimate at Completion) with drill-down per WBS element |
| Agentic AI Operations / Adjustments | ✅ Remediated | **GAP:** AI agent is implemented — but **primary analysis doc explicitly flags AI access depends on the same broken API layer** (routes still point to legacy storage; `PpmService` agentic methods are also inaccessible); no AI-generated project health narrative (Oracle: natural language summary "This project is 23 days behind schedule due to delayed procurement in Phase 2" generated from EVM data for weekly status report) |
| Governance (Status Transitions, Workflow Rules) | ✅ Remediated | **GAP:** Status transitions are validated — no stage-gate review (Oracle PPM: projects formally pass through gates (Concept → Plan → Execute → Close); at each gate, a review board approves continuation; project cannot proceed to next stage without sign-off); no mandatory deliverable checklist at close (Oracle: project cannot be closed until all required deliverables are marked complete and accepted by the project sponsor) |
| SLA Accounting + GL Distributions | ✅ Remediated | **GAP:** GL distributions exist — no multi-ledger project accounting (Oracle PPM: a project can be accounted in both a Primary ledger (USD) and a Secondary ledger (EUR IFRS) simultaneously; cost distributions post to both ledgers in different CoAs with translation); no project subledger reconciliation report (Oracle: compares total cost in project subledger to corresponding GL account balances; flags any out-of-balance) |
| Project Billing (Billing Rules Manager) | ✅ Remediated | **GAP:** Billing rules exist — no milestone-based billing (Oracle PPM: invoice is generated when a project milestone is marked complete; e.g., "Invoice $500K upon delivery of Phase 2 deliverable"; no time needs to pass); no retainage management (Oracle: client withholds 10% of each invoice until project completion milestone; retainage balance tracked and released at close) |
| Rate Schedules (Bill/Revenue Rates) | ✅ Remediated | **GAP:** Rate schedules are hierarchical — no rate override approval (Oracle PPM: if a project manager wants to apply a non-standard rate for a specific resource, they must submit a rate override request that is approved by the contract manager before the rate is applied to billing) |
| **[MISSING / INACCESSIBLE]** PPM Workbench UI | ❌ Level 0 (per ppm_gap.md) | **🚨 CRITICAL (Self-Admitted):** Primary analysis doc explicitly states: "The UI folder `client/src/components/ppm` does not exist." Oracle PPM has a comprehensive Project Manager Workbench covering: Overview (financial health, EVM scorecards), Expenditures (cost entry/review), Assets (CIP tracking), and Billing (invoice queue). No user-facing access to any ERM project financial data exists |
| **[MISSING]** Portfolio-Level Resource Management | — | **GAP:** No cross-project resource demand vs supply (Oracle PPM / Resource Management: a resource manager sees all planned resource requirements across all projects in a portfolio; identifies over-allocated resources and re-assigns; no project exists in isolation from the resource pool) |

**Overall Oracle Parity Status:** 🚨 **CRITICAL — Documented as 100% Tier-1 but primary analysis doc explicitly declares API level = 2 and UI level = 0.** Schema and service logic are mature; the "remediation" in the second doc is a self-assessment that does not address the API mismatch noted in the primary audit. No user can access EVM, cost collection, capitalization, or billing without the PPM Workbench UI

**Oracle Gap Summary (Module 27 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| PPM-OG-01 | **PPM Workbench UI Entirely Missing** | Project Manager Workbench (Overview, Expenditures, Assets, Billing) | 🔴 Critical |
| PPM-OG-02 | **API Routes Mismatch — PpmService Inaccessible** | All financial endpoints (EVM, cost import, capitalize) must be reachable | 🔴 Critical |
| PPM-OG-03 | Stage-Gate Review (Concept→Plan→Execute→Close) | Review board approval required at each project stage gate | 🔴 High |
| PPM-OG-04 | Milestone-Based Billing | Invoice triggered by deliverable milestone completion, not time | 🔴 High |
| PPM-OG-05 | Employee Timesheet → PPM Labor Auto-Flow | HCM timesheet approvals auto-create expenditure items in PPM | 🔴 High |
| PPM-OG-06 | Portfolio-Level Resource Demand vs Supply | Cross-project resource planning with over-allocation alerts | 🔴 High |
| PPM-OG-07 | Budget Version Control (Original / Revised / Current) | Change history with authorization trail per budget revision | 🟡 Medium |
| PPM-OG-08 | Provisional vs Final Burden Rate (DCAA Compliance) | Year-end actual rate replaces provisional with retroactive adjustment | 🟡 Medium |
| PPM-OG-09 | Retainage Management | Withhold % of invoice retained until project close milestone | 🟡 Medium |
| PPM-OG-10 | Capitalization Threshold Rule per Asset Category | Sub-threshold costs auto-expensed; above-threshold capitalized | 🟡 Medium |
| PPM-OG-11 | SPI Trend Chart (6-Period Performance Trend) | Schedule performance trajectory for recovery plan decisions | 🟡 Medium |
| PPM-OG-12 | Project Subledger vs GL Reconciliation Report | Cost subledger balance vs GL account out-of-balance detection | 🟡 Medium |
| PPM-OG-13 | Resource-Loaded Schedule (Resource Plan → Cost Plan) | Planned hours per resource auto-drive the cost budget | 🟢 Low |

---

### 28. Procurement & SCM
**Source:** `analysis_procurement_scm_gap.md` | **Oracle Equiv:** Oracle Fusion Procurement Cloud / SCM Cloud / Oracle Sourcing / Oracle Supplier Qualification Management (SQM)

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Procurement + SCM Cloud) |
|:---|:---|:---|
| Supplier Master | ✅ Parity | **GAP:** Supplier master is implemented — no supplier 360 profile (Oracle Fusion Supplier Qualification Management: supplier profile consolidates financial health score, risk rating, diversity classification (MBE/WBE), insurance certificates, and active PO/invoice exposure in a single view); no supplier hierarchy management (Oracle: a supplier can have a parent company with multiple sites; credit terms negotiated at parent apply to all child sites); no supplier bank account verification workflow (Oracle: when a supplier submits a new bank account, a verification call/letter must be completed and logged before the account is activated for payment; prevents supplier fraud) |
| Self-Service Requisitioning (+ Funds Check against Budgets) | ✅ Parity | **GAP:** Requisitioning with funds check is implemented — no punchout catalog integration (Oracle Procurement: catalogs hosted by suppliers (e.g., Grainger, Dell) are accessible directly from the requisition form via OCI Punchout; employee shops on the supplier's website and items return to the NexusAI cart; no catalog browsing exists today); no preferred supplier enforcement (Oracle: if a requester selects a non-preferred item and a preferred supplier offers the same, the system flags it and requires a justification override) |
| Approval Rules Engine (AME-style + Encumbrance Reservation) | ✅ Parity | **GAP:** Approval rules are implemented — no conditional approval skip (Oracle: purchases from pre-approved vendors below a threshold amount skip the approval chain entirely, routed straight to PO; reduces cycle time for low-risk repetitive purchases); no mobile push notification for approval (Oracle Fusion Mobile: approver receives a push notification with line-level detail and can approve/reject from their phone without logging into the web application) |
| Purchase Orders | ✅ Parity | **GAP:** PO is implemented — no PO change order management (Oracle: any change to an approved PO (quantity, price, delivery date) creates a numbered change order that requires re-approval; change history is preserved; NexusAI likely modifies POs in place without a formal change order trail); no blanket purchase agreement (BPA) with release tracking (Oracle: a BPA sets an annual committed spend with a supplier; individual releases draw down the commitment; system warns when remaining blanket amount is low) |
| Sourcing / RFQ / Quote Management | ✅ Parity | **GAP:** RFQ/Quote is implemented — no sealed bid event (Oracle Sourcing: bids are sealed until the bidding deadline; no supplier can see competitor bids; winner is disclosed only after evaluation; critical for public sector procurement compliance); no negotiation savings calculation (Oracle: automatically computes savings vs. target price and vs. best historic price; creates a savings record against the procurement category for spend analytics) |
| Receiving + Receipt Accounting | ✅ Parity | **GAP:** Receipt accounting is implemented — no over-receipt tolerance enforcement (Oracle: receiving is blocked if quantity exceeds PO quantity + configurable tolerance % (e.g., 5%); NexusAI may allow unlimited over-receipt); no ASN-to-receipt matching (Oracle: if supplier submits an ASN (Advanced Shipment Notice), the ASN pre-populates the receipt form; unexplained discrepancies between ASN and actual receipt quantity are flagged for investigation) |
| Returns / Debit Memos / Corrections | ✅ Parity | **GAP:** Returns and debit memos are implemented — no return merchandise authorization (RMA) tracking number linkage to supplier (Oracle: return generates a supplier-facing RMA document with a tracking reference; supplier acknowledges receipt and triggers replacement or credit; NexusAI returns are internal only) |
| Inventory Management (Core Transactions) | ✅ Parity | **GAP:** Core inventory transactions are implemented — no min-max replenishment rule (Oracle: when on-hand quantity drops below minimum, a purchase requisition is auto-generated; when above maximum, a transfer or return is suggested); no inventory reservation for confirmed sales orders (Oracle: confirmed SO reserves specific inventory lots, preventing the same stock from being sold to another customer) |
| Accounts Payable Integration (Invoice/Pay/Tax) | ✅ Parity | **GAP:** AP integration is implemented — no e-invoicing (EDI/UBL) direct receipt from supplier (Oracle: suppliers submit invoices electronically via OCI Network or UBL XML; no human re-keying; NexusAI requires manual invoice creation or supplier portal flip); no early payment discount capture automation (Oracle: 2/10 Net 30 terms automatically trigger an early payment run if the discount savings exceed the cost of early funding) |
| Budgetary Control (Encumbrance Accounting) | ✅ Parity | **GAP:** Funds check and encumbrance reservation are implemented — no carry-forward encumbrance at year-end (Oracle: un-liquidated encumbrances (open POs spanning year-end) are automatically carried forward into the new fiscal year budget; remaining budget in the old year is reduced by the carry-forward amount); no over-budget override approval with justification capture (Oracle: if a budget manager approves an over-budget purchase, the system captures the justification and posts to an audit log) |
| GL Integration (SLA / Auto-Post Journals) | ✅ Parity | **GAP:** SLA auto-post is implemented — no procurement accounting hub (Oracle: custom accounting rules can transform procurement transactions (e.g., apply department segment overrides) before they reach the GL; rules are configurable per transaction type without code changes); no accrual reconciliation report (Oracle: shows all accrued-not-invoiced purchase receipts (GR/IR account balance) with aging; critical for period-end controller review) |
| Procurement Analytics (Spend by Supplier, PO Status) | ✅ Parity | **GAP:** Basic spend charts and PO status are implemented — no supplier performance scorecard (Oracle Procurement Analytics: measures On-Time Delivery %, Quality Defect Rate, Invoice Match Rate, and Price Variance per supplier; feeds into supplier qualification review); no maverick spend detection (Oracle: flags purchases made outside of approved channels (non-PO invoices, non-preferred suppliers) as a % of total spend for each category) |
| AI Procurement Agent (Supplier Risk, Reorder, Payment Opt) | ✅ Parity | **🚨 SELF-ADMITTED:** Analysis doc explicitly states AI insights are **"rule-based/mocked for MVP"** — no trained spend classification model (Oracle AI Apps: auto-classifies spend into UNSPSC or custom taxonomy using ML; converts free-text descriptions to normalized categories for analytics); no supplier risk monitoring from external feeds (Oracle: integrates with D&B, Dun & Bradstreet, news sentiment to update supplier risk scores automatically; NexusAI risk is manual input) |
| **[MISSING]** Procurement Contract Lifecycle Management | — | **GAP:** No procurement contract module (Oracle Fusion Procurement Contracts: master purchase agreements, pricing schedules, and compliance obligations tracked; POs must reference an active contract to enforce negotiated prices; contract expiry alerts sent to commodity manager) |
| **[MISSING]** Supplier Qualification Management (SQM) | — | **GAP:** No supplier qualification process (Oracle SQM: structured questionnaire sent to supplier before onboarding approval; responses scored against quality/financial/compliance criteria; suppliers below threshold are disqualified; qualified suppliers listed in approved vendor list (AVL)) |

**Overall Oracle Parity Status:** ⚠️ Documented as **100% All L1-L15 Parity** — analysis doc self-admits AI is rule-based/mocked for MVP; Oracle cross-reference reveals structural gaps in advanced sourcing (sealed bid, savings calculation), procurement contract lifecycle, supplier qualification (SQM), punchout catalog, supplier bank account verification, PO change order management, and blanket purchase agreements

**Oracle Gap Summary (Module 28 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| PRO-OG-01 | Procurement Contract Lifecycle Management | PO must reference active contract; contract expiry alerts | 🔴 High |
| PRO-OG-02 | Supplier Qualification Management (SQM / AVL) | Scored questionnaire → approved vendor list | 🔴 High |
| PRO-OG-03 | AI Spend Classification (UNSPSC / Taxonomy ML) | Self-admitted mock; ML auto-classifies spend categories | 🔴 High |
| PRO-OG-04 | Punchout Catalog Integration (Grainger, Dell, etc.) | Requester shops live supplier catalog from within ERP | 🔴 High |
| PRO-OG-05 | PO Change Order Management (Numbered + Re-approval) | Every PO change creates a versioned change order with approval trail | 🟡 Medium |
| PRO-OG-06 | Blanket Purchase Agreement (BPA) with Release Tracking | Annual committed spend; releases draw down commitment | 🟡 Medium |
| PRO-OG-07 | Supplier Bank Account Verification Workflow | Call/letter confirmation before activating payment account | 🟡 Medium |
| PRO-OG-08 | Sealed Bid Sourcing Event | Bids sealed until deadline; winner disclosed after scoring | 🟡 Medium |
| PRO-OG-09 | Supplier Performance Scorecard (OTD, Defect, Price Var) | Measured per supplier across delivery, quality, and invoice match | 🟡 Medium |
| PRO-OG-10 | Maverick Spend Detection | Non-PO / non-preferred spend flagged as % of category total | 🟡 Medium |
| PRO-OG-11 | Over-Receipt Tolerance Enforcement | Block receiving above PO qty + tolerance % | 🟡 Medium |
| PRO-OG-12 | Carry-Forward Encumbrance at Fiscal Year-End | Open PO encumbrances auto-carry to new-year budget | 🟢 Low |

---

### 29. Revenue Management (RMCS)
**Source:** `analysis_revenue_mgmt_gap.md` | **Oracle Equiv:** Oracle Fusion Revenue Management Cloud (RMCS) / ASC 606 / IFRS 15

> 🚨 **Critical Contradiction in Source Documents:** The primary audit document (`analysis_revenue_mgmt_gap.md`) explicitly identifies Variable Consideration (Step 3), Series of Distinct Goods / Material Rights (Step 2), Contract Combinations (Step 1), GL Reconciliation Report, Multi-Currency, Revenue Forecasting ("placeholder — no actual logic"), and the Revenue Assurance Dashboard ("empty shell") as **missing or partial**. The complete_document.md entry marks all of these as ✅ Implemented. The "Implemented" status reflects later remediation phases — Oracle cross-reference verifies residual depth gaps.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion RMCS / ASC 606) |
|:---|:---|:---|
| ASC 606 5-Step Framework (Contract Identification, Dynamic Grouping) | ✅ Implemented | **GAP:** Step 1 framework is present — no **contract combination logic** (Oracle RMCS: when two contracts are entered at or near the same time with the same customer and have commercial linkage, they must be treated as a single contract for allocation; NexusAI analysis doc explicitly flags this as missing at L3); no contract modification **prospective vs cumulative catch-up** distinction is simplistic (analysis doc states logic is "simplistic at L4") |
| Contract Combination Logic (Step 1) | ✅ Implemented | **🚨 SELF-ADMITTED (Primary Audit):** Analysis doc under Executive Summary explicitly states: "the system lacks Contract Combination logic for distinct contracts entered near each other (ASC 606 Step 1)" — Oracle RMCS: auto-identifies commingled contracts using configurable combination rules (same customer, same commercial purpose within a configurable time window) and consolidates POBs before allocation |
| POB Identification (incl. Material Rights, Series of Distinct Goods) | ✅ Implemented | **🚨 SELF-ADMITTED (Primary Audit):** Analysis doc explicitly states: "No support for Series of Distinct Goods (common in SaaS) or Material Rights (e.g. options to renew at a discount)" — Oracle RMCS: Material Rights (renewal options at below-market price) are recognized as a separate POB with an SSP estimated from the probability-weighted expected renewals; Series of Distinct Goods collapses recurring identical services into a single POB with a time-series recognition schedule |
| Variable Consideration (Expected Value / Most Likely Amount) | ✅ Implemented | **🚨 SELF-ADMITTED (Primary Audit):** Analysis doc explicitly states: "No logic for estimating variable consideration (bonuses, penalties) using Expected Value or Most Likely Amount methods" — Oracle RMCS: constrained variable consideration is computed by either Expected Value (probability-weighted outcomes) or Most Likely Amount (single most likely outcome); a constraint test is applied to ensure only highly probable amounts are included in the transaction price; NexusAI has no such estimation engine |
| Significant Financing Component (TVM > 1 year) | ✅ Implemented | **🚨 SELF-ADMITTED (Primary Audit):** Analysis doc explicitly states: "No time-value-of-money adjustments for contracts > 1 year" — Oracle RMCS: when payment is deferred more than 12 months, the transaction price is discounted at the customer's implicit borrowing rate; interest income/expense is recognized separately over the payment term; critical for multi-year enterprise software deals with upfront payment |
| Standalone Selling Price (SSP) Manager | ✅ Implemented | **GAP:** SSP library UI exists — no SSP residual approach (Oracle RMCS: when the SSP of a POB is highly variable or uncertain, the residual method allocates the remaining transaction price after allocating observable SSPs to other POBs; commonly used for new products where no pricing history exists); no SSP range and tolerance validation (Oracle: flags allocations where the selling price falls outside the acceptable SSP range for auditor review) |
| Revenue Rule Manager | ✅ Implemented | **GAP:** Rule manager exists — no **audit log for rule changes** (analysis doc explicitly states at L14: "Audit Log for rule changes (Who changed SSP?) is missing"); Oracle RMCS: every SSP change, allocation rule change, or recognition rule modification is logged with before/after values, user, timestamp, and justification — this is an auditor requirement under ASC 606 |
| Revenue Setup Console (Centralized) | ✅ Implemented | **GAP (Self-Admitted at L2):** Analysis doc notes Revenue Rule Manager and SSP Manager "exist but no centralized Revenue Setup Console links them" — Oracle RMCS: all configuration (POB rules, SSP schedules, allocation methods, period calendars, journal account rules) is accessible from a single Administration Console; NexusAI has standalone pages without navigation integration |
| Revenue Assurance Dashboard | ✅ Implemented | **🚨 SELF-ADMITTED (Primary Audit):** Analysis doc explicitly states: "Revenue Assurance Dashboard and Optimization Dashboard are empty shells" — Oracle RMCS Revenue Assurance: flags contracts with unearned revenue aging > policy threshold, missing SSP values, allocation exceptions, POB completeness gaps, and high-risk contract modifications requiring manual review; NexusAI has a shell component with no live logic |
| Contract Timeline (Modification History) | ✅ Implemented | **GAP (Self-Admitted at L6):** Analysis doc states: "Contract Timeline/History view is missing" — Oracle RMCS: every contract modification (price change, POB addition/removal, contract extension) is displayed as a versioned timeline showing Before/After revenue schedules, the catch-up or prospective treatment applied, and the approving user — essential for auditor traceability |
| GL Reconciliation (Subledger → GL Report) | ✅ Implemented | **🚨 SELF-ADMITTED (Primary Audit):** Analysis doc states: "We have RevenueAccountingSetup for mapping, but no Subledger to GL Reconciliation Report" — Oracle RMCS: the revenue subledger reconciliation report compares deferred revenue, unbilled AR, and recognized revenue account balances in the subledger against the corresponding GL accounts; unexplained differences are flagged by contract/POB |
| Revenue Forecasting (Linear Regression, Waterfall Prediction) | ✅ Implemented | **🚨 SELF-ADMITTED (Primary Audit L13):** Analysis doc explicitly states: "RevenueForecasting is a placeholder. No Pattern Recognition for revenue leakage" — Oracle RMCS Analytics: true revenue waterfall shows beginning deferred balance, new bookings, recognized revenue, cancellations, and ending deferred balance for each period; churn-impact analysis models the effect of customer attrition on future recognized revenue; NexusAI is a placeholder |
| Multi-Currency Revaluation | ✅ Implemented | **GAP (Self-Admitted at L12):** Analysis doc flags "Multi-Ledger / Multi-Currency revaluation missing" — Oracle RMCS: for contracts denominated in foreign currency, the transaction price is measured at the contract inception FX rate; deferred revenue is revalued at closing rate each period; FX translation difference is posted to a separate OCI account per IFRS 15.B23 |
| **[MISSING]** Internal / External Auditor Read-Only Access | — | **GAP (Self-Admitted at L5):** Analysis doc explicitly states: "No distinct views for Internal Audit or External Auditors (Read-only, Deep Trace)" — Oracle RMCS: auditor role has a read-only workbench showing the full source-event → contract → POB → revenue schedule → journal entry trace for any recognized amount; no data modification possible; critical for Big 4 audit support |
| **[MISSING]** Billing Integration (Deep Link to Invoice) | — | **GAP (Self-Admitted at L2):** Analysis doc states "Billing Integration is weak; no link to BillingManagement.tsx" — Oracle RMCS: every recognized revenue event has a direct link to the corresponding billing event (invoice, credit memo); unbilled receivables are trackable from the revenue schedule to the expected billing date |

**Overall Oracle Parity Status:** 🚨 **CRITICAL — Documented as 100% Tier-1 Certified, but the primary audit document explicitly flags 7+ items as missing or empty shells.** The ASC 606 core (Variable Consideration, Material Rights, Contract Combination, Significant Financing Component) is self-admitted as absent — these are not enhancements, they are mandatory steps in the accounting standard itself

**Oracle Gap Summary (Module 29 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| RMCS-OG-01 | Variable Consideration (Expected Value / MLA) | Self-admitted missing; mandatory ASC 606 Step 3 | 🔴 Critical |
| RMCS-OG-02 | Material Rights / Series of Distinct Goods (POB) | Self-admitted missing; mandatory ASC 606 Step 2 | 🔴 Critical |
| RMCS-OG-03 | Contract Combination Logic (Step 1) | Self-admitted missing; mandatory ASC 606 Step 1 | 🔴 Critical |
| RMCS-OG-04 | Significant Financing Component (TVM Adjustment) | Self-admitted missing; mandatory ASC 606 Step 3 | 🔴 Critical |
| RMCS-OG-05 | Revenue Assurance Dashboard (Self-Admitted Shell) | Anomaly detection, aging, allocation exceptions | 🔴 High |
| RMCS-OG-06 | Revenue Forecasting (Self-Admitted Placeholder) | Waterfall + churn impact; actual ML logic | 🔴 High |
| RMCS-OG-07 | GL Subledger Reconciliation Report (Self-Admitted Missing) | Deferred/unbilled/recognized vs GL by contract | 🔴 High |
| RMCS-OG-08 | Audit Rule Change Log (SSP / Rule Modifications) | Who changed SSP + before/after; auditor requirement | 🟡 Medium |
| RMCS-OG-09 | Contract Modification Timeline View (Self-Admitted Missing) | Versioned Before/After revenue schedule per mod | 🟡 Medium |
| RMCS-OG-10 | Multi-Currency Deferred Revenue Revaluation (Self-Admitted) | FX rate at inception; OCI translation each period | 🟡 Medium |
| RMCS-OG-11 | Auditor Read-Only Deep Trace Workbench | Source event → POB → journal trace; no modify | 🟡 Medium |
| RMCS-OG-12 | SSP Residual Approach + Range Tolerance Validation | Residual method for variable-SSP POBs | 🟡 Medium |
| RMCS-OG-13 | Billing-to-Revenue Deep Link Integration | Invoice ↔ revenue schedule link; unbilled AR tracking | 🟢 Low |

---

### 30. Subledger Accounting (SLA)
**Source:** `analysis_subledger_accounting_gap.md` | **Oracle Equiv:** Oracle Fusion SLA (XLA) — Create Accounting Engine / Subledger Accounting Framework

> ✅ **Most credibly verified module in the ERP:** All 18 dimensions are green with independent `verify_all_sla.ts` master verification script passing on 2026-01-31. Oracle cross-reference below identifies residual gaps in advanced XLA capabilities that are beyond the scope of the self-assessment but present in Oracle Fusion SLA cloud production.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion XLA / SLA) |
|:---|:---|:---|
| Accounting Event Model (Event Classes & Types — AP/AR/GL/INV/FA) | ✅ Done | **GAP:** Event classes are seeded for AP/AR — no **third-party subledger registration** (Oracle XLA: any third-party application can register as a subledger by defining its own event model in XLA; e.g., a custom Lease module can self-register event classes without modifying the core SLA engine; NexusAI's SLA is hard-coded to known modules); no **event class version management** (Oracle: event class definitions are versioned; upgrading an event class does not break existing accounting rules referencing the prior version) |
| Journal Line Types (JLT — Condition, Amount Source, Description Rule) | ✅ Done | **GAP:** JLTs with conditions and amount sources are implemented — no **formula-based amount source** (Oracle XLA: amount source can reference a calculation formula (e.g., Invoice Amount × Tax Rate) rather than just a direct column reference; supports complex derived amounts without code changes); no **lookup set conditions** (Oracle: JLT conditions can reference a configurable lookup set (e.g., "if Supplier Type IN (FOREIGN, INTERCOMPANY)") without hardcoding values into the condition expression) |
| AP/AR SLA Integration (View Accounting in UI) | ✅ Done | **GAP:** View Accounting is integrated in AP/AR — no **third-party module "View Accounting"** breadcrumb (Oracle: every transaction in every subledger (including custom) shows a "View Accounting" icon that navigates to the full XLA accounting entry viewer; NexusAI's View Accounting is only wired in AP/AR, not in FR Construction, PPM, or other modules) |
| GL Transfer (SLA → GL End-to-End with UI Trigger) | ✅ Done | **GAP:** GL Transfer is implemented — no **accounting error correction workflow** (Oracle XLA: if a journal fails GL transfer due to a missing account, the error appears in the Create Accounting Execution Report; the functional consultant corrects the ADR rule and re-runs Create Accounting for that event without reprocessing the entire batch); no **funds check integration during Create Accounting** (Oracle: for encumbrance-controlled funds, Create Accounting validates that the debit account has sufficient budget before posting; NexusAI GL transfer has no budget gate) |
| Inventory Events (Ship, Receive, Adjustment) | ✅ Done | **GAP:** Core WMS events are integrated — no **cost element accounting** (Oracle: each inventory accounting entry is split by cost element (Material, Material Overhead, Resource, Resource Overhead, Outside Processing); separate GL accounts are debited per element; NexusAI posts a single aggregated inventory debit); no **average cost revaluation event** (Oracle: when the average cost changes due to a new receipt, a revaluation accounting entry adjusts all existing on-hand inventory to the new average cost across all subinventories) |
| Fixed Assets Events (Additions, Depreciation, Retirement) | ✅ Done | **GAP:** FA additions, depreciation, and retirements are integrated — no **revaluation accounting** (Oracle: for IFRS-compliant upward revaluation (IAS 16), a credit to OCI Revaluation Surplus and a debit to the asset cost account is generated; NexusAI FA SLA does not handle revaluation events); no **impairment loss accounting** (Oracle: IAS 36 impairment loss posts the write-down below carrying value to the income statement with the asset cost and accumulated depreciation adjusted accordingly) |
| Projects & Construction Events (CIP/Expense, WIP/Liability) | ✅ Done | **GAP:** PPM and construction events are integrated — no **labor costing accounting event** (Oracle PPM: when a timesheet is approved, a labor cost accounting entry (DR: WIP/Project / CR: Labor Clearing) is immediately generated by SLA; the clearing account is settled when payroll posts; NexusAI timesheet → SLA flow is not present); no **revenue recognition event from contract billing** (Oracle: when a revenue recognition run occurs in RMCS, an SLA event is raised; the journal DR: Unbilled Receivable / CR: Revenue is auto-generated with full POB attribution) |
| Period Close (Sweep, Validation, Reporting) | ✅ Done | **GAP:** Period close sweep and validation are implemented — no **mass sweep options by event type** (Oracle: sweep can be targeted to only specific event types (e.g., sweep only AP Invoices, not Payments) to support staggered sub-period close processes); no **period close concurrence workflow** (Oracle: the Controller must formally approve period close for each subledger module; legal entity close vs operating unit close are tracked separately) |
| Multi-Ledger Support (Secondary Ledger + Currency Conversion) | ✅ Done | **GAP:** Secondary ledger with spot-rate USD→EUR is implemented — no **reporting currency ledger** (Oracle: a third type of ledger (Reporting Currency) tracks translated balances only, without separate journal lines; useful for group reporting without the overhead of a full secondary ledger); no **subledger-level accounting method override** (Oracle: a secondary ledger can use a different accounting method than the primary ledger (e.g., primary uses US GAAP accrual; secondary uses IFRS cash); NexusAI secondary ledger replicates the primary method only) |
| Account Analysis + Reconciliation Dashboard | ✅ Done | **GAP:** Account analysis and drift reconciliation dashboard are implemented — no **T-account drilldown** (Oracle Account Analysis: clicking on a GL account balance renders a T-account view showing all debit and credit SLA entries contributing to the balance for the period; analysts can trace from balance → journal → subledger event in a single click); no **subledger audit trail report** (Oracle: the XLA Audit Trail report shows every Create Accounting execution for a date range: who ran it, how many events were processed, how many succeeded/failed, and the detailed error log for failures) |
| **[MISSING]** Accounting Program Scheduling | — | **GAP:** GL Transfer is triggered manually via UI — no **automated accounting program scheduler** (Oracle XLA: Create Accounting and GL Transfer can be scheduled as recurring ESS jobs (every 15 minutes, hourly, nightly); enterprise SLA runs automatically without manual UI intervention; NexusAI requires a human to click the Transfer button on the dashboard) |

**Overall Oracle Parity Status:** ⚠️ **Genuinely Strong — Most rigorously verified module in the system.** Residual gaps are advanced XLA enterprise features (cost element accounting, third-party subledger self-registration, reporting currency ledger, automated accounting scheduler) that extend beyond the self-assessment scope. No self-admitted contradictions. Core SLA engine is Tier-1 credible

**Oracle Gap Summary (Module 30 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| SLA-OG-01 | Automated Accounting Scheduler (ESS Job) | Create Accounting + GL Transfer runs on schedule without manual UI | 🔴 High |
| SLA-OG-02 | Cost Element Accounting (Material / MOH / Resource / OSP) | Inventory debits split by cost element to separate GL accounts | 🟡 Medium |
| SLA-OG-03 | Third-Party Subledger Self-Registration | Custom modules register own event classes in XLA without core code change | 🟡 Medium |
| SLA-OG-04 | Formula-Based Amount Source in JLTs | Amount = Invoice Amount × Tax Rate (computed, not just column reference) | 🟡 Medium |
| SLA-OG-05 | Accounting Error Correction Workflow | Fix ADR rule and re-process failed events without full batch re-run | 🟡 Medium |
| SLA-OG-06 | Reporting Currency Ledger (3rd Ledger Type) | Translated balance-only ledger for group reporting | 🟡 Medium |
| SLA-OG-07 | Average Cost Revaluation Accounting Event | On-hand inventory revalued to new average cost across all subinventories | 🟡 Medium |
| SLA-OG-08 | IFRS Revaluation / IAS 36 Impairment Events (Fixed Assets) | Revaluation surplus (OCI) and impairment loss accounting entries | 🟡 Medium |
| SLA-OG-09 | T-Account Drilldown from GL Balance | Balance → journal → subledger event in single click | 🟢 Low |
| SLA-OG-10 | XLA Audit Trail Report (Execution History) | Who ran Create Accounting, events processed, success/failure log | 🟢 Low |

---

### 31. Supplier Portal & Procurement Contracts
**Source:** `analysis_supplier_portal_gap.md` | **Oracle Equiv:** Oracle iSupplier Portal / Supplier Lifecycle Management (SLM) / Procurement Contract Management (PCM) / Oracle Sourcing Cloud

| Feature Area | Documented Status | Oracle Gap (vs Oracle iSupplier / SLM / PCM) |
|:---|:---|:---|
| Supplier Self-Registration (Multi-step Onboarding) | ✅ 100% | **GAP:** Multi-step registration is implemented — no **supplier duplicate detection** (Oracle SLM: before a new supplier registration is approved, the system checks for an existing matching D-U-N-S number, tax ID, or name/address pattern; a potential duplicate warning is raised for the procurement officer to merge or proceed); no **registration expiry / dormant supplier deactivation** (Oracle: suppliers who have not transacted for a configurable period (e.g., 24 months) are automatically flagged for deactivation and notified; prevents accumulation of ghost vendors) |
| Qualification & Onboarding (Document Management, Certifications) | ✅ 100% | **GAP:** Document upload for certifications is implemented — no **certification expiry alerting** (Oracle SLM: W-9, insurance certificates, and ISO certifications have expiry dates; Oracle sends automated alerts to the supplier (and the procurement officer) 60/30/7 days before expiry; expired certifications block the supplier from being selected for new POs); no **qualification questionnaire scoring** (Oracle: structured questionnaire with weighted scoring; suppliers below threshold score are placed on probation or disqualified without manual review) |
| External Collaboration Portal (Login, Dashboard, Orders, ASNs) | ✅ 100% | **GAP:** External portal with PO/ASN access is implemented — no **PO acknowledgement deadline enforcement** (Oracle iSupplier: if a supplier has not acknowledged a PO within a configurable number of days, an escalation alert is sent to the buyer; unacknowledged POs beyond the deadline are escalated to the procurement manager); no **supplier payment status self-service** (Oracle: supplier can see exact payment run dates, bank account used for payment, and remittance advice for each settled invoice without calling AP) |
| ASN (Advanced Shipment Notice — Full Flow) | ✅ 100% | **GAP:** Full ASN flow is verified — no **ASN quality hold integration** (Oracle iSupplier: if an ASN is flagged for quality inspection, the corresponding receipt in Oracle Receiving is placed on quality hold; items cannot be moved to inventory until QA inspection is completed and the hold is released); no **carrier tracking link on ASN** (Oracle: supplier can enter the carrier's tracking URL/number on the ASN; buyer can click the link from the PO to track the shipment without asking the supplier for status) |
| Self-Service Invoicing (Flip PO to Invoice) | ✅ 100% | **GAP:** PO-flip to invoice is verified — no **invoicing rule enforcement** (Oracle iSupplier: if a contract specifies "invoice only after ASN is received and accepted," the system prevents the supplier from flipping an undelivered PO line to invoice; catches incorrect early billing); no **supplier invoice attachment portal** (Oracle: supplier can attach PDF supporting documents (delivery notes, timesheets, expense receipts) directly to the invoice; the attached document is visible in AP for 3-way match review) |
| Contract Authoring & Repository (MSA/SOW, Clauses) | ✅ 100% | **GAP:** Contract authoring with clause library is implemented — no **contract template library** (Oracle PCM: pre-approved contract templates by contract type (MSA, SOW, NDA, Framework Agreement) are maintained; a new contract starts from the appropriate template with mandatory clauses pre-populated; users cannot delete mandatory clauses); no **contract obligation tracking** (Oracle: each contract clause can have an associated obligation (e.g., "Supplier must submit quality report quarterly"); obligations have due dates and owners; overdue obligations are escalated) |
| AI Clause Compliance Analysis (GPT-4 — Amended vs Standard) | ✅ 100% | **GAP:** AI clause compliance is implemented vs standard clauses — no **AI risk scoring by clause type** (Oracle: AI assigns a risk score (1-10) per clause based on deviation from standard and legal precedent; high-risk clauses are flagged for mandatory legal review before contract approval; NexusAI flags deviations but does not score by risk level or mandate legal review); no **competitor clause benchmarking** (Oracle: compares clause language against industry standard alternatives (IACCM clause library) to identify unfavorable terms) |
| Contract Consumption Tracking (Spend Validation + Dashboard) | ✅ 100% | **GAP:** Spend vs. limit validation is implemented — no **release order tracking against contract** (Oracle PCM: each PO line that references a contract tracks against the contract's committed value; a separate committed-not-yet-received amount is shown; NexusAI tracks invoiced spend but not the full P2P exposure (PO raised but not yet received or invoiced)); no **contract price variance alert** (Oracle: if a PO price deviates from the contract unit price by more than a configurable tolerance, an automatic alert is sent to the category manager) |
| Supplier Scorecards & KPIs (OTD, Quality) | ✅ 100% | **GAP:** OTD and quality scorecards driven by real data — no **weighted composite score with rating bucket** (Oracle: each KPI (OTD, quality reject rate, price compliance, invoice accuracy) is weighted; composite score maps to a rating (Preferred / Standard / Conditional / Disqualified); suppliers below "Conditional" trigger a corrective action plan (CAP) workflow); no **scorecard review meeting scheduling** (Oracle: low-scoring suppliers trigger an automatic scheduling link to book a Business Review Meeting with the procurement manager) |
| RFQ & Sourcing Negotiation (Winner-to-Contract) | ✅ 100% | **GAP:** RFQ-to-contract flow is implemented — no **multi-round negotiation** (Oracle Sourcing: after initial bids close, the buyer can send a "Best and Final Offer" request to a shortlist of qualified bidders; NexusAI sourcing is single-round); no **cost breakdown structure in RFQ** (Oracle: buyer requests itemized cost breakdown (material, labor, overhead, profit) rather than a single price; enables cost engineers to negotiate specific cost elements) |
| **[MISSING]** Supplier Portal Analytics for Buyers | — | **GAP:** No buyer-facing supplier portal analytics (Oracle iSupplier: buyer sees aggregate portal adoption metrics — % of POs acknowledged via portal vs. phone/email, % of invoices submitted via self-service vs. manual AP entry, average ASN-to-receipt cycle time; used to measure portal ROI and identify suppliers needing training) |

**Overall Oracle Parity Status:** ⚠️ Documented as 100% Tier-1 Audited — core flows are genuinely implemented. Oracle cross-reference reveals structural gaps in supplier duplicate detection, certification expiry guards, multi-round sourcing negotiation, contract obligation tracking, and weighted composite scorecards with corrective action workflow

**Oracle Gap Summary (Module 31 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| SUP-OG-01 | Contract Obligation Tracking (Quarterly Reports, Due Dates) | Overdue obligation escalation per contract clause | 🔴 High |
| SUP-OG-02 | Certification Expiry Alerting + PO Block | Automated 60/30/7 day alerts; blocks supplier selection on expiry | 🔴 High |
| SUP-OG-03 | Qualification Questionnaire Weighted Scoring | Below-threshold score = probation/disqualification without manual review | 🔴 High |
| SUP-OG-04 | Invoicing Rule Enforcement (Deliver-Before-Bill) | Cannot invoice undelivered PO line if contract requires ASN receipt first | 🟡 Medium |
| SUP-OG-05 | Multi-Round Negotiation (Best and Final Offer) | Shortlist re-bid round after initial quotes close | 🟡 Medium |
| SUP-OG-06 | Release Order Committed Spend Tracking (PO vs Received vs Invoiced) | Full P2P exposure = PO + received + invoiced separately tracked | 🟡 Medium |
| SUP-OG-07 | Weighted Composite Supplier Score + CAP Workflow | Low score → corrective action plan auto-triggered | 🟡 Medium |
| SUP-OG-08 | Supplier Duplicate Detection (D-U-N-S / Tax ID / Name-Address) | Match check before registration approval | 🟡 Medium |
| SUP-OG-09 | Contract Template Library with Mandatory Clauses | Pre-approved templates; mandatory clauses cannot be deleted | 🟡 Medium |
| SUP-OG-10 | PO Acknowledgement Deadline Escalation | Unacknowledged PO beyond threshold escalates to procurement manager | 🟢 Low |
| SUP-OG-11 | Buyer-Facing Portal Adoption Analytics | % portal vs. manual PO/ASN/invoice; cycle time metrics | 🟢 Low |

---

### 32. Talent Management
**Source:** `analysis_talent_mgmt_gap.md` | **Oracle Equiv:** Oracle Fusion HCM Talent Management / Oracle Recruiting Cloud (ORC) / Oracle Learning Cloud

> 🚨 **Severe Contradiction Within the Same Document:** The historical audit section of `analysis_talent_mgmt_gap.md` (preserved in the same file under "PREVIOUS AUDIT") explicitly states: all sub-domains (Recruitment, Performance, Succession, Learning) have **UI shells only with 404 API errors** and **no schema tables exist** (`recruitment_jobs`, `applications`, `performance_reviews`, `goals`, `succession_plans` are all missing). The latest audit summary claims 100% Tier-1 Certified after Phase 14-16 remediation. The "Enterprise Ready" labels below are taken from the post-remediation summary — cross-reference against Oracle Fusion reveals additional depth gaps.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion HCM Talent / ORC) |
|:---|:---|:---|
| Recruitment (Requisitions, Candidates, Offers, Onboarding) | ✅ Enterprise Ready | **GAP:** Recruiting schema and API are implemented post-remediation — no **AI candidate ranking** with fit score vs job requirements (Oracle ORC: AI algorithm scores each applicant against the job requirements and generates a ranked shortlist; hiring manager only reviews top-N candidates; NexusAI has "AI hooks in UI" per previous audit); no **offer letter template with e-signature integration** (Oracle: offer letters are generated from configurable templates with merge fields (name, salary, start date); DocuSign/Adobe Sign integration captures legally binding e-signature with audit timestamp); no **background check integration** (Oracle ORC: background checks are triggered directly from the offer stage; results (Clear/Pending/Adverse) update the candidate record in real time) |
| Performance Management (Goals & Reviews) | ✅ Enterprise Ready | **GAP:** Goals and reviews schema are implemented — no **cascading goals** (Oracle Fusion Performance: a division-level goal is pushed down to departments, then to individuals; each individual's goal is linked to the parent organizational goal; aggregate completion % rolls up to the corporate scorecard); no **calibration session** (Oracle: managers across a function gather in a calibration workbench to normalize ratings for their teams; ratings are adjusted on a forced-distribution curve before they are finalized; individuals cannot see calibration adjustments); no **360-degree feedback with anonymization** (Oracle: peer feedback requests are sent anonymously; the respondent cannot be identified by the subject; raw comments are not shown — only a synthesized summary) |
| Succession Planning (Plans, Pools) | ✅ Enterprise Ready | **GAP:** Succession plans and talent pools are implemented — no **nine-box grid placement** (Oracle: each employee is plotted on a 9-box grid (Performance vs Potential) derived from their performance rating and manager's potential assessment; the grid drives succession pool prioritization); no **readiness timeline** (Oracle: each successor is tagged Ready Now / Ready in 1-2 Years / Ready in 3-5 Years; readiness changes trigger alerts to HR and the succession plan owner); no **bench strength report per critical role** (Oracle: shows how many successors are available per critical position, their readiness level, and the risk if the incumbent leaves today) |
| Learning (Catalog, Enrollment, Certifications) | ✅ Enterprise Ready | **GAP:** Course catalog and enrollment schema are implemented — no **learning path with dependencies** (Oracle Learning Cloud: a certification program defines a sequence of mandatory courses; learner cannot enroll in Course 3 until Course 2 is completed and assessed; NexusAI catalog has no prerequisite enforcement); no **external content integration** (Oracle: SCORM/xAPI-compliant third-party courses (LinkedIn Learning, Coursera) are imported and tracked within Oracle LMS; completion syncs back from the third-party platform); no **manager-assigned mandatory training** (Oracle: a manager can assign a course to their team and set a completion deadline; non-completion escalates to the manager and HR) |
| Employee Profile (Competencies, Skills) | ✅ Enterprise Ready | **GAP:** Competency models linked to jobs are implemented — no **skill gap analysis** (Oracle: compares employee's current assessed competencies against the competency requirements of their current role or a target role; generates a personal development plan (PDP) showing which skills to develop); no **AI career path recommendation** (Oracle: based on the employee's skills, performance, and interests, AI suggests 2-3 possible career paths with the training steps and typical timelines to achieve each) |
| **[MISSING]** New Hire / Candidate GDPR Data Purge | — | **GAP (Self-Admitted L14 in previous audit):** Previous audit explicitly states: "Absence of Talent data tables means specific data privacy (GDPR) for candidates/reviews is not implemented" — Oracle ORC: candidates who are not hired are automatically purged after a configurable retention period (e.g., 6 months) per GDPR Article 17; rejected applicants receive an automatic deletion confirmation email |
| **[MISSING]** Onboarding Workflow (Day 1 Checklist) | — | **GAP:** Onboarding is listed as covered but no onboarding workflow object is described — Oracle Fusion Onboarding: a new hire portal with pre-day-1 tasks (e-sign NDA, complete tax forms, equipment requests, buddy assignment) that HR and the new employee complete before the first day; task completion drives a joint checklist visible to both HR and hiring manager |

**Overall Oracle Parity Status:** 🚨 **HIGH RISK — Historical audit within the same document explicitly shows all sub-domains were 404 API shells with no schema tables.** Post-remediation phases 14-16 are claimed to resolve this, but no independent verification scripts are referenced (unlike SLA module). Oracle depth gaps in cascading goals, calibration, 9-box grid, skill gap analysis, and GDPR candidate purge remain regardless of remediation

**Oracle Gap Summary (Module 32 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| TAL-OG-01 | Cascading Goals (Division → Department → Individual) | Corporate goal rollup with aggregate completion % | 🔴 High |
| TAL-OG-02 | GDPR Candidate Data Purge (Retention Policy) | Auto-purge rejected candidates after configurable retention period | 🔴 High |
| TAL-OG-03 | Nine-Box Grid (Performance vs Potential Placement) | Grid placement drives succession pool prioritization | 🔴 High |
| TAL-OG-04 | Learning Path with Prerequisite Enforcement | Cannot enroll in Course 3 until Course 2 assessed | 🔴 High |
| TAL-OG-05 | 360-Degree Feedback with Anonymization | Anonymous peer feedback; synthesized summary only | 🟡 Medium |
| TAL-OG-06 | Calibration Session (Forced Distribution Curve) | Cross-manager rating normalization before finalization | 🟡 Medium |
| TAL-OG-07 | Skill Gap Analysis vs Role Competency Profile | Gap vs target role → personal development plan | 🟡 Medium |
| TAL-OG-08 | AI Candidate Ranking (Fit Score vs Job Requirements) | AI shortlist ranked by match score | 🟡 Medium |
| TAL-OG-09 | New Hire Onboarding Workflow (Pre-Day-1 Checklist) | E-sign NDA, tax forms, equipment requests before start | 🟡 Medium |
| TAL-OG-10 | Succession Readiness Timeline (Now / 1-2yr / 3-5yr) | Readiness change alerts to HR and plan owner | 🟡 Medium |
| TAL-OG-11 | External Content Integration (SCORM/xAPI / LinkedIn) | Third-party course completion syncs to Oracle LMS | 🟢 Low |
| TAL-OG-12 | AI Career Path Recommendation | Skills + performance → 2-3 career paths with training steps | 🟢 Low |

---

### 33. Tax Engine
**Source:** `analysis_tax_gap.md` | **Oracle Equiv:** Oracle Fusion Tax / Oracle Tax Reporting Cloud / Vertex Integration

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Tax) |
|:---|:---|:---|
| VAT/GST/Sales Tax (Multi-Country) | ✅ 100% Match | **GAP:** Multi-country VAT/GST is implemented — no **tax content subscription** (Oracle Fusion Tax integrates with Vertex or Avalara as a content provider; tax rates, rules, and jurisdiction boundaries are automatically updated by the content provider when legislation changes; NexusAI's `registerJurisdiction` requires manual data entry for each jurisdiction change); no **product taxability matrix** (Oracle: each inventory item or service is assigned a product tax classification code (PTCC); the tax engine applies taxability based on the PTCC × jurisdiction combination; NexusAI applies tax at the transaction level without per-item PTCC logic) |
| Multi-Country Nexus (Place-of-Supply Destination-based) | ✅ 100% Match | **GAP:** Destination-based nexus is implemented — no **economic nexus threshold monitoring** (Oracle: for US sales tax, the system tracks cumulative sales by state and alerts when a threshold (e.g., $100K sales or 200 transactions in South Dakota) is approaching, triggering a nexus registration requirement; threshold breaches generate compliance tasks for the tax team) |
| Reverse Charge Mechanism (RCM — Cross-border B2B) | ✅ 100% Match | **GAP:** RCM is implemented for cross-border B2B — no **self-assessment tax on import** (Oracle: for goods imported into a country without a registered supplier (e.g., EU imports from non-EU vendors), Oracle posts a use-tax / self-assessment entry automatically; NexusAI's RCM is gated on a supplier being in the system); no **triangulation rule** (Oracle: EU triangulation where Company A in UK sells to Company B in Germany, delivered directly from Company C in France requires a specific VAT treatment; Oracle applies the triangulation simplification automatically) |
| Period Close Automation | ✅ 100% Match | **GAP:** Automated period close scheduler is implemented — no **tax return filing integration** (Oracle Tax Reporting Cloud: tax return data is directly mapped to country-specific return forms (UK VAT Return, German UStVA, French CA3); the completed return is exported in the regulatory format for e-filing; NexusAI generates a report but does not map to country-specific return boxes); no **tax payment run** (Oracle: net tax payable is automatically transferred to the AP payment run for settlement to the tax authority on the filing due date) |
| Deep GL Reconciliation (Tax Engine vs GL Control Accounts) | ✅ 100% Match | **🚨 SELF-ADMITTED (Analysis Doc):** Analysis doc explicitly states GL reconciliation is **"simulated/ready for injection"** — Oracle Fusion Tax: the tax reconciliation report compares actual tax posted to GL control accounts against the Tax Engine's calculated tax liability by period, by jurisdiction, and by tax type; unexplained differences (rounding, timing, missing transactions) are flagged with drill-to-transaction; NexusAI's reconciliation is architecturally ready but not validated against live GL data |
| Audit Trail & SoD | ✅ 100% Match | **GAP:** RBAC and audit are enforced — no **tax determination trace** (Oracle: for every invoice line, the tax engine records the exact rule sequence that was evaluated to arrive at the tax code (Rule 1: Check Supplier Country → Rule 2: Check Buyer Country → Rule 3: Check PTCC → Result: Standard VAT 20%); auditors can trace every tax decision without asking the IT team); no **tax control account reconciliation certification** (Oracle: the Tax Controller must certify the reconciliation before the period can be closed; an uncertified reconciliation blocks the financial period close) |
| Extensibility / Plugin-based Jurisdiction Registration | ✅ 100% Match | **GAP:** Plugin-based jurisdiction registration is implemented — no **regime-to-rate configuration UI** (Oracle: tax regimes, tax types, tax statuses, tax rates, and tax rules are all configured through a guided UI (Manage Tax Regimes, Manage Tax Rates); NexusAI's `registerJurisdiction` is a programmatic API call, not a no-code self-service UI for a tax administrator) |
| Tax Return Generation (RCM + Net Payable Analysis) | ✅ 100% Match | **GAP:** Tax return generation with RCM and net payable is implemented — no **country-specific tax box mapping** (Oracle: for each country's VAT return format, specific report lines (boxes) are mapped to transaction types; e.g., UK Box 1 = Output VAT, Box 4 = Input VAT, Box 6 = Total Sales; NexusAI generates a generic report without country-specific box mapping); no **intrastat reporting** (Oracle: for EU member states, Oracle generates the Intrastat statistical report of intra-community goods movements (arrivals and dispatches) required by customs authorities) |
| **[MISSING]** Withholding Tax (WHT) Management | — | **GAP:** No WHT module (Oracle Fusion Tax: withholding tax is calculated on AP payments to vendors in withholding tax jurisdictions (e.g., India TDS, US 1099-MISC backup withholding); WHT certificates are generated per vendor per period; annual WHT return (Form 26Q in India, 1099-MISC in US) is filed with the tax authority) |
| **[MISSING]** e-Invoicing Compliance (B2B Mandate) | — | **GAP:** No e-invoicing compliance module (Oracle Fusion: for countries with B2B e-invoicing mandates (Saudi Arabia ZATCA, Italy SDI, India GST e-invoice), Oracle generates a signed XML invoice in the required format, obtains a clearance number (IRN/UUID) from the tax authority portal, and embeds it in the customer invoice before delivery; NexusAI has no e-invoicing capability) |

**Overall Oracle Parity Status:** ⚠️ Documented as 100% Tier-1 Readiness — GL reconciliation is self-admitted as "simulated/ready for injection." Engine architecture is credible, but key Oracle Tax capabilities are absent: tax content subscription (Vertex/Avalara), country-specific return box mapping, withholding tax, e-invoicing mandate compliance, and tax determination trace

**Oracle Gap Summary (Module 33 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| TAX-OG-01 | e-Invoicing Compliance (ZATCA / SDI / GST IRN) | Signed XML clearance for B2B e-invoicing mandates | 🔴 High |
| TAX-OG-02 | Withholding Tax (TDS, 1099, WHT Certificates) | WHT on AP payments; annual returns (Form 26Q, 1099) | 🔴 High |
| TAX-OG-03 | GL Reconciliation — Self-Admitted Simulated | Tax subledger vs GL control account live validation | 🔴 High |
| TAX-OG-04 | Tax Content Subscription (Vertex / Avalara) | Auto-update of rates/rules when legislation changes | 🟡 Medium |
| TAX-OG-05 | Country-Specific Tax Return Box Mapping | UK Box 1-9, German UStVA, French CA3, etc. | 🟡 Medium |
| TAX-OG-06 | Tax Determination Trace (Rule Sequence Audit) | Full rule evaluation log per invoice line | 🟡 Medium |
| TAX-OG-07 | Economic Nexus Threshold Monitoring (US Sales Tax) | Cumulative sales tracking per state; threshold alerts | 🟡 Medium |
| TAX-OG-08 | Product Taxability Matrix (PTCC per Item) | Per-item tax classification code × jurisdiction | 🟡 Medium |
| TAX-OG-09 | Intrastat Statistical Reporting (EU) | Arrivals/dispatches of goods between EU member states | 🟡 Medium |
| TAX-OG-10 | Tax Control Account Reconciliation Certification | Controller certifies reconciliation before period close | 🟡 Medium |
| TAX-OG-11 | Regime-to-Rate Configuration UI (No-Code Admin) | Tax regime/type/rate setup via guided UI, not API | 🟢 Low |

---

### 34. Time & Labor (Workforce Management)
**Source:** `analysis_time_labor_gap.md` | **Oracle Equiv:** Oracle Fusion Time & Labor / Oracle Workforce Management

> ⚠️ Analysis doc self-admits two partials: Level 8 ("Basic Config (ShiftConfig). No deep Rule Engine") and Level 12 ("Basic Service Logic" for overtime), plus Phase 33 AI explicitly marked incomplete (Forecasting & Anomaly prediction unchecked).

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Time & Labor) |
|:---|:---|:---|
| Shifts, Rostering, Timesheets | ✅ 100% | **GAP:** Shift definitions and weekly timesheets are implemented — no **biometric time capture** (Oracle WFM: integration with time clocks (Kronos, ADP InTouch) and mobile geo-fenced punch-in; physical clock-in events feed directly to the timesheet without manual entry; NexusAI is self-service manual entry only); no **retroactive timesheet correction** (Oracle: a manager can submit a retroactive correction to a locked/paid period; the correction generates a retro-pay adjustment in the next payroll run rather than unlocking the paid period) |
| Timekeeper Console | ✅ 100% | **GAP:** Bulk time entry with violations dashboard is implemented — no **time deviation alerting (ΣDIFF)** (Oracle Timekeeper: the console shows each employee's scheduled vs actual hours with a Σ-difference column; red-highlighted rows require timekeeper action before approval; NexusAI's violations dashboard shows late-in/early-out events but does not compare reported hours to a schedule-derived expected total) |
| Advanced Accruals Engine | ✅ 100% | **GAP:** Tenure-based accrual rules are implemented — no **negative balance borrowing policy** (Oracle: configurable by leave type — Sick Leave allows negative balance up to -40 hours; Vacation allows no negative balance; if the employee requests beyond the balance, Oracle shows the allowed borrow limit and auto-approves within it); no **accrual proration on hire/termination** (Oracle: if an employee joins mid-period, the accrual is prorated from the hire date; if terminated mid-period, the final accrual is prorated to the last day; balance forfeiture rules are applied at termination) |
| Global Holidays & Regional Policy Enforcement | ✅ 100% | **GAP:** Multi-country holiday calendars and regional policies are implemented — no **multi-calendar assignment per work pattern** (Oracle: an employee working a split-country assignment (e.g., splits time between UK and UAE) has two holiday calendars active simultaneously; Oracle determines which calendar applies based on the work location for each day); no **substitute holiday rule** (Oracle: if a public holiday falls on a weekend, Oracle automatically grants a substitute day off on the adjacent Monday per country-specific rules) |
| Payroll Engine Integration (Gross Pay Calc) | ✅ 100% | **GAP:** Timesheet-to-gross-pay flow is verified — no **labor cost distribution to cost center/project** (Oracle: each time entry line is tagged with a cost center, project, and task; when payroll runs, the gross wages are allocated proportionally to the tagged cost centers and posted via SLA to the GL; NexusAI payroll posts aggregate by employee without per-entry cost distribution) |
| AI Predictive Scheduling | ✅ 100% | **⚠️ SELF-ADMITTED (Phase 33):** Analysis doc explicitly marks "Advanced AI: Forecasting & Anomaly prediction" as **unchecked/incomplete** in Phase 33 — Oracle Workforce Management: demand-based AI scheduling uses historical transaction volumes, weather data, and seasonal patterns to generate an optimal shift plan for the period; managers receive a draft roster with coverage gaps highlighted; NexusAI's current implementation is described as "heuristic" |
| Fatigue Risk Detection | ✅ 100% | **GAP:** Fatigue Risk and Pattern Analysis are implemented — no **FLSA/WTD compliance enforcement** (Oracle: the Time Rule Engine enforces jurisdiction-specific overtime rules (US FLSA daily OT after 8h, weekly OT after 40h; EU Working Time Directive 48h avg/week, 11h daily rest); violations are automatically flagged before the timesheet is approved; NexusAI's "basic service logic" for overtime does not enforce multi-jurisdiction labor law thresholds); no **union work rule validation** (Oracle: union contracts define specific work rules (e.g., minimum call-in time, shift differential for Sundays, meal break penalties); Oracle's Time Rule Engine validates each timesheet against the applicable collective bargaining agreement) |
| **[MISSING]** Absence Management (Leave Requests) | — | **GAP:** Absence management is implied via leave balances but no dedicated absence request object is described — Oracle Fusion Absence Management: employees submit leave requests (Vacation, Sick, FMLA, Parental) with date range and reason; manager approves/denies; approved absences reduce the leave balance and automatically generate a replacement shift in the schedule if coverage is required; NexusAI shows Leave Balances on MyTime but has no leave request workflow |
| **[MISSING]** Time Rule Engine Deep Configuration UI | — | **GAP (Self-Admitted L8):** Analysis doc explicitly states "No deep Rule Engine" at Level 8 — Oracle Fusion Time & Labor: a configurable Time Rule Engine defines time calculation rules per pay policy (premium pay triggers, rounding rules, grace periods, meal break deductions) through a no-code UI; a payroll administrator can add a new union schedule without code changes |

**Overall Oracle Parity Status:** ⚠️ Core WFM flows are credibly implemented. Self-admitted partials in Time Rule Engine depth (L8), basic OT logic (L12), and incomplete AI scheduling (Phase 33). Oracle depth gaps in FLSA/WTD enforcement, union work rules, absence management workflows, retroactive correction, and labor cost distribution to project are significant for enterprise deployments

**Oracle Gap Summary (Module 34 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| WFM-OG-01 | FLSA/WTD Compliance Enforcement (Multi-Jurisdiction OT) | Auto-flag OT violations before timesheet approval | 🔴 High |
| WFM-OG-02 | Absence Management (Leave Request + Approval Workflow) | Leave request → approval → balance deduction + schedule coverage | 🔴 High |
| WFM-OG-03 | AI Predictive Scheduling — Self-Admitted Incomplete (Phase 33) | Demand-based AI roster with coverage gap alerts | 🔴 High |
| WFM-OG-04 | Labor Cost Distribution to Cost Center / Project | Per-timesheet-line allocation to GL via SLA | 🟡 Medium |
| WFM-OG-05 | Union Work Rule Validation (CBA per Employee) | Collective bargaining agreement enforcement per timesheet | 🟡 Medium |
| WFM-OG-06 | Time Rule Engine Deep Configuration UI (No-Code) | No-code rule definition for pay policies and rounding rules | 🟡 Medium |
| WFM-OG-07 | Retroactive Timesheet Correction + Retro-Pay Adjustment | Correction to locked period → retro-pay in next payroll | 🟡 Medium |
| WFM-OG-08 | Accrual Proration on Hire/Termination | Prorated accrual + balance forfeiture at termination | 🟡 Medium |
| WFM-OG-09 | Biometric Time Capture (Kronos / Geo-Fenced Mobile Punch) | Clock-in events feed timesheet without manual entry | 🟢 Low |
| WFM-OG-10 | Multi-Calendar Assignment (Split-Country Work Pattern) | Dual holiday calendar per employee based on work location | 🟢 Low |

---

### 35. Transportation & Logistics (TMS)
**Source:** `analysis_transportation_logistics_gap.md` | **Oracle Equiv:** Oracle Fusion Transportation Management (OTM) Cloud

> ⚠️ **Historical Audit Contradiction Within the Same Document:** The document contains 3 stacked audit layers. The earliest (preliminary) audit explicitly marks Route Planning Screen, Freight Settlement Console, and Carrier Portal as **placeholders / not yet created**; Level 13 AI is marked ❌ Missing ("AI service stubs; no AI assistant UI"). The intermediate audit retained "GL Auto-Posting Missing" and "Multi-stop/Pool Logic Missing." Final audit claims 100% parity with all gaps resolved.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion OTM) |
|:---|:---|:---|
| Order Management / Order Release (Reservation Integration) | ✅ Live | **GAP:** Order release via Reservation integration is implemented — no **order consolidation policy** (Oracle OTM: orders with the same origin, destination, carrier, and freight terms are automatically consolidated into a single shipment based on configurable consolidation parameters (weight limit, cube limit, time window); NexusAI plans 1:1 order-to-shipment without auto-consolidation policy enforcement) |
| Shipment Planning (Multi-leg / Stop Sequencing) | ✅ Live | **GAP:** Multi-leg stop sequencing is implemented — no **mode-of-transport selection** (Oracle OTM: TL, LTL, Parcel, Air, Ocean, Rail, Intermodal are all distinct transport modes with different rating engines, carrier pools, and lead-time rules; the planning engine selects the optimal mode per shipment based on weight, distance, and urgency; NexusAI's optimization is focused on TL routing with no multi-modal mode selection); no **load building (cubic/weight optimization)** (Oracle: the load builder packs orders into the truck to maximize cubic utilization and minimize deadhead; the engine respects hazmat segregation, temperature zones, and stack restrictions) |
| Bulk Optimization (Map Visualization + Cost Logic) | ✅ Live | **GAP:** Map visualization and cost logic are implemented — no **real-time traffic data integration** (Oracle OTM on-cloud: route optimization incorporates HERE Maps or Google Maps real-time traffic advisories; alternate routes are suggested when congestion adds >X minutes to ETA; NexusAI's route optimization is deterministic cost-based without live traffic); no **territory/zone-based rate matrix** (Oracle: freight rates are defined by origin-destination zone pair rather than exact lane; rate matrices are updated periodically from carrier tariff files) |
| Shipment Execution (Real-time Milestones + Risk Scores) | ✅ Live | **GAP:** Milestone tracking and delay risk scoring are implemented — no **carrier EDI 214 / API tracking integration** (Oracle OTM: milestone events are automatically received from carriers via EDI 214 (Transportation Carrier Shipment Status Message) or carrier tracking APIs (FedEx/UPS/XPO); milestones populate without manual entry; NexusAI relies on manual milestone logging only); no **SLA breach alert to customer** (Oracle: when a shipment is projected to miss its promised delivery date, an automated alert is sent to the customer with a revised ETA and the reason code) |
| Geospatial Visibility (Interactive Route Map) | ✅ Live | **GAP:** Interactive Leaflet route map is implemented — no **driver GPS real-time tracking** (Oracle OTM: via carrier driver app, the truck's GPS coordinates update every 2-5 minutes; the route map shows the truck's current position overlaid on the planned route; delay vs plan is calculated in real time); no **geofence arrival/departure events** (Oracle: when the truck enters or exits a predefined geofence around the origin or destination, a milestone event is automatically created without carrier manual input) |
| Freight Settlement (Automated GL Posting Interface) | ✅ Live | **GAP:** Freight settlement with GL posting interface is implemented — no **carrier invoice audit** (Oracle OTM Freight Payment: the system automatically audits every carrier invoice against the contracted rate card; rate discrepancies (carrier invoiced more or less than the contracted rate) are flagged for approval before payment; NexusAI's 3-way match compares shipment vs invoice but does not validate against the contracted rate line); no **freight accrual reversal** (Oracle: when the freight invoice is received and matched, the original freight accrual is automatically reversed and replaced with the exact invoiced amount; NexusAI's variance amount is tracked but accrual reversal is not automated) |
| Master Data (Carriers, Rates, Locations) | ✅ Live | **GAP:** Carrier, rate, and location master data are implemented — no **carrier capability attributes** (Oracle: each carrier record includes capability attributes (Hazmat certified, Temperature controlled, Oversize permit, ISO tank); the planning engine only selects carriers whose capabilities match the shipment's requirements; NexusAI carrier records have no capability attributes); no **equipment type master** (Oracle: equipment types (53ft Dry Van, 48ft Flatbed, Refrigerated, ISO Container) are maintained with their volumetric capacity; the load builder uses the equipment cube/weight for optimization) |
| **[MISSING]** Carrier Portal (External Self-Service) | — | **GAP (Self-Admitted in Intermediate Audit):** Intermediate audit explicitly lists "Carrier Portal — External iSupplier-like portal for carriers" as Phase 7 (future) — Oracle OTM: carriers log into a portal to accept/reject tendered loads, submit proof of delivery (POD) documents, and submit freight invoices; electronic tendering reduces phone/email dispatching overhead |
| **[MISSING]** Load Tender (Electronic Dispatch to Carrier) | — | **GAP:** No electronic load tender (Oracle OTM: when a shipment is planned, a load tender is electronically sent to the selected carrier via EDI 204/API; carrier responds Accept/Reject via EDI 990; if rejected, the system auto-tenders to the next carrier in the bid hierarchy; NexusAI has no tender-response workflow) |

**Overall Oracle Parity Status:** ⚠️ Documented as 100% Tier-1 — but earliest audit layer in same doc showed Route Planning Screen and Freight Settlement Console as non-existent placeholders. Post-remediation implementation is claimed complete. Oracle depth gaps in multi-modal transport, carrier EDI 214 integration, electronic load tendering, freight accrual reversal automation, and load building remain

**Oracle Gap Summary (Module 35 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| TMS-OG-01 | Electronic Load Tender (EDI 204) + Carrier Accept/Reject (EDI 990) | Auto-tender to next carrier in hierarchy on rejection | 🔴 High |
| TMS-OG-02 | Carrier EDI 214 / API Tracking Integration | Automatic milestone events from carrier systems | 🔴 High |
| TMS-OG-03 | Multi-Modal Transport Mode Selection (TL/LTL/Air/Ocean/Rail) | Mode optimization per weight, distance, urgency | 🔴 High |
| TMS-OG-04 | Carrier Invoice Rate Audit (Contract vs Billed) | Flag discrepancies before payment | 🟡 Medium |
| TMS-OG-05 | Load Building (Cubic/Weight Optimization with Hazmat Segregation) | Pack orders to maximize truck cube utilization | 🟡 Medium |
| TMS-OG-06 | Carrier Portal (External POD, Invoice Submission) | Self-service portal for carriers | 🟡 Medium |
| TMS-OG-07 | Real-Time Traffic Data in Route Optimization | HERE/Google Maps live traffic advisories | 🟡 Medium |
| TMS-OG-08 | Freight Accrual Reversal on Invoice Match | Auto-reverse accrual and replace with exact invoiced amount | 🟡 Medium |
| TMS-OG-09 | Order Consolidation Policy (Weight/Cube/Time Window) | Auto-consolidate orders to minimize shipments | 🟡 Medium |
| TMS-OG-10 | Driver GPS Real-Time Position on Route Map | Truck position every 2-5 minutes from driver app | 🟢 Low |
| TMS-OG-11 | Carrier Capability Attributes (Hazmat, Reefer, Oversize) | Planning engine filters carriers by capability match | 🟢 Low |

---

### 36. Treasury & Cash Management
**Source:** `analysis_treasury_gap.md` | **Oracle Equiv:** Oracle Fusion Treasury & Cash Management

> 🚨 **Critical Contradiction Within the Same Document:** The first section claims 100% Tier-1 parity. The later section (original forensic audit) explicitly states Debt Management = ❌ Critical/Missing, Investments = ❌ Critical/Missing, FX Hedging = ⚠️ Partial (revaluation only; no deal tracking), AI Forecasting = ❌ Missing (UI placeholder; no backend logic), and FX/SoD Deal Workbench = MISSING at Level 6. Post-remediation phases claim closure but the audit trail is within the same document.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Treasury) |
|:---|:---|:---|
| Debt & Investment (Amortized Cost, Fixed/Float, P&I Calc) | ✅ Ready | **⚠️ SELF-ADMITTED INITIAL STATE: ❌ Critical/Missing** (original forensic section). Final section claims remediated via `TreasuryService.calculateAmortization` — Oracle Treasury deepens: **day-count convention configurability** (Oracle: each debt instrument specifies its day-count convention — 30/360, Actual/360, Actual/365, Actual/Actual ISMA; interest accrual is computed differently for each; NexusAI's amortization service does not specify which convention is applied); **debt covenant monitoring** (Oracle: financial covenants (leverage ratio, interest coverage) are configured per borrowing; Oracle alerts treasury when the covenant is at risk of breach before the measurement date) |
| FX Hedging (Forward Contracts, Swap Linkage, Mark-to-Market) | ✅ Ready | **⚠️ SELF-ADMITTED INITIAL STATE: ⚠️ Partial — revaluation only; no forward deals**. Final section claims `Hedge Relationship` + `RiskMetrics` remediated — Oracle deepens: **IFRS 9 / ASC 815 hedge effectiveness testing** (Oracle: at each reporting date, Oracle performs both prospective and retrospective effectiveness tests for each hedge relationship; if effectiveness falls outside 80–125% band, hedge accounting is discontinued and the gain/loss is recycled to P&L; NexusAI's`calculateRiskMetrics()` provides VaR but no effectiveness testing framework); **CVA/DVA (Credit Valuation Adjustment)** for OTC derivatives (Oracle: counterparty credit risk adjustments are applied to the fair value of all OTC FX derivatives; CVA reduces the fair value asset to reflect counterparty default probability) |
| SoD Controls (Front Office vs Back Office Segregation) | ✅ Ready | **GAP:** `confirmDeal()` SoD enforcement is implemented and verified — Oracle deepens: **deal limit monitoring per trader** (Oracle: each trader has a pre-approved deal limit (notional and tenor); if the trader attempts to enter a deal above their limit, Oracle blocks the entry and routes to a limit excess approval workflow; NexusAI's SoD prevents self-confirmation but does not enforce per-trader deal size limits); **counterparty credit line enforcement** (Oracle: each counterparty has a credit exposure limit; when a new FX deal is entered, Oracle checks the current MTM exposure against the counterparty credit line and blocks the deal if the limit is exceeded) |
| Multilateral Intercompany Netting (`NettingService`) | ✅ Ready | **GAP:** Multilateral netting batches with legal entity isolation are implemented — Oracle deepens: **netting agreement legal enforceability** (Oracle: netting relies on ISDA Master Agreement or bilateral netting agreements stored in the system; if no netting agreement exists for a specific counterparty pair, Oracle excludes that pair from the netting run; NexusAI's netting batch includes all participants without agreement validation); **multi-currency netting settlement** (Oracle: all intercompany balances denominated in different currencies are converted to the netting currency at the agreed FX rate; the settled amount is posted via SLA to the intercompany clearing accounts in each currency) |
| Cash Forecasting + AI Anomaly Detection | ✅ Ready | **⚠️ SELF-ADMITTED INITIAL STATE: ❌ Missing** (original forensic section: "Liquidity Anomaly Detection is a UI placeholder; no backend logic"). Final section claims `CashForecastService.detectAnomalies` remediated — Oracle deepens: **bank statement auto-import (BAI2/SWIFT MT940)** (Oracle: bank account balances are updated daily via BAI2 or SWIFT MT940 electronic bank statement import; the cash position is automatically reconciled against the GL bank account; NexusAI's forecast is based on AP/AR due lines and manual adjustments, with no bank statement import); **intraday liquidity monitoring** (Oracle: for high-volume treasury operations, Oracle provides an intraday cash position updated in near-real-time from payment confirmations; NexusAI is day-level only) |
| Payment Hub (ISO 20022, SWIFT gpi Tracking) | ✅ Ready | **GAP:** ISO 20022 pain.001 and SWIFT gpi tracking are implemented — Oracle deepens: **payment factory model** (Oracle: subsidiaries submit payment instructions to the payment factory; the factory aggregates, nets, and releases payments from the central treasury account on behalf of subsidiaries; NexusAI's Payment Hub transmits individual payment instructions without a factory aggregation model); **sanctions screening integration** (Oracle: each payment is screened against OFAC/EU/UN sanctions lists before release; blocked payments are quarantined for compliance review; no equivalent screening is described in NexusAI's Payment Hub) |
| **[MISSING]** Bank Fee Analysis & Negotiation Intelligence | — | **GAP:** No bank fee analysis — Oracle Fusion Cash Management: bank service charges are imported from bank fee statements (AFP codes); Oracle aggregates fees by service type (wire transfer, account maintenance, lockbox) and compares against negotiated tariff; treasury receives a fee exception report for charges above the agreed rate; NexusAI has no bank fee management capability |
| **[MISSING]** Cash Concentration & Pooling Structures | — | **GAP:** No cash concentration structures — Oracle Treasury: physical sweeping (ZBA — Zero Balance Accounts) and notional pooling structures consolidate subsidiary cash into a master account; the concentration engine automatically triggers sweeps at end-of-day based on configurable thresholds; NexusAI has ZBA sweep references but no configurable concentration structure UI |

**Overall Oracle Parity Status:** 🚨 Same-document contradiction between initial forensic audit (Debt/Investments/AI = Critical/Missing) and final summary (100% Tier-1). Oracle depth gaps in day-count conventions, IFRS 9 effectiveness testing, debt covenant monitoring, bank statement auto-import, sanctions screening, and payment factory architecture are significant for any institutional treasury operation

**Oracle Gap Summary (Module 36 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| TRS-OG-01 | IFRS 9 / ASC 815 Hedge Effectiveness Testing | Prospective + retrospective test at each reporting date | 🔴 High |
| TRS-OG-02 | Bank Statement Auto-Import (BAI2 / SWIFT MT940) | Daily bank balance reconciliation vs GL | 🔴 High |
| TRS-OG-03 | Debt Covenant Monitoring (Leverage / Interest Coverage) | Pre-breach alerts before measurement date | 🔴 High |
| TRS-OG-04 | Sanctions Screening (OFAC/EU/UN) on Payments | Block and quarantine non-compliant payments | 🔴 High |
| TRS-OG-05 | Per-Trader Deal Size Limits + Counterparty Credit Lines | Block deals exceeding approved limits | 🟡 Medium |
| TRS-OG-06 | CVA/DVA Credit Valuation Adjustment for OTC Derivatives | Fair value adjustment for counterparty default risk | 🟡 Medium |
| TRS-OG-07 | Payment Factory Model (Subsidiary Payment Aggregation) | Central netting and release of subsidiary payments | 🟡 Medium |
| TRS-OG-08 | Netting Agreement Validation (ISDA / Bilateral) | Exclude counterparty pairs without netting agreements | 🟡 Medium |
| TRS-OG-09 | Cash Concentration / ZBA Pooling Structures (Configurable) | Configurable sweep thresholds per account hierarchy | 🟡 Medium |
| TRS-OG-10 | Bank Fee Analysis vs Negotiated AFP Tariff | Fee exception report for above-tariff charges | 🟡 Medium |
| TRS-OG-11 | Intraday Liquidity Monitoring (Near-Real-Time Position) | Intraday cash position from payment confirmations | 🟢 Low |
| TRS-OG-12 | Day-Count Convention Configurability (30/360, Act/360, etc.) | Per-instrument interest accrual convention | 🟢 Low |

---

### 37. Warehouse Management (WMS)
**Source:** `analysis_wms_gap.md` | **Oracle Equiv:** Oracle Fusion WMS / Oracle Warehouse Management Cloud

> ⚠️ **Self-Admitted Gaps Within the Same Document:** The initial forensic audit (pre-Phase 29) explicitly marks L7 (generic grids only — scannable grids missing), L8 Configuration Screens (MISSING), L11 Workflow & Controls (MISSING), and L15 Pagination (at risk — no server-side pagination for `listTasks`/Slotting). Phases 31-32 claim to close all remaining gaps with verification scripts passing. The original remediation plan itself lists Configuration UI and Directed Putaway as unchecked Phase 29 tasks.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion WMS Cloud) |
|:---|:---|:---|
| Multi-Org Structure (Subinventories, Locators) | ✅ Parity | **GAP:** Multi-org subinventory and locator structure is implemented — no **license plate number (LPN) tracking across org transfers** (Oracle WMS: when inventory moves between organizations or external warehouses, the LPN (License Plate Number / Handling Unit) travels with the physical goods; the system tracks the LPN's current location regardless of org boundary; NexusAI's `wms_handling_units` tracks LPNs within receiving and packing but org-transfer LPN continuity is not described) |
| Inbound Receiving (ASN, Inspection) | ✅ Parity | **GAP:** ASN and receipt processing are implemented — no **directed putaway (rule-based bin assignment)** (Oracle WMS: when goods are received, the putaway engine evaluates each item against a prioritized set of putaway rules (existing stock zone, fastest-moving zone, item family zone, empty bin) and directs the warehouse worker to a specific bin; the worker confirms by scanning the bin barcode; NexusAI's Phase 29.2 putaway was an unchecked task — Phase 31 claims a tabbed interface in `WmsTaskWorkbench` but no rule engine logic is described); no **quality inspection hold** (Oracle: items flagged for inspection at receipt are placed in a Quality Hold locator; they cannot be picked or issued until the QC disposition (Accept/Reject/Return to Supplier) is recorded) |
| Wave Planning, Directed Picking | ✅ Parity | **GAP:** Wave console and directed picking are implemented — no **cluster picking** (Oracle WMS: cluster picking allows a single warehouse worker to pick for multiple orders simultaneously using a cart with labeled totes; the system sequences the pick tasks to minimize travel; NexusAI implements wave picking and batch picking but cluster picking with multi-order cart management is described as "future"); no **replenishment trigger from picking** (Oracle: when a pick task reaches an empty primary location, Oracle automatically generates a replenishment task from the reserve location; NexusAI has no documented replenishment trigger logic) |
| Scan-to-Pack + Ship Confirm | ✅ Parity | **GAP:** Packing Station and Ship Confirm are implemented — no **manifesting with carrier label printing** (Oracle WMS: on ship confirm, Oracle calls the carrier's rating API (FedEx/UPS/DHL) to retrieve the shipping rate and generates a carrier-compliant label (ZPL/DPL format) for the parcel; the label is sent to a label printer on the packing bench; NexusAI's shipping integration is described as "Mock Carrier API only"); no **bill of lading (BOL) generation** (Oracle: a BOL is automatically generated for every truck shipment listing all LPNs, weights, and hazmat declarations) |
| Slotting Analysis + Pick-Path Sorting | ✅ Parity | **GAP:** V1 heuristic slotting (velocity-based) and pick-path sorting are implemented — Oracle WMS deepens: **seasonal re-slotting** (Oracle: the slotting engine re-evaluates bin assignments periodically (weekly/monthly); items that have gained velocity are promoted to primary pick locations closer to the shipping dock; slow-moving items are demoted to reserve; no seasonal parameter is configurable in NexusAI's slotting service — it is described as velocity-only); **weight and cube constraints in slotting** (Oracle: heavy items are assigned to floor-level bins to avoid ergonomic risk; slim items are assigned to narrow-face bins; the slotting engine respects bin capacity constraints) |
| Cycle Counting, Reservations | ✅ Parity | **GAP:** Cycle counting and reservations are implemented — no **ABC/XYZ classification-driven count frequency** (Oracle WMS: the cycle count scheduler assigns count frequency based on item classification — A items (high-value/high-velocity) are counted weekly, B items monthly, C items quarterly; the count schedule is automatically generated; NexusAI's cycle counts are not described as classification-frequency driven); no **count variance approval threshold** (Oracle: count variances above a configurable % threshold require second-count verification and supervisor approval before inventory is adjusted) |
| Configuration Screens (Zones, Pick Rules, Wave Templates) | ✅ Parity | **⚠️ SELF-ADMITTED INITIAL GAP (L8):** Pre-Phase 29 audit explicitly marks Configuration Screens as ❌ MISSING. Phase 31 claims `WmsStrategyManager` for rules and Phase 32 claims Wave Template save/load. Oracle WMS deepens: **put-away rule sequencing with priorities** (Oracle: an administrator configures an ordered list of putaway rules; Rule 1 (existing-stock proximity) is evaluated first; if no compliant bin is found, Rule 2 (zone-based) is evaluated; NexusAI's strategy configuration scope is not described at this depth) |
| Scalability (Server-Side Pagination for Tasks/Slotting) | ✅ Parity | **⚠️ SELF-ADMITTED INITIAL GAP (L15):** Pre-Phase 29 audit explicitly marks `listTasks` and Slotting Analysis as lacking pagination — "Not safe for >10k tasks". Phase 31-32 claim verification scripts passed. Oracle WMS deepens: **task interleaving for workforce efficiency** (Oracle WMS: the task management engine interleaves putaway tasks into a picker's route when they are traveling in that direction after a pick — eliminating empty-travel legs; NexusAI's task execution assigns tasks sequentially without interleaving) |
| **[MISSING]** Yard Management (Dock / Trailer / Appointment) | — | **GAP (Self-Admitted):** Pre-Phase 29 audit explicitly states Yard Management (Dock/Trailer management) = ❌ Missing and not in scope — Oracle WMS has a Yard Management module: carriers book dock appointments in advance; on arrival, the yard manager checks in the trailer on a dock appointment screen; trailers are staged in yard positions; dock doors are managed with arrival/departure times; NexusAI has no Yard Management module |
| **[MISSING]** RF / Mobile Scanner Optimized UI | — | **GAP (Self-Admitted L7):** Pre-Phase 29 audit explicitly states "generic grids only. Need high-efficiency WMS grids" — Oracle WMS Mobile: the Oracle WMS mobile UI is purpose-built for RF scanners and warehouse handhelds (simplified screens, large touch targets, barcode scan fields, one-task-at-a-time flow); NexusAI's WmsTaskWorkbench is a standard web grid not optimized for RF scanner screens |
| **[MISSING]** Labor Planning & Productivity Tracking | — | **GAP:** The pre-Phase 29 audit explicitly marks Labor Management as ❌ None at Level 13. Phase 31 claims `WmsLaborDashboard` was added for productivity metrics — Oracle WMS Labor Management: engineered labor standards (ELS) define the expected time per task type; actual time is tracked per task; variance from standard generates a productivity score (SPH — Shipments Per Hour); labor planning uses the wave forecast to staff the shift appropriately; NexusAI's labor dashboard shows metrics but no engineered standards comparison |

**Overall Oracle Parity Status:** ⚠️ Core WMS execution flows (wave picking, packing, ship confirm) are credibly implemented with verification scripts. Self-admitted gaps in L7 (RF/scanner grids), putaway rule depth, and Yard Management. Oracle depth gaps in cluster picking, carrier manifesting, slotting weight/cube constraints, ABC-driven cycle count frequency, labor standards, and LPN cross-org continuity remain

**Oracle Gap Summary (Module 37 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| WMS-OG-01 | Directed Putaway Rule Engine (Rule Priority Sequence) | Worker directed to specific bin based on prioritized rules | 🔴 High |
| WMS-OG-02 | Yard Management (Dock Appointments, Trailer Staging) | Pre-arrival dock booking; yard position tracking | 🔴 High |
| WMS-OG-03 | Carrier Manifesting + Label Printing (ZPL/DPL) | Carrier label generated and printed on ship confirm | 🔴 High |
| WMS-OG-04 | Replenishment Task Auto-Trigger from Pick Depletion | Empty primary location triggers reserve pull | 🟡 Medium |
| WMS-OG-05 | Cluster Picking (Multi-Order Cart with Tote Labels) | Single worker picks multiple orders simultaneously | 🟡 Medium |
| WMS-OG-06 | Quality Inspection Hold (Receipt → QC Disposition) | Quarantine bay + supervisor Accept/Reject/Return | 🟡 Medium |
| WMS-OG-07 | ABC/XYZ Classification-Driven Cycle Count Frequency | A=weekly, B=monthly, C=quarterly auto-schedule | 🟡 Medium |
| WMS-OG-08 | RF / Mobile Scanner Optimized UI (One-Task-at-a-Time) | Purpose-built mobile screens for handheld scanners | 🟡 Medium |
| WMS-OG-09 | Labor Standards (ELS) vs Actual SPH Productivity | Engineered time-per-task standard comparison | 🟡 Medium |
| WMS-OG-10 | Task Interleaving (Combine Putaway into Pick Route) | Eliminate empty-travel legs by blending task types | 🟡 Medium |
| WMS-OG-11 | Slotting Weight/Cube Constraints (Ergonomic Bin Assignment) | Heavy items to floor bins; size-matched bin face | 🟢 Low |
| WMS-OG-12 | Count Variance Approval Threshold (Second-Count + Supervisor) | Variances above threshold require verification before adjustment | 🟢 Low |

---

### 38. Workforce Rewards (Compensation & Payroll)
**Source:** `analysis_workforce_rewards_gap.md` | **Oracle Equiv:** Oracle Fusion Global Payroll + Workforce Compensation

> ⚠️ Analysis doc explicitly states **"100% Feature Parity with targeted Level-1 capabilities"** — not full Level-15 parity. Global Payroll Connectors (ADP/Workday integration) are explicitly listed as **Post-Tier-1 future enhancements**. Payslip PDF Generation appears in `complete_document.md` claimed features but the actual analysis doc lists it under "Next Steps" (unchecked future).

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Global Payroll) |
|:---|:---|:---|
| Salary Basis / Pay Plans / Pay Elements | ✅ 100% | **GAP:** Salary basis and pay elements are implemented — no **compensation band enforcement** (Oracle Fusion Workforce Compensation: each salary basis is linked to a compensation grade and salary range (minimum/midpoint/maximum); if a manager proposes a salary outside the grade range, Oracle flags a compa-ratio violation and requires an override justification; NexusAI's compensation system records salary amounts with no grade-range boundary validation); no **total compensation statement** (Oracle: employees can download a personalized statement showing base salary, bonus, benefits value, and equity awards in a single PDF view) |
| Compensation Dashboard (Planning) | ✅ 100% | **GAP:** Compensation planning dashboard is implemented — no **merit matrix / worksheets** (Oracle Fusion Workforce Compensation: compensation managers receive a planning worksheet pre-populated with each employee's current salary, performance rating, compa-ratio, and recommended merit increase percentage from a configured merit matrix (Performance Rating × Position-in-Range); NexusAI's dashboard shows planning metrics but no matrix-driven worksheet for managers) |
| Payroll Workbench (Gross-to-Net → Run Results) | ✅ 100% | **GAP:** Gross-to-Net calculation and run results are verified — no **payroll costing (element-level GL split)** (Oracle Global Payroll: each pay element (Base Salary, Bonus, Overtime) is mapped to a specific GL cost account; when the payroll is costed, Oracle generates payroll journal entries to debit Salary Expense per cost center and credit Payroll Clearing; NexusAI's payroll posts aggregate by employee without element-level GL distribution); no **retroactive costing** (Oracle: if a prior-period payroll entry is corrected, Oracle generates retroactive costing adjustments automatically to correct the prior-period GL entries) |
| 2025 Progressive Tax Engine (Multi-Jurisdiction) | ✅ 100% | **GAP:** US Federal 2025 progressive tax is verified — **missing multi-country legislative data groups** (Oracle Global Payroll: each country's payroll is run within a separate Legislative Data Group (LDG) containing the country's tax tables, statutory deductions, and social security rules; NexusAI's tax engine covers US Federal logic only; analysis doc explicitly calls global payroll "post-Tier-1"); no **statutory payment file generation** (Oracle: payroll produces country-specific statutory files — US ACH NACHA file for direct deposit, UK BACS file, SEPA credit transfer XML; NexusAI's payroll module does not describe statutory payment file output) |
| PII Security Masking | ✅ 100% | **GAP:** `maskPII` is active on salary endpoints — no **data access sets for payroll** (Oracle: a Payroll Manager's data access set restricts which legal entities' payroll runs they can view or process; a UK payroll admin cannot see US payroll runs; NexusAI's RBAC is role-based but does not restrict by legal entity payroll boundary) |
| Retro-Pay Detection (AI) | ✅ 100% | **GAP:** Retroactive pay detection via effective-date misalignment is verified — Oracle deepens: **batch retroactive processing with element-level adjustments** (Oracle Global Payroll: retroactive processing calculates the delta between what was paid in prior periods and what should have been paid; each element is corrected individually and the delta is paid in the current period as a separate "Retro" element entry; NexusAI's retro-pay detection warns of misalignment but does not generate element-level delta adjustments) |
| Payroll Anomaly Detection (AI) | ✅ 100% | **GAP:** Z-score variance anomaly detection is verified — Oracle deepens: **balance verification before payroll confirm** (Oracle: before a payroll run is confirmed and payments released, Oracle runs a set of validation rules — employees with zero net pay, employees whose net pay changed by more than X%, employees who have new or terminated elements; the payroll administrator must review and sign off on each exception before the run is confirmed) |
| Fatigue Risk (Labor AI) | ✅ 100% | **GAP:** Fatigue risk detection integrates with WFM as verified — Oracle deepens: **absence plan integration with payroll deductions** (Oracle: approved sick leave deductions (salary continuation vs. unpaid leave) are automatically processed by Payroll via an Absence element; NexusAI's labor AI detects fatigue but integration between absence approval and payroll element creation is not described) |
| HCM Integration (Recruitment → Core HR → Comp → Payroll) | ✅ 100% | **GAP:** End-to-end Hire-to-Pay flow is verified — no **position management (headcount control)** (Oracle: positions define the approved headcount per department; when a hiring manager attempts to create a requisition for a position that is already fully occupied, Oracle blocks the requisition until a position vacancy is approved; NexusAI's recruiting does not validate against position headcount budgets) |
| Payslip Generation (PDF) | ✅ 100% | **⚠️ SELF-ADMITTED FUTURE (Analysis Doc "Next Steps"):** The actual analysis doc lists "Add Payslip PDF Generation" under future Next Steps — Oracle Global Payroll: payslips are generated as PDF documents accessible to employees via self-service after the payroll run is confirmed; each payslip shows gross-to-net breakdown by element, statutory deductions, year-to-date totals, employer contributions, and bank details; NexusAI's PayrollWorkbench shows run results in-browser but whether a downloadable payslip PDF is generated is contradicted between the analysis doc and the complete_document summary |
| RBAC (Comp Manager, Payroll Admin, Employee ESS) | ✅ 100% | **GAP:** Role-based access is implemented — no **manager self-service compensation approval chain** (Oracle Fusion Workforce Compensation: compensation proposals flow through a configurable approval chain — Manager → HR Business Partner → Finance; each approver sees the proposals for their subordinate hierarchy and can approve, modify, or send back; NexusAI's payroll has run-level approval but no multi-tier compensation proposal workflow) |
| **[MISSING]** Benefits Administration (Open Enrollment) | — | **GAP (Self-Admitted Post-Tier-1):** Open Enrollment is referenced in Phase 5 as completed but the analysis doc's "Future Enhancements" section does not include benefits in the core Tier-1 scope — Oracle Fusion Benefits: the benefits engine supports life event processing (new hire, marriage, birth of child); employees self-enroll during open enrollment windows; plan costs are pre-calculated with employer/employee contribution splits; verified deductions are passed to payroll via benefit deduction elements; the degree to which NexusAI's implementation matches Oracle depth is not documented |

**Overall Oracle Parity Status:** ⚠️ Core Hire-to-Pay flow is well-implemented with verification scripts. Scope caveat — analysis doc explicitly states "targeted Level-1 capabilities" not all 15 levels. Oracle depth gaps in payroll costing (GL split), legislative data groups (multi-country), statutory payment files (ACH/BACS/SEPA), merit matrix worksheets, compensation band enforcement, and position headcount control are significant for full Oracle parity

**Oracle Gap Summary (Module 38 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| PAY-OG-01 | Multi-Country Legislative Data Groups (UK/EU/APAC Payroll) | Country-specific tax tables and statutory deductions | 🔴 High |
| PAY-OG-02 | Payroll Costing — Element-Level GL Distribution | Salary expense split by cost center per pay element | 🔴 High |
| PAY-OG-03 | Statutory Payment File Generation (ACH / BACS / SEPA XML) | Country-specific bank payment output file | 🔴 High |
| PAY-OG-04 | Payslip PDF Generation — Self-Admitted Future (Analysis Doc) | Downloadable payslip with YTD and employer contributions | 🔴 High |
| PAY-OG-05 | Merit Matrix + Compensation Planning Worksheets | Manager worksheet with compa-ratio and merit %-recommendation | 🟡 Medium |
| PAY-OG-06 | Compensation Band / Grade-Range Enforcement | Salary outside grade range triggers override justification | 🟡 Medium |
| PAY-OG-07 | Multi-Tier Compensation Proposal Approval Chain | Manager → HRBP → Finance approval workflow | 🟡 Medium |
| PAY-OG-08 | Position Management (Headcount Control per Department) | Block requisition if position is already full | 🟡 Medium |
| PAY-OG-09 | Retroactive Costing Delta (Prior-Period GL Correction) | Element-level delta adjustments per prior period | 🟡 Medium |
| PAY-OG-10 | Balance Verification Rules Before Payroll Confirm | Pre-confirm exception report (zero-net-pay, large variance) | 🟡 Medium |
| PAY-OG-11 | Total Compensation Statement (Salary + Benefits + Equity PDF) | Personalized total rewards statement for employee | 🟢 Low |
| PAY-OG-12 | Data Access Sets for Payroll (Legal Entity Segregation) | UK payroll admin cannot see US payroll runs | 🟢 Low |

---

### 39. Recruiting / Talent Acquisition
**Source:** `analysis_recruiting_gap.md` | **Oracle Equiv:** Oracle Fusion Recruiting Cloud (ORC)

> ℹ️ Module is genuinely well-implemented as a V1 ATS with verification of all core flows. Gaps are Oracle Recruiting Cloud depth features rather than missing core functionality. Analysis doc acknowledges "External Board Integrations" and CMS capabilities are future.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Recruiting Cloud) |
|:---|:---|:---|
| Requisition Management (+ Approval Workflow) | ✅ Complete | **GAP:** Requisition creation and status management are implemented — no **requisition budget validation** (Oracle Fusion Recruiting: each requisition is linked to a budget/headcount plan; if creating the requisition would exceed the approved headcount budget for the department, Oracle flags the requisition and routes it to Finance for additional approval; NexusAI's requisition workflow does not validate against a headcount or budget limit); no **blind requisition posting** (Oracle ORC: requisitions can be posted internally, externally, or both, with independent closing dates per audience; NexusAI posts to the single `/careers` public site only) |
| Public Career Site (`/careers`) | ✅ Complete | **GAP:** Single-tenant career site is active — no **multi-branded career sites** (Oracle ORC: each subsidiary or brand can have its own career site with distinct branding, CSS, and featured job categories; candidate who applies on Brand A's site is tagged to Brand A's pool; NexusAI has one `/careers` endpoint with a single brand); no **job alert subscriptions** (Oracle: candidates register for email alerts when a job matching their saved criteria is posted; NexusAI has no candidate job subscription feature) |
| AI Resume Parsing & Scoring (Deterministic) | ✅ Complete | **GAP:** Keyword-based deterministic scoring is implemented — no **skills taxonomy alignment** (Oracle ORC: candidate skills extracted from the resume are matched against Oracle's Skills Cloud taxonomy; the match normalizes skill synonyms ("JavaScript" = "JS" = "ECMAScript") and gaps against the job's required competency profile; NexusAI's resume parsing extracts and stores skills as text without a normalized taxonomy match); no **candidate ranking across the entire pool** (Oracle: all active candidates for a requisition are ranked in a single sorted list by their AI score; NexusAI's scoring is per-candidate without a cross-candidate ranking list view for the recruiter) |
| Candidate Selection Process (CSP/Kanban Pipelines) | ✅ Complete | **GAP:** Configurable Kanban pipeline stages are implemented — no **disqualification questionnaire** (Oracle ORC: candidates who fail a mandatory screening question ("Are you legally eligible to work in US?") are automatically moved to a Disqualified stage with a system-generated rejection reason; NexusAI's pipeline requires manual stage movement without auto-disqualification logic); no **sourcing attribution tracking** (Oracle: each candidate record shows which source channel (career site, LinkedIn, referral, agency) brought them in; recruiters can see source ROI without a separate analytics dashboard — NexusAI tracks source ROI at an aggregate dashboard level only) |
| Interview Scheduling, Feedback, Ratings | ✅ Complete | **GAP:** ICS calendar sync and interview feedback are implemented — no **interviewer availability self-scheduling** (Oracle ORC: candidates are sent a self-scheduling link and choose from the interviewer panel's available slots; the slot is blocked in the interviewer's calendar without recruiter involvement; NexusAI requires recruiter-driven scheduling via ICS generation); no **structured interview guide** (Oracle: each pipeline stage has an associated interview guide defining the competencies to be assessed and the rating scale; all interviewers use the same scorecard to enable consistent comparison) |
| Offer Management (Create, Approve, Accept) | ✅ Complete | **GAP:** Offer creation, DRAFT → PENDING → APPROVED state machine is implemented — no **offer letter e-signature** (Oracle ORC: when an offer is approved, Oracle generates the offer letter from a template and sends it to the candidate for e-signature via DocuSign or Oracle's native e-signature; signed document is stored on the candidate record; NexusAI's offer acceptance is a status change without e-signature document generation); no **competing offer / counter-offer tracking** (Oracle: if a candidate declines citing a competing offer, the recruiter can record the competing offer details; this feeds into offer competitiveness analytics) |
| Payroll Sync (On Offer Acceptance) | ✅ Complete | **GAP:** Salary creation trigger on offer acceptance is implemented and verified — no **background check integration trigger** (Oracle ORC: on offer acceptance, a background check request is automatically sent to a configured vendor (Sterling, Checkr, First Advantage) via API; the recruiter receives a pass/fail status back; NexusAI's onboarding does not include a background check integration trigger) |
| Onboarding Task Generation & Progress Tracking | ✅ Complete | **GAP:** Auto-generated onboarding task checklists are implemented — no **Day-1 provisioning integration** (Oracle HCM Onboarding: the provisioning task triggers are sent to IT Service Management (ServiceNow/JIRA) automatically on hire date to create laptop, email, and access provisioning requests; the status of each IT ticket feeds back to the onboarding checklist; NexusAI's onboarding tracks IT/Facilities tasks in a checklist but does not integrate with an ITSM system for ticket creation); onboarding email templates are a "to-be-extended" future item per the analysis doc |
| Analytics (Hiring Funnel, Source ROI) | ✅ Complete | **GAP:** Hiring funnel and source ROI analytics are implemented — no **EEO / diversity compliance reporting** (Oracle ORC: US employers must file EEO-1 reports with EEOC; Oracle collects self-identified demographic data (race, gender, veteran status, disability) with clear opt-out options; generates EEO-1 Category Component 1 report; NexusAI's analytics covers Time-to-Fill and Source ROI but has no EEO data collection or compliance report) |
| GDPR-Ready PII Masking (Role-Based) | ✅ Complete | **GAP:** `maskPII` is active for hiring managers — no **automated candidate data purge** (Oracle ORC: GDPR requires that rejected candidates' data be purged after a configurable retention period (typically 6-12 months); Oracle has a configurable purge schedule that automatically anonymizes or deletes candidate records exceeding the retention period; the analysis doc notes "Full Audit Log table to be unified with Global Audit logic" is still pending) |
| **[MISSING]** Staffing Agency / Vendor Management (VMS) | — | **GAP:** No agency management — Oracle Fusion Recruiting: agencies are registered in the system with a portal login; recruiters can share job requisitions with specific agencies; agencies submit candidate profiles through the portal; agency fee agreements (contingency % or retained) are stored for invoice reconciliation; NexusAI's system has no agency/vendor management capability |
| **[MISSING]** Job Board Direct API Posting (LinkedIn, Indeed, Glassdoor) | — | **GAP (Self-Admitted):** Analysis doc explicitly lists "External Board Integrations" as future Oracle ORC: requisitions are posted directly to LinkedIn Jobs, Indeed, Glassdoor, and job aggregators via built-in APIs; applications from these boards are pulled back with source attribution; NexusAI posts only to its hosted `/careers` page |

**Overall Oracle Parity Status:** ✅ Core ATS flows are credibly and completely implemented for a V1 product. Oracle Recruiting Cloud depth gaps in skills taxonomy, e-signature, EEO compliance reporting, self-scheduling, ITSM provisioning integration, and agency management represent Phase 2 scope rather than critical blockers

**Oracle Gap Summary (Module 39 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| REC-OG-01 | EEO / Diversity Compliance Reporting (EEO-1 Report) | EEOC-required demographic data collection + report | 🔴 High |
| REC-OG-02 | Offer Letter E-Signature (DocuSign / Native) | Signed offer document stored on candidate record | 🔴 High |
| REC-OG-03 | Background Check Integration (Sterling / Checkr API) | Auto-trigger on offer acceptance; pass/fail back | 🔴 High |
| REC-OG-04 | GDPR Candidate Purge Schedule (Retention-Based Auto-Anonymize) | Auto-purge rejected candidates after configurable period | 🟡 Medium |
| REC-OG-05 | Job Board Direct API Posting (LinkedIn / Indeed / Glassdoor) | Post requisitions multi-channel with source attribution | 🟡 Medium |
| REC-OG-06 | Skills Taxonomy Normalization (Oracle Skills Cloud) | Synonym collapse + competency profile gap scoring | 🟡 Medium |
| REC-OG-07 | Candidate Self-Scheduling (Interviewer Availability Link) | Candidate selects slot from panel availability | 🟡 Medium |
| REC-OG-08 | Structured Interview Guide (Competency Scorecard per Stage) | All interviewers use same rating rubric per stage | 🟡 Medium |
| REC-OG-09 | Staffing Agency / VMS Portal (Agency Submission + Fee) | Agency portal with candidate submission and fee agreement | 🟡 Medium |
| REC-OG-10 | ITSM Provisioning Integration (ServiceNow / JIRA Ticket) | Auto-create IT provisioning tickets on hire date | 🟡 Medium |
| REC-OG-11 | Auto-Disqualification via Screening Questions | Mandatory question failure → auto-Disqualified stage | 🟢 Low |
| REC-OG-12 | Job Alert Subscriptions for Candidates | Email alerts when matching job is posted | 🟢 Low |

---

### 40. Project Accounting
**Source:** `analysis_project_accounting_gap.md` | **Oracle Equiv:** Oracle Fusion Project Accounting (PA)

> ℹ️ One of the most credibly audited modules in the codebase. The analysis doc contains 6 named AUDIT-xxx findings (AUDIT-FIN-001 through AUDIT-PPM-001), each with a named component as evidence of resolution and a severity level. All are marked resolved. Oracle gaps below focus on depth features not in the self-assessment scope.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Project Accounting) |
|:---|:---|:---|
| Project Foundation (UI: ProjectList, Templates, Types, Rates) | ✅ Full Parity | **GAP:** Project foundation with WBS, templates, and rate schedules is implemented — no **financial plan types (budget versioning)** (Oracle PA: a project can have multiple financial plan types — Approved Budget, Working Forecast, Original Budget; each version is retained for comparison; the approved budget version is locked and requires a formal revision process to change; NexusAI's budget vs actual tracks one budget version per project without multi-version plan type support) |
| Cost Collection (AP, Inventory, Labor Sources) | ✅ Full Parity | **GAP:** Multi-source cost collection (AP, Inventory, Labor) is verified — no **expense report import** (Oracle PA: employee expense reports approved in Oracle Expenses are automatically imported as expenditure items on the project; each expense line carries the project, task, and expenditure type; NexusAI's transaction import covers AP, Inventory, and Labor but expense report import is not explicitly listed as a source); no **credit card transaction import** (Oracle: corporate card charges are imported from the card provider feed and linked to project tasks via expense allocation) |
| Burdening (Burden Manager) | ✅ Full Parity | **GAP:** Burden allocation via rate matrix is implemented — no **organization-level burden override** (Oracle PA: burden schedules can be defined globally or overridden at the organization level; a government contract may have a lower G&A rate than a commercial contract; the burden engine selects the applicable schedule based on the project's owning organization and contract type; NexusAI's burden manager applies a single schedule without organization-level override logic) |
| SLA Accounting / GL Distributions (SLA Event Monitor) | ✅ Full Parity | **GAP:** SLA journal distribution with event monitoring and pagination is verified — no **cost transfer accounting** (Oracle PA: when costs are transferred between projects or tasks, Oracle generates reversing and replacement journal entries in the same SLA event; the SLA audit trail shows both the original cost and the corrected cost on the receiving project; NexusAI's SLA Event Monitor shows distributions but cost transfer accounting journals are not described) |
| Capital Asset Workbench (CIP → FA) | ✅ Full Parity | **GAP:** CIP to Fixed Asset interface is implemented — no **asset cost allocation across grouped lines** (Oracle PA: when a capital project has multiple cost lines that collectively form one asset (e.g., construction materials + contractor labor + freight all relate to one building), Oracle groups them into a single asset cost allocation and transfers the sum to FA as one asset; NexusAI's CIP interface is described without this grouping/consolidation logic) |
| Billing Rules Manager | ✅ Full Parity | **GAP:** Billing rules manager is implemented (resolved as Critical AUDIT-PPM-001) — no **progress billing (% completion)** (Oracle PA: for fixed-price contracts, billing can be based on a predefined milestone schedule or a user-entered percent complete; Oracle generates a draft invoice for the milestone amount without requiring the client's purchase order to be matched; NexusAI's billing rules are implemented but progress billing based on contract milestones is not described); no **funding source limit tracking** (Oracle: each project has one or more funding sources with a hard limit; Oracle tracks the amount billed against each funding source and prevents billing beyond the approved limit) |
| Master Data (Bill Rates, Expenditure Types, Project Templates) | ✅ Full Parity | **GAP:** Bill rates, expenditure types, and templates are implemented — no **labor cost-to-revenue rate multiplier** (Oracle PA: bill rate schedules can define a multiplier on the labor cost rate to derive the billing rate (e.g., bill at 2.5x cost); this enables time-and-materials contracts where the billing rate automatically adjusts as salary costs change; NexusAI's bill rates are absolute amounts without a cost-multiplier relationship) |
| Transaction Import (AP + Inventory + Labor) | ✅ Full Parity | **GAP:** Multi-source transaction import is verified (resolved as AUDIT-FIN-005) — no **transaction rejection and resubmission workflow** (Oracle PA: imported transactions that fail validation (wrong project, inactive task, budget exceeded) are placed in a rejection queue; the project accountant reviews, corrects, and resubmits the rejected transactions; NexusAI's import shows pending transactions but a rejection-with-correction-workflow is not described) |
| **[MISSING]** Project Revenue Recognition (% Complete or Milestone) | — | **GAP:** Project costing is thoroughly implemented but project revenue recognition is not described — Oracle Fusion Project Accounting: for fixed-price projects, revenue is recognized separately from billing based on a method (% complete EVM — SPI-based, or milestone-based); revenue events are generated and posted via SLA independently of customer billing; NexusAI's module does not describe a separate revenue recognition engine for projects |
| **[MISSING]** Cross-Charge Billing (Lend/Borrow Between Orgs) | — | **GAP:** Cross-charge between project organizations is referenced in Module 41 as remediated but the mechanism is not described in the Module 40 analysis — Oracle PA: when a resource from Organization A works on a project owned by Organization B, Oracle generates a cross-charge expenditure on the borrowing project and a cross-charge revenue on the lending organization; the entries net to zero at the legal entity level |

**Overall Oracle Parity Status:** ✅ Most credibly verified module in the document. Six critical findings independently documented and resolved. Oracle depth gaps in revenue recognition method (% complete vs milestone), funding source limit tracking, progress billing, labor cost multiplier rates, and cross-charge mechanism description

**Oracle Gap Summary (Module 40 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| PA-OG-01 | Project Revenue Recognition (% Complete EVM / Milestone-Based) | Revenue events posted via SLA independently of billing | 🔴 High |
| PA-OG-02 | Funding Source Limit Tracking (Hard Cap per Funding Source) | Block billing when funding limit is reached | 🔴 High |
| PA-OG-03 | Progress Billing (Milestone / % Complete Invoice Generation) | Fixed-price invoice generation on milestone achievement | 🔴 High |
| PA-OG-04 | Transaction Rejection + Resubmission Workflow | Failed imports go to rejection queue for correction | 🟡 Medium |
| PA-OG-05 | Cross-Charge Billing (Lend/Borrow Between Organizations) | Cross-charge expenditure + revenue netting at legal entity | 🟡 Medium |
| PA-OG-06 | Financial Plan Types (Budget Versioning: Approved / Working / Original) | Multiple budget versions with lock and revision workflow | 🟡 Medium |
| PA-OG-07 | Cost Transfer Accounting (Reversing + Replacement SLA Journals) | SLA audit trail for cost reclassification between projects | 🟡 Medium |
| PA-OG-08 | Organization-Level Burden Schedule Override | Different G&A rates per org/contract type | 🟡 Medium |
| PA-OG-09 | Labor Cost-to-Revenue Rate Multiplier (T&M Bill Rate) | Bill rate = cost × multiplier for T&M contracts | 🟢 Low |
| PA-OG-10 | Asset Cost Grouping (Multi-Line CIP to Single FA Asset) | Consolidate multiple cost lines into one fixed asset | 🟢 Low |

---

### 41. Projects Costing (Additional Detail)
**Source:** `analysis_projects_costing_gap.md` | **Oracle Equiv:** Oracle Fusion Project Costing (supplementary to #27 PPM and #40 Project Accounting)

> ℹ️ This document is explicitly supplementary to Modules 27 (PPM) and 40 (Project Accounting). It provides Level-15 canonical decomposition across all 11 project dimensions with all items marked Remediated. Note: the PPM module (M27) had a critical finding of API Level 2 and UI Level 0. The Projects Costing module's analysis doc presents a separate, more complete implementation scope.

| Feature Area | Documented Status | Oracle Gap (vs Oracle Fusion Project Costing) |
|:---|:---|:---|
| Full Financial WBS | ✅ Remediated | **GAP:** Financial WBS with task hierarchy is implemented — no **WBS element type enforcement** (Oracle PA: each WBS element is assigned a type — Work Package (chargeable/billable), Planning Element (roll-up only), or Summary Task (grouping only); only Work Package elements accept cost charges; Oracle enforces this at transaction entry; NexusAI's task structure does not enforce element type constraints on cost collection) |
| AP/Inventory/Labor Cost Collection | ✅ Remediated | **GAP:** Multi-source cost collection is implemented and Level-15 verified — no **commitment tracking** (Oracle PA: purchase orders and open AP invoices that have not yet been paid are tracked as "commitments" against the project budget; the project budget screen shows Actual Cost + Committed Cost = Total Exposure vs Budget; NexusAI's expenditure inquiry shows actual costs only without commitment amounts from open POs) |
| Overhead Allocation (Burdening) | ✅ Remediated | **GAP:** Burden schedule matrix is implemented — no **actual vs standard cost burdening comparison** (Oracle PA: burdening can be applied at the standard cost rate or at the actual cost rate; the variance between actual and standard burdening is tracked separately; government contractors use actual cost burdening and must reconcile the actual overhead pool to the burdened project costs at fiscal year end; NexusAI's burden engine applies a configured rate without distinguishing standard vs actual cost methods) |
| Budget vs Actual | ✅ Remediated | **GAP:** Budget vs actual tracking is implemented — no **budget exception alerting** (Oracle PA: budget integration allows configurable exception rules: if actual + committed costs exceed X% of the approved budget for any task, an alert is sent to the project manager and the project accountant; NexusAI's EVM metrics show SPI/CPI but no configurable budget exception alert threshold that triggers notifications) |
| CIP → Fixed Assets Capitalization | ✅ Remediated | **GAP:** CIP to FA interface is implemented — no **depreciation start rule per asset** (Oracle: when the project capitalization interface transfers CIP costs to Fixed Assets, the depreciation start date is configurable per asset type — Placed in Service date, Fiscal Year start, or Prorate Convention; NexusAI's FA interface transfers the asset but the depreciation start rule configuration is not described in the project costing context) |
| Interproject Cross-Charge | ✅ Remediated | **GAP:** Interproject cross-charge is claimed remediated — Oracle deepens: **cross-charge transfer price method** (Oracle PA: the transfer price for cross-charge transactions can be set by method — at actual cost, at a negotiated rate, or at a burdened cost; each method produces different GL entries; if the negotiated rate differs from actual cost, Oracle books a cross-charge gain/loss on the lending organization; NexusAI's cross-charge implementation method and pricing rules are not documented) |
| Live Earned Value (SPI/CPI) | ✅ Remediated | **GAP:** SPI/CPI live EVM is implemented — no **physical percent complete method** (Oracle PA EVM: percent complete can be derived from cost-based (BCWP/BCWS), units-based (hours completed vs hours planned), or physical percent complete (PM manually enters the estimated % completion independent of cost); each method produces different earned value; NexusAI's EVM is described as cost-based only); no **estimate at completion (EAC) variance tracking** (Oracle: EAC = Actual Cost + Estimate to Complete; the variance between EAC and Budget at Completion (BAC) is the estimate variance; Oracle's project status report shows EAC vs BAC trend over time) |
| Template Engine | ✅ Remediated | **GAP:** Project template engine is implemented — no **template inheritance (create-from-existing-project)** (Oracle PA: a project can be created from scratch, from a template, or as a copy of an existing project; when copying from an existing project, the user selects which elements to copy — tasks, resources, budgets, billing rules; NexusAI's template engine creates from configured templates only) |
| Rate Schedules | ✅ Remediated | **GAP:** Bill rate hierarchical schedules are implemented — no **rate schedule effective dating** (Oracle PA: bill rates are effective-dated; when a rate changes on a specific date, transactions before the date use the old rate and transactions after use the new rate; the billing process automatically applies the correct rate based on the transaction date; NexusAI's rate schedules are not described as effective-dated) |
| **[MISSING]** Resource Plan vs Actual (Capacity Forecasting) | — | **GAP:** No resource forecasting vs actuals — Oracle Fusion Project Resource Management: project managers enter a resource plan (named or generic resources with planned hours per period); as the project executes, actual hours from timesheets are compared to the resource plan; over/under-allocation is highlighted in a resource capacity view; NexusAI's project module does not describe a resource plan vs actual comparison |
| **[MISSING]** Project Risk Register | — | **GAP:** No project risk register — Oracle Fusion PPM Risks: project risks are tracked with probability, impact, and mitigation strategy; risks above a severity threshold trigger an automated notification to the project sponsor; risk exposure (Probability × Impact) is aggregated across the project portfolio for executive dashboard visibility; NexusAI has no risk register entity described in any project module |

**Overall Oracle Parity Status:** ✅ All 11 claimed dimensions are well-documented with Level-15 decomposition. Supplementary to M27/M40. Oracle depth gaps in commitment tracking, budget exception alerting, resource plan vs actuals, physical % complete EVM method, and project risk register are missing enterprise project management capabilities

**Oracle Gap Summary (Module 41 Findings):**

| Gap ID | Feature | Oracle Fusion Capability | Severity |
|:---|:---|:---|:---|
| PC-OG-01 | Commitment Tracking (Open PO + AP Invoices vs Budget) | Total exposure = Actual + Committed vs Budget | 🔴 High |
| PC-OG-02 | Resource Plan vs Actual (Named Resource Capacity View) | Planned hours vs timesheet actuals per period | 🔴 High |
| PC-OG-03 | Budget Exception Alerting (% Threshold Notification) | Alert PM + accountant when cost exceeds budget threshold | 🔴 High |
| PC-OG-04 | Project Risk Register (Probability × Impact Exposure) | Risk tracking with portfolio-level exposure aggregation | 🟡 Medium |
| PC-OG-05 | Physical % Complete EVM Method (PM-Entered Independent of Cost) | PM-entered progress separate from cost-based earned value | 🟡 Medium |
| PC-OG-06 | EAC vs BAC Variance Trend (Estimate at Completion) | EAC trend over time on project status report | 🟡 Medium |
| PC-OG-07 | Cross-Charge Transfer Price Method (Actual / Negotiated / Burdened) | Method-specific GL entries + cross-charge gain/loss | 🟡 Medium |
| PC-OG-08 | Rate Schedule Effective Dating (Transaction-Date Rate Selection) | Auto-select rate based on transaction date | 🟡 Medium |
| PC-OG-09 | WBS Element Type Enforcement (Work Package vs Planning vs Summary) | Only Work Package elements accept cost charges | 🟢 Low |
| PC-OG-10 | Project Copy from Existing (Create-from-Project with Element Selection) | Copy tasks/resources/budgets/billing rules from existing project | 🟢 Low |
| PC-OG-11 | Actual vs Standard Cost Burdening Variance (Year-End Reconciliation) | Overhead pool actual vs standard burdening reconciliation | 🟢 Low |

---

## Summary Table

| # | Module | Source Document | Oracle Equivalent | Documented Status |
|:---|:---|:---|:---|:---|
| 1 | Accounts Payable | `analysis_ap_gap.md` | Oracle Fusion Payables | ✅ 100% Production Ready |
| 2 | Accounts Receivable | `analysis_ar_gap.md` | Oracle Fusion Receivables | ✅ 100% Tier-1 |
| 3 | Billing & Revenue Innovation | `analysis_billing_gap.md` | Oracle Fusion Billing | ✅ 100% Parity |
| 4 | Cash Management | `analysis_cm_gap.md` | Oracle Fusion Cash Mgmt | ✅ 100% Core Parity |
| 5 | Construction Management | `analysis_construction_management_gap.md` | Oracle ECC / Project Contracts | ✅ Tier-1 Signed Off |
| 6 | Core HR | `analysis_core_hr_gap.md` | Oracle Fusion Global HR | ✅ 100% Tier-1 |
| 7 | Cost Management | `analysis_cost_management_gap.md` | Oracle Fusion Cost Mgmt | ✅ Functional Parity |
| 8 | CRM | `analysis_crm_gap.md` | Oracle Fusion CX Cloud | ✅ Tier-1 Hardened |
| 9 | EPM Planning | `analysis_epm_planning_gap.md` | Oracle EPBCS | ✅ Enterprise-Grade |
| 10 | ESS / MSS | `analysis_ess_mss_gap.md` | Oracle Fusion HCM Self-Service | ✅ Tier-1 Certified |
| 11 | Expense Management | `analysis_expense_management_gap.md` | Oracle Fusion Expenses | ✅ 100% Tier-1 |
| 12 | Fixed Assets | `analysis_fa_gap.md` | Oracle Fusion Assets | ✅ Build Approved |
| 13 | Financial Close | `analysis_financial_close_gap.md` | Oracle Fusion FCCS | ✅ Tier-1 Ready |
| 14 | General Ledger | `analysis_gl_gap.md` | Oracle Fusion GL | ✅ 100% Parity |
| 15 | HR Analytics | `analysis_hr_analytics_gap.md` | Oracle HCM Analytics/OTBI | ✅ Tier-1 Certified |
| 16 | HR Compliance | `analysis_hr_compliance_gap.md` | Oracle HCM Compliance | ✅ All Phases Complete |
| 17 | Intercompany Accounting | `analysis_intercompany_accounting_gap.md` | Oracle AGIS | ✅ Tier-1 Enterprise Ready |
| 18 | Inventory Management | `analysis_inventory_gap.md` | Oracle Fusion Inventory | ✅ Build Approved |
| 19 | Landed Cost Management | `analysis_landed_cost_gap.md` | Oracle Fusion LCM | ✅ 85%→Tier-1 Core |
| 20 | Lease & Contract Mgmt | `analysis_lease_contract_gap.md` | Oracle Fusion Lease Acctg | ✅ Tier-1 Certified |
| 21 | Learning (LMS) | `analysis_lms_gap.md` | Oracle Fusion Learning | ✅ Tier-1 Ready |
| 22 | Maintenance (EAM) | `analysis_maintenance_gap.md` | Oracle Fusion EAM | ✅ Build Approved |
| 23 | Manufacturing | `analysis_manufacturing_gap.md` | Oracle Fusion MFG / OPM | ✅ All Audits Resolved |
| 24 | Manufacturing Costing | `analysis_manufacturing_costing_gap.md` | Oracle Fusion Mfg Costing | ✅ Tier-1 Approved |
| 25 | Master Data Management | `analysis_mdm_gap.md` | Oracle Fusion MDM/TCA/PIM | ✅ Tier-1 Feature Complete |
| 26 | Planning, Budgeting & Forecasting | `analysis_planning_budgeting_forecasting_gap.md` | Oracle EPBCS | ✅ Tier-1 Compliant |
| 27 | Project Portfolio Mgmt | `analysis_ppm_gap.md` | Oracle Fusion PPM | ✅ 100% Tier-1 |
| 28 | Procurement & SCM | `analysis_procurement_scm_gap.md` | Oracle Fusion Procurement | ✅ 100% Parity |
| 29 | Revenue Management | `analysis_revenue_mgmt_gap.md` | Oracle Fusion RMCS / ASC 606 | ✅ 100% Tier-1 |
| 30 | Subledger Accounting | `analysis_subledger_accounting_gap.md` | Oracle Fusion SLA | ✅ Audit Ready |
| 31 | Supplier Portal & PCM | `analysis_supplier_portal_gap.md` | Oracle iSupplier/PCM | ✅ 100% Tier-1 |
| 32 | Talent Management | `analysis_talent_mgmt_gap.md` | Oracle Fusion HCM Talent | ✅ 100% Tier-1 |
| 33 | Tax Engine | `analysis_tax_gap.md` | Oracle Fusion Tax / Vertex | ✅ 100% Tier-1 |
| 34 | Time & Labor | `analysis_time_labor_gap.md` | Oracle Fusion T&L | ✅ Tier-1 Certified |
| 35 | Transportation & Logistics | `analysis_transportation_logistics_gap.md` | Oracle OTM / TMS | ✅ 100% Tier-1 |
| 36 | Treasury | `analysis_treasury_gap.md` | Oracle Fusion Treasury | ✅ 100% Tier-1 |
| 37 | Warehouse Management | `analysis_wms_gap.md` | Oracle Fusion WMS / SAP EWM | ✅ 100% Feature Parity |
| 38 | Workforce Rewards | `analysis_workforce_rewards_gap.md` | Oracle Fusion Comp + Payroll | ✅ Tier-1 Certified |
| 39 | Recruiting | `analysis_recruiting_gap.md` | Oracle Recruiting Cloud | ✅ Feature Complete V1 |
| 40 | Project Accounting | `analysis_project_accounting_gap.md` | Oracle Fusion Project Acctg | ✅ Tier-1 Full Parity |
| 41 | Projects Costing | `analysis_projects_costing_gap.md` | Oracle Fusion Project Costing | ✅ 100% Remediated |

---

## Oracle Gap Analysis — Module-Wise Gap Count

> **Phase 2 Complete.** All 41 modules analyzed against Oracle Fusion ERP.
> **Severity:** 🔴 High = Missing or self-admitted critical feature | 🟡 Medium = Oracle depth gap | 🟢 Low = Minor depth / UX gap

| # | Module | Oracle Equivalent | 🔴 High | 🟡 Med | 🟢 Low | **Total** | Contradiction Flag |
|:---|:---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Accounts Payable | Oracle Fusion Payables | 4 | 11 | 3 | **18** | — |
| 2 | Accounts Receivable | Oracle Fusion Receivables | 4 | 13 | 2 | **19** | — |
| 3 | Billing & Revenue Innovation | Oracle Fusion Billing | 4 | 11 | 2 | **17** | — |
| 4 | Cash Management | Oracle Fusion Cash Mgmt | 4 | 9 | 2 | **15** | — |
| 5 | Construction Management | Oracle ECC / Aconex / Primavera | 4 | 6 | 2 | **12** | — |
| 6 | Core HR | Oracle Fusion Global HR | 5 | 8 | 2 | **15** | — |
| 7 | Cost Management | Oracle Fusion Cost Mgmt | 4 | 7 | 2 | **13** | — |
| 8 | CRM | Oracle Fusion CX Cloud | 3 | 9 | 2 | **14** | — |
| 9 | EPM Planning | Oracle EPBCS / EPM Cloud | 6 | 7 | 2 | **15** | 🚨 Self-admitted PENDING gaps (ESG, Treasury Plan) |
| 10 | ESS / MSS | Oracle Fusion HCM Self-Service | 4 | 8 | 1 | **13** | — |
| 11 | Expense Management | Oracle Fusion Expenses | 2 | 8 | 1 | **11** | — |
| 12 | Fixed Assets | Oracle Fusion Assets | 3 | 6 | 2 | **11** | — |
| 13 | Financial Close | Oracle Fusion FCCS | 5 | 4 | 2 | **11** | 🚨 Consolidation logic 60% mocked (self-admitted) |
| 14 | General Ledger | Oracle Fusion GL | 3 | 6 | 1 | **10** | — |
| 15 | HR Analytics | Oracle HCM Analytics / OTBI | 4 | 6 | 2 | **12** | — |
| 16 | HR Compliance | Oracle HCM Compliance | 3 | 9 | 1 | **13** | — |
| 17 | Intercompany Accounting | Oracle AGIS | 4 | 7 | 1 | **12** | — |
| 18 | Inventory Management | Oracle Fusion Inventory | 4 | 8 | 1 | **13** | — |
| 19 | Landed Cost Management | Oracle Fusion LCM | 4 | 6 | 1 | **11** | — |
| 20 | Lease & Contract Mgmt | Oracle Fusion Lease Accounting | 4 | 7 | 1 | **12** | — |
| 21 | Learning (LMS) | Oracle Fusion Learning Cloud | 3 | 8 | 1 | **12** | — |
| 22 | Maintenance (EAM) | Oracle Fusion EAM / Maximo | 4 | 8 | 1 | **13** | — |
| 23 | Manufacturing | Oracle Fusion MFG / OPM | 4 | 8 | 1 | **13** | — |
| 24 | Manufacturing Costing | Oracle Fusion Mfg Costing | 3 | 7 | 1 | **11** | — |
| 25 | Master Data Management | Oracle Fusion MDM / TCA / PIM | 4 | 7 | 1 | **12** | — |
| 26 | Planning, Budgeting & Forecasting | Oracle EPBCS | 3 | 9 | 2 | **14** | — |
| 27 | Project Portfolio Mgmt | Oracle Fusion PPM | 4 | 8 | 1 | **13** | 🚨 Original audit: API Level 2, UI Level 0 (contradicts 100% claim) |
| 28 | Procurement & SCM | Oracle Fusion Procurement | 4 | 7 | 1 | **12** | ⚠️ Self-scoped to "Tier-1 subset" only |
| 29 | Revenue Management | Oracle Fusion RMCS / ASC 606 | 4 | 8 | 1 | **13** | 🚨 Original history: 5 of 13 sub-modules = UI shells |
| 30 | Subledger Accounting | Oracle Fusion SLA / XLA | 4 | 4 | 2 | **10** | — |
| 31 | Supplier Portal & PCM | Oracle iSupplier / Supplier Portal | 2 | 7 | 2 | **11** | — |
| 32 | Talent Management | Oracle Fusion HCM Talent | 4 | 6 | 2 | **12** | 🚨 Original audit: all sub-domains = UI shells with 404 API errors |
| 33 | Tax Engine | Oracle Fusion Tax / Vertex | 3 | 6 | 2 | **11** | — |
| 34 | Time & Labor | Oracle Fusion T&L / WFM | 3 | 5 | 2 | **10** | ⚠️ Self-admitted: no deep rule engine, basic OT logic only |
| 35 | Transportation & Logistics | Oracle OTM / TMS | 3 | 7 | 1 | **11** | 🚨 Audit: Route Planning, Freight Settlement, Carrier Portal = placeholders |
| 36 | Treasury & Cash Management | Oracle Fusion Treasury | 4 | 6 | 2 | **12** | 🚨 Forensic section: Debt / Investments / AI = Critical / Missing |
| 37 | Warehouse Management (WMS) | Oracle Fusion WMS Cloud | 3 | 7 | 2 | **12** | ⚠️ L7 / L8 / L11 self-admitted MISSING in pre-Phase 29 audit |
| 38 | Workforce Rewards | Oracle Fusion Global Payroll | 4 | 6 | 2 | **12** | ⚠️ Scoped "Level-1 only"; Payslip PDF listed as future Next Step |
| 39 | Recruiting / Talent Acquisition | Oracle Fusion Recruiting Cloud | 3 | 7 | 2 | **12** | — |
| 40 | Project Accounting | Oracle Fusion Project Accounting | 3 | 5 | 2 | **10** | — |
| 41 | Projects Costing (Additional) | Oracle Fusion Project Costing | 3 | 5 | 3 | **11** | — |
| | **GRAND TOTAL** | | **🔴 152** | **🟡 297** | **🟢 66** | **515** | 7 × 🚨  5 × ⚠️ |

### Flag Legend

| Flag | Meaning |
|:---|:---|
| 🚨 | Same document contains a forensic / prior-audit section explicitly contradicting the final "100% complete" claim |
| ⚠️ | Module analysis explicitly limits its own scope or self-admits partial implementation |
| — | No internal contradiction detected; gaps are Oracle depth features beyond NexusAI's stated scope |

### Top 10 Cross-Module High-Priority Gaps

| # | Gap Area | Modules Affected | Severity |
|:---|:---|:---|:---:|
| 1 | Multi-Country Payroll & Legislative Data Groups (UK / EU / APAC) | M38, M6, M34 | 🔴 |
| 2 | e-Invoicing Mandate Compliance (ZATCA / ViDA / CFDI / FatturaPA) | M33, M3, M11 | 🔴 |
| 3 | EEO-1 / Diversity Compliance Reporting (EEOC mandatory) | M39, M16, M32 | 🔴 |
| 4 | OFAC / EU / UN Sanctions Screening on Payments | M36, M1, M4 | 🔴 |
| 5 | IFRS 9 Hedge Effectiveness Testing (Prospective + Retrospective) | M36, M29 | 🔴 |
| 6 | Bank Statement Auto-Import (BAI2 / SWIFT MT940 daily feed) | M36, M4 | 🔴 |
| 7 | Project Revenue Recognition (% Complete / Milestone via SLA) | M40, M41, M27 | 🔴 |
| 8 | ESG / Carbon Planning Scope 1/2/3 (self-admitted PENDING) | M9 | 🔴 |
| 9 | Financial Consolidation Completeness — iXBRL + IC Invoice-Match (60% mocked) | M13 | 🔴 |
| 10 | Commitment Tracking (Open PO + Open AP Invoices vs Budget) | M41, M28, M40 | 🔴 |

---

*Phase 2 Complete — Oracle Gap Analysis populated across all 41 modules.*
*Total gaps identified: **515** (🔴 152 High · 🟡 297 Medium · 🟢 66 Low)*
*Analysis Date: 2026-02-20*
