# Accounts Payable (AP) Gap Analysis & Parity Roadmap
**Baseline Date**: Jan 10, 2026
**Target**: Oracle Fusion Applications (Cloud ERP) Parity

## 1. Executive Summary
The current AP module is a "Proof of Concept" (Level 1) implementation. It supports basic Supplier creation, Invoice entry, and simple Payments. It lacks the critical "Enterprise" structures required for a real-world ERP: **Supplier Sites** (Multi-org support), **System Options**, **Tolerances**, and **Subledger Accounting (SLA)** integration.

**Critical Risk**: The current schema treats Suppliers as a single entity without "Sites" or "Addresses" that govern payment terms and tax at the location level. **This must be remediated in Chunk 3.**

## 2. Feature Parity Heatmap

| Feature Area | Component | Current Status | Oracle Parity Gap | Severity | Target Chunk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Suppliers** | Supplier Hdr | 🟢 Basic | Missing parent/child hierarchy, tax classifications. | Low | Chunk 3 |
| | **Supplier Sites** | 🔴 **Missing** | **CRITICAL**: No construct for Pay Sites/Purchasing Sites. | **Critical** | **Chunk 3** |
| | Site Assignments | 🔴 Missing | No linkage to Business Units (Data Access). | High | Chunk 3 |
| | Bank Accounts | 🟡 Partial | Basic fields only. No masking, verification, or multi-currency. | High | Chunk 3 |
| **Invoices** | Standard Invoice | 🟡 Partial | Headers/Lines exist. Missing Distributions logic & Tax linkage. | High | Chunk 5 |
| | Prepayments | 🔴 Missing | No mechanism to apply prepayments to invoices. | High | Chunk 5 |
| | Recurring | 🔴 Missing | No template/schedule engine. | Medium | Chunk 5 |
| | Matching | 🔴 Missing | No 2-Way/3-Way matching to PO/Receipts. | High | Chunk 5 |
| | Tolerances | 🔴 Missing | No rules engine for Price/Qty variances. | High | Chunk 4 |
| | Holds | 🟡 Basic | Table exists, but logic is hardcoded/stubbed. | High | Chunk 5 |
| **Payments** | Quick Payment | 🟡 Basic | Can record a payment. No print/format generation. | Medium | Chunk 6 |
| | Pmt Batches | 🔴 Missing | No payment process requests (PPR). | High | Chunk 6 |
| | Void/Reissue | 🔴 Missing | No logic to void and reverse accounting. | High | Chunk 6 |
| **Accounting** | SLA Integration | 🔴 Missing | No Event generation or Journal creation rules. | **Critical** | Chunk 7 |
| **Setup** | System Options | 🔴 Missing | No global configuration (Currency, Terms, Dates). | High | Chunk 8 |

## 3. Data Model Gaps (Schema)

### 3.1 Supplier Architecture Correction (Chunk 3)
*   **Current**: `ap_suppliers` -> Direct use.
*   **Target**: 
    1.  `ap_suppliers` (The generic global entity).
    2.  `ap_supplier_sites` (The functional entity linked to a Business Unit).
        *   Holds: Payment Terms, Tax Code, Bank Account, "Pay Site" flag.
    3.  `ap_supplier_contacts` (Linked to Sites).

### 3.2 Invoice Distributions (Chunk 5)
*   **Current**: `ap_invoice_distributions` exists but is not automatically generated.
*   **Target**: Logic to auto-generate distributions based on:
    *   PO Charge Account (for Matched lines).
    *   Supplier Site Default Expense Account (for Unmatched).
    *   Overlay Rules (Tax, Freight).

## 4. Remediation Plan (Strict Order)

### Phase 1: Architecture & Master Data
1.  **Chunk 2 (UI)**: Upgrade generic lists to Premium "Master-Detail" views.
2.  **Chunk 3 (Suppliers)**: Implement `ap_supplier_sites`. Migrating existing data is trivial (1:1 mapping).
3.  **Chunk 4 (Rules)**: Implement `ap_system_parameters` and Tolerance modules.

### Phase 2: Transaction Lifecycle
4.  **Chunk 5 (Invoicing)**: Build the Validation Engine (Tax, Matching, Holds).
5.  **Chunk 6 (Payments)**: Build the PPR (Payment Process Request) Engine.

### Phase 3: Financials Integration
6.  **Chunk 7 (SLA)**: Create `xla_events` for AP interactions and link to GL.
7.  **Chunk 10 (Closing)**: Build the Period Close sweeper.

## 5. Security & AI Strategy
*   **RBAC**: Enforce `AP_MANAGER` and `AP_CLERK` roles.
*   **Agentic AI**:
    *   **Input**: "Create invoice for Dell for $500".
    *   **Process**: Agent resolves "Dell" to Supplier ID, finds active "Pay Site", defaults terms, creates Invoice.
    *   **Validation**: Agent runs `validateInvoice` and explains specific holds (e.g., "Price variance of $10 vs PO").
