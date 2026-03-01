# GL Module – Oracle EBS Parity Analysis

## Legend
- ✅ EXISTS – Feature is implemented and functional
- 🟡 PARTIAL – UI exists or backend stub exists, needs completion  
- ❌ MISSING – Not implemented at all

---

## 1. JOURNALS

### 1.1 Enter Journals / Journal Entry
| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| New Journal (batch header) | ✅ | ✅ JournalEntry.tsx | - |
| Multi-line journal grid | ✅ | ✅ JournalEntry.tsx | - |
| Account picker (CCID) | ✅ | ✅ CodeCombinationPicker | - |
| Save as Draft | ✅ | ✅ | - |
| Submit for Approval | ✅ | ✅ JournalEntry.tsx | - |
| Real-time debit/credit balance check | ✅ | ✅ | - |
| Currency per journal | ✅ | ✅ currencyCode field | - |
| Period selector (from open periods) | ✅ | ✅ Wired to API | - |
| Journal Source & Category selectors | ✅ | 🟡 Plain text input | Load from config API |
| Batch Name separate from Description | ✅ | ✅ Batch Name field | - |
| Journal reversal setup (period, date) | ✅ | ✅ UI form fields added | - |
| Journal reversal execution | ✅ | ❌ | Add POST /api/gl/journals/:id/reverse |
| Reference number | ✅ | ❌ | Add to schema + form |
| Line-level DFF attributes (10 fields) | ✅ | ✅ Present in schema and UI | - |
| Attachments per journal | ✅ | 🟡 Placeholder "No attachments" | Not built |
| Posting from Journal Entry screen | ✅ | ✅ Async queue (BullMQ) | API + Worker built |
| Audit history sidebar | ✅ | ✅ AuditSidebar component | - |

### 1.2 Journal List / View Journals
| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Journal list with status filter | ✅ | 🟡 JournalEntries.tsx page exists | Check if using real API |
| Filter by Period, Source, Category | ✅ | ❌ | Add filter controls |
| Search by journal number | ✅ | ❌ | Add search |
| Batch-level view | ✅ | ❌ | Not built |
| Ledger-scoped list | ✅ | 🟡 API accepts ledgerId param | Frontend not passing ledgerId |

### 1.3 Journal Import
| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Import from subledger (GL Interface) | ✅ | ✅ SLA Transfer APIs | POST /api/gl/sla/transfer built |
| Import error correction | ✅ | 🟡 Placeholder | Not fully built |

### 1.4 Journal Approval
| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Approval workbench (pending queue) | ✅ | ✅ JournalApprovalHub.tsx | Check real API |
| Approve / Reject actions | ✅ | 🟡 UI exists | POST /api/gl/journals/:id/approve missing |
| Approval routing rules | ✅ | ✅ glApprovalRules schema | Missing frontend manager |
| Delegation rules | ✅ | ✅ glApprovalDelegations schema | Missing UI |

---

## 2. TRIAL BALANCE & INQUIRY

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Trial Balance by period | ✅ | ✅ TrialBalance.tsx | - |
| Paginated CCID view | ✅ | ✅ | - |
| Drill down to journal lines | ✅ | ✅ Sheet side panel | - |
| AI Variance Commentary | N/A | ✅ NexusAI-specific | - |
| Export to CSV/PDF | ✅ | 🟡 Buttons exist, no impl | Wire export endpoint |
| Filter by account type | ✅ | ❌ | Add filter |
| Multi-period comparison | ✅ | 🟡 MultiPeriodQuery.tsx | Check impl |
| Ledger selector on Trial Balance | ✅ | ✅ useLedger() dynamic | - |
| T-Account view (Account Analysis) | ✅ | ✅ AccountAnalysisReport.tsx | Check impl |

---

## 3. PERIOD CLOSE

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Period status dashboard | ✅ | ✅ CloseDashboard.tsx | - |
| Open / Close period per Ledger | ✅ | 🟡 Backend stub | Add PATCH /api/gl/periods/:id/close |
| Close task checklist | ✅ | ✅ glCloseTasks schema + API | - |
| Unposted journals warning / sweep | ✅ | ✅ `CloseEngine` + BullMQ | `sweepEvents` to Next Open |
| Subledger period status integration | ✅ | 🟡 SLA engine built | Need cross-module checks |
| Financial Close Center (dashboard) | ✅ | ✅ FinancialCloseCenter.tsx | - |

