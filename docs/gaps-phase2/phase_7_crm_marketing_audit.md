# Deep Parity Audit: CRM - Marketing (Campaigns)

This report provides a granular codebase parity analysis of the Nexus CRM Marketing module against Oracle CX Marketing (Eloqua).

---

## 1. Database Schema Parity (`crm.ts`)

**Current Implementation:**
Foundational Campaign logic: `campaigns` table with expected revenue and budgeted costs, linked to Leads and Contacts via `crm_campaign_members`.

**Oracle Gaps (Required Upgrades):**
*   **Multi-Step Campaign Canvas**: Oracle Eloqua defines campaigns as a visual workflow (Send Email -> Wait 3 Days -> IF Opened -> Send Follow-Up). Nexus stores Campaigns as flat lists of members, lacking a schema for Campaign Nodes and Routes.
*   **Email Tracking / UTM Parameters**: Missing tables to ingest web traffic analytics, link clicks, and email open metrics.

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Mass Email / SMTP Engine**: A high-throughput backend service (like AWS SES integration) to execute the Campaign blasts while handling hard/soft bounces.
*   **Nurture Automation Cron**: A backend worker to evaluate logic (e.g., "Did the member click the link?") and move them to the next Campaign Node.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Drag-and-Drop Campaign Builder**: The visual canvas for routing campaign members based on their behavior.
*   **Email Template Builder**: WYSIWYG editor for marketing collateral.

---
**Upgrade Priority**: **HIGH**. Currently, Nexus Marketing is just a tagging system, not a marketing automation engine.
