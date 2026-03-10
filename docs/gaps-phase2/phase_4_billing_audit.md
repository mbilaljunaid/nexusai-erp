# Deep Parity Audit: Billing & Subscriptions

This report provides a granular codebase parity analysis of the Nexus Billing module against Oracle Subscription Management (SM).

---

## 1. Database Schema Parity (`shared/schema/billing.ts`, `billing_subscription.ts`)

**Current Implementation:**
Handles Plans, Subscriptions, and Payments, primarily designed for SaaS-style recurring flat-rate or basic tiered billing.

**Oracle Gaps (Required Upgrades):**
*   **Complex Pricing Models**: Oracle SM handles extreme complexity including Usage-based rating (with complex tiered meters), Commitment/Minimums, and block-pricing. Nexus `plans` features a generic `limits` JSON payload but lacks a normalized tiered-rating schema.
*   **Amendment History**: Oracle strictly tracks Mid-term upgrades, downgrades, and suspension periods with prorated financial impacts. Nexus only tracks the `currentPeriodStart` and `status`, throwing away mid-cycle point-in-time amendment audit history.

---

## 2. Backend API Parity

**Current Implementation:**
Standard REST endpoints for managing subscriptions and processing standard recurring flat payments.

**Oracle Gaps (Required Upgrades):**
*   **Usage Rating Engine**: Missing a high-throughput background process (similar to Oracle's usage rating engine) to ingest millions of usage events (from `usage_metering.ts`), rate them against the subscription tiers, and append them to the current invoice cycle.
*   **Proration Engine**: Lacks the math engine to precisely calculate the credit/debit amount when a customer upgrades their plan exactly 14 days into a 30-day billing cycle.

---

## 3. Frontend UI/UX Parity

**Current Implementation:**
`BillingWorkbench.tsx`, `BillingRulesManager.tsx` exist.

**Oracle Gaps (Required Upgrades):**
*   **Mid-Term Amendment UI**: No clear wizard for sales reps to walk through a Subscription Amendment (Upgrade/Downgrade/Suspend) that shows a real-time preview of the prorated invoice impact.

---
**Upgrade Priority**: **MEDIUM** (Functional for SaaS, but missing the enterprise Usage-Rating and Proration depth of Oracle).