---

## 4. REPORTING

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| FSG Report Builder (Row + Column Sets) | ✅ | ✅ FSGBuilder + Schema + Seeded | Enterprise P&L/BS templates seeded |
| Run FSG report | ✅ | 🟡 FinancialReports.tsx | Check API |
| Variance Analysis | ✅ | ✅ VarianceAnalysis.tsx | - |
| Advanced FSG Designer | ✅ | ✅ AdvancedFSGDesigner.tsx | - |
| Account Analysis Report | ✅ | ✅ AccountAnalysisReport.tsx | - |
| Multi-period query | ✅ | ✅ MultiPeriodQuery.tsx | - |

---

## 5. REVALUATION

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Run Revaluation wizard | ✅ | ✅ Revaluation.tsx | - |
| Ledger selector | ✅ | ✅ Dynamic from API | - |
| Period selector | ✅ | ✅ From open periods | - |
| Currency selector | ✅ | ✅ Loaded from DB | - |
| Rate type selector | ✅ | ✅ Spot/Corporate/User | - |
| Unrealized G/L account picker | ✅ | ✅ CodeCombinationPicker | - |
| Revaluation history | ✅ | ✅ Table display | GET /api/gl/revaluations route needed |
| Revaluation journal auto-created | ✅ | ✅ Engine impl | - |

---

## 6. TRANSLATION (FASB 52)

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Translation engine (FASB 52) | ✅ | ✅ glTranslationEngine.ts | Uses mock FX rates |
| Translation UI (run wizard) | ✅ | ✅ FxTranslationDashboard.tsx | Check if wired to engine |
| Translation rules config | ✅ | ✅ TranslationRules.tsx | - |
| CTA account setup | ✅ | ✅ In engine | Expose in UI |
| Real FX rates (not mock) | ✅ | ❌ | Wire glDailyRates table |
| Translation history | ✅ | ❌ | Add tracking table |

---

## 7. CONSOLIDATION

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Consolidation workbench | ✅ | ✅ ConsolidationWorkbench.tsx | - |
| Ledger Set manager | ✅ | ✅ LedgerSetManager.tsx | - |
| Elimination rules builder | ✅ | ✅ EliminationRuleBuilder.tsx | - |
| Elimination rule list | ✅ | ✅ EliminationRules.tsx | - |
| Elimination journal review | ✅ | ✅ EliminationJournalReview.tsx | - |
| Consolidation results viewer | ✅ | ✅ ConsolidationResultsViewer.tsx | - |
| Run consolidation | ✅ | ✅ DB & API impl | - |
| Variance analysis | ✅ | ✅ Real API data | - |
| History (mock data) | ✅ | ✅ De-mocked | - |

---

## 8. MASS ALLOCATIONS

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Allocation rules (full formula) | ✅ | ✅ glAllocations schema | - |
| Run allocation | ✅ | ✅ POST /api/gl/allocations/run | - |
| Allocation list UI | ✅ | 🟡 AllocationsWorkbench.tsx (Intercompany) | GL-specific UI needed |
| Transfer rule builder | ✅ | ✅ TransferRuleBuilder.tsx | - |

---

## 9. BUDGETING

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Budget entry workbench | ✅ | ✅ BudgetManager.tsx | - |
| Budget control rules | ✅ | ✅ glBudgetControlRules schema + API | - |
| Budget balance view | ✅ | ✅ GET /api/gl/budget-balances | - |
| Budget drill-down (EPM) | ✅ | ✅ BudgetBalanceDrillDown.tsx | - |
| Variance analysis (EPM) | ✅ | ✅ VarianceAnalysisWorkbench.tsx | - |
| Budget workflows | ✅ | ✅ BudgetWorkflow.tsx | - |
| Upload budget spreadsheet | ✅ | ✅ BudgetManager.tsx | - |
| Scenario comparison (EPM) | ✅ | ✅ ScenarioComparison.tsx | - |

---

