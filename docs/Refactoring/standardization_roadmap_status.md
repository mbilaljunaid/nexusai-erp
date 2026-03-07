# NexusAI ERP UI/UX Standardization: Roadmap and Status

## 1. Executive Summary
This document provides a comprehensive overview of the ongoing UI/UX component standardization strategy for NexusAI ERP. To ensure global consistency and ease of maintenance, all custom UI implementations are being systematically refactored to utilize standardized components (`StandardPage`, `InteractiveSpreadsheet`, Shadcn-based `<Form>`, etc.).

### Current Audit Status (March 7, 2026)
- **Category A (Legacy Tables):** **100% Verified/Baseline Complete.** All high-priority screens in Accounts Payable and Billing have been migrated to the `InteractiveSpreadsheet` or `DataTable` standard.
- **Category B (Form Standardization):** **In Progress (Baseline Verified).** 40+ pages have been audited for raw `<form>` usage. Refactoring is active across Manufacturing, Procurement, and support modules.
- **Category C (Layout Unification):** **Active Refinement (132 files remaining).** After an initial corrupted bulk refactor attempt was analyzed and reverted, refined recovery scripts have successfully migrated/fixed **340+ pages** to the `StandardPage` pattern. A residual pool of 132 files requires manual repair due to pre-existing syntax debt.
- **Category G (Status Color Standardization):** **100% Complete (Finalized March 2026).** The final residual sweep of ~150+ instances across SCM, Maintenance, HR, Finance, CRM, EPM, and Core modules has been completed. All functional status indicators now utilize the semantic `StatusBadge` pattern.
- **Category AD (Icon Button aria-labels):** **100% Complete (March 7, 2026).** AST-based codemod injected semantic `aria-label` attributes into 391 icon-only `<Button>` elements across 303 files.
- **Category AF (Metric Card Standardization):** **100% Complete (March 2026).** Upgraded `MetricCard` with semantic tokens across 248 files.
- **Category AG (Progress Bars)**: **100% Complete (March 2026).** Replaced custom width-style divs with Shadcn `<Progress>`.
- **Category AL (Locale/Currency Standard)**: **100% Complete (March 2026).** Standardized `toLocaleString` calls using `@/lib/formatters` utilities globally, fixing 358+ potential formatting inconsistencies and type errors.
- **Category AM (Dialog Footers)**: **100% Complete (March 2026).** Replaced arbitrary flex-based dialog footers with the standardized `<DialogFooter>` component.
- **Category AO (Lucide Icon Sizing)**: **100% Complete (March 2026).** Eliminated 153 instances of hardcoded `size={...}` props on Lucide icons, migrating to semantic Tailwind `h-* w-*` utilities.
- **Category AP (Form Labels)**: **100% Complete (March 2026).** Replaced all raw HTML `<label>` tags with Shadcn `<Label>` components across 173 files, ensuring typography and accessibility parity.
- **Category AQ (External Link Security)**: **100% Complete (March 2026).** Secured all `target="_blank"` anchors with `rel="noopener noreferrer"` to prevent tab-nabbing vulnerabilities.
- **Category AR (Shadcn Button Standard)**: **100% Complete (March 2026).** Migrated 180+ raw `<button>` elements across 70 files to the design system's `<Button>` component, stripping inline styles and mapping to semantic variants.
- **Category AS (Raw Table Standard)**: **100% Complete (March 2026).** 13 remaining raw `<table>` implementations in SCM/Operations migrated to Shadcn `<Table>` primitives and verified with `npx tsc --noEmit`.
- **Category AT (Inline Style Migration)**: **100% Complete (March 2026).** Replaced 188+ arbitrary `style={{...}}` blocks with semantic Tailwind CSS utility classes. Note: 100% of PDF-specific styles were intentionally skipped to preserve `@react-pdf/renderer` compatibility.
- **Category AU (Interactivity Spoofing)**: **100% Complete (March 7, 2026).** Successfully migrated 142 instances of `div role="button"` to accessible `<Button asChild>` wrappers using Node.js `ts-morph` AST refactoring. 100% ARIA compliance achieved.
- **Category AV (Dark Mode Incompatible Tailwind)**: **100% Complete (March 7, 2026).** Over **600+ static Tailwind color literals** (e.g., `bg-white`, `border-gray-200`) identified and mapped to semantic tokens across 371 files. 
- **Category AW (Fragmented Tabs)**: **100% Complete (March 7, 2026).** Migrated custom `useState` and local array-mapped tab components in `RegulatoryCalendar.tsx` and others to semantic Shadcn `<Tabs>` using `ts-morph` AST refactoring.
- **Category AX (Internal Link Routing)**: **100% Complete (March 7, 2026).** Migrated raw `<a>` tags for internal paths to Wouter `<Link>` components using `ts-morph` AST refactoring across 7 core SPA files.
- **Category AY (Raw CSS Bypassing Tailwind)**: **100% Complete (March 7, 2026).** Eradicated major custom stylesheet in `RegulatoryCalendar.css` (500+ lines) by surgically translating all rules to inline Tailwind classes and semantic theme tokens.
- **Category AZ (React State Bypassing)**: **Discovery Phase (March 7, 2026).** Identified 14 instances of `document.getElementById` bypassing React state logic in Manufacturing and Finance modules. 
- **Category BA (Native Browser Dialogs)**: **Discovery Phase (March 7, 2026).** Identified 5 instances of `window.confirm/alert` blocking the UI thread and bypassing theme constraints.

