# NexusAI ERP - HCM Suite Final Phase Tests (Lines 1164 - 1304)
## End-to-End Process Flows & Multi-Tenant Scope Validation

This document provides the detailed use cases, test scripts, and test scenarios for the final integration and scoping validation of the NexusAI ERP HCM Suite, mapped directly to lines 1164-1304 of the master test plan.

---

## 1. Multi-Tenant Scope Validation Use Cases

### SCOPE-02: E2E Business Unit (BU) Data Isolation
**Objective:** Verify that users assigned exclusively to Business Unit A cannot view data belonging to Business Unit B within the same tenant. Note: the prompt specifically asked to verify this on AP Invoices, but we will also verify on HCM modules as per the test plan.
**Pre-conditions:** Assumes basic context switcher is available in the UI. We will use the Context Switcher to set Legal Entity / Business Unit.

**Test Script:**
1. Log in or navigate to the application dashboard (`/`).
2. Utilize the environment/context switcher (usually in the header or via `useEnterpriseStore`) to select a specific Business Unit (BU A).
3. Navigate to `Supply Chain & Procurement -> Procurement` or `Finance & Accounting -> Accounts Payable` to check AP Invoices for BU data isolation as requested.
4. Navigate to `/hr/recruitment` (Job Openings) and verify the list reflects the selected BU.
5. Navigate to `/hr/payroll/workbench` and verify employee lists are scoped.
6. Switch context to Business Unit B.
7. Repeat the navigation to `/finance/ap`, `/hr/recruitment`, and `/hr/payroll/workbench`. Verify the data list completely changes or is empty if BU B has no data.
8. Attempt to manually construct a URL to access a BU A record while in BU B context. Verify the system denies access or returns a 404/empty state.

### SCOPE-03: State Preservation (Context Persistence)
**Objective:** Verify that the selected enterprise scope (Tenant, BU, LE) persists seamlessly across browser reloads and tab navigations.

**Test Script:**
1. Navigate to `/hr/payroll`.
2. Observe the context banner/header to ensure a specific scope is selected.
3. Perform a Hard Refresh (F5 / Cmd+R) of the page.
4. Verify the page reloads without crashing and the same context is preserved in the UI.
5. Navigate via the sidebar to `/hr/recruitment`. Verify the context remains unchanged.
6. Open a new browser tab. Navigate to `/hr`. Verify the session state persists and the same context is active.

---

## 2. End-to-End HCM Process Flows

### E2E-01: Full Hire-to-Payroll Flow
**Test Scenario:** An HR Specialist hires a new employee and verifies the employee flows directly into the payroll calculation scope.

**Test Script:**
1. Navigate to `Talent Core -> New Hire Wizard` (`/hr/hire`).
2. Complete Step 1 (Personal Info), Step 2 (Work Relationship), Step 3 (Assignment), Step 4 (Compensation).
3. Submit the hire on Step 5 (Review).
4. Navigate to `Talent Core -> Person Management` (`/hr/employees`). Search for the newly hired employee to ensure they appear in the directory.
5. Navigate to `Talent Core -> DateTrack Manager` (`/hr/datetrack`). Verify an effective-dated assignment record was generated for the new hire date.
6. Navigate to `Payroll Admin -> Payroll Workbench` (`/hr/payroll`). Start a new payroll run simulation and verify the new employee is included in the base population.

### E2E-02: Recruit-to-Hire Flow
**Test Scenario:** A Recruiter routes a candidate through the pipeline to offer acceptance, triggering the boarding process and eventual hire.

**Test Script:**
1. Navigate to `Recruitment (ATS) -> Job Openings` (`/hr/recruitment`). Click "New Requisition" and submit a basic req.
2. Navigate to `Pipeline Board` (`/hr/recruitment/pipeline`). Add a mock candidate to the "Applied" stage and drag them to "Interview".
3. Navigate to `Interview Schedule` (`/hr/recruitment/interviews`). Schedule an interview for the candidate.
4. Navigate to `Offer Management` (`/hr/recruitment/offers`). Create an offer for the candidate.
5. Navigate to `Onboarding Tracker` (`/hr/recruitment/onboarding-tracker`). Verify the candidate appears in the pre-hire/onboarding state.
6. Navigate to `New Hire Wizard` (`/hr/hire`) and initiate the formal hire converting the candidate to an employee.

### E2E-03: Performance-to-Compensation Flow
**Test Scenario:** A Manager completes a performance review which automatically drives a recommended merit increase in the compensation module.

**Test Script:**
1. Navigate to `Talent Core -> Performance Reviews` (`/hr/performance`). Select an active cycle.
2. Navigate to `Calibration Board` (`/hr/performance/calibration`). Provide a mock rating (e.g., "Exceeds Expectations") for an employee.
3. Navigate to `Comp Integration` (`/hr/talent/performance/comp-sync`). Run the sync process to push ratings to the salary models.
4. Navigate to `Setup & Config -> Comp Workbench` (`/hr/compensation/workbench`).
5. Open the merit review sheet. Verify that the employee who received the "Exceeds Expectations" rating has a corresponding recommended merit increase % populated according to guidelines.

### E2E-04: Leave Request Approval Flow
**Test Scenario:** An employee submits PTO, the manager approves it, and the employee's accrual balance decrements.

**Test Script:**
1. Set context to an Employee role (or simulate ESS view). Navigate to `Time & Labor (WFM) -> My Time` (`/hr/wfm/me/time`).
2. Submit a leave request (e.g., 8 hours of Vacation). Verify status changes to "Pending".
3. Set context to a Manager role (or view manager tools). Navigate to `WFM: Manager Tools -> Approvals` (`/hr/wfm/team/approvals`).
4. Locate the pending leave request and click "Approve". Verify status updates.
5. Return to Employee ESS view. Navigate to `Leave Balances` (`/hr/wfm/me/balances`).
6. Verify the available balance for "Vacation" has been decremented by 8 hours.

### E2E-05: Learning Enrollment-to-Completion Tracking
**Test Scenario:** An employee enrolls in a compliance course and completes it, automatically updating the centralized compliance tracker.

**Test Script:**
1. Navigate to `Learning & Development -> My Learning` (`/hr/learning/me`). Alternatively, go to `/talent/learning` to bypass the `courses?.map` issue if it occurs.
2. Search the catalog for a compliance course. Click "Enroll".
3. Navigate to `Course Player` (`/hr/learning/play/:id`) by clicking "Launch/Continue".
4. Simulate course completion (click Next to end of module or hit "Mark Complete").
5. Return to `My Learning`. Verify the course moved from "In Progress" to "Completed" with a certificate link available.
6. Navigate to `Learning Admin -> Compliance Renewals` (`/hr/learning/compliance`). Verify the employee's compliance requirement shows as "Met" or the renewal date pushed to next year.
