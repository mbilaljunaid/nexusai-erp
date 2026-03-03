# Deep Parity Audit: CRM - Incentive Compensation

This report provides a granular codebase parity analysis of the Nexus CRM Incentive Compensation module against Oracle Incentive Compensation (OIC).

---

## 1. Database Schema Parity (`crm.ts`)

**Current Implementation:**
Supports flat-rate or percentage-based Commission Plans, Assignments to Reps, and the final calculated Commission payout amounts triggered against Opportunities.

**Oracle Gaps (Required Upgrades):**
*   **Multi-Tiered Accelerators**: Oracle allows complex tiers (e.g., 5% up to 100% quota, 8% up to 150%, 12% above 150%). Nexus uses a single `rate` and optional `customFormula`.
*   **Clawbacks**: Missing schema to handle commission reversals if an Opportunity/Order is canceled within X days.

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Commission Calculation Engine**: A backend job must calculate the commission as soon as an Opportunity hits "Closed Won", evaluate it against the Quota Tier, and post it to a Payroll/AP interface for payout. Nexus likely requires a robust manual workflow here to interpret the `customFormula`.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Sales Rep Dashboard**: Reps need a clear, gamified UI showing "You are $5k away from reaching the 10% commission accelerator tier."

---
**Upgrade Priority**: **MEDIUM**. Can function for simple flat-rate commissions, but will struggle with complex enterprise sales multi-tier models.