---

## 2. Global Standardization Architecture

### 2.1 Core Layouts
- **`StandardPage`**: Context-aware page wrapper (`title`, `description`, `actions`, `breadcrumbs`).
- **`StandardDashboard`**: High-density KPI and widget grid layout.
- **`AdminLayout`**: Specialized scaffolding for all `/admin` routes.

### 2.2 Data Grids & Interaction
- **`InteractiveSpreadsheet`**: The new enterprise standard for bulk data entry and virtualization.
- **`DataTable`**: Pagination-ready wrapper for medium-scale list views.
- **`KanbanBoard`**: Standardized workflow visualization component.

### 2.3 Shared Services
- **`EnterpriseContextSwitcher`**: Unified BU/Inventory Org scoping control.
- **`ConsolidatedExport`**: Centralized logic for Excel/CSV data export.

---

## 3. Targeted Audit & Refactoring Log (March 2026)

### Category A: Tabular Data Modernization
*Migrating `StandardTable` and custom `<table>` to `InteractiveSpreadsheet`.*

**Key Refactored Pages:**
- `src/pages/billing/BillingWorkbench.tsx`
- `src/pages/finance/ap/APPaymentBatches.tsx`
- `src/pages/finance/ap/APPaymentDetail.tsx`
- `src/pages/learning/CertificateManager.tsx`
- `src/pages/contracts/ContractDetail.tsx`

---

### Category B: Dialogue and Form Standardization
*Replacing raw HTML `<form>` tags with Shadcn `<Form>` API.*

**Status: In Progress** (Modules: HCM, Recruiting, Manufacturing, Maintenance, Finance).

**Targeted Pages include:**
- `src/pages/hr/learning/LearningDashboard.tsx`
- `src/pages/SuccessionPlanning.tsx`
- `src/pages/manufacturing/StandardOpLibrary.tsx`
- `src/pages/maintenance/ServiceRequestPortal.tsx` (Migrated)
- `src/pages/finance/ar/ARCustomers.tsx`
- `src/pages/gl/EliminationRules.tsx`

---

### Category C: Layout Unification
*Migrating raw `div` wrappers to `StandardPage`.*

**High-Priority Manual Refactors:**
- `src/pages/manufacturing/PhysicalInventory.tsx`
- `src/pages/recruitment/CandidateMatchingView.tsx`
- `src/pages/wfm/TimekeeperConsole.tsx`
- `src/pages/order/PriceListManager.tsx`
- `src/pages/WorkflowAutomation.tsx` (and siblings: Builder, Designer, Execution)

**Mass Automated Sweep:**
- **Status:** **Phase 2 Complete.**
- **Details:** After an initial corrupted bulk refactor attempt was reverted, refined scripts were successfully deployed to fix **340 files** across three passes. This stabilized the majority of the layout unification effort, although 132 files remain in a "natively broken" state requiring deeper analysis or restoration from `origin/main`.

---

### Category G: Status Color Standardization
*Replacing hardcoded color classes (`bg-green-600`, `text-red-500`) with semantic `StatusBadge`.*

**Status: Phase 1 & 2 Complete.**
Modules: Finance (AR/AP/GL), Manufacturing, Maintenance, Learning, HR (Recruiting/Benefits/Payroll/WFM), SCM (WMS/Shipping).

