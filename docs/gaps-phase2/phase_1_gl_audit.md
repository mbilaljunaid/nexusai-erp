# Deep Parity Audit: General Ledger (GL)

This report provides a granular, feature-by-feature codebase parity analysis of the Nexus GL module against Oracle Fusion General Ledger.

---

## 1. Database Schema Parity (`shared/schema/gl-config.ts` & others)

**Current Implementation:**
Nexus features standard GL concepts: Journal Sources, Journal Categories, Ledger Controls, Calendars, Ledgers, Currencies, and Auto-Post properties.

**Oracle Gaps (Required Upgrades):**
*   **Subledger Accounting (SLA) Engine ruleset**: Nexus schema mentions SLA (`slaTransferService`) but lacks the deep rules-driven architecture of Oracle SLA. In Oracle, Account Derivation Rules (ADRs), Journal Line Types (JLTs), and Application Accounting Definitions (AADs) determine how subledger events turn into GL journals. Nexus hardcodes or uses simple `FORM_GL_MAPPINGS` logic. *Gap: Missing rules-based dynamic accounting engine.*
*   **Cross-Validation Rules (CVR) Definitions**: While `glLedgerControls` has an `enforce_cvr` flag, there is no schema definition for the complex IF/THEN logic required by Oracle (e.g., IF Company=01 THEN Department MUST BE 100-199). *Gap: Lack of granular CVR rules definition tables.*
*   **Statistical Ledgers and Balances**: Oracle allows dual-posting to Statistical Ledgers (e.g., Headcount data). Nexus journals appear purely financial. *Gap: No explicit tracking of statistical units of measure in journal lines.*

---

## 2. Backend API Parity (`server/routes/glRoutes.ts`)

**Current Implementation:**
Extensive routes spanning standard journals, `/gl/reporting/trial-balance`, `/gl/ledgersets`, period close checklists, and basic allocations.

**Oracle Gaps (Required Upgrades):**
*   **Direct Form Mappings Anti-Pattern**: The `POST /api/gl/post` endpoint uses a `FORM_GL_MAPPINGS` registry to immediately create journal entries. In Oracle, subledgers (like AP/AR) generate Accounting Events which are picked up by the Create Accounting concurrent program to generate SLA entries, which then transfer to GL. *Gap: Subledger events bypass true SLA and post directly to GL via static mapping.*
*   **Step-Down Allocation Complexity**: While `/gl/allocations/run` exists, Oracle features robust MassAllocations and Recurring Journals with complex A*B/C formula functionality spanning parent/child segment values. *Gap: Allocations engine lacks complex formula multi-tier step-down capabilities.*

---

## 3. Frontend UI/UX Parity (`GLDashboard.tsx`)

**Current Implementation:**
A highly modern React dashboard providing metrics (Unposted Journals, Out of Balance, Days in Period Close) and quick links to Journals, Approvals, Revaluation, Consolidation, etc.

**Oracle Gaps (Required Upgrades):**
*   **ADFdi / Web ADI Excel Integration**: Oracle GL heavily relies on Application Development Framework Desktop Integration (ADFdi) for accountants to upload thousands of journal lines via Excel spreadsheets. Nexus currently lacks a native high-performance Excel upload plugin/frontend bridge for manual journals. *Gap: Missing sophisticated Excel-based journal entry tool.*
*   **Multi-Dimensional Balance Inquiry**: Oracle's "Inquire on Detail Balances" allows users to pivot, slice, and dice balances by any Chart of Accounts segment dynamically before drilling down to SLA and then to the AP Invoice. Nexus has a basic `/gl/inquire` endpoint but lacks the multidimensional OLAP-style slicing UI. *Gap: Missing dynamic pivot-style balance inquiry UI.*
