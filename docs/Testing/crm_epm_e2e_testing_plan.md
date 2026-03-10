# CRM & EPM (Modules 27-34) E2E Test Scripts & Scenarios

## Overview
This document outlines the detailed UI testing scenarios, scripts, and E2E process flows for the CRM (Customer Relationship Management) and EPM (Enterprise Performance Management) suites. Testing will be performed strictly via the browser UI, validating that:
1. **Core Navigation:** No direct URL access. All workflows must be reachable via the global sidebar/navigation menus.
2. **Enterprise Scoping (Context Isolation):** All data and actions must respect the active Business Unit/Ledger selected in the global context switcher (`entBusinessUnitId`).
3. **State Preservation:** Page refreshes must retain the context selection and active tab states.
4. **Functional Correctness:** Every component, button, and table listed in the parity audit must mount without React crashes.

---

## 🏗 Context & Scoping Scenarios (Pre-requisites)

### SCOPE-01: Global Context Switcher Functionality
**Objective:** Verify the user can switch Business Units and have the UI react accordingly.
- **Action:** Open application, find the Context Switcher in the top navigation bar.
- **Action:** Switch to "Operations BU".
- **Expected:** The underlying application state re-renders (if displaying CRM or EPM data) to reflect only data owned by "Operations BU".

### SCOPE-02: Strict Data Isolation Validation
**Objective:** Verify that a user cannot see cross-BU data.
- **Action:** Navigate to CRM -> Opportunities (or Accounts).
- **Action:** Assert the total number of records under BU A.
- **Action:** Switch Context to BU B.
- **Expected:** The list of Opportunities/Accounts should instantly update. BU A data must not bleed into BU B's view. E2E Validation of the `useEnterpriseStore` implementation.

### SCOPE-03: State Preservation on Hard Refresh
**Objective:** Ensure Context is durable.
- **Action:** Select "European Region BU" in the context switcher.
- **Action:** Navigate deep into `CRM -> Service -> Cases`.
- **Action:** Trigger a hard browser refresh (F5).
- **Expected:** The application reloads onto the Cases page. The Context Switcher still displays "European Region BU", and the data remains scoped correctly.

---

## 📈 CRM Marketing, Sales, and CPQ (Modules 27, 28, 29)

### E2E-01: Lead-to-Quote Automation Flow
**Objective:** Test the funnel from Marketing Campaign, to Lead, to Opportunity, and finally to a Quote.

1. **Marketing Automation & Segmentation:**
   - Navigate to `CRM -> Marketing -> Campaigns`.
   - Validate `CampaignFlowBuilder.tsx` and `EmailTemplateBuilder.tsx` mount correctly.
   - Navigate to `Segment Builder`. Verify dynamic cohorts can be constructed.
2. **Lead Routing & Conversion:**
   - Navigate to `CRM -> Sales -> Leads`.
   - Access `PredictiveLeadScoring.tsx` to view AI scoring metrics.
   - Convert a High-Scoring Lead to an Opportunity.
3. **Opportunity Management:**
   - Navigate to `CRM -> Sales -> Opportunities`.
   - Open an Opportunity detail (`OpportunitiesDetail.tsx`).
   - Validate the `SalesPlaybookWidget` triggers specific stage tasks.
   - Attach a product and check `Revenue Items` splitting.
   - Update Win/Loss Reason via the dialog.
4. **CPQ & Guided Selling:**
   - Navigate to `CRM -> CPQ -> Guided Selling`.
   - Run through the questionnaire to generate a product configuration.
   - Generate a Quote (`QuoteBuilder.tsx`).
   - Push the Quote to the `DealDesk` for margin approval (`QuoteApprovalWorkflow.tsx`).
   - Validate the `ContractLifecycleManagement.tsx` component handles the boilerplate MSA generation.

---

## 🛠 CRM Service Cloud & Field Service (Modules 30, 31)