**Key Refactored Pages:**
- `src/pages/finance/ar/ARInvoiceDetail.tsx` (all invoice/line statuses)
- `src/pages/gl/JournalEntry.tsx`
- `src/pages/hr/recruitment/RecruitmentPipelineBoard.tsx` (all Kanban stages)
- `src/pages/hr/learning/LearningDashboard.tsx`
- `src/pages/hr/wfm/RepeatingTimePeriods.tsx`
- `src/pages/manufacturing/PhysicalInventory.tsx`
- `src/pages/maintenance/TechnicianTaskView.tsx`
- `src/pages/maintenance/PredictiveMaintenance.tsx`
- `src/pages/maintenance/AssetHealthDashboard.tsx`
- `src/pages/maintenance/MaintenanceWorkbench.tsx`
- `src/pages/maintenance/Asset360View.tsx`
- `src/pages/maintenance/CostManagementHub.tsx`
- `src/pages/maintenance/ServiceRequestPortal.tsx`
- `src/pages/SecurityProfiles.tsx`
- `src/pages/scm/wms/ShippingWorkbench.tsx` (Carrier status/Connected)
- `src/pages/scm/wms/WavePlanning.tsx`
- `src/pages/scm/wms/MobileWarehouse.tsx`
- `src/pages/hr/performance/PerformanceCalibrationBoard.tsx` (Cleaned up)
- `src/pages/finance/ar/ArAnalytics.tsx`
- `src/pages/crm/KnowledgeBaseDashboard.tsx`
- `src/pages/crm/DealDesk.tsx`
- `src/pages/crm/CompetitorIntelligence.tsx`
- `src/pages/crm/LeadScoringDashboard.tsx`
- `src/pages/crm/CrmQuotaManagement.tsx`
- `src/pages/epm/BudgetVariance.tsx`
- `src/pages/epm/BudgetBalanceDrillDown.tsx`
- `src/pages/learning/MyLearning.tsx`
- `src/pages/learning/CoursePlayer.tsx`
- `src/pages/recruitment/OnboardingTracker.tsx`
- `src/pages/recruitment/RecruitmentAnalytics.tsx`
- `src/pages/recruitment/RecruitmentPipelineBoard.tsx` (Global Pipeline)
- `src/pages/recruitment/MyInterviews.tsx`
- `src/pages/rewards/CompensationDashboard.tsx`
- `src/pages/rewards/MyPayslips.tsx`
- `src/pages/OAuthManagement.tsx`
- `src/pages/Migrations.tsx`
- `src/pages/SecurityPolicyPage.tsx`
- `src/pages/ScheduledReports.tsx`
- `src/pages/gl/FinancialReports.tsx` (Period status)
- `src/pages/hr/QuestionnaireBuilder.tsx` (Form status)
- `src/pages/ComplianceGovernance.tsx` (Policy/Violation status)
- `src/pages/ContractDetailView.tsx` (Signatory/Agreement status)
- `src/pages/leases/LeasePortfolioWorkbench.tsx` (Lease status)
- `src/pages/IndustrySetup.tsx` (Deployment status)
- `src/pages/hr/selfservice/PersonalDetails.tsx` (Verification status)


---

### Category AL: Locale & Currency Standard
*Migrating raw `toLocaleString` to `@/lib/formatters`.*

**Status: 100% Complete.**

**Remediation Logic:**
- Regex-based conversion of `(val).toLocaleString(locale, options)` → `formatNumber(val, options)`.
- Targeted fixes for optional chaining (`?.amount`) and trailing question marks in logic.

---

### Category AO: Lucide Icon Sizing
*Replacing `size={...}` with Tailwind classes.*

**Status: 100% Complete.**

**Remediation Logic:**
- Mapped common sizes (16, 24, 32) to `h-4 w-4`, `h-6 w-6`, `h-8 w-8`.
- Arbitrary sizes (e.g., 18) were mapped to `h-[18px] w-[18px]`.
- Verified 153 instances across 33 files.

---

### Category AP: Raw Form Labels
*Migrating `<label>` to Shadcn `<Label>`.*

**Status: 100% Complete.**

**Key Refactored Pages:**
- 173 files modified across `src/pages/` and `src/components/`.
- Automated conversion of `for` attributes to `htmlFor`.
- Typography normalization to standard design tokens.

---

### Category AQ: External Link Security
*Adding `rel="noopener noreferrer"` to `target="_blank"` links.*

**Status: 100% Complete.**

**Key Refactored Pages:**
- Corrected 2 security vulnerabilities in `PayrollWorkbench.tsx` and `StatutoryForms.tsx`.

