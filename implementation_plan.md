# Implementation Plan - Phase I: Billing Remediation

## Goal
Achieve Tier-1 parity for Billing Master Data and Navigation by exposing the Subscription Workbench and creating a Billing Profile Manager.

## User Review Required
> [!IMPORTANT]
> This phase adds new sidebar items and a new configuration screen.

## Proposed Changes

### Navigation (`client/src/config/navigation.ts`)
- [MODIFY] Add `SubscriptionWorkbench` to "Billing & Invoicing" section.
- [MODIFY] Add `BillingProfileManager` to "Billing & Invoicing" section (or Setup).

### Frontend Components
#### [NEW] `client/src/pages/billing/BillingProfileManager.tsx`
- **Purpose:** Manage customer-specific billing preferences (Payment Terms, Currency, Tax Exemptions).
- **Features:** Grid view of profiles, Edit Dialog.
- **Data Source:** `billingProfiles` table (already exists).
- **Integration:** Link to `arCustomers`.

### Backend
- **No backend changes** required for this phase (Schema `billing_enterprise.ts` already has `billingProfiles`).

## Verification Plan
### Manual Verification
1.  **Sidebar Check:** Verify "Billing Workbench", "Subscription Workbench", and "Billing Profiles" appear in Sidebar.
2.  **Navigation:** Click links and verify pages load.
3.  **Profile Creation:** Create a Billing Profile for a customer, set Terms to "Net 60", and Save.
4.  **Persistence:** Refresh page and verify settings persist.
