# Deep Parity Audit: CRM - CPQ & Order Capture

This report provides a granular codebase parity analysis of the Nexus CPQ module against Oracle CPQ (Configure, Price, Quote).

---

## 1. Database Schema Parity (`crm.ts`)

**Current Implementation:**
Standard Quote-to-Order flow: Products -> Price Books -> Price Book Entries -> Quotes -> Quote Line Items -> Orders. Supports multiple standard and custom price books.

**Oracle Gaps (Required Upgrades):**
*   **Product Configurator (The "C" in CPQ)**: Oracle CPQ uses a massive rules engine to determine if Component A is compatible with Component B. Nexus has flat `products`. It lacks "Product Bundles", "Configuration Rules", and "Exclusion Rules".
*   **Discount & Margin Rules**: No schema for tiered discounting or margin-floor rules.
*   **Subscription Billing Models**: Missing tables for Recurring Billing attributes on Quote Lines (e.g., "Monthly for 36 months").

---

## 2. Backend API Parity

**Oracle Gaps (Required Upgrades):**
*   **Pricing Engine**: While it has basic `unit_price * quantity`, it lacks the logic layer to calculate volumetric discounting, customer-specific contract pricing overrides, and complex taxation via an engine like Avalara.
*   **Approval Routing Hub**: Standard pricing can be auto-approved, but deep discounts need to route to a VP. `crm_approval_requests` exists but lacks the "Approval Rules Matrix" backend logic.

---

## 3. Frontend UI/UX Parity

**Oracle Gaps (Required Upgrades):**
*   **Interactive Quote Configurator**: UI that visually guides a rep through building a complex server rack or software bundle, hiding incompatible options in real-time.

---
**Upgrade Priority**: **CRITICAL**. Without the rules engine and subscription modeling, this is just basic quoting, not true enterprise CPQ.