## 10. CHART OF ACCOUNTS / SEGMENTS

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| COA Structure setup | ✅ | ✅ CoaStructureSetup.tsx | - |
| Segment Value Sets | ✅ | ✅ ValueSetManager.tsx | - |
| Hierarchy Manager | ✅ | ✅ HierarchyManager.tsx | - |
| Code Combination (CCID) picker | ✅ | ✅ CodeCombinationPicker | - |
| Dynamic insertion of CCIDs | ✅ | ✅ getOrCreateCodeCombination | - |
| Cross-Validation Rules | ✅ | ✅ CVRManager.tsx + glCvrEngine | - |

---

## 11. CONFIGURATION / SETUP

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Ledger setup (full form) | ✅ | ✅ LedgerSetup.tsx | - |
| Ledger Set | ✅ | ✅ LedgerSetSetup.tsx | - |
| Legal Entity setup | ✅ | ✅ LegalEntitySetup.tsx | - |
| Calendar/Periods setup | ✅ | ✅ CalendarSetup.tsx | - |
| Journal Sources | ✅ | ✅ SourceCategorySetup.tsx + API | - |
| Journal Categories | ✅ | ✅ SourceCategorySetup.tsx + API | - |
| Ledger Controls | ✅ | ✅ LedgerControlSetup.tsx + API | - |
| Auto-Post rules | ✅ | 🟡 API exists, no UI | Build PostingRulesManager UI |
| SLA / Accounting Hub | ✅ | ✅ AccountingHubWorkbench.tsx | - |
| Data Access Sets | ✅ | ✅ DataAccessManager.tsx | - |
| Intercompany Rules | ✅ | ✅ IntercompanyRules.tsx | - |
| Validation Controls | ✅ | ✅ ValidationControls.tsx | - |
| Translation Rules | ✅ | ✅ TranslationRules.tsx | - |
| Configuration Hub | ✅ | ✅ ConfigurationHub.tsx | - |
| Posting Rules Manager | ✅ | ✅ PostingRulesManager.tsx | - |

---

## 12. AUDIT & SECURITY

| Feature | Oracle | NexusAI | Gap |
|---|---|---|---|
| Immutable audit log | ✅ | ✅ glAuditLogs schema + auditLogger | - |
| Audit log UI | ✅ | ✅ AuditLogs.tsx | - |
| Data Access Sets security | ✅ | ✅ glDataAccessSets schema | - |
| Journal approval delegation | ✅ | ✅ glApprovalDelegations schema | - |

---

## 13. UI/UX COMPARISON (Oracle vs. NexusAI)

| Area | Oracle EBS | NexusAI | Assessment |
|---|---|---|---|
| Overall look | Forms-heavy, table-centric | Cards + dark mode, modern | ✅ NexusAI is superior |
| Navigation | Tab-based menu bar | Sidebar nav with icons | ✅ Modern |
| Journal entry form | Fixed grid, mandatory fields | Multi-line grid + sheet | ✅ On par |
| Account picker | LOV popup | Inline picker component | ✅ Modern |
| Period selector | Dropdown LOV | Text input (not wired) | ❌ Needs dropdown from API |
| Context switching | Responsibility/LE profile | LedgerContext dropdown | 🟡 Exists but not prominent in all pages |
| Drill-down | Multiple window navigation | Side sheet panel | ✅ Better UX |
| AI features | None | ✅ AI commentary, NexusAI chat | ✅ NexusAI-unique differentiator |
| Mobile support | None | ✅ Responsive | ✅ Better |

---

## Summary of Gaps to Build

### High Priority
1. [x] Wire `useLedger()` across TrialBalance, CloseDashboard, BudgetManager, ConsolidationWorkbench
2. [x] Add missing routes: `GET /api/gl/ledgers`, `GET /api/gl/periods`, `GET /api/gl/revaluations`, `POST /api/gl/journals/:id/post`, `POST /api/gl/journals/:id/reverse`, journal approval routes
3. [x] Replace mock data in consolidation variance + history routes
4. [x] Wire period selector to real `/api/gl/periods` API
5. [x] Add `legalEntityId` and `accountingMethod` to ledger schema

### Medium Priority
6. [x] Journal batch name field + reversal UI fields
7. [x] Currency dropdown from real currency table (not hardcoded)
8. [x] Budget spreadsheet upload
9. [x] Consolidation run endpoint

### Low Priority
10. [x] Line-level DFF attributes (10 fields)