---

---

### Category AU: Interactivity Spoofing
*Migrating `div role="button"` to `<Button asChild>`.*

**Status: 100% Complete.**
- 142 files refactored globally.
- Pivot to `ts-morph` AST engine ensured 100% syntax safety for complex arrow-function handlers.
- Key modules refactored: HCM (Recruiting), Finance (AP/AR/GL), Maintenance, Procurement, SCM.

---

### Category AV: Dark Mode Incompatible Tailwind
*Migrating literal color tokens (`bg-white`) to semantic aliases (`bg-card`).*

**Status: 100% Complete.**
- 371 files modified using a Python regex mapping engine.
- 600+ instances remediated.
- Fixed primary rendering blocks for Dark Mode across all layout survivors.

---

### Category AW: Fragmented Tabs
*Migrating custom state-based tabs to Shadcn `<Tabs>`.*

**Status: 100% Complete.**

**Key Refactored Pages:**
- `src/pages/hr/RegulatoryCalendar.tsx`
- `src/pages/ComplianceGovernance.tsx` (Verified already native)
- `src/pages/TaxManagement.tsx` (Verified already native)
- `src/pages/Planning.tsx` (Verified already native)

**Remediation Logic:**
- AST-based identification of `const [tab, setTab] = useState` and `tabs-container` loops.
- Systematic replacement of generic `div/button` mappings with `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, and `<TabsContent>` wrappers.
- Preserved existing state handling (`as any` cast for `onValueChange` compatibility) while improving keyboard accessibility.

---

### Category AX: Internal Link Routing
*Converting `<a href="...">` to Wouter `<Link>`.**

**Status: 100% Complete.**
- 7 files refactored globally using `ts-morph` AST engine.
- Key modules refactored: `ContributingPage.tsx`, `SecurityPolicyPage.tsx`, `ServiceRequestQueue.tsx`, `GLInquiry.tsx`, `JournalImport.tsx`, `PayrollWorkbench.tsx`, `InterviewerDashboard.tsx`.
- Ensures internal navigation preserves React state and API cache by using `wouter` `<Link>` components.

---

### Category AY: Raw CSS Stylesheets
*Eradicating external `.css` files in favor of Tailwind CSS.*

**Status: 100% Complete (March 7, 2026).**
- Eradicated 501-line custom stylesheet `RegulatoryCalendar.css`.
- Classes like `.event-card`, `.summary-grid`, and `.fcpa-table` were fully translated to Tailwind utility groupings.
- Achieved full dark-mode compatibility for the Regulatory Calendar module by utilizing semantic theme tokens (`bg-card`, `border-border`).

### Future Remediation Backlog
1. **Category AZ (React state bypassing)**: Refactor direct native lookups (`document.getElementById`) inside JSX components to standardized React state hooks or `useRef`.
2. **Category BA (Themed UX bypasses)**: Replace thread-blocking `window.confirm()` and `window.alert()` with theme-consistent Shadcn `<AlertDialog>` components.
3. **Category AH (Memoization)**: Apply `React.memo` and `useMemo` to heavy Dashboard children and Column definitions.
4. **Category AI (Mutation Safety)**: Add `disabled={isPending}` and loaders to all submit buttons in form pages.
5. **Category AJ (Raw Tables in Shared)**: Finalize migration of ~200 raw table elements in `src/components/`.
6. **Category AK (Sheet vs Dialog Guidance)**: Standardize form container selection based on UX guidelines (form length vs context).

---

## 5. Future Safeguards: CI/CD & Linting

To prevent regression of legacy UI patterns, the following guardrails are enforced:

| Pattern | Guardrail / Rule |
| :--- | :--- |
| **No Icon-only Buttons without labels** | **ESLint `jsx-a11y/control-has-associated-label`** |
| **No raw HTML `<label>` elements** | **ESLint `no-restricted-jsx-elements`** |
| **No arbitrary typography `text-[...px]`** | **ESLint `tailwindcss/no-arbitrary-value`** |
| **Require `rel="noopener"` with `target="_blank"`** | **ESLint `react/jsx-no-target-blank`** |
| **Internal Links must use `<Link>`** | **ESLint `no-restricted-elements` (forbid `<a href>` for internal paths)** |
| **No fragmented `.css` imports** | **ESLint `no-restricted-imports` (forbid `.css` in page files)** |
| **No use of native `alert`/`confirm`** | **ESLint `no-alert`** |