### E2E-02: Issue-to-Resolution & Dispatch Flow
**Objective:** Test customer support case ingestion, omnichannel routing, SLA enforcement, and field technician dispatch.

1. **Case Ingestion & Routing:**
   - Navigate to `CRM -> Service -> Email-to-Case`. Verify routing rules UI.
   - Navigate to `Omnichannel Routing`. Check queue capacity metrics.
   - Access `Case Management` and open a case (`CasesDetail.tsx`).
2. **SLA & Entitlements:**
   - Validate the SLA Milestones timer is actively counting down based on `ServiceEntitlements.tsx`.
   - Use `AgentScriptBuilder` to follow a troubleshooting workflow.
3. **Field Service Dispatch:**
   - Ascalate the Case to a Work Order (`WorkOrdersDashboard.tsx`).
   - Navigate to `Field Service -> Dispatch Console`. Verify the Gantt chart maps the Work Order.
   - Access `TechnicianSkillsZones.tsx` to verify skills and territory matching for the dispatched technician.
   - Simulate a mobile device resolution via `MobileTechnicianApp.tsx` (Signatures and checklist completion).
   - Check `PartsReplenishment.tsx` to ensure used van stock triggers a re-order alert.

---

## 💰 Incentive Compensation (Module 32)

### E2E-03: Sales Commission & Gamification Flow
**Objective:** Verify sales compensation plans, accelerator tiers, disputes, and clawbacks track accurately.

1. **Compensation Setup:**
   - Navigate to `CRM -> Sales -> Commission Plans`. Validate multi-tier accelerator thresholds.
   - Check `PlanAgreementSignOffs.tsx` for digital signature routing.
2. **Attainment & Gamification:**
   - Navigate to `Sales Leaderboard`. Validate ranking calculations and YTD earnings visibility.
3. **Exceptions:**
   - Access `CommissionDisputes.tsx` to view a rep-submitted inquiry.
   - Access `ClawbackRules.tsx` to verify logic for retracted commissions on canceled orders.

---

## 📊 Enterprise Performance Management - EPM (Modules 33, 34)

### E2E-04: Strategic Budgeting & ESG Disclosure Flow
**Objective:** Validate EPM financial modeling, budgeting workflows, and sustainability tracking capabilities.

1. **Macro Modeling & Budget Entry:**
   - Navigate to `EPM -> Strategic Modeling`. Verify long-range multi-year horizons.
   - Access `CapEx Planning` to view capital expenditure depreciation grids.
   - Open `BudgetPlanning.tsx` and engage with the `InteractiveSpreadsheet` grid for line-item budget entry.
2. **Reconciliation & Approval:**
   - Navigate to `Budget Reconciliation` and `Budget Variance` analysis tools.
   - Push a budget through the `BudgetWorkflow.tsx` Maker/Checker approval process.
3. **ESG & Sustainability (Module 34):**
   - Navigate to `EPM -> ESG Reporting`. Verify Scope 1, 2, and 3 emissions factors library.
   - Check `Supplier Emission Surveys` tracking grid for upstream data collection.
   - Finally, view the `Sustainability Public Dashboard` to ensure aggregated metrics successfully fetch from `/api/public/sustainability-metrics`.

---

## Rules of Engagement for Execution
1. **Absolutely No Playwright/Puppeteer Scripts:** Use internal browser sub-agents to physically click UI elements.
2. **Fix Missing Navigation Immediately:** If an E2E step specifies navigating to "Omnichannel Routing" and the sidebar link is missing, STOP testing. Fix `CrmSidebar.tsx` / `CrmRoutes.tsx`, verify the link appears, and *then* click it.
3. **No Database Seeding Scripts:** We rely purely on the UI for creation, or existing mocked states rendered by the components. If data is completely empty causing a crash, fix the component's null-handling (or mock the initial payload from the API layer natively).
4. **Log Blockers:** Any React standard error, 500 API failure, or endless loading spinner constitutes a blocker to be fixed immediately within the testing phase.
