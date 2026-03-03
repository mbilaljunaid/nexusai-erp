# Deep Parity Audit: CRM - Sales (SFA) & Territory Management

This report provides a granular codebase parity analysis of the Nexus CRM Sales module against Oracle CX Sales.

---

## 1. Database Schema Parity (`crm.ts`)

**Current Implementation:**
Classic Sales Force Automation (SFA) structure: Leads -> Accounts/Contacts -> Opportunities. It includes Opportunity Competitors, Sales Quotas, and a hierarchical Territory Management system with `crm_territory_rules`.

**Oracle Gaps (Required Upgrades):**
*   **Predictive Lead Scoring**: While Nexus has a `score` column on Leads, it lacks the explicit underlying ML feature tracking tables (like `lead_scoring_factors`) that Oracle Adaptive Intelligence uses to build the score.
*   **Account Planning / Whitespace Analysis**: Oracle CX Sales has specialized objects for structured Account Plans (identifying whitespace, buying centers, organizational maps). Nexus only has basic Account attributes.

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Territory Assignment Engine**: A critical backend engine must be built to read the `crm_territory_rules` and automatically cascade Account and Opportunity ownership changes when an address or industry changes. Currently, this would require manual ownership updates.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Opportunity Pipeline Board**: Oracle features a highly interactive Kanban board for moving opportunities through stages. Nexus relies on standard list views.
*   **Mobile Sales Native App / Offline Sync**: True enterprise SFA requires offline capabilities for field reps. Nexus frontend relies on constant PWA connectivity.

---
**Upgrade Priority**: **HIGH**. The schema is fundamentally correct. The Territory Assignment Engine is the most urgent backend requirement to reach enterprise parity.
